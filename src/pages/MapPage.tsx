import { useState, useEffect, useRef, useCallback, Fragment, useMemo } from "react";
import Map, { Marker, Source, Layer, type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router-dom";
import { Navbar, NavItemConfig } from "../components/Navbar";
import { PlanningPanel, type Objective, type Plan, type ScenarioMode, type ScenarioAction } from "../components/map/PlanningPanel";
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

// ─── Dropdown ─────────────────────────────────────────────────────────────────

interface DropdownOption { value: string; label: string; }

function Dropdown({
  placeholder,
  options,
  value,
  onChange,
  status = "default",
}: {
  placeholder: string;
  options:     DropdownOption[];
  value:       string;
  onChange:    (v: string) => void;
  status?:     "default" | "success";
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel   = options.find((o) => o.value === value)?.label;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-[#0D1112] border border-[#232E33] rounded-[4px] px-3 py-3 gap-2 hover:border-[#465C66] transition-colors duration-150 cursor-pointer"
      >
        <span className={`text-[14px] font-normal font-['Inter'] flex-1 text-left ${selectedLabel ? "text-white" : "text-[#9A999A]"}`}>
          {selectedLabel ?? placeholder}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {status === "success" && value && (
            <div className="size-[20px] rounded-full bg-[#0C9D61] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}>
            <path d="M4 6l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-[#0D1112] border border-[#232E33] rounded-[4px] overflow-hidden shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2.5 text-[14px] font-normal font-['Inter'] transition-colors duration-150 cursor-pointer ${
                opt.value === value
                  ? "text-white bg-[#161D20]"
                  : "text-[#9A999A] hover:text-white hover:bg-[#161D20]"
              }`}
            >
              {opt.label}
            </button>
          ))}
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

  // Hover state: marker hover highlights card; card hover pulses marker
  const [hoveredObjectiveId,  setHoveredObjectiveId]  = useState<string | null>(null);
  const [hoveredCardId,       setHoveredCardId]       = useState<string | null>(null);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null);

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

  function handleConfirmMove(toInput: string) {
    if (!pendingMove) return;
    const parts = toInput.split(",").map((s) => s.trim());
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

  function handleCreateScenario() {
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

  // suppress unused warning — scenarioForPlan will be used when scenario submission is wired
  void scenarioForPlan;

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

        {/* Fire mission config panel */}
        {pendingFireMission && (
          <div className="absolute top-6 right-6 z-50 bg-[#0D1112] border border-[#232E33] rounded-[8px] p-4 w-[400px] shadow-[0px_4px_24px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2 mb-4">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2C10 2 7 6 7 9C7 10.657 8.343 12 10 12C11.657 12 13 10.657 13 9C13 7 11 4 11 4C11 4 13 5 14 7C15 9 14 11 14 11C15.5 9.5 16 7 16 5C16 5 18 8 18 12C18 15.314 14.418 18 10 18C5.582 18 2 15.314 2 12C2 7 7 2 10 2Z" fill="#EC2D30" />
              </svg>
              <span className="text-white text-[16px] font-semibold font-['Inter']">Configure Fire Mission</span>
            </div>

            <div className="mb-3">
              <label className="text-[#9A999A] text-[12px] font-normal font-['Inter'] block mb-1">Target Type</label>
              <Dropdown
                placeholder="choose a target"
                options={[
                  { value: "personnel",  label: "Personnel" },
                  { value: "vehicles",   label: "Vehicles" },
                  { value: "structures", label: "Structures" },
                  { value: "equipment",  label: "Equipment / Weapon Type" },
                ]}
                value={fireMissionForm.targetType}
                onChange={(v) => setFireMissionForm((p) => ({ ...p, targetType: v }))}
                status={fireMissionForm.targetType ? "success" : "default"}
              />
            </div>

            <div className="mb-3">
              <label className="text-[#9A999A] text-[12px] font-normal font-['Inter'] block mb-1">Weapon Type</label>
              <Dropdown
                placeholder="choose a weapon"
                options={[
                  { value: "120mm_mortar",     label: "120mm Mortar" },
                  { value: "howitzer",         label: "Howitzer" },
                  { value: "drone",            label: "Drone" },
                  { value: "rocket_artillery", label: "Rocket Artillery" },
                ]}
                value={fireMissionForm.weaponType}
                onChange={(v) => setFireMissionForm((p) => ({ ...p, weaponType: v }))}
                status={fireMissionForm.weaponType ? "success" : "default"}
              />
            </div>

            <div className="mb-3">
              <label className="text-[#9A999A] text-[12px] font-normal font-['Inter'] block mb-1">Battery Sheaf</label>
              <Dropdown
                placeholder="choose a pattern"
                options={[
                  { value: "point_target", label: "Point Target" },
                  { value: "linear",       label: "Linear" },
                  { value: "circular",     label: "Circular" },
                  { value: "parallel",     label: "Parallel" },
                ]}
                value={fireMissionForm.batterySheaf}
                onChange={(v) => setFireMissionForm((p) => ({ ...p, batterySheaf: v }))}
                status={fireMissionForm.batterySheaf ? "success" : "default"}
              />
            </div>

            <div className="mb-4">
              <label className="text-[#9A999A] text-[12px] font-normal font-['Inter'] block mb-1">Fire Type</label>
              <Dropdown
                placeholder="choose a fire type"
                options={[
                  { value: "fire_for_effect", label: "Fire for Effect" },
                  { value: "illumination",    label: "Illumination" },
                  { value: "smoke",           label: "Smoke" },
                ]}
                value={fireMissionForm.fireType}
                onChange={(v) => setFireMissionForm((p) => ({ ...p, fireType: v }))}
                status={fireMissionForm.fireType ? "success" : "default"}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={handleCancelFireMission}>Cancel</Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!fireMissionForm.targetType || !fireMissionForm.weaponType || !fireMissionForm.batterySheaf || !fireMissionForm.fireType}
                onClick={handleConfirmFireMission}
              >
                Confirm
              </Button>
            </div>
          </div>
        )}

        {/* Floating confirm dialog — appears after unit drag */}
        {pendingMove && (
          <div className="absolute top-6 right-6 z-50 bg-[#0D1112] border border-[#232E33] rounded-[8px] p-4 w-[380px] shadow-[0px_4px_24px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2 mb-4">
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                <path d="M1 8h14M10 1l7 7-7 7" stroke="#4BA1FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1 8h8" stroke="#4BA1FF" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-white text-[16px] font-semibold font-['Inter']">
                Move {pendingMove.unitName}
              </span>
            </div>

            {/* From — read only */}
            <div className="mb-3">
              <label className="text-[#9A999A] text-[12px] font-normal font-['Inter'] block mb-1">From:</label>
              <div className="flex items-center justify-between bg-[#0D1112] border border-[#6BC497] rounded-[4px] px-3 py-3">
                <span className="text-white text-[14px] font-normal font-['Inter']">
                  {pendingMove.fromLat.toFixed(6)}, {pendingMove.fromLng.toFixed(6)}
                </span>
                <div className="size-[20px] rounded-full bg-[#0C9D61] flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* To — editable */}
            <div className="mb-4">
              <label className="text-[#9A999A] text-[12px] font-normal font-['Inter'] block mb-1">To:</label>
              <div className="flex items-center bg-[#0D1112] border border-[#3A70E2] rounded-[4px] px-3 py-3 gap-2 focus-within:border-[#4BA1FF] transition-colors duration-150">
                <input
                  type="text"
                  value={pendingMoveToInput}
                  onChange={(e) => setPendingMoveToInput(e.target.value)}
                  onBlur={(e) => handleToInputBlur(e.target.value)}
                  placeholder="47.000000, 34.000000"
                  className="flex-1 min-w-0 bg-transparent outline-none text-white text-[14px] font-normal font-['Inter'] placeholder:text-[#9A999A]"
                />
                {isToInputValid && (
                  <div className="size-[20px] rounded-full bg-[#0C9D61] flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={handleCancelMove}>Cancel</Button>
              <Button variant="primary" size="sm" disabled={!isToInputValid} onClick={() => handleConfirmMove(pendingMoveToInput)}>Confirm</Button>
            </div>
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
        hoveredObjectiveId={hoveredObjectiveId}
        hoveredCardId={hoveredCardId}
        selectedObjectiveId={selectedObjectiveId}
        onCardHover={setHoveredCardId}
        onCardHoverEnd={() => setHoveredCardId(null)}
        onCardClick={handleObjectiveClick}
        isAddingScenario={isAddingScenario}
        scenarioMode={scenarioMode}
        scenarioActions={scenarioActions}
        onAddScenario={handleAddScenario}
        onBackFromScenario={handleBackFromScenario}
        onScenarioModeChange={handleScenarioModeChange}
        onCreateScenario={handleCreateScenario}
      />
    </div>
  );
}
