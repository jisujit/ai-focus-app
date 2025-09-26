import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  phone?: string;
  trainingInterests?: string[];
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Contact form submission started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const contactData: ContactFormData = await req.json();
    console.log("Contact data received:", contactData);

    // Insert contact submission into database
    const { data, error } = await supabaseClient
      .from("contact_submissions")
      .insert({
        first_name: contactData.firstName,
        last_name: contactData.lastName,
        email: contactData.email,
        company: contactData.company,
        phone: contactData.phone,
        training_interests: contactData.trainingInterests,
        message: contactData.message,
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    console.log("Contact submission saved successfully:", data);

    // Send confirmation email (redirect to gsujit@gmail.com in test mode)
    const isTestMode = Deno.env.get("TEST_MODE") === "true";
    const targetEmail = isTestMode ? "gsujit@gmail.com" : contactData.email;
    
    try {
      const emailResponse = await supabaseClient.functions.invoke('send-contact-confirmation', {
        body: {
          name: `${contactData.firstName} ${contactData.lastName}`,
          email: targetEmail,
          company: contactData.company,
          message: contactData.message,
          selectedInterests: contactData.trainingInterests || []
        }
      });
      
      if (emailResponse.error) {
        console.error("Failed to send confirmation email:", emailResponse.error);
      } else {
        console.log(`Confirmation email sent successfully to ${targetEmail}${isTestMode ? ' (test mode)' : ''}`);
      }
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        submissionId: data.id,
        message: "Message sent successfully! We'll get back to you within 24 hours. A confirmation email has been sent."
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in contact form submission:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send message" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});