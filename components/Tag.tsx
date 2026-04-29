import React from "react";

// ─── Icon asset URLs (12×12 ikony z Figma) ───────────────────────────────────
const imgCheckCircle  = "http://localhost:3845/assets/6a9f704a838ecc5d20fffc9b180280c7678e5482.svg"; // Green – check circle
const imgCancel       = "http://localhost:3845/assets/cf6cdb669c750066dfe5980fdd17f077635f570d.svg"; // Red   – cancel / X
const imgWarningFill  = "http://localhost:3845/assets/9e11da0cda266152fd4084774e9c22c554dd979f.svg"; // Yellow – warning triangle
const imgInfo         = "http://localhost:3845/assets/db7dc920e147adb371f981c98e4cbf5643022bae.svg"; // Blue  – info

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
  bg:      string;
  border:  string;
  text:    string;
  iconSrc: string;
  default: string;
}> = {
  green: {
    bg:      "bg-[rgba(12,157,97,0.2)]",
    border:  "border-[#6BC497]",
    text:    "text-[#6BC497]",
    iconSrc: imgCheckCircle,
    default: "Green",
  },
  red: {
    bg:      "bg-[rgba(236,45,48,0.2)]",
    border:  "border-[#EB6F70]",
    text:    "text-[#EB6F70]",
    iconSrc: imgCancel,
    default: "Red",
  },
  yellow: {
    bg:      "bg-[rgba(254,155,14,0.2)]",
    border:  "border-[#FFC62B]",
    text:    "text-[#FFC62B]",
    iconSrc: imgWarningFill,
    default: "Yellow",
  },
  blue: {
    bg:      "bg-[rgba(58,112,226,0.2)]",
    border:  "border-[#4BA1FF]",
    text:    "text-[#4BA1FF]",
    iconSrc: imgInfo,
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
        <div className="relative shrink-0 size-[12px]">
          <img
            alt=""
            className="absolute block inset-0 max-w-none size-full"
            src={cfg.iconSrc}
          />
        </div>
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
