"use client";

import { useState } from "react";
import { Facebook, Twitter, Linkedin, Link as LinkIcon } from "lucide-react";

const ShareDropdown = ({ url, title, excerpt, onClose }) => {
    const [copied, setCopied] = useState(false);

    const sharePost = (platform) => {
        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                url
            )}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                url
            )}&text=${encodeURIComponent(title)}`,
            linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                url
            )}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(excerpt)}`,
        };

        if (platform === "copy") {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                onClose();
            }, 2000);
            return;
        }

        window.open(shareUrls[platform], "_blank", "width=600,height=400");
        onClose();
    };

    return (
        <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-[#FFFFFF] rounded-xl shadow-lg z-50 p-3 border border-[#F5F1EB] animate-fade-in">
            <p className="text-sm font-semibold text-[#4A342E] mb-2 px-1">
                Share this article
            </p>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                <button
                    onClick={() => sharePost("facebook")}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F5F1EB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6B8E23]"
                >
                    <Facebook size={18} className="text-[#3b5998]" />
                    <span className="text-sm text-[#4A342E]">Facebook</span>
                </button>

                <button
                    onClick={() => sharePost("twitter")}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F5F1EB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6B8E23]"
                >
                    <Twitter size={18} className="text-[#1DA1F2]" />
                    <span className="text-sm text-[#4A342E]">Twitter</span>
                </button>

                <button
                    onClick={() => sharePost("linkedin")}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F5F1EB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6B8E23]"
                >
                    <Linkedin size={18} className="text-[#0077B5]" />
                    <span className="text-sm text-[#4A342E]">LinkedIn</span>
                </button>

                <button
                    onClick={() => sharePost("copy")}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F5F1EB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6B8E23] relative"
                >
                    <LinkIcon size={18} className="text-[#6B5E55]" />
                    <span className="text-sm text-[#4A342E]">
                        {copied ? "Copied!" : "Copy Link"}
                    </span>
                    {copied && (
                        <span className="absolute -top-1 -right-1 bg-[#6B8E23] text-white text-xs px-1 py-0.5 rounded-full animate-pulse">
                            ✓
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ShareDropdown;
