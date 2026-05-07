import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormFields {
  name:        string;
  description: string;
  coordinates: string;
}

interface FormErrors {
  name?:        string;
  description?: string;
  coordinates?: string;
}

export interface CreateObjectiveData {
  name:        string;
  description: string;
  coordinates: string;
}

interface Props {
  mapClickCoords: string;
  onCancel:       () => void;
  onCreate:       (data: CreateObjectiveData) => void;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8l3.5 3.5L13 4.5" stroke="#6BC497" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, placeholder, error,
}: {
  label:       string;
  value:       string;
  onChange:    (v: string) => void;
  placeholder: string;
  error?:      string;
}) {
  const filled = value.trim().length > 0;
  const borderClass = error
    ? "border-[#F64C4C]"
    : filled
      ? "border-[#6BC497]"
      : "border-[#161D20] focus:border-[#3A70E2]";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-white text-[12px]">
        {label} <span className="text-[#EB6F70]">*</span>
      </label>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-[#0D1112] border ${borderClass} rounded-[4px] px-3 py-3 text-white text-[14px] placeholder:text-[#9A999A] outline-none transition-colors ${filled && !error ? "pr-10" : ""}`}
        />
        {filled && !error && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <CheckIcon />
          </span>
        )}
      </div>
      {error && <p className="text-[#F64C4C] text-[12px]">{error}</p>}
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

export function CreateObjectiveForm({ mapClickCoords, onCancel, onCreate }: Props) {
  const [form,   setForm]   = useState<FormFields>({ name: "", description: "", coordinates: "" });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (mapClickCoords) {
      setForm((prev) => ({ ...prev, coordinates: mapClickCoords }));
      setErrors((prev) => ({ ...prev, coordinates: undefined }));
    }
  }, [mapClickCoords]);

  function setField(key: keyof FormFields, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleCreate() {
    const e: FormErrors = {};
    if (!form.name.trim())        e.name        = "Name is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.coordinates.trim()) e.coordinates = "Coordinates are required";
    if (Object.keys(e).length) { setErrors(e); return; }
    onCreate(form);
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-white text-[24px] font-semibold leading-none">Create New Objective</h2>
      <div className="border-b border-[#161D20] mt-2 mb-6" />

      <div className="flex flex-col gap-4">
        <Field
          label="Name"
          value={form.name}
          onChange={(v) => setField("name", v)}
          placeholder="e.g. secure river crossing"
          error={errors.name}
        />
        <Field
          label="Description"
          value={form.description}
          onChange={(v) => setField("description", v)}
          placeholder="describe the objective in detail"
          error={errors.description}
        />
        <Field
          label="Coordinates"
          value={form.coordinates}
          onChange={(v) => setField("coordinates", v)}
          placeholder="paste coordinates here or mark target on map"
          error={errors.coordinates}
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          className="flex-1 bg-[#161D20] hover:bg-[#232E33] text-white font-semibold text-[16px] py-[10px] rounded-[4px] transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          className="flex-1 bg-[#0C9D61] hover:bg-[#097A4B] text-white font-semibold text-[16px] py-[10px] rounded-[4px] transition-colors cursor-pointer"
        >
          Create
        </button>
      </div>
    </div>
  );
}
