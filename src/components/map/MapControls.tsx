import { useMap } from "react-map-gl/mapbox";
import { Button } from "../Button";

const CONTROLS = [
  { icon: "/icons/map/north_position.svg",  label: "Reset North",  action: "resetNorth"  },
  { icon: "/icons/map/change_direction.svg", label: "Rotate",       action: "rotateCW"    },
  { icon: "/icons/map/my_location.svg",      label: "My Location",  action: "myLocation"  },
  { icon: "/icons/map/Zoom_in.svg",          label: "Zoom In",      action: "zoomIn"      },
  { icon: "/icons/map/Zoom_out.svg",         label: "Zoom Out",     action: "zoomOut"     },
] as const;

type Action = typeof CONTROLS[number]["action"];

export function MapControls() {
  const { current: map } = useMap();

  function handle(action: Action) {
    if (!map) return;
    switch (action) {
      case "resetNorth":
        map.easeTo({ bearing: 0, pitch: 0, duration: 500 });
        break;
      case "rotateCW":
        map.easeTo({ bearing: (map.getBearing() ?? 0) + 45, duration: 300 });
        break;
      case "myLocation":
        navigator.geolocation.getCurrentPosition(
          (pos) => map.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 14, duration: 1000 }),
          (err) => console.warn("Geolocation error:", err),
        );
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
      {CONTROLS.map((ctrl) => (
        <Button
          key={ctrl.label}
          variant="secondary"
          size="sm"
          title={ctrl.label}
          onClick={() => handle(ctrl.action)}
          iconOnly={
            <img src={ctrl.icon} alt={ctrl.label} className="size-full" />
          }
        />
      ))}
    </div>
  );
}
