// src/app/blogs/[slug]/_components/SectionTitle.js

"use client";

export const SectionTitle = ({ children }) => (
    // text-xs for mobile, text-sm for larger screens
    <h3 className="font-bold mb-4 text-xs sm:text-sm">{children}</h3>
);
