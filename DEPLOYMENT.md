# Deployment Guide - UMEats

This guide covers deploying UMEats to production using various platforms.

## Table of Contents

- [Vercel Deployment (Recommended)](#vercel-deployment)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Alternative Platforms](#alternative-platforms)

---

## Vercel Deployment

Vercel is the recommended platform as it's built by the creators of Next.js and offers seamless integration.

### Prerequisites

- GitHub account
- Vercel account (free tier available)
- PostgreSQL database (see [Database Setup](#database-setup))

### Steps

1. **Push Code to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import Project in Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the `um-eats` project

3. **Configure Build Settings**

   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Add Environment Variables**

   - Click "Environment Variables"
   - Add all variables from `.env.example`
   - See [Environment Variables](#environment-variables) section

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `your-project.vercel.app`

### Automatic Deployments

- Every push to `main` branch triggers a new deployment
- Pull requests get preview deployments
- Rollback to previous deployments anytime

---

## Database Setup

### Option 1: Supabase (Recommended for Free Tier)

1. **Create Account**

   - Go to [supabase.com](https://supabase.com)
   - Sign up for free account

2. **Create New Project**

   - Click "New Project"
   - Name: `umeats`
   - Database Password: Generate strong password
   - Region: Choose closest to your users

3. **Get Connection String**

   - Go to Settings → Database
   - Find "Connection string" section
   - Copy "Connection pooling" URL
   - Format: `postgresql://[user]:[password]@[host]:[port]/postgres?pgbouncer=true`

4. **Configure for Prisma**
   - Add direct connection for migrations
   - Add pooling connection for queries
   ```env
   DATABASE_URL="postgresql://[pooling-connection]"
   DIRECT_URL="postgresql://[direct-connection]"
   ```

### Option 2: Neon

1. **Create Account**

   - Go to [neon.tech](https://neon.tech)
   - Sign up for free

2. **Create Project**

   - New Project → Name it "umeats"
   - Copy connection string

3. **Use in Environment**
   ```env
   DATABASE_URL="postgresql://[connection-string]"
   ```

### Option 3: Railway

1. **Create Account**

   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create PostgreSQL Service**
   - New Project → Add PostgreSQL
   - Copy `DATABASE_URL` from variables

### Option 4: Self-Hosted

If you have your own PostgreSQL server:

```env
DATABASE_URL="postgresql://username:password@host:5432/umeats"
```

---

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/umeats"

# Application
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
NODE_ENV="production"
```

### Optional (for Future Features)

```env
# Authentication (NextAuth.js)
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# File Upload (Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Email (SendGrid/Resend)
EMAIL_SERVER_HOST=""
EMAIL_SERVER_PORT=""
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_FROM=""

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=""
```

### Setting Variables in Vercel

1. Go to Project Settings
2. Click "Environment Variables"
3. Add each variable:
   - Name: `DATABASE_URL`
   - Value: Your connection string
   - Environment: Production (also check Preview if needed)
4. Redeploy for changes to take effect

---

## Post-Deployment

### 1. Run Database Migrations

After first deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run migrations on production database
npx prisma migrate deploy
```

Or use Vercel's build command:

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

### 2. Seed Database (Optional)

```bash
# Seed production database
npm run db:seed
```

Or create sample data through Prisma Studio:

```bash
npx prisma studio --browser none
```

### 3. Set Up Custom Domain

1. Go to Vercel Project Settings
2. Click "Domains"
3. Add your domain (e.g., `umeats.com`)
4. Update DNS records as instructed
5. SSL certificate auto-generated

### 4. Configure Analytics

- Add Vercel Analytics (built-in)
- Or integrate Google Analytics
- Set up error monitoring (Sentry)

### 5. Performance Optimization

```typescript
// next.config.ts
const config = {
  images: {
    domains: ["your-image-cdn.com"],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizeCss: true,
  },
};
```

---

## Alternative Platforms

### Netlify

1. **Deploy**

   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

2. **Configure**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Add environment variables in Netlify dashboard

### Railway

1. **Deploy from GitHub**

   - Connect GitHub repository
   - Railway auto-detects Next.js
   - Add PostgreSQL service
   - Link database to app

2. **Configure**
   - Environment variables automatically set
   - Custom domains available

### AWS (Advanced)

1. **Using AWS Amplify**

   - Connect GitHub repository
   - Configure build settings
   - Add environment variables

2. **Using EC2 + RDS**
   - Set up EC2 instance
   - Install Node.js and PM2
   - Set up RDS PostgreSQL
   - Configure nginx reverse proxy

### Docker Deployment

1. **Create Dockerfile**

   ```dockerfile
   FROM node:18-alpine AS base

   WORKDIR /app
   COPY package*.json ./
   RUN npm ci

   COPY . .
   RUN npx prisma generate
   RUN npm run build

   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t umeats .
   docker run -p 3000:3000 umeats
   ```

---

## Monitoring & Maintenance

### Health Checks

Create an API route for health checks:

```typescript
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({ status: "ok", timestamp: new Date().toISOString() });
}
```

### Error Monitoring

Integrate Sentry:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Backup Strategy

1. **Database Backups**

   - Supabase: Automatic daily backups
   - Self-hosted: Set up pg_dump cron job

2. **Code Backups**
   - GitHub repository (version controlled)
   - Regular commits and tags

### Performance Monitoring

- Use Vercel Analytics
- Google PageSpeed Insights
- Lighthouse CI in GitHub Actions

---

## Troubleshooting

### Build Failures

**Error: Prisma Client not generated**

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

**Error: Module not found**

- Check import paths use `@/` alias
- Verify `tsconfig.json` paths configuration

### Database Connection Issues

**Error: Can't reach database server**

- Verify `DATABASE_URL` is correct
- Check firewall rules
- Use connection pooling for serverless

**Error: Too many connections**

- Use connection pooling (PgBouncer)
- Set Prisma connection limit:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
    connectionLimit = 10
  }
  ```

### Runtime Errors

**Error: Environment variable not found**

- Add variable in platform dashboard
- Redeploy after adding variables

**Error: 404 on dynamic routes**

- Check file naming: `[id]/page.tsx`
- Verify route structure

---

## Security Checklist

- [ ] Environment variables properly configured
- [ ] Database uses SSL connection
- [ ] API routes protected with authentication
- [ ] Rate limiting implemented
- [ ] CORS configured correctly
- [ ] Sensitive data not in Git history
- [ ] Dependencies up to date
- [ ] Security headers configured

---

## Performance Checklist

- [ ] Images optimized (Next.js Image component)
- [ ] Code splitting enabled
- [ ] Database queries optimized with indexes
- [ ] Caching strategy implemented
- [ ] CDN configured for static assets
- [ ] Gzip/Brotli compression enabled
- [ ] Lighthouse score > 90

---

## Rollback Procedure

### Vercel

1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

### Database

1. Stop application
2. Restore from backup
3. Restart application

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma Deployment**: https://www.prisma.io/docs/guides/deployment

---

**Good luck with your deployment! 🚀**

If you encounter issues not covered here, check the platform-specific documentation or open an issue on GitHub.
