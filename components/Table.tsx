import React, { useState, ReactNode } from "react";
import { Tag, TagVariant } from "./Tag";
import { Checkbox } from "./Checkbox";

// ─── Icon asset URLs ──────────────────────────────────────────────────────────
const imgEdit       = "http://localhost:3845/assets/b20a036a94f790e2514024847abc847bc45cb3e0.svg";
const imgVisibility = "http://localhost:3845/assets/c42b967916dd91cf085b7a85e680758ce1b9bb4d.svg";
const imgDelete     = "http://localhost:3845/assets/c81b9840add43ff4c506b6304d62ea595fc9a424.svg";
const imgPerson     = "http://localhost:3845/assets/0b8e17ddd30130232f9a0b611104775eaba50b7b.svg";
const imgArrowDown  = "http://localhost:3845/assets/c579d7de8e2ac6272751b2d4b897c4c142f398c4.svg";
const imgArrowUp    = "http://localhost:3845/assets/f52a1c56deef9ddc931ca535cb9562dfeaff1391.svg";
const MASK          = "http://localhost:3845/assets/d8940e916ba2c533ac3cf8007ee163af49417265.svg";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc" | "none";

export type CellType =
  | "avatar"
  | "label"
  | "tag"
  | "checkbox"
  | "actions"
  | "flag"
  | "custom";

export interface TableColumn<T = Record<string, unknown>> {
  key:           string;
  title?:        string;
  cellType?:     CellType;
  sortable?:     boolean;
  width?:        number | string;
  /** Custom cell renderer */
  render?:       (value: unknown, row: T, rowIndex: number) => ReactNode;
  /** For tag cells: map value → TagVariant */
  tagVariant?:   (value: unknown) => TagVariant;
  /** For flag cells: map value → flag image src */
  flagSrc?:      (value: unknown) => string;
}

export interface TableAction<T = Record<string, unknown>> {
  icon:      "edit" | "view" | "delete" | ReactNode;
  label?:    string;
  onClick:   (row: T, rowIndex: number) => void;
  danger?:   boolean;
}

export interface TableProps<T = Record<string, unknown>> {
  columns:        TableColumn<T>[];
  data:           T[];
  selectable?:    boolean;
  selectedRows?:  number[];
  onSelectRow?:   (index: number, checked: boolean) => void;
  onSelectAll?:   (checked: boolean) => void;
  actions?:       TableAction<T>[];
  onSort?:        (key: string, direction: SortDirection) => void;
  className?:     string;
  rowKey?:        (row: T, index: number) => string | number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function MaskedIcon({ src, className = "size-[16px]" }: { src: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute inset-[12.5%] mask-alpha mask-intersect mask-no-clip mask-no-repeat"
        style={{ maskImage: `url('${MASK}')`, maskSize: "24px 24px", maskPosition: "-3px -3px" }}
      >
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={src} />
      </div>
    </div>
  );
}

// ─── Column Header ────────────────────────────────────────────────────────────

interface ColumnHeaderProps {
  title?:      string;
  sortable?:   boolean;
  sort?:       SortDirection;
  onSort?:     () => void;
  isCheckbox?: boolean;
  checked?:    boolean;
  indeterminate?: boolean;
  onCheck?:    (v: boolean) => void;
  empty?:      boolean;
}

function ColumnHeader({
  title, sortable, sort = "none", onSort,
  isCheckbox, checked, indeterminate, onCheck,
  empty,
}: ColumnHeaderProps) {
  const base = "bg-[#0D1112] border-b border-[#161D20] flex items-center shrink-0 w-full";

  if (empty) {
    return <div className={`${base} h-[48px] w-[40px]`} />;
  }

  if (isCheckbox) {
    return (
      <div className={`${base} justify-center px-2 py-[14px] w-[40px]`}>
        <Checkbox
          checked={checked}
          indeterminate={indeterminate}
          onChange={onCheck}
        />
      </div>
    );
  }

  return (
    <div
      className={`${base} gap-[10px] px-[10px] py-4 ${sortable ? "cursor-pointer select-none" : ""}`}
      onClick={sortable ? onSort : undefined}
    >
      <span className="text-[14px] font-normal leading-[16px] text-[#9A999A] font-['Inter',sans-serif] whitespace-nowrap">
        {title ?? "Column"}
      </span>
      {sortable && sort !== "none" && (
        <div className="relative shrink-0 size-[16px]">
          <img
            alt={sort === "asc" ? "sort ascending" : "sort descending"}
            className="absolute block inset-0 max-w-none size-full"
            src={sort === "asc" ? imgArrowUp : imgArrowDown}
          />
        </div>
      )}
    </div>
  );
}

// ─── Table Cell ───────────────────────────────────────────────────────────────

interface TableCellProps {
  type:       CellType;
  value:      unknown;
  isHovered:  boolean;
  tagVariant?: (value: unknown) => TagVariant;
  flagSrc?:   (value: unknown) => string;
  render?:    () => ReactNode;
}

function TableCell({ type, value, isHovered, tagVariant, flagSrc, render }: TableCellProps) {
  const bg   = isHovered ? "bg-[#101517]" : "bg-[#0D1112]";
  const base = `${bg} border-b border-[#161D20] flex items-center w-full shrink-0`;

  if (type === "avatar") {
    return (
      <div className={`${base} gap-2 px-[10px] py-3`}>
        <div className="relative shrink-0 size-[24px]">
          <div
            className="absolute inset-[16.67%] mask-alpha mask-intersect mask-no-clip mask-no-repeat"
            style={{ maskImage: `url('${MASK}')`, maskSize: "24px 24px", maskPosition: "-4px -4px" }}
          >
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPerson} />
          </div>
        </div>
        <span className="text-[14px] font-normal leading-[16px] text-white font-['Inter',sans-serif] whitespace-nowrap">
          {String(value ?? "Avatar Item")}
        </span>
      </div>
    );
  }

