// src/app/dashboard/layout.js (dashboard layout)

'use client';

import { useAuth } from "@/contexts/AuthContext";


export default function DashboardLayout({ children }) {
    const { user, role } = useAuth();

    // Protect dashboard pages
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600 dark:text-gray-400">Please log in to access the dashboard.</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            {/* <DashboardSidebar role={role} /> */}
            <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-800">
                {children}
            </main>
        </div>
    );
}
