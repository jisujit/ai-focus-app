import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  company?: string;
  message: string;
  selectedInterests: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Contact confirmation email function started");
    
    const { name, email, company, message, selectedInterests }: ContactEmailRequest = await req.json();
    
    console.log("Sending confirmation email to:", email);

    const interestsText = selectedInterests && selectedInterests.length > 0 
      ? selectedInterests.join(", ") 
      : "General inquiry";

    const emailResponse = await resend.emails.send({
      from: "AI Training Hub <onboarding@resend.dev>",
      to: [email],
      subject: "Thank you for contacting AI Training Hub!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AI Training Hub</h1>
          </div>
          
          <h2 style="color: #333; margin-bottom: 20px;">Thank you for reaching out, ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We have received your message and appreciate your interest in our AI training services.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Inquiry Details:</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${email}</p>
            ${company ? `<p style="margin: 5px 0; color: #666;"><strong>Company:</strong> ${company}</p>` : ''}
            <p style="margin: 5px 0; color: #666;"><strong>Interests:</strong> ${interestsText}</p>
            <p style="margin: 15px 0 5px 0; color: #666;"><strong>Message:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 5px; color: #333; font-style: italic;">"${message}"</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Our team will review your inquiry and get back to you within 24 hours. In the meantime, feel free to explore our training programs and resources.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://fvazftacytreklsmmbcr.supabase.co" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              Explore Our Training Programs
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
            <p>Best regards,<br><strong>The AI Training Hub Team</strong></p>
            <p style="margin-top: 15px;">
              📧 support@aitraininghub.com | 📞 (555) 123-4567<br>
              🏢 123 Innovation Drive, Tech City, TC 12345
            </p>
          </div>
        </div>
      `,
    });

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Confirmation email sent successfully" 
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send confirmation email" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});