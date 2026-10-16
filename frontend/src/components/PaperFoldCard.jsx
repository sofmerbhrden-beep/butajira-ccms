import React from "react";

/
  * PaperFoldCard renders a document card styled like paper with:
 * - Folded paper flaps on TOP - LEFT and BOTTOM - RIGHT corners.
 * - Burnt with fire / charred embers features on TOP - RIGHT and BOTTOM - LEFT corners.
 * - Photorealistic multi - layered soft paper shadows.
 */
export default function PaperFoldCard({
  children,
  className = "",
  foldSize = 38,
  burnSize = 36,
  bgClass = "bg-paper-card",
}) {
  const clipPathStyle = `polygon(${foldSize}px 0px, calc(100% - ${burnSize}px) 0px, 100% ${burnSize}px, 100% calc(100% - ${foldSize}px), calc(100% - ${foldSize}px) 100%, ${burnSize}px 100%, 0px calc(100% - ${burnSize}px), 0px ${foldSize}px)`;

  return (
    <div className={`relative z-10 w-full ${className}`}>

      <div
        className="absolute top-4 left-3 w-full h-full z-0 pointer-events-none"
        style={{
          clipPath: clipPathStyle,
          WebkitClipPath: clipPathStyle,
          background: "linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)",
          filter: "blur(10px)",
          opacity: 0.7,
        }}
      />

      <div
        className="absolute top-2 left-2 w-full h-full z-0 pointer-events-none"
        style={{
          clipPath: clipPathStyle,
          WebkitClipPath: clipPathStyle,
          background: "rgba(0, 0, 0, 0.35)",
          filter: "blur(4px)",
        }}
      />

      <div
        className="absolute top-1 left-1 w-full h-full z-0 pointer-events-none"
        style={{
          clipPath: clipPathStyle,
          WebkitClipPath: clipPathStyle,
          background: "rgba(0, 0, 0, 0.2)",
          filter: "blur(1px)",
        }}
      />

      <div
        className={`w-full relative z-10 p-8 ${bgClass} border-2 border-black`}
        style={{
          clipPath: clipPathStyle,
          WebkitClipPath: clipPathStyle,
        }}
      >
        {children}

        <div
          className="absolute top-0 left-0 pointer-events-none z-30"
          style={{ width: `${foldSize}px`, height: `${foldSize}px` }}
        >
          <svg
            width={foldSize}
            height={foldSize}
            viewBox={`0 0 ${foldSize} ${foldSize}`}
            className="w-full h-full overflow-visible"
          >
            <defs>
              <filter id="foldShadowTL" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.35" />
              </filter>
              <linearGradient id="foldGradTL" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E2DDD5" />
                <stop offset="60%" stopColor="#F5F3EF" />
                <stop offset="100%" stopColor="#D8D3C8" />
              </linearGradient>
            </defs>

            <line
              x1="0"
              y1={foldSize}
              x2={foldSize}
              y2="0"
              stroke="#000000"
              strokeWidth="3"
              strokeOpacity="0.25"
              filter="blur(1.5px)"
            />

            <path
              d={`M 0 ${foldSize} L ${foldSize} ${foldSize} L ${foldSize} 0 Z`}
              fill="url(#foldGradTL)"
              stroke="#000000"
              strokeWidth="2"
              strokeLinejoin="miter"
              filter="url(#foldShadowTL)"
            />

            <path
              d={`M 0 ${foldSize} L ${foldSize} ${foldSize} L ${foldSize} 0 Z`}
              fill="#000000"
              fillOpacity="0.03"
            />

            <line
              x1="0"
              y1={foldSize}
              x2={foldSize}
              y2="0"
              stroke="#000000"
              strokeWidth="2"
            />
          </svg>
        </div>

        <div
          className="absolute bottom-0 right-0 pointer-events-none z-30"
          style={{ width: `${foldSize}px`, height: `${foldSize}px` }}
        >
          <svg
            width={foldSize}
            height={foldSize}
            viewBox={`0 0 ${foldSize} ${foldSize}`}
            className="w-full h-full overflow-visible"
          >
            <defs>
              <filter id="foldShadowBR" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="-2" dy="-3" stdDeviation="2" floodColor="#000000" floodOpacity="0.35" />
              </filter>
              <linearGradient id="foldGradBR" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E2DDD5" />
                <stop offset="60%" stopColor="#F5F3EF" />
                <stop offset="100%" stopColor="#D8D3C8" />
              </linearGradient>
            </defs>

            <line
              x1="0"
              y1={foldSize}
              x2={foldSize}
              y2="0"
              stroke="#000000"
              strokeWidth="3"
              strokeOpacity="0.25"
              filter="blur(1.5px)"
            />

            <path
              d={`M 0 ${foldSize} L 0 0 L ${foldSize} 0 Z`}
              fill="url(#foldGradBR)"
              stroke="#000000"
              strokeWidth="2"
              strokeLinejoin="miter"
              filter="url(#foldShadowBR)"
            />

            <path
              d={`M 0 ${foldSize} L 0 0 L ${foldSize} 0 Z`}
              fill="#000000"
              fillOpacity="0.03"
            />

            <line
              x1="0"
              y1={foldSize}
              x2={foldSize}
              y2="0"
              stroke="#000000"
              strokeWidth="2"
            />
          </svg>
        </div>

        <div
          className="absolute top-0 right-0 pointer-events-none z-30 overflow-visible"
          style={{ width: `${burnSize + 16}px`, height: `${burnSize + 16}px` }}
        >
          <svg
            width={burnSize + 16}
            height={burnSize + 16}
            viewBox="0 0 52 52"
            className="w-full h-full overflow-visible"
          >
            <defs>
              <filter id="emberGlowTR" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComponentTransfer in="blur" result="glow">
                  <feFuncA type="linear" slope="2" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="charcoalGradTR" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1a0d05" stopOpacity="0" />
                <stop offset="45%" stopColor="#241207" stopOpacity="0.85" />
                <stop offset="80%" stopColor="#120803" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#080301" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="emberLineTR" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="85%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>

            <path
              d="M 12 0 C 20 6, 26 4, 30 10 C 36 14, 40 20, 44 26 C 48 30, 50 34, 52 42 L 52 0 Z"
              fill="url(#charcoalGradTR)"
            />

            <path
              d="M 14 0 Q 22 8, 30 12 Q 38 18, 44 28 Q 48 34, 52 40"
              stroke="#0f0703"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />

            <path
              d="M 14 0 Q 22 8, 30 12 Q 38 18, 44 28 Q 48 34, 52 40"
              stroke="url(#emberLineTR)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              filter="url(#emberGlowTR)"
            />

            <circle cx="36" cy="18" r="1.5" fill="#f97316" filter="url(#emberGlowTR)" />
            <circle cx="26" cy="10" r="1" fill="#fbbf24" filter="url(#emberGlowTR)" />
            <circle cx="44" cy="22" r="1.2" fill="#ef4444" filter="url(#emberGlowTR)" />
            <circle cx="48" cy="14" r="1" fill="#f59e0b" filter="url(#emberGlowTR)" />
          </svg>
        </div>

        <div
          className="absolute bottom-0 left-0 pointer-events-none z-30 overflow-visible"
          style={{ width: `${burnSize + 16}px`, height: `${burnSize + 16}px` }}
        >
          <svg
            width={burnSize + 16}
            height={burnSize + 16}
            viewBox="0 0 52 52"
            className="w-full h-full overflow-visible"
          >
            <defs>
              <filter id="emberGlowBL" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComponentTransfer in="blur" result="glow">
                  <feFuncA type="linear" slope="2" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="charcoalGradBL" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1a0d05" stopOpacity="0" />
                <stop offset="45%" stopColor="#241207" stopOpacity="0.85" />
                <stop offset="80%" stopColor="#120803" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#080301" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="emberLineBL" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="85%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>

            <path
              d="M 0 12 C 6 20, 4 26, 10 30 C 14 36, 20 40, 26 44 C 30 48, 34 50, 42 52 L 0 52 Z"
              fill="url(#charcoalGradBL)"
            />

            <path
              d="M 0 14 Q 8 22, 12 30 Q 18 38, 28 44 Q 34 48, 40 52"
              stroke="#0f0703"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />

            <path
              d="M 0 14 Q 8 22, 12 30 Q 18 38, 28 44 Q 34 48, 40 52"
              stroke="url(#emberLineBL)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              filter="url(#emberGlowBL)"
            />

            <circle cx="18" cy="36" r="1.5" fill="#f97316" filter="url(#emberGlowBL)" />
            <circle cx="10" cy="26" r="1" fill="#fbbf24" filter="url(#emberGlowBL)" />
            <circle cx="22" cy="44" r="1.2" fill="#ef4444" filter="url(#emberGlowBL)" />
            <circle cx="14" cy="48" r="1" fill="#f59e0b" filter="url(#emberGlowBL)" />
          </svg>
        </div>
      </div>
    </div>
  );
}
