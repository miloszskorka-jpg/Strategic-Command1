import { ReactNode } from "react";

// ─── Icon paths ───────────────────────────────────────────────────────────────
const IC_HOME  = "/icons/home.svg";
const IC_ARROW = "/icons/arrow-right.svg";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label:    string;
  href?:    string;
  icon?:    ReactNode;
  /** Show home icon (first item) */
  showIcon?: boolean;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items:      BreadcrumbItem[];
  className?: string;
}

// ─── Home Icon ────────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <span
      style={{
        display: "inline-block",
        flexShrink: 0,
        width: 16, height: 16,
        backgroundColor: "#9A999A",
        maskImage: `url('${IC_HOME}')`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
      }}
    />
  );
}

// ─── Arrow Separator ─────────────────────────────────────────────────────────

function ArrowSeparator() {
  return (
    <span
      style={{
        display: "inline-block",
        flexShrink: 0,
        width: 12, height: 12,
        backgroundColor: "#9A999A",
        maskImage: `url('${IC_ARROW}')`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
      }}
    />
  );
}

// ─── Breadcrumb Item ─────────────────────────────────────────────────────────

interface BreadcrumbItemElProps {
  item:       BreadcrumbItem;
  isCurrent:  boolean;
  isFirst:    boolean;
  showSeparator: boolean;
}

function BreadcrumbItemEl({ item, isCurrent, isFirst, showSeparator }: BreadcrumbItemElProps) {
  const showIcon = isFirst && item.showIcon !== false;

  // Styles from Figma:
  // Previous → text-[#9A999A] font-normal, with icon + arrow separator
  // Current  → text-white font-medium, no separator
  // State3   → text-[#AEADAE] underline + arrow (hover state of previous)
  const textClass = isCurrent
    ? "text-white font-medium font-['Inter',sans-serif]"
    : "text-[#9A999A] font-normal font-['Inter',sans-serif]";

  const content = (
    <div className="flex items-center gap-1 shrink-0">
      {/* Home icon on first item */}
      {showIcon && (item.icon ?? <HomeIcon />)}

      {/* Label */}
      <span
        className={[
          "text-[14px] leading-[16px] whitespace-nowrap",
          "font-['Inter',sans-serif]",
          textClass,
          !isCurrent ? "hover:text-[#AEADAE] hover:underline transition-colors duration-150 cursor-pointer" : "",
        ].join(" ")}
      >
        {item.label}
      </span>

      {/* Arrow separator after non-current items */}
      {showSeparator && <ArrowSeparator />}
    </div>
  );

  // Wrap in link if href provided and not current
  if (item.href && !isCurrent) {
    return (
      <a
        href={item.href}
        onClick={item.onClick}
        className="contents"
        aria-label={item.label}
      >
        {content}
      </a>
    );
  }

  if (item.onClick && !isCurrent) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        className="contents"
      >
        {content}
      </button>
    );
  }

  return content;
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol
        className={[
          "flex items-center gap-1 py-1",
          className,
        ].join(" ")}
      >
        {items.map((item, i) => {
          const isCurrent     = i === items.length - 1;
          const isFirst       = i === 0;
          const showSeparator = !isCurrent;

          return (
            <li key={i} className="flex items-center">
              <BreadcrumbItemEl
                item={item}
                isCurrent={isCurrent}
                isFirst={isFirst}
                showSeparator={showSeparator}
              />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
