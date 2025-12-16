# UMEats - Project Summary & Implementation Guide

## 📊 Project Overview

**UMEats** is a modern, full-stack food redistribution platform designed specifically for Universiti Malaya students. The platform connects organizations (restaurants, cafes, event organizers) with students by redistributing surplus food that would otherwise go to waste.

### Key Objectives

1. **Reduce Food Waste**: Help organizations redistribute surplus food
2. **Support Students**: Provide free nutritious meals to students
3. **Promote SDGs**: Contribute to UN SDG 2 (Zero Hunger) and SDG 12 (Responsible Consumption)
4. **Build Brand Value**: Create a ranking system that rewards organizations for sustainability efforts

---

## 🏗️ Technical Architecture

### Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui component library
- **Database**: PostgreSQL with Prisma ORM
- **Theme**: next-themes (Dark/Light mode support)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Project Structure

```
um-eats/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth pages (to be implemented)
│   │   ├── food/              # Food browsing & details
│   │   │   ├── [id]/          # Dynamic food detail page
│   │   │   └── page.tsx       # Browse all food
│   │   ├── rankings/          # Organization rankings
│   │   ├── about/             # About page
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── globals.css        # Global styles & CSS variables
│   │   └── page.tsx           # Homepage
│   ├── components/
│   │   ├── features/          # Feature-specific components
│   │   │   ├── food-card.tsx          # Food listing card
│   │   │   ├── org-card.tsx           # Organization ranking card
│   │   │   └── filter-bar.tsx         # Search & filter component
│   │   ├── layout/            # Layout components
│   │   │   ├── navbar.tsx             # Main navigation
│   │   │   ├── footer.tsx             # Site footer
│   │   │   └── theme-toggle.tsx       # Dark/light mode toggle
│   │   ├── providers/         # React context providers
│   │   │   └── theme-provider.tsx     # Theme provider wrapper
│   │   └── ui/                # shadcn/ui base components
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── utils.ts           # Utility functions (cn helper)
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── hooks/                 # Custom React hooks (empty, ready for use)
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seeding script
│   └── migrations/            # Migration files (created on db:migrate)
└── public/                    # Static assets
```

---

## 🗄️ Database Schema

### Models

#### **User**

- Primary entity for all users (students & organizations)
- Fields: id, email, name, role, password, phone, avatar
- Role enum: STUDENT, ORGANIZATION, ADMIN
- Relations: organization (1:1), claims (1:many)

#### **Organization**

- Organization details and SDG metrics
- Fields: name, type, description, logo, address, location coordinates
- SDG Tracking: totalFoodSaved (kg), totalDonations, sdgScore, ranking
- Type enum: RESTAURANT, EVENT_ORGANIZER, CAFE, CATERING, OTHER
- Relations: user (1:1), foodListings (1:many)

#### **FoodListing**

- Available food items from organizations
- Fields: title, description, category, quantity, unit, images
- Availability: status, availableFrom, availableUntil, pickupLocation, coordinates
- Dietary Info: isVegetarian, isVegan, isHalal, allergens, tags
- Status enum: AVAILABLE, CLAIMED, COLLECTED, EXPIRED
- Relations: organization (many:1), claims (1:many)

#### **Claim**

- Student claims on food items
- Fields: quantity, status, claimedAt, collectedAt
- Relations: foodListing (many:1), user (many:1)

### Key Indexes

- User: email, role
- Organization: sdgScore, ranking, type
- FoodListing: status, availableFrom, availableUntil, category, organizationId
- Claim: userId, foodListingId, status

---

## 🎨 UI/UX Implementation

### Design Principles

1. **Mobile-First**: All components designed for mobile, then enhanced for larger screens
2. **Responsive Grid**: Uses Tailwind's responsive grid system (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3)
3. **Accessible**: shadcn/ui components are WCAG compliant
4. **Theme Support**: Full dark/light mode with smooth transitions
5. **Modern & Clean**: Contemporary design with proper spacing and typography

### Key Components

#### **FoodCard**

- Displays food listing with image, title, description
- Shows organization info, location, quantity
- Dietary badges (Halal, Vegetarian, Vegan)
- Expiring soon indicator
- Call-to-action button

#### **OrgCard**

- Displays organization ranking with position badge
- Shows SDG metrics (food saved, donations, score)
- Color-coded rank indicators (Gold, Silver, Bronze)
- Stats grid with icons

#### **FilterBar**

- Search by text
- Category filter dropdown
- Dietary preferences (Halal, Veg, Vegan)
- Sort options (Latest, Expiring, Quantity)
- Active filters display with clear option

#### **Navbar**

- Responsive design (hamburger menu on mobile)
- Logo, navigation links, theme toggle
- Login/Sign Up buttons
- Sticky positioning

---

## 📱 Pages Implemented

### 1. Homepage (`/`)

- Hero section with CTA buttons
- Impact statistics cards
- Top 3 organizations leaderboard
- How it works section
- Organization sign-up CTA

### 2. Browse Food (`/food`)

- Filter bar for search and filtering
- Grid of food cards
- Result count display
- Mobile-responsive layout

### 3. Food Detail (`/food/[id]`)

- Large food image
- Detailed description
- Dietary information and allergens
- Pickup location with map placeholder
- Organization details sidebar
- Claim button with time remaining

