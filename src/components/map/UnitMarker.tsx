// Asset URLs from Figma (valid for 7 days from generation)
const imgVector    = "https://www.figma.com/api/mcp/asset/93a3641e-c8d4-47c7-8e43-fc9506554ba4";
const imgBatDef    = "https://www.figma.com/api/mcp/asset/88a79935-31e2-433d-9b57-44e040194dd7";
const imgBatHov    = "https://www.figma.com/api/mcp/asset/4c54c9ea-c3df-4732-b746-1b80630d22ce";
const imgSqArtDef  = "https://www.figma.com/api/mcp/asset/ab98de41-9caa-42be-bd79-96f0dc48c456";
const imgSqArtHov  = "https://www.figma.com/api/mcp/asset/17743b36-b9d6-4ac2-9e6d-c0e431884f3b";
const imgPltArtDef = "https://www.figma.com/api/mcp/asset/ea00a3bc-17f2-4b9b-9ace-dc951ecb331e";
const imgPltArtHov = "https://www.figma.com/api/mcp/asset/9276a1a4-e4c7-4cc1-87e0-e358f394f22e";
const imgCoDef     = "https://www.figma.com/api/mcp/asset/e12c417f-9f35-4161-ab94-80901a006887";
const imgCoHov     = "https://www.figma.com/api/mcp/asset/019c0db2-bab1-437e-b57a-74bd83ffbfbc";
const imgPltDef    = "https://www.figma.com/api/mcp/asset/c2370aa9-4226-4f2e-8781-777e59545355";
const imgPltHov    = "https://www.figma.com/api/mcp/asset/bff00c01-c96b-47e3-9e0e-7d02f0a7cba7";
const imgSqDef     = "https://www.figma.com/api/mcp/asset/628e0077-3b94-4103-a601-8f1b4a795a09";
const imgSqHov     = "https://www.figma.com/api/mcp/asset/d3ff3f25-980d-4274-93ea-68f7a195dd96";
const imgRingBlue  = "https://www.figma.com/api/mcp/asset/d3ff3f25-980d-4274-93ea-68f7a195dd96";
const imgRingYellow = "https://www.figma.com/api/mcp/asset/31609437-b0ec-4cd8-9d12-9b6af3cdaea2";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UnitType =
  | "Battalion"
  | "Company (infantry)"
  | "Platoon (infantry)"
  | "Squad (infantry)"
  | "Platoon (artillery)"
  | "Squad (artillery)";

export type UnitMarkerProps = {
  className?:         string;
  higherUnitMarked?:  boolean;
  selected?:          boolean;
  state?:             "Default" | "Hover" | "Disabled";
  unitType?:          UnitType;
};

// ─── Icon asset selector ──────────────────────────────────────────────────────

function getIcon(unitType: UnitType, hover: boolean): string {
  if (hover) {
    switch (unitType) {
      case "Battalion":          return imgBatHov;
      case "Squad (artillery)":  return imgSqArtHov;
      case "Platoon (artillery)":return imgPltArtHov;
      case "Company (infantry)": return imgCoHov;
      case "Platoon (infantry)": return imgPltHov;
      case "Squad (infantry)":   return imgSqHov;
    }
  }
  switch (unitType) {
    case "Battalion":          return imgBatDef;
    case "Squad (artillery)":  return imgSqArtDef;
    case "Platoon (artillery)":return imgPltArtDef;
    case "Company (infantry)": return imgCoDef;
    case "Platoon (infantry)": return imgPltDef;
    case "Squad (infantry)":   return imgSqDef;
  }
}

// ─── Inner inset per type ─────────────────────────────────────────────────────

function getInset(unitType: UnitType): string {
  return unitType === "Battalion"
    ? "12.5% 8.33% 8.33% 8.33%"
    : "16.67% 8.33% 6.72% 8.33%";
}

function getMaskPos(unitType: UnitType): string {
  return unitType === "Battalion" ? "-2px -3px" : "-2px -4px";
}

// ─── UnitMarker ───────────────────────────────────────────────────────────────

export function UnitMarker({
  className,
  higherUnitMarked = false,
  selected         = false,
  state            = "Default",
  unitType         = "Battalion",
}: UnitMarkerProps) {
  const hover    = state === "Hover";
  const disabled = state === "Disabled";
  const icon     = getIcon(unitType, hover);
  const inset    = getInset(unitType);
  const maskPos  = getMaskPos(unitType);

  const maskStyle: React.CSSProperties = {
    maskImage:    `url('${imgVector}')`,
    maskPosition: maskPos,
    maskSize:     "24px 24px",
    maskRepeat:   "no-repeat",
    maskComposite:"intersect",
  };

  return (
    <div
      className={className ?? "relative size-[36px]"}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      {/* Ring: selected (blue) */}
      {selected && !higherUnitMarked && (
        <div className="absolute inset-[-50%] pointer-events-none">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRingBlue} />
        </div>
      )}

      {/* Ring: higher unit marked (yellow) */}
      {higherUnitMarked && !selected && (
        <div className="-translate-y-1/2 absolute aspect-square left-[-33.33%] right-[-33.33%] top-1/2 pointer-events-none">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRingYellow} />
        </div>
      )}

      {/* Unit icon with mask */}
      <div
        className="absolute"
        style={{ inset, ...maskStyle }}
      >
        <img alt={unitType} className="absolute block inset-0 max-w-none size-full" src={icon} />
      </div>
    </div>
  );
}

export default UnitMarker;
