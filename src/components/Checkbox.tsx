import React, { useState } from "react";

// ─── Icon paths ───────────────────────────────────────────────────────────────
const IC_CHECK = "/icons/check.svg";
const IC_MINUS = "/icons/minus.svg";

// ─── Types ────────────────────────────────────────────────────────────────────

type CheckboxState = "default" | "hover" | "active" | "disabled" | "active-disabled";

export interface CheckboxProps {
  /** Czy checkbox jest zaznaczony */
  checked?: boolean;
  /** Stan indeterminate (minus) */
  indeterminate?: boolean;
  /** Label obok checkboxa */
  label?: string;
  /** Czy disabled */
  disabled?: boolean;
  /** Callback przy zmianie */
  onChange?: (checked: boolean) => void;
  className?: string;
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────

export function Checkbox({
  checked      = false,
  indeterminate = false,
  label,
  disabled     = false,
  onChange,
  className    = "",
}: CheckboxProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine visual state
  const state: CheckboxState =
    disabled && checked        ? "active-disabled"
    : disabled                 ? "disabled"
    : checked || indeterminate ? "active"
    : isHovered                ? "hover"
    : "default";

  function handleClick() {
    if (!disabled) onChange?.(!checked);
  }

  // ── Box styles ──────────────────────────────────────────────────────────────

  const boxBase = "relative shrink-0 size-[20px] rounded-[4px] border transition-colors duration-150";

  const boxStyles: Record<CheckboxState, string> = {
    default:        `${boxBase} border-[#9A999A] bg-transparent`,
    hover:          `${boxBase} border-[#93C8FF] bg-[rgba(58,112,226,0.25)]`,
    active:         `${boxBase} border-[#3A70E2] bg-transparent`,
    disabled:       `${boxBase} border-[#555455] bg-transparent`,
    "active-disabled": `${boxBase} border-[#555455] bg-transparent`,
  };

  // ── Inner fill (for active states) ─────────────────────────────────────────

  const fillColor =
    state === "active-disabled" ? "#555455"
    : state === "active"        ? "#3A70E2"
    : null;

  // ── Icon inside the box ────────────────────────────────────────────────────

  function BoxIcon() {
    if (state === "disabled" || state === "default" || state === "hover") return null;

    const iconSrc     = indeterminate ? IC_MINUS : IC_CHECK;
    const iconColor   = state === "active-disabled" ? "#555455" : "#ffffff";

    return (
      <div
        className="absolute inset-[10%] flex items-center justify-center rounded-[2px]"
        style={{ backgroundColor: fillColor ?? "transparent" }}
      >
        <span
          style={{
            display: "inline-block",
            width: 16, height: 16,
            backgroundColor: iconColor,
            maskImage: `url('${iconSrc}')`,
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
          }}
        />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const isInteractive = !disabled;
  const Tag = isInteractive ? "button" : "div";

  return (
    <Tag
      {...(isInteractive
        ? {
            type:           "button" as const,
            onClick:        handleClick,
            onMouseEnter:   () => setIsHovered(true),
            onMouseLeave:   () => setIsHovered(false),
            "aria-checked": indeterminate ? ("mixed" as const) : checked,
            role:           "checkbox",
          }
        : { "aria-disabled": true, "aria-checked": indeterminate ? ("mixed" as const) : checked }
      )}
      className={[
        "inline-flex items-center gap-[4px]",
        isInteractive ? "cursor-pointer" : "cursor-not-allowed",
        className,
      ].join(" ")}
    >
      {/* Box */}
      <div className={boxStyles[state]}>
        <BoxIcon />
      </div>

      {/* Label */}
      {label && (
        <span
          className={[
            "text-[14px] font-normal leading-[16px] font-['Inter',sans-serif] whitespace-nowrap select-none",
            state === "disabled" || state === "active-disabled"
              ? "text-[#555455]"
              : "text-white",
          ].join(" ")}
        >
          {label}
        </span>
      )}
    </Tag>
  );
}

// ─── CheckboxGroup (convenience wrapper) ──────────────────────────────────────

export interface CheckboxGroupOption {
  value:        string;
  label:        string;
  disabled?:    boolean;
}

interface CheckboxGroupProps {
  options:    CheckboxGroupOption[];
  value?:     string[];
  onChange?:  (value: string[]) => void;
  className?: string;
}

export function CheckboxGroup({
  options,
  value    = [],
  onChange,
  className = "",
}: CheckboxGroupProps) {
  function toggle(optValue: string) {
    const next = value.includes(optValue)
      ? value.filter(v => v !== optValue)
      : [...value, optValue];
    onChange?.(next);
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {options.map(opt => (
        <Checkbox
          key={opt.value}
          label={opt.label}
          checked={value.includes(opt.value)}
          disabled={opt.disabled}
          onChange={() => toggle(opt.value)}
        />
      ))}
    </div>
  );
}

export default Checkbox;
