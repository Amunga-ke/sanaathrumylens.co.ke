// src/utils/userUtils.ts

/**
 * Generate user initials from display name or email
 */
export function getUserInitials(user: { name?: string | null; displayName?: string; email?: string | null } | null): string {
    if (!user) return "U";

    let source = "";

    // Support both 'name' (NextAuth) and 'displayName' (legacy)
    const displayName = user.name || user.displayName;

    if (displayName && displayName.trim()) {
        source = displayName.trim();
        const names = source.split(/\s+/);

        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }

        return source.substring(0, 2).toUpperCase();
    }

    if (user.email && user.email.trim()) {
        const username = user.email.split("@")[0];
        const parts = username.split(/[._-]/);

        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }

        return username.substring(0, 2).toUpperCase();
    }

    return "U";
}

/**
 * Get user avatar data
 */
export function getUserAvatar(user: { name?: string | null; displayName?: string; email?: string | null; image?: string | null; photoURL?: string } | null): {
    type: "image" | "initials";
    url?: string;
    initials?: string;
    backgroundColor?: string;
    color?: string;
    alt: string;
} {
    if (!user) {
        return {
            type: "initials",
            initials: "U",
            backgroundColor: "#9CA3AF",
            color: "#FFFFFF",
            alt: "User avatar",
        };
    }

    // Support both 'image' (NextAuth) and 'photoURL' (legacy)
    const avatarUrl = user.image || user.photoURL;

    if (avatarUrl) {
        return {
            type: "image",
            url: avatarUrl,
            alt: user.name || user.displayName || user.email || "User avatar",
        };
    }

    return {
        type: "initials",
        initials: getUserInitials(user),
        backgroundColor: getAvatarColor(user),
        color: "#FFFFFF",
        alt: `Avatar for ${user.name || user.displayName || user.email || "user"}`,
    };
}

/**
 * Generate consistent avatar color
 */
function getAvatarColor(user: { name?: string | null; displayName?: string; email?: string | null }): string {
    const seed = (user.name || user.displayName || user.email || "user").toLowerCase();
    let hash = 0;

    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = [
        "#EF4444",
        "#F97316",
        "#F59E0B",
        "#10B981",
        "#06B6D4",
        "#3B82F6",
        "#8B5CF6",
        "#EC4899",
        "#6366F1",
        "#14B8A6",
    ];

    return colors[Math.abs(hash) % colors.length];
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: { name?: string | null; displayName?: string; email?: string | null } | null): string {
    if (!user) return "User";

    // Support both 'name' (NextAuth) and 'displayName' (legacy)
    const displayName = user.name || user.displayName;

    if (displayName?.trim()) {
        return displayName.trim();
    }

    if (user.email) {
        return user.email.split("@")[0];
    }

    return "User";
}
