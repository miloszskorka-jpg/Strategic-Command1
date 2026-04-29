import React, { useState, useRef, useEffect, ReactNode } from "react";

// ─── Icon paths ───────────────────────────────────────────────────────────────
const IC_ARROW_DOWN = "/icons/arrow-down.svg";
const IC_ARROW_UP   = "/icons/arrow-up.svg";
const IC_CANCEL     = "/icons/cancel.svg";
const IC_CHECK      = "/icons/check-circle.svg";

function DDIcon({ src, size = 16, color = "#9A999A" }: { src: string; size?: number; color?: string }) {
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

export type DropdownStatus = "default" | "error" | "success";

export interface DropdownOption {
  value:     string;
  label:     string;
  disabled?: boolean;
}

export interface DropdownProps {
  options:      DropdownOption[];
  value?:       string;
  onChange?:    (value: string) => void;
  label?:       string;
  optional?:    boolean;
  placeholder?: string;
  status?:      DropdownStatus;
  disabled?:    boolean;
  className?:   string;
  id?:          string;
}

// ─── Status icon ──────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: DropdownStatus }) {
  if (status === "default") return null;
  return (
    <DDIcon
      src={status === "error" ? IC_CANCEL : IC_CHECK}
      color={status === "error" ? "#F64C4C" : "#6BC497"}
      size={16}
    />
  );
}

// ─── Arrow icon ───────────────────────────────────────────────────────────────

function ArrowIcon({ open }: { open: boolean }) {
  return <DDIcon src={open ? IC_ARROW_UP : IC_ARROW_DOWN} />;
}

// ─── Dropdown Item ────────────────────────────────────────────────────────────

interface DropdownItemProps {
  label:      string;
  isSelected: boolean;
  isHovered:  boolean;
  disabled?:  boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick:    () => void;
}

function DropdownItemEl({
  label, isSelected, isHovered, disabled,
  onMouseEnter, onMouseLeave, onClick,
}: DropdownItemProps) {
  const bg =
    disabled    ? "bg-[#0D1112] opacity-40 cursor-not-allowed"
    : isSelected ? "bg-[#161D20] cursor-pointer"
    : isHovered  ? "bg-[#101517] cursor-pointer"
    : "bg-[#0D1112] cursor-pointer";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={[
        "w-full flex items-center justify-between px-3 py-3 text-left",
        "transition-colors duration-100",
        bg,
      ].join(" ")}
    >
      <span
        className={[
          "flex-1 min-w-0 text-[14px] font-normal leading-[16px]",
          "font-['Inter',sans-serif] truncate",
          disabled ? "text-[#555455]" : isSelected ? "text-[#76FFAE]" : "text-white",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  );
}

// ─── Dropdown ────────────────────────────────────────────────────────────────

export function Dropdown({
  options,
  value,
  onChange,
  label,
  optional    = false,
  placeholder = "Dropdown",
  status      = "default",
  disabled    = false,
  className   = "",
  id,
}: DropdownProps) {
  const [isOpen, setIsOpen]         = useState(false);
  const [isHovered, setIsHovered]   = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef                = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);

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

  // Border colour logic from Figma
  const borderColor =
    disabled                           ? "#161D20"
    : status === "error"               ? "#F64C4C"
    : status === "success"             ? "#6BC497"
    : isOpen                           ? "#3A70E2"
    : isHovered                        ? "#232E33"
    : "#161D20";

  const menuBorderColor =
    status === "error"   ? "#F64C4C"
    : status === "success" ? "#6BC497"
    : "#3A70E2";

  function handleSelect(opt: DropdownOption) {
    if (opt.disabled) return;
    onChange?.(opt.value);
    setIsOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIsOpen(v => !v); }
    if (e.key === "Escape") setIsOpen(false);
    if (e.key === "ArrowDown" && isOpen) {
      const next = hoveredIdx === null ? 0 : Math.min(hoveredIdx + 1, options.length - 1);
      setHoveredIdx(next);
    }
    if (e.key === "ArrowUp" && isOpen) {
      const prev = hoveredIdx === null ? options.length - 1 : Math.max(hoveredIdx - 1, 0);
      setHoveredIdx(prev);
    }
  }

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
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(v => !v)}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={[
          "w-full flex items-center justify-between px-3 py-3",
          "bg-[#0D1112] border border-solid rounded-[4px]",
          "transition-colors duration-150 outline-none",
          disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
        style={{ borderColor }}
      >
        {/* Selected / placeholder text */}
        <span
          className={[
            "flex-1 min-w-0 text-[14px] font-normal leading-[16px]",
            "font-['Inter',sans-serif] truncate text-left",
            selected ? "text-white" : "text-[#9A999A]",
          ].join(" ")}
        >
          {selected ? selected.label : placeholder}
        </span>

        {/* Status icon + arrow */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <StatusIcon status={status} />
          <ArrowIcon open={isOpen} />
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-0"
          style={{
            border: `1px solid ${menuBorderColor}`,
            borderRadius: "4px",
            backgroundColor: "#0D1112",
            boxShadow: "0px 4px 10px 0px rgba(22,29,32,0.15)",
            overflow: "hidden",
          }}
        >
          {options.map((opt, i) => (
            <DropdownItemEl
              key={opt.value}
              label={opt.label}
              isSelected={opt.value === value}
              isHovered={i === hoveredIdx}
              disabled={opt.disabled}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => handleSelect(opt)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DropdownItem (standalone, for use in menus/context menus) ────────────────

export interface DropdownItemStandaloneProps {
  label:      string;
  onClick?:   () => void;
  selected?:  boolean;
  disabled?:  boolean;
  icon?:      ReactNode;
  className?: string;
}

export function DropdownItem({
  label,
  onClick,
  selected  = false,
  disabled  = false,
  icon,
  className = "",
}: DropdownItemStandaloneProps) {
  const [isHovered, setIsHovered] = useState(false);

  const bg =
    disabled    ? "opacity-40 cursor-not-allowed"
    : selected   ? "bg-[#161D20]"
    : isHovered  ? "bg-[#101517]"
    : "bg-[#0D1112]";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={[
        "w-full flex items-center justify-between px-3 py-3 text-left",
        "transition-colors duration-100",
        "bg-[#0D1112]",
        bg,
        disabled ? "" : "cursor-pointer",
        className,
      ].join(" ")}
    >
      {icon && (
        <span className="shrink-0 mr-2 flex items-center">{icon}</span>
      )}
      <span
        className={[
          "flex-1 min-w-0 text-[14px] font-normal leading-[16px]",
          "font-['Inter',sans-serif] truncate",
          selected ? "text-[#76FFAE]" : "text-white",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  );
}

// ─── DropdownMenu (standalone list, e.g. context menu) ───────────────────────

export interface DropdownMenuProps {
  options:    DropdownOption[];
  value?:     string;
  onSelect?:  (value: string) => void;
  className?: string;
}

export function DropdownMenu({ options, value, onSelect, className = "" }: DropdownMenuProps) {
  return (
    <div
      className={[
        "flex flex-col border border-[#161D20] rounded-[4px] overflow-hidden",
        "bg-[#0D1112]",
        "shadow-[0px_4px_10px_0px_rgba(22,29,32,0.15)]",
        className,
      ].join(" ")}
    >
      {options.map(opt => (
        <DropdownItem
          key={opt.value}
          label={opt.label}
          selected={opt.value === value}
          disabled={opt.disabled}
          onClick={() => !opt.disabled && onSelect?.(opt.value)}
        />
      ))}
    </div>
  );
}

export default Dropdown;
