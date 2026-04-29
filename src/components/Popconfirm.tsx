import React, { ReactNode, useEffect } from "react";

// ─── Icon asset URLs ──────────────────────────────────────────────────────────
const MASK          = "http://localhost:3845/assets/810411d6d78b58b9fc6545f170608dbf6d622232.svg";
const imgDeleteFill = "http://localhost:3845/assets/c596ad23a48c9d12e2970e6690062d5b136600c5.svg";
const imgWarning    = "http://localhost:3845/assets/4f61688e18a90f707d07d058a3a821a887b21b73.svg";
const imgInfo       = "http://localhost:3845/assets/e14b847e7ee33cbadcad62108bc6d9bf68d5bd96.svg";
const imgInfo2      = "http://localhost:3845/assets/ecd408206980d62dd4cc2e1c6c840991ca28d04d.svg";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PopconfirmVariant = "critical" | "warning" | "confirm" | "info";

export interface PopconfirmProps {
  variant?:        PopconfirmVariant;
  title?:          string;
  description?:    string | ReactNode;
  /** Label for confirm/primary action button */
  confirmLabel?:   string;
  /** Label for cancel button (hidden when variant=info) */
  cancelLabel?:    string;
  onConfirm?:      () => void;
  onCancel?:       () => void;
  /** Whether to show as modal with backdrop */
  modal?:          boolean;
  open?:           boolean;
  className?:      string;
}

// ─── Variant config from Figma ────────────────────────────────────────────────

const variantConfig: Record<PopconfirmVariant, {
  iconEl:         ReactNode;
  confirmBg:      string;
  confirmHover:   string;
  defaultTitle:   string;
  defaultDesc:    string;
  defaultConfirm: string;
  singleButton:   boolean;
}> = {
  critical: {
    iconEl: (
      <div className="relative size-[36px]">
        <div
          className="absolute mask-alpha mask-intersect mask-no-clip mask-no-repeat"
          style={{ inset: "12.5% 16.67%", maskImage: `url('${MASK}')`, maskSize: "24px 24px", maskPosition: "-4px -3px" }}
        >
          <img alt="delete" className="absolute block inset-0 max-w-none size-full" src={imgDeleteFill} />
        </div>
      </div>
    ),
    confirmBg:      "bg-[#EC2D30] hover:bg-[#F64C4C]",
    confirmHover:   "hover:bg-[#B72224]",
    defaultTitle:   "Delete File?",
    defaultDesc:    "Are you sure you want to delete this file?",
    defaultConfirm: "Delete",
    singleButton:   false,
  },
  warning: {
    iconEl: (
      <div className="relative size-[36px]">
        <div className="absolute" style={{ inset: "12.5% 7.21% 12.5% 7.25%" }}>
          <img alt="warning" className="absolute block inset-0 max-w-none size-full" src={imgWarning} />
        </div>
      </div>
    ),
    confirmBg:      "bg-[#FE9B0E] hover:bg-[#FFAD0D]",
    confirmHover:   "hover:bg-[#C7770B]",
    defaultTitle:   "Submit request?",
    defaultDesc:    "You won't be able to edit this later.",
    defaultConfirm: "Submit",
    singleButton:   false,
  },
  confirm: {
    iconEl: (
      <div className="relative size-[36px]">
        <div className="absolute" style={{ inset: "8.33%" }}>
          <img alt="info" className="absolute block inset-0 max-w-none size-full" src={imgInfo} />
        </div>
      </div>
    ),
    confirmBg:      "bg-[#0C9D61] hover:bg-[#097A4B]",
    confirmHover:   "hover:bg-[#065736]",
    defaultTitle:   "Save Changes?",
    defaultDesc:    "You are changing email address and role.",
    defaultConfirm: "Confirm",
    singleButton:   false,
  },
  info: {
    iconEl: (
      <div className="relative size-[36px]">
        <div className="absolute" style={{ inset: "8.33%" }}>
          <img alt="info" className="absolute block inset-0 max-w-none size-full" src={imgInfo2} />
        </div>
      </div>
    ),
    confirmBg:      "bg-[#0C9D61] hover:bg-[#097A4B]",
    confirmHover:   "hover:bg-[#065736]",
    defaultTitle:   "File uploaded",
    defaultDesc:    "Your file has been successfully uploaded.",
    defaultConfirm: "OK",
    singleButton:   true,
  },
};

// ─── Popconfirm Card ──────────────────────────────────────────────────────────

export function PopconfirmCard({
  variant      = "confirm",
  title,
  description,
  confirmLabel,
  cancelLabel  = "Cancel",
  onConfirm,
  onCancel,
  className    = "",
}: Omit<PopconfirmProps, "modal" | "open">) {
  const cfg          = variantConfig[variant];
  const displayTitle = title ?? cfg.defaultTitle;
  const displayDesc  = description ?? cfg.defaultDesc;
  const displayConfirm = confirmLabel ?? cfg.defaultConfirm;

  return (
    <div
      className={[
        "bg-[#0A0D0E] border border-[#101517] border-solid",
        "flex flex-col gap-9 items-center p-6 rounded-[8px] w-[318px]",
        className,
      ].join(" ")}
    >
      {/* Icon */}
      {cfg.iconEl}

      {/* Text content */}
      <div className="flex flex-col gap-2 items-center text-center text-white w-full">
        <h3 className="text-[24px] font-semibold leading-[36px] font-['Inter',sans-serif] text-white">
          {displayTitle}
        </h3>
        {displayDesc && (
          <p className="text-[14px] font-normal leading-[20px] font-['Inter',sans-serif] text-white w-[270px]">
            {displayDesc}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className={[
        "flex items-center justify-center w-full",
        cfg.singleButton ? "" : "gap-6",
      ].join(" ")}>
        {/* Cancel (hidden for info/single-button variant) */}
        {!cfg.singleButton && (
          <button
            type="button"
            onClick={onCancel}
            className={[
              "flex-1 flex items-center justify-center",
              "px-4 py-2 rounded-[4px] min-w-[92px]",
              "bg-[#161D20] hover:bg-[#232E33]",
              "text-[16px] font-semibold leading-[24px]",
              "font-['Inter',sans-serif] text-white",
              "transition-colors duration-150 cursor-pointer",
            ].join(" ")}
          >
            {cancelLabel}
          </button>
        )}

        {/* Confirm */}
        <button
          type="button"
          onClick={onConfirm}
          className={[
            "flex items-center justify-center",
            cfg.singleButton ? "w-full" : "flex-1",
            "px-4 py-2 rounded-[4px] min-w-[92px]",
            cfg.confirmBg,
            "text-[16px] font-semibold leading-[24px]",
            "font-['Inter',sans-serif] text-white",
            "transition-colors duration-150 cursor-pointer",
          ].join(" ")}
        >
          {displayConfirm}
        </button>
      </div>
    </div>
  );
}

// ─── Popconfirm Modal (with backdrop) ────────────────────────────────────────

export function Popconfirm({
  open     = false,
  modal    = true,
  onCancel,
  ...props
}: PopconfirmProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel?.();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  // Prevent body scroll
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  if (!modal) {
    return <PopconfirmCard {...props} onCancel={onCancel} />;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0A0D0E]/70"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative z-10">
        <PopconfirmCard {...props} onCancel={onCancel} />
      </div>
    </div>
  );
}

export default Popconfirm;
