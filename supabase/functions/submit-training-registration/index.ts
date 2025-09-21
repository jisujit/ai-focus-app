import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrainingRegistrationData {
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
  // Payment fields
  paymentIntentId?: string;
  stripeCustomerId?: string;
  paymentAmount?: number;
  paymentCurrency?: string;
  paymentMethodId?: string;
  paymentReceiptUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Training registration submission started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const registrationData: TrainingRegistrationData = await req.json();
    console.log("Registration data received:", registrationData);

    // Insert registration into database
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
        status: registrationData.paymentIntentId ? 'confirmed' : 'pending',
        payment_status: registrationData.paymentIntentId ? 'paid' : 'pending',
        stripe_payment_intent_id: registrationData.paymentIntentId,
        stripe_customer_id: registrationData.stripeCustomerId,
        payment_amount: registrationData.paymentAmount,
        payment_currency: registrationData.paymentCurrency,
        payment_method_id: registrationData.paymentMethodId,
        payment_receipt_url: registrationData.paymentReceiptUrl,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    console.log("Registration saved successfully:", data);

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
          registrationId: data.id
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
        message: "Registration submitted successfully! A confirmation email has been sent to your inbox."
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in training registration:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to submit registration" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});