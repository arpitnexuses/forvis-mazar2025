import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getMongoClient, COLLECTIONS } from '@/lib/mongodb';

interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Please enter email and password');
          }

          // Check if MongoDB URI is configured
          if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI not configured');
            throw new Error('Database configuration error');
          }

          const client = await getMongoClient();
          const adminUsers = client.db().collection(COLLECTIONS.ADMIN_USERS);

          const user = await adminUsers.findOne({ email: credentials.email });
          if (!user) {
            throw new Error('No user found with this email');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('NextAuth authorize error:', error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/admin',
    error: '/admin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as ExtendedUser).id = token.id as string;
      }
      return session;
    }
  },
  // Add better error handling
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_URL,
}); 