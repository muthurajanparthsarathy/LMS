import { useState, useRef, useEffect, ElementType } from "react";
import { motion, AnimatePresence } from "framer-motion";

/** ───────── Types ───────── */
export type MultiSelectOption = {
    color: string;
    value: string;
    label: string;
    /** optional Lucide‑React (or any) icon component */
    icon?: ElementType;
};

interface MultiSelectProps {
    options: MultiSelectOption[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
}

export default function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select…",
    className = "",
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // ⏹️ Close when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!wrapperRef.current?.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const toggleOption = (value: string) =>
        onChange(
            selected.includes(value)
                ? selected.filter((v) => v !== value)
                : [...selected, value]
        );

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            {/* ───── Trigger ───── */}
            <button
                type="button"
                onClick={() => setIsOpen((o) => !o)}
                className="flex items-center cursor-pointer justify-between w-full px-3 py-1.5 border border-gray-250 rounded-md bg-none text-sm h-8 transition-colors"
            >
                <span className="truncate text-gray-500 text-xs sm:text-xs">
                    {selected.length
                        ? selected
                            .map((v) => options.find((o) => o.value === v)?.label)
                            .join(", ")
                        : placeholder}
                </span>

                <div
                    className={`flex items-center justify-center h-4 w-4 transform transition-transform ${isOpen ? "rotate-180" : ""}`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 320 512"
                        className="w-4 h-4 fill-gray-500"
                    >
                        <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z" />
                    </svg>
                </div>

            </button>

            {/* ───── Dropdown with animation ───── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scaleY: 0.95 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        style={{ originY: 0 }}
                        className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg py-1"
                    >
                        {options.map((option) => {
                            const Icon = option.icon;               // may be undefined

                            return (
                                <motion.div
                                    key={option.value}
                                    whileTap={{ scale: 0.97 }}
                                    /* flex + justify‑between gives us: 
                                       [checkbox]  [label…(flex‑1)]   [icon / placeholder] */
                                    className="flex items-center justify-between w-full
                 px-3 py-1.5 text-xs hover:bg-gray-100
                 cursor-pointer select-none"
                                    onClick={() => toggleOption(option.value)}
                                >
                                    {/* checkbox */}
                                    <input
                                        type="checkbox"
                                        readOnly
                                        checked={selected.includes(option.value)}
                                        className="h-3 w-3 rounded border-gray-300 text-indigo-600
                   focus:ring-indigo-500 mr-2"
                                    />

                                    {/* label */}
                                    <span className="flex-1 truncate">{option.label}</span>

                                    {/* icon (or placeholder to keep alignment) */}
                                    {Icon ? (
                                        <Icon className={`h-3.5 w-3.5 ml-auto ${option.color ?? "text-gray-500"}`} />
                                    ) : (
                                        <span className="w-3.5 h-3.5 ml-auto" />
                                    )}

                                </motion.div>
                            );
                        })}

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
