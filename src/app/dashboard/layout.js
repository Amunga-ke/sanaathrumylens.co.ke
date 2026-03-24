// src/app/dashboard/layout.js (dashboard layout)

'use client';

import { useAuth } from "@/contexts/AuthContext";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, BookOpen, Calendar, User, Settings, Users, 
  FileText, Bookmark, ChevronRight, Loader2 
} from 'lucide-react';
import ProfileCompletionBanner from '@/components/ProfileCompletionBanner';

const navItems = {
  USER: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Bookmarks', href: '/dashboard/bookmarks', icon: Bookmark },
    { label: 'Profile', href: '/dashboard/profile', icon: User },
  ],
  EDITOR: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'My Posts', href: '/dashboard/posts', icon: FileText },
    { label: 'Bookmarks', href: '/dashboard/bookmarks', icon: Bookmark },
    { label: 'Profile', href: '/dashboard/profile', icon: User },
  ],
  MODERATOR: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Posts', href: '/dashboard/posts', icon: FileText },
    { label: 'Comments', href: '/dashboard/comments', icon: BookOpen },
    { label: 'Bookmarks', href: '/dashboard/bookmarks', icon: Bookmark },
    { label: 'Profile', href: '/dashboard/profile', icon: User },
  ],
  ADMIN: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Posts', href: '/dashboard/posts', icon: FileText },
    { label: 'Events', href: '/dashboard/events', icon: Calendar },
    { label: 'Users', href: '/dashboard/users', icon: Users },
    { label: 'Comments', href: '/dashboard/comments', icon: BookOpen },
    { label: 'Bookmarks', href: '/dashboard/bookmarks', icon: Bookmark },
    { label: 'Profile', href: '/dashboard/profile', icon: User },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],
  SUPER_ADMIN: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Posts', href: '/dashboard/posts', icon: FileText },
    { label: 'Events', href: '/dashboard/events', icon: Calendar },
    { label: 'Users', href: '/dashboard/users', icon: Users },
    { label: 'Comments', href: '/dashboard/comments', icon: BookOpen },
    { label: 'Bookmarks', href: '/dashboard/bookmarks', icon: Bookmark },
    { label: 'Profile', href: '/dashboard/profile', icon: User },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],
};

export default function DashboardLayout({ children }) {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const role = user?.role || 'USER';

    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Protect dashboard pages
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <p className="text-gray-600 dark:text-gray-400">Please log in to access the dashboard.</p>
            </div>
        );
    }

    const currentNav = navItems[role] || navItems.USER;

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        SanaaThruMyLens
                    </Link>
                </div>
                <nav className="p-4">
                    <ul className="space-y-1">
                        {currentNav.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                            isActive 
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.label}
                                        {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
                <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                            {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {user.name || user.email}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {role}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Profile Completion Banner */}
                <ProfileCompletionBanner user={user} />
                
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
