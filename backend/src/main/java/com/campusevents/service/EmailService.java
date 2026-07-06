package com.campusevents.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * EmailService — all transactional emails for the platform.
 *
 * All send methods are @Async so they never block the HTTP request thread.
 * Uses HTML templates inline (no Thymeleaf dependency needed).
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromEmail;

    public EmailService(org.springframework.beans.factory.ObjectProvider<JavaMailSender> mailSenderProvider,
                        @Value("${spring.mail.username:noreply@eventora.com}") String fromEmail) {
        this.mailSender = mailSenderProvider.getIfAvailable();
        this.fromEmail = fromEmail;
    }

    // ── Base HTML wrapper ─────────────────────────────────────────────────────

    private String wrap(String body) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background:#f4f6fb; margin:0; padding:0; }
                .container { max-width:580px; margin:40px auto; background:#fff;
                             border-radius:12px; overflow:hidden;
                             box-shadow:0 4px 24px rgba(0,0,0,.10); }
                .header { background:linear-gradient(135deg,#6366f1,#8b5cf6);
                          padding:32px 40px; text-align:center; }
                .header h1 { color:#fff; margin:0; font-size:22px; letter-spacing:.5px; }
                .body { padding:32px 40px; color:#374151; line-height:1.7; }
                .body h2 { color:#1f2937; margin-top:0; }
                .highlight { background:#f3f4f6; border-left:4px solid #6366f1;
                             padding:12px 18px; border-radius:6px; margin:18px 0; }
                .otp-box { text-align:center; background:#f0f4ff; border:2px dashed #6366f1;
                           border-radius:12px; padding:20px; margin:24px 0; }
                .otp-code { font-size:42px; font-weight:700; color:#6366f1;
                            letter-spacing:12px; }
                .footer { background:#f9fafb; text-align:center; padding:18px 40px;
                          font-size:12px; color:#9ca3af; border-top:1px solid #e5e7eb; }
                .btn { display:inline-block; background:#6366f1; color:#fff;
                       padding:12px 28px; border-radius:8px; text-decoration:none;
                       font-weight:600; margin-top:12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header"><h1>🎓 Eventora — Event Management</h1></div>
                <div class="body">
                  """ + body + """
                </div>
                <div class="footer">
                  © 2025 Eventora · Campus Event Management Platform<br>
                  This is an automated message — please do not reply.
                </div>
              </div>
            </body>
            </html>
            """;
    }

    // ── Core send helper ──────────────────────────────────────────────────────

    private void send(String to, String subject, String html) {
        if (mailSender == null) {
            log.warn("[EmailService] JavaMailSender not configured — skipping email to {}", to);
            return;
        }
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
            log.info("[EmailService] Sent '{}' to {}", subject, to);
        } catch (MessagingException e) {
            log.error("[EmailService] Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    // ── PUBLIC API ────────────────────────────────────────────────────────────

    /**
     * Feature 1: OTP email for email verification during signup.
     */
    @Async
    public void sendOtpEmail(String to, String name, String otp) {
        String body = """
            <h2>Hello, %s!</h2>
            <p>You requested to create an account on <strong>Eventora</strong>.
               Please use the OTP below to verify your email address.</p>
            <div class="otp-box">
              <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">Your One-Time Password</p>
              <div class="otp-code">%s</div>
              <p style="margin:8px 0 0;color:#ef4444;font-size:13px;">⏱ Expires in <strong>10 minutes</strong></p>
            </div>
            <p style="color:#6b7280;font-size:13px;">
              If you did not request this, please ignore this email.
            </p>
            """.formatted(name, otp);
        send(to, "Your Eventora Verification Code — " + otp, wrap(body));
    }

    /**
     * Feature 2a: Triggered when coordinator/admin approves a student registration.
     */
    @Async
    public void sendRegistrationApprovedEmail(String to, String studentName, String eventName) {
        String body = """
            <h2>Hello %s,</h2>
            <div class="highlight">
              🎉 Your registration for <strong>%s</strong> has been <strong>approved</strong>!
            </div>
            <p>We're excited to have you join us. Please check the event details
               and make a note of the venue and time.</p>
            <p>Your QR code for attendance is available on <strong>My Registrations</strong> page.</p>
            <br>
            <p>Regards,<br><strong>Event Management Team</strong></p>
            """.formatted(studentName, eventName);
        send(to, "Registration Approved — " + eventName, wrap(body));
    }

    /**
     * Feature 2b: Triggered when registration is rejected.
     */
    @Async
    public void sendRegistrationRejectedEmail(String to, String studentName, String eventName) {
        String body = """
            <h2>Hello %s,</h2>
            <div class="highlight" style="border-left-color:#ef4444;">
              ❌ Your registration for <strong>%s</strong> has been <strong>rejected</strong>.
            </div>
            <p>Unfortunately we could not accommodate your registration for this event.
               Please browse other available events on the platform.</p>
            <br>
            <p>Regards,<br><strong>Event Management Team</strong></p>
            """.formatted(studentName, eventName);
        send(to, "Registration Rejected — " + eventName, wrap(body));
    }

    /**
     * Feature 2c: Triggered when a certificate is issued for a student.
     */
    @Async
    public void sendCertificateIssuedEmail(String to, String studentName, String eventName) {
        String body = """
            <h2>Hello %s,</h2>
            <div class="highlight" style="border-left-color:#10b981;">
              🏆 Your certificate for <strong>%s</strong> is now available!
            </div>
            <p>Congratulations on completing the event. You can download your certificate
               from the <strong>Certificates</strong> section on your dashboard.</p>
            <br>
            <p>Regards,<br><strong>Event Management Team</strong></p>
            """.formatted(studentName, eventName);
        send(to, "Certificate Ready — " + eventName, wrap(body));
    }

    /**
     * Feature 2d: Triggered when admin approves a coordinator's event.
     */
    @Async
    public void sendEventApprovedEmail(String to, String coordinatorName, String eventName) {
        String body = """
            <h2>Hello %s,</h2>
            <div class="highlight" style="border-left-color:#10b981;">
              ✅ Your event <strong>"%s"</strong> has been approved by the admin!
            </div>
            <p>Students can now register for your event. You can manage registrations,
               attendance, and certificates from your coordinator dashboard.</p>
            <br>
            <p>Regards,<br><strong>Admin Team</strong></p>
            """.formatted(coordinatorName, eventName);
        send(to, "Event Approved — " + eventName, wrap(body));
    }

    /**
     * Bonus: Attendance marked notification.
     */
    @Async
    public void sendAttendanceMarkedEmail(String to, String studentName, String eventName) {
        String body = """
            <h2>Hello %s,</h2>
            <p>Your attendance for <strong>%s</strong> has been recorded as
               <strong style="color:#10b981;">PRESENT</strong>.</p>
            <p>You are now eligible to receive a certificate for this event
               once it is issued by the coordinator.</p>
            <br>
            <p>Regards,<br><strong>Event Management Team</strong></p>
            """.formatted(studentName, eventName);
        send(to, "Attendance Confirmed — " + eventName, wrap(body));
    }
}
