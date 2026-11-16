import { Building2, Wrench, Settings, ShieldCheck } from 'lucide-react';

/**
 * Isometric 3D Campus & Smart Facility Maintenance Illustration
 * Designed in navy, indigo, blue, and purple tones with atmospheric depth lighting.
 */
export default function CampusIllustration() {
  return (
    <div
      className="relative w-full max-w-[430px] sm:max-w-[475px] mx-auto lg:mx-0 select-none pointer-events-none"
      aria-hidden="true"
    >
      {/* Soft purple-blue depth glow behind the 3D campus illustration */}
      <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-blue-600/25 via-indigo-500/25 to-purple-500/30 blur-3xl"></div>
      <div className="absolute inset-6 rounded-full bg-purple-500/20 blur-2xl"></div>

      {/* 4 Floating 3D Glassmorphic Facility Elements (positioned cleanly around the campus) */}
      <div className="hidden sm:flex absolute top-0 left-3 z-20 w-10 h-10 rounded-2xl bg-indigo-950/75 border border-purple-400/30 backdrop-blur-md shadow-lg shadow-purple-900/30 items-center justify-center text-purple-300 animate-float-badge-1">
        <Wrench className="w-4 h-4" />
      </div>

      <div className="hidden sm:flex absolute top-8 right-1 z-20 w-10 h-10 rounded-2xl bg-slate-900/75 border border-blue-400/30 backdrop-blur-md shadow-lg shadow-blue-900/30 items-center justify-center text-blue-300 animate-float-badge-2">
        <ShieldCheck className="w-4 h-4" />
      </div>

      <div className="hidden sm:flex absolute bottom-9 left-1 z-20 w-9 h-9 rounded-xl bg-indigo-950/75 border border-indigo-400/30 backdrop-blur-md shadow-lg shadow-indigo-900/30 items-center justify-center text-indigo-300 animate-float-badge-3">
        <Settings className="w-4 h-4" />
      </div>

      <div className="hidden sm:flex absolute bottom-5 right-4 z-20 w-9 h-9 rounded-xl bg-slate-900/75 border border-purple-400/30 backdrop-blur-md shadow-lg shadow-purple-900/30 items-center justify-center text-purple-200 animate-float-badge-4">
        <Building2 className="w-4 h-4" />
      </div>

      {/* Main Isometric 3D Campus Architectural SVG (cropped tightly so building fills ~13-15% larger) */}
      <svg
        viewBox="32 28 416 312"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-auto drop-shadow-[0_26px_42px_rgba(6,10,20,0.7)] animate-float-campus"
      >
        <defs>
          {/* Soft Bloom Filter for Architectural Lighting */}
          <filter id="softLight" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Platform Gradients */}
          <linearGradient id="platformTop" x1="60" y1="145" x2="420" y2="315" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="55%" stopColor="#171f42" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="platformEdgeL" x1="60" y1="230" x2="240" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id="platformEdgeR" x1="240" y1="320" x2="420" y2="230" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Main Tower Gradients */}
          <linearGradient id="towerLeft" x1="135" y1="90" x2="215" y2="235" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b4c6b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="towerRight" x1="215" y1="130" x2="295" y2="235" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#262262" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="towerRoof" x1="135" y1="90" x2="295" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3730a3" />
          </linearGradient>

          {/* Lab Wing Gradients */}
          <linearGradient id="wingLeft" x1="245" y1="160" x2="305" y2="255" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#435387" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="wingRight" x1="305" y1="190" x2="365" y2="255" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b1578" />
            <stop offset="100%" stopColor="#17153b" />
          </linearGradient>
          <linearGradient id="wingRoof" x1="245" y1="160" x2="365" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>

          {/* Architectural Rim & Skylight Beam Gradients */}
          <linearGradient id="rimLight" x1="215" y1="140" x2="215" y2="245" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="skylightBeam" x1="215" y1="100" x2="215" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </linearGradient>

          {/* Glass & Glow Accents */}
          <linearGradient id="glassGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.82" />
          </linearGradient>
          <linearGradient id="pathGlow" x1="170" y1="255" x2="245" y2="295" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.12" />
          </linearGradient>
          <radialGradient id="floorGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
            <stop offset="55%" stopColor="#3b82f6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ground Ambient Shadow / Holographic Base Glow */}
        <ellipse cx="240" cy="295" rx="180" ry="40" fill="url(#floorGlow)" />

        {/* Isometric Base Slab */}
        <polygon points="240,140 420,230 240,320 60,230" fill="url(#platformTop)" stroke="#818cf8" strokeOpacity="0.45" strokeWidth="1.2" />
        <polygon points="60,230 240,320 240,334 60,244" fill="url(#platformEdgeL)" />
        <polygon points="240,320 420,230 420,244 240,334" fill="url(#platformEdgeR)" />

        {/* Subtle Architectural Grid Lines on Campus Platform */}
        <g stroke="#818cf8" strokeOpacity="0.12" strokeWidth="0.85">
          <line x1="120" y1="200" x2="300" y2="290" />
          <line x1="180" y1="170" x2="360" y2="260" />
          <line x1="120" y1="260" x2="300" y2="170" />
          <line x1="180" y1="290" x2="360" y2="200" />
        </g>

        {/* Illuminated Campus Pathway */}
        <polygon points="168,256 240,292 260,282 188,246" fill="url(#pathGlow)" />

        {/* === BUILDING 1: MAIN ACADEMIC HALL (Center-Left) === */}
        {/* Left & Right Facades */}
        <polygon points="135,100 215,140 215,245 135,205" fill="url(#towerLeft)" stroke="#64748b" strokeOpacity="0.4" strokeWidth="0.8" />
        <polygon points="215,140 295,100 295,205 215,245" fill="url(#towerRight)" stroke="#6366f1" strokeOpacity="0.4" strokeWidth="0.8" />
        {/* Roof Deck */}
        <polygon points="215,60 295,100 215,140 135,100" fill="url(#towerRoof)" stroke="#c7d2fe" strokeOpacity="0.6" strokeWidth="1.1" />
        {/* Subtle Architectural Uplight Beam from Rooftop Skylight */}
        <polygon points="170,100 260,100 244,36 186,36" fill="url(#skylightBeam)" />
        {/* Rooftop Glass Skylight Frame */}
        <polygon points="215,72 272,100 215,128 158,100" fill="#1e1b4b" stroke="#a5b4fc" strokeOpacity="0.65" strokeWidth="1" />
        <polygon points="215,78 260,100 215,122 170,100" fill="url(#glassGlow)" fillOpacity="0.55" filter="url(#softLight)" />
        {/* Front Vertical Corner Rim Highlight */}
        <line x1="215" y1="140" x2="215" y2="245" stroke="url(#rimLight)" strokeWidth="1.2" />

        {/* Tower Left Facade Windows (Isometric slope +0.5) */}
        <g fill="url(#glassGlow)">
          <polygon points="148,120 164,128 164,142 148,134" fillOpacity="0.9" />
          <polygon points="172,132 188,140 188,154 172,146" fillOpacity="0.78" />
          <polygon points="196,144 208,150 208,164 196,158" fillOpacity="0.95" />
          <polygon points="148,146 164,154 164,168 148,160" fillOpacity="0.68" />
          <polygon points="172,158 188,166 188,180 172,172" fillOpacity="0.98" />
          <polygon points="196,170 208,176 208,190 196,184" fillOpacity="0.82" />
          <polygon points="148,172 164,180 164,194 148,186" fillOpacity="0.86" />
          <polygon points="172,184 188,192 188,206 172,198" fillOpacity="0.7" />
          <polygon points="196,196 208,202 208,216 196,210" fillOpacity="0.9" />
        </g>

        {/* Tower Right Facade Windows (Isometric slope -0.5) */}
        <g fill="#c4b5fd">
          <polygon points="224,148 238,141 238,155 224,162" fillOpacity="0.9" />
          <polygon points="248,136 262,129 262,143 248,150" fillOpacity="0.62" />
          <polygon points="272,124 286,117 286,131 272,138" fillOpacity="0.95" />
          <polygon points="224,174 238,167 238,181 224,188" fillOpacity="0.65" />
          <polygon points="248,162 262,155 262,169 248,176" fillOpacity="0.95" />
          <polygon points="272,150 286,143 286,157 272,164" fillOpacity="0.75" />
        </g>

        {/* === BUILDING 2: TECH & FACILITY WING (Front-Right) === */}
        <polygon points="245,165 305,195 305,260 245,230" fill="url(#wingLeft)" stroke="#818cf8" strokeOpacity="0.4" strokeWidth="0.8" />
        <polygon points="305,195 365,165 365,230 305,260" fill="url(#wingRight)" stroke="#8b5cf6" strokeOpacity="0.45" strokeWidth="0.8" />
        <polygon points="305,135 365,165 305,195 245,165" fill="url(#wingRoof)" stroke="#ddd6fe" strokeOpacity="0.6" strokeWidth="1" />
        {/* Front Vertical Corner Rim Highlight */}
        <line x1="305" y1="195" x2="305" y2="260" stroke="url(#rimLight)" strokeWidth="1.1" />

        {/* Illuminated Glass Strip on Wing Right Facade */}
        <polygon points="314,202 356,181 356,198 314,219" fill="url(#glassGlow)" fillOpacity="0.92" filter="url(#softLight)" />
        <polygon points="314,226 356,205 356,216 314,237" fill="#a5b4fc" fillOpacity="0.58" />

        {/* Rooftop Smart HVAC / Maintenance Unit on Building 2 */}
        <g>
          <polygon points="287,160 305,169 305,179 287,170" fill="#1e293b" />
          <polygon points="305,169 323,160 323,170 305,179" fill="#0f172a" />
          <polygon points="305,151 323,160 305,169 287,160" fill="#7dd3fc" fillOpacity="0.88" filter="url(#softLight)" />
        </g>

        {/* === BUILDING 3: ENTRANCE PAVILION (Front-Left) === */}
        <polygon points="105,200 155,225 155,270 105,245" fill="#233046" stroke="#64748b" strokeOpacity="0.4" strokeWidth="0.8" />
        <polygon points="155,225 205,200 205,245 155,270" fill="#1e1b4b" stroke="#818cf8" strokeOpacity="0.45" strokeWidth="0.8" />
        <polygon points="155,175 205,200 155,225 105,200" fill="#4f46e5" stroke="#c7d2fe" strokeOpacity="0.55" strokeWidth="0.9" />
        {/* Illuminated Glass Lobby Entrance */}
        <polygon points="168,233 192,221 192,251 168,263" fill="url(#glassGlow)" fillOpacity="0.9" filter="url(#softLight)" />

        {/* Minimalist Isometric Campus Trees / Nodes */}
        <g>
          {/* Tree 1 (Left courtyard) */}
          <ellipse cx="96" cy="232" rx="8" ry="4" fill="#0f172a" fillOpacity="0.6" />
          <polygon points="96,204 106,214 96,224 86,214" fill="#4f46e5" fillOpacity="0.9" />
          <polygon points="96,196 104,205 96,213 88,205" fill="#93c5fd" fillOpacity="0.95" />

          {/* Tree 2 (Right courtyard) */}
          <ellipse cx="378" cy="240" rx="8" ry="4" fill="#0f172a" fillOpacity="0.6" />
          <polygon points="378,212 388,222 378,232 368,222" fill="#7c3aed" fillOpacity="0.9" />
          <polygon points="378,204 386,213 378,221 370,213" fill="#c4b5fd" fillOpacity="0.95" />
        </g>
      </svg>
    </div>
  );
}
