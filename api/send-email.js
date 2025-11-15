import nodemailer from 'nodemailer';

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Generate email content with hardcoded template
function generateEmailContent(linkUrl) {
    const subject = 'Security Awareness Training - Phishing Test';

    const body = `
        <p>Hello,</p>

        <p><strong>This is a simulated phishing test</strong> designed to help you learn about email security and phishing awareness.</p>

        <p>In a real phishing scenario, you might receive an email asking you to update your address, verify account information, or take urgent action. These emails often contain malicious links designed to steal your credentials or personal information.</p>

        <p>Click the link below to visit our education page where you can learn more about how to identify and avoid phishing attacks:</p>

        <p><a href="${linkUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 4px;">Go to Education Page</a></p>

        <p>This is a safe training exercise. The link above will take you to educational content about email security best practices.</p>

        <p>Best regards,<br>
        Security Training Team</p>
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
