import { useState, useEffect } from "react";
import { CreateObjectiveForm, CreateObjectiveData } from "./CreateObjectiveForm";
import { useUserRole } from "../../context/UserRoleContext";
import { Button } from "../Button";

// ─── Types ────────────────────────────────────────────────────────────────────

type ObjectiveStatus = "REQUESTED" | "PLANNED" | "ACCEPTED";

export interface Objective {
  id:          string;
  name:        string;
  status:      ObjectiveStatus;
  description: string;
  lat:         number;
  lng:         number;
  createdAt:   string;
}

export interface Plan {
  id:            string;
  objectiveId:   string;
  name:          string;
  description:   string;
  createdAt:     string;
  isRecommended: boolean;
}

type Tab = "Objectives" | "Plans" | "Scenarios";

export type ScenarioMode = "move_units" | "fire_mission";

export type ScenarioAction =
  | {
      id:       string;
      type:     "move";
      unitId:   string;
      unitName: string;
      fromLat:  number;
      fromLng:  number;
      toLat:    number;
      toLng:    number;
    }
  | {
      id:          string;
      type:        "fire_mission";
      name:        string;
      targetType:  string;
      weaponType:  string;
      batterySheaf: string;
      fireType:    string;
    };

export interface SavedScenario {
  id:          string;
  planId:      string;
  name:        string;
  color:       string;
  execMode:    "standalone" | "dependent";
  date:        string;
  time:        string;
  dependsOnId: string | null;
  actions:     ScenarioAction[];
  createdAt:   string;
}

// ─── Plan / Objective status helpers ─────────────────────────────────────────

function getPlanStatus(plan: Plan, scenarios: SavedScenario[]): "draft" | "default" | "recommended" {
  if (plan.isRecommended) return "recommended";
  if (scenarios.some((s) => s.planId === plan.id)) return "default";
  return "draft";
}

function getObjectiveStatus(
  objective: Objective,
  plans: Plan[],
  savedScenarios: SavedScenario[]
): ObjectiveStatus {
  if (objective.status === "ACCEPTED") return "ACCEPTED";
  const objPlans = plans.filter((p) => p.objectiveId === objective.id);
  const hasScenario = objPlans.some((plan) => savedScenarios.some((s) => s.planId === plan.id));
  return hasScenario ? "PLANNED" : "REQUESTED";
}

// ─── Status tag ───────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ObjectiveStatus, string> = {
  REQUESTED: "bg-[rgba(254,155,14,0.2)] border border-[#FFC62B] text-[#FFC62B]",
  PLANNED:   "bg-[rgba(58,112,226,0.2)] border border-[#4BA1FF] text-[#4BA1FF]",
  ACCEPTED:  "bg-[rgba(12,157,97,0.2)]  border border-[#6BC497] text-[#6BC497]",
};

