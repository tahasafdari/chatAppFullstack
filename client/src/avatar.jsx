import React from "react";

const palettes = [
  { bg: "#3A312A", fg: "#E8B86D" },
  { bg: "#34291F", fg: "#F1E9D9" },
  { bg: "#252019", fg: "#D6A26E" },
  { bg: "#2D241B", fg: "#F2C684" },
  { bg: "#2E2820", fg: "#E1D5BE" },
  { bg: "#3A2A20", fg: "#B98052" },
];

const Avatar = ({ userId, username }) => {
  const seed =
    parseInt((userId || "").slice(-6), 16) || (username?.charCodeAt(0) ?? 0);
  const p = palettes[Math.abs(seed) % palettes.length];
  const letter = (username?.[0] || "?").toUpperCase();
  return (
    <div
      className="w-10 h-10 flex items-center justify-center font-display text-[18px] leading-none rounded-[2px]"
      style={{ background: p.bg, color: p.fg }}
    >
      {letter}
    </div>
  );
};

export default Avatar;
