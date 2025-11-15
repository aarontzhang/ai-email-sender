# AI Email Link Sender MVP

A simple web application that collects an email address and automatically sends an AI-generated email containing a clickable link using Claude AI and Gmail SMTP.

## Features

- Clean, single-page responsive form
- AI-generated email content using Claude (Anthropic API)
- Automatic email sending via Gmail SMTP
- Mobile-responsive design
- Error handling and validation
- Deploy-ready for Vercel free tier

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend**: Node.js serverless functions (Vercel)
- **AI**: Anthropic Claude API
- **Email**: Nodemailer with Gmail SMTP

## Prerequisites

Before you begin, you'll need:

1. **Anthropic API Key**
   - Sign up at [console.anthropic.com](https://console.anthropic.com/)
   - Generate an API key from your account dashboard

2. **Gmail Account with App Password**
   - A Gmail account to send emails from
   - An App Password (see setup instructions below)

3. **Vercel Account** (for deployment)
   - Sign up at [vercel.com](https://vercel.com)

## Gmail App Password Setup

Gmail requires an App Password for third-party applications:

1. Go to your Google Account settings: [myaccount.google.com](https://myaccount.google.com/)
2. Navigate to **Security**
3. Enable **2-Step Verification** (required for App Passwords)
4. Go to **Security > 2-Step Verification > App passwords**
5. Select **Mail** and **Other (Custom name)**
6. Enter "AI Email Sender" as the name
7. Click **Generate**
8. Copy the 16-character password (remove spaces)

## Local Development Setup

1. **Clone or download this project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment variables file**
   ```bash
   cp .env.example .env
   ```

4. **Configure your `.env` file**
   ```env
   ANTHROPIC_API_KEY=sk-ant-xxxxx
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=your16charpassword
   SENDER_NAME=Your Name or Company
   LINK_URL=https://example.com/your-link
   ```

5. **Install Vercel CLI (optional, for local testing)**
   ```bash
   npm install -g vercel
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

   Your app will be available at `http://localhost:3000`

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project directory**
   ```bash
   cd ai-email-sender
   vercel
   ```

4. **Set up environment variables**

   After the first deployment, add your environment variables:
   ```bash
   vercel env add ANTHROPIC_API_KEY
   vercel env add GMAIL_USER
   vercel env add GMAIL_APP_PASSWORD
   vercel env add SENDER_NAME
   vercel env add LINK_URL
   ```

5. **Deploy to production**
   ```bash
   npm run deploy
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository
   - Configure project:
     - Framework Preset: **Other**
     - Root Directory: `./`
     - Build Command: (leave empty)
     - Output Directory: `public`

3. **Add Environment Variables**

   In the Vercel project settings, add these environment variables:
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
   - `GMAIL_USER`: Your Gmail address
   - `GMAIL_APP_PASSWORD`: Your Gmail App Password
   - `SENDER_NAME`: Display name for sender
   - `LINK_URL`: The URL to include in emails

4. **Deploy**

   Click "Deploy" and Vercel will build and deploy your application.

## Project Structure

```
ai-email-sender/
├── api/
│   └── send-email.js       # Serverless API endpoint
├── public/
│   ├── index.html          # Main HTML page
│   ├── styles.css          # Styling
│   └── script.js           # Frontend JavaScript
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
├── vercel.json             # Vercel configuration
└── README.md               # This file
```

## How It Works

1. User enters recipient email address on the frontend
2. Frontend sends POST request to `/api/send-email`
3. Backend validates email address
4. Claude AI generates personalized email content with the configured link
5. Nodemailer sends the email via Gmail SMTP
6. User receives success/error message

## Configuration

### Customizing the Link

Edit the `LINK_URL` environment variable to change the link included in emails:

```env
LINK_URL=https://your-website.com/special-offer
```

### Customizing Email Generation

To modify how Claude generates emails, edit the prompt in [api/send-email.js:16-31](api/send-email.js#L16-L31).

### Customizing the Frontend

- **Styling**: Edit [public/styles.css](public/styles.css)
- **HTML structure**: Edit [public/index.html](public/index.html)
- **Client-side logic**: Edit [public/script.js](public/script.js)

## Troubleshooting

### "Invalid API key" error
- Verify your Anthropic API key is correct
- Ensure the key has proper permissions
- Check that environment variables are set in Vercel

### "Invalid login" or email authentication errors
- Verify your Gmail App Password is correct (16 characters, no spaces)
- Ensure 2-Step Verification is enabled on your Google account
- Check that `GMAIL_USER` matches the account that generated the App Password

### Emails not being received
- Check spam/junk folders
- Verify the recipient email is valid
- Check Vercel function logs for errors
- Ensure Gmail hasn't blocked your app (check Gmail security settings)

### "Server configuration error"
- Ensure all required environment variables are set in Vercel
- Required: `ANTHROPIC_API_KEY`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `LINK_URL`

## Costs

- **Vercel**: Free tier includes 100GB bandwidth and 100 serverless function executions per day
- **Anthropic API**: Pay-as-you-go pricing (Claude 3.5 Sonnet: ~$3 per million input tokens)
- **Gmail**: Free (daily sending limit: 500 emails for regular Gmail, 2000 for Google Workspace)

## Security Notes

- Never commit `.env` file to version control
- Keep your API keys and passwords secure
- Use environment variables for all sensitive data
- Consider adding rate limiting for production use
- Gmail App Passwords should be unique per application

## Limitations (MVP Scope)

- No user authentication
- No email tracking or analytics
- No database storage
- Single email template (AI-generated)
- No scheduling functionality

## Future Enhancements

- Email template selection
- Analytics dashboard
- User authentication
- Database for email logs
- Email scheduling
- Custom sender domains
- Rate limiting
- CAPTCHA protection

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Verify all environment variables are correctly set
4. Check the [Anthropic API documentation](https://docs.anthropic.com/)
5. Check the [Nodemailer documentation](https://nodemailer.com/)

---

Built with Claude AI
