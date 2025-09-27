import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== TEST INSERT FUNCTION STARTED ===");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Test 1: Try to get a session UUID first
    console.log("Test 1: Getting session UUID...");
    const { data: sessions, error: sessionsError } = await supabaseClient
      .from("sessions")
      .select("id, session_id")
      .limit(1);

    console.log("Sessions query result:", { sessions, sessionsError });
    
    if (sessionsError || !sessions || sessions.length === 0) {
      throw new Error(`No sessions found: ${sessionsError?.message || 'No sessions in database'}`);
    }

    const sessionUuid = sessions[0].id;
    console.log("Using session UUID:", sessionUuid);

    // Test 2: Try to insert a minimal record
    console.log("Test 2: Inserting minimal record...");
    const { data, error } = await supabaseClient
      .from("training_registrations")
      .insert({
        session_id: sessionUuid,
        first_name: "Test",
        last_name: "User",
        email: "test@example.com",
        training_title: "Test Training",
        status: 'confirmed',
        payment_status: 'paid'
      })
      .select()
      .single();

    console.log("Insert result:", { data, error });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Test insert successful",
        data: data
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Test insert error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Test insert failed",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
