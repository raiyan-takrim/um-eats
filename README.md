# UMEats - Food Redistribution Platform

A modern web application for food redistribution at Universiti Malaya, connecting students with leftover food from restaurants and events while promoting SDG 2 (Zero Hunger) and SDG 12 (Responsible Consumption).

## 🚀 Features

- **For Students:**

  - Browse available food with advanced filters
  - Claim food and get pickup locations
  - View organization rankings and contributions
  - Google OAuth authentication with UM email validation
  - Mobile-first responsive design

- **For Organizations:**

  - List leftover food easily
  - Track SDG contributions
  - View ranking and analytics
  - Build brand reputation through sustainability
  - Organization dashboard with analytics

- **For Administrators:**

  - Create and verify organizations
  - Assign organization admins
  - Monitor platform activity
  - User and organization management

- **Platform Features:**
  - Real-time food availability
  - SDG Champions Leaderboard
  - Dark/Light theme support
  - Dietary preference filters (Halal, Vegetarian, Vegan)
  - Location-based food discovery
  - Role-based access control (Student, Organization, Admin)

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui
- **Database:** PostgreSQL with Prisma ORM v7
- **Authentication:** Better Auth with Google OAuth
- **Theme:** next-themes
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **Notifications:** Sonner

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- Google Cloud Console account (for OAuth)
- Git

## 🔧 Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd um-eats
   ```

2. **Install dependencies:**

   ```bash
   npm install --legacy-peer-deps
   ```

   > Note: We use `--legacy-peer-deps` due to Better Auth compatibility with Prisma v7

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure the following:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/umeats?schema=public"

   # Better Auth
   BETTER_AUTH_SECRET="your-secret-key-min-32-characters-long"
   BETTER_AUTH_URL="http://localhost:3000"

   # Google OAuth (see Google OAuth Setup section)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Set up Google OAuth:**

   a. Go to [Google Cloud Console](https://console.cloud.google.com/)

   b. Create a new project or select existing one

   c. Enable Google+ API

   d. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"

   e. Configure OAuth consent screen:

   - User Type: External
   - Add your email as test user
   - Add scopes: email, profile, openid

   f. Create OAuth 2.0 Client ID:

   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

   g. Copy Client ID and Client Secret to your `.env` file

5. **Set up the database:**

   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations to create database tables
   npx prisma migrate dev --name add_better_auth

   # (Optional) Seed the database with sample data
   npx prisma db seed
   ```

6. **Run the development server:**

   ```bash
   npm run dev
   ```

7. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Authentication Flow

### For Students:

1. Click "Sign In" in the navbar
2. Sign in with Google using your UM email (@siswa.um.edu.my)
3. Complete profile setup
4. Browse and claim food

### For Organizations:

1. System admin verifies organization manually
2. Admin creates organization in Admin Dashboard
3. Admin assigns organization admin from registered users
4. Organization admin receives role assignment
5. Organization can start posting food listings

### For Admins:

- Default admin must be created manually in the database
- Use Prisma Studio: `npx prisma studio`
- Set user role to `ADMIN`

## 🗂️ User Roles

| Role             | Permissions                                              |
| ---------------- | -------------------------------------------------------- |
| **STUDENT**      | Browse food, claim items, view rankings                  |
| **ORGANIZATION** | Create listings, manage claims, view analytics           |
| **ADMIN**        | Create organizations, assign admins, platform management |

## 📁 Project Structure

```
um-eats/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── organization/      # Organization dashboard
│   │   ├── food/              # Food browsing and details
│   │   ├── rankings/          # Organization rankings
│   │   ├── login/             # Authentication
│   │   ├── profile/           # User profile
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout with theme
│   │   └── page.tsx           # Homepage
│   ├── components/
│   │   ├── features/          # Feature-specific components
│   │   │   ├── food-card.tsx
│   │   │   ├── org-card.tsx
│   │   │   └── filter-bar.tsx
│   │   ├── layout/            # Layout components
│   │   │   ├── navbar.tsx     # Auth-aware navigation
│   │   │   ├── footer.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── providers/         # Context providers
│   │   └── ui/                # shadcn/ui components (13 components)
│   ├── lib/
│   │   ├── auth.ts            # Better Auth server config
│   │   ├── auth-client.ts     # Better Auth client hooks
│   │   ├── prisma.ts          # Prisma client
│   │   └── utils.ts           # Utility functions
│   └── middleware.ts          # Route protection middleware
├── prisma/
│   └── schema.prisma          # Database schema with auth
├── public/                    # Static assets
└── package.json
```

## 🗄️ Database Schema

### Core Models:

- **User**: Students, organization admins, system admins
- **Organization**: Restaurants, cafes, canteens, NGOs
- **FoodListing**: Available food items
- **Claim**: Student food claims

### Auth Models (Better Auth):

