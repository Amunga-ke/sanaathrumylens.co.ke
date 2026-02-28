import React from 'react'

export const IconButton = ({ children, onClick, active, label, className = "" }) => (
    <button
        onClick={onClick}
        aria-label={label}
        className={`p-2.5 rounded-lg border transition
      ${active
                ? "bg-gray-900 border-gray-900 text-white"
                : "border-gray-300 hover:bg-gray-50"
            }
      ${className}`}
    >
        {children}
    </button>
);
