import { useState, useEffect } from "react";
import { CreateObjectiveForm, CreateObjectiveData } from "./CreateObjectiveForm";

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

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_OBJECTIVES: Objective[] = [
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

function ObjectiveCard({ obj, onDelete }: { obj: Objective; onDelete: (id: string) => void }) {
  return (
    <div className="border border-[#161D20] rounded-[4px] p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[#9A999A] text-[12px]">{formatTimestamp(obj.createdAt)}</span>
        <button onClick={() => onDelete(obj.id)} className="text-[#E53535] hover:text-red-400 transition-colors" aria-label="Delete">
          <IconTrash />
        </button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="shrink-0 size-[20px] rounded-full bg-[#5900D9]" />
        <span className="text-white text-[14px] font-semibold">{obj.name}</span>
        <StatusTag status={obj.status} />
      </div>
      <div>
        <span className="text-[#9A999A] text-[12px]">Description: </span>
        <span className="text-white text-[12px] line-clamp-2">{obj.description}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[#9A999A] text-[12px]">Coordinates:</span>
        <span className="text-[#9A999A]"><IconLocation /></span>
        <span className="text-white text-[12px]">{formatCoord(obj.lat)},&nbsp;&nbsp;{formatCoord(obj.lng)}</span>
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
  onDelete,
  onCreateClick,
}: {
  objectives:    Objective[];
  onDelete:      (id: string) => void;
  onCreateClick: () => void;
}) {
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

      <button
        onClick={onCreateClick}
        className="w-full flex items-center justify-center gap-2 bg-[#0C9D61] hover:bg-[#097A4B] text-white font-semibold text-[16px] py-[10px] rounded-[4px] my-4 transition-colors cursor-pointer"
      >
        <IconPlus />
        Create New Objective
      </button>

      <div className="flex flex-col gap-3">
        {visible.length === 0 ? (
          <p className="text-[#9A999A] text-[13px] text-center py-6">No objectives match this filter.</p>
        ) : (
          visible.map((obj) => <ObjectiveCard key={obj.id} obj={obj} onDelete={onDelete} />)
        )}
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-[#0D1112] border border-[#1A2329] rounded-[4px] p-4 shadow-[0px_4px_16px_rgba(0,0,0,0.6)] max-w-[320px]">
      <div className="shrink-0 size-[32px] rounded-full bg-[#0C9D61] flex items-center justify-center text-white">
        <IconCheck />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-[14px]">New objective has been created</p>
        <p className="text-[#9A999A] text-[12px] mt-0.5">"{name}" was successfully added to the objectives list.</p>
      </div>
      <button onClick={onClose} className="shrink-0 text-[#9A999A] hover:text-white transition-colors">
        <IconClose />
      </button>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

const TABS: Tab[] = ["Objectives", "Plans", "Scenarios"];

interface PlanningPanelProps {
  isCreating:       boolean;
  onStartCreating:  () => void;
  onStopCreating:   () => void;
  mapClickCoords:   string;
}

export function PlanningPanel({ isCreating, onStartCreating, onStopCreating, mapClickCoords }: PlanningPanelProps) {
  const [activeTab,   setActiveTab]   = useState<Tab>("Objectives");
  const [objectives,  setObjectives]  = useState<Objective[]>(MOCK_OBJECTIVES);
  const [toastName,   setToastName]   = useState<string | null>(null);

  useEffect(() => {
    if (!toastName) return;
    const t = setTimeout(() => setToastName(null), 4000);
    return () => clearTimeout(t);
  }, [toastName]);

  function handleCreate(data: CreateObjectiveData) {
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
    setObjectives((prev) => [newObj, ...prev]);
    onStopCreating();
    setToastName(data.name);
  }

  function handleDelete(id: string) {
    setObjectives((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <>
      <div className="w-[390px] shrink-0 bg-[#0A0D0E] border-l border-[#101517] h-full overflow-y-auto flex flex-col">
        <div className="p-6 flex flex-col gap-5 flex-1">

          {isCreating ? (
            <CreateObjectiveForm
              mapClickCoords={mapClickCoords}
              onCancel={onStopCreating}
              onCreate={handleCreate}
            />
          ) : (
            <>
              {/* header */}
              <div className="flex items-center justify-between">
                <h2 className="text-white text-[24px] font-semibold leading-none">Planning</h2>
                <button className="size-[32px] flex items-center justify-center text-[#9A999A] hover:text-white hover:bg-[#161D20] rounded-[4px] transition-colors">
                  <IconPerson />
                </button>
              </div>

              {/* tabs */}
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

              {/* content */}
              {activeTab === "Objectives" && (
                <ObjectivesSection
                  objectives={objectives}
                  onDelete={handleDelete}
                  onCreateClick={onStartCreating}
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

      {toastName && <Toast name={toastName} onClose={() => setToastName(null)} />}
    </>
  );
}
