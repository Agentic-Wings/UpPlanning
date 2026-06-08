/**
 * UpMascot - Mascot logo for UpPlanning
 * Animated robot mascot: floating body, blinking eyes, swaying antenna
 */
const UpMascot = ({ size = 24, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`up-mascot ${className}`}
      style={{ display: 'inline-block', flexShrink: 0, overflow: 'visible' }}
      {...props}
    >
      <defs>
        <style>{`
          .up-mascot {
            filter: drop-shadow(0 0 10px rgba(255, 74, 74, 0.6));
            transition: filter 0.3s ease;
          }
          .up-mascot:hover {
            filter: drop-shadow(0 0 15px rgba(44, 244, 224, 0.8));
          }
          .up-mascot.no-shadow, .up-mascot.no-shadow:hover {
            filter: none !important;
          }
          @keyframes mascot-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          @keyframes mascot-blink {
            0%, 90%, 100% { transform: scaleY(1); }
            95% { transform: scaleY(0.05); }
          }
          @keyframes mascot-antenna-swing {
            0%, 100% { transform: rotate(-10deg); transform-origin: 50px 22px; }
            50% { transform: rotate(10deg); transform-origin: 50px 22px; }
          }
          .mascot-body { animation: mascot-float 3s ease-in-out infinite; }
          .mascot-eye-left { 
            transform-origin: 36px 38px; 
            animation: mascot-blink 4s ease-in-out infinite; 
          }
          .mascot-eye-right { 
            transform-origin: 64px 38px; 
            animation: mascot-blink 4s ease-in-out infinite; 
          }
          .mascot-antenna { 
            transform-origin: 50px 22px;
            animation: mascot-antenna-swing 2.5s ease-in-out infinite; 
          }
        `}</style>
      </defs>

      {/* Scale everything down by 0.75 and translate to center to fit the new body */}
      <g transform="scale(0.75) translate(16, 2)">
        
        {/* Antenna - swinging group */}
        <g className="mascot-antenna">
          <rect x="47" y="8" width="6" height="14" rx="3" fill="#ff4a4a" />
          <circle cx="50" cy="7" r="5" fill="#2cf4e0" />
        </g>

        {/* All body parts float together */}
        <g className="mascot-body">
          {/* Head body */}
          <rect x="18" y="22" width="64" height="52" rx="12" fill="#1a1a2e" stroke="#ff4a4a" strokeWidth="2.5" />

          {/* Eye left outer frame */}
          <rect x="27" y="35" width="18" height="14" rx="4" fill="#0d0d1a" stroke="#2cf4e0" strokeWidth="1.5" />
          {/* Eye left inner - blinks */}
          <rect className="mascot-eye-left" x="30" y="38" width="12" height="8" rx="2" fill="#2cf4e0" opacity="0.95" />

          {/* Eye right outer frame */}
          <rect x="55" y="35" width="18" height="14" rx="4" fill="#0d0d1a" stroke="#2cf4e0" strokeWidth="1.5" />
          {/* Eye right inner - blinks */}
          <rect className="mascot-eye-right" x="58" y="38" width="12" height="8" rx="2" fill="#2cf4e0" opacity="0.95" />

          {/* Mouth / grill */}
          <rect x="28" y="56" width="44" height="10" rx="5" fill="#0d0d1a" stroke="#333" strokeWidth="1" />
          <rect x="33" y="59" width="6" height="4" rx="2" fill="#ff4a4a" opacity="0.8" />
          <rect x="43" y="59" width="6" height="4" rx="2" fill="#ffffff" opacity="0.5" />
          <rect x="53" y="59" width="6" height="4" rx="2" fill="#2cf4e0" opacity="0.8" />

          {/* Ears */}
          <rect x="8" y="34" width="10" height="20" rx="4" fill="#ff4a4a" />
          <rect x="82" y="34" width="10" height="20" rx="4" fill="#ff4a4a" />

          {/* Neck */}
          <rect x="40" y="74" width="20" height="10" rx="4" fill="#ff4a4a" />

          {/* Torso */}
          <path d="M 32 94 L 68 94 L 64 126 L 36 126 Z" fill="#1a1a2e" stroke="#ff4a4a" strokeWidth="2.5" />
          
          {/* Body collar (overlapping torso) */}
          <rect x="24" y="84" width="52" height="12" rx="6" fill="#1a1a2e" stroke="#ff4a4a" strokeWidth="2" />
          
          {/* Core / Arc Reactor */}
          <circle cx="50" cy="110" r="7" fill="#0d0d1a" stroke="#2cf4e0" strokeWidth="1.5" />
          <circle cx="50" cy="110" r="3" fill="#2cf4e0" opacity="0.9" />

          {/* Left Arm (floating) */}
          <rect x="16" y="94" width="10" height="20" rx="5" fill="#1a1a2e" stroke="#ff4a4a" strokeWidth="2" />
          <rect x="18" y="118" width="6" height="10" rx="3" fill="#2cf4e0" />

          {/* Right Arm (floating) */}
          <rect x="74" y="94" width="10" height="20" rx="5" fill="#1a1a2e" stroke="#ff4a4a" strokeWidth="2" />
          <rect x="76" y="118" width="6" height="10" rx="3" fill="#2cf4e0" />

        </g>
      </g>
    </svg>
  );
};

export default UpMascot;

