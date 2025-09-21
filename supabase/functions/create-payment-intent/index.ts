import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentIntentRequest {
  amount: number; // Amount in cents
  currency: string;
  customerEmail: string;
  customerName: string;
  trainingTitle: string;
  sessionId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Creating payment intent...");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { amount, currency, customerEmail, customerName, trainingTitle, sessionId }: PaymentIntentRequest = await req.json();

    // Validate required fields
    if (!amount || !currency || !customerEmail || !customerName) {
      throw new Error("Missing required payment fields");
    }

    // Create payment intent via Stripe API
    const formData = new URLSearchParams();
    formData.append('amount', amount.toString());
    formData.append('currency', currency);
    formData.append('automatic_payment_methods[enabled]', 'true');
    
    // Add metadata as individual key-value pairs
    formData.append('metadata[customer_email]', customerEmail);
    formData.append('metadata[customer_name]', customerName);
    formData.append('metadata[training_title]', trainingTitle);
    formData.append('metadata[session_id]', sessionId);

    const stripeResponse = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.json();
      console.error("Stripe error:", errorData);
      throw new Error(`Stripe API error: ${errorData.error?.message || "Unknown error"}`);
    }

    const paymentIntent = await stripeResponse.json();
    console.log("Payment intent created:", paymentIntent.id);

    return new Response(
      JSON.stringify({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to create payment intent",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
