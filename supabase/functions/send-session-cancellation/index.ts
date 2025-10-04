import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancellationEmailRequest {
  sessionId: string;
  sessionTitle: string;
  sessionDate: string;
  sessionTime: string;
  registrations: Array<{
    firstName: string;
    lastName: string;
    email: string;
    registrationId: string;
    paymentAmount: number;
    stripePaymentIntentId?: string;
  }>;
  cancellationReason: string;
  cancellationMessage?: string;
  alternativeSessions?: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Session cancellation email function started");

    const {
      sessionId,
      sessionTitle,
      sessionDate,
      sessionTime,
      registrations,
      cancellationReason,
      cancellationMessage,
      alternativeSessions = []
    }: CancellationEmailRequest = await req.json();

    console.log(`Sending cancellation emails for session ${sessionId} to ${registrations.length} registrations`);

    // Send emails to all registered participants
    const emailPromises = registrations.map(async (registration) => {
      const emailResponse = await resend.emails.send({
        from: "AI Focus <noreply@mail.ai-focus.org>",
        to: [registration.email],
        subject: `Training Session Cancelled: ${sessionTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Session Cancelled</h1>
            </div>

            <h2 style="color: #333; margin-bottom: 20px;">Dear ${registration.firstName},</h2>

            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              We regret to inform you that the training session you registered for has been cancelled.
            </p>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Cancelled Session Details:</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Training:</strong> ${sessionTitle}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${new Date(sessionDate).toLocaleDateString()}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Time:</strong> ${sessionTime}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Registration ID:</strong> #${registration.registrationId}</p>
            </div>

            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
              <h4 style="color: #856404; margin-top: 0;">Cancellation Reason:</h4>
              <p style="color: #666; margin: 0;">${cancellationReason}</p>
              ${cancellationMessage ? `<p style="color: #666; margin: 10px 0 0 0;"><strong>Additional Details:</strong> ${cancellationMessage}</p>` : ''}
            </div>

            <div style="background: #e7f3ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
              <h4 style="color: #007bff; margin-top: 0;">What Happens Next?</h4>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li><strong>Automatic Refund:</strong> Your payment of $${(registration.paymentAmount / 100).toFixed(2)} will be automatically refunded to your original payment method within 5-7 business days</li>
                <li><strong>No Action Required:</strong> The refund will be processed automatically - you don't need to do anything</li>
                <li><strong>Alternative Sessions:</strong> We'd love to have you join one of our upcoming sessions (see below)</li>
              </ul>
            </div>

            ${alternativeSessions.length > 0 ? `
              <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">🎯 Alternative Sessions Available</h3>
                <p style="color: #666; margin: 0 0 15px 0; line-height: 1.5;">
                  We have other sessions of the same training available. We'd be honored to have you join us!
                </p>
                ${alternativeSessions.map(session => `
                  <div style="border: 1px solid #dee2e6; border-radius: 6px; padding: 15px; margin: 10px 0; background: white;">
                    <h4 style="margin: 0 0 8px 0; color: #333;">${session.title}</h4>
                    <p style="margin: 0; color: #666; font-size: 14px;">
                      📅 ${new Date(session.date).toLocaleDateString()} at ${session.time}
                    </p>
                  </div>
                `).join('')}
                <div style="text-align: center; margin: 15px 0;">
                  <a href="https://ai-focus.org/services"
                     style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                    View All Available Sessions
                  </a>
                </div>
              </div>
            ` : ''}

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
              <p>We apologize for any inconvenience and thank you for your understanding.<br><strong>The AI Focus Team</strong></p>
              <p style="margin-top: 15px;">
                📧 support@ai-focus.org | 📞 (904) 413-1317<br>
                🏢 Jacksonville, FL 32256
              </p>
            </div>
          </div>
        `,
      });

      return emailResponse;
    });

    const emailResults = await Promise.all(emailPromises);
    console.log("Cancellation emails sent successfully:", emailResults.length);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cancellation emails sent to ${registrations.length} participants`,
        emailsSent: emailResults.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending session cancellation emails:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to send cancellation emails"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
