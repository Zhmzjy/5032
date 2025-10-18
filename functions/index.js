/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions/v2");
const {onCall} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
const {defineSecret} = require("firebase-functions/params");

admin.initializeApp();

const sendgridApiKey = defineSecret("SENDGRID_API_KEY");
const sendgridFromEmail = defineSecret("SENDGRID_FROM_EMAIL");
const sendgridFromName = defineSecret("SENDGRID_FROM_NAME");

const rateLimitMap = new Map();

const checkRateLimit = (userId) => {
  const now = Date.now();
  const userRequests = rateLimitMap.get(userId) || [];

  const recentRequests = userRequests.filter(timestamp => now - timestamp < 60000);

  if (recentRequests.length >= 3) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(userId, recentRequests);

  return true;
};

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.sendEmail = onCall({
  cors: true,
  secrets: [sendgridApiKey, sendgridFromEmail, sendgridFromName]
}, async (request) => {
  try {
    if (!request.auth) {
      throw new Error("Authentication required");
    }

    const {to, subject, message, replyTo} = request.data;
    const userId = request.auth.uid;

    if (!to || !subject || !message) {
      throw new Error("Missing required fields: to, subject, message");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error("Invalid recipient email address");
    }

    if (replyTo && !emailRegex.test(replyTo)) {
      throw new Error("Invalid reply-to email address");
    }

    if (subject.length > 200) {
      throw new Error("Subject exceeds maximum length of 200 characters");
    }

    if (message.length > 5000) {
      throw new Error("Message exceeds maximum length of 5000 characters");
    }

    if (!checkRateLimit(userId)) {
      throw new Error("Rate limit exceeded. Maximum 3 emails per minute");
    }

    sgMail.setApiKey(sendgridApiKey.value());

    const userDoc = await admin.firestore()
      .collection("userData")
      .doc(userId)
      .get();

    const userName = userDoc.exists ?
      (userDoc.data().name || request.auth.token.name || "User") :
      (request.auth.token.name || "User");

    const userEmail = request.auth.token.email || replyTo || "";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3498db; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
          .message-box { background: white; padding: 20px; border-left: 4px solid #3498db; margin: 20px 0; }
          .footer { background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          .meta { color: #666; font-size: 14px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">FitTogether</h2>
          </div>
          <div class="content">
            <div class="meta">
              <strong>From:</strong> ${userName}${userEmail ? ` (${userEmail})` : ""}<br>
              <strong>Date:</strong> ${new Date().toLocaleString()}
            </div>
            <div class="message-box">
              ${message.replace(/\n/g, "<br>")}
            </div>
          </div>
          <div class="footer">
            ${replyTo ? `<p>Click "Reply" to respond directly to ${userEmail || replyTo}</p>` : ""}
            <p>This email was sent via FitTogether</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const plainTextContent = `
FitTogether Message

From: ${userName}${userEmail ? ` (${userEmail})` : ""}
Date: ${new Date().toLocaleString()}

────────────────────────────────

${message}

────────────────────────────────
${replyTo ? `Reply to this email to contact ${userEmail || replyTo}` : ""}

This email was sent via FitTogether
    `;

    const msg = {
      to: to,
      from: {
        email: sendgridFromEmail.value(),
        name: sendgridFromName.value()
      },
      subject: subject,
      text: plainTextContent,
      html: htmlContent
    };

    if (replyTo) {
      msg.replyTo = replyTo;
    }

    await sgMail.send(msg);

    await admin.firestore().collection("emailLogs").add({
      from: userId,
      fromEmail: userEmail,
      fromName: userName,
      to: to,
      subject: subject,
      status: "success",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      messageLength: message.length
    });

    return {
      success: true,
      message: "Email sent successfully"
    };

  } catch (error) {
    console.error("Error sending email:", error);

    if (request.auth) {
      try {
        await admin.firestore().collection("emailLogs").add({
          from: request.auth.uid,
          to: request.data?.to || "unknown",
          subject: request.data?.subject || "unknown",
          status: "failed",
          error: error.message,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (logError) {
        console.error("Error logging failed email:", logError);
      }
    }

    throw new Error(error.message || "Failed to send email");
  }
});
