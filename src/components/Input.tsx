import React, { useState, useRef, KeyboardEvent, ReactNode } from "react";

// ─── Icon paths ───────────────────────────────────────────────────────────────
const IC_SEARCH = "/icons/search.svg";
const IC_CANCEL = "/icons/cancel.svg";
const IC_CHECK  = "/icons/check-circle.svg";

function InputIcon({ src, color = "#9A999A" }: { src: string; color?: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        flexShrink: 0,
        width: 16, height: 16,
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

export type InputStatus = "default" | "error" | "success";

export interface InputProps {
  label?:         string;
  optional?:      boolean;
  placeholder?:   string;
  helperText?:    string;
  maxLength?:     number;
  status?:        InputStatus;
  disabled?:      boolean;
  showIcon?:      boolean;
  icon?:          ReactNode;
  value?:         string;
  onChange?:      (value: string) => void;
  onFocus?:       () => void;
  onBlur?:        () => void;
  className?:     string;
  id?:            string;
}

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig = {
  default: {
    border:       "border-[#161D20]",
    borderActive: "border-[#3A70E2]",
    helperColor:  "text-[#9A999A]",
    iconEl:       <InputIcon src={IC_SEARCH} color="#9A999A" />,
  },
  error: {
    border:       "border-[#F64C4C]",
    borderActive: "border-[#F64C4C]",
    helperColor:  "text-[#F64C4C]",
    iconEl:       <InputIcon src={IC_CANCEL} color="#F64C4C" />,
  },
  success: {
    border:       "border-[#6BC497]",
    borderActive: "border-[#6BC497]",
    helperColor:  "text-[#9A999A]",
    iconEl:       <InputIcon src={IC_CHECK} color="#6BC497" />,
  },
};

// ─── Input ────────────────────────────────────────────────────────────────────

export function Input({
  label,
  optional      = false,
  placeholder   = "Placeholder",
  helperText,
  maxLength,
  status        = "default",
  disabled      = false,
  showIcon      = true,
  icon,
  value         = "",
  onChange,
  onFocus,
  onBlur,
  className     = "",
  id,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cfg = statusConfig[status];

  // Border logic:
  // default idle   → #161D20
  // hover          → slightly brighter (secondary-600)
  // active/focused → blue (or status color)
  // error          → always red
  // success        → always green
  const borderClass =
    disabled      ? "border-[#161D20]"
    : isFocused   ? cfg.borderActive
    : isHovered   ? "border-[#232E33]"
    : cfg.border;

  const bgClass     = disabled ? "bg-[#0D1112] opacity-40" : "bg-[#0D1112]";

  return (
    <div className={`flex flex-col gap-1 items-start w-full ${className}`}>

      {/* Label row */}
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

      {/* Input field */}
      <div
        className={[
          "flex items-center justify-between p-3 w-full",
          "border border-solid rounded-[4px] transition-colors duration-150",
          bgClass,
          borderClass,
        ].join(" ")}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <input
          id={id}
          type="text"
          disabled={disabled}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={e => onChange?.(e.target.value)}
          onFocus={() => { setIsFocused(true); onFocus?.(); }}
          onBlur={() => { setIsFocused(false); onBlur?.(); }}
          className={[
            "flex-1 min-w-0 bg-transparent outline-none",
            "text-[14px] font-normal leading-[16px] font-['Inter',sans-serif]",
            "placeholder:text-[#9A999A]",
            disabled ? "text-[#555455] cursor-not-allowed" : "text-white",
          ].join(" ")}
        />
        {/* Icon */}
        {showIcon && !disabled && (icon ?? cfg.iconEl)}
        {showIcon && disabled && (
          <span className="opacity-40">
            <InputIcon src={IC_SEARCH} color="#9A999A" />
          </span>
        )}
      </div>

      {/* Helper + counter row */}
      {(helperText || maxLength) && (
        <div className={`flex items-center justify-between px-1 w-full ${cfg.helperColor}`}>
          {helperText && (
            <span className="text-[12px] font-normal leading-[14px] font-['Inter',sans-serif]">
              {helperText}
            </span>
          )}
          {maxLength && (
            <span className="text-[12px] font-normal leading-[14px] font-['Inter',sans-serif] ml-auto">
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── InputCode (single OTP digit cell) ───────────────────────────────────────

export type InputCodeStatus = "default" | "error" | "success";
export type InputCodeState  = "default" | "hover" | "typing" | "filled" | "disabled";

interface InputCodeCellProps {
  value?:     string;
  state?:     InputCodeState;
  status?:    InputCodeStatus;
  onChange?:  (value: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  inputRef?:  React.Ref<HTMLInputElement>;
  className?: string;
}

function InputCodeCell({
  value     = "",
  state     = "default",
  status    = "default",
  onChange,
  onKeyDown,
  inputRef,
  className = "",
}: InputCodeCellProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Border colours from Figma
  const borderClass =
    state === "disabled"                          ? "border-[#161D20] opacity-40"
    : status === "error" && state === "filled"   ? "border-[#F64C4C]"
    : status === "success" && state === "filled" ? "border-[#6BC497]"
    : state === "typing"                         ? "border-[#3A70E2]"
    : isHovered                                  ? "border-[#232E33]"
    : "border-[#161D20]";

  const textColor =
    state === "typing" || state === "filled" ? "text-white" : "text-[#9A999A]";

  return (
    <div
      className={[
        "relative bg-[#0D1112] border border-solid rounded-[4px]",
        "flex items-center justify-center",
        "w-[36px] h-[40px]",
        "transition-colors duration-150",
        borderClass,
        className,
      ].join(" ")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={1}
        disabled={state === "disabled"}
        value={value}
        onChange={e => {
          const v = e.target.value.replace(/[^0-9]/g, "").slice(-1);
          onChange?.(v);
        }}
        onKeyDown={onKeyDown}
        className={[
          "w-[10px] bg-transparent outline-none text-center",
          "text-[14px] font-normal leading-[16px] font-['Inter',sans-serif]",
          textColor,
          state === "disabled" ? "cursor-not-allowed" : "",
        ].join(" ")}
      />
    </div>
  );
}

// ─── OTP Input (group of InputCode cells) ────────────────────────────────────

export interface OtpInputProps {
  length?:    number;
  value?:     string;
  onChange?:  (value: string) => void;
  status?:    InputCodeStatus;
  disabled?:  boolean;
  className?: string;
}

export function OtpInput({
  length   = 6,
  value    = "",
  onChange,
  status   = "default",
  disabled = false,
  className = "",
}: OtpInputProps) {
  const digits  = value.split("").concat(Array(length).fill("")).slice(0, length);
  const refs    = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, v: string) {
    const next = digits.slice();
    next[index] = v;
    const newValue = next.join("");
    onChange?.(newValue);
    // Auto-advance
    if (v && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < length - 1) refs.current[index + 1]?.focus();
  }

  function getState(index: number): InputCodeState {
    if (disabled) return "disabled";
    if (digits[index]) return "filled";
    return "default";
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {digits.map((digit, i) => (
        <InputCodeCell
          key={i}
          value={digit}
          state={getState(i)}
          status={status}
          onChange={v => handleChange(i, v)}
          onKeyDown={e => handleKeyDown(i, e)}
          inputRef={el => { refs.current[i] = el; }}
        />
      ))}
    </div>
  );
}

export { InputCodeCell };
export default Input;
