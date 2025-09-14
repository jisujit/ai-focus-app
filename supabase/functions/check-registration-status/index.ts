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
    console.log("Registration status check started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { email } = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }

    console.log("Checking registration status for email:", email);

    // Get registrations for the email
    const { data: registrations, error: regError } = await supabaseClient
      .from("training_registrations")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false });

    if (regError) {
      console.error("Error fetching registrations:", regError);
      throw regError;
    }

    // Get contact submissions for the email
    const { data: contacts, error: contactError } = await supabaseClient
      .from("contact_submissions")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false });

    if (contactError) {
      console.error("Error fetching contact submissions:", contactError);
      throw contactError;
    }

    console.log(`Found ${registrations?.length || 0} registrations and ${contacts?.length || 0} contact submissions`);

    return new Response(
      JSON.stringify({ 
        success: true,
        registrations: registrations || [],
        contactSubmissions: contacts || []
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error checking registration status:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to check registration status" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});