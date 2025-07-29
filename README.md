# Mazars Cybersecurity Assessment Tool

This is a [Next.js](https://nextjs.org) project for conducting cybersecurity assessments with MongoDB storage and email notifications.

## Environment Setup

Before running the application, you need to set up your environment variables. Create a `.env.local` file in the root directory with the following variables:

```bash
# Required: MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Optional: Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
TO_EMAIL=admin@company.com

# Environment
NODE_ENV=development
```

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Troubleshooting

If you encounter MongoDB connection issues:

1. **Check your `.env.local` file** - Ensure `MONGODB_URI` is properly set
2. **Test the connection** - Run `node scripts/test-mongodb-connection.js` to verify your MongoDB connection
3. **Check SSL settings** - The application automatically handles SSL/TLS configuration for different environments

## Features

- Cybersecurity assessment form with multiple categories and areas
- MongoDB storage for assessment data
- Email notifications (optional)
- Admin dashboard for viewing and managing assessments
- PDF report generation
- Multi-language support (English/French)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
