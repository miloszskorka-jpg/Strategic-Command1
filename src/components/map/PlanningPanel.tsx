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

type Tab = "Objectives" | "Plans" | "Scenarios";

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

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconPerson() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
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

function formatCoord(val: number): string {
  return val.toFixed(6);
}

function parseCoords(raw: string): { lat: number; lng: number } {
  const [a, b] = raw.split(",");
  return { lat: parseFloat(a?.trim() ?? "0") || 0, lng: parseFloat(b?.trim() ?? "0") || 0 };
}

// ─── Objective card ───────────────────────────────────────────────────────────

function ObjectiveCard({
  obj,
  onDelete,
  onCreatePlan,
  isSelected,
  isHovered,
  isHoveredByMarker,
  onHover,
  onHoverEnd,
  onClick,
}: {
  obj:               Objective;
  onDelete:          (id: string) => void;
  onCreatePlan:      (obj: Objective) => void;
  isSelected:        boolean;
  isHovered:         boolean;
  isHoveredByMarker: boolean;
  onHover:           () => void;
  onHoverEnd:        () => void;
  onClick:           () => void;
}) {
  const { role } = useUserRole();
  const isCommander = role === "commander";
  const isOPS = role === "operations_officer";

  const borderBg = isSelected
    ? "border-[#3A70E2] bg-[#0D1112]"
    : isHovered
      ? "border-[#232E33] bg-[#0D1112]"
      : isHoveredByMarker
        ? "border-[#203D7D] bg-transparent"
        : "border-[#161D20] bg-transparent";

  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      className={`border rounded-[4px] p-3 flex flex-col gap-2 cursor-pointer transition-all duration-150 ${borderBg}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[#9A999A] text-[12px]">{formatTimestamp(obj.createdAt)}</span>
        {isCommander && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(obj.id); }}
            className="text-[#E53535] hover:text-red-400 transition-colors"
            aria-label="Delete"
          >
            <IconTrash />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <img src="/icons/map/target.svg" alt="objective" className="size-[20px] shrink-0" />
        <span className="text-white text-[14px] font-semibold">{obj.name}</span>
        <StatusTag status={obj.status} />
      </div>

      <div>
        <span className="text-[#9A999A] text-[12px]">Description: </span>
        <span className={`text-white text-[12px] ${isSelected ? "" : "line-clamp-2"}`}>
          {obj.description}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-[#9A999A] text-[12px]">Coordinates:</span>
        <span className="text-[#9A999A]"><IconLocation /></span>
        <span className="text-white text-[12px]">{formatCoord(obj.lat)},&nbsp;&nbsp;{formatCoord(obj.lng)}</span>
      </div>

      {isOPS && (
        <div className="mt-1 pt-3 border-t border-[#161D20]">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={(e) => { e.stopPropagation(); onCreatePlan(obj); }}
          >
            Create Plan
          </Button>
        </div>
      )}
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
  onDelete,
  onCreateClick,
  onCreatePlan,
  hoveredObjectiveId,
  hoveredCardId,
  selectedObjectiveId,
  onCardHover,
  onCardHoverEnd,
  onCardClick,
}: {
  objectives:          Objective[];
  onDelete:            (id: string) => void;
  onCreateClick:       () => void;
  onCreatePlan:        (obj: Objective) => void;
  hoveredObjectiveId:  string | null;
  hoveredCardId:       string | null;
  selectedObjectiveId: string | null;
  onCardHover:         (id: string) => void;
  onCardHoverEnd:      () => void;
  onCardClick:         (id: string) => void;
}) {
  const { role } = useUserRole();
  const isCommander = role === "commander";

  const [filter, setFilter] = useState<FilterValue>("All");

  const visible = objectives.filter((o) => {
    if (filter === "All") return true;
    return o.status === filter.toUpperCase();
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
              onDelete={onDelete}
              onCreatePlan={onCreatePlan}
              isSelected={selectedObjectiveId === obj.id}
              isHovered={hoveredCardId === obj.id}
              isHoveredByMarker={hoveredObjectiveId === obj.id}
              onHover={() => onCardHover(obj.id)}
              onHoverEnd={onCardHoverEnd}
              onClick={() => onCardClick(obj.id)}
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

// ─── Create Plan form ─────────────────────────────────────────────────────────

function CreatePlanForm({
  objective,
  onCancel,
  onSubmit,
}: {
  objective: Objective;
  onCancel:  () => void;
  onSubmit:  (name: string, description: string) => void;
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
    <div className="flex flex-col">
      <h2 className="text-white text-[24px] font-semibold font-['Inter']">Create Plan</h2>
      <div className="border-b border-[#161D20] mt-2 mb-6" />

      <div className="flex items-center gap-2 mb-6 p-3 bg-[#0D1112] border border-[#161D20] rounded-[4px]">
        <img src="/icons/map/target.svg" alt="" className="size-[16px] shrink-0" />
        <div className="flex flex-col">
          <span className="text-[#9A999A] text-[11px]">Objective</span>
          <span className="text-white text-[13px] font-medium">{objective.name}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
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
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" size="md" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button variant="primary"   size="md" className="flex-1" onClick={handleSubmit}>Create</Button>
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

const TABS: Tab[] = ["Objectives", "Plans", "Scenarios"];

export interface PlanningPanelProps {
  isCreating:          boolean;
  onStartCreating:     () => void;
  onStopCreating:      () => void;
  mapClickCoords:      string;
  objectives:          Objective[];
  onCreateObjective:   (obj: Objective) => void;
  onDeleteObjective:   (id: string) => void;
  hoveredObjectiveId:  string | null;
  hoveredCardId:       string | null;
  selectedObjectiveId: string | null;
  onCardHover:         (id: string) => void;
  onCardHoverEnd:      () => void;
  onCardClick:         (id: string) => void;
}

export function PlanningPanel({
  isCreating, onStartCreating, onStopCreating, mapClickCoords,
  objectives, onCreateObjective, onDeleteObjective,
  hoveredObjectiveId, hoveredCardId, selectedObjectiveId,
  onCardHover, onCardHoverEnd, onCardClick,
}: PlanningPanelProps) {
  const { role } = useUserRole();
  const isCommander = role === "commander";

  const [activeTab,   setActiveTab]   = useState<Tab>("Objectives");
  const [toast,       setToast]       = useState<ToastData | null>(null);
  const [planForObj,  setPlanForObj]  = useState<Objective | null>(null);

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
    onCardClick(obj.id); // deselect by resetting — actually we pass null-like by clearing selection via parent isn't available, so just open form
  }

  function handleCancelPlan() {
    setPlanForObj(null);
  }

  function handleSubmitPlan(name: string, description: string) {
    const obj = planForObj!;
    console.log("New plan created:", {
      id:          Date.now().toString(),
      objectiveId: obj.id,
      name,
      description,
      createdAt:   new Date().toISOString(),
      status:      "DRAFT",
    });
    setPlanForObj(null);
    setToast({ title: "Plan created", description: `"${name}" has been added to ${obj.name}.` });
  }

  const showingPlanForm = planForObj !== null;

  return (
    <>
      <div className="w-[390px] shrink-0 bg-[#0A0D0E] border-l border-[#101517] h-full overflow-y-auto flex flex-col">
        <div className="p-6 flex flex-col gap-5 flex-1">

          {isCreating ? (
            <CreateObjectiveForm
              mapClickCoords={mapClickCoords}
              onCancel={onStopCreating}
              onCreate={handleCreateObjective}
            />
          ) : showingPlanForm ? (
            <CreatePlanForm
              objective={planForObj}
              onCancel={handleCancelPlan}
              onSubmit={handleSubmitPlan}
            />
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
                  onDelete={onDeleteObjective}
                  onCreateClick={onStartCreating}
                  onCreatePlan={handleOpenPlanForm}
                  hoveredObjectiveId={hoveredObjectiveId}
                  hoveredCardId={hoveredCardId}
                  selectedObjectiveId={selectedObjectiveId}
                  onCardHover={onCardHover}
                  onCardHoverEnd={onCardHoverEnd}
                  onCardClick={onCardClick}
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
      </div>

      {toast && <Toast data={toast} onClose={() => setToast(null)} />}
    </>
  );
}
