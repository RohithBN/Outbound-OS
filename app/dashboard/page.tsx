"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalProspects: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ totalGoals: 0, activeGoals: 0, completedGoals: 0, totalProspects: 0 });
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((res) => res.json()).then((data) => { if (data.success) setUserName(data.user.name); });
    fetch("/api/goals").then((res) => res.json()).then((data) => {
      if (data.success) {
        const goals = data.goals;
        setStats({
          totalGoals: goals.length,
          activeGoals: goals.filter((g: { status: string }) => g.status === "active").length,
          completedGoals: goals.filter((g: { status: string }) => g.status === "completed").length,
          totalProspects: 0,
        });
      }
    });
  }, []);

  const statCards = [
    { label: "Total Goals", value: stats.totalGoals },
    { label: "Active Goals", value: stats.activeGoals },
    { label: "Completed", value: stats.completedGoals },
    { label: "Prospects", value: stats.totalProspects },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back{userName ? `, ${userName}` : ""}!</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Here&apos;s what&apos;s happening with your outreach campaigns.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-black rounded-xl p-6 border border-gray-200 dark:border-orange-500/20">
            <p className="text-sm font-medium text-gray-500 dark:text-orange-500/70">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-black rounded-xl p-6 border border-gray-200 dark:border-orange-500/20">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/goals" className="flex items-center gap-4 p-4 bg-orange-50 dark:bg-orange-500/10 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors border border-transparent dark:border-orange-500/20">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Create New Goal</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Set up a new outreach campaign</p>
            </div>
          </Link>
          <Link href="/dashboard/prospects" className="flex items-center gap-4 p-4 bg-orange-50 dark:bg-orange-500/10 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors border border-transparent dark:border-orange-500/20">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">View Prospects</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage your contacts</p>
            </div>
          </Link>
          <Link href="/dashboard/campaigns" className="flex items-center gap-4 p-4 bg-orange-50 dark:bg-orange-500/10 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors border border-transparent dark:border-orange-500/20">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Campaigns</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track your outreach</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