### 4. Rankings (`/rankings`)

- Full organization leaderboard
- Aggregate statistics
- Detailed org cards with all metrics

### 5. About (`/about`)

- Mission statement
- SDG goals explanation
- How the platform works
- Core values
- Call to action

---

## 🔄 Data Flow

### Current Implementation (Mock Data)

All pages currently use mock data for demonstration. This allows the UI to be fully functional without a database connection.

### Database Integration (Next Steps)

1. Set up PostgreSQL database
2. Run migrations: `npm run db:migrate`
3. Seed database: `npm run db:seed`
4. Replace mock data with Prisma queries:

```typescript
// Example: Fetching food listings
import { prisma } from "@/lib/prisma";

export async function getFoodListings() {
  return await prisma.foodListing.findMany({
    where: { status: "AVAILABLE" },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          type: true,
          logo: true,
          address: true,
          latitude: true,
          longitude: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Set up production PostgreSQL database
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Test all pages and features
- [ ] Build without errors: `npm run build`
- [ ] Optimize images and assets

### Environment Variables

```env
DATABASE_URL="your-production-database-url"
NEXT_PUBLIC_APP_URL="https://umeats.com"
NEXTAUTH_URL="https://umeats.com"
NEXTAUTH_SECRET="your-secret-key"
```

### Deployment Platforms

- **Vercel** (Recommended): One-click deploy from GitHub
- **Netlify**: Full Next.js support
- **Railway**: Includes PostgreSQL
- **AWS/Azure**: For complete control

---

## 🔮 Future Enhancements

### Phase 2 (Authentication & User Management)

- [ ] NextAuth.js integration
- [ ] Student login (email/UM credentials)
- [ ] Organization registration & verification
- [ ] Role-based access control
- [ ] User profiles and preferences

### Phase 3 (Core Features)

- [ ] Food claim functionality
- [ ] Organization dashboard
- [ ] List new food (organization)
- [ ] Claim history (student)
- [ ] Real-time notifications

### Phase 4 (Advanced Features)

- [ ] Map integration (Google Maps/OpenStreetMap)
- [ ] Image upload (Cloudinary/S3)
- [ ] QR code for collection
- [ ] Rating and review system
- [ ] Analytics dashboard
- [ ] Email notifications

### Phase 5 (Mobile & PWA)

- [ ] Progressive Web App features
- [ ] Push notifications
- [ ] Offline support
- [ ] Mobile app (React Native)

---

## 📝 Development Guidelines

### Code Style

- TypeScript strict mode enabled
- Functional components with hooks
- Proper type definitions
- DRY principles (reusable components)
- Descriptive variable/function names

### Component Organization

- Feature-specific components in `components/features/`
- Layout components in `components/layout/`
- Reusable UI in `components/ui/` (shadcn)
- One component per file
- Export named components

### Best Practices

- Mobile-first responsive design
- Accessibility (ARIA labels, semantic HTML)
- Performance optimization (lazy loading, code splitting)
- SEO metadata on all pages
- Error boundaries for error handling

---

## 🛠️ Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm start                      # Start production server
npm run lint                   # Run ESLint

# Database
npm run db:generate            # Generate Prisma Client
npm run db:migrate             # Run migrations
npm run db:push                # Push schema changes
npm run db:studio              # Open Prisma Studio (DB GUI)
npm run db:seed                # Seed database with sample data

# Adding UI Components
npx shadcn@latest add button   # Add specific component
npx shadcn@latest add          # Interactive component selector
```

---

## 📊 Current Status

### ✅ Completed

- [x] Project setup and configuration
- [x] Database schema design
- [x] UI component library integration
- [x] Theme system (dark/light mode)
- [x] Homepage with rankings
- [x] Food browsing with filters
- [x] Food detail page
- [x] Rankings page
- [x] About page
- [x] Responsive navigation and footer
- [x] Mobile-first responsive design
- [x] Type-safe API with TypeScript
- [x] Documentation (README, QUICKSTART, CONTRIBUTING)

### 🚧 In Progress / Todo

- [ ] Authentication system
- [ ] API routes for CRUD operations
- [ ] Database connection and real data
- [ ] Organization dashboard
- [ ] Food listing form
- [ ] Claim functionality
- [ ] Image upload system
- [ ] Map integration
- [ ] Testing suite
- [ ] Deployment

---

## 🎯 Success Metrics

### User Engagement

- Number of active students
- Number of registered organizations
- Food listings per week
- Claims per week
- User retention rate

### Impact Metrics

- Total food saved (kg)
- Total meals redistributed
- Food waste reduction percentage
- CO2 emissions prevented
- Students helped

### Platform Health

- Page load times < 2s
- Mobile usability score > 90
- Accessibility score > 95
- SEO score > 90
- Zero critical bugs

---

## 📞 Support & Resources

- **Documentation**: README.md, QUICKSTART.md, CONTRIBUTING.md
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 👥 Team & Credits

**Developed for WIX2002 (Project Management) - Universiti Malaya**

This project demonstrates modern web development practices, sustainable technology solutions, and social impact through technology.

---

**Last Updated**: December 2024  
**Version**: 0.1.0 (MVP)  
**Status**: Development - Ready for database integration and deployment
