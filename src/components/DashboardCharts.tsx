"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card } from './ui/Card';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#facc15', '#10b981', '#0ea5e9', '#6366f1'];

export function MainExpenseChart({ data }: { data: any[] }) {
    return (
        <Card className="p-6 col-span-1 lg:col-span-2 shadow-sm border-white/40 dark:border-white/10 relative">
            <h3 className="text-lg font-bold mb-6 text-neutral-800 dark:text-neutral-200">Spending Trend (Last 7 Days)</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" strokeOpacity={0.5} />
                        <XAxis dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, className: "fill-neutral-500 dark:fill-neutral-400" }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, className: "fill-neutral-500 dark:fill-neutral-400" }}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,15,15,0.95)', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                            labelStyle={{ color: '#aaa', fontWeight: 'medium', marginBottom: '4px' }}
                        />
                        <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}

export function CategoryPieChart({ data }: { data: any[] }) {
    return (
        <Card className="p-6 col-span-1 shadow-sm border-white/40 dark:border-white/10">
            <h3 className="text-lg font-bold mb-6 text-neutral-800 dark:text-neutral-200">Top Categories</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={8}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,15,15,0.95)', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
