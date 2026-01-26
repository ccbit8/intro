export function RadarSkeleton() {
  // Constants for hexagon generation (Center 120, 120)
  // Recharts defaults to 80% radius. However, labels shrink this.
  // We synced Chart to outerRadius='70%'. 120 * 0.7 = 84.
  // We matched the paths below to R=84.
  return (
    <div className="w-full h-full flex flex-col p-4 animate-pulse select-none pointer-events-none" aria-hidden="true">
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="aspect-square w-72 sm:w-80 h-auto flex items-center justify-center relative">
          <svg
            className="w-full h-full text-muted/20"
            viewBox="0 0 240 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Center Point */}
            <circle cx="120" cy="120" r="2" fill="currentColor" />

            {/* Ring 5 (Outer) - Radius 84 */}
            <path
              d="M120 36 L192.7 78 V162 L120 204 L47.3 162 V78 Z"
              stroke="currentColor"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />

            {/* Ring 4 - Radius 67.2 */}
            <path
              d="M120 52.8 L178.2 86.4 V153.6 L120 187.2 L61.8 153.6 V86.4 Z"
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />

            {/* Ring 3 - Radius 50.4 */}
            <path
              d="M120 69.6 L163.6 94.8 V145.2 L120 170.4 L76.4 145.2 V94.8 Z"
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />

            {/* Ring 2 - Radius 33.6 */}
            <path
              d="M120 86.4 L149.1 103.2 V136.8 L120 153.6 L90.9 136.8 V103.2 Z"
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />

            {/* Ring 1 (Inner) - Radius 16.8 */}
            <path
              d="M120 103.2 L134.6 111.6 V128.4 L120 136.8 L105.4 128.4 V111.6 Z"
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />

            {/* Label Placeholders - Adjusted for R=84 (Tighter) */}
            {/* Top (Via) - Near y=36. Place at y=20 */}
            <rect x="100" y="20" width="40" height="12" rx="2" fill="currentColor" />

            {/* Top Right (React) */}
            <rect x="195" y="70" width="35" height="12" rx="2" fill="currentColor" />

            {/* Bottom Right (PC) */}
            <rect x="195" y="160" width="25" height="12" rx="2" fill="currentColor" />

            {/* Bottom (Mobile) - Near y=204. Place around 214 */}
            <rect x="100" y="214" width="40" height="12" rx="2" fill="currentColor" />

            {/* Bottom Left (Database) */}
            <rect x="15" y="160" width="35" height="12" rx="2" fill="currentColor" />

            {/* Top Left (Nodejs) */}
            <rect x="15" y="70" width="30" height="12" rx="2" fill="currentColor" />
          </svg>
        </div>
      </div>
      {/* Footer Placeholder matching ChartRadarLabelCustom footer */}
      <div className="flex items-center justify-center mt-2 opacity-0">
        <div className="text-xs px-2 py-1 rounded-md bg-muted/50 border border-border/60 flex items-center gap-1">
          <span className="font-medium">Skill Radar</span>
          <div className="w-3 h-3" />
        </div>
      </div>
    </div>
  )
}
