import React from "react";
import MovieRecommendationCard from "./MovieRecommendationCard";

function MoodRecommendationResults({
  mood,
  recommendations,
  loading,
  error,
  recommendationSource,
  mockReason,
  onRetry,
  onTryAnotherMood,
  onSaveRecommendation,
}) {
  const hasRecommendations = !!recommendations?.length;
  const hasError = !!error;
  const visible = loading || hasRecommendations || hasError;

  return (
    <section aria-label="Mood movie recommendations">
      <div
        className={[
          "transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        {mood ? (
          <div className="mt-8 mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Because you&apos;re feeling {mood}...
            </h2>
            <p className="text-sm text-gray-600">
              Here are 6 picks tailored to your vibe.
            </p>

            {recommendationSource === "mock" ? (
              <div
                role="status"
                aria-live="polite"
                className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900 text-sm"
              >
                Using mock recommendations.
                {mockReason ? (
                  <>
                    <span className="block mt-1 text-amber-800">{mockReason}</span>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {loading ? null : error ? (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
          >
            <p className="font-medium">Could not get recommendations.</p>
            <p className="text-sm mt-1">
              {error || "Something went wrong. Please try again."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onRetry}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                aria-label="Retry recommendations"
              >
                Retry
              </button>
              {onTryAnotherMood ? (
                <button
                  type="button"
                  onClick={onTryAnotherMood}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 hover:bg-gray-50"
                  aria-label="Try another mood"
                >
                  Try another mood
                </button>
              ) : null}
            </div>
          </div>
        ) : recommendations?.length ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec) => (
                <MovieRecommendationCard
                  key={rec.id}
                  title={rec.title}
                  year={rec.year}
                  genre={rec.genre}
                  reason={rec.reason}
                  rating={rec.rating}
                  posterUrl={rec.posterUrl}
                  onSave={onSaveRecommendation}
                />
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                  aria-label="Generate another set of recommendations"
                >
                  Get another set
                </button>
              ) : null}

              {onTryAnotherMood ? (
                <button
                  type="button"
                  onClick={onTryAnotherMood}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 hover:bg-gray-50"
                  aria-label="Try another mood"
                >
                  Try another mood
                </button>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

export default MoodRecommendationResults;

