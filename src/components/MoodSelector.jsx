import React from "react";
import MoodOptionCard from "./MoodOptionCard";

function MoodSelector({
  moods,
  selectedMood,
  onSelectMood,
  onGetRecommendations,
  loading,
}) {
  const canSubmit = !!selectedMood && !loading;

  return (
    <section aria-label="Pick your mood">
      <div className="mt-8 mb-4 px-4">
        <h2 className="text-2xl font-semibold text-gray-900">Pick Your Mood</h2>
        <p className="text-sm text-gray-600 mt-1">
          Tell us how you feel and we&apos;ll suggest movies that match your vibe.
        </p>
      </div>

      <div className="px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {moods.map((m) => (
            <MoodOptionCard
              key={m}
              mood={m}
              selected={selectedMood === m}
              onSelect={onSelectMood}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onGetRecommendations}
            disabled={!canSubmit}
            aria-label={
              selectedMood
                ? loading
                  ? "Getting recommendations"
                  : "Get recommendations"
                : "Select a mood to get recommendations"
            }
            className={[
              "px-5 py-3 rounded-xl font-medium border transition-colors",
              canSubmit
                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed",
            ].join(" ")}
          >
            {loading ? "Getting Recommendations..." : "Get Recommendations"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default MoodSelector;
