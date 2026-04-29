import React, { useState, useRef, useEffect } from "react";
import { Checkbox } from "./Checkbox";

// ─── Icon paths ───────────────────────────────────────────────────────────────
const IC_ARROW_DOWN = "/icons/arrow-down.svg";
const IC_ARROW_UP   = "/icons/arrow-up.svg";
const IC_CLOSE      = "/icons/close.svg";

function FDIcon({ src, size = 16, color = "#9A999A" }: { src: string; size?: number; color?: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        flexShrink: 0,
        width: size, height: size,
        backgroundColor: color,
        maskImage: `url('${src}')`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
      }}
    />
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterOption {
  value:    string;
  label:    string;
}

export interface FilterDropdownProps {
  options:       FilterOption[];
  value?:        string[];           // multi-select – array of selected values
  onChange?:     (value: string[]) => void;
  label?:        string;
  optional?:     boolean;
  placeholder?:  string;
  disabled?:     boolean;
  className?:    string;
}

// ─── Arrow icon ───────────────────────────────────────────────────────────────

function ArrowIcon({ open }: { open: boolean }) {
  return <FDIcon src={open ? IC_ARROW_UP : IC_ARROW_DOWN} />;
}

// ─── Close icon ───────────────────────────────────────────────────────────────

function CloseIcon() {
  return <FDIcon src={IC_CLOSE} />;
}

// ─── FilterItem ───────────────────────────────────────────────────────────────

export interface FilterItemProps {
  label:      string;
  checked:    boolean;
  onChange:   (checked: boolean) => void;
  className?: string;
}

export function FilterItem({ label, checked, onChange, className = "" }: FilterItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const bg = isHovered ? "bg-[#101517]" : "bg-[#0D1112]";

  // Checkbox state from Figma:
  // default unchecked → Default
  // hover unchecked   → Hover (blue tinted border)
  // checked           → Active (blue filled)
  const checkboxState = checked ? "active" : isHovered ? "hover" : "default";

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={[
        "w-full flex items-center gap-[10px] px-3 py-[10px] text-left",
        "transition-colors duration-100 cursor-pointer",
        bg,
        className,
      ].join(" ")}
    >
      {/* Inline checkbox visual matching Figma exactly */}
      <div className="relative shrink-0 size-[20px]">
        {checked ? (
          // Active state – blue filled
          <div className="absolute inset-0 border border-[#3A70E2] border-solid rounded-[4px]">
            <div className="absolute inset-[10%] bg-[#3A70E2] rounded-[2px] flex items-center justify-center">
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                <path d="M3 8L6.5 11.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        ) : isHovered ? (
          // Hover state – blue tinted
          <div className="absolute inset-0 bg-[rgba(58,112,226,0.25)] border border-[#93C8FF] border-solid rounded-[4px]" />
        ) : (
          // Default state – grey border
          <div className="absolute inset-0 border border-[#9A999A] border-solid rounded-[4px]" />
        )}
      </div>

      <span
        className={[
          "flex-1 min-w-0 text-[14px] font-normal leading-[16px]",
          "font-['Inter',sans-serif] truncate",
          checked ? "text-[#4BA1FF]" : "text-white",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  );
}

// ─── FilterDropdown ───────────────────────────────────────────────────────────

export function FilterDropdown({
  options,
  value       = [],
  onChange,
  label,
  optional    = false,
  placeholder = "Filters",
  disabled    = false,
  className   = "",
}: FilterDropdownProps) {
  const [isOpen, setIsOpen]       = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef              = useRef<HTMLDivElement>(null);

  const hasSelection  = value.length > 0;

  // Selected label to display (first selected, or count if multiple)
  const selectedLabel =
    value.length === 1
      ? options.find(o => o.value === value[0])?.label ?? value[0]
      : value.length > 1
        ? `${value.length} selected`
        : null;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  function toggleOption(optValue: string) {
    const next = value.includes(optValue)
      ? value.filter(v => v !== optValue)
      : [...value, optValue];
    onChange?.(next);
  }

  function clearSelection(e: React.MouseEvent) {
    e.stopPropagation();
    onChange?.([]);
  }

  // Border colour
  const borderColor =
    disabled    ? "#161D20"
    : isOpen     ? "#3A70E2"
    : isHovered  ? "#232E33"
    : "#161D20";

  return (
    <div
      ref={containerRef}
      className={`flex flex-col gap-1 items-start w-full relative ${className}`}
    >
      {/* Label */}
      {(label || optional) && (
        <div className="flex gap-1 items-center px-1">
          {label && (
            <span className={`text-[12px] font-normal leading-[14px] font-['Inter',sans-serif] ${disabled ? "text-[#555455]" : "text-white"}`}>
              {label}
            </span>
          )}
          {optional && (
            <span className="text-[12px] font-normal leading-[14px] font-['Inter',sans-serif] text-[#9A999A]">
              (optional)
            </span>
          )}
        </div>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(v => !v)}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={[
          "w-full flex items-center justify-between px-3 py-3",
          "bg-[#0D1112] border border-solid rounded-[4px]",
          "transition-colors duration-150 outline-none",
          disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
        style={{ borderColor }}
      >
        {/* Label / placeholder */}
        <span
          className={[
            "flex-1 min-w-0 text-[14px] font-normal leading-[16px]",
            "font-['Inter',sans-serif] truncate text-left",
            hasSelection ? "text-[#4BA1FF]" : "text-[#9A999A]",
          ].join(" ")}
        >
          {selectedLabel ?? placeholder}
        </span>

        {/* Clear button (selected state) OR arrow */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {hasSelection && !isOpen ? (
            <button
              type="button"
              onClick={clearSelection}
              className="flex items-center justify-center hover:opacity-70 transition-opacity"
              title="Clear selection"
            >
              <CloseIcon />
            </button>
          ) : (
            <ArrowIcon open={isOpen} />
          )}
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-0"
          style={{
            border: "1px solid #161D20",
            borderRadius: "4px",
            backgroundColor: "#0D1112",
            boxShadow: "0px 4px 10px 0px rgba(22,29,32,0.15)",
            overflow: "hidden",
          }}
        >
          {options.map(opt => (
            <FilterItem
              key={opt.value}
              label={opt.label}
              checked={value.includes(opt.value)}
              onChange={() => toggleOption(opt.value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FilterDropdown;
