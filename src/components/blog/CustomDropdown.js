"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CustomDropdown({
    value,
    onChange,
    options = [],
    placeholder = "Select option",
    minWidth = "180px",
}) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel =
        options.find((opt) => opt.value === value)?.label || placeholder;

    return (
        <div
            ref={dropdownRef}
            className="relative"
            style={{ minWidth }}
        >
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm
                   bg-white border border-gray-300 rounded-md
                   hover:border-gray-400
                   focus:outline-none focus:ring-2 focus:ring-orange-500
                   transition"
            >
                <span
                    className={`truncate ${value ? "text-gray-900" : "text-gray-400"
                        }`}
                >
                    {selectedLabel}
                </span>

                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200
                     bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1"
                >
                    {options.map((option) => {
                        const isSelected = option.value === value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm
                            hover:bg-gray-50 transition
                            ${isSelected
                                        ? "bg-orange-50 text-orange-600 font-medium"
                                        : "text-gray-700"
                                    }`}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
