// src/utils/userUtils.js

/**
 * Generate user initials from display name or email
 * @param {Object} user
 * @returns {string}
 */
export function getUserInitials(user) {
    if (!user) return "U";

    let source = "";

    if (user.displayName && user.displayName.trim()) {
        source = user.displayName.trim();
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
 * @param {Object} user
 * @returns {Object}
 */
export function getUserAvatar(user) {
    if (!user) {
        return {
            type: "initials",
            initials: "U",
            backgroundColor: "#9CA3AF",
            color: "#FFFFFF",
            alt: "User avatar",
        };
    }

    if (user.photoURL) {
        return {
            type: "image",
            url: user.photoURL,
            alt: user.displayName || user.email || "User avatar",
        };
    }

    return {
        type: "initials",
        initials: getUserInitials(user),
        backgroundColor: getAvatarColor(user),
        color: "#FFFFFF",
        alt: `Avatar for ${user.displayName || user.email || "user"}`,
    };
}

/**
 * Generate consistent avatar color
 * @param {Object} user
 * @returns {string}
 */
function getAvatarColor(user) {
    const seed = (user.displayName || user.email || "user").toLowerCase();
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
 * @param {Object} user
 * @returns {string}
 */
export function getUserDisplayName(user) {
    if (!user) return "User";

    if (user.displayName?.trim()) {
        return user.displayName.trim();
    }

    if (user.email) {
        return user.email.split("@")[0];
    }

    return "User";
}
