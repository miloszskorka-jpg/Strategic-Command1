import { useMap } from "react-map-gl/mapbox";

const CONTROLS = [
  {
    icon:    "/icons/map/north_position.svg",
    label:   "Reset North",
    onClick: (map: ReturnType<typeof useMap>["current"]) => {
      map?.easeTo({ bearing: 0, pitch: 0, duration: 500 });
    },
  },
  {
    icon:    "/icons/map/change_direction.svg",
    label:   "Rotate 45°",
    onClick: (map: ReturnType<typeof useMap>["current"]) => {
      map?.easeTo({ bearing: (map.getBearing() ?? 0) + 45, duration: 300 });
    },
  },
  {
    icon:    "/icons/map/my_location.svg",
    label:   "My Location",
    onClick: (map: ReturnType<typeof useMap>["current"]) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => map?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 14, duration: 1000 }),
        (err) => console.warn("Geolocation unavailable:", err),
      );
    },
  },
  {
    icon:    "/icons/map/Zoom_in.svg",
    label:   "Zoom In",
    onClick: (map: ReturnType<typeof useMap>["current"]) => {
      map?.zoomIn({ duration: 300 });
    },
  },
  {
    icon:    "/icons/map/Zoom_out.svg",
    label:   "Zoom Out",
    onClick: (map: ReturnType<typeof useMap>["current"]) => {
      map?.zoomOut({ duration: 300 });
    },
  },
];

export function MapControls() {
  const { current: map } = useMap();

  return (
    <div
      className="absolute bottom-6 right-6 z-10 flex flex-col gap-2"
      style={{ pointerEvents: "all" }}
    >
      {CONTROLS.map((ctrl) => (
        <button
          key={ctrl.label}
          onClick={() => ctrl.onClick(map)}
          title={ctrl.label}
          className="size-[48px] flex items-center justify-center bg-[#232E33] border border-[#465C66] rounded-[4px] hover:bg-[#2D3A40] hover:border-[#555455] active:bg-[#1A2329] transition-colors duration-150 cursor-pointer shadow-[0px_2px_8px_rgba(0,0,0,0.5)]"
        >
          <img src={ctrl.icon} alt={ctrl.label} className="size-[24px]" draggable={false} />
        </button>
      ))}
    </div>
  );
}

export default MapControls;
