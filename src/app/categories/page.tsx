"use client";

import { useState, useEffect } from "react";
import { getCategories, addCategory, deleteCategory, updateCategory } from "@/actions/categories";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ArrowLeft, Tag, Edit2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [name, setName] = useState("");
    const [color, setColor] = useState("#3b82f6");
    const [isLoading, setIsLoading] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchCats();
    }, []);

    async function fetchCats() {
        const res = await getCategories();
        if (res.success) setCategories(res.categories);
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        setIsLoading(true);

        const res = editId
            ? await updateCategory(editId, { name, color, icon: "Circle" })
            : await addCategory({ name, color, icon: "Circle" });

        if (res.success) {
            setEditId(null);
            setName("");
            setColor("#3b82f6");
            fetchCats();
        } else {
            alert(res.error);
        }
        setIsLoading(false);
    };

    const startEdit = (cat: any) => {
        setEditId(cat.id);
        setName(cat.name);
        setColor(cat.color);
    };

    const cancelEdit = () => {
        setEditId(null);
        setName("");
        setColor("#3b82f6");
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This might fail if expenses are linked to it.")) return;
        const res = await deleteCategory(id);
        if (res.success) {
            fetchCats();
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="flex items-center gap-4">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/50 dark:hover:bg-neutral-800">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">Manage Categories</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1 font-medium">Customize your expense filing system</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none" />

                <div className="md:col-span-1">
                    <Card className="p-6 sticky top-24 border-white/40 dark:border-white/10 shadow-xl shadow-neutral-200/50 dark:shadow-black/50 overflow-hidden">
                        <h3 className="font-bold text-lg mb-6 text-neutral-800 dark:text-neutral-200">
                            {editId ? "Update Category" : "Create New"}
                        </h3>
                        <form onSubmit={handleAdd} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Category Name</label>
                                <Input
                                    placeholder="e.g. Travel, Food"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Color</label>
                                <div className="flex gap-3 items-center">
                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-800 shadow-inner">
                                        <input
                                            type="color"
                                            value={color}
                                            onChange={e => setColor(e.target.value)}
                                            className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer bg-transparent"
                                        />
                                    </div>
                                    <Input value={color} onChange={e => setColor(e.target.value)} className="font-mono text-sm uppercase flex-1" />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <Button type="submit" className="flex-1 h-12 rounded-2xl font-bold shadow-lg shadow-blue-500/25" disabled={isLoading}>
                                    {isLoading ? "Saving..." : <>{editId ? <Edit2 className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}{editId ? "Update" : "Add"}</>}
                                </Button>
                                {editId && (
                                    <Button type="button" variant="outline" onClick={cancelEdit} className="h-12 rounded-2xl font-bold">
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Card>
                </div>

                <div className="md:col-span-2 space-y-4">
                    <AnimatePresence>
                        {categories.map((cat) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group flex justify-between items-center p-5 bg-white/60 dark:bg-neutral-900/60 border border-white/40 dark:border-white/10 rounded-[1.5rem] backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-inner" style={{ backgroundColor: cat.color }}>
                                        <Tag className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 leading-tight">{cat.name}</h4>
                                        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{cat.color}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                                    <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full h-10 w-10" onClick={() => startEdit(cat)}>
                                        <Edit2 className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full h-10 w-10" onClick={() => handleDelete(cat.id)}>
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {categories.length === 0 && (
                        <div className="text-center p-12 text-neutral-500 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl mt-4 bg-white/30 dark:bg-neutral-900/30 backdrop-blur-sm">
                            <Tag className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                            <p className="font-medium text-neutral-600 dark:text-neutral-400">No custom categories found.</p>
                            <p className="text-sm mt-1">Create your first one to get started!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