- **Session**: User sessions with expiry
- **Account**: OAuth provider accounts
- **Verification**: Email verification tokens

## 📊 API Routes

### Authentication

- `POST /api/auth/[...all]` - Better Auth endpoints
- `GET /api/user/profile` - Get current user profile
- `PATCH /api/user/profile` - Update user profile

### Admin

- `POST /api/admin/organizations` - Create organization
- `GET /api/admin/organizations` - List all organizations

## 🎨 Features Implemented

✅ **Authentication System**

- Google OAuth integration
- UM email validation (@siswa.um.edu.my)
- Role-based access control
- Protected routes middleware
- Session management

✅ **User Interface**

- Responsive design (mobile-first)
- Dark/light theme support
- Homepage with SDG information
- Food browsing with filters
- Organization rankings
- About page

✅ **Dashboard**

- Admin dashboard (organization management)
- Organization dashboard (listing management)
- User profile page

✅ **Components Library**

- 13 shadcn/ui components installed
- Custom FoodCard, OrgCard, FilterBar
- Auth-aware Navbar with user menu
- Theme toggle

## 🚧 Pending Implementation

- [ ] Food listing creation (CRUD)
- [ ] Food claiming system
- [ ] Real-time notifications
- [ ] Image upload (Cloudinary)
- [ ] Search functionality
- [ ] Analytics and reporting
- [ ] Email notifications
- [ ] Mobile app (PWA)
- [ ] QR code for food collection
- [ ] Rating and review system

## 🎨 UI/UX Design Principles

- **Mobile-First**: Optimized for mobile devices
- **Responsive**: Works seamlessly on all screen sizes
- **Accessible**: WCAG compliant components
- **Modern**: Clean, contemporary design with shadcn/ui
- **Fast**: Optimized performance with Next.js 16
- **Themeable**: Dark/light mode support

## 📊 SDG Ranking System

Organizations are ranked based on:

- Total food saved (in kg)
- Number of donations
- Consistency of contributions
- Student feedback

The algorithm promotes:

- Regular participation
- Larger quantities
- Diverse offerings
- Sustainable practices

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
4. Update Google OAuth redirect URI to production URL
5. Deploy

### Other Platforms

The app can be deployed on any platform supporting Next.js:

- Netlify
- Railway
- AWS Amplify
- Digital Ocean

**Important**: Make sure to:

- Set up PostgreSQL database
- Update Google OAuth redirect URIs
- Set all environment variables
- Run Prisma migrations in production

## 🧪 Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Prisma commands
npx prisma studio              # Open Prisma Studio (Database GUI)
npx prisma generate            # Generate Prisma Client
npx prisma migrate dev         # Create and apply migrations
npx prisma migrate reset       # Reset database
npx prisma db push            # Push schema without migration
```

## 🐛 Troubleshooting

### Issue: Peer dependency warnings with Better Auth

**Solution**: Use `--legacy-peer-deps` flag when installing packages

### Issue: Database connection errors

**Solution**:

- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check firewall settings

### Issue: OAuth not working

**Solution**:

- Verify Google OAuth credentials
- Check redirect URIs match exactly
- Ensure BETTER_AUTH_URL is correct

### Issue: Role permissions not working

**Solution**:

- Clear browser cookies
- Check user role in database
- Verify middleware is properly configured

## 📝 Environment Variables Reference

### Required Variables:

```env
DATABASE_URL="postgresql://..."           # PostgreSQL connection string
BETTER_AUTH_SECRET="..."                  # Min 32 characters
BETTER_AUTH_URL="http://localhost:3000"   # App URL
GOOGLE_CLIENT_ID="..."                    # From Google Console
GOOGLE_CLIENT_SECRET="..."                # From Google Console
```

### Optional Variables:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Public app URL
NODE_ENV="development"                        # Environment
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is developed for Universiti Malaya students as part of WIX2002 (Project Management).

## 👥 Team

Developed by [Your Team Name] for WIX2002 Group Project - Semester 3 2024/2025.

## 🆘 Support

For issues and questions:

- Create an issue on GitHub
- Contact the development team
- Check documentation in `/docs` folder

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🎯 Roadmap

### Phase 1: MVP (Completed)

- ✅ Project setup and design
- ✅ Authentication system
- ✅ User roles and permissions
- ✅ Basic UI/UX

### Phase 2: Core Features (Next)

- [ ] Food listing CRUD operations
- [ ] Claiming system
- [ ] Real-time updates
- [ ] Image uploads

### Phase 3: Enhancements

- [ ] Analytics dashboard
- [ ] Notifications
- [ ] Search and filters
- [ ] Mobile optimization

### Phase 4: Advanced Features

- [ ] QR code system
- [ ] Rating and reviews
- [ ] AI recommendations
- [ ] PWA support

---

**Built with ❤️ for Universiti Malaya - Advancing SDG 2 & SDG 12**
