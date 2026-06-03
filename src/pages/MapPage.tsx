import { useState, useEffect, useRef, useCallback, Fragment, useMemo } from "react";
import Map, { Marker, Source, Layer, type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router-dom";
import { Navbar, NavItemConfig } from "../components/Navbar";
import { PlanningPanel, type Objective, type Plan, type ScenarioMode, type ScenarioAction, type SavedScenario } from "../components/map/PlanningPanel";
import { MapControls } from "../components/map/MapControls";
import { useUserRole } from "../context/UserRoleContext";
import { Button } from "../components/Button";
import { UnitMarkerSVG, type UnitType } from "../components/map/UnitMarkerSVG";

// ─── Scenario types & data ────────────────────────────────────────────────────

interface MapUnit {
  id:        string;
  name:      string;
  lat:       number;
  lng:       number;
  unitType:  UnitType;
  parentId?: string | null;
  disabled?: boolean;
}

interface UnitMove {
  unitId:   string;
  unitName: string;
  fromLat:  number;
  fromLng:  number;
  toLat:    number;
  toLng:    number;
}

interface PendingFireMission {
  lat: number;
  lng: number;
}

interface ConfirmedFireMission {
  id:          string;
  lat:         number;
  lng:         number;
  name:        string;
  targetType:  string;
  weaponType:  string;
  batterySheaf: string;
  fireType:    string;
}


const MOCK_UNITS: MapUnit[] = [
  { id: "bat-1",      name: "BAT_1",      lat: 47.5680, lng: 34.3960, unitType: "Battalion",           parentId: null                       },
  { id: "co-inf-1",   name: "CO_INF_1",   lat: 47.5820, lng: 34.3700, unitType: "Company (infantry)",  parentId: "bat-1"                    },
  { id: "co-inf-2",   name: "CO_INF_2",   lat: 47.5820, lng: 34.4200, unitType: "Company (infantry)",  parentId: "bat-1"                    },
  { id: "plt-art-1",  name: "PLT_ART_1",  lat: 47.5520, lng: 34.3960, unitType: "Platoon (artillery)", parentId: "bat-1"                    },
  { id: "plt-inf-1",  name: "PLT_INF_1",  lat: 47.5940, lng: 34.3540, unitType: "Platoon (infantry)",  parentId: "co-inf-1"                 },
  { id: "plt-inf-2",  name: "PLT_INF_2",  lat: 47.5920, lng: 34.3860, unitType: "Platoon (infantry)",  parentId: "co-inf-1"                 },
  { id: "plt-inf-3",  name: "PLT_INF_3",  lat: 47.5940, lng: 34.4100, unitType: "Platoon (infantry)",  parentId: "co-inf-2"                 },
  { id: "plt-inf-4",  name: "PLT_INF_4",  lat: 47.5920, lng: 34.4380, unitType: "Platoon (infantry)",  parentId: "co-inf-2"                 },
  { id: "sq-inf-1",   name: "SQ_INF_1",   lat: 47.5990, lng: 34.3440, unitType: "Squad (infantry)",    parentId: "plt-inf-1"                },
  { id: "sq-inf-2",   name: "SQ_INF_2",   lat: 47.6020, lng: 34.3600, unitType: "Squad (infantry)",    parentId: "plt-inf-1"                },
  { id: "sq-inf-3",   name: "SQ_INF_3",   lat: 47.5970, lng: 34.3760, unitType: "Squad (infantry)",    parentId: "plt-inf-2"                },
  { id: "sq-inf-4",   name: "SQ_INF_4",   lat: 47.6000, lng: 34.3920, unitType: "Squad (infantry)",    parentId: "plt-inf-2"                },
  { id: "sq-inf-5",   name: "SQ_INF_5",   lat: 47.5990, lng: 34.4040, unitType: "Squad (infantry)",    parentId: "plt-inf-3"                },
  { id: "sq-inf-6",   name: "SQ_INF_6",   lat: 47.6020, lng: 34.4200, unitType: "Squad (infantry)",    parentId: "plt-inf-3"                },
  { id: "sq-inf-7",   name: "SQ_INF_7",   lat: 47.5970, lng: 34.4320, unitType: "Squad (infantry)",    parentId: "plt-inf-4"                },
  { id: "sq-inf-8",   name: "SQ_INF_8",   lat: 47.6000, lng: 34.4460, unitType: "Squad (infantry)",    parentId: "plt-inf-4"                },
  { id: "sq-art-1",   name: "SQ_ART_1",   lat: 47.5440, lng: 34.3840, unitType: "Squad (artillery)",   parentId: "plt-art-1"                },
  { id: "sq-art-2",   name: "SQ_ART_2",   lat: 47.5440, lng: 34.4080, unitType: "Squad (artillery)",   parentId: "plt-art-1"                },
  { id: "sq-art-3",   name: "SQ_ART_3",   lat: 47.5410, lng: 34.3960, unitType: "Squad (artillery)",   parentId: "plt-art-1", disabled: true },
];

// ─── GeoJSON helpers ──────────────────────────────────────────────────────────

function generateUnitConnections(units: MapUnit[]) {
  return {
    type: "FeatureCollection" as const,
    features: units
      .filter((u) => u.parentId)
      .flatMap((unit) => {
        const parent = units.find((p) => p.id === unit.parentId);
        if (!parent) return [];
        return [{
          type: "Feature" as const,
          geometry: {
            type: "LineString" as const,
            coordinates: [[parent.lng, parent.lat], [unit.lng, unit.lat]],
          },
          properties: { id: unit.id },
        }];
      }),
  };
}

function generateMovementLines(moves: UnitMove[]) {
  return {
    type: "FeatureCollection" as const,
    features: moves.map((m) => ({
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: [[m.fromLng, m.fromLat], [m.toLng, m.toLat]],
      },
      properties: { id: m.unitId },
    })),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toRoman(n: number): string {
  const map: [number, string][] = [[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
  let result = "";
  for (const [val, sym] of map) {
    while (n >= val) { result += sym; n -= val; }
  }
  return result;
}

// ─── Scenario colors ──────────────────────────────────────────────────────────

const SCENARIO_COLORS = [
  { value: "blue",   hex: "#3A70E2" },
  { value: "green",  hex: "#0C9D61" },
  { value: "yellow", hex: "#FFC62B" },
  { value: "red",    hex: "#EC2D30" },
  { value: "purple", hex: "#5900D9" },
  { value: "blue2",  hex: "#4BA1FF" },
  { value: "gray",   hex: "#9A999A" },
];

// ─── Depends-on dropdown ──────────────────────────────────────────────────────

function DependsOnDropdown({
  scenarios, value, onChange, hasError = false,
}: {
  scenarios: SavedScenario[];
  value:     string;
  onChange:  (v: string) => void;
  hasError?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref                  = useRef<HTMLDivElement>(null);
  const selected             = scenarios.find((s) => s.id === value);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-3 bg-[#0D1112] border rounded-[4px] transition-colors duration-150 outline-none cursor-pointer ${
          hasError ? "border-[#F64C4C]" : isOpen ? "border-[#3A70E2]" : "border-[#161D20] hover:border-[#232E33]"
        }`}
      >
        <span className={`text-[14px] font-normal font-['Inter'] ${selected ? "text-white" : "text-[#9A999A]"}`}>
          {selected ? selected.name : "select parent scenario"}
        </span>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {selected && (
            <div className="size-[18px] rounded-full bg-[#0C9D61] flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
            <path d="M4 6l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-0 bg-[#0D1112] border border-[#3A70E2] rounded-[4px] overflow-hidden shadow-[0px_4px_16px_rgba(0,0,0,0.4)]">
          {scenarios.length === 0 ? (
            <div className="px-3 py-8 flex items-center justify-center min-h-[120px]">
              <p className="text-[#9A999A] text-[13px] font-['Inter'] text-center">No scenarios to select.</p>
            </div>
          ) : (
            scenarios.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => { onChange(scenario.id); setIsOpen(false); }}
                className={`w-full text-left px-3 py-[10px] text-[14px] font-normal font-['Inter'] text-white hover:bg-[#161D20] transition-colors cursor-pointer ${value === scenario.id ? "bg-[#161D20]" : ""}`}
              >
                {scenario.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Nav icons ────────────────────────────────────────────────────────────────

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}

function IconMap() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
    </svg>
  );
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: "home",  label: "Home",  icon: <IconHome />,  href: "/"      },
  { id: "users", label: "Users", icon: <IconUsers />, href: "/users" },
  { id: "map",   label: "Map",   icon: <IconMap />,   href: "/map"   },
];

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_OBJECTIVES: Objective[] = [
  {
    id:          "1",
    name:        "Secure Lake",
    status:      "REQUESTED",
    description: "It is necessary to secure the lake by controlling access, monitoring...",
    lat:         47.410225,
    lng:         34.761743,
    createdAt:   "2026-04-28T13:28:00",
  },
  {
    id:          "2",
    name:        "Hold Northern Ridge",
    status:      "PLANNED",
    description: "Establish defensive positions along the northern ridge to prevent enemy advance.",
    lat:         47.521100,
    lng:         34.823410,
    createdAt:   "2026-04-29T08:14:00",
  },
];

// ─── Fire mission target SVG ──────────────────────────────────────────────────

function FireMissionTargetSVG({ batterySheaf }: { batterySheaf: string }) {
  const STROKE    = "#EC2D30";
  const FILL      = "rgba(236,45,48,0.25)";
  const FILL_DARK = "rgba(236,45,48,0.35)";

  function Crosshair({ cx, cy, r = 22 }: { cx: number; cy: number; r?: number }) {
    return (
      <>
        <line x1={cx} y1={cy - r + 4} x2={cx} y2={cy - 6}     stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
        <line x1={cx} y1={cy + 6}     x2={cx} y2={cy + r - 4} stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
        <line x1={cx - r + 4} y1={cy} x2={cx - 6}     y2={cy} stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
        <line x1={cx + 6}     y1={cy} x2={cx + r - 4} y2={cy} stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={3} fill={STROKE} />
      </>
    );
  }

  if (batterySheaf === "linear") {
    return (
      <svg width="80" height="180" viewBox="0 0 80 180" style={{ display: "block", pointerEvents: "none" }}>
        <circle cx="40" cy="40"  r="34" fill={FILL_DARK} stroke={STROKE} strokeWidth="2" strokeDasharray="6 3" />
        <circle cx="40" cy="90"  r="36" fill={FILL}      stroke={STROKE} strokeWidth="2" />
        <Crosshair cx={40} cy={90} r={36} />
        <circle cx="40" cy="140" r="34" fill={FILL_DARK} stroke={STROKE} strokeWidth="2" strokeDasharray="6 3" />
      </svg>
    );
  }

  if (batterySheaf === "circular") {
    return (
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ display: "block", pointerEvents: "none" }}>
        <circle cx="60" cy="60" r="54" fill="none" stroke={STROKE} strokeWidth="1.5" strokeDasharray="6 3" opacity="0.5" />
        <circle cx="60" cy="60" r="36" fill={FILL}  stroke={STROKE} strokeWidth="2" />
        <Crosshair cx={60} cy={60} r={36} />
      </svg>
    );
  }

  if (batterySheaf === "parallel") {
    return (
      <svg width="200" height="80" viewBox="0 0 200 80" style={{ display: "block", pointerEvents: "none" }}>
        <circle cx="40"  cy="40" r="34" fill={FILL_DARK} stroke={STROKE} strokeWidth="2" strokeDasharray="6 3" />
        <circle cx="100" cy="40" r="36" fill={FILL}      stroke={STROKE} strokeWidth="2" />
        <Crosshair cx={100} cy={40} r={36} />
        <circle cx="160" cy="40" r="34" fill={FILL_DARK} stroke={STROKE} strokeWidth="2" strokeDasharray="6 3" />
      </svg>
    );
  }

  return (
    <svg width="80" height="80" viewBox="0 0 80 80" style={{ display: "block", pointerEvents: "none" }}>
      <circle cx="40" cy="40" r="36" fill={FILL} stroke={STROKE} strokeWidth="2" />
      <Crosshair cx={40} cy={40} r={36} />
    </svg>
  );
}

// ─── Objective markers ────────────────────────────────────────────────────────

// ─── Single objective marker with tooltip ─────────────────────────────────────

function ObjectiveMarker({
  objective,
  isHovered,
  isPulsing,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  objective:    Objective;
  isHovered:    boolean;
  isPulsing:    boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick:      () => void;
}) {
  return (
    <div
      className="relative flex flex-col items-center cursor-pointer"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{ userSelect: "none" }}
    >
      {isHovered && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[6px] whitespace-nowrap pointer-events-none z-50"
          style={{
            backgroundColor: "#0D1112",
            border:          "1px solid #232E33",
            borderRadius:    "4px",
            padding:         "4px 10px",
            boxShadow:       "0px 2px 8px rgba(0,0,0,0.4)",
            maxWidth:        "200px",
            overflow:        "hidden",
            textOverflow:    "ellipsis",
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize:   "12px",
              lineHeight: "14px",
              fontWeight: 400,
              color:      "#FFFFFF",
            }}
          >
            {objective.name}
          </span>
        </div>
      )}

      <div style={{ animation: isPulsing ? "pulse 1s ease-in-out infinite" : "none" }}>
        <img
          src="/icons/map/target.svg"
          alt={objective.name}
          style={{ width: 36, height: 36, display: "block" }}
          draggable={false}
        />
      </div>
    </div>
  );
}

