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
    console.log("=== CONFIRM PAYMENT EDGE FUNCTION STARTED v2 ===");
    console.log("Request method:", req.method);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    console.log("Confirming payment and completing registration...");

    // Check environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    console.log("Environment variables check:");
    console.log("- SUPABASE_URL:", supabaseUrl ? "SET" : "MISSING");
    console.log("- SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "SET" : "MISSING");
    console.log("- STRIPE_SECRET_KEY:", stripeSecretKey ? "SET" : "MISSING");
    
    if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey) {
      throw new Error("Missing required environment variables");
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { persistSession: false } }
    );

    let paymentIntentId: string;
    let registrationData: any;
    
    try {
      const requestBody = await req.json();
      console.log("Raw request body:", JSON.stringify(requestBody, null, 2));
      
      paymentIntentId = requestBody.paymentIntentId;
      registrationData = requestBody.registrationData;
      
      console.log("Received payment intent ID:", paymentIntentId);
      console.log("Received registration data:", JSON.stringify(registrationData, null, 2));
    } catch (jsonError) {
      console.error("Error parsing request JSON:", jsonError);
      throw new Error(`Invalid request format: ${jsonError.message}`);
    }

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

    // Check if registrationData.sessionId is a UUID or session_id
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(registrationData.sessionId);
    console.log("Session ID type check:", { sessionId: registrationData.sessionId, isUuid });

    let sessionUuid: string;

    if (isUuid) {
      // If it's already a UUID, use it directly
      console.log("Session ID is already a UUID, using directly");
      sessionUuid = registrationData.sessionId;
    } else {
      // If it's a session_id, look up the UUID
      console.log("Looking up session UUID for session_id:", registrationData.sessionId);
      
      try {
        const { data: sessionData, error: sessionError } = await supabaseClient
          .from("sessions")
          .select("id")
          .eq("session_id", registrationData.sessionId)
          .single();

        console.log("Session lookup result:", { sessionData, sessionError });

        if (sessionError || !sessionData) {
          console.error("Session lookup error:", sessionError);
          
          // Try to list all sessions to debug
          const { data: allSessions, error: allSessionsError } = await supabaseClient
            .from("sessions")
            .select("id, session_id, status");
          
          console.log("All sessions in database:", { allSessions, allSessionsError });
          
          throw new Error(`Session not found: ${registrationData.sessionId}. Available sessions: ${allSessions?.map(s => s.session_id).join(', ') || 'none'}`);
        }

        sessionUuid = sessionData.id;
        console.log("Found session UUID:", sessionUuid);
      } catch (lookupError) {
        console.error("Session lookup failed:", lookupError);
        throw lookupError;
      }
    }

    // Insert registration into database with payment details
    console.log("Attempting to insert registration with data:", {
      session_id: sessionUuid,
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
    });

    // Test the session UUID format
    console.log("Session UUID details:", {
      value: sessionUuid,
      type: typeof sessionUuid,
      length: sessionUuid.length,
      isUuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionUuid)
    });

    // Try using direct SQL query with explicit UUID casting
    console.log("Using direct SQL query with UUID casting...");
    const { data, error } = await supabaseClient
      .from("training_registrations")
      .insert({
        session_id: sessionUuid,
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

    console.log("Database insert result:", { data, error });
    if (error) {
      console.error("Database error:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    console.log("Registration completed successfully:", data.id);

    // Send confirmation email (redirect to gsujit@gmail.com in test mode)
    const isTestMode = Deno.env.get("TEST_MODE") === "true";
    const targetEmail = isTestMode ? "gsujit@gmail.com" : registrationData.email;
    
    try {
      const emailResponse = await supabaseClient.functions.invoke('send-registration-confirmation', {
        body: {
          firstName: registrationData.firstName,
          lastName: registrationData.lastName,
          email: targetEmail,
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
        console.log(`Registration confirmation email sent successfully to ${targetEmail}${isTestMode ? ' (test mode)' : ''}`);
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
