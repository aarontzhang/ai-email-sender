import nodemailer from 'nodemailer';

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Generate email content with hardcoded template
function generateEmailContent(linkUrl) {
    const subject = 'Action Required: Update Your Delivery Address';

    const body = `
        <p>Dear Valued Customer,</p>

        <p>We are writing to inform you that we have a package scheduled for delivery to your address. However, our shipping department has identified that your current address information in our system appears to be incomplete or outdated, which is preventing us from completing the delivery.</p>

        <p>To ensure your package reaches you without delay, we need you to verify and update your address information in our system. This quick verification process will help us complete your delivery promptly and securely.</p>

        <p>Please click the link below to update your address information within the next 48 hours to avoid any delivery delays:</p>

        <p><a href="${linkUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 4px;">Update My Address Information</a></p>

        <p>Thank you for your prompt attention to this matter. If you have any questions, please don't hesitate to contact our customer service team.</p>

        <p>Best regards,<br>
        Shipping & Logistics Department</p>
    `;

    return { subject, body };
}

// Send email using Nodemailer
async function sendEmail(recipientEmail, subject, htmlBody) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    const mailOptions = {
        from: `"${process.env.SENDER_NAME || 'AI Email Sender'}" <${process.env.GMAIL_USER}>`,
        to: recipientEmail,
        subject: subject,
        html: htmlBody,
        text: htmlBody.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    await transporter.sendMail(mailOptions);
}

// Main handler for Vercel serverless function
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        // Validate email
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ error: 'Valid email address is required' });
        }

        // Check for required environment variables
        const requiredEnvVars = ['GMAIL_USER', 'GMAIL_APP_PASSWORD', 'LINK_URL'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
            console.error('Missing environment variables:', missingVars);
            return res.status(500).json({
                error: 'Server configuration error',
                missing: missingVars
            });
        }

        // Log that we have the vars (without exposing values)
        console.log('Environment check: All required vars present');

        // Generate email content
        const { subject, body } = generateEmailContent(process.env.LINK_URL);

        // Send email
        await sendEmail(email, subject, body);

        return res.status(200).json({
            message: 'Email sent successfully!',
            recipient: email
        });

    } catch (error) {
        console.error('Error sending email:', error);
        console.error('Error stack:', error.stack);
        console.error('Error message:', error.message);

        // Handle specific error types
        if (error.message?.includes('Invalid login') || error.message?.includes('Invalid credentials')) {
            return res.status(500).json({ error: 'Email authentication failed: Invalid Gmail credentials' });
        }

        if (error.code === 'EAUTH') {
            return res.status(500).json({ error: 'Gmail authentication failed: Check GMAIL_USER and GMAIL_APP_PASSWORD' });
        }

        // Return more detailed error in development
        return res.status(500).json({
            error: 'Failed to send email. Please try again later.',
            details: error.message
        });
    }
}
