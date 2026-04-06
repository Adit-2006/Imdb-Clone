import React from "react";

function MoodOptionCard({ mood, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(mood)}
      aria-label={`Select mood: ${mood}`}
      aria-pressed={selected}
      className={[
        "px-4 py-2 rounded-full border text-sm font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        selected
          ? "bg-blue-600 border-blue-600 text-white"
          : "bg-transparent border-gray-700 text-gray-200 hover:bg-gray-800 hover:border-gray-600",
      ].join(" ")}
    >
      {mood}
    </button>
  );
}

export default MoodOptionCard;