  if (type === "label") {
    return (
      <div className={`${base} px-[10px] py-4`}>
        <span className="text-[14px] font-normal leading-[16px] text-white font-['Inter',sans-serif] whitespace-nowrap">
          {String(value ?? "")}
        </span>
      </div>
    );
  }

  if (type === "tag") {
    const variant = tagVariant ? tagVariant(value) : "green";
    return (
      <div className={`${base} px-[10px] py-[13px]`}>
        <Tag variant={variant} label={String(value ?? "")} />
      </div>
    );
  }

  if (type === "checkbox") {
    return (
      <div className={`${base} justify-center px-[10px] py-[14px] w-[40px]`}>
        <Checkbox />
      </div>
    );
  }

  if (type === "flag") {
    const src = flagSrc ? flagSrc(value) : "";
    return (
      <div className={`${base} px-2 py-3`}>
        {src && (
          <img
            alt={String(value ?? "flag")}
            src={src}
            className="h-[24px] w-[36px] object-cover"
          />
        )}
      </div>
    );
  }

  if (type === "custom" && render) {
    return (
      <div className={`${base} px-[10px] py-3`}>
        {render()}
      </div>
    );
  }

  // Default: label
  return (
    <div className={`${base} px-[10px] py-4`}>
      <span className="text-[14px] font-normal leading-[16px] text-white font-['Inter',sans-serif]">
        {String(value ?? "")}
      </span>
    </div>
  );
}

// ─── Action Buttons cell ──────────────────────────────────────────────────────

interface ActionsCellProps<T> {
  row:       T;
  rowIndex:  number;
  actions:   TableAction<T>[];
  isHovered: boolean;
}

