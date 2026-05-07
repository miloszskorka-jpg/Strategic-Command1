import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, NavItemConfig } from "../components/Navbar";
import { Breadcrumb } from "../components/Breadcrumb";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { FilterDropdown, FilterOption } from "../components/FilterDropdown";
import { Table, TableColumn, TableAction } from "../components/Table";
import { TagVariant } from "../components/Tag";
import { Pagination } from "../components/Pagination";
import { InviteUserModal, InviteUserData } from "../components/InviteUserModal";

// ─── Nav icon (home) ─────────────────────────────────────────────────────────

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

function IconAdd() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

type UserStatus = "Active" | "Suspended" | "Locked" | "Invited";

interface User {
  id:        number;
  email:     string;
  role:      string;
  lastLogin: string;
  status:    UserStatus;
}

const USERS: User[] = [
  { id: 1,  email: "pierre.dubois@perses.com",        role: "Operations Officer", lastLogin: "2026-04-11 14:23", status: "Active"    },
  { id: 2,  email: "marie.lefevre@perses.com",         role: "Theatre Manager",    lastLogin: "2026-04-10 09:15", status: "Active"    },
  { id: 3,  email: "oleksandr.shevchenko@perses.com",  role: "Commander",          lastLogin: "2026-04-09 21:47", status: "Suspended" },
  { id: 4,  email: "lucas.fontaine@perses.com",        role: "Operations Officer", lastLogin: "2026-04-07 07:55", status: "Active"    },
  { id: 5,  email: "camille.rousseau@perses.com",      role: "Theatre Manager",    lastLogin: "2026-04-05 12:30", status: "Active"    },
  { id: 6,  email: "sophie.laurent@perses.com",        role: "Operations Officer", lastLogin: "2026-04-04 16:44", status: "Suspended" },
  { id: 7,  email: "iryna.kovalenko@perses.com",       role: "Commander",          lastLogin: "2026-03-31 22:50", status: "Active"    },
  { id: 8,  email: "maksym.hrytsenko@perses.com",      role: "Commander",          lastLogin: "2026-03-30 13:39", status: "Locked"    },
  { id: 9,  email: "dmytro.melnyk@perses.com",         role: "Commander",          lastLogin: "2026-04-02 19:28", status: "Active"    },
  { id: 10, email: "antoine.girard@perses.com",        role: "Commander",          lastLogin: "2026-03-29 17:06", status: "Invited"   },
  { id: 11, email: "sophie.marinov@perses.com",        role: "Commander",          lastLogin: "2026-04-05 12:30", status: "Active"    },
  { id: 12, email: "lucas.perre@perses.com",           role: "Commander",          lastLogin: "2026-04-05 12:30", status: "Active"    },
  { id: 13, email: "oleksandr.sevijov@perses.com",     role: "Commander",          lastLogin: "2026-04-05 12:30", status: "Active"    },
  { id: 14, email: "martin.kamis@perses.com",          role: "Commander",          lastLogin: "2026-04-05 12:30", status: "Active"    },
];

const ROLES: FilterOption[]    = [
  { value: "operations_officer", label: "Operations Officer" },
  { value: "theatre_manager",    label: "Theatre Manager"    },
  { value: "commander",          label: "Commander"          },
];

const STATUSES: FilterOption[] = [
  { value: "active",    label: "Active"    },
  { value: "suspended", label: "Suspended" },
  { value: "locked",    label: "Locked"    },
  { value: "invited",   label: "Invited"   },
];

const STATUS_VARIANT: Record<UserStatus, TagVariant> = {
  Active:    "green",
  Suspended: "yellow",
  Locked:    "red",
  Invited:   "blue",
};

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

// ─── Columns ─────────────────────────────────────────────────────────────────

const COLUMNS: TableColumn<User>[] = [
  {
    key:      "email",
    title:    "E-mail",
    cellType: "avatar",
    sortable: true,
  },
  {
    key:      "role",
    title:    "Role",
    cellType: "label",
    sortable: true,
  },
  {
    key:      "lastLogin",
    title:    "Last Login",
    cellType: "label",
    sortable: true,
  },
  {
    key:      "status",
    title:    "Status",
    cellType: "tag",
    sortable: true,
    tagVariant: (v) => STATUS_VARIANT[v as UserStatus] ?? "green",
  },
];

