import React from "react";

export default function MyScore() {
  const score = 500; // Current score
  const maxScore = 1000; // Max score
  const radius = 80; // Increased circle radius
  const strokeWidth = 30; // Optionally increase stroke thickness for proportion
  const circumference = 2 * Math.PI * radius; // Circle circumference
  const progress = (score / maxScore) * circumference; // Progress length
  const size = radius * 2 + strokeWidth; // SVG size to fit circle and stroke

  return (
    <div className="flex flex-col items-center justify-center">
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle 1 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#38b544ff"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress - 50}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
          {/* Progress circle 2 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#9f38b5"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <span
          className="text-4xl font-bold text-foreground"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        >
          {score}
        </span>
      </div>
      <div className="absolute right-4 bottom-4">
        <div className="flex items-center gap-2">
          <span
            style={{
              display: "inline-block",
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#9f38b5",
            }}
          />
          <span className="text-sm text-foreground">Reviews</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            style={{
              display: "inline-block",
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#38b544ff",
            }}
          />
          <span className="text-sm text-foreground">Community</span>
        </div>
      </div>
    </div>
  );
}
