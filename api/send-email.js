import Anthropic from '@anthropic-ai/sdk';
import nodemailer from 'nodemailer';

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Generate email content using Claude
async function generateEmailContent(linkUrl) {
    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
            role: 'user',
            content: `Generate a professional email asking the recipient to update their delivery address for an incoming package. The link URL is: ${linkUrl}

Requirements:
- Write a compelling subject line about updating delivery address (on first line, prefixed with "SUBJECT: ")
- Create email body copy (2-3 short paragraphs) explaining:
  * They have a package on the way
  * They need to click the link to confirm or update their delivery address
- Include a clear call-to-action with the link
- Keep the tone professional and friendly
- Format the link as HTML: <a href="${linkUrl}">descriptive text</a>

Return ONLY the subject line and email body, nothing else.`
        }]
    });

    const content = message.content[0].text;
    const lines = content.split('\n');

    // Extract subject line
    let subject = 'Check this out!';
    let body = content;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('SUBJECT:')) {
            subject = lines[i].replace('SUBJECT:', '').trim();
            body = lines.slice(i + 1).join('\n').trim();
            break;
        }
    }

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
        const requiredEnvVars = ['ANTHROPIC_API_KEY', 'GMAIL_USER', 'GMAIL_APP_PASSWORD', 'LINK_URL'];
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

        // Generate email content with AI
        const { subject, body } = await generateEmailContent(process.env.LINK_URL);

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
        if (error.message?.includes('Invalid API key')) {
            return res.status(500).json({ error: 'API configuration error: Invalid Anthropic API key' });
        }

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
