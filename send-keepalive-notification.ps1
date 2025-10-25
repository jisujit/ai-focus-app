# Send Keepalive Notification Email
# This script sends email notifications about keepalive status

param(
    [string]$Status = "success",  # "success" or "failure"
    [string]$Message = "",
    [string]$LogFile = "keepalive-log.txt"
)

# Email configuration (you'll need to set these up)
$smtpServer = "smtp.gmail.com"  # Change to your email provider
$smtpPort = 587
$smtpUsername = "your-email@gmail.com"  # Change to your email
$smtpPassword = "your-app-password"     # Use app password for Gmail
$fromEmail = "your-email@gmail.com"
$toEmail = "gsujit@gmail.com"  # Your notification email

# Create email subject and body
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$subject = if ($Status -eq "success") { 
    "✅ Supabase Keepalive SUCCESS - $timestamp" 
} else { 
    "❌ Supabase Keepalive FAILURE - $timestamp" 
}

$body = @"
Supabase Project Keepalive Report
================================

Status: $Status
Time: $timestamp
Message: $Message

Project Details:
- Environment: Production
- Supabase URL: https://fvazftacytreklsmmbcr.supabase.co
- Project ID: fvazftacytreklsmmbcr

Recent Log Entries:
$(if (Test-Path $LogFile) { Get-Content $LogFile -Tail 10 } else { "No log file found" })

Next Steps:
$(if ($Status -eq "success") {
    "✅ Project is active and healthy"
    "✅ No action required"
} else {
    "❌ Check Supabase dashboard for project status"
    "❌ Verify API keys and connectivity"
    "❌ Consider manual intervention"
})

---
This is an automated notification from your Supabase Keepalive system.
"@

try {
    # Create email message
    $emailMessage = New-Object System.Net.Mail.MailMessage
    $emailMessage.From = $fromEmail
    $emailMessage.To.Add($toEmail)
    $emailMessage.Subject = $subject
    $emailMessage.Body = $body
    $emailMessage.IsBodyHtml = $false

    # Create SMTP client
    $smtpClient = New-Object System.Net.Mail.SmtpClient($smtpServer, $smtpPort)
    $smtpClient.EnableSsl = $true
    $smtpClient.Credentials = New-Object System.Net.NetworkCredential($smtpUsername, $smtpPassword)

    # Send email
    $smtpClient.Send($emailMessage)
    
    Write-Host "[$timestamp] [OK] Notification email sent successfully" -ForegroundColor Green
    Write-Host "  To: $toEmail" -ForegroundColor Cyan
    Write-Host "  Subject: $subject" -ForegroundColor Cyan
    
    # Log email sent
    $logEntry = "[$timestamp] [EMAIL] Notification sent to $toEmail - Status: $Status"
    Add-Content -Path $LogFile -Value $logEntry
    
} catch {
    Write-Host "[$timestamp] [ERROR] Failed to send notification email: $($_.Exception.Message)" -ForegroundColor Red
    
    # Log email failure
    $logEntry = "[$timestamp] [EMAIL_ERROR] Failed to send notification: $($_.Exception.Message)"
    Add-Content -Path $LogFile -Value $logEntry
}

Write-Host "`n=== Email Notification Complete ===" -ForegroundColor Green
