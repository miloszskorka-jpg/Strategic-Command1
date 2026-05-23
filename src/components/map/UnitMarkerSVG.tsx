import React from "react";

export type UnitType =
  | "Battalion"
  | "Company (infantry)"
  | "Platoon (infantry)"
  | "Squad (infantry)"
  | "Platoon (artillery)"
  | "Squad (artillery)";

interface UnitMarkerSVGProps {
  unitType:  UnitType;
  disabled?: boolean;
  hovered?:  boolean;
  selected?: boolean;
}

export function UnitMarkerSVG({
  unitType,
  disabled = false,
  hovered  = false,
  selected = false,
}: UnitMarkerSVGProps) {
  const color   = hovered ? "#93C8FF" : selected ? "#BDDDFF" : "#4BA1FF";
  const opacity = disabled ? 0.5 : 1;
  const maskId  = `mask-${unitType.replace(/[^a-zA-Z]/g, "")}`;

  function getPath() {
    switch (unitType) {
      case "Battalion":
        return (
          <>
            <path fillRule="evenodd" clipRule="evenodd" d="M33 15.8994V33H3V15.8994H33Z" fill={color} />
            <path d="M13.5 4.5H16.5V13.5H13.5V4.5Z" fill={color} />
            <path d="M19.5 4.5H22.5V13.5H19.5V4.5Z" fill={color} />
          </>
        );

      case "Company (infantry)":
        return (
          <>
            <path fillRule="evenodd" clipRule="evenodd"
              d="M33 16.1133V33.5801H3V16.1133H33ZM12.9902 20.124L16.1309 25.4736L12.8877 30.8232H16.1514L17.9487 27.646H18.0322L19.8296 30.8232H23.1138L19.8296 25.4736L22.9907 20.124H19.7871L18.0322 23.2383H17.9487L16.2129 20.124H12.9902Z"
              fill={color} />
            <path d="M9.36364 13.3548C11.3719 13.3548 13 11.7084 13 9.67742C13 7.64644 11.3719 6 9.36364 6C7.35533 6 5.72727 7.64644 5.72727 9.67742C5.72727 11.7084 7.35533 13.3548 9.36364 13.3548Z" fill={color} />
            <path d="M18.4545 13.3548C20.4629 13.3548 22.0909 11.7084 22.0909 9.67742C22.0909 7.64644 20.4629 6 18.4545 6C16.4462 6 14.8182 7.64644 14.8182 9.67742C14.8182 11.7084 16.4462 13.3548 18.4545 13.3548Z" fill={color} />
            <path d="M27.5455 13.3548C29.5538 13.3548 31.1818 11.7084 31.1818 9.67742C31.1818 7.64644 29.5538 6 27.5455 6C25.5371 6 23.9091 7.64644 23.9091 9.67742C23.9091 11.7084 25.5371 13.3548 27.5455 13.3548Z" fill={color} />
          </>
        );

      case "Platoon (infantry)":
        return (
          <>
            <path fillRule="evenodd" clipRule="evenodd"
              d="M33 16.1133V33.5801H3V16.1133H33ZM12.9902 20.124L16.1309 25.4736L12.8877 30.8232H16.1514L17.9487 27.646H18.0322L19.8296 30.8232H23.1138L19.8296 25.4736L22.9907 20.124H19.7886L18.0322 23.2383H17.9487L16.2129 20.124H12.9902Z"
              fill={color} />
            <path d="M13.9091 13.3548C15.9174 13.3548 17.5455 11.7084 17.5455 9.67742C17.5455 7.64644 15.9174 6 13.9091 6C11.9008 6 10.2727 7.64644 10.2727 9.67742C10.2727 11.7084 11.9008 13.3548 13.9091 13.3548Z" fill={color} />
            <path d="M23 13.3548C25.0083 13.3548 26.6364 11.7084 26.6364 9.67742C26.6364 7.64644 25.0083 6 23 6C20.9917 6 19.3636 7.64644 19.3636 9.67742C19.3636 11.7084 20.9917 13.3548 23 13.3548Z" fill={color} />
          </>
        );

      case "Squad (infantry)":
        return (
          <>
            <path fillRule="evenodd" clipRule="evenodd"
              d="M33 16.1133V33.5801H3V16.1133H33ZM12.9902 20.124L16.1309 25.4736L12.8877 30.8232H16.1514L17.9487 27.646H18.0322L19.8296 30.8232H23.1138L19.8296 25.4736L22.9907 20.124H19.7886L18.0322 23.2383H17.9487L16.2129 20.124H12.9902Z"
              fill={color} />
            <path d="M17.5455 13.3548C19.5538 13.3548 21.1818 11.7084 21.1818 9.67742C21.1818 7.64644 19.5538 6 17.5455 6C15.5371 6 13.9091 7.64644 13.9091 9.67742C13.9091 11.7084 15.5371 13.3548 17.5455 13.3548Z" fill={color} />
          </>
        );

      case "Platoon (artillery)":
        return (
          <>
            <path d="M13.9091 13.2C15.9174 13.2 17.5455 11.5882 17.5455 9.6C17.5455 7.61177 15.9174 6 13.9091 6C11.9008 6 10.2727 7.61177 10.2727 9.6C10.2727 11.5882 11.9008 13.2 13.9091 13.2Z" fill={color} />
            <path d="M23 13.2C25.0083 13.2 26.6364 11.5882 26.6364 9.6C26.6364 7.61177 25.0083 6 23 6C20.9917 6 19.3636 7.61177 19.3636 9.6C19.3636 11.5882 20.9917 13.2 23 13.2Z" fill={color} />
            <path fillRule="evenodd" clipRule="evenodd"
              d="M33 15.75V33H3V15.75H33ZM18 18.4748C14.7366 18.4748 12.091 21.116 12.0908 24.375C12.0908 27.6341 14.7365 30.2767 18 30.2767C21.2635 30.2767 23.9092 27.6341 23.9092 24.375C23.909 21.116 21.2634 18.4748 18 18.4748Z"
              fill={color} />
          </>
        );

      case "Squad (artillery)":
        return (
          <>
            <path d="M18.4545 13.2C20.4629 13.2 22.0909 11.5882 22.0909 9.6C22.0909 7.61177 20.4629 6 18.4545 6C16.4462 6 14.8182 7.61177 14.8182 9.6C14.8182 11.5882 16.4462 13.2 18.4545 13.2Z" fill={color} />
            <path fillRule="evenodd" clipRule="evenodd"
              d="M33 15.75V33H3V15.75H33ZM18 18.6006C14.7366 18.6006 12.091 21.219 12.0908 24.4497C12.0908 27.6806 14.7365 30.3003 18 30.3003C21.2635 30.3003 23.9092 27.6806 23.9092 24.4497C23.909 21.219 21.2634 18.6006 18 18.6006Z"
              fill={color} />
          </>
        );

      default:
        return null;
    }
  }

  return (
    <div style={{ position: "relative", opacity, display: "inline-block" }}>
      {selected && (
        <div style={{
          position:      "absolute",
          inset:         -6,
          borderRadius:  "50%",
          border:        "2px solid #BDDDFF",
          opacity:       0.5,
          pointerEvents: "none",
        }} />
      )}
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <mask
          id={maskId}
          style={{ maskType: "alpha" } as React.CSSProperties}
          maskUnits="userSpaceOnUse"
          x="0" y="0" width="36" height="36"
        >
          <path d="M0 0H36V36H0V0Z" fill="#D9D9D9" />
        </mask>
        <g mask={`url(#${maskId})`}>
          {getPath()}
        </g>
      </svg>
    </div>
  );
}

export default UnitMarkerSVG;
