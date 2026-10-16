export default function Seal({ size = 148, className = "" }) {
  const id = "seal-ring-path";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="Certification authority seal"
    >
      <defs>
        <path
          id={id}
          d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0"
        />
      </defs>

      <circle
        cx="100"
        cy="100"
        r="94"
        fill="none"
        stroke="#D9B876"
        strokeWidth="1.2"
      />
      <circle
        cx="100"
        cy="100"
        r="60"
        fill="none"
        stroke="#D9B876"
        strokeWidth="1.2"
      />

      {Array.from({ length: 36 }).map((_, i) => {
        const a1 = (i / 36) * 360;
        const a2 = ((i + 5) / 36) * 360;
        const r1 = 94;
        const r2 = 60;
        const x1 = 100 + r1 * Math.cos((a1 * Math.PI) / 180);
        const y1 = 100 + r1 * Math.sin((a1 * Math.PI) / 180);
        const x2 = 100 + r2 * Math.cos((a2 * Math.PI) / 180);
        const y2 = 100 + r2 * Math.sin((a2 * Math.PI) / 180);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#D9B876"
            strokeWidth="0.5"
            opacity="0.55"
          />
        );
      })}

      <text
        fill="#D9B876"
        fontSize="9.5"
        letterSpacing="3.5"
        fontFamily="'IBM Plex Mono', monospace"
      >
        <textPath href={`#${id}`} startOffset="0%">
          COMPETENCY CERTIFICATION &#8226; VERIFIED RECORD &#8226; ISSUING
          AUTHORITY &#8226;
        </textPath>
      </text>

      <g stroke="#D9B876" strokeWidth="1.3" fill="none">
        <path d="M 100,58 L 108,82 L 133,82 L 113,97 L 121,121 L 100,106 L 79,121 L 87,97 L 67,82 L 92,82 Z" />
      </g>
    </svg>
  );
}
