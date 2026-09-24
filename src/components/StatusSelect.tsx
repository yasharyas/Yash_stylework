"use client";

import { useEffect, useRef, useState } from "react";
import { LeadStatus, LEAD_STATUSES } from "@/lib/database.types";

const DOT: Record<LeadStatus, string> = {
  new: "bg-blue-500",
  contacted: "bg-amber-500",
  qualified: "bg-violet-500",
  disqualified: "bg-gray-400",
  converted: "bg-emerald-500",
};

export function StatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: LeadStatus;
  onChange: (status: LeadStatus) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => LEAD_STATUSES.indexOf(value));
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function select(status: LeadStatus) {
    onChange(status);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(LEAD_STATUSES.indexOf(value));
      return;
    }
    if (open) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, LEAD_STATUSES.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        select(LEAD_STATUSES[activeIndex]);
      }
    }
  }

  return (
    <div ref={rootRef} className="relative inline-block" onKeyDown={onKeyDown}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setActiveIndex(LEAD_STATUSES.indexOf(value));
          setOpen((o) => !o);
        }}
        className="flex min-w-[9rem] items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-2.5 text-sm font-medium text-gray-900 capitalize hover:border-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 disabled:opacity-50"
      >
        <span className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${DOT[value]}`} />
          {value}
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          tabIndex={-1}
          className="absolute z-10 mt-1.5 w-full min-w-[9rem] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {LEAD_STATUSES.map((status, i) => (
            <li
              key={status}
              role="option"
              aria-selected={status === value}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => select(status)}
              className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm capitalize ${
                i === activeIndex ? "bg-gray-50" : ""
              }`}
            >
              <span className="flex items-center gap-2 text-gray-900">
                <span className={`h-2 w-2 rounded-full ${DOT[status]}`} />
                {status}
              </span>
              {status === value && (
                <svg className="h-4 w-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
