import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import Map, { Marker, Source, Layer, type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router-dom";
import { Navbar, NavItemConfig } from "../components/Navbar";
import { PlanningPanel, type Objective, type Plan, type ScenarioMode } from "../components/map/PlanningPanel";
import { MapControls } from "../components/map/MapControls";
import { useUserRole } from "../context/UserRoleContext";
import { Button } from "../components/Button";
import { UnitMarker, type UnitType } from "../components/map/UnitMarker";

// ─── Scenario types & data ────────────────────────────────────────────────────

interface MapUnit {
  id:       string;
  name:     string;
  lat:      number;
  lng:      number;
  unitType: UnitType;
}

interface UnitMove {
  unitId:   string;
  unitName: string;
  fromLat:  number;
  fromLng:  number;
  toLat:    number;
  toLng:    number;
}

const MOCK_UNITS: MapUnit[] = [
  { id: "alfa",    name: "ALFA_Squad",     lat: 43.62,  lng: 1.20,  unitType: "Squad (infantry)"    },
  { id: "bravo",   name: "BRAVO_Squad",    lat: 43.61,  lng: 1.18,  unitType: "Squad (infantry)"    },
  { id: "charlie", name: "CHARLIE_Plt",    lat: 43.63,  lng: 1.22,  unitType: "Platoon (infantry)"  },
  { id: "delta",   name: "DELTA_Co",       lat: 43.60,  lng: 1.16,  unitType: "Company (infantry)"  },
  { id: "echo",    name: "ECHO_Bat",       lat: 43.605, lng: 1.21,  unitType: "Battalion"           },
  { id: "foxtrot", name: "FOXTROT_ArtPlt", lat: 43.615, lng: 1.19,  unitType: "Platoon (artillery)" },
];

// ─── Movement arrow ───────────────────────────────────────────────────────────

function MovementArrow({ move }: { move: UnitMove }) {
  const geojson = {
    type: "Feature" as const,
    geometry: {
      type: "LineString" as const,
      coordinates: [
        [move.fromLng, move.fromLat],
        [move.toLng,   move.toLat],
      ],
    },
    properties: {},
  };

  return (
    <Source id={`move-${move.unitId}`} type="geojson" data={geojson}>
      <Layer
        id={`move-line-${move.unitId}`}
        type="line"
        paint={{
          "line-color": "#76FFAE",
          "line-width": 2,
          "line-dasharray": [4, 2],
        }}
      />
    </Source>
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

  // Unit hover state
  const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null);

  // Scenario state
  const [isAddingScenario, setIsAddingScenario] = useState(false);
  const [scenarioForPlan,  setScenarioForPlan]  = useState<Plan | null>(null);
  const [scenarioMode,     setScenarioMode]     = useState<ScenarioMode>("move_units");
  const [unitMoves,        setUnitMoves]        = useState<UnitMove[]>([]);
  const [pendingMove,      setPendingMove]      = useState<UnitMove | null>(null);

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
  }

  function handleBackFromScenario() {
    setIsAddingScenario(false);
    setScenarioForPlan(null);
    setUnitMoves([]);
    setPendingMove(null);
  }

  function handleUnitDragEnd(unit: MapUnit, lngLat: { lat: number; lng: number }) {
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
    setUnitMoves((prev) => [...prev.filter((m) => m.unitId !== pendingMove.unitId), pendingMove]);
    setPendingMove(null);
  }

  function handleCreateScenario() {
    setIsAddingScenario(false);
    setScenarioForPlan(null);
    setUnitMoves([]);
    setPendingMove(null);
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
          initialViewState={{ longitude: 15, latitude: 48, zoom: 4 }}
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

          {/* Unit markers — visible only in Add Scenario mode */}
          {isAddingScenario && MOCK_UNITS.map((unit) => {
            const move       = unitMoves.find((m) => m.unitId === unit.id);
            const currentLat = move ? move.toLat : unit.lat;
            const currentLng = move ? move.toLng : unit.lng;
            const canDrag    = scenarioMode === "move_units";
            const isHovered  = hoveredUnitId === unit.id;

            return (
              <Fragment key={unit.id}>
                {/* Ghost at original position when unit has been moved */}
                {move && (
                  <Marker longitude={unit.lng} latitude={unit.lat} anchor="center">
                    <div style={{ opacity: 0.4, pointerEvents: "none" }}>
                      <UnitMarker unitType={unit.unitType} state="Default" />
                    </div>
                  </Marker>
                )}

                {/* Current / draggable marker */}
                <Marker
                  longitude={currentLng}
                  latitude={currentLat}
                  anchor="center"
                  draggable={canDrag}
                  onDragEnd={(e) => handleUnitDragEnd(unit, { lat: e.lngLat.lat, lng: e.lngLat.lng })}
                >
                  <div
                    onMouseEnter={() => setHoveredUnitId(unit.id)}
                    onMouseLeave={() => setHoveredUnitId(null)}
                    style={{ cursor: canDrag ? "grab" : "default" }}
                  >
                    <UnitMarker
                      unitType={unit.unitType}
                      state={isHovered ? "Hover" : "Default"}
                    />
                  </div>
                </Marker>

                {/* Green dashed arrow */}
                {move && <MovementArrow move={move} />}
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

        {/* Floating confirm dialog — appears after unit drag */}
        {pendingMove && (
          <div className="absolute top-6 right-6 z-50 bg-[#0D1112] border border-[#232E33] rounded-[8px] p-4 w-[380px] shadow-[0px_4px_24px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2 mb-4">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 10h14M10 3l7 7-7 7" stroke="#4BA1FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-white text-[16px] font-semibold font-['Inter']">
                Move {pendingMove.unitName}
              </span>
            </div>

            <div className="mb-3">
              <label className="text-[#9A999A] text-[12px] font-normal font-['Inter'] block mb-1">From</label>
              <div className="flex items-center justify-between bg-[#161D20] border border-[#232E33] rounded-[4px] px-3 py-3">
                <span className="text-white text-[14px] font-normal font-['Inter']">
                  {pendingMove.fromLat.toFixed(6)},&nbsp;{pendingMove.fromLng.toFixed(6)}
                </span>
                <div className="size-[20px] rounded-full bg-[#0C9D61] flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-[#9A999A] text-[12px] font-normal font-['Inter'] block mb-1">To</label>
              <div className="flex items-center justify-between bg-[#161D20] border border-[#232E33] rounded-[4px] px-3 py-3">
                <span className="text-white text-[14px] font-normal font-['Inter']">
                  {pendingMove.toLat.toFixed(6)},&nbsp;{pendingMove.toLng.toFixed(6)}
                </span>
                <div className="size-[20px] rounded-full bg-[#0C9D61] flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setPendingMove(null)}>Cancel</Button>
              <Button variant="primary"   size="sm" onClick={handleConfirmMove}>Confirm</Button>
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
        unitMovesCount={unitMoves.length}
        onAddScenario={handleAddScenario}
        onBackFromScenario={handleBackFromScenario}
        onScenarioModeChange={setScenarioMode}
        onCreateScenario={handleCreateScenario}
      />
    </div>
  );
}