function ActionsCell<T>({ row, rowIndex, actions, isHovered }: ActionsCellProps<T>) {
  const bg = isHovered ? "bg-[#101517]" : "bg-[#0D1112]";

  function getIconSrc(icon: TableAction<T>["icon"]) {
    if (icon === "edit")   return imgEdit;
    if (icon === "view")   return imgVisibility;
    if (icon === "delete") return imgDelete;
    return null;
  }

  return (
    <div className={`${bg} border-b border-[#161D20] flex items-center justify-end gap-[10px] px-[10px] py-2 w-full shrink-0`}>
      {actions.map((action, i) => {
        const iconSrc = getIconSrc(action.icon);
        return (
          <button
            key={i}
            onClick={() => action.onClick(row, rowIndex)}
            title={action.label}
            className={[
              "flex items-center justify-center p-2 rounded-[4px] min-w-[32px]",
              "hover:bg-[#232E33] transition-colors duration-150",
              action.danger ? "text-[#EC2D30]" : "text-white",
            ].join(" ")}
          >
            {iconSrc ? (
              <MaskedIcon src={iconSrc} />
            ) : (
              <span className="size-[16px] flex items-center justify-center">
                {action.icon as ReactNode}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  selectable    = false,
  selectedRows  = [],
  onSelectRow,
  onSelectAll,
  actions       = [],
  onSort,
  className     = "",
  rowKey,
}: TableProps<T>) {
  const [hoveredRow, setHoveredRow]     = useState<number | null>(null);
  const [sortState, setSortState]       = useState<Record<string, SortDirection>>({});

  const allSelected       = data.length > 0 && selectedRows.length === data.length;
  const someSelected      = selectedRows.length > 0 && !allSelected;
  const hasActions        = actions.length > 0;

  function handleSort(key: string) {
    const current = sortState[key] ?? "none";
    const next: SortDirection =
      current === "none" ? "desc" : current === "desc" ? "asc" : "none";
    setSortState(prev => ({ ...prev, [key]: next }));
    onSort?.(key, next);
  }

  return (
    <div
      className={[
        "border border-[#161D20] rounded-[8px] overflow-hidden w-full",
        "flex items-start overflow-x-auto",
        className,
      ].join(" ")}
    >
      {/* Checkbox column */}
      {selectable && (
        <div className="flex flex-col shrink-0 w-[40px]">
          <ColumnHeader
            isCheckbox
            checked={allSelected}
            indeterminate={someSelected}
            onCheck={v => onSelectAll?.(v)}
          />
          {data.map((row, i) => (
            <div
              key={rowKey ? rowKey(row, i) : i}
              className={`${i === hoveredRow ? "bg-[#101517]" : "bg-[#0D1112]"} border-b border-[#161D20] flex items-center justify-center px-[10px] py-[14px] w-[40px] shrink-0`}
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <Checkbox
                checked={selectedRows.includes(i)}
                onChange={v => onSelectRow?.(i, v)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Data columns */}
      {columns.map(col => (
        <div key={col.key} className="flex flex-col flex-1 min-w-0" style={col.width ? { width: col.width, flex: "none" } : {}}>
          <ColumnHeader
            title={col.title ?? col.key}
            sortable={col.sortable}
            sort={sortState[col.key] ?? "none"}
            onSort={() => handleSort(col.key)}
          />
          {data.map((row, i) => (
            <div
              key={rowKey ? rowKey(row, i) : i}
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <TableCell
                type={col.cellType ?? "label"}
                value={row[col.key]}
                isHovered={i === hoveredRow}
                tagVariant={col.tagVariant}
                flagSrc={col.flagSrc}
                render={col.render ? () => col.render!(row[col.key], row, i) : undefined}
              />
            </div>
          ))}
        </div>
      ))}

      {/* Actions column */}
      {hasActions && (
        <div className="flex flex-col shrink-0 w-[136px]">
          {/* Actions header */}
          <div className="bg-[#0D1112] border-b border-[#161D20] flex items-center px-[10px] py-4 w-full shrink-0">
            <span className="text-[14px] font-normal leading-[16px] text-[#9A999A] font-['Inter',sans-serif]">
              Actions
            </span>
          </div>
          {data.map((row, i) => (
            <div
              key={rowKey ? rowKey(row, i) : i}
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <ActionsCell
                row={row}
                rowIndex={i}
                actions={actions}
                isHovered={i === hoveredRow}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Table;
