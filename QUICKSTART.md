# Quick Start Guide - UMEats

This guide will help you get UMEats up and running on your local machine in 5 minutes.

## Prerequisites

Ensure you have:

- Node.js 18 or higher installed
- A PostgreSQL database (local or cloud)
- Git

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd um-eats

# Install dependencies
npm install
```

### 2. Database Setup

**Option A: Local PostgreSQL**

```bash
# Create a new database
createdb umeats

# Set your connection string in .env
echo 'DATABASE_URL="postgresql://username:password@localhost:5432/umeats"' > .env
```

**Option B: Cloud Database (Recommended for quick start)**

Use [Supabase](https://supabase.com) or [Neon](https://neon.tech) for a free PostgreSQL database:

1. Create a free account
2. Create a new project
3. Copy the connection string
4. Create `.env` file:

```bash
DATABASE_URL="your-connection-string-here"
```

### 3. Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Create database tables
npm run db:migrate

# (Optional) Add sample data
npm run db:seed
```

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser! 🎉

## What You'll See

- **Homepage**: SDG Champions Leaderboard with top organizations
- **Browse Food** (`/food`): Filter and browse available food listings
- **Rankings** (`/food`): Full organization rankings by SDG contributions
- **About** (`/about`): Learn about UMEats mission and values

## Next Steps

### For Development

1. **Add Sample Data**: Create organizations and food listings via Prisma Studio:

   ```bash
   npm run db:studio
   ```

2. **Implement Authentication**: Add NextAuth.js or similar

3. **Add Real Maps**: Integrate Google Maps or OpenStreetMap

4. **Deploy**: Push to Vercel or your preferred platform

### For Production

1. Set up proper environment variables
2. Configure production database
3. Set up file storage for images (Cloudinary, S3, etc.)
4. Enable authentication
5. Add monitoring and analytics

## Common Issues

### Port Already in Use

```bash
# Kill the process using port 3000
npx kill-port 3000
```

### Database Connection Error

- Verify your `DATABASE_URL` in `.env`
- Check if PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

### Prisma Client Not Generated

```bash
npm run db:generate
```

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Open Prisma Studio (Database GUI)
npm run db:studio

# Run database migrations
npm run db:migrate

# Push schema changes without migration
npm run db:push
```

## Project Structure Overview

```
src/
├── app/              # Next.js pages (App Router)
├── components/       # Reusable UI components
├── lib/             # Utilities and configurations
├── types/           # TypeScript type definitions
└── hooks/           # Custom React hooks
```

## Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review the [CONTRIBUTING.md](./CONTRIBUTING.md) guide
- Open an issue on GitHub

---

**Happy coding! 🚀**
