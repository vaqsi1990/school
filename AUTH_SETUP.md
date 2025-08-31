# NextAuth.js Setup and Troubleshooting Guide

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-change-in-production

# Database
DATABASE_URL="your-database-connection-string"

# Email (if using email verification)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password

# UploadThing (if using file uploads)
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
```

## Common Issues and Solutions

### 1. "Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON" Error

This error occurs when NextAuth.js receives HTML instead of JSON from the authentication endpoint.

**Causes:**
- Missing or incorrect `NEXTAUTH_SECRET`
- Server-side errors in the auth route
- Middleware conflicts
- Database connection issues

**Solutions:**
- Ensure `NEXTAUTH_SECRET` is set in `.env.local`
- Check database connectivity
- Verify middleware configuration
- Clear browser cache and cookies

### 2. Authentication Not Working

**Check:**
- Environment variables are properly set
- Database is running and accessible
- NextAuth routes are not blocked by middleware
- Session provider is properly configured

### 3. Session Expiration Issues

**Solutions:**
- Session is configured for 30 days
- JWT tokens have proper expiration
- Automatic retry logic is implemented

## Implementation Details

### Error Handling
- **AuthErrorBoundary**: Catches and handles authentication errors gracefully
- **Retry Logic**: Automatically retries failed authentication requests
- **Fallback UI**: Shows user-friendly error messages in Georgian

### Session Management
- **Automatic Refresh**: Sessions refresh every 5 minutes
- **Window Focus**: Disabled to reduce unnecessary API calls
- **Error Recovery**: Implements exponential backoff for failed requests

### Security Features
- **JWT Strategy**: Uses JWT tokens for session management
- **Route Protection**: Middleware protects admin, teacher, and student routes
- **Type Safety**: Full TypeScript support with proper interfaces

## Testing Authentication

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Check environment variables:**
   - Ensure `.env.local` exists with required variables
   - Verify `NEXTAUTH_SECRET` is set

3. **Test login flow:**
   - Navigate to `/auth/signin`
   - Try logging in with valid credentials
   - Check browser console for any errors

4. **Monitor network requests:**
   - Open browser DevTools
   - Check Network tab for `/api/auth/*` requests
   - Ensure responses are JSON, not HTML

## Production Considerations

- **Change `NEXTAUTH_SECRET`**: Use a strong, unique secret
- **Set `NEXTAUTH_URL`**: Use your production domain
- **Database**: Ensure production database is properly configured
- **HTTPS**: Always use HTTPS in production
- **Rate Limiting**: Consider implementing rate limiting for auth endpoints

## Troubleshooting Commands

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Check for linting errors
npm run lint

# Clear Next.js cache
rm -rf .next

# Check database connection
npx prisma db push

# Generate Prisma client
npx prisma generate
```

## Support

If you continue to experience issues:

1. Check browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure database is accessible
4. Check middleware configuration
5. Review NextAuth.js logs in development mode
