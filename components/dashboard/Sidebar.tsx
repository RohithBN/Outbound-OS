"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";

const navItems = [
	{
		name: "Dashboard",
		href: "/dashboard",
		icon: (
			<svg
				className="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
				/>
			</svg>
		),
	},
	{
		name: "Goals",
		href: "/dashboard/goals",
		icon: (
			<svg
				className="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
				/>
			</svg>
		),
	},
	{
		name: "Campaigns",
		href: "/dashboard/campaigns",
		icon: (
			<svg
				className="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
				/>
			</svg>
		),
	},
	{
		name: "Prospects",
		href: "/dashboard/prospects",
		icon: (
			<svg
				className="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
				/>
			</svg>
		),
	},
	{
		name: "Settings",
		href: "/dashboard/settings",
		icon: (
			<svg
				className="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
				/>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
				/>
			</svg>
		),
	},
];

export default function Sidebar() {
	const pathname = usePathname();
	const router = useRouter();

	const handleLogout = async () => {
		await fetch("/api/auth/logout", { method: "POST" });
		router.push("/login");
	};

	return (
		<aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-orange-500/20 flex flex-col">
			{/* Logo */}
			<div className="p-6 border-b border-gray-200 dark:border-orange-500/20">
				<Link href="/dashboard" className="flex items-center gap-2 group">
					<div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
						<span className="text-white font-bold text-lg transition-transform duration-500">
							O
						</span>
					</div>
					<span className="text-xl font-bold text-gray-900 dark:text-white">
						OutboundOS
					</span>
				</Link>
			</div>

			{/* Navigation */}
			<nav className="flex-1 p-4 space-y-1">
				{navItems.map((item) => {
					const isActive =
						pathname === item.href ||
						pathname.startsWith(`${item.href}/`);
					return (
						<Link
							key={item.name}
							href={item.href}
							className={`flex items-center gap-3 px-4 py-3 rounded-lg transform transition-all duration-500 hover:scale-105 ${
								isActive
									? "bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-500 shadow-md scale-105"
									: "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-orange-500/10"
							}`}
						>
							<span className="transition-transform duration-500 group-hover:scale-125">
								{item.icon}
							</span>
							<span className="font-medium">{item.name}</span>
						</Link>
					);
				})}
			</nav>

			{/* Bottom section */}
			<div className="p-4 border-t border-gray-200 dark:border-orange-500/20 space-y-4">
				<div className="flex items-center justify-between px-4">
					<span className="text-sm text-gray-600 dark:text-gray-400">
						Theme
					</span>
					<ThemeToggle />
				</div>
				<button
					onClick={handleLogout}
					className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-orange-500/10 rounded-lg transform transition-all duration-500 hover:scale-105"
				>
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						/>
					</svg>
					<span className="font-medium">Logout</span>
				</button>
			</div>
		</aside>
	);
}
