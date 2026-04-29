import React from "react";

// ─── Icon paths ───────────────────────────────────────────────────────────────
const IC_CHECK_CIRCLE = "/icons/check-circle.svg";
const IC_CANCEL       = "/icons/cancel.svg";
const IC_WARNING_FILL = "/icons/warning-fill.svg";
const IC_INFO         = "/icons/info.svg";

// ─── Types ───────────────────────────────────────────────────────────────────

export type TagVariant = "green" | "red" | "yellow" | "blue";

export interface TagProps {
  variant?:   TagVariant;
  /** Pokazuje ikonę po lewej stronie labela */
  icon?:      boolean;
  /** Tekst tagu – domyślnie nazwa koloru */
  label?:     string;
  className?: string;
}

// ─── Variant config ───────────────────────────────────────────────────────────

const variantConfig: Record<TagVariant, {
  bg:        string;
  border:    string;
  text:      string;
  iconSrc:   string;
  iconColor: string;
  default:   string;
}> = {
  green: {
    bg:      "bg-[rgba(12,157,97,0.2)]",
    border:  "border-[#6BC497]",
    text:    "text-[#6BC497]",
    iconSrc: IC_CHECK_CIRCLE,
    iconColor: "#6BC497",
    default: "Green",
  },
  red: {
    bg:      "bg-[rgba(236,45,48,0.2)]",
    border:  "border-[#EB6F70]",
    text:    "text-[#EB6F70]",
    iconSrc: IC_CANCEL,
    iconColor: "#EB6F70",
    default: "Red",
  },
  yellow: {
    bg:      "bg-[rgba(254,155,14,0.2)]",
    border:  "border-[#FFC62B]",
    text:    "text-[#FFC62B]",
    iconSrc: IC_WARNING_FILL,
    iconColor: "#FFC62B",
    default: "Yellow",
  },
  blue: {
    bg:      "bg-[rgba(58,112,226,0.2)]",
    border:  "border-[#4BA1FF]",
    text:    "text-[#4BA1FF]",
    iconSrc: IC_INFO,
    iconColor: "#4BA1FF",
    default: "Blue",
  },
};

// ─── Tag ─────────────────────────────────────────────────────────────────────

export function Tag({
  variant   = "green",
  icon      = false,
  label,
  className = "",
}: TagProps) {
  const cfg  = variantConfig[variant];
  const text = label ?? cfg.default;

  return (
    <div
      className={[
        "inline-flex items-center justify-center gap-[2px]",
        "min-w-[52px] px-2 py-1",
        "border border-solid rounded-[4px]",
        cfg.bg,
        cfg.border,
        className,
      ].join(" ")}
    >
      {/* Icon (optional) */}
      {icon && (
        <span
          style={{
            display: "inline-block",
            flexShrink: 0,
            width: 12, height: 12,
            backgroundColor: cfg.iconColor,
            maskImage: `url('${cfg.iconSrc}')`,
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
          }}
        />
      )}

      {/* Label */}
      <span
        className={[
          "text-[12px] font-medium leading-[14px]",
          "font-['Inter',sans-serif] whitespace-nowrap",
          cfg.text,
        ].join(" ")}
      >
        {text}
      </span>
    </div>
  );
}

export default Tag;
