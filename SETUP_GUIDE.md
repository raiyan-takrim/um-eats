# UMEats Quick Setup Guide

This guide will help you get UMEats running locally in 10 minutes.

## Prerequisites Checklist

- ✅ Node.js 18+ installed
- ✅ PostgreSQL installed and running
- ✅ Google account for OAuth setup
- ✅ Git installed

## Step-by-Step Setup

### 1. Clone and Install (2 minutes)

```bash
# Clone the repository
git clone <your-repo-url>
cd um-eats

# Install dependencies
npm install --legacy-peer-deps
```

### 2. Database Setup (2 minutes)

Create a PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE umeats;

# Exit
\q
```

### 3. Environment Configuration (3 minutes)

```bash
# Copy environment file
cp .env.example .env
```

Edit `.env` file:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/umeats?schema=public"
BETTER_AUTH_SECRET="generate-a-random-32-character-string-here-minimum"
BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id-from-next-step"
GOOGLE_CLIENT_SECRET="your-google-client-secret-from-next-step"
```

**Generate a secure secret:**

```bash
# On Linux/Mac
openssl rand -base64 32

# Or use this Node.js command
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Google OAuth Setup (5 minutes)

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create a new project:**

   - Click "Select a project" → "New Project"
   - Name: "UMEats Dev"
   - Click "Create"

3. **Enable Google+ API:**

   - Go to "APIs & Services" → "Enable APIs and Services"
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen:**

   - Go to "APIs & Services" → "OAuth consent screen"
   - User Type: "External"
   - Click "Create"
   - Fill in:
     - App name: "UMEats"
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - Scopes: Click "Save and Continue" (default is fine)
   - Test users: Add your @siswa.um.edu.my email
   - Click "Save and Continue"

5. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "UMEats Web Client"
   - Authorized redirect URIs:
     - Add: `http://localhost:3000/api/auth/callback/google`
   - Click "Create"
   - **Copy Client ID and Client Secret to your `.env` file**

### 5. Initialize Database (1 minute)

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Open Prisma Studio to verify
npx prisma studio
```

### 6. Create First Admin User (2 minutes)

1. Start the dev server:

```bash
npm run dev
```

2. Open http://localhost:3000

3. Click "Sign In" and login with your UM email

4. Open Prisma Studio (keep dev server running):

```bash
npx prisma studio
```

5. Navigate to `User` model

6. Find your user and change `role` to `ADMIN`

7. Refresh the browser - you should now see "Admin Dashboard" in the navbar

### 7. Test the System

✅ **Test Student Flow:**

1. Sign in with @siswa.um.edu.my email
2. Browse food listings
3. Check rankings page
4. View your profile

✅ **Test Admin Flow:**

1. Go to Admin Dashboard
2. Create a new organization
3. Assign an organization admin (use another registered user's email)

✅ **Test Organization Flow:**

1. Login as the organization admin user
2. Go to Organization Dashboard
3. View stats and ready to create listings

## Troubleshooting

### Error: "Peer dependency warning"

**Solution**: Always use `npm install --legacy-peer-deps`

### Error: "Can't reach database"

**Fix**:

```bash
# Check if PostgreSQL is running
# On Windows:
services.msc  # Look for PostgreSQL service

# On Mac:
brew services list

# On Linux:
sudo systemctl status postgresql
```

### Error: "OAuth redirect URI mismatch"

**Fix**: Make sure the redirect URI in Google Console **exactly** matches:

```
http://localhost:3000/api/auth/callback/google
```

(No trailing slash, correct port)

### Error: "Email not allowed"

**Fix**: Only @siswa.um.edu.my emails can register. This is by design.

### Error: "Can't access admin dashboard"

**Fix**: Make sure you set your user's role to `ADMIN` in Prisma Studio

## Next Steps

Now that your system is running:

1. **Create Organizations**: Use Admin Dashboard to add organizations
2. **Invite Organization Admins**: Assign admins from registered users
3. **Test Food Listings**: Organizations can start posting food (UI ready, backend pending)
4. **Customize**: Modify the app to fit your needs

## Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm start                      # Start production server

# Database
npx prisma studio             # Open database GUI
npx prisma migrate dev        # Create migration
npx prisma generate           # Generate Prisma Client
npx prisma db push            # Quick schema push

# Maintenance
npm run lint                  # Check code quality
npx prisma migrate reset      # Reset database (⚠️ deletes all data)
```

## Default Ports

- App: http://localhost:3000
- Prisma Studio: http://localhost:5555
- PostgreSQL: localhost:5432

## Need Help?

- Check the main README.md for detailed documentation
- Review the troubleshooting section above
- Check Prisma and Better Auth documentation
- Review your .env file for typos

---

**Setup Time**: ~10 minutes  
**Status**: ✅ Ready for development

Happy coding! 🚀
