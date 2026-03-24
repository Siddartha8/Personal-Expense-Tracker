"use server";

import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getCategories() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized", categories: [] };

    try {
        const categories = await db.category.findMany({
            where: { userId: session.user.id },
            orderBy: { name: 'asc' }
        });
        return { success: true, categories };
    } catch (error) {
        return { error: "Failed to fetch categories", categories: [] };
    }
}

export async function addCategory(data: { name: string; color: string; icon: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const category = await db.category.create({
            data: {
                ...data,
                userId: session.user.id
            }
        });
        revalidatePath("/categories");
        return { success: true, category };
    } catch (error: any) {
        if (error.code === 'P2002') return { error: "Category already exists" };
        return { error: "Failed to add category" };
    }
}

export async function deleteCategory(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        await db.category.delete({
            where: { id, userId: session.user.id }
        });
        revalidatePath("/categories");
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete category. It may be in use." };
    }
}

export async function updateCategory(id: string, data: { name: string; color: string; icon: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const category = await db.category.update({
            where: { id, userId: session.user.id },
            data
        });
        revalidatePath("/categories");
        return { success: true, category };
    } catch (error) {
        return { error: "Failed to update category. The name might already exist." };
    }
}
