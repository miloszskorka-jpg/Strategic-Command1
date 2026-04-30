import React, { useState } from "react";

// ─── Icons (inline SVG – zastąp react-icons lub własną ikoną) ─────────────────

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IconLogout({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// ─── NavItem type ─────────────────────────────────────────────────────────────

export interface NavItemConfig {
  id:      string;
  label:   string;
  icon:    React.ReactNode;
  badge?:  boolean;
  href?:   string;
}

// ─── MenuItem ─────────────────────────────────────────────────────────────────

type MenuItemType = "expanded" | "collapsed" | "collapsed+text";
type MenuItemState = "default" | "hover" | "focused" | "active";

interface MenuItemProps {
  item:      NavItemConfig;
  type?:     MenuItemType;
  state?:    MenuItemState;
  isActive?: boolean;
  onClick?:  () => void;
  className?: string;
}

export function MenuItem({
  item,
  type      = "expanded",
  isActive  = false,
  onClick,
  className = "",
}: MenuItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Colour logic from Figma:
  // default    → transparent bg, white icon+text
  // hover      → #161D20 bg, white icon+text
  // active     → transparent bg, primary-500 (#76FFAE) icon+text
  const bgClass    = isActive ? "bg-transparent" : isHovered ? "bg-[#161D20]" : "bg-transparent";
  const colorClass = isActive ? "text-[#76FFAE]" : "text-white";

  if (type === "collapsed") {
    // Icon only – 56×48 / 48×48
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={[
          "relative flex items-center justify-center w-14 h-12 rounded px-3 py-3 transition-colors duration-150",
          bgClass, colorClass, className,
        ].join(" ")}
        title={item.label}
      >
        <span className="w-6 h-6 flex items-center justify-center">{item.icon}</span>
        {item.badge && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EC2D30]" />
        )}
      </button>
    );
  }

  if (type === "collapsed+text") {
    // Icon + label below – 76×60
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={[
          "relative flex flex-col items-center justify-center gap-1 w-[76px] h-[60px] rounded px-2 py-2 transition-colors duration-150",
          bgClass, colorClass, className,
        ].join(" ")}
      >
        <span className="w-6 h-6 flex items-center justify-center">{item.icon}</span>
        <span className="text-[10px] font-semibold leading-none font-['Inter',sans-serif] truncate max-w-full">
          {item.label}
        </span>
        {item.badge && (
          <span className="absolute top-1.5 right-3 w-2 h-2 rounded-full bg-[#EC2D30]" />
        )}
      </button>
    );
  }

  // Expanded – full width with label
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={[
        "w-full flex items-center gap-2 px-4 py-3 rounded transition-colors duration-150 text-left",
        bgClass, colorClass, className,
      ].join(" ")}
    >
      <span className="w-6 h-6 flex items-center justify-center shrink-0">{item.icon}</span>
      <span className="text-[16px] font-semibold leading-[24px] font-['Inter',sans-serif] whitespace-nowrap">
        {item.label}
      </span>
      {item.badge && (
        <span className="ml-auto bg-[#EC2D30] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-sm leading-none">
          New
        </span>
      )}
    </button>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

type NavbarVariant = "expanded" | "collapsed" | "collapsed+text";

interface NavbarProps {
  items:       NavItemConfig[];
  activeId?:   string;
  onNavigate?: (id: string) => void;
  onLogout?:   () => void;
  logoSrc?:    string;
  defaultVariant?: NavbarVariant;
}