// ─── All objective markers ─────────────────────────────────────────────────────

function ObjectiveMarkers({
  objectives,
  hoveredObjectiveId,
  hoveredCardId,
  selectedObjectiveId,
  onMarkerHover,
  onMarkerHoverEnd,
  onMarkerClick,
}: {
  objectives:          Objective[];
  hoveredObjectiveId:  string | null;
  hoveredCardId:       string | null;
  selectedObjectiveId: string | null;
  onMarkerHover:       (id: string) => void;
  onMarkerHoverEnd:    () => void;
  onMarkerClick:       (id: string) => void;
}) {
  return (
    <>
      {objectives.map((obj) => (
        <Marker key={obj.id} longitude={obj.lng} latitude={obj.lat} anchor="center">
          <ObjectiveMarker
            objective={obj}
            isHovered={hoveredObjectiveId === obj.id}
            isPulsing={hoveredCardId === obj.id || selectedObjectiveId === obj.id}
            onMouseEnter={() => onMarkerHover(obj.id)}
            onMouseLeave={onMarkerHoverEnd}
            onClick={() => onMarkerClick(obj.id)}
          />
        </Marker>
      ))}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MapPage() {
  const navigate        = useNavigate();
  const mapRef          = useRef<MapRef>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const { role } = useUserRole();
  const isCommander = role === "commander";

  // Objectives state (shared between map markers and panel list)
  const [objectives, setObjectives] = useState<Objective[]>(INITIAL_OBJECTIVES);
  const [plans,      setPlans]      = useState<Plan[]>([]);

  // Unit interaction state
  const [hoveredUnitId,  setHoveredUnitId]  = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Scenario state
  const [isAddingScenario, setIsAddingScenario] = useState(false);
  const [scenarioForPlan,    setScenarioForPlan]    = useState<Plan | null>(null);
  const [scenarioMode,       setScenarioMode]       = useState<ScenarioMode>("move_units");
  const [unitMoves,          setUnitMoves]          = useState<UnitMove[]>([]);
  const [pendingMove,        setPendingMove]        = useState<UnitMove | null>(null);
  const [pendingMoveToInput, setPendingMoveToInput] = useState("");
  const [isToInputValid,     setIsToInputValid]     = useState(false);
  const [scenarioActions,    setScenarioActions]    = useState<ScenarioAction[]>([]);

  // Fire mission state
  const [fireMissionCrosshairPos,  setFireMissionCrosshairPos]  = useState<{x:number;y:number}|null>(null);
  const [isFireMissionDragging,    setIsFireMissionDragging]    = useState(false);
  const [pendingFireMission,       setPendingFireMission]       = useState<PendingFireMission|null>(null);
  const [fireMissionForm,          setFireMissionForm]          = useState({ targetType:"", weaponType:"", batterySheaf:"", fireType:"" });
  const [confirmedFireMissions,    setConfirmedFireMissions]    = useState<ConfirmedFireMission[]>([]);

  // Finalize dialog state
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
  const [finalizeForm, setFinalizeForm] = useState({
    name: "", color: "", execMode: "standalone" as "standalone" | "dependent", date: "", time: "", dependsOnId: "",
  });
  const [finalizeErrors, setFinalizeErrors] = useState({ name: false, color: false, date: false, time: false, dependsOn: false });
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [mapToast, setMapToast] = useState<{ message: string } | null>(null);

  // Hover state: marker hover highlights card; card hover pulses marker
  const [hoveredObjectiveId,  setHoveredObjectiveId]  = useState<string | null>(null);
  const [hoveredCardId,       setHoveredCardId]       = useState<string | null>(null);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null);

  // Scenario selection (shows actions on map)
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const selectedScenario = useMemo(
    () => savedScenarios.find((s) => s.id === selectedScenarioId) ?? null,
    [selectedScenarioId, savedScenarios],
  );

  function handleObjectiveClick(id: string) {
    setSelectedObjectiveId((prev) => (prev === id ? null : id));
  }

  // Create-objective form state
  const [isCreating,     setIsCreating]     = useState(false);
  const [mapClickCoords, setMapClickCoords] = useState("");
  const [crosshairPos,   setCrosshairPos]   = useState({ x: 0, y: 0 });
  const [isDragging,     setIsDragging]     = useState(false);

  // Center crosshair and clear coords when form opens
  useEffect(() => {
    if (!isCreating) return;
    const el = mapContainerRef.current;
    if (el) setCrosshairPos({ x: el.offsetWidth / 2, y: el.offsetHeight / 2 });
    setMapClickCoords("");
  }, [isCreating]);

  // Pixel → geo coordinates
  const updateCoordsFromPixel = useCallback((x: number, y: number) => {
    const map = mapRef.current;
    if (!map) return;
    const { lat, lng } = map.unproject([x, y]);
    setMapClickCoords(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  }, []);

  // Keyboard arrow keys move crosshair
  useEffect(() => {
    if (!isCreating) return;
    const STEP = 20;

    function onKeyDown(e: KeyboardEvent) {
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
      e.preventDefault();
      e.stopPropagation();
      setCrosshairPos((prev) => {
        const el = mapContainerRef.current;
        const w  = el ? el.offsetWidth  : Infinity;
        const h  = el ? el.offsetHeight : Infinity;
        let { x, y } = prev;
        if (e.key === "ArrowLeft")  x = Math.max(0, x - STEP);
        if (e.key === "ArrowRight") x = Math.min(w, x + STEP);
        if (e.key === "ArrowUp")    y = Math.max(0, y - STEP);
        if (e.key === "ArrowDown")  y = Math.min(h, y + STEP);
        updateCoordsFromPixel(x, y);
        return { x, y };
      });
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isCreating, updateCoordsFromPixel]);

  // Mouse drag on crosshair
  function handleCrosshairMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startX      = crosshairPos.x;
    const startY      = crosshairPos.y;
    setIsDragging(true);

    function onMouseMove(ev: MouseEvent) {
      const el = mapContainerRef.current;
      const w  = el ? el.offsetWidth  : Infinity;
      const h  = el ? el.offsetHeight : Infinity;
      const newX = Math.max(0, Math.min(startX + ev.clientX - startMouseX, w));
      const newY = Math.max(0, Math.min(startY + ev.clientY - startMouseY, h));
      setCrosshairPos({ x: newX, y: newY });
      updateCoordsFromPixel(newX, newY);
    }

    function onMouseUp() {
      setIsDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup",   onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup",   onMouseUp);
  }

  function handleStartCreating() { setIsCreating(true); }

  function handleStopCreating() {
    setIsCreating(false);
    setMapClickCoords("");
    setIsDragging(false);
  }

  useEffect(() => {
    if (!isCommander && isCreating) handleStopCreating();
  }, [isCommander]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scenario handlers ──────────────────────────────────────────────────────

  function handleAddScenario(plan: Plan) {
    setSelectedScenarioId(null);
    setIsAddingScenario(true);
    setScenarioForPlan(plan);
    setScenarioMode("move_units");
    setUnitMoves([]);
    setPendingMove(null);
    setPendingMoveToInput("");
    setIsToInputValid(false);
    setScenarioActions([]);
    setFireMissionCrosshairPos(null);
    setPendingFireMission(null);
    setFireMissionForm({ targetType:"", weaponType:"", batterySheaf:"", fireType:"" });
    setConfirmedFireMissions([]);
  }

  // Init "To" input whenever a new pending move is set
  useEffect(() => {
    if (pendingMove) {
      const val = `${pendingMove.toLat.toFixed(6)}, ${pendingMove.toLng.toFixed(6)}`;
      setPendingMoveToInput(val);
      setIsToInputValid(true);
    }
  }, [pendingMove]);

  function handleToInputBlur(value: string) {
    const parts = value.split(",").map((s) => s.trim());
    const lat   = parseFloat(parts[0]);
    const lng   = parseFloat(parts[1]);
    const valid = !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    setIsToInputValid(valid);
  }

  // Units at their current positions (incorporating confirmed moves)
  const currentUnits = useMemo(() =>
    MOCK_UNITS.map((unit) => {
      const move = unitMoves.find((m) => m.unitId === unit.id);
      return move ? { ...unit, lat: move.toLat, lng: move.toLng } : unit;
    }),
  [unitMoves]);

  function handleUnitDragEnd(unit: MapUnit, lngLat: { lat: number; lng: number }) {
    if (!unit.unitType.startsWith("Squad")) return;
    if (unit.disabled) return;
    const existing = unitMoves.find((m) => m.unitId === unit.id);
    setPendingMove({
      unitId:   unit.id,
      unitName: unit.name,
      fromLat:  existing ? existing.fromLat : unit.lat,
      fromLng:  existing ? existing.fromLng : unit.lng,
      toLat:    lngLat.lat,
      toLng:    lngLat.lng,
    });
  }

  function handleConfirmMove() {
    if (!pendingMove) return;
    const parts = pendingMoveToInput.split(",").map((s) => s.trim());
    const toLat = parseFloat(parts[0]);
    const toLng = parseFloat(parts[1]);

    setUnitMoves((prev) => [
      ...prev.filter((m) => m.unitId !== pendingMove.unitId),
      { ...pendingMove, toLat, toLng },
    ]);

    const newAction: ScenarioAction = {
      id:       Date.now().toString(),
      unitId:   pendingMove.unitId,
      unitName: pendingMove.unitName,
      fromLat:  pendingMove.fromLat,
      fromLng:  pendingMove.fromLng,
      toLat,
      toLng,
      type:     "move",
    };
    setScenarioActions((prev) => [
      ...prev.filter((a) => a.type !== "move" || a.unitId !== pendingMove.unitId),
      newAction,
    ]);

    setPendingMove(null);
    setPendingMoveToInput("");
    setIsToInputValid(false);
  }

  function handleCancelMove() {
    setPendingMove(null);
    setPendingMoveToInput("");
    setIsToInputValid(false);
  }

  function handlePendingMoveToInputChange(v: string) {
    setPendingMoveToInput(v);
    setIsToInputValid(false);
  }

  function handleFireMissionFormChange(updates: Partial<typeof fireMissionForm>) {
    setFireMissionForm((prev) => ({ ...prev, ...updates }));
  }

  function handleDeleteAction(id: string) {
    setScenarioActions((prev) => prev.filter((a) => a.id !== id));
  }

  const hasActiveAction = pendingMove !== null || pendingFireMission !== null;

  function handleBackFromScenario() {
    setIsAddingScenario(false);
    setScenarioForPlan(null);
    setUnitMoves([]);
    setPendingMove(null);
    setPendingMoveToInput("");
    setIsToInputValid(false);
    setScenarioActions([]);
    setSelectedUnitId(null);
    setFireMissionCrosshairPos(null);
    setPendingFireMission(null);
    setFireMissionForm({ targetType:"", weaponType:"", batterySheaf:"", fireType:"" });
    setConfirmedFireMissions([]);
  }

  function handleScenarioModeChange(mode: ScenarioMode) {
    setScenarioMode(mode);
    setPendingFireMission(null);
    setFireMissionForm({ targetType:"", weaponType:"", batterySheaf:"", fireType:"" });
    setFireMissionCrosshairPos(null);
  }

  // Init fire mission crosshair at map center when entering fire_mission mode
  useEffect(() => {
    if (isAddingScenario && scenarioMode === "fire_mission" && mapContainerRef.current) {
      const el = mapContainerRef.current;
      setFireMissionCrosshairPos({ x: el.offsetWidth / 2, y: el.offsetHeight / 2 });
    }
  }, [isAddingScenario, scenarioMode]);

  // Arrow keys move fire mission crosshair
  useEffect(() => {
    if (!isAddingScenario || scenarioMode !== "fire_mission") return;
    const STEP = 20;
    function onKey(e: KeyboardEvent) {
      if (!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) return;
      e.preventDefault();
      setFireMissionCrosshairPos((prev) => {
        if (!prev) return prev;
        const el = mapContainerRef.current;
        const w  = el ? el.offsetWidth  : Infinity;
        const h  = el ? el.offsetHeight : Infinity;
        let { x, y } = prev;
        if (e.key === "ArrowLeft")  x = Math.max(0, x - STEP);
        if (e.key === "ArrowRight") x = Math.min(w, x + STEP);
        if (e.key === "ArrowUp")    y = Math.max(0, y - STEP);
        if (e.key === "ArrowDown")  y = Math.min(h, y + STEP);
        return { x, y };
      });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAddingScenario, scenarioMode]);

  function handleFireMissionCrosshairMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    setIsFireMissionDragging(true);

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startX      = fireMissionCrosshairPos?.x ?? 0;
    const startY      = fireMissionCrosshairPos?.y ?? 0;
    let lastPos       = { x: startX, y: startY };

    function onMove(ev: MouseEvent) {
      const el = mapContainerRef.current;
      const w  = el ? el.offsetWidth  : Infinity;
      const h  = el ? el.offsetHeight : Infinity;
      const newX = Math.max(0, Math.min(startX + ev.clientX - startMouseX, w));
      const newY = Math.max(0, Math.min(startY + ev.clientY - startMouseY, h));
      lastPos = { x: newX, y: newY };
      setFireMissionCrosshairPos(lastPos);
    }

    function onUp() {
      setIsFireMissionDragging(false);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      triggerFireMissionDrop(lastPos);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  function triggerFireMissionDrop(pos: {x:number; y:number}) {
    const map = mapRef.current;
    if (!map) return;
    const lngLat = map.unproject([pos.x, pos.y]);
    setFireMissionForm({ targetType:"", weaponType:"", batterySheaf:"", fireType:"" });
    setPendingFireMission({ lat: lngLat.lat, lng: lngLat.lng });
  }

  function handleConfirmFireMission() {
    if (!pendingFireMission) return;
    const missionCount = confirmedFireMissions.length + 1;
    const name = `Fire Mission ${toRoman(missionCount)}`;
    const newMission: ConfirmedFireMission = {
      id:          Date.now().toString(),
      lat:         pendingFireMission.lat,
      lng:         pendingFireMission.lng,
      name,
      targetType:  fireMissionForm.targetType,
      weaponType:  fireMissionForm.weaponType,
      batterySheaf: fireMissionForm.batterySheaf,
      fireType:    fireMissionForm.fireType,
    };
    setConfirmedFireMissions((prev) => [...prev, newMission]);
    setScenarioActions((prev) => [...prev, {
      id:          newMission.id,
      type:        "fire_mission" as const,
      name,
      lat:         pendingFireMission.lat,
      lng:         pendingFireMission.lng,
      targetType:  fireMissionForm.targetType,
      weaponType:  fireMissionForm.weaponType,
      batterySheaf: fireMissionForm.batterySheaf,
      fireType:    fireMissionForm.fireType,
    }]);
    setPendingFireMission(null);
    setFireMissionForm({ targetType:"", weaponType:"", batterySheaf:"", fireType:"" });
    // Reset crosshair to center for next fire mission
    if (mapContainerRef.current) {
      const el = mapContainerRef.current;
      setFireMissionCrosshairPos({ x: el.offsetWidth / 2, y: el.offsetHeight / 2 });
    }
  }

  function handleCancelFireMission() {
    setPendingFireMission(null);
    setFireMissionForm({ targetType:"", weaponType:"", batterySheaf:"", fireType:"" });
    if (mapContainerRef.current) {
      const el = mapContainerRef.current;
      setFireMissionCrosshairPos({ x: el.offsetWidth / 2, y: el.offsetHeight / 2 });
    }
  }

  const BLANK_FINALIZE_FORM = { name: "", color: "", execMode: "standalone" as const, date: "", time: "", dependsOnId: "" };
  const BLANK_FINALIZE_ERRORS = { name: false, color: false, date: false, time: false, dependsOn: false };

  function handleCancelFinalize() {
    setShowFinalizeDialog(false);
    setFinalizeForm(BLANK_FINALIZE_FORM);
    setFinalizeErrors(BLANK_FINALIZE_ERRORS);
  }

  function handleSaveScenario() {
    const isStandalone = finalizeForm.execMode === "standalone";
    const isDependent  = finalizeForm.execMode === "dependent";
    const errors = {
      name:      !finalizeForm.name.trim(),
      color:     !finalizeForm.color,
      date:      isStandalone && !finalizeForm.date,
      time:      isStandalone && !finalizeForm.time,
      dependsOn: isDependent  && !finalizeForm.dependsOnId,
    };
    if (Object.values(errors).some(Boolean)) {
      setFinalizeErrors(errors);
      return;
    }

    let execDate = finalizeForm.date;
    let execTime = finalizeForm.time;
    if (isDependent && finalizeForm.dependsOnId) {
      const parent = savedScenarios.find((s) => s.id === finalizeForm.dependsOnId);
      if (parent) { execDate = parent.date; execTime = parent.time; }
    }

    const newScenario: SavedScenario = {
      id:          Date.now().toString(),
      planId:      scenarioForPlan?.id ?? "",
      name:        finalizeForm.name,
      color:       finalizeForm.color,
      execMode:    finalizeForm.execMode,
      date:        execDate,
      time:        execTime,
      dependsOnId: finalizeForm.dependsOnId || null,
      actions:     scenarioActions,
      createdAt:   new Date().toISOString(),
    };
    setSavedScenarios((prev) => [...prev, newScenario]);

    const savedName = finalizeForm.name;
    setShowFinalizeDialog(false);
    setFinalizeForm(BLANK_FINALIZE_FORM);
    setFinalizeErrors(BLANK_FINALIZE_ERRORS);
    setIsAddingScenario(false);
    setScenarioForPlan(null);
    setUnitMoves([]);
    setPendingMove(null);
    setPendingMoveToInput("");
    setIsToInputValid(false);
    setScenarioActions([]);
    setSelectedUnitId(null);
    setFireMissionCrosshairPos(null);
    setPendingFireMission(null);
    setFireMissionForm({ targetType: "", weaponType: "", batterySheaf: "", fireType: "" });
    setConfirmedFireMissions([]);
    setMapToast({ message: `"${savedName}" has been added to the plan.` });
  }

  useEffect(() => {
    if (!showFinalizeDialog) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleCancelFinalize();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showFinalizeDialog]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapToast) return;
    const t = setTimeout(() => setMapToast(null), 3000);
    return () => clearTimeout(t);
  }, [mapToast]);

  void scenarioForPlan;

  function handleMarkAsRecommended(planId: string) {
    setPlans((prev) => {
      const targetPlan = prev.find((p) => p.id === planId);
      if (!targetPlan) return prev;
      const objectiveId = targetPlan.objectiveId;
      return prev.map((p) => {
        if (p.objectiveId !== objectiveId) return p;
        if (p.id !== planId) return { ...p, isRecommended: false };
        return { ...p, isRecommended: !p.isRecommended };
      });
    });
  }

  function handleDeleteScenario(id: string) {
    setSavedScenarios((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="flex h-screen overflow-hidden bg-secondary-900 font-sans">
      <Navbar
        items={NAV_ITEMS}
        activeId="map"
        defaultVariant="collapsed"
        onNavigate={(id) => {
          const item = NAV_ITEMS.find((i) => i.id === id);
          if (item?.href) navigate(item.href);
        }}
      />

      {/* Map container */}
      <div ref={mapContainerRef} className="flex-1 relative overflow-hidden">
        <Map
          ref={mapRef}
          id="main-map"
          initialViewState={{ longitude: 34.3960, latitude: 47.5680, zoom: 11 }}
          style={{ width: "100%", height: "100%", pointerEvents: isDragging ? "none" : undefined }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        >
          <MapControls />
          <ObjectiveMarkers
            objectives={objectives}
            hoveredObjectiveId={hoveredObjectiveId}
            hoveredCardId={hoveredCardId}
            selectedObjectiveId={selectedObjectiveId}
            onMarkerHover={setHoveredObjectiveId}
            onMarkerHoverEnd={() => setHoveredObjectiveId(null)}
            onMarkerClick={handleObjectiveClick}
          />

          {/* Unit hierarchy lines — always visible */}
          <Source id="unit-connections" type="geojson" data={generateUnitConnections(currentUnits)}>
            <Layer
              id="unit-connections-layer"
              type="line"
              paint={{
                "line-color":     "#FFFFFF",
                "line-width":     1.5,
                "line-opacity":   0.5,
                "line-dasharray": [4, 3],
              }}
            />
          </Source>

          {/* Movement lines — green, shown after confirm */}
          {unitMoves.length > 0 && (
            <Source id="movement-lines" type="geojson" data={generateMovementLines(unitMoves)}>
              <Layer
                id="movement-lines-layer"
                type="line"
                paint={{
                  "line-color":     "#76FFAE",
                  "line-width":     2,
                  "line-dasharray": [4, 2],
                }}
              />
            </Source>
          )}

          {/* Confirmed fire mission markers */}
          {confirmedFireMissions.map((fm) => (
            <Marker key={fm.id} longitude={fm.lng} latitude={fm.lat} anchor="center">
              <div style={{ pointerEvents: "none" }}>
                <svg width="80" height="120" viewBox="0 0 80 120" fill="none">
                  <circle cx="40" cy="20" r="18" fill="rgba(236,45,48,0.3)" stroke="#EC2D30" strokeWidth="2" strokeDasharray="4 2" />
                  <circle cx="40" cy="60" r="22" fill="rgba(236,45,48,0.2)" stroke="#EC2D30" strokeWidth="2" />
                  <circle cx="40" cy="60" r="5"  fill="#EC2D30" />
                  <circle cx="40" cy="100" r="18" fill="rgba(236,45,48,0.3)" stroke="#EC2D30" strokeWidth="2" strokeDasharray="4 2" />
                </svg>
              </div>
            </Marker>
          ))}

          {/* Pending fire mission target — stays on map while configuring */}
          {pendingFireMission && (
            <Marker longitude={pendingFireMission.lng} latitude={pendingFireMission.lat} anchor="center">
              <FireMissionTargetSVG batterySheaf={fireMissionForm.batterySheaf} />
            </Marker>
          )}

          {/* Selected scenario move lines */}
          {selectedScenario && selectedScenario.actions.some((a) => a.type === "move") && (
            <Source
              id="selected-scenario-lines"
              type="geojson"
              data={generateMovementLines(
                selectedScenario.actions.filter(
                  (a): a is Extract<ScenarioAction, { type: "move" }> => a.type === "move",
                ),
              )}
            >
              <Layer
                id="selected-scenario-lines-layer"
                type="line"
                paint={{ "line-color": "#76FFAE", "line-width": 2, "line-dasharray": [4, 2] }}
              />
            </Source>
          )}

          {/* Selected scenario ghost (from) markers */}
          {selectedScenario && selectedScenario.actions
            .filter((a): a is Extract<ScenarioAction, { type: "move" }> => a.type === "move")
            .map((a) => {
              const unit = MOCK_UNITS.find((u) => u.id === a.unitId);
              if (!unit) return null;
              return (
                <Marker key={`sel-ghost-${a.id}`} longitude={a.fromLng} latitude={a.fromLat} anchor="center">
                  <div style={{ opacity: 0.4, pointerEvents: "none" }}>
                    <UnitMarkerSVG unitType={unit.unitType} />
                  </div>
                </Marker>
              );
            })
          }

          {/* Selected scenario destination (to) markers */}
          {selectedScenario && selectedScenario.actions
            .filter((a): a is Extract<ScenarioAction, { type: "move" }> => a.type === "move")
            .map((a) => {
              const unit = MOCK_UNITS.find((u) => u.id === a.unitId);
              if (!unit) return null;
              return (
                <Marker key={`sel-dest-${a.id}`} longitude={a.toLng} latitude={a.toLat} anchor="center">
                  <div style={{ pointerEvents: "none" }}>
                    <UnitMarkerSVG unitType={unit.unitType} />
                  </div>
                </Marker>
              );
            })
          }

          {/* Selected scenario fire mission markers */}
          {selectedScenario && selectedScenario.actions
            .filter((a): a is Extract<ScenarioAction, { type: "fire_mission" }> => a.type === "fire_mission")
            .map((a) => (
              <Marker key={`sel-fm-${a.id}`} longitude={a.lng} latitude={a.lat} anchor="center">
                <div style={{ pointerEvents: "none" }}>
                  <FireMissionTargetSVG batterySheaf={a.batterySheaf} />
                </div>
              </Marker>
            ))
          }

          {/* Unit markers — always visible */}
          {currentUnits.map((unit) => {
            const originalUnit = MOCK_UNITS.find((u) => u.id === unit.id)!;
            const move         = unitMoves.find((m) => m.unitId === unit.id);
            const isSquad      = unit.unitType.startsWith("Squad");
            const canDrag      = isAddingScenario && scenarioMode === "move_units" && isSquad && !unit.disabled;
            const isHovered    = hoveredUnitId  === unit.id;
            const isSelected   = selectedUnitId === unit.id;

            return (
              <Fragment key={unit.id}>
                {/* Ghost at original position when unit has been moved */}
                {move && (
                  <Marker longitude={originalUnit.lng} latitude={originalUnit.lat} anchor="center">
                    <div style={{ opacity: 0.5, pointerEvents: "none" }}>
                      <UnitMarkerSVG unitType={unit.unitType} disabled />
                    </div>
                  </Marker>
                )}

                {/* Current / draggable marker */}
                <Marker
                  longitude={unit.lng}
                  latitude={unit.lat}
                  anchor="center"
                  draggable={canDrag}
                  onDragEnd={(e) => handleUnitDragEnd(originalUnit, { lat: e.lngLat.lat, lng: e.lngLat.lng })}
                >
                  <div
                    onMouseEnter={() => setHoveredUnitId(unit.id)}
                    onMouseLeave={() => setHoveredUnitId(null)}
                    onClick={() => setSelectedUnitId((prev) => prev === unit.id ? null : unit.id)}
                    style={{ cursor: canDrag ? "grab" : "default" }}
                  >
                    <UnitMarkerSVG
                      unitType={unit.unitType}
                      disabled={!!unit.disabled}
                      hovered={isHovered}
                      selected={isSelected}
                    />
                  </div>
                </Marker>
              </Fragment>
            );
          })}
        </Map>

        {/* Draggable crosshair — Commander only */}
        {isCommander && isCreating && (
          <div
            style={{
              position:      "absolute",
              left:          crosshairPos.x,
              top:           crosshairPos.y,
              transform:     "translate(-50%, -50%)",
              zIndex:        20,
              cursor:        isDragging ? "grabbing" : "grab",
              pointerEvents: "all",
              userSelect:    "none",
            }}
            onMouseDown={handleCrosshairMouseDown}
          >
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#EC2D30" strokeWidth="2" />
              <line x1="24" y1="4"  x2="24" y2="44" stroke="#EC2D30" strokeWidth="2" />
              <line x1="4"  y1="24" x2="44" y2="24" stroke="#EC2D30" strokeWidth="2" />
              <circle cx="24" cy="24" r="3" fill="#EC2D30" />
            </svg>
          </div>
        )}

        {/* Fire mission crosshair */}
        {isAddingScenario && scenarioMode === "fire_mission" && fireMissionCrosshairPos && !pendingFireMission && (
          <div
            style={{
              position:      "absolute",
              left:          fireMissionCrosshairPos.x,
              top:           fireMissionCrosshairPos.y,
              transform:     "translate(-50%, -50%)",
              zIndex:        20,
              cursor:        isFireMissionDragging ? "grabbing" : "grab",
              pointerEvents: "all",
              userSelect:    "none",
            }}
            onMouseDown={handleFireMissionCrosshairMouseDown}
          >
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#EC2D30" strokeWidth="2" />
              <line x1="24" y1="4"  x2="24" y2="44" stroke="#EC2D30" strokeWidth="2" />
              <line x1="4"  y1="24" x2="44" y2="24" stroke="#EC2D30" strokeWidth="2" />
              <circle cx="24" cy="24" r="3" fill="#EC2D30" />
            </svg>
          </div>
        )}

        {/* Scenario mode toggle — centered top of map */}
        {isAddingScenario && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center bg-[#0D1112] border border-[#161D20] rounded-[8px] p-[6px] gap-[4px]">
            <button
              disabled={hasActiveAction}
              onClick={() => !hasActiveAction && handleScenarioModeChange("move_units")}
              className={`flex items-center justify-center px-[20px] py-[8px] rounded-[4px] min-w-[140px] text-[14px] font-semibold font-['Inter'] transition-colors duration-150 ${hasActiveAction ? "opacity-40 cursor-not-allowed" : "cursor-pointer"} ${scenarioMode === "move_units" ? "bg-[#0C9D61] text-white" : "bg-transparent text-[#0C9D61] hover:bg-[#0C9D61]/10"}`}
            >
              Move Units
            </button>
            <button
              disabled={hasActiveAction}
              onClick={() => !hasActiveAction && handleScenarioModeChange("fire_mission")}
              className={`flex items-center justify-center px-[20px] py-[8px] rounded-[4px] min-w-[140px] text-[14px] font-semibold font-['Inter'] transition-colors duration-150 ${hasActiveAction ? "opacity-40 cursor-not-allowed" : "cursor-pointer"} ${scenarioMode === "fire_mission" ? "bg-[#0C9D61] text-white" : "bg-transparent text-[#0C9D61] hover:bg-[#0C9D61]/10"}`}
            >
              Fire Mission
            </button>
          </div>
        )}

        {/* Contextual instruction tooltip — bottom-left */}
        {isAddingScenario && !pendingMove && !pendingFireMission && (
          <div className="absolute bottom-20 left-4 z-20 w-[320px] bg-[#0D1112] border border-[#232E33] rounded-[8px] px-4 py-3 shadow-[0px_4px_16px_rgba(0,0,0,0.4)]">
            {scenarioMode === "move_units" ? (
              <p className="text-[#9A999A] text-[13px] font-['Inter'] leading-[18px]">
                Drag a <span className="text-white font-semibold">squad unit</span> to its new position, then drop to confirm the move.
              </p>
            ) : (
              <p className="text-[#9A999A] text-[13px] font-['Inter'] leading-[18px]">
                Drag the <span className="text-white font-semibold">red crosshair</span> to the target location, then drop to configure the fire mission.
              </p>
            )}
          </div>
        )}
      </div>

      <PlanningPanel
        isCreating={isCreating}
        onStartCreating={handleStartCreating}
        onStopCreating={handleStopCreating}
        mapClickCoords={mapClickCoords}
        objectives={objectives}
        onCreateObjective={(obj) => setObjectives((prev) => [obj, ...prev])}
        onDeleteObjective={(id) => setObjectives((prev) => prev.filter((o) => o.id !== id))}
        plans={plans}
        onPlanCreated={(plan) => setPlans((prev) => [...prev, plan])}
        onDeletePlan={(planId) => {
          setPlans((prev) => prev.filter((p) => p.id !== planId));
          setSavedScenarios((prev) => prev.filter((s) => s.planId !== planId));
        }}
        hoveredObjectiveId={hoveredObjectiveId}
        hoveredCardId={hoveredCardId}
        selectedObjectiveId={selectedObjectiveId}
        onCardHover={setHoveredCardId}
        onCardHoverEnd={() => setHoveredCardId(null)}
        onCardClick={handleObjectiveClick}
        isAddingScenario={isAddingScenario}
        scenarioActions={scenarioActions}
        onAddScenario={handleAddScenario}
        onBackFromScenario={handleBackFromScenario}
        onCreateScenario={() => setShowFinalizeDialog(true)}
        onDeleteAction={handleDeleteAction}
        pendingMove={pendingMove}
        pendingMoveToInput={pendingMoveToInput}
        isToInputValid={isToInputValid}
        onPendingMoveToInputChange={handlePendingMoveToInputChange}
        onPendingMoveToInputBlur={handleToInputBlur}
        onConfirmMove={handleConfirmMove}
        onCancelMove={handleCancelMove}
        pendingFireMission={pendingFireMission}
        fireMissionForm={fireMissionForm}
        onFireMissionFormChange={handleFireMissionFormChange}
        onConfirmFireMission={handleConfirmFireMission}
        onCancelFireMission={handleCancelFireMission}
        savedScenarios={savedScenarios}
        onDeleteScenario={handleDeleteScenario}
        onMarkRecommended={handleMarkAsRecommended}
        selectedScenarioId={selectedScenarioId}
        onScenarioSelect={setSelectedScenarioId}
      />

      {/* Finalize Your Scenario dialog */}
      {showFinalizeDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75">
          <div className="bg-[#0A0D0E] border border-[#101517] rounded-[8px] p-6 w-[560px] shadow-[0px_8px_32px_rgba(0,0,0,0.6)]">
            <h2 className="text-white text-[24px] font-semibold font-['Inter'] mb-2">
              Finalize Your Scenario
            </h2>
            <p className="text-[#9A999A] text-[14px] font-normal font-['Inter'] mb-6">
              Set the plan name, choose its color, and define the execution time to complete the setup.
            </p>

            {/* Name */}
            <div className="mb-4">
              <label className="block mb-1">
                <span className="text-white text-[12px] font-normal font-['Inter']">Name</span>
                <span className="text-[#EB6F70] ml-1">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. secure river crossing"
                value={finalizeForm.name}
                onChange={(e) => {
                  setFinalizeForm((p) => ({ ...p, name: e.target.value }));
                  if (finalizeErrors.name) setFinalizeErrors((p) => ({ ...p, name: false }));
                }}
                className={`w-full bg-[#0D1112] rounded-[4px] px-3 py-3 text-white text-[14px] placeholder:text-[#9A999A] border outline-none transition-colors font-['Inter'] ${
                  finalizeErrors.name ? "border-[#F64C4C]" : "border-[#161D20] focus:border-[#3A70E2]"
                }`}
              />
              {finalizeErrors.name && (
                <p className="text-[#F64C4C] text-[12px] mt-1">Name is required</p>
              )}
            </div>

            {/* Select Scenario Color */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-white text-[12px] font-normal font-['Inter']">Select Scenario Color</span>
                <span className="text-[#EB6F70] ml-1">*</span>
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                {SCENARIO_COLORS.map((color) => {
                  const isSelected = finalizeForm.color === color.value;
                  return (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => { setFinalizeForm((p) => ({ ...p, color: color.value })); setFinalizeErrors((p) => ({ ...p, color: false })); }}
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <div className={`size-[18px] rounded-[3px] border flex items-center justify-center transition-colors duration-150 shrink-0 ${isSelected ? "bg-[#3A70E2] border-[#3A70E2]" : "bg-transparent border-[#555455]"}`}>
                        {isSelected && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div className="size-[20px] rounded-full shrink-0" style={{ backgroundColor: color.hex }} />
                    </button>
                  );
                })}
              </div>
              {finalizeErrors.color && (
                <p className="text-[#F64C4C] text-[12px] mt-1">Please select a color</p>
              )}
            </div>

            {/* Execution Time Settings */}
            <div className="mb-4">
              <h3 className="text-white text-[16px] font-semibold font-['Inter'] mb-3">
                Execution Time Settings
              </h3>

              <div className="flex w-full border border-[#161D20] rounded-[4px] mb-4 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setFinalizeForm((p) => ({ ...p, execMode: "standalone" }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-[10px] text-[14px] font-semibold font-['Inter'] transition-colors duration-150 cursor-pointer rounded-[4px] ${
                    finalizeForm.execMode === "standalone"
                      ? "bg-[#0C9D61] text-white"
                      : "bg-transparent text-[#0C9D61] hover:bg-[#0C9D61]/10"
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Standalone
                </button>
                <button
                  type="button"
                  onClick={() => setFinalizeForm((p) => ({ ...p, execMode: "dependent" }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-[10px] text-[14px] font-semibold font-['Inter'] transition-colors duration-150 cursor-pointer rounded-[4px] ${
                    finalizeForm.execMode === "dependent"
                      ? "bg-[#0C9D61] text-white"
                      : "bg-transparent text-[#0C9D61] hover:bg-[#0C9D61]/10"
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 8a3 3 0 0 0 4.5.75l1.5-1.5a3 3 0 0 0-4.24-4.24l-.86.85" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M10 8a3 3 0 0 0-4.5-.75l-1.5 1.5a3 3 0 0 0 4.24 4.24l.85-.85" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Dependent
                </button>
              </div>

              {finalizeForm.execMode === "standalone" && (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-white text-[12px] font-normal font-['Inter'] block mb-1">Date</label>
                    <input
                      type="date"
                      value={finalizeForm.date}
                      onChange={(e) => {
                        setFinalizeForm((p) => ({ ...p, date: e.target.value }));
                        if (finalizeErrors.date) setFinalizeErrors((p) => ({ ...p, date: false }));
                      }}
                      className={`w-full bg-[#0D1112] rounded-[4px] px-3 py-3 text-white text-[14px] border outline-none transition-colors font-['Inter'] [color-scheme:dark] ${
                        finalizeErrors.date ? "border-[#F64C4C]" : "border-[#161D20] focus:border-[#3A70E2]"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-white text-[12px] font-normal font-['Inter'] block mb-1">Time</label>
                    <input
                      type="time"
                      value={finalizeForm.time}
                      onChange={(e) => {
                        setFinalizeForm((p) => ({ ...p, time: e.target.value }));
                        if (finalizeErrors.time) setFinalizeErrors((p) => ({ ...p, time: false }));
                      }}
                      className={`w-full bg-[#0D1112] rounded-[4px] px-3 py-3 text-white text-[14px] border outline-none transition-colors font-['Inter'] [color-scheme:dark] ${
                        finalizeErrors.time ? "border-[#F64C4C]" : "border-[#161D20] focus:border-[#3A70E2]"
                      }`}
                    />
                  </div>
                </div>
              )}

              {finalizeForm.execMode === "dependent" && (
                <div>
                  <label className="block mb-1">
                    <span className="text-white text-[12px] font-normal font-['Inter']">Depends on</span>
                    <span className="text-[#EB6F70] ml-1">*</span>
                  </label>
                  <DependsOnDropdown
                    scenarios={savedScenarios}
                    value={finalizeForm.dependsOnId}
                    onChange={(v) => { setFinalizeForm((p) => ({ ...p, dependsOnId: v })); setFinalizeErrors((p) => ({ ...p, dependsOn: false })); }}
                    hasError={finalizeErrors.dependsOn}
                  />
                  {finalizeErrors.dependsOn && (
                    <p className="text-[#F64C4C] text-[12px] mt-1">Please select a parent scenario</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" size="lg" className="flex-1" onClick={handleCancelFinalize}>Cancel</Button>
              <Button variant="primary" size="lg" className="flex-1" onClick={handleSaveScenario}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {mapToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 bg-[#0C9D61] text-white px-4 py-3 rounded-[6px] shadow-[0px_4px_16px_rgba(0,0,0,0.4)]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l4 4 6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[14px] font-semibold font-['Inter']">{mapToast.message}</span>
        </div>
      )}
    </div>
  );
}
