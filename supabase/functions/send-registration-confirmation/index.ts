import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegistrationEmailRequest {
  firstName: string;
  lastName: string;
  email: string;
  trainingTitle: string;
  company?: string;
  phone?: string;
  registrationId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Registration confirmation email function started");

    const {
      firstName,
      lastName,
      email,
      trainingTitle,
      company,
      phone,
      registrationId
    }: RegistrationEmailRequest = await req.json();

    console.log("Sending registration confirmation email to:", email);

    const emailResponse = await resend.emails.send({
      from: "AI Focus <noreply@mail.ai-focus.org>",
      to: [email],
      subject: `Registration Confirmed: ${trainingTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Registration Confirmed!</h1>
          </div>

          <h2 style="color: #333; margin-bottom: 20px;">Welcome to AI Focus, ${firstName}!</h2>

          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Congratulations! Your registration for <strong>${trainingTitle}</strong> has been successfully confirmed.
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Registration Details:</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Registration ID:</strong> #${registrationId}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Training:</strong> ${trainingTitle}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Participant:</strong> ${firstName} ${lastName}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${email}</p>
            ${company ? `<p style="margin: 5px 0; color: #666;"><strong>Company:</strong> ${company}</p>` : ''}
            ${phone ? `<p style="margin: 5px 0; color: #666;"><strong>Phone:</strong> ${phone}</p>` : ''}
            <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">Confirmed</span></p>
          </div>

          <div style="background: #e7f3ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
            <h4 style="color: #007bff; margin-top: 0;">What's Next?</h4>
            <ul style="color: #666; margin: 0; padding-left: 20px;">
              <li>Session details and preparation materials will be sent 48 hours before the session</li>
              <li>For online sessions, a calendar invite with meeting details will be sent separately</li>
              <li>Our support team will contact you if any additional information is needed</li>
            </ul>
          </div>

          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <h4 style="color: #856404; margin-top: 0;">Important Reminders:</h4>
            <ul style="color: #666; margin: 0; padding-left: 20px;">
              <li>For online sessions: Please ensure you have a stable internet connection</li>
              <li>Check your system requirements in the preparation materials when received</li>
              <li>All sales are final. No cancellations or refunds are available</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:support@ai-focus.org"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 5px;">
              Contact Support
            </a>
            <a href="https://ai-focus.org"
               style="background: transparent; color: #667eea; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; border: 2px solid #667eea; margin: 5px;">
              Visit Website
            </a>
          </div>

          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
            <p>We're excited to have you join us!<br><strong>The AI Focus Team</strong></p>
            <p style="margin-top: 15px;">
              📧 support@ai-focus.org | 📞 (904) 413-1317<br>
              🏢 Jacksonville, FL 32256
            </p>
            <p style="margin-top: 15px; font-size: 12px; color: #ccc;">
              If you have any questions about your registration, please don't hesitate to contact us.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Registration confirmation email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Registration confirmation email sent successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending registration confirmation email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to send registration confirmation email"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});