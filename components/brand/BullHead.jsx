/**
 * Original geometric bull-head mark for the HOTMALE loader.
 * Hand-drawn line-art (not traced from any logo): angular skull plate,
 * swept horns, snarling slanted eyes and flared nostrils in gold.
 * Decorative — label the loader region instead.
 */
export default function BullHead({ className = "" }) {
  return (
    <svg
      viewBox="0 0 240 220"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Horns — tapered crescents rooted in the skull */}
      <path
        d="M66 72 C48 66 34 50 30 20 L40 16 C46 40 60 54 76 60 Z"
        fill="#B8B8B8"
      />
      <path
        d="M174 72 C192 66 206 50 210 20 L200 16 C194 40 180 54 164 60 Z"
        fill="#B8B8B8"
      />
      {/* Skull plate */}
      <path
        d="M120 32 L170 46 L184 92 L166 142 L138 170 L102 170 L74 142 L56 92 L70 46 Z"
        stroke="#B8B8B8"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Ears — tucked under the horns */}
      <path
        d="M64 94 L46 100 L62 110 Z"
        stroke="#B8B8B8"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M176 94 L194 100 L178 110 Z"
        stroke="#B8B8B8"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Heavy brow ridges */}
      <path
        d="M82 88 L114 94"
        stroke="#B8B8B8"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M158 88 L126 94"
        stroke="#B8B8B8"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Snarling eyes — narrow slashes angled down to center */}
      <path d="M84 97 L108 101 L84 105 Z" fill="#E6C440" />
      <path d="M156 97 L132 101 L156 105 Z" fill="#E6C440" />
      {/* Nose bridge */}
      <path
        d="M120 114 L120 144"
        stroke="#3A3A3A"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Muzzle — wide and heavy */}
      <path
        d="M88 150 L152 150 L144 184 L96 184 Z"
        stroke="#B8B8B8"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Flared nostrils — outward-slanted slashes */}
      <path d="M100 158 L110 160 L106 176 L96 174 Z" fill="#E6C440" />
      <path d="M140 158 L130 160 L134 176 L144 174 Z" fill="#E6C440" />
    </svg>
  );
}