const ACTIONS: TableAction<User>[] = [
  { icon: "view",   label: "View",   onClick: (row) => console.log("view",   row) },
  { icon: "edit",   label: "Edit",   onClick: (row) => console.log("edit",   row) },
  { icon: "delete", label: "Delete", onClick: (row) => console.log("delete", row), danger: true },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 14;

const ROLE_LABEL_MAP: Record<string, string> = {
  commander:          "Commander",
  operations_officer: "Operations Officer",
  theatre_manager:    "Theatre Manager",
  administrator:      "Administrator",
};

export default function UsersListPage() {
  const navigate = useNavigate();
  const [search,        setSearch]        = useState("");
  const [roleFilter,    setRoleFilter]    = useState<string[]>([]);
  const [statusFilter,  setStatusFilter]  = useState<string[]>([]);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [selectedRows,  setSelectedRows]  = useState<number[]>([]);
  const [inviteOpen,    setInviteOpen]    = useState(false);
  const [users,         setUsers]         = useState<User[]>(USERS);

  // ── Filter logic ────────────────────────────────────────────────────────────

  function handleInvite(data: InviteUserData) {
    const roleLabel = ROLE_LABEL_MAP[data.role] ?? data.role;
    const newUser: User = {
      id:        users.length + 1,
      email:     data.email,
      role:      roleLabel,
      lastLogin: "—",
      status:    "Invited",
    };
    setUsers(prev => [newUser, ...prev]);
    console.log("Invited:", data);
  }

  const filtered = users.filter((u) => {
    const matchSearch = search === "" || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter.length === 0 ||
      roleFilter.includes(u.role.toLowerCase().replace(/ /g, "_"));
    const matchStatus = statusFilter.length === 0 ||
      statusFilter.includes(u.status.toLowerCase());
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSelectRow(index: number, checked: boolean) {
    setSelectedRows((prev) =>
      checked ? [...prev, index] : prev.filter((i) => i !== index)
    );
  }

  function handleSelectAll(checked: boolean) {
    setSelectedRows(checked ? paginated.map((_, i) => i) : []);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-secondary-900 font-sans">

      {/* ── Sidebar ── */}
      <Navbar
        items={NAV_ITEMS}
        activeId="users"
        defaultVariant="collapsed"
        onNavigate={(id) => {
          const item = NAV_ITEMS.find((i) => i.id === id);
          if (item?.href) navigate(item.href);
        }}
      />

      {/* ── Main ── */}
      <main className="flex-1 px-9 py-9 min-w-0">

        {/* ── Top bar: breadcrumb + button ── */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex flex-col gap-3">
            <Breadcrumb
              items={[
                { label: "Home", showIcon: true, href: "/" },
                { label: "User Management" },
              ]}
            />
            <div>
              <h1 className="text-headline-4 text-white">User Management</h1>
              <p className="text-body-medium text-neutral-500 mt-1">
                Manage users, assign roles, and control access across the system.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            iconLeft={<IconAdd />}
            onClick={() => setInviteOpen(true)}
          >
            Add New User
          </Button>
        </div>

        {/* ── Toolbar: search + filters ── */}
        <div className="flex items-center gap-6 mb-6">
          <div className="w-[362px]">
            <Input
              placeholder="Search users..."
              showIcon
              value={search}
              onChange={(val) => { setSearch(val); setCurrentPage(1); }}
            />
          </div>

          <div className="w-[199px]">
            <FilterDropdown
              placeholder="All Roles"
              options={ROLES}
              value={roleFilter}
              onChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}
            />
          </div>

          <div className="w-[199px]">
            <FilterDropdown
              placeholder="All Statuses"
              options={STATUSES}
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
            />
          </div>
        </div>

        {/* ── Table ── */}
        <div className="flex flex-col gap-6">
          <Table<User>
            columns={COLUMNS}
            data={paginated}
            selectable
            selectedRows={selectedRows}
            onSelectRow={handleSelectRow}
            onSelectAll={handleSelectAll}
            actions={ACTIONS}
            rowKey={(row) => row.id}
          />

          <div className="flex justify-center">
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onChange={setCurrentPage}
            />
          </div>
        </div>

      </main>

      {/* ── Invite modal ── */}
      {inviteOpen && (
        <InviteUserModal
          onClose={() => setInviteOpen(false)}
          onInvite={handleInvite}
        />
      )}
    </div>
  );
}
