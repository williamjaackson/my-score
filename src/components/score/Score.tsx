"use client";


import React, { useEffect, useState } from "react";



export default function CircularScore({
  sepScore = 250,
  maxScore = 1000,
  radius = 110,
  strokeWidth = 20,
  segments = [{ value: 800, color: "#e8c40e" }],
  trackColor = "#e5e7eb",
  animationDuration = "1s",
  showScore = true,
  scoreFontSize = "2rem",
  label = "",
  labelFontSize = "",
}) {
  
  const circumference = 2 * Math.PI * radius;
  const size = radius * 2 + strokeWidth;

  // Calculate label font size based on radius if not provided
  const computedLabelFontSize =
    labelFontSize || `${Math.max(0.7, Math.min(1.2, radius / 110)) * 0.9}rem`;

  return (
    <div className="flex flex-col items-center justify-center">
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress segments */}
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={seg.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={
                circumference - (seg.value / maxScore) * circumference
              }
              strokeLinecap="round"
              style={{
                transition: `stroke-dashoffset ${animationDuration} ease-out`,
              }}
            />
          ))}
        </svg>

        {/* Score in center */}
        {showScore && (
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: scoreFontSize,
              fontWeight: "bold",
              pointerEvents: "none",
            }}
          >
            {sepScore}
          </span>
        )}

        {/* Optional label */}
        {label && (
          <span
            style={{
              position: "absolute",
              top: "70%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: computedLabelFontSize,
              color: "#6b7280",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
