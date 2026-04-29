import React, { useState } from "react";

// ─── Icon paths ───────────────────────────────────────────────────────────────
const IC_DBL_LEFT    = "/icons/keyboard-double-arrow-left.svg";
const IC_ARROW_LEFT  = "/icons/arrow-left.svg";
const IC_ARROW_RIGHT = "/icons/arrow-right.svg";
const IC_DBL_RIGHT   = "/icons/keyboard-double-arrow-right.svg";

function PagIcon({ src, color = "currentColor" }: { src: string; color?: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        flexShrink: 0,
        width: 16, height: 16,
        backgroundColor: color === "currentColor" ? undefined : color,
        background: color === "currentColor" ? "currentColor" : color,
        maskImage: `url('${src}')`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
      }}
    />
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginationProps {
  /** Total number of pages */
  totalPages:   number;
  /** Current page (1-indexed) */
  currentPage?: number;
  /** Called when page changes */
  onChange?:    (page: number) => void;
  /** How many page numbers to show around active page */
  siblingCount?: number;
  className?:   string;
}

// ─── Nav Button ───────────────────────────────────────────────────────────────

interface NavButtonProps {
  onClick:   () => void;
  disabled?: boolean;
  children:  React.ReactNode;
  title?:    string;
}

function NavButton({ onClick, disabled, children, title }: NavButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={[
        "flex items-center justify-center min-w-[32px] h-[32px] p-2 rounded-[4px]",
        "border border-solid transition-colors duration-150 outline-none",
        disabled
          ? "border-[#2A292A] text-[#3F3E3F] cursor-not-allowed"
          : isHovered
            ? "border-[#232E33] bg-[rgba(22,29,32,0.2)] text-[#93ACB8] cursor-pointer"
            : "border-[#2A292A] text-[#93ACB8] cursor-pointer",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// ─── Double Left Arrow ────────────────────────────────────────────────────────

function IconDoubleLeft()  { return <PagIcon src={IC_DBL_LEFT} />; }
function IconDoubleRight() { return <PagIcon src={IC_DBL_RIGHT} />; }
function IconArrowLeft()   { return <PagIcon src={IC_ARROW_LEFT} />; }
function IconArrowRight()  { return <PagIcon src={IC_ARROW_RIGHT} />; }

// ─── Page Item ────────────────────────────────────────────────────────────────

type PageItemState = "default" | "hover" | "active" | "disabled" | "ellipsis";

interface PageItemProps {
  label:     string | number;
  state?:    PageItemState;
  onClick?:  () => void;
}

function PageItem({ label, state = "default", onClick }: PageItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isEllipsis = state === "ellipsis";
  const isActive   = state === "active";
  const isDisabled = state === "disabled";
  const effectiveState = !isEllipsis && !isActive && !isDisabled && isHovered ? "hover" : state;

  const styles: Record<PageItemState, string> = {
    default:  "border-[#161D20] text-[#93ACB8] bg-transparent cursor-pointer",
    hover:    "border-[#232E33] text-[#93ACB8] bg-[rgba(22,29,32,0.2)] cursor-pointer",
    active:   "border-[#3A70E2] text-white bg-[rgba(22,29,32,0.5)] cursor-default",
    disabled: "border-transparent text-[#3F3E3F] bg-[#2A292A] cursor-not-allowed",
    ellipsis: "border-[#161D20] text-[#93ACB8] bg-transparent cursor-default",
  };

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={!isDisabled && !isEllipsis && !isActive ? onClick : undefined}
      onMouseEnter={() => !isDisabled && !isEllipsis && !isActive && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-current={isActive ? "page" : undefined}
      className={[
        "flex items-center justify-center size-[32px] p-1 rounded-[4px]",
        "border border-solid transition-colors duration-150 outline-none shrink-0",
        styles[effectiveState],
      ].join(" ")}
    >
      <span className="text-[14px] font-medium leading-[16px] font-['Inter',sans-serif] whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

// ─── Page range helper ────────────────────────────────────────────────────────

function getPageRange(current: number, total: number, siblings: number): (number | "...")[] {
  const totalShown = siblings * 2 + 5; // siblings + active + 2 edges + 2 ellipsis

  if (total <= totalShown) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling  = Math.max(current - siblings, 1);
  const rightSibling = Math.min(current + siblings, total);

  const showLeftDots  = leftSibling > 2;
  const showRightDots = rightSibling < total - 1;

  if (!showLeftDots && showRightDots) {
    const leftRange = Array.from({ length: 3 + 2 * siblings }, (_, i) => i + 1);
    return [...leftRange, "...", total];
  }

  if (showLeftDots && !showRightDots) {
    const rightRange = Array.from(
      { length: 3 + 2 * siblings },
      (_, i) => total - (3 + 2 * siblings) + 1 + i,
    );
    return [1, "...", ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i,
  );
  return [1, "...", ...middleRange, "...", total];
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export function Pagination({
  totalPages,
  currentPage: externalPage,
  onChange,
  siblingCount = 1,
  className    = "",
}: PaginationProps) {
  const [internalPage, setInternalPage] = useState(1);
  const current = externalPage ?? internalPage;

  function goTo(page: number) {
    const clamped = Math.max(1, Math.min(page, totalPages));
    if (clamped === current) return;
    setInternalPage(clamped);
    onChange?.(clamped);
  }

  const pages = getPageRange(current, totalPages, siblingCount);

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      aria-label="Pagination"
    >
      {/* First page */}
      <NavButton onClick={() => goTo(1)} disabled={current === 1} title="First page">
        <IconDoubleLeft />
      </NavButton>

      {/* Previous page */}
      <NavButton onClick={() => goTo(current - 1)} disabled={current === 1} title="Previous page">
        <IconArrowLeft />
      </NavButton>

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === "..." ? (
          <PageItem key={`ellipsis-${i}`} label="..." state="ellipsis" />
        ) : (
          <PageItem
            key={page}
            label={page}
            state={page === current ? "active" : "default"}
            onClick={() => goTo(page as number)}
          />
        ),
      )}

      {/* Next page */}
      <NavButton onClick={() => goTo(current + 1)} disabled={current === totalPages} title="Next page">
        <IconArrowRight />
      </NavButton>

      {/* Last page */}
      <NavButton onClick={() => goTo(totalPages)} disabled={current === totalPages} title="Last page">
        <IconDoubleRight />
      </NavButton>
    </div>
  );
}

export default Pagination;
