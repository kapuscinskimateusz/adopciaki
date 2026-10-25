import type { Species } from "./sample-animals";

export type ArtPalette = {
  base: string;
  ear: string;
  light: string;
  accent: string;
};

const INK = "#2b2118";
const PINK = "#f0a7a0";

type Props = {
  species: Species;
  palette: ArtPalette;
  label: string;
  className?: string;
};

// Geometryczne portrety zamiast zdjęć: spójny styl, zero licencji i zero ciężaru.
export function AnimalArt({ species, palette, label, className }: Props) {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={label}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {species === "dog" && <Dog {...palette} />}
      {species === "cat" && <Cat {...palette} />}
      {species === "rabbit" && <Rabbit {...palette} />}
    </svg>
  );
}

function Eyes({ y = 98, gap = 21 }: { y?: number; gap?: number }) {
  return (
    <g>
      {[100 - gap, 100 + gap].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={y} r="6" fill={INK} />
          <circle cx={cx + 2} cy={y - 2} r="2" fill="#fff" />
        </g>
      ))}
    </g>
  );
}

function Collar({ accent }: { accent: string }) {
  return (
    <g>
      <path d="M62 156 Q100 176 138 156 L142 170 Q100 192 58 170 Z" fill={accent} />
      <circle cx="100" cy="180" r="8" fill="#f2b84b" stroke={INK} strokeWidth="2" />
    </g>
  );
}

function Dog({ base, ear, light, accent }: ArtPalette) {
  return (
    <g>
      <ellipse cx="100" cy="206" rx="72" ry="52" fill={base} />
      <ellipse
        cx="46"
        cy="104"
        rx="20"
        ry="42"
        fill={ear}
        transform="rotate(14 46 104)"
      />
      <ellipse
        cx="154"
        cy="104"
        rx="20"
        ry="42"
        fill={ear}
        transform="rotate(-14 154 104)"
      />
      <ellipse cx="100" cy="104" rx="54" ry="50" fill={base} />
      <ellipse cx="78" cy="92" rx="17" ry="19" fill={ear} opacity="0.9" />
      <ellipse cx="100" cy="128" rx="28" ry="21" fill={light} />
      <Eyes y={98} gap={22} />
      <ellipse cx="100" cy="118" rx="10" ry="7" fill={INK} />
      <path
        d="M100 125 V133 M100 133 Q92 142 83 136 M100 133 Q108 142 117 136"
        stroke={INK}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M92 138 Q100 156 108 138 Z" fill={PINK} />
      <Collar accent={accent} />
    </g>
  );
}

function Cat({ base, ear, light, accent }: ArtPalette) {
  return (
    <g>
      <ellipse cx="100" cy="206" rx="68" ry="50" fill={base} />
      <path d="M48 92 L52 36 L92 66 Z" fill={base} />
      <path d="M152 92 L148 36 L108 66 Z" fill={base} />
      <path d="M56 80 L58 50 L80 68 Z" fill={PINK} />
      <path d="M144 80 L142 50 L120 68 Z" fill={PINK} />
      <ellipse cx="100" cy="106" rx="56" ry="48" fill={base} />
      <path
        d="M100 60 V76 M86 62 L89 76 M114 62 L111 76"
        stroke={ear}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <ellipse cx="100" cy="128" rx="24" ry="17" fill={light} />
      {[-23, 23].map((dx) => (
        <g key={dx}>
          <ellipse cx={100 + dx} cy="102" rx="9" ry="10" fill="#f2c94c" />
          <ellipse cx={100 + dx} cy="102" rx="3" ry="8" fill={INK} />
        </g>
      ))}
      <path d="M94 117 H106 L100 125 Z" fill={PINK} />
      <path
        d="M100 125 V130 M100 130 Q93 137 86 132 M100 130 Q107 137 114 132"
        stroke={INK}
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M70 124 L38 118 M70 130 L38 134 M130 124 L162 118 M130 130 L162 134"
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <Collar accent={accent} />
    </g>
  );
}

function Rabbit({ base, ear, light, accent }: ArtPalette) {
  return (
    <g>
      <ellipse cx="100" cy="208" rx="66" ry="52" fill={base} />
      <ellipse cx="72" cy="52" rx="16" ry="46" fill={base} transform="rotate(-8 72 52)" />
      <ellipse
        cx="128"
        cy="52"
        rx="16"
        ry="46"
        fill={base}
        transform="rotate(8 128 52)"
      />
      <ellipse cx="72" cy="54" rx="8" ry="32" fill={PINK} transform="rotate(-8 72 54)" />
      <ellipse cx="128" cy="54" rx="8" ry="32" fill={PINK} transform="rotate(8 128 54)" />
      <ellipse cx="100" cy="112" rx="52" ry="46" fill={base} />
      <ellipse cx="72" cy="126" rx="20" ry="16" fill={ear} opacity="0.55" />
      <ellipse cx="128" cy="126" rx="20" ry="16" fill={ear} opacity="0.55" />
      <ellipse cx="100" cy="128" rx="22" ry="16" fill={light} />
      <Eyes y={106} gap={22} />
      <path d="M94 119 H106 L100 126 Z" fill={PINK} />
      <path
        d="M100 126 V131 M100 131 Q94 137 88 133 M100 131 Q106 137 112 133"
        stroke={INK}
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <rect
        x="95"
        y="134"
        width="10"
        height="9"
        rx="2"
        fill="#fff"
        stroke={INK}
        strokeWidth="1.6"
      />
      <Collar accent={accent} />
    </g>
  );
}
