import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmPaymentRequest {
  paymentIntentId: string;
  registrationData: {
    sessionId: string;
    trainingTitle: string;
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    phone?: string;
    jobTitle?: string;
    experienceLevel?: string;
    expectations?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Confirming payment and completing registration...");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { paymentIntentId, registrationData }: ConfirmPaymentRequest = await req.json();

    // Verify payment intent with Stripe
    const stripeResponse = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
      },
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.json();
      console.error("Stripe verification error:", errorData);
      throw new Error(`Failed to verify payment: ${errorData.error?.message || "Unknown error"}`);
    }

    const paymentIntent = await stripeResponse.json();
    console.log("Payment intent verified:", paymentIntent.id, "Status:", paymentIntent.status);

    // Check if payment was successful
    if (paymentIntent.status !== "succeeded") {
      throw new Error(`Payment not completed. Status: ${paymentIntent.status}`);
    }

    // Create customer in Stripe if not exists
    let customerId = paymentIntent.customer;
    if (!customerId) {
      const customerResponse = await fetch("https://api.stripe.com/v1/customers", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: registrationData.email,
          name: `${registrationData.firstName} ${registrationData.lastName}`,
          'metadata[training_customer]': "true",
        }),
      });

      if (customerResponse.ok) {
        const customer = await customerResponse.json();
        customerId = customer.id;
        console.log("Customer created:", customerId);
      }
    }

    // Insert registration into database with payment details
    const { data, error } = await supabaseClient
      .from("training_registrations")
      .insert({
        session_id: registrationData.sessionId,
        training_title: registrationData.trainingTitle,
        first_name: registrationData.firstName,
        last_name: registrationData.lastName,
        email: registrationData.email,
        company: registrationData.company,
        phone: registrationData.phone,
        job_title: registrationData.jobTitle,
        experience_level: registrationData.experienceLevel,
        expectations: registrationData.expectations,
        status: 'confirmed',
        payment_status: 'paid',
        stripe_payment_intent_id: paymentIntentId,
        stripe_customer_id: customerId,
        payment_amount: paymentIntent.amount,
        payment_currency: paymentIntent.currency,
        payment_receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    console.log("Registration completed successfully:", data.id);

    // Send confirmation email
    try {
      const emailResponse = await supabaseClient.functions.invoke('send-registration-confirmation', {
        body: {
          firstName: registrationData.firstName,
          lastName: registrationData.lastName,
          email: registrationData.email,
          trainingTitle: registrationData.trainingTitle,
          company: registrationData.company,
          phone: registrationData.phone,
          registrationId: data.id,
          paymentAmount: paymentIntent.amount / 100, // Convert from cents
          paymentCurrency: paymentIntent.currency,
        }
      });
      
      if (emailResponse.error) {
        console.error("Failed to send confirmation email:", emailResponse.error);
      } else {
        console.log("Confirmation email sent successfully");
      }
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        registrationId: data.id,
        message: "Registration completed successfully! Payment confirmed and confirmation email sent.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error confirming payment:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to confirm payment and complete registration",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