function StatusTag({ status }: { status: ObjectiveStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-semibold tracking-wide ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

function PlanStatusTag({ status }: { status: "draft" | "default" | "recommended" }) {
  if (status === "recommended") {
    return (
      <span className="inline-flex items-center gap-[4px] text-[#4BA1FF] text-[11px] font-semibold font-['Inter'] border border-[#4BA1FF] rounded-[4px] bg-[rgba(58,112,226,0.15)] px-[8px] py-[2px] whitespace-nowrap shrink-0">
        <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 1.5l1.237 2.506 2.763.402-2 1.948.472 2.75L6 7.75l-2.472 1.356L4 6.356 2 4.408l2.763-.402L6 1.5z" />
        </svg>
        Recommended
      </span>
    );
  }
  return (
    <span className="text-[#9A999A] text-[11px] font-normal font-['Inter'] border border-[#555455] rounded-[4px] px-[8px] py-[2px] whitespace-nowrap shrink-0">
      {status === "draft" ? "Draft" : "Default"}
    </span>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconPerson() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  const d     = new Date(iso);
  const day   = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year  = d.getFullYear();
  const hh    = String(d.getHours()).padStart(2, "0");
  const mm    = String(d.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} ${hh}:${mm}`;
}

function parseCoords(raw: string): { lat: number; lng: number } {
  const [a, b] = raw.split(",");
  return { lat: parseFloat(a?.trim() ?? "0") || 0, lng: parseFloat(b?.trim() ?? "0") || 0 };
}

// ─── Objective card ───────────────────────────────────────────────────────────

function ObjectiveCard({
  obj,
  displayStatus,
  plans,
  savedScenarios,
  onDelete,
  onCreatePlan,
  onOpenPlanningForPlan,
  onDeletePlan,
  onHover,
  onHoverEnd,
}: {
  obj:                   Objective;
  displayStatus:         ObjectiveStatus;
  plans:                 Plan[];
  savedScenarios:        SavedScenario[];
  onDelete:              (id: string) => void;
  onCreatePlan:          (obj: Objective) => void;
  onOpenPlanningForPlan: (obj: Objective, plan: Plan) => void;
  onDeletePlan:          (planId: string, planName: string) => void;
  onHover:               () => void;
  onHoverEnd:            () => void;
}) {
  const { role } = useUserRole();
  const isCommander = role === "commander";
  const isOPS       = role === "operations_officer";
  const [isExpanded, setIsExpanded] = useState(false);
  const objPlans = plans.filter((p) => p.objectiveId === obj.id);

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      className="border rounded-[4px] border-[#161D20] bg-transparent hover:border-[#232E33] transition-colors duration-150 overflow-hidden"
    >
      {/* Header row — always visible, click toggles expand */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-[#9A999A] text-[11px] font-normal font-['Inter'] whitespace-nowrap shrink-0">
            {formatTimestamp(obj.createdAt)}
          </span>
          <img src="/icons/map/target.svg" alt="" className="size-[18px] shrink-0" draggable={false} />
          <span className="text-white text-[13px] font-semibold font-['Inter'] truncate">
            {obj.name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {isCommander && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(obj.id); }}
              className="size-[24px] flex items-center justify-center text-[#EC2D30] hover:bg-[#EC2D30]/10 rounded-[4px] transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <StatusTag status={displayStatus} />
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            className={`shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : "rotate-0"}`}
          >
            <path d="M4 6L8 10L12 6" stroke="#9A999A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-3 pb-3 pt-1 flex flex-col gap-3 border-t border-[#161D20]">

          <div>
            <p className="text-[#9A999A] text-[12px] font-['Inter'] mb-[2px]">Description:</p>
            <p className="text-white text-[12px] font-['Inter']">{obj.description}</p>
          </div>

          <div>
            <p className="text-[#9A999A] text-[12px] font-['Inter'] mb-[2px]">Coordinates:</p>
            <div className="flex items-center gap-1">
              <img src="/icons/map/my_location.svg" className="size-[12px] shrink-0" />
              <span className="text-white text-[12px] font-['Inter']">
                {obj.lat.toFixed(6)},&nbsp;&nbsp;{obj.lng.toFixed(6)}
              </span>
            </div>
          </div>

          {isOPS && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onCreatePlan(obj); }}
                className="w-full flex items-center justify-center gap-2 bg-[#0C9D61] hover:bg-[#097A4B] text-white font-semibold text-[14px] py-[8px] rounded-[4px] transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Create Plan
              </button>

              {objPlans.length > 0 && (
                <div className="flex flex-col gap-2">
                  {objPlans
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((plan) => (
                      <PlanSummaryItem
                        key={plan.id}
                        plan={plan}
                        scenarios={savedScenarios.filter((s) => s.planId === plan.id)}
                        onEdit={() => onOpenPlanningForPlan(obj, plan)}
                        onDelete={() => onDeletePlan(plan.id, plan.name)}
                      />
                    ))
                  }
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Filter dropdown ──────────────────────────────────────────────────────────

const FILTER_OPTIONS = ["All", "Requested", "Planned", "Accepted"] as const;
type FilterValue = typeof FILTER_OPTIONS[number];

function FilterSelect({ value, onChange }: { value: FilterValue; onChange: (v: FilterValue) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 text-[#9A999A] hover:text-white text-[13px] transition-colors">
        {value}<IconChevronDown />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 bg-[#0A0D0E] border border-[#161D20] rounded-[4px] min-w-[110px] py-1 shadow-lg">
          {FILTER_OPTIONS.map((opt) => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-[13px] transition-colors ${opt === value ? "text-white bg-[#161D20]" : "text-[#9A999A] hover:text-white hover:bg-[#161D20]"}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Objectives section ───────────────────────────────────────────────────────

function ObjectivesSection({
  objectives,
  plans,
  savedScenarios,
  onDelete,
  onCreateClick,
  onCreatePlan,
  onOpenPlanningForPlan,
  onDeletePlan,
  onCardHover,
  onCardHoverEnd,
}: {
  objectives:            Objective[];
  plans:                 Plan[];
  savedScenarios:        SavedScenario[];
  onDelete:              (id: string) => void;
  onCreateClick:         () => void;
  onCreatePlan:          (obj: Objective) => void;
  onOpenPlanningForPlan: (obj: Objective, plan: Plan) => void;
  onDeletePlan:          (planId: string, planName: string) => void;
  onCardHover:           (id: string) => void;
  onCardHoverEnd:        () => void;
}) {
  const { role } = useUserRole();
  const isCommander = role === "commander";

  const [filter, setFilter] = useState<FilterValue>("All");

  const visible = objectives.filter((o) => {
    if (filter === "All") return true;
    const status = getObjectiveStatus(o, plans, savedScenarios);
    return status === filter.toUpperCase();
  });

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-white text-[16px] font-semibold">Objectives</span>
        <FilterSelect value={filter} onChange={setFilter} />
      </div>

      {isCommander && (
        <button
          onClick={onCreateClick}
          className="w-full flex items-center justify-center gap-2 bg-[#0C9D61] hover:bg-[#097A4B] text-white font-semibold text-[16px] py-[10px] rounded-[4px] my-4 transition-colors cursor-pointer"
        >
          <IconPlus />
          Create New Objective
        </button>
      )}

      <div className={`flex flex-col gap-3 ${isCommander ? "" : "mt-4"}`}>
        {visible.length === 0 ? (
          <p className="text-[#9A999A] text-[13px] text-center py-6">No objectives match this filter.</p>
        ) : (
          visible.map((obj) => (
            <ObjectiveCard
              key={obj.id}
              obj={obj}
              displayStatus={getObjectiveStatus(obj, plans, savedScenarios)}
              plans={plans}
              savedScenarios={savedScenarios}
              onDelete={onDelete}
              onCreatePlan={onCreatePlan}
              onOpenPlanningForPlan={onOpenPlanningForPlan}
              onDeletePlan={onDeletePlan}
              onHover={() => onCardHover(obj.id)}
              onHoverEnd={onCardHoverEnd}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastData { title: string; description: string; }

function Toast({ data, onClose }: { data: ToastData; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-[#0D1112] border border-[#1A2329] rounded-[4px] p-4 shadow-[0px_4px_16px_rgba(0,0,0,0.6)] max-w-[320px]">
      <div className="shrink-0 size-[32px] rounded-full bg-[#0C9D61] flex items-center justify-center text-white">
        <IconCheck />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-[14px]">{data.title}</p>
        <p className="text-[#9A999A] text-[12px] mt-0.5">{data.description}</p>
      </div>
      <button onClick={onClose} className="shrink-0 text-[#9A999A] hover:text-white transition-colors">
        <IconClose />
      </button>
    </div>
  );
}

// ─── Collapsible objective info ───────────────────────────────────────────────

function formatDate(isoString: string): string {
  const d   = new Date(isoString);
  const dd  = String(d.getDate()).padStart(2, "0");
  const mm  = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh  = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy}  ${hh}:${min}`;
}

function CollapsibleObjectiveInfo({
  objective,
  plans,
  savedScenarios,
}: {
  objective:      Objective;
  plans:          Plan[];
  savedScenarios: SavedScenario[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayStatus = getObjectiveStatus(objective, plans, savedScenarios);

  return (
    <div
      onClick={() => setIsExpanded((v) => !v)}
      className="w-full rounded-[8px] border border-[#161D20] bg-[#0D1112] cursor-pointer hover:border-[#232E33] transition-colors duration-150 p-4 mb-6"
    >
      {/* Header — always visible */}
      <div className="flex items-center justify-between">

        {/* Left: timestamp + icon + name */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[#9A999A] text-[12px] font-normal font-['Inter'] whitespace-nowrap shrink-0">
            {formatDate(objective.createdAt)}
          </span>
          <img src="/icons/map/target.svg" className="size-[20px] shrink-0" draggable={false} />
          <span className="text-white text-[14px] font-semibold font-['Inter'] truncate">
            {objective.name}
          </span>
        </div>

        {/* Right: status tag + chevron */}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <StatusTag status={displayStatus} />
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            className={`shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : "rotate-0"}`}
          >
            <path d="M4 6L8 10L12 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Expanded section */}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? "max-h-[300px] opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"
        }`}
      >
        <div className="border-t border-[#161D20] mb-3" />

        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[#9A999A] text-[12px] font-normal font-['Inter'] mb-[2px]">Description:</p>
            <p className="text-white text-[12px] font-normal font-['Inter']">{objective.description}</p>
          </div>

          <div>
            <p className="text-[#9A999A] text-[12px] font-normal font-['Inter'] mb-[2px]">Coordinates:</p>
            <div className="flex items-center gap-1">
              <img src="/icons/map/my_location.svg" className="size-[12px] shrink-0" />
              <span className="text-white text-[12px] font-normal font-['Inter']">
                {objective.lat.toFixed(6)},&nbsp;&nbsp;{objective.lng.toFixed(6)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Scenario helpers ─────────────────────────────────────────────────────────

const COLOR_HEX: Record<string, string> = {
  blue:   "#3A70E2",
  green:  "#0C9D61",
  yellow: "#FFC62B",
  red:    "#EC2D30",
  purple: "#5900D9",
  blue2:  "#4BA1FF",
  gray:   "#9A999A",
};

function getColorHex(colorValue: string): string {
  return COLOR_HEX[colorValue] ?? "#9A999A";
}

function formatExecutionTime(scenario: SavedScenario): string {
  if (!scenario.date) return "—";
  const [year, month, day] = scenario.date.split("-");
  return `${day}.${month}.${year}${scenario.time ? " " + scenario.time : ""}`;
}

// ─── Scenario item ────────────────────────────────────────────────────────────

function ScenarioItem({ scenario, onDelete }: { scenario: SavedScenario; onDelete: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const moveCount        = scenario.actions.filter((a) => a.type === "move").length;
  const fireMissionCount = scenario.actions.filter((a) => a.type === "fire_mission").length;
  const colorHex         = getColorHex(scenario.color);

  return (
    <div className="w-full rounded-[4px] border border-[#161D20] bg-[#0D1112] overflow-hidden hover:border-[#232E33] transition-colors duration-150">
      {/* Header row */}
      <div className="flex items-center justify-between px-3 py-3">
        {/* Left: timestamp on top, color dot + name below */}
        <div className="flex flex-col gap-[2px] flex-1 min-w-0">
          <span className="text-[#9A999A] text-[11px] font-normal font-['Inter']">
            {formatTimestamp(scenario.createdAt)}
          </span>
          <div className="flex items-center gap-2">
            <div className="size-[14px] rounded-full shrink-0" style={{ backgroundColor: colorHex }} />
            <span className="text-white text-[14px] font-semibold font-['Inter'] truncate">
              {scenario.name}
            </span>
          </div>
        </div>

        {/* Right: edit + delete + chevron */}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <button
            type="button"
            className="size-[24px] flex items-center justify-center text-[#9A999A] hover:text-white transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M11.333 2.667a1.886 1.886 0 0 1 2.667 2.666L5.333 14H2.667v-2.667L11.333 2.667z" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="size-[24px] flex items-center justify-center text-[#EC2D30] hover:bg-[#EC2D30]/10 rounded-[4px] transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            className={`shrink-0 transition-transform duration-200 cursor-pointer ${isExpanded ? "rotate-180" : "rotate-0"}`}
            onClick={() => setIsExpanded((v) => !v)}
          >
            <path d="M4 6l4 4 4-4" stroke="#9A999A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-3 pb-3 flex flex-col gap-3">

          {/* Execution Time */}
          <div className="flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-[1px]">
              <rect x="1" y="3" width="14" height="12" rx="2" stroke="#9A999A" strokeWidth="1.5"/>
              <path d="M1 7h14" stroke="#9A999A" strokeWidth="1.5"/>
              <path d="M5 1v4M11 1v4" stroke="#9A999A" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div>
              <p className="text-[#9A999A] text-[12px] font-normal font-['Inter'] mb-[1px]">Execution Time:</p>
              <p className="text-white text-[12px] font-normal font-['Inter']">{formatExecutionTime(scenario)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-[1px]">
              <path d="M9 1L2 9h6l-1 6 7-8H8l1-6z" stroke="#9A999A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <p className="text-[#9A999A] text-[12px] font-normal font-['Inter'] mb-1">Actions</p>
              <div className="flex items-center gap-3">
                {moveCount > 0 && (
                  <div className="flex items-center gap-1">
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                      <path d="M1 6h6M4 1l5 5-5 5" stroke="#4BA1FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 6h6M11 1l5 5-5 5" stroke="#4BA1FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-white text-[12px] font-normal font-['Inter']">x{moveCount}</span>
                  </div>
                )}
                {fireMissionCount > 0 && (
                  <div className="flex items-center gap-1">
                    <svg width="12" height="14" viewBox="0 0 20 20" fill="none">
                      <path d="M10 2C10 2 7 6 7 9C7 10.657 8.343 12 10 12C11.657 12 13 10.657 13 9C13 7 11 4 11 4C11 4 13 5 14 7C15 9 14 11 14 11C15.5 9.5 16 7 16 5C16 5 18 8 18 12C18 15.314 14.418 18 10 18C5.582 18 2 15.314 2 12C2 7 7 2 10 2Z" fill="#EC2D30" />
                    </svg>
                    <span className="text-white text-[12px] font-normal font-['Inter']">x{fireMissionCount}</span>
                  </div>
                )}
                {moveCount === 0 && fireMissionCount === 0 && (
                  <span className="text-[#9A999A] text-[12px] font-['Inter']">—</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Plan summary item (used inside ObjectiveCard) ────────────────────────────

function PlanSummaryItem({
  plan, scenarios, onEdit, onDelete,
}: {
  plan:      Plan;
  scenarios: SavedScenario[];
  onEdit:    () => void;
  onDelete:  () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const planStatus = getPlanStatus(plan, scenarios);

  return (
    <div className="w-full rounded-[4px] border border-[#161D20] bg-[#0A0D0E] overflow-hidden hover:border-[#232E33] transition-colors duration-150">
      {/* Header row */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex flex-col gap-[2px] flex-1 min-w-0">
          <span className="text-[#9A999A] text-[11px] font-normal font-['Inter']">
            {formatTimestamp(plan.createdAt)}
          </span>
          <div className="flex items-center gap-2">
            <div className="size-[18px] rounded-[3px] shrink-0 bg-[#2D57B0] flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M2 4h10M2 7h10M2 10h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-white text-[13px] font-semibold font-['Inter'] truncate flex-1 min-w-0">
              {plan.name}
            </span>
            <PlanStatusTag status={planStatus} />
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="size-[24px] flex items-center justify-center text-[#9A999A] hover:text-white transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M11.333 2.667a1.886 1.886 0 0 1 2.667 2.666L5.333 14H2.667v-2.667L11.333 2.667z" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="size-[24px] flex items-center justify-center text-[#EC2D30] hover:bg-[#EC2D30]/10 rounded-[4px] transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            className={`shrink-0 transition-transform duration-200 cursor-pointer ${isExpanded ? "rotate-180" : "rotate-0"}`}
            onClick={() => setIsExpanded((v) => !v)}
          >
            <path d="M4 6l4 4 4-4" stroke="#9A999A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-3 pb-3 flex flex-col gap-2 border-t border-[#161D20] pt-2">
          <p className="text-white text-[12px] font-normal font-['Inter']">{plan.description}</p>
          {scenarios.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1">
              {scenarios.map((scenario) => {
                const moveCount = scenario.actions.filter((a) => a.type === "move").length;
                const fireCount = scenario.actions.filter((a) => a.type === "fire_mission").length;
                const colorHex  = getColorHex(scenario.color);
                return (
                  <div key={scenario.id} className="flex items-center gap-2 flex-wrap">
                    <div className="size-[8px] rounded-full shrink-0" style={{ backgroundColor: colorHex }} />
                    <span className="text-white text-[11px] font-['Inter']">{scenario.name}</span>
                    {moveCount > 0 && (
                      <div className="flex items-center gap-[3px]">
                        <svg width="12" height="9" viewBox="0 0 16 12" fill="none">
                          <path d="M1 6h6M4 1l5 5-5 5" stroke="#4BA1FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 6h6M11 1l5 5-5 5" stroke="#4BA1FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[#4BA1FF] text-[11px] font-['Inter']">×{moveCount}</span>
                      </div>
                    )}
                    {fireCount > 0 && (
                      <div className="flex items-center gap-[3px]">
                        <svg width="10" height="11" viewBox="0 0 20 20" fill="none">
                          <path d="M10 2C10 2 7 6 7 9C7 10.657 8.343 12 10 12C11.657 12 13 10.657 13 9C13 7 11 4 11 4C11 4 13 5 14 7C15 9 14 11 14 11C15.5 9.5 16 7 16 5C16 5 18 8 18 12C18 15.314 14.418 18 10 18C5.582 18 2 15.314 2 12C2 7 7 2 10 2Z" fill="#EC2D30" />
                        </svg>
                        <span className="text-[#EC2D30] text-[11px] font-['Inter']">×{fireCount}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({ plan, scenarios, onAddScenario, onDeleteScenario, onDelete, onMarkRecommended }: {
  plan:               Plan;
  scenarios:          SavedScenario[];
  onAddScenario:      () => void;
  onDeleteScenario:   (id: string) => void;
  onDelete:           () => void;
  onMarkRecommended:  () => void;
}) {
  const planStatus = getPlanStatus(plan, scenarios);
  return (
    <div className="w-full rounded-[8px] border border-[#161D20] bg-[#0D1112] p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-[#9A999A] text-[12px] font-normal font-['Inter']">{formatDate(plan.createdAt)}</span>
        <div className="flex items-center gap-2">
          <button className="size-[32px] flex items-center justify-center shrink-0 bg-[#161D20] hover:bg-[#232E33] border border-[#465C66] rounded-[4px] transition-colors duration-150 cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11.333 2.667a1.886 1.886 0 0 1 2.667 2.666L5.333 14H2.667v-2.667L11.333 2.667z" stroke="white" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="size-[32px] flex items-center justify-center shrink-0 bg-[rgba(236,45,48,0.1)] hover:bg-[rgba(236,45,48,0.2)] border border-[#EC2D30] rounded-[4px] transition-colors duration-150 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="#EC2D30" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="size-[24px] rounded-[4px] shrink-0 bg-[#2D57B0] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 4h10M2 7h10M2 10h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-white text-[14px] font-semibold font-['Inter'] flex-1 min-w-0 truncate">{plan.name}</span>
        <PlanStatusTag status={planStatus} />
      </div>

      <div>
        <p className="text-[#9A999A] text-[12px] font-normal font-['Inter'] mb-1">Description:</p>
        <p className="text-white text-[12px] font-normal font-['Inter']">{plan.description}</p>
      </div>

      {scenarios.length > 0 && (
        <div className="flex flex-col gap-2">
          {scenarios.map((scenario) => (
            <ScenarioItem
              key={scenario.id}
              scenario={scenario}
              onDelete={() => onDeleteScenario(scenario.id)}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onAddScenario}
        className="w-full flex items-center justify-center px-4 py-[10px] rounded-[4px] bg-transparent border border-[#3A70E2] text-[#4BA1FF] text-[16px] font-semibold font-['Inter'] hover:bg-[#3A70E2]/10 transition-colors duration-150 cursor-pointer"
      >
        Add Scenario
      </button>

      <button
        type="button"
        onClick={onMarkRecommended}
        className="w-full text-center text-[#9A999A] text-[14px] font-normal font-['Inter'] hover:text-white transition-colors cursor-pointer py-2"
      >
        {plan.isRecommended ? "Unmark as Recommended" : "Mark as Recommended"}
      </button>
    </div>
  );
}

// ─── Create Plan form ─────────────────────────────────────────────────────────

function CreatePlanForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (name: string, description: string) => void;
}) {
  const [form,   setForm]   = useState({ name: "", description: "" });
  const [errors, setErrors] = useState({ name: false, description: false });

  function handleSubmit() {
    const e = { name: !form.name.trim(), description: !form.description.trim() };
    setErrors(e);
    if (e.name || e.description) return;
    onSubmit(form.name, form.description);
  }

  const inputBase =
    "w-full bg-[#0D1112] rounded-[4px] px-3 py-3 text-white text-[14px] placeholder:text-[#9A999A] border outline-none transition-colors font-['Inter']";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-white text-[12px]">
          Name <span className="text-[#EB6F70]">*</span>
        </label>
        <input
          value={form.name}
          onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setErrors((p) => ({ ...p, name: false })); }}
          placeholder="e.g. Flank from the north"
          className={`${inputBase} ${errors.name ? "border-[#F64C4C]" : "border-[#161D20] focus:border-[#3A70E2]"}`}
        />
        {errors.name && <p className="text-[#F64C4C] text-[12px]">Name is required</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-white text-[12px]">
          Description <span className="text-[#EB6F70]">*</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => { setForm((p) => ({ ...p, description: e.target.value })); setErrors((p) => ({ ...p, description: false })); }}
          placeholder="Describe the plan in detail"
          rows={4}
          className={`${inputBase} resize-none ${errors.description ? "border-[#F64C4C]" : "border-[#161D20] focus:border-[#3A70E2]"}`}
        />
        {errors.description && <p className="text-[#F64C4C] text-[12px]">Description is required</p>}
      </div>

      <div className="flex gap-3 mt-2">
        <Button variant="secondary" size="md" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button variant="primary"   size="md" className="flex-1" onClick={handleSubmit}>Create</Button>
      </div>
    </div>
  );
}

// ─── FM options + panel dropdown ─────────────────────────────────────────────

const TARGET_TYPE_OPTIONS = [
  { value: "personnel",  label: "Personnel" },
  { value: "vehicles",   label: "Vehicles" },
  { value: "structures", label: "Structures" },
  { value: "equipment",  label: "Equipment / Weapon Type" },
];
const WEAPON_TYPE_OPTIONS = [
  { value: "120mm_mortar",     label: "120mm Mortar" },
  { value: "howitzer",         label: "Howitzer" },
  { value: "drone",            label: "Drone" },
  { value: "rocket_artillery", label: "Rocket Artillery" },
];
const BATTERY_SHEAF_OPTIONS = [
  { value: "point_target", label: "Point Target" },
  { value: "linear",       label: "Linear" },
  { value: "circular",     label: "Circular" },
  { value: "parallel",     label: "Parallel" },
];
const FIRE_TYPE_OPTIONS = [
  { value: "fire_for_effect", label: "Fire for Effect" },
  { value: "illumination",    label: "Illumination" },
  { value: "smoke",           label: "Smoke" },
];

function PanelDropdown({
  placeholder, options, value, onChange, success,
}: {
  placeholder: string;
  options:     { value: string; label: string }[];
  value:       string;
  onChange:    (v: string) => void;
  success?:    boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel   = options.find((o) => o.value === value)?.label;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-[#0D1112] border border-[#232E33] rounded-[4px] px-3 py-2.5 gap-2 hover:border-[#465C66] transition-colors duration-150 cursor-pointer"
      >
        <span className={`text-[13px] font-normal font-['Inter'] flex-1 text-left ${selectedLabel ? "text-white" : "text-[#9A999A]"}`}>
          {selectedLabel ?? placeholder}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {success && value && (
            <div className="size-[18px] rounded-full bg-[#0C9D61] flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}>
            <path d="M4 6l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-0.5 z-20 bg-[#0D1112] border border-[#232E33] rounded-[4px] overflow-hidden shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-[13px] font-normal font-['Inter'] transition-colors duration-150 cursor-pointer ${opt.value === value ? "text-white bg-[#161D20]" : "text-[#9A999A] hover:text-white hover:bg-[#161D20]"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Action item ─────────────────────────────────────────────────────────────

function ActionItem({ action, onDelete }: { action: Extract<ScenarioAction, { type: "move" }>; onDelete: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full rounded-[4px] border border-[#161D20] bg-[#0D1112] overflow-hidden transition-all duration-150 hover:border-[#232E33]">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => setIsExpanded((v) => !v)}>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M1 6h6M4 1l5 5-5 5" stroke="#4BA1FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 6h6M11 1l5 5-5 5" stroke="#4BA1FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-white text-[14px] font-semibold font-['Inter']">Move {action.unitName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="size-[24px] flex items-center justify-center text-[#EC2D30] hover:bg-[#EC2D30]/10 rounded-[4px] transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            className={`shrink-0 transition-transform duration-200 cursor-pointer ${isExpanded ? "rotate-180" : "rotate-0"}`}
            onClick={() => setIsExpanded((v) => !v)}
          >
            <path d="M4 6l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? "max-h-[160px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-3 pb-3 flex flex-col gap-2">
          <div>
            <p className="text-[#9A999A] text-[12px] font-normal font-['Inter'] mb-[2px]">From:</p>
            <p className="text-white text-[12px] font-normal font-['Inter']">
              {action.fromLat.toFixed(6)},&nbsp;&nbsp;{action.fromLng.toFixed(6)}
            </p>
          </div>
          <div>
            <p className="text-[#9A999A] text-[12px] font-normal font-['Inter'] mb-[2px]">To:</p>
            <p className="text-white text-[12px] font-normal font-['Inter']">
              {action.toLat.toFixed(6)},&nbsp;&nbsp;{action.toLng.toFixed(6)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Fire mission action item ─────────────────────────────────────────────────

const FM_LABELS: Record<string, string> = {
  personnel:        "Personnel",
  vehicles:         "Vehicles",
  structures:       "Structures",
  equipment:        "Equipment / Weapon Type",
  "120mm_mortar":   "120mm Mortar",
  howitzer:         "Howitzer",
  drone:            "Drone",
  rocket_artillery: "Rocket Artillery",
  point_target:     "Point Target",
  linear:           "Linear",
  circular:         "Circular",
  parallel:         "Parallel",
  fire_for_effect:  "Fire for Effect",
  illumination:     "Illumination",
  smoke:            "Smoke",
};

function FireMissionActionItem({ action, onDelete }: { action: Extract<ScenarioAction, { type: "fire_mission" }>; onDelete: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const rows = [
    { label: "Target Type:",   value: FM_LABELS[action.targetType]   ?? action.targetType },
    { label: "Weapon Type:",   value: FM_LABELS[action.weaponType]   ?? action.weaponType },
    { label: "Battery Sheaf:", value: FM_LABELS[action.batterySheaf] ?? action.batterySheaf },
    { label: "Fire Type:",     value: FM_LABELS[action.fireType]     ?? action.fireType },
  ];

  return (
    <div className="w-full rounded-[4px] border border-[#161D20] bg-[#0D1112] overflow-hidden hover:border-[#232E33] transition-colors duration-150">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => setIsExpanded((v) => !v)}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M10 2C10 2 7 6 7 9C7 10.657 8.343 12 10 12C11.657 12 13 10.657 13 9C13 7 11 4 11 4C11 4 13 5 14 7C15 9 14 11 14 11C15.5 9.5 16 7 16 5C16 5 18 8 18 12C18 15.314 14.418 18 10 18C5.582 18 2 15.314 2 12C2 7 7 2 10 2Z" fill="#EC2D30" />
          </svg>
          <span className="text-white text-[14px] font-semibold font-['Inter']">{action.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="size-[24px] flex items-center justify-center text-[#EC2D30] hover:bg-[#EC2D30]/10 rounded-[4px] transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            className={`shrink-0 transition-transform duration-200 cursor-pointer ${isExpanded ? "rotate-180" : "rotate-0"}`}
            onClick={() => setIsExpanded((v) => !v)}
          >
            <path d="M4 6l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-3 pb-3 flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row.label}>
              <p className="text-[#9A999A] text-[12px] font-normal font-['Inter'] mb-[2px]">{row.label}</p>
              <p className="text-white text-[12px] font-normal font-['Inter']">{row.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Add Scenario panel ───────────────────────────────────────────────────────

interface PendingMoveData {
  unitId: string; unitName: string;
  fromLat: number; fromLng: number;
  toLat: number; toLng: number;
}
interface FireMissionFormData {
  targetType: string; weaponType: string; batterySheaf: string; fireType: string;
}

function AddScenarioPanel({
  onBack, scenarioActions, onDeleteAction,
  pendingMove, pendingMoveToInput, isToInputValid,
  onPendingMoveToInputChange, onPendingMoveToInputBlur, onConfirmMove, onCancelMove,
  pendingFireMission, fireMissionForm, onFireMissionFormChange, onConfirmFireMission, onCancelFireMission,
  onCreate,
}: {
  onBack:                       () => void;
  scenarioActions:              ScenarioAction[];
  onDeleteAction:               (id: string) => void;
  pendingMove:                  PendingMoveData | null;
  pendingMoveToInput:           string;
  isToInputValid:               boolean;
  onPendingMoveToInputChange:   (v: string) => void;
  onPendingMoveToInputBlur:     (v: string) => void;
  onConfirmMove:                () => void;
  onCancelMove:                 () => void;
  pendingFireMission:           { lat: number; lng: number } | null;
  fireMissionForm:              FireMissionFormData;
  onFireMissionFormChange:      (updates: Partial<FireMissionFormData>) => void;
  onConfirmFireMission:         () => void;
  onCancelFireMission:          () => void;
  onCreate:                     () => void;
}) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0 p-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="size-[40px] flex items-center justify-center shrink-0 bg-[#161D20] hover:bg-[#232E33] border border-[#465C66] rounded-[4px] transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2 className="text-white text-[24px] font-semibold font-['Inter']">Add Scenario</h2>
        </div>
        <div className="border-b border-[#161D20] mb-4" />

        {/* Move confirm dialog */}
        {pendingMove && (
          <div className="bg-[#0D1112] border border-[#232E33] rounded-[8px] p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 20 16" fill="none">
                <path d="M1 8h14M10 1l7 7-7 7" stroke="#4BA1FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-white text-[15px] font-semibold font-['Inter']">Move {pendingMove.unitName}</span>
            </div>
            <div className="mb-3">
              <label className="text-[#9A999A] text-[12px] font-['Inter'] block mb-1">From</label>
              <div className="flex items-center justify-between bg-[#161D20] border border-[#232E33] rounded-[4px] px-3 py-[10px]">
                <span className="text-white text-[13px] font-['Inter']">
                  {pendingMove.fromLat.toFixed(6)}, {pendingMove.fromLng.toFixed(6)}
                </span>
                <div className="size-[18px] rounded-full bg-[#0C9D61] flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-[#9A999A] text-[12px] font-['Inter'] block mb-1">To</label>
              <div className={`flex items-center gap-2 bg-[#161D20] border rounded-[4px] px-3 py-[10px] focus-within:border-[#3A70E2] transition-colors ${isToInputValid ? "border-[#6BC497]" : "border-[#232E33]"}`}>
                <input
                  type="text"
                  value={pendingMoveToInput}
                  onChange={(e) => onPendingMoveToInputChange(e.target.value)}
                  onBlur={(e) => onPendingMoveToInputBlur(e.target.value)}
                  placeholder="47.000000, 34.000000"
                  className="flex-1 min-w-0 bg-transparent outline-none text-white text-[13px] font-['Inter'] placeholder:text-[#9A999A]"
                />
                {isToInputValid && (
                  <div className="size-[18px] rounded-full bg-[#0C9D61] flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={onCancelMove}>Cancel</Button>
              <Button variant="primary" size="sm" disabled={!isToInputValid} onClick={onConfirmMove}>Confirm</Button>
            </div>
          </div>
        )}

        {/* Fire mission confirm dialog */}
        {pendingFireMission && (
          <div className="bg-[#0D1112] border border-[#232E33] rounded-[8px] p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M10 2C10 2 7 6 7 9C7 10.657 8.343 12 10 12C11.657 12 13 10.657 13 9C13 7 11 4 11 4C11 4 13 5 14 7C15 9 14 11 14 11C15.5 9.5 16 7 16 5C16 5 18 8 18 12C18 15.314 14.418 18 10 18C5.582 18 2 15.314 2 12C2 7 7 2 10 2Z" fill="#EC2D30" />
              </svg>
              <span className="text-white text-[15px] font-semibold font-['Inter']">Configure Fire Mission</span>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              <div>
                <label className="text-[#9A999A] text-[12px] font-['Inter'] block mb-1">Target Type</label>
                <PanelDropdown placeholder="choose a target" options={TARGET_TYPE_OPTIONS} value={fireMissionForm.targetType} onChange={(v) => onFireMissionFormChange({ targetType: v })} success={!!fireMissionForm.targetType} />
              </div>
              <div>
                <label className="text-[#9A999A] text-[12px] font-['Inter'] block mb-1">Weapon Type</label>
                <PanelDropdown placeholder="choose a weapon" options={WEAPON_TYPE_OPTIONS} value={fireMissionForm.weaponType} onChange={(v) => onFireMissionFormChange({ weaponType: v })} success={!!fireMissionForm.weaponType} />
              </div>
              <div>
                <label className="text-[#9A999A] text-[12px] font-['Inter'] block mb-1">Battery Sheaf</label>
                <PanelDropdown placeholder="choose a pattern" options={BATTERY_SHEAF_OPTIONS} value={fireMissionForm.batterySheaf} onChange={(v) => onFireMissionFormChange({ batterySheaf: v })} success={!!fireMissionForm.batterySheaf} />
              </div>
              <div>
                <label className="text-[#9A999A] text-[12px] font-['Inter'] block mb-1">Fire Type</label>
                <PanelDropdown placeholder="choose a fire type" options={FIRE_TYPE_OPTIONS} value={fireMissionForm.fireType} onChange={(v) => onFireMissionFormChange({ fireType: v })} success={!!fireMissionForm.fireType} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={onCancelFireMission}>Cancel</Button>
              <Button variant="primary" size="sm" disabled={!fireMissionForm.targetType || !fireMissionForm.weaponType || !fireMissionForm.batterySheaf || !fireMissionForm.fireType} onClick={onConfirmFireMission}>Confirm</Button>
            </div>
          </div>
        )}

        {/* Action list */}
        {scenarioActions.length > 0 && (
          <div className="flex flex-col gap-2">
            {scenarioActions.map((action) =>
              action.type === "move"
                ? <ActionItem key={action.id} action={action} onDelete={() => onDeleteAction(action.id)} />
                : <FireMissionActionItem key={action.id} action={action} onDelete={() => onDeleteAction(action.id)} />
            )}
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div className="shrink-0 p-4 pt-3 border-t border-[#161D20]">
        <Button variant="primary" size="lg" className="w-full" disabled={scenarioActions.length === 0} onClick={onCreate}>
          Save Scenario
        </Button>
      </div>
    </div>
  );
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────

interface DeleteTarget {
  type: "plan" | "scenario";
  id:   string;
  name: string;
}

function DeleteConfirmModal({
  isOpen, title, description, onCancel, onConfirm,
}: {
  isOpen:      boolean;
  title:       string;
  description: string;
  onCancel:    () => void;
  onConfirm:   () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onCancel(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/75" onClick={onCancel} />
      <div className="relative z-10 bg-[#0A0D0E] border border-[#101517] rounded-[8px] p-6 w-[318px] flex flex-col items-center gap-9 shadow-[0px_8px_32px_rgba(0,0,0,0.6)]">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M6 9h24" stroke="#EC2D30" strokeWidth="2" strokeLinecap="round" />
          <path d="M15 9V6h6v3" stroke="#EC2D30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 9l2 21h16l2-21" stroke="#EC2D30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 15v9M18 15v9M22 15v9" stroke="#EC2D30" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-white text-[24px] font-semibold font-['Inter'] leading-[36px]">{title}</h3>
          <p className="text-white text-[14px] font-normal font-['Inter'] leading-[20px] w-[270px]">{description}</p>
        </div>
        <div className="flex items-center gap-6 w-full">
          <button type="button" onClick={onCancel} className="flex-1 flex items-center justify-center px-4 py-2 rounded-[4px] bg-[#161D20] hover:bg-[#232E33] text-white text-[16px] font-semibold font-['Inter'] transition-colors cursor-pointer">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="flex-1 flex items-center justify-center px-4 py-2 rounded-[4px] bg-[#EC2D30] hover:bg-[#F64C4C] text-white text-[16px] font-semibold font-['Inter'] transition-colors cursor-pointer">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

const TABS: Tab[] = ["Objectives", "Plans", "Scenarios"];

export interface PlanningPanelProps {
  isCreating:                 boolean;
  onStartCreating:            () => void;
  onStopCreating:             () => void;
  mapClickCoords:             string;
  objectives:                 Objective[];
  onCreateObjective:          (obj: Objective) => void;
  onDeleteObjective:          (id: string) => void;
  plans:                      Plan[];
  onPlanCreated:              (plan: Plan) => void;
  onDeletePlan:               (planId: string) => void;
  hoveredObjectiveId:         string | null;
  hoveredCardId:              string | null;
  selectedObjectiveId:        string | null;
  onCardHover:                (id: string) => void;
  onCardHoverEnd:             () => void;
  onCardClick:                (id: string) => void;
  isAddingScenario:           boolean;
  scenarioActions:            ScenarioAction[];
  onAddScenario:              (plan: Plan) => void;
  onBackFromScenario:         () => void;
  onCreateScenario:           () => void;
  onDeleteAction:             (id: string) => void;
  pendingMove:                PendingMoveData | null;
  pendingMoveToInput:         string;
  isToInputValid:             boolean;
  onPendingMoveToInputChange: (v: string) => void;
  onPendingMoveToInputBlur:   (v: string) => void;
  onConfirmMove:              () => void;
  onCancelMove:               () => void;
  pendingFireMission:         { lat: number; lng: number } | null;
  fireMissionForm:            FireMissionFormData;
  onFireMissionFormChange:    (updates: Partial<FireMissionFormData>) => void;
  onConfirmFireMission:       () => void;
  onCancelFireMission:        () => void;
  savedScenarios:             SavedScenario[];
  onDeleteScenario:           (id: string) => void;
  onMarkRecommended:          (planId: string) => void;
}

export function PlanningPanel({
  isCreating, onStartCreating, onStopCreating, mapClickCoords,
  objectives, onCreateObjective, onDeleteObjective,
  plans, onPlanCreated, onDeletePlan,
  onCardHover, onCardHoverEnd,
  isAddingScenario, scenarioActions,
  onAddScenario, onBackFromScenario, onCreateScenario, onDeleteAction,
  pendingMove, pendingMoveToInput, isToInputValid,
  onPendingMoveToInputChange, onPendingMoveToInputBlur, onConfirmMove, onCancelMove,
  pendingFireMission, fireMissionForm, onFireMissionFormChange, onConfirmFireMission, onCancelFireMission,
  savedScenarios, onDeleteScenario, onMarkRecommended,
}: PlanningPanelProps) {
  const { role } = useUserRole();
  const isCommander = role === "commander";

  const [activeTab,      setActiveTab]      = useState<Tab>("Objectives");
  const [toast,          setToast]          = useState<ToastData | null>(null);
  const [planForObj,     setPlanForObj]     = useState<Objective | null>(null);
  const [submittedPlan,  setSubmittedPlan]  = useState<Plan | null>(null);
  const [deleteTarget,   setDeleteTarget]   = useState<DeleteTarget | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  function handleCreateObjective(data: CreateObjectiveData) {
    const { lat, lng } = parseCoords(data.coordinates);
    const newObj: Objective = {
      id:          String(Date.now()),
      name:        data.name,
      status:      "REQUESTED",
      description: data.description,
      lat,
      lng,
      createdAt:   new Date().toISOString(),
    };
    onCreateObjective(newObj);
    onStopCreating();
    setToast({ title: "New objective has been created", description: `"${data.name}" was successfully added to the objectives list.` });
  }

  function handleOpenPlanForm(obj: Objective) {
    setPlanForObj(obj);
    setSubmittedPlan(null);
  }

  function handleBack() {
    setPlanForObj(null);
    setSubmittedPlan(null);
  }

  function handleOpenPlanningForPlan(obj: Objective, plan: Plan) {
    setPlanForObj(obj);
    setSubmittedPlan(plan);
  }

  function handleCreateAnotherPlan() {
    setSubmittedPlan(null);
  }

  function handleSubmitPlan(name: string, description: string) {
    const obj = planForObj!;
    const newPlan: Plan = {
      id:          Date.now().toString(),
      objectiveId: obj.id,
      name,
      description,
      createdAt:   new Date().toISOString(),
      isRecommended: false,
    };
    onPlanCreated(newPlan);
    setSubmittedPlan(newPlan);
    setToast({ title: "Plan created", description: `"${name}" has been added to ${obj.name}.` });
  }

  function handleCancelDelete() {
    setDeleteTarget(null);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === "plan") {
      onDeletePlan(deleteTarget.id);
      setToast({ title: "Plan deleted", description: `"${deleteTarget.name}" has been removed.` });
    } else {
      onDeleteScenario(deleteTarget.id);
      setToast({ title: "Scenario deleted", description: `"${deleteTarget.name}" has been removed.` });
    }
    setDeleteTarget(null);
  }

  function handleSave() {
    setToast({ title: "Plan saved", description: "Your planning has been saved successfully." });
    handleBack();
  }

  const showingPlanForm = planForObj !== null;

  return (
    <>
      <div className="w-[390px] shrink-0 bg-[#0A0D0E] border-l border-[#101517] h-full overflow-hidden flex flex-col">
        {isAddingScenario ? (
          <AddScenarioPanel
            onBack={onBackFromScenario}
            scenarioActions={scenarioActions}
            onDeleteAction={onDeleteAction}
            pendingMove={pendingMove}
            pendingMoveToInput={pendingMoveToInput}
            isToInputValid={isToInputValid}
            onPendingMoveToInputChange={onPendingMoveToInputChange}
            onPendingMoveToInputBlur={onPendingMoveToInputBlur}
            onConfirmMove={onConfirmMove}
            onCancelMove={onCancelMove}
            pendingFireMission={pendingFireMission}
            fireMissionForm={fireMissionForm}
            onFireMissionFormChange={onFireMissionFormChange}
            onConfirmFireMission={onConfirmFireMission}
            onCancelFireMission={onCancelFireMission}
            onCreate={onCreateScenario}
          />
        ) : (
          <>
        <div className="p-6 flex flex-col gap-5 flex-1 overflow-y-auto min-h-0">

          {isCreating ? (
            <CreateObjectiveForm
              mapClickCoords={mapClickCoords}
              onCancel={onStopCreating}
              onCreate={handleCreateObjective}
            />
          ) : showingPlanForm ? (
            <div className="flex flex-col">
              {/* Header: back + Planning title + Add Plan button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBack}
                    className="size-[40px] flex items-center justify-center shrink-0 bg-[#161D20] hover:bg-[#232E33] border border-[#465C66] rounded-[4px] transition-colors duration-150 cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M10 12L6 8L10 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <h2 className="text-white text-[24px] font-semibold font-['Inter']">Planning</h2>
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleCreateAnotherPlan}
                  iconLeft={
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  }
                >
                  Add Plan
                </Button>
              </div>
              <div className="border-b border-[#161D20] mt-4 mb-6" />

              <CollapsibleObjectiveInfo objective={planForObj} plans={plans} savedScenarios={savedScenarios} />

              <div className="border-t border-[#161D20] mb-6" />

              {submittedPlan ? (
                <div className="flex flex-col gap-4">
                  {plans
                    .filter((p) => p.objectiveId === planForObj.id)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        scenarios={savedScenarios.filter((s) => s.planId === plan.id)}
                        onAddScenario={() => onAddScenario(plan)}
                        onDeleteScenario={(id) => {
                          const s = savedScenarios.find((sc) => sc.id === id);
                          setDeleteTarget({ type: "scenario", id, name: s?.name ?? "Scenario" });
                        }}
                        onDelete={() => setDeleteTarget({ type: "plan", id: plan.id, name: plan.name })}
                        onMarkRecommended={() => onMarkRecommended(plan.id)}
                      />
                    ))
                  }
                </div>
              ) : (
                <CreatePlanForm onCancel={handleBack} onSubmit={handleSubmitPlan} />
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-white text-[24px] font-semibold leading-none">
                  {isCommander ? "Planning" : "Objectives"}
                </h2>
                <button className="size-[32px] flex items-center justify-center text-[#9A999A] hover:text-white hover:bg-[#161D20] rounded-[4px] transition-colors">
                  <IconPerson />
                </button>
              </div>

              {isCommander && (
                <div className="flex items-center gap-1">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-[14px] font-medium rounded-[4px] transition-colors ${
                        tab === activeTab
                          ? "bg-[#161D20] border border-[#3A70E2] text-white"
                          : "text-[#9A999A] hover:text-white"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}

              {(isCommander ? activeTab === "Objectives" : true) && (
                <ObjectivesSection
                  objectives={objectives}
                  plans={plans}
                  savedScenarios={savedScenarios}
                  onDelete={onDeleteObjective}
                  onCreateClick={onStartCreating}
                  onCreatePlan={handleOpenPlanForm}
                  onOpenPlanningForPlan={handleOpenPlanningForPlan}
                  onDeletePlan={(id, name) => setDeleteTarget({ type: "plan", id, name })}
                  onCardHover={onCardHover}
                  onCardHoverEnd={onCardHoverEnd}
                />
              )}
              {activeTab === "Plans" && (
                <p className="text-[#9A999A] text-[13px]">Plans coming soon.</p>
              )}
              {activeTab === "Scenarios" && (
                <p className="text-[#9A999A] text-[13px]">Scenarios coming soon.</p>
              )}
            </>
          )}

        </div>

        {/* Sticky Save footer — visible after at least one plan exists */}
        {showingPlanForm && submittedPlan && (
          <div className="shrink-0 px-6 pb-4 pt-3 border-t border-[#161D20]">
            <Button variant="primary" size="lg" className="w-full" onClick={handleSave}>
              Save
            </Button>
          </div>
        )}
          </>
        )}
      </div>

      {toast && <Toast data={toast} onClose={() => setToast(null)} />}

      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        title={deleteTarget?.type === "plan" ? "Delete Plan?" : "Delete Scenario?"}
        description={
          deleteTarget?.type === "plan"
            ? "Are you sure you want to delete this plan?"
            : "Are you sure you want to delete this scenario?"
        }
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
