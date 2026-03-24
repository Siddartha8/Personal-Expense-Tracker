"use server";

import db from "@/lib/db";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email || !password || !name) {
            return { error: "Missing required fields" };
        }

        const existingUser = await db.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: "User already exists" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return { success: true };
    } catch (error: any) {
        console.error("REGISTER ERROR", error);
        return { error: error.message || "Something went wrong" };
    }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function updateProfile(data: { name?: string; password?: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.password && data.password.trim() !== '') {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        await db.user.update({
            where: { id: session.user.id },
            data: updateData
        });
        return { success: true };
    } catch (err) {
        return { error: "Failed to update profile." };
    }
}
