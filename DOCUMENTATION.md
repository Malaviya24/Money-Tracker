# 📚 Tracura Documentation

> **Complete Guide to Setting Up, Deploying, and Managing Your Expense Tracking App**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Start Guide](#quick-start-guide)
3. [Project Structure](#project-structure)
4. [Features Overview](#features-overview)
5. [Technology Stack](#technology-stack)
6. [Installation & Setup](#installation--setup)
7. [Configuration](#configuration)
8. [Database Structure](#database-structure)
9. [Authentication](#authentication)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)
12. [Best Practices](#best-practices)
13. [FAQ](#faq)

---

## Introduction

### What is Tracura?

Tracura is a modern, user-friendly expense tracking application designed to help you manage your personal finances. It allows you to:

- **Organize expenses** into customizable "Spaces" (like Travel, Groceries, Subscriptions)
- **Track budgets** with visual progress indicators
- **Analyze spending** through interactive charts and analytics
- **Access anywhere** with a responsive design that works on desktop and mobile

### Who is this documentation for?

This guide is written for:
- **Beginners** who want to set up and use Tracura
- **Developers** who want to customize or extend the application
- **System administrators** who need to deploy and maintain the application

---

## Quick Start Guide

### For Users (Using the Hosted Version)

If Tracura is already deployed for you:

1. **Visit the app** at your provided URL
2. **Create an account** using your email and password
3. **Create your first Space** (e.g., "Monthly Groceries")
4. **Start adding expenses** to track your spending

### For Developers (Local Development)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd tracura

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open your browser
# Navigate to http://localhost:8080
```

---

## Project Structure

```
tracura/
├── public/                    # Static assets (favicon, robots.txt)
├── src/
│   ├── assets/               # Images and media files
│   ├── components/
│   │   ├── layout/           # Layout components (Sidebar, Header, etc.)
│   │   └── ui/               # Reusable UI components (Button, Card, etc.)
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.tsx       # Authentication hook
│   │   ├── useTheme.tsx      # Theme management hook
│   │   └── use-mobile.tsx    # Mobile detection hook
│   ├── integrations/
│   │   └── supabase/         # Backend integration
│   │       ├── client.ts     # Supabase client configuration
│   │       └── types.ts      # TypeScript types for database
│   ├── lib/                  # Utility functions
│   ├── pages/                # Application pages
│   │   ├── Landing.tsx       # Public landing page
│   │   ├── Login.tsx         # User login page
│   │   ├── Signup.tsx        # User registration page
│   │   ├── Dashboard.tsx     # Main dashboard
│   │   ├── Spaces.tsx        # Expense spaces list
│   │   ├── SpaceDetail.tsx   # Individual space view
│   │   ├── CreateSpace.tsx   # Create new space
│   │   ├── Analytics.tsx     # Spending analytics
│   │   └── Settings.tsx      # User settings
│   ├── App.tsx               # Main application component
│   ├── App.css               # Global styles
│   ├── index.css             # Tailwind CSS imports
│   └── main.tsx              # Application entry point
├── supabase/
│   ├── config.toml           # Supabase configuration
│   └── migrations/           # Database migrations
├── .env                      # Environment variables (auto-generated)
├── package.json              # Project dependencies
├── tailwind.config.ts        # Tailwind CSS configuration
├── vite.config.ts            # Vite build configuration
└── tsconfig.json             # TypeScript configuration
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `src/App.tsx` | Defines all application routes and wraps the app with providers |
| `src/hooks/useAuth.tsx` | Handles user authentication (login, signup, logout) |
| `src/integrations/supabase/client.ts` | Connects to the backend database |
| `tailwind.config.ts` | Configures the design system (colors, fonts, etc.) |
| `.env` | Stores sensitive configuration (auto-managed) |

---

## Features Overview

### 1. Expense Spaces 📊

Spaces are containers for organizing your expenses by category.

**What you can do:**
- Create unlimited spaces (Travel, Food, Entertainment, etc.)
- Set budgets for each space
- Choose custom colors and icons
- Track spending against budgets with progress bars

### 2. Expense Tracking 💸

Track every expense with detailed information.

**Expense details include:**
- Amount
- Category
- Description
- Date
- Optional notes

### 3. Analytics Dashboard 📈

Visualize your spending patterns with:
- Pie charts showing category breakdown
- Line graphs tracking spending over time
- Monthly and yearly comparisons
- Budget utilization metrics

### 4. Dark/Light Mode 🌓

Switch between light and dark themes based on your preference. The app automatically remembers your choice.

### 5. Responsive Design 📱

Works seamlessly on:
- Desktop computers (full sidebar navigation)
- Tablets (collapsible sidebar)
- Mobile phones (bottom navigation)

### 6. Secure Authentication 🔐

- Email and password authentication
- Secure password requirements (8+ characters, mixed case, numbers, special characters)
- Protected routes (only logged-in users can access their data)
- Each user's data is completely private

---

## Technology Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI library for building components | 18.3.1 |
| **TypeScript** | Type-safe JavaScript | Latest |
| **Vite** | Fast build tool and dev server | Latest |
| **Tailwind CSS** | Utility-first CSS framework | Latest |
| **shadcn/ui** | Beautiful, accessible components | Latest |
| **React Router** | Client-side routing | 6.30.1 |
| **TanStack Query** | Data fetching and caching | 5.83.0 |
| **Recharts** | Charts and data visualization | 2.15.4 |

### Backend (Lovable Cloud)

| Service | Purpose |
|---------|---------|
| **Database** | PostgreSQL database for storing all data |
| **Authentication** | Secure user authentication system |
| **Row Level Security** | Ensures users can only access their own data |

---

## Installation & Setup

### Prerequisites

Before you begin, ensure you have:

- **Node.js** version 18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or **yarn**
- A code editor like **VS Code** ([Download](https://code.visualstudio.com/))

### Step-by-Step Installation

#### Step 1: Get the Code

**Option A: Clone from GitHub**
```bash
git clone <your-repository-url>
cd tracura
```

**Option B: Download as ZIP**
1. Go to your GitHub repository
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file
4. Open terminal in the extracted folder

#### Step 2: Install Dependencies

```bash
npm install
```

This command downloads all required packages (may take 1-2 minutes).

#### Step 3: Start Development Server

```bash
npm run dev
```

#### Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:8080
```

You should see the Tracura landing page!

---

## Configuration

### Environment Variables

The `.env` file contains important configuration values. **This file is auto-generated and should not be edited manually.**

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Backend API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public API key for authentication |
| `VITE_SUPABASE_PROJECT_ID` | Unique project identifier |

### Theme Configuration

The design system is configured in `tailwind.config.ts` and `src/index.css`. Key customizations include:

- **Colors**: Primary, secondary, accent colors
- **Fonts**: Sans-serif (Inter), serif, and monospace fonts
- **Border radius**: Consistent rounded corners
- **Shadows**: Elevation system for depth

> ⚠️ **Note**: Only modify theme files if you understand CSS and the design system.

---

## Database Structure

Tracura uses three main tables to store data:

### Users & Profiles

```
profiles
├── id (unique identifier)
├── user_id (links to authentication)
├── first_name
├── last_name
├── avatar_url
├── default_currency (USD, EUR, etc.)
├── created_at
└── updated_at
```

### Spaces

```
spaces
├── id (unique identifier)
├── user_id (owner of the space)
├── name (e.g., "Travel 2025")
├── type (e.g., "travel", "groceries")
├── budget (maximum spending limit)
├── spent (current spending total)
├── currency (USD, EUR, etc.)
├── icon (emoji or icon name)
├── color (hex color code)
├── created_at
└── updated_at
```

### Expenses

```
expenses
├── id (unique identifier)
├── user_id (owner of the expense)
├── space_id (which space it belongs to)
├── amount (expense amount)
├── category (e.g., "food", "transport")
├── description (what was purchased)
├── date (when it occurred)
├── notes (optional additional info)
├── created_at
└── updated_at
```

### Data Security

All tables are protected by **Row Level Security (RLS)**:
- Users can only see, create, edit, and delete their own data
- No user can access another user's information
- The database enforces these rules automatically

---

## Authentication

### How Authentication Works

1. **Sign Up**: Users create an account with email and password
2. **Email Confirmation**: Account is automatically confirmed (development mode)
3. **Login**: Users enter credentials to access their data
4. **Session Management**: The app keeps users logged in securely

### Password Requirements

For security, passwords must have:
- ✅ At least 8 characters
- ✅ One uppercase letter (A-Z)
- ✅ One lowercase letter (a-z)
- ✅ One number (0-9)
- ✅ One special character (!@#$%^&*)

### Protected Routes

These pages require authentication:
- `/dashboard` - Main dashboard
- `/spaces` - All expense spaces
- `/spaces/:id` - Individual space details
- `/create-space` - Create new space
- `/analytics` - Spending analytics
- `/settings` - User settings

Unauthenticated users are redirected to the login page.

---

## Deployment

### Option 1: Lovable Publish (Recommended)

The easiest way to deploy your app:

1. Click the **"Publish"** button (top-right corner in Lovable editor)
2. Your app is instantly available at: `https://tracura.lovable.app`

**Benefits:**
- No configuration needed
- Automatic HTTPS security
- Free hosting included

### Option 2: Custom Domain

To use your own domain (e.g., `expenses.mywebsite.com`):

1. Go to **Project Settings** → **Domains**
2. Click **"Add Custom Domain"**
3. Enter your domain name
4. Add the provided DNS records at your domain registrar
5. Wait for DNS propagation (up to 48 hours)

**Requirements:**
- A registered domain name
- Access to DNS settings at your registrar
- A paid Lovable plan

### Option 3: Self-Hosting

For advanced users who want to host on their own infrastructure:

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **The build output** is in the `dist/` folder

3. **Deploy to your hosting provider:**
   - Vercel
   - Netlify
   - AWS Amplify
   - Any static hosting service

4. **Configure environment variables** on your hosting platform

> 📖 See the [Self-Hosting Guide](https://docs.lovable.dev/tips-tricks/self-hosting) for detailed instructions.

---

## Troubleshooting

### Common Issues and Solutions

#### "Failed to fetch" or Network Errors

**Symptoms:** Data doesn't load, blank screens after login

**Solutions:**
1. Check your internet connection
2. Refresh the page (Ctrl+R or Cmd+R)
3. Clear browser cache and cookies
4. Try a different browser

#### "Invalid login credentials"

**Symptoms:** Can't log in with correct password

**Solutions:**
1. Double-check your email address for typos
2. Ensure Caps Lock is off
3. Use the "Forgot Password" feature
4. Create a new account if needed

#### Page Shows Blank/White Screen

**Symptoms:** Nothing displays after page loads

**Solutions:**
1. Open browser developer tools (F12)
2. Check the Console tab for errors
3. Clear browser cache
4. Disable browser extensions temporarily

#### Dark Mode Not Working

**Symptoms:** Theme toggle doesn't switch modes

**Solutions:**
1. Refresh the page
2. Clear local storage:
   - Open developer tools (F12)
   - Go to Application → Local Storage
   - Clear all items
3. Re-select your preferred theme

#### Expenses Not Saving

**Symptoms:** New expenses disappear after adding

**Solutions:**
1. Ensure you're logged in
2. Check for validation errors (required fields)
3. Refresh and try again
4. Check console for error messages

### Getting Help

If problems persist:

1. **Check the console** (F12 → Console) for error messages
2. **Search the Lovable Discord** community: [discord.gg/lovable-dev](https://discord.gg/lovable-dev)
3. **Contact support** at support@lovable.dev (paid plans)

---

## Best Practices

### For Users

#### Organizing Your Finances

1. **Create specific spaces** - Instead of one "Food" space, try "Groceries", "Restaurants", "Coffee"
2. **Set realistic budgets** - Start with your actual spending, then reduce gradually
3. **Log expenses immediately** - Don't wait until the end of the day
4. **Use notes** - Add context like "Birthday gift for Mom" for easier recall
5. **Review analytics weekly** - Spot trends before they become problems

#### Security Tips

1. **Use a strong password** - Follow the password requirements strictly
2. **Don't share your account** - Create separate accounts for family members
3. **Log out on shared devices** - Always sign out on public computers
4. **Keep your email secure** - Your email is used for password recovery

### For Developers

#### Code Quality

1. **Follow the component structure** - Keep components focused and reusable
2. **Use TypeScript properly** - Define types for all data structures
3. **Keep files small** - If a file exceeds 200 lines, consider splitting it
4. **Use the design system** - Never use hardcoded colors; use CSS variables

#### Performance

1. **Lazy load routes** - Large pages should load on demand
2. **Optimize images** - Use appropriate sizes and formats
3. **Minimize re-renders** - Use `useMemo` and `useCallback` appropriately
4. **Cache API responses** - TanStack Query handles this automatically

#### Database

1. **Always use RLS** - Never disable Row Level Security
2. **Validate on both ends** - Client and server-side validation
3. **Use transactions** - For operations that modify multiple records
4. **Index frequently queried columns** - Improves query performance

---

## FAQ

### General Questions

**Q: Is Tracura free to use?**
A: Yes, the hosted version on Lovable is free. Self-hosting may incur costs depending on your provider.

**Q: Can I use Tracura on my phone?**
A: Yes! The app is fully responsive and works on all modern mobile browsers.

**Q: Is my financial data secure?**
A: Yes. All data is encrypted, protected by Row Level Security, and only accessible to you.

**Q: Can I export my data?**
A: Currently, data export is available through the database directly. A user-friendly export feature is planned.

### Technical Questions

**Q: What browsers are supported?**
A: All modern browsers (Chrome, Firefox, Safari, Edge) from the last 2 years.

**Q: Can I add my own features?**
A: Absolutely! The code is open and customizable. Follow the developer best practices above.

**Q: How do I update to the latest version?**
A: If using GitHub sync, pull the latest changes. If using Lovable directly, updates are automatic.

**Q: Can multiple users share a space?**
A: Currently, spaces are private to each user. Shared spaces may be added in a future update.

---

## Support & Community

### Resources

- 📖 **Lovable Documentation**: [docs.lovable.dev](https://docs.lovable.dev)
- 💬 **Discord Community**: [discord.gg/lovable-dev](https://discord.gg/lovable-dev)
- 📧 **Email Support**: support@lovable.dev (paid plans)

### Contributing

Want to improve Tracura? We welcome contributions!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit with clear messages (`git commit -m 'Add amazing feature'`)
5. Push to your branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025 | Initial release with core features |

---

<p align="center">
  <strong>Built with ❤️ using <a href="https://lovable.dev">Lovable</a></strong>
</p>

<p align="center">
  <a href="#-tracura-documentation">Back to Top ↑</a>
</p>
