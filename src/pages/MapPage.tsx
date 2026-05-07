import Map from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router-dom";
import { Navbar, NavItemConfig } from "../components/Navbar";
import { PlanningPanel } from "../components/map/PlanningPanel";
import { MapControls } from "../components/map/MapControls";

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

export default function MapPage() {
  const navigate = useNavigate();

  console.log("Mapbox token:", import.meta.env.VITE_MAPBOX_TOKEN);

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

      <main className="flex-1 relative h-full">
        <Map
          id="main-map"
          initialViewState={{ longitude: 15, latitude: 48, zoom: 4 }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        />
        <MapControls />
      </main>

      <PlanningPanel />
    </div>
  );
}
