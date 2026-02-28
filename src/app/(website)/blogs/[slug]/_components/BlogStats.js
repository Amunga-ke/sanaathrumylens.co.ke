//src/app/blogs/[slug]/_components/BlogStats.js

"use client";
import { Eye, Heart, MessageCircle } from "lucide-react";

const StoryMeta = ({ views, likes, comments, iconSize = 12, textSize = "text-xs" }) => (
    <div className={`flex items-center gap-3 text-gray-500 ${textSize}`}>
        <span className="flex items-center gap-1">
            <Eye size={iconSize} /> {views}
        </span>
        <span className="flex items-center gap-1">
            <Heart size={iconSize} /> {likes}
        </span>
        <span className="flex items-center gap-1">
            <MessageCircle size={iconSize} /> {comments}
        </span>
    </div>
);

export default StoryMeta;