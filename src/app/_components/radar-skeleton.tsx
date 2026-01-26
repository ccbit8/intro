export function RadarSkeleton() {
  // Constants for hexagon generation (Center 120, 120)
  // Recharts defaults to ~80% radius. 120 * 0.8 = 96. Let's use 90 to match visual weight including labels.
  // 5 Grid lines (concetric polygons) are standard in Recharts default theme
  return (
    <div className="aspect-square w-72 sm:w-80 h-auto flex items-center justify-center relative select-none pointer-events-none" aria-hidden="true">
      <svg
        className="w-full h-full text-muted/20 animate-pulse"
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Center Point */}
        <circle cx="120" cy="120" r="2" fill="currentColor" />

        {/* 
           Hexagon Points Calculation (Radius R):
           Top: (120, 120-R)
           TopRight: (120 + R*0.866, 120 - R*0.5)
           BottomRight: (120 + R*0.866, 120 + R*0.5)
           Bottom: (120, 120+R)
           BottomLeft: (120 - R*0.866, 120 + R*0.5)
           TopLeft: (120 - R*0.866, 120 - R*0.5)
        */}

        {/* Ring 5 (Outer) - Radius 90 */}
        <path d="M120 30 L197.9 75 V165 L120 210 L42.1 165 V75 Z" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
        
        {/* Ring 4 - Radius 72 */}
        <path d="M120 48 L182.3 84 V156 L120 192 L57.7 156 V84 Z" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke"/>

        {/* Ring 3 - Radius 54 */}
        <path d="M120 66 L166.7 93 V147 L120 174 L73.3 147 V93 Z" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke"/>

        {/* Ring 2 - Radius 36 */}
        <path d="M120 84 L151.1 102 V138 L120 156 L88.9 138 V102 Z" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke"/>

        {/* Ring 1 (Inner) - Radius 18 */}
        <path d="M120 102 L135.6 111 V129 L120 138 L104.4 129 V111 Z" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke"/>

        {/* Label Placeholders - Adjusted for radius 90 + padding */}
        {/* Top (Via) */}
        <rect x="100" y="10" width="40" height="12" rx="2" fill="currentColor" />
        
        {/* Top Right (React) */}
        <rect x="205" y="65" width="35" height="12" rx="2" fill="currentColor" />
        
        {/* Bottom Right (PC) */}
        <rect x="205" y="165" width="25" height="12" rx="2" fill="currentColor" />
        
        {/* Bottom (Mobile) - Slightly lower than point (210) */}
        <rect x="100" y="218" width="40" height="12" rx="2" fill="currentColor" />
        
        {/* Bottom Left (Database) */}
        <rect x="5" y="165" width="35" height="12" rx="2" fill="currentColor" />
        
        {/* Top Left (Nodejs) */}
        <rect x="5" y="65" width="30" height="12" rx="2" fill="currentColor" />

      </svg>
    </div>
  )
}
