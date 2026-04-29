import { useState, useEffect, useRef } from "react";
import { Dropdown } from "./Dropdown";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InviteUserData {
  email: string;
  role:  string;
}

export interface InviteUserModalProps {
  onClose:   () => void;
  onInvite:  (data: InviteUserData) => void;
}

// ─── Role options ─────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  { value: "commander",          label: "Commander"          },
  { value: "operations_officer", label: "Operations Officer" },
  { value: "theatre_manager",    label: "Theatre Manager"    },
  { value: "administrator",      label: "Administrator"      },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ─── Label ────────────────────────────────────────────────────────────────────

function FieldLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-1 px-[4px] mb-1">
      <span className="text-[12px] font-normal leading-[14px] font-['Inter',sans-serif] text-white">
        {text}
      </span>
      <span className="text-[12px] font-normal leading-[14px] font-['Inter',sans-serif] text-[#9A999A]">
        (required)
      </span>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function InviteUserModal({ onClose, onInvite }: InviteUserModalProps) {
  const [email,      setEmail]      = useState("");
  const [role,       setRole]       = useState("");
  const [emailError, setEmailError] = useState("");
  const [roleError,  setRoleError]  = useState("");
  const [emailFocus, setEmailFocus] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);

  // ── Focus email on open ─────────────────────────────────────────────────────
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // ── Lock body scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // ── Escape key ──────────────────────────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  function handleSubmit() {
    let valid = true;

    if (!email.trim() || !isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!role) {
      setRoleError("Please select a role");
      valid = false;
    } else {
      setRoleError("");
    }

    if (!valid) return;

    onInvite({ email: email.trim(), role });
    onClose();
  }

  // ── Input border ────────────────────────────────────────────────────────────
  const emailBorder =
    emailError  ? "#F64C4C"
    : emailFocus ? "#3A70E2"
    : "#161D20";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-modal-title"
        className="fixed z-50 flex flex-col gap-6"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 520,
          backgroundColor: "#0A0D0E",
          border: "1px solid #101517",
          borderRadius: 8,
          padding: 24,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Title */}
        <h2
          id="invite-modal-title"
          className="font-['Inter',sans-serif] font-semibold text-white"
          style={{ fontSize: 24, lineHeight: "36px", margin: 0 }}
        >
          Invite New User
        </h2>

        {/* Fields */}
        <div className="flex flex-col gap-5">

          {/* E-mail field */}
          <div className="flex flex-col">
            <FieldLabel text="E-mail" />
            <div
              className="flex items-center px-3 py-3 rounded-[4px] border border-solid transition-colors duration-150"
              style={{
                backgroundColor: "#0D1112",
                borderColor: emailBorder,
              }}
            >
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                placeholder="Add e-mail"
                className={[
                  "flex-1 min-w-0 bg-transparent outline-none",
                  "text-[14px] font-normal leading-[16px] font-['Inter',sans-serif]",
                  "placeholder:text-[#9A999A] text-white",
                ].join(" ")}
              />
            </div>
            {emailError && (
              <span className="mt-1 px-1 text-[12px] font-normal leading-[14px] font-['Inter',sans-serif] text-[#F64C4C]">
                {emailError}
              </span>
            )}
          </div>

          {/* Role dropdown */}
          <div className="flex flex-col">
            <FieldLabel text="Role" />
            <Dropdown
              options={ROLE_OPTIONS}
              value={role}
              onChange={v => {
                setRole(v);
                if (roleError) setRoleError("");
              }}
              placeholder="Choose a role"
              status={roleError ? "error" : "default"}
            />
            {roleError && (
              <span className="mt-1 px-1 text-[12px] font-normal leading-[14px] font-['Inter',sans-serif] text-[#F64C4C]">
                {roleError}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className={[
              "px-4 py-[6px] rounded-[4px]",
              "text-[14px] font-semibold leading-[20px] font-['Inter',sans-serif] text-white",
              "transition-colors duration-150",
              "hover:bg-[#232E33]",
            ].join(" ")}
            style={{ backgroundColor: "#161D20" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={[
              "px-4 py-[6px] rounded-[4px]",
              "text-[14px] font-semibold leading-[20px] font-['Inter',sans-serif] text-white",
              "transition-colors duration-150",
              "hover:bg-[#097A4B]",
            ].join(" ")}
            style={{ backgroundColor: "#0C9D61" }}
          >
            Invite
          </button>
        </div>
      </div>
    </>
  );
}

export default InviteUserModal;