export function Navbar({
  items,
  activeId,
  onNavigate,
  onLogout,
  logoSrc,
  defaultVariant = "expanded",
}: NavbarProps) {
  const [variant, setVariant] = useState<NavbarVariant>(defaultVariant);

  const isExpanded        = variant === "expanded";
  const isCollapsedText   = variant === "collapsed+text";

  // Width based on variant
  const widthClass = isExpanded
    ? "w-[280px]"
    : isCollapsedText
      ? "w-[108px]"
      : "w-[88px]";

  function toggle() {
    setVariant(prev => prev === "expanded" ? "collapsed" : "expanded");
  }

  return (
    <nav
      className={[
        "relative flex flex-col justify-between h-screen py-9 px-4",
        "bg-[#0D1112] border-r border-[#101517]",
        "transition-all duration-300 ease-in-out shrink-0",
        widthClass,
      ].join(" ")}
    >
      {/* ── Top section: Logo + Menu items ── */}
      <div className="flex flex-col gap-[60px]">

        {/* Logo */}
        <div className="px-[10px]">
          {isExpanded ? (
            <div className="flex items-center gap-2">
              {logoSrc ? (
                <img src={logoSrc} alt="Logo" className="w-9 h-9 shrink-0" />
              ) : (
                <div className="w-9 h-9 shrink-0 flex items-center justify-center">
                  {/* Placeholder compass/star logo */}
                  <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
                    <circle cx="18" cy="18" r="17" stroke="#76FFAE" strokeWidth="1.5" />
                    <path d="M18 6 L20 16 L30 18 L20 20 L18 30 L16 20 L6 18 L16 16 Z" fill="#76FFAE" />
                  </svg>
                </div>
              )}
              <span
                className="text-white text-[18px] font-semibold whitespace-nowrap"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                Strategic Command
              </span>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-9 h-9 flex items-center justify-center">
                <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
                  <circle cx="18" cy="18" r="17" stroke="#76FFAE" strokeWidth="1.5" />
                  <path d="M18 6 L20 16 L30 18 L20 20 L18 30 L16 20 L6 18 L16 16 Z" fill="#76FFAE" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <div className={[
          "flex flex-col gap-3",
          !isExpanded ? "items-center" : "items-stretch",
        ].join(" ")}>
          {items.map(item => (
            <MenuItem
              key={item.id}
              item={item}
              type={variant}
              isActive={item.id === activeId}
              onClick={() => onNavigate?.(item.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Bottom: Logout ── */}
      <div>
        <button
          onClick={onLogout}
          className={[
            "w-full flex items-center gap-1 px-4 py-[10px] rounded",
            "bg-[#161D20] text-white hover:bg-[#232E33] transition-colors duration-150",
            !isExpanded ? "justify-center" : "",
          ].join(" ")}
          title="Logout"
        >
          <IconLogout className="w-6 h-6 shrink-0" />
          {isExpanded && (
            <span className="text-[18px] font-semibold leading-[28px] font-['Inter',sans-serif] whitespace-nowrap">
              Logout
            </span>
          )}
        </button>
      </div>

      {/* ── Collapse toggle button ── */}
      <button
        onClick={toggle}
        className={[
          "absolute top-[100px] flex items-center justify-center",
          "w-7 h-7 rounded-md",
          "bg-[#101517] border border-[#555455]",
          "hover:bg-[#161D20] transition-colors duration-150",
          "translate-x-1/2",
          isExpanded ? "right-0" : "right-0",
        ].join(" ")}
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <IconChevronLeft
          className={[
            "w-4 h-4 text-white transition-transform duration-300",
            isExpanded ? "rotate-0" : "rotate-180",
          ].join(" ")}
        />
      </button>
    </nav>
  );
}

// ─── Default export with example nav items ────────────────────────────────────

export const defaultNavItems: NavItemConfig[] = [
  { id: "dashboard",  label: "Dashboard",  icon: <IconHome className="w-6 h-6" /> },
  { id: "missions",   label: "Missions",   icon: <IconHome className="w-6 h-6" /> },
  { id: "units",      label: "Units",      icon: <IconHome className="w-6 h-6" /> },
  { id: "strategy",   label: "Strategy",   icon: <IconHome className="w-6 h-6" /> },
  { id: "settings",   label: "Settings",   icon: <IconHome className="w-6 h-6" /> },
];

export default Navbar;
