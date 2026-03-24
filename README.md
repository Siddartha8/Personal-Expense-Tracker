# Personal Expense Tracker SID

🟢 **Live Demo:** [https://personal-expense-tracker-peach-five.vercel.app/](https://personal-expense-tracker-peach-five.vercel.app/)

A full-stack, modern Next.js 14 specialized web application designed for securely logging, managing, and analyzing daily financial expenses with specialized Admin proxying features.

### Features
- **User Authentication:** Secure login and profile management with a fully integrated Admin dashboard system.
- **Analytics & Visuals:** Live Recharts data modeling, dynamic pie charts, analytical trends, and categorical mapping.
- **Dark Mode Support:** Fully responsive Light and Dark themes flawlessly managed via Next-Themes.
- **Supabase Cloud DB:** Remote deployed PostgreSQL cloud database strictly typed using the Prisma ORM.

### Tech Stack
- [Next.js 14](https://nextjs.org/) (App Router)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) & [Prisma ORM](https://www.prisma.io/)
- [Next-Auth](https://next-auth.js.org/) & [Vercel](https://vercel.com/)


## Getting Started

First, install dependencies:
```bash
npm install
```

Make sure to set your `.env` file explicitly with your Supabase Postgres credentials and Auth secrets:
```text
DATABASE_URL="..."
DIRECT_URL="..."
NEXTAUTH_SECRET="..."
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result!
