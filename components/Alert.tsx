import React, { useState, ReactNode } from "react";

// ─── Icon asset URLs ──────────────────────────────────────────────────────────
const imgCheckCircle  = "http://localhost:3845/assets/e5329ed511d607f8cfa8eb7f33f490f72aaebf1f.svg";
const imgClose        = "http://localhost:3845/assets/59ad3eed9b79533eebe14e928c56d611d42995cf.svg";
const imgCancel       = "http://localhost:3845/assets/9f6ef22731e115bb5c02ad0eb468f331c25dea8c.svg";
const imgWarningFill  = "http://localhost:3845/assets/3b591770f57ba764e6fba417f56d52ab4c5b50aa.svg";
const imgInfo         = "http://localhost:3845/assets/ab04902529b3a86f1d86b450dce31fb53ca79bc6.svg";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertProps {
  type?:            AlertType;
  title?:           string;
  description?:     string | ReactNode;
  showCloseIcon?:   boolean;
  onClose?:         () => void;
  /** Controlled visibility */
  visible?:         boolean;
  className?:       string;
}

// ─── Variant config from Figma ────────────────────────────────────────────────

const variantConfig: Record<AlertType, {
  bg:       string;
  border:   string;
  shadow:   string;
  iconSrc:  string;
  iconInset: string;
  defaultTitle: string;
}> = {
  success: {
    bg:           "bg-[#065736]",
    border:       "border-[#97D4B4]",
    shadow:       "shadow-[0px_0px_6px_2px_#0C9D61]",
    iconSrc:      imgCheckCircle,
    iconInset:    "inset-[8.33%]",
    defaultTitle: "Success Alert",
  },
  error: {
    bg:           "bg-[#821819]",
    border:       "border-[#F49898]",
    shadow:       "shadow-[0px_0px_6px_2px_#EC2D30]",
    iconSrc:      imgCancel,
    iconInset:    "inset-[8.33%]",
    defaultTitle: "Error Alert",
  },
  warning: {
    bg:           "bg-[#C7770B]",
    border:       "border-[#FFDD82]",
    shadow:       "shadow-[0px_0px_6px_2px_#FE9B0E]",
    iconSrc:      imgWarningFill,
    iconInset:    "inset-[12.5%_7.21%_12.5%_7.25%]",
    defaultTitle: "Warning Alert",
  },
  info: {
    bg:           "bg-[#2D57B0]",
    border:       "border-[#93C8FF]",
    shadow:       "shadow-[0px_0px_6px_2px_#3A70E2]",
    iconSrc:      imgInfo,
    iconInset:    "inset-[8.33%]",
    defaultTitle: "Info Alert",
  },
};

// ─── Alert ───────────────────────────────────────────────────────────────────

export function Alert({
  type          = "success",
  title,
  description,
  showCloseIcon = true,
  onClose,
  visible:      externalVisible,
  className     = "",
}: AlertProps) {
  const [internalVisible, setInternalVisible] = useState(true);
  const isVisible = externalVisible !== undefined ? externalVisible : internalVisible;

  if (!isVisible) return null;

  const cfg = variantConfig[type];
  const displayTitle = title ?? cfg.defaultTitle;

  function handleClose() {
    setInternalVisible(false);
    onClose?.();
  }

  return (
    <div
      role="alert"
      className={[
        "flex gap-2 items-start p-4 rounded-[4px]",
        "border border-solid overflow-hidden",
        cfg.bg,
        cfg.border,
        cfg.shadow,
        className,
      ].join(" ")}
    >
      {/* Type icon */}
      <div className="relative shrink-0 size-[24px] mt-[0px]">
        <div className={`absolute ${cfg.iconInset}`}>
          <img
            alt={type}
            className="absolute block inset-0 max-w-none size-full"
            src={cfg.iconSrc}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 items-start flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-center justify-between w-full">
          <p className="text-[16px] font-semibold leading-[24px] font-['Inter',sans-serif] text-white whitespace-nowrap">
            {displayTitle}
          </p>

          {/* Close button */}
          {showCloseIcon && (
            <button
              type="button"
              onClick={handleClose}
              className="relative shrink-0 size-[24px] flex items-center justify-center hover:opacity-70 transition-opacity ml-4"
              aria-label="Close alert"
            >
              <div className="absolute inset-[22.63%_22.58%_22.58%_22.62%]">
                <img
                  alt="close"
                  className="absolute block inset-0 max-w-none size-full"
                  src={imgClose}
                />
              </div>
            </button>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-[14px] font-normal leading-[20px] font-['Inter',sans-serif] text-white w-full">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Toast-style Alert (auto-dismiss) ────────────────────────────────────────

export interface ToastAlertProps extends AlertProps {
  /** Auto-dismiss after ms (0 = no auto-dismiss) */
  duration?: number;
}

export function ToastAlert({ duration = 4000, onClose, ...props }: ToastAlertProps) {
  const [visible, setVisible] = useState(true);

  React.useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <Alert
      {...props}
      visible={visible}
      onClose={() => { setVisible(false); onClose?.(); }}
    />
  );
}

export default Alert;
