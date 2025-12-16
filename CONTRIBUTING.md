# Contributing to UMEats

Thank you for your interest in contributing to UMEats! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment for all contributors

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Follow the setup instructions in [QUICKSTART.md](./QUICKSTART.md)

## Development Workflow

### 1. Code Style

We follow these conventions:

**TypeScript/React**

- Use TypeScript for type safety
- Functional components with hooks
- Use `const` for components and functions
- Destructure props
- Use explicit return types for functions

**Naming Conventions**

- Components: PascalCase (`FoodCard.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- Folders: kebab-case (`food-listings/`)

**File Structure**

```typescript
// Imports (grouped: React, external, internal, types)
import React from 'react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { Food } from '@/types';

// Types/Interfaces
interface ComponentProps {
  // ...
}

// Component
export function Component({ prop }: ComponentProps) {
  // Hooks
  // Event handlers
  // Render logic

  return (
    // JSX
  );
}
```

### 2. Component Guidelines

**Create Reusable Components**

- Keep components small and focused
- Extract repeated patterns into shared components
- Use composition over prop drilling

**Mobile-First Approach**

- Design for mobile screens first
- Use Tailwind's responsive classes (`sm:`, `md:`, `lg:`)
- Test on various screen sizes

**Example:**

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
</div>
```

### 3. Using shadcn/ui

Always use shadcn/ui components where available:

```bash
# Add a new component
npx shadcn@latest add [component-name]
```

Customize components in `src/components/ui/` as needed.

### 4. Database Changes

When modifying the Prisma schema:

```bash
# 1. Update schema.prisma
# 2. Create migration
npm run db:migrate

# 3. Generate Prisma Client
npm run db:generate
```

**Schema Guidelines**

- Use descriptive model and field names
- Add indexes for frequently queried fields
- Include `createdAt` and `updatedAt` timestamps
- Use enums for fixed value sets
- Document complex relationships with comments

### 5. Forms

Use React Hook Form with Zod for all forms:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  // ...
});

type FormData = z.infer<typeof formSchema>;

export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      /* ... */
    },
  });

  // ...
}
```

### 6. API Routes

Follow Next.js App Router conventions:

```typescript
// src/app/api/food/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const foods = await prisma.foodListing.findMany();
    return NextResponse.json(foods);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch foods" },
      { status: 500 }
    );
  }
}
```

## Testing

Before submitting a PR:

1. **Manual Testing**

   - Test on mobile viewport (375px width minimum)
   - Test both light and dark themes
   - Check responsive behavior
   - Verify form validation

2. **Build Check**

   ```bash
   npm run build
   ```

3. **Lint Check**
   ```bash
   npm run lint
   ```

## Pull Request Process

1. **Branch Naming**

   - Feature: `feature/description`
   - Bug fix: `fix/description`
   - Documentation: `docs/description`

2. **Commit Messages**

   - Use clear, descriptive messages
   - Start with a verb: "Add", "Fix", "Update", "Refactor"
   - Example: `Add food filtering by dietary preferences`

3. **PR Description**
   Include:

   - What changes were made
   - Why these changes were necessary
   - Screenshots for UI changes
   - Testing steps
   - Related issues (if any)

4. **Review Process**
   - Address review comments
   - Keep PRs focused and reasonably sized
   - Update documentation if needed

## Areas to Contribute

### High Priority

- [ ] Authentication system (NextAuth.js)
- [ ] Map integration for location display
- [ ] Image upload functionality
- [ ] Real-time notifications
- [ ] Organization dashboard with analytics

### Medium Priority

- [ ] Search optimization
- [ ] Email notifications
- [ ] QR code generation for claims
- [ ] Rating and review system
- [ ] Advanced filtering options

### Low Priority (Nice to Have)

- [ ] Dark mode improvements
- [ ] Accessibility enhancements
- [ ] Animation and transitions
- [ ] Progressive Web App (PWA) features
- [ ] Multi-language support

## Questions?

- Open an issue for bugs or feature requests
- Tag maintainers for urgent matters
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to UMEats! 🙏
