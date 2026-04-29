import React, { ReactNode } from "react";

// ─── Icon asset URLs ──────────────────────────────────────────────────────────
const imgHomeMask = "http://localhost:3845/assets/0b7a5b7142799039ec638f866224c05f7481ea6a.svg";
const imgHomeFill = "http://localhost:3845/assets/fd7d65dcd56d59acc2a1eaa1c5e66aa09130bebf.svg";
const imgArrow    = "http://localhost:3845/assets/a5871fe6a318f2222fe566066bc73b20b1014cbd.svg";

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
    <div className="relative shrink-0 size-[16px]">
      <div
        className="absolute mask-alpha mask-intersect mask-no-clip mask-no-repeat"
        style={{
          inset: "16.67% 16.67% 10.42% 16.67%",
          maskImage:    `url('${imgHomeMask}')`,
          maskSize:     "24px 24px",
          maskPosition: "-4px -4px",
        }}
      >
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgHomeFill} />
      </div>
    </div>
  );
}

// ─── Arrow Separator ─────────────────────────────────────────────────────────

function ArrowSeparator() {
  return (
    <div className="relative shrink-0 size-[12px]">
      <div
        className="absolute flex items-center justify-center"
        style={{ inset: "16.67% 25.71% 13.33% 33.33%", containerType: "size" as React.CSSProperties["containerType"] }}
      >
        <div className="-scale-x-100 flex-none h-[100cqh] w-[100cqw]">
          <div className="relative size-full">
            <img alt="›" className="absolute block inset-0 max-w-none size-full" src={imgArrow} />
          </div>
        </div>
      </div>
    </div>
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
    ? "text-white font-medium"
    : "text-[#9A999A] font-normal";

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
