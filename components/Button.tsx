import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "warning" | "danger" | "info";
type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  ghost?:     boolean;
  outline?:   boolean;
  loading?:   boolean;
  iconLeft?:  React.ReactNode;
  iconRight?: React.ReactNode;
  iconOnly?:  React.ReactNode;
  children?:  React.ReactNode;
}

// ─── Style Maps ───────────────────────────────────────────────────────────────

const variantStyles: Record<ButtonVariant, {
  filled:  string;
  ghost:   string;
  outline: string;
}> = {
  primary: {
    filled:  "bg-[#0C9D61] text-white hover:bg-[#097A4B] focus:ring-[#76FFAE]/40 active:bg-[#065736]",
    ghost:   "bg-transparent text-[#76FFAE] hover:bg-[#76FFAE]/10 focus:ring-[#76FFAE]/40",
    outline: "bg-transparent border border-[#0C9D61] text-[#76FFAE] hover:bg-[#0C9D61]/10 focus:ring-[#76FFAE]/40",
  },
  secondary: {
    filled:  "bg-[#232E33] text-[#C1CFD6] hover:bg-[#2D3A40] focus:ring-[#465C66]/40 active:bg-[#1A2329]",
    ghost:   "bg-transparent text-[#93ACB8] hover:bg-[#232E33]/60 focus:ring-[#465C66]/40",
    outline: "bg-transparent border border-[#465C66] text-[#93ACB8] hover:bg-[#232E33]/60 focus:ring-[#465C66]/40",
  },
  warning: {
    filled:  "bg-[#FE9B0E] text-[#0A0D0E] hover:bg-[#FFAD0D] focus:ring-[#FFC62B]/40 active:bg-[#C7770B]",
    ghost:   "bg-transparent text-[#FFC62B] hover:bg-[#FFC62B]/10 focus:ring-[#FFC62B]/40",
    outline: "bg-transparent border border-[#FE9B0E] text-[#FFC62B] hover:bg-[#FE9B0E]/10 focus:ring-[#FFC62B]/40",
  },
  danger: {
    filled:  "bg-[#EC2D30] text-white hover:bg-[#F64C4C] focus:ring-[#EB6F70]/40 active:bg-[#B72224]",
    ghost:   "bg-transparent text-[#EB6F70] hover:bg-[#EB6F70]/10 focus:ring-[#EB6F70]/40",
    outline: "bg-transparent border border-[#EC2D30] text-[#EB6F70] hover:bg-[#EC2D30]/10 focus:ring-[#EB6F70]/40",
  },
  info: {
    filled:  "bg-[#3B82F6] text-white hover:bg-[#4BA1FF] focus:ring-[#93C8FF]/40 active:bg-[#2D57B0]",
    ghost:   "bg-transparent text-[#4BA1FF] hover:bg-[#4BA1FF]/10 focus:ring-[#4BA1FF]/40",
    outline: "bg-transparent border border-[#3B82F6] text-[#4BA1FF] hover:bg-[#3B82F6]/10 focus:ring-[#4BA1FF]/40",
  },
};

const sizeStyles: Record<ButtonSize, {
  base:     string;
  iconOnly: string;
  text:     string;
  icon:     string;
  spinner:  string;
}> = {
  sm: {
    base:     "h-8 px-4 gap-1.5 rounded",
    iconOnly: "h-8 w-8 p-0 rounded",
    text:     "text-[14px] leading-[20px] font-semibold",
    icon:     "w-4 h-4",
    spinner:  "w-3.5 h-3.5",
  },
  md: {
    base:     "h-10 px-5 gap-2 rounded",
    iconOnly: "h-10 w-10 p-0 rounded",
    text:     "text-[16px] leading-[24px] font-semibold",
    icon:     "w-4 h-4",
    spinner:  "w-4 h-4",
  },
  lg: {
    base:     "h-12 px-6 gap-2 rounded",
    iconOnly: "h-12 w-12 p-0 rounded",
    text:     "text-[18px] leading-[28px] font-semibold",
    icon:     "w-5 h-5",
    spinner:  "w-5 h-5",
  },
};

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className ?? ""}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────

export function Button({
  variant  = "primary",
  size     = "md",
  ghost    = false,
  outline  = false,
  loading  = false,
  iconLeft,
  iconRight,
  iconOnly,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Pick the right style mode
  const colorStyle = ghost
    ? variantStyles[variant].ghost
    : outline
      ? variantStyles[variant].outline
      : variantStyles[variant].filled;

  const sizes = sizeStyles[size];
  const isIconOnly = !!iconOnly && !children;

  return (
    <button
      disabled={isDisabled}
      aria-busy={loading}
      className={[
        // Layout
        "inline-flex items-center justify-center shrink-0 select-none",
        "font-['Inter',sans-serif]",
        // Sizing
        isIconOnly ? sizes.iconOnly : sizes.base,
        sizes.text,
        // Colors
        colorStyle,
        // Focus ring
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0D0E]",
        // Transition
        "transition-colors duration-150 ease-in-out",
        // Disabled
        isDisabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading ? (
        // Loading state – spinner replaces everything
        <Spinner className={sizes.spinner} />
      ) : isIconOnly ? (
        // Icon-only
        <span className={`flex items-center justify-center ${sizes.icon}`}>
          {iconOnly}
        </span>
      ) : (
        // Normal: optional left icon + text + optional right icon
        <>
          {iconLeft && (
            <span className={`flex items-center justify-center ${sizes.icon}`}>
              {iconLeft}
            </span>
          )}
          <span>{children}</span>
          {iconRight && (
            <span className={`flex items-center justify-center ${sizes.icon}`}>
              {iconRight}
            </span>
          )}
        </>
      )}
    </button>
  );
}

export default Button;
