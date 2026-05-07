import { useMap } from "react-map-gl/mapbox";

const BUTTONS = [
  {
    icon:    "/icons/map/north_position.svg",
    label:   "Reset North",
    action:  "resetNorth",
  },
  {
    icon:    "/icons/map/change_direction.svg",
    label:   "Reset Bearing",
    action:  "resetBearing",
  },
  {
    icon:    "/icons/map/my_location.svg",
    label:   "My Location",
    action:  "myLocation",
  },
  {
    icon:    "/icons/map/Zoom_in.svg",
    label:   "Zoom In",
    action:  "zoomIn",
  },
  {
    icon:    "/icons/map/Zoom_out.svg",
    label:   "Zoom Out",
    action:  "zoomOut",
  },
] as const;

type Action = typeof BUTTONS[number]["action"];

export function MapControls() {
  const { current: map } = useMap();

  function handle(action: Action) {
    if (!map) return;
    switch (action) {
      case "resetNorth":
        map.resetNorthPitch({ duration: 500 });
        break;
      case "resetBearing":
        map.rotateTo(0, { duration: 500 });
        break;
      case "myLocation":
        navigator.geolocation.getCurrentPosition((pos) => {
          map.flyTo({
            center:   [pos.coords.longitude, pos.coords.latitude],
            zoom:     14,
            duration: 1000,
          });
        });
        break;
      case "zoomIn":
        map.zoomIn({ duration: 300 });
        break;
      case "zoomOut":
        map.zoomOut({ duration: 300 });
        break;
    }
  }

  return (
    <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
      {BUTTONS.map((btn) => (
        <button
          key={btn.label}
          onClick={() => handle(btn.action)}
          title={btn.label}
          className="size-[48px] flex items-center justify-center bg-[#0D1112] border border-[#161D20] rounded-[4px] hover:bg-[#161D20] hover:border-[#232E33] transition-colors duration-150 cursor-pointer shadow-[0px_2px_8px_rgba(0,0,0,0.4)]"
        >
          <img src={btn.icon} alt={btn.label} className="size-[20px]" />
        </button>
      ))}
    </div>
  );
}
