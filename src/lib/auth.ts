import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db) as any,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await db.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.password) {
                    throw new Error("Invalid credentials");
                }

                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isCorrectPassword) {
                    throw new Error("Invalid credentials");
                }

                if (user.emailVerified === null) {
                    throw new Error("Email unverified. Please check your inbox for an OTP or sign up again.");
                }

                if (user.isActive === false) {
                    throw new Error("Your account has been deactivated. Please contact support.");
                }

                return user;
            }
        })
    ],
    callbacks: {
        signIn: async ({ user, account }) => {
            if (account?.provider === "google" && user?.email) {
                const existingUser = await db.user.findUnique({ where: { email: user.email } });
                if (existingUser && existingUser.isActive === false) {
                    throw new Error("Your account has been deactivated. Please contact support.");
                }
            }
            return true;
        },
        session: ({ session, token }) => {
            if (token && session.user) {
                session.user.id = token.sub as string;
            }
            return session;
        }
    }
};
