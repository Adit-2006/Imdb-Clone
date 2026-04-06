import React from "react";

function MovieRecommendationCard({
  title,
  year,
  genre,
  reason,
  rating,
  onSave,
  posterUrl,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex gap-4 p-4">
        <div
          className="w-20 h-28 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 flex-shrink-0"
          style={
            posterUrl
              ? {
                  backgroundImage: `url(${posterUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  color: "transparent",
                }
              : undefined
          }
          aria-label={posterUrl ? "Poster image" : "Poster placeholder"}
        >
          {!posterUrl ? "Poster" : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {title}
              </h3>
              <p className="text-sm text-gray-600">
                {year ? <span>{year}</span> : <span>Year N/A</span>}{" "}
                <span className="text-gray-400">|</span>{" "}
                <span className="text-gray-700">{genre}</span>
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-700 leading-relaxed">
            {reason}
          </p>

          {rating != null && !Number.isNaN(Number(rating)) ? (
            <p className="mt-2 text-xs text-gray-500">
              Rating:{" "}
              <span className="font-medium text-gray-700">{rating}</span>
            </p>
          ) : null}

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              className={[
                "px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                onSave
                  ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-800"
                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed",
              ].join(" ")}
              aria-label={onSave ? `Add ${title} to watchlist` : "Save coming soon"}
              onClick={() => onSave?.({ title, year, genre, reason })}
              disabled={!onSave}
            >
              {onSave ? "Save" : "Add to Watchlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieRecommendationCard;

