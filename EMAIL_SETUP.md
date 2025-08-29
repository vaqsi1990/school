# Email Verification Setup Guide

## Overview
This application now includes email verification for user registration. Users must verify their email address with a 6-digit code before they can complete their registration.

## Setup Steps

### 1. Environment Variables
Create a `.env` file in your project root with the following variables:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### 2. Gmail App Password Setup
If using Gmail, you need to create an App Password:

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled
4. Go to App passwords
5. Generate a new app password for "Mail"
6. Use this password in your `EMAIL_PASSWORD` environment variable

### 3. Email Service Configuration
The system is configured to use Gmail by default. If you want to use a different email service, modify the `src/lib/email.ts` file:

```typescript
const transporter = nodemailer.createTransporter({
  service: 'your-email-service', // e.g., 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

## How It Works

### Registration Flow
1. **Step 1**: User enters email address
2. **Step 2**: System sends 6-digit verification code via email
3. **Step 3**: User enters the verification code
4. **Step 4**: If code is valid, user proceeds to complete registration form
5. **Step 5**: User submits registration form with all required information

### Security Features
- Verification codes expire after 10 minutes
- Verified emails are valid for 30 minutes to complete registration
- Only verified emails can be used for registration
- Verification tokens are automatically cleaned up after use

### API Endpoints
- `POST /api/auth/send-verification` - Sends verification code
- `POST /api/auth/verify-code` - Verifies the code
- `POST /api/auth/register` - Completes registration (requires verified email)

## Testing
1. Start your development server: `npm run dev`
2. Navigate to `/auth/signup`
3. Enter an email address
4. Check your email for the verification code
5. Enter the code to proceed to registration

## Troubleshooting

### Email Not Sending
- Check your environment variables
- Verify your email service credentials
- Check if your email service allows SMTP access
- For Gmail, ensure you're using an App Password, not your regular password

### Database Issues
- Run `npx prisma migrate dev` to apply the new schema changes
- Ensure your database is running and accessible

### Code Verification Failing
- Check if the code has expired (10 minutes)
- Verify the email address matches exactly
- Check server logs for any errors

## Customization

### Email Templates
Modify the email templates in `src/lib/email.ts` to customize:
- Email subject lines
- HTML content and styling
- Email sender information

### Verification Code Format
Change the code generation in `src/app/api/auth/send-verification/route.ts`:
```typescript
// Current: 6-digit numeric code
const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

// Alternative: Alphanumeric code
const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
```

### Expiration Times
Modify expiration times in the respective API routes:
- Verification code: 10 minutes (in `send-verification`)
- Verified email: 30 minutes (in `verify-code`)
