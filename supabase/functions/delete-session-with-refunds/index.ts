import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import Stripe from "npm:stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteSessionRequest {
  sessionId: string;
  cancellationReason: string;
  cancellationMessage?: string;
  deletedBy: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Session deletion with refunds function started");

    const {
      sessionId,
      cancellationReason,
      cancellationMessage,
      deletedBy
    }: DeleteSessionRequest = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("Missing Stripe configuration");
    }
    const stripe = new Stripe(stripeSecretKey);

    console.log(`Processing deletion for session: ${sessionId}`);

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select(`
        *,
        services!inner(title, status)
      `)
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    console.log("Session found:", session.title);

    // Get all paid registrations for this session
    const { data: registrations, error: registrationsError } = await supabase
      .from("training_registrations")
      .select("*")
      .eq("session_id", sessionId)
      .eq("payment_status", "paid");

    if (registrationsError) {
      throw new Error(`Failed to fetch registrations: ${registrationsError.message}`);
    }

    console.log(`Found ${registrations.length} paid registrations to process`);

    // Process refunds and collect registration details for emails
    const refundResults = [];
    const emailData = [];

    for (const registration of registrations) {
      try {
        console.log(`Processing refund for registration: ${registration.id}`);
        
        // Process Stripe refund
        if (registration.stripe_payment_intent_id) {
          const refund = await stripe.refunds.create({
            payment_intent: registration.stripe_payment_intent_id,
            reason: "requested_by_customer",
            metadata: {
              session_cancellation: "true",
              session_id: sessionId,
              registration_id: registration.id
            }
          });

          console.log(`Refund created: ${refund.id} for amount: ${refund.amount}`);

          // Update registration with refund info
          await supabase
            .from("training_registrations")
            .update({
              payment_status: "refunded",
              refund_amount: registration.payment_amount,
              refund_processed_at: new Date().toISOString(),
              stripe_refund_id: refund.id
            })
            .eq("id", registration.id);

          refundResults.push({
            registrationId: registration.id,
            refundId: refund.id,
            amount: refund.amount,
            status: "success"
          });
        } else {
          console.log(`No Stripe payment intent found for registration: ${registration.id}`);
          refundResults.push({
            registrationId: registration.id,
            refundId: null,
            amount: 0,
            status: "no_payment_intent"
          });
        }

        // Collect data for cancellation emails
        emailData.push({
          firstName: registration.first_name,
          lastName: registration.last_name,
          email: registration.email,
          registrationId: registration.id,
          paymentAmount: registration.payment_amount || 0,
          stripePaymentIntentId: registration.stripe_payment_intent_id
        });

      } catch (refundError) {
        console.error(`Failed to process refund for registration ${registration.id}:`, refundError);
        refundResults.push({
          registrationId: registration.id,
          refundId: null,
          amount: 0,
          status: "failed",
          error: refundError.message
        });
      }
    }

    // Mark session as deleted
    const { error: deleteError } = await supabase
      .from("sessions")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deletion_reason: cancellationReason,
        deleted_by: deletedBy,
        status: "cancelled"
      })
      .eq("id", sessionId);

    if (deleteError) {
      throw new Error(`Failed to mark session as deleted: ${deleteError.message}`);
    }

    // Record cancellation in database
    const { error: cancellationError } = await supabase
      .from("session_cancellations")
      .insert({
        session_id: sessionId,
        cancellation_reason: cancellationReason,
        cancellation_message: cancellationMessage,
        refund_processed: true,
        created_by: deletedBy
      });

    if (cancellationError) {
      console.error("Failed to record cancellation:", cancellationError);
    }

    // Get alternative sessions for the same service
    const { data: alternativeSessions } = await supabase
      .from("sessions")
      .select("id, session_id, date, time, services!inner(title)")
      .eq("service_id", session.service_id)
      .eq("is_deleted", false)
      .eq("status", "active")
      .gte("date", new Date().toISOString())
      .order("date", { ascending: true })
      .limit(3);

    // Send cancellation emails
    if (emailData.length > 0) {
      try {
        const { data: emailResponse, error: emailError } = await supabase.functions.invoke('send-session-cancellation', {
          body: {
            sessionId,
            sessionTitle: session.services.title,
            sessionDate: session.date,
            sessionTime: session.time,
            registrations: emailData,
            cancellationReason,
            cancellationMessage,
            alternativeSessions: alternativeSessions?.map(s => ({
              id: s.id,
              title: s.services.title,
              date: s.date,
              time: s.time
            })) || []
          }
        });

        if (emailError) {
          console.error("Failed to send cancellation emails:", emailError);
        } else {
          console.log("Cancellation emails sent successfully");
        }
      } catch (emailError) {
        console.error("Error sending cancellation emails:", emailError);
      }
    }

    console.log("Session deletion completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: `Session deleted successfully. Processed ${refundResults.length} refunds.`,
        refunds: refundResults,
        emailsSent: emailData.length,
        alternativeSessions: alternativeSessions?.length || 0
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting session:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to delete session"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
