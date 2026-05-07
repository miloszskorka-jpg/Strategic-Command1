import { useMap } from "react-map-gl/mapbox";
import { Button } from "../Button";

export function MapControls() {
  const { current: map } = useMap();

  const controls = [
    {
      icon:    "/icons/map/north_position.svg",
      label:   "Reset North",
      onClick: () => map?.easeTo({ bearing: 0, pitch: 0, duration: 500 }),
    },
    {
      icon:    "/icons/map/change_direction.svg",
      label:   "Rotate",
      onClick: () => map?.easeTo({ bearing: (map?.getBearing() ?? 0) + 45, duration: 300 }),
    },
    {
      icon:    "/icons/map/my_location.svg",
      label:   "My Location",
      onClick: () => navigator.geolocation.getCurrentPosition(
        (pos) => map?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 14, duration: 1000 }),
        (err) => console.warn("Geolocation unavailable:", err),
      ),
    },
    {
      icon:    "/icons/map/Zoom_in.svg",
      label:   "Zoom In",
      onClick: () => map?.zoomIn({ duration: 300 }),
    },
    {
      icon:    "/icons/map/Zoom_out.svg",
      label:   "Zoom Out",
      onClick: () => map?.zoomOut({ duration: 300 }),
    },
  ];

  return (
    <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
      {controls.map((ctrl) => (
        <Button
          key={ctrl.label}
          variant="secondary"
          size="lg"
          iconOnly={
            <img src={ctrl.icon} alt={ctrl.label} className="size-[24px]" draggable={false} />
          }
          onClick={ctrl.onClick}
          title={ctrl.label}
        />
      ))}
    </div>
  );
}

export default MapControls;
