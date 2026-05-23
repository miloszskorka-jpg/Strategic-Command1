export type UnitType =
  | "Battalion"
  | "Company (infantry)"
  | "Platoon (infantry)"
  | "Squad (infantry)"
  | "Platoon (artillery)"
  | "Squad (artillery)";

interface UnitMarkerSVGProps {
  unitType:  UnitType;
  disabled?: boolean;
  hovered?:  boolean;
  selected?: boolean;
  size?:     number;
}

const C = {
  fill:    "#4BA1FF",
  hover:   "#93C8FF",
  sel:     "#BDDDFF",
  bg:      "#0D1112",
};

function NatoSymbol({ unitType }: { unitType: UnitType }) {
  switch (unitType) {
    case "Battalion":
      return (
        <g stroke="white" strokeWidth="1.5" strokeLinecap="round">
          <line x1="7"  y1="7" x2="7"  y2="17" />
          <line x1="4"  y1="7" x2="10" y2="17" />
          <line x1="10" y1="7" x2="4"  y2="17" />
          <line x1="14" y1="7" x2="14" y2="17" />
          <line x1="11" y1="7" x2="17" y2="17" />
          <line x1="17" y1="7" x2="11" y2="17" />
          <line x1="21" y1="7" x2="21" y2="17" />
          <line x1="18" y1="7" x2="24" y2="17" />
          <line x1="24" y1="7" x2="18" y2="17" />
        </g>
      );
    case "Company (infantry)":
      return (
        <g stroke="white" strokeWidth="2" strokeLinecap="round">
          <line x1="9"  y1="7" x2="19" y2="17" />
          <line x1="19" y1="7" x2="9"  y2="17" />
        </g>
      );
    case "Platoon (infantry)":
      return (
        <g stroke="white" strokeWidth="2" strokeLinecap="round">
          <line x1="9"  y1="7" x2="9"  y2="17" />
          <line x1="14" y1="7" x2="14" y2="17" />
          <line x1="19" y1="7" x2="19" y2="17" />
        </g>
      );
    case "Squad (infantry)":
      return (
        <g fill="white">
          <circle cx="10" cy="12" r="2.5" />
          <circle cx="18" cy="12" r="2.5" />
        </g>
      );
    case "Platoon (artillery)":
      return (
        <g stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none">
          <circle cx="14" cy="12" r="4" />
          <line x1="7"  y1="7" x2="7"  y2="17" />
          <line x1="21" y1="7" x2="21" y2="17" />
        </g>
      );
    case "Squad (artillery)":
      return (
        <g>
          <circle cx="14" cy="12" r="4" stroke="white" strokeWidth="1.5" fill="none" />
          <circle cx="14" cy="12" r="2" fill="white" />
        </g>
      );
    default:
      return null;
  }
}

export function UnitMarkerSVG({
  unitType,
  disabled = false,
  hovered  = false,
  selected = false,
  size     = 36,
}: UnitMarkerSVGProps) {
  const strokeColor = selected ? C.sel : hovered ? C.hover : C.fill;

  return (
    <div style={{ opacity: disabled ? 0.5 : 1, position: "relative", width: size, height: size }}>
      {selected && (
        <div style={{
          position:      "absolute",
          inset:         -8,
          borderRadius:  "50%",
          border:        `2px solid ${C.sel}`,
          opacity:       0.5,
          pointerEvents: "none",
        }} />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="1" y="1" width="26" height="22" rx="2" fill={C.bg} stroke={strokeColor} strokeWidth="2" />
        <NatoSymbol unitType={unitType} />
      </svg>
    </div>
  );
}

export default UnitMarkerSVG;
