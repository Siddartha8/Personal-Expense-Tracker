"use client";

import { motion } from "framer-motion";

export const Logo = ({ className }: { className?: string }) => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
        show: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
        },
    };

    const letters = ["S", "I", "D"];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={`flex items-baseline ${className}`}
        >
            {letters.map((letter, index) => (
                <motion.span
                    key={index}
                    variants={item}
                    className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-neutral-900 to-neutral-400 dark:from-white dark:to-neutral-500"
                >
                    {letter}
                </motion.span>
            ))}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 200 }}
                className="w-2.5 h-2.5 rounded-full bg-blue-500 ml-1"
            />
        </motion.div>
    );
};
