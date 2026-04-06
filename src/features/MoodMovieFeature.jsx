import React, { useEffect, useMemo, useRef, useState } from "react";
import MoodSelector from "../components/MoodSelector";
import MoodSelectorSkeleton from "../components/MoodSelectorSkeleton";
import MoodRecommendationResults from "../components/MoodRecommendationResults";
import { getMoodMovieRecommendations } from "../services/moodRecommendationService";

function MoodMovieFeature({ moods }) {
  const moodOptions = useMemo(() => moods ?? [], [moods]);

  const [selectedMood, setSelectedMood] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendationSource, setRecommendationSource] = useState(null);
  const [mockReason, setMockReason] = useState(null);

  const abortRef = useRef(null);
  const selectorTopRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (recommendations.length && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [recommendations.length]);

  async function handleGetRecommendations() {
    if (!selectedMood || loading) return;

    setError(null);
    setRecommendations([]);
    setLoading(true);
    setRecommendationSource(null);
    setMockReason(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Per requirements: call Gemini directly from frontend when button is clicked.
      const data = await getMoodMovieRecommendations({
        mood: selectedMood,
        provider: "gemini",
        signal: controller.signal,
      });

      // service guarantees exactly 6 or throws.
      setRecommendations(data.recommendations);
      setRecommendationSource(data.source ?? "gemini");
      setMockReason(data.mockReason ?? null);
    } catch (e) {
      const message = e?.message ? String(e.message) : "Failed to fetch recommendations.";
      setError(message);
      setRecommendationSource(null);
      setMockReason(null);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function handleTryAnotherMood() {
    setRecommendations([]);
    setError(null);
    // Keep selectedMood as-is to avoid surprising resets; user can pick a new one.
    selectorTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div ref={selectorTopRef}>
      <MoodSelector
        moods={moodOptions}
        selectedMood={selectedMood}
        onSelectMood={(m) => setSelectedMood(m)}
        onGetRecommendations={handleGetRecommendations}
        loading={loading}
      />

      <div ref={resultsRef} className="px-4 pb-12">
        {loading ? (
          <MoodSelectorSkeleton count={6} />
        ) : null}

        <MoodRecommendationResults
          mood={selectedMood}
          recommendations={recommendations}
          loading={loading}
          error={error}
          recommendationSource={recommendationSource}
          mockReason={mockReason}
          onRetry={handleGetRecommendations}
          onTryAnotherMood={handleTryAnotherMood}
          onSaveRecommendation={null}
        />
      </div>
    </div>
  );
}

export default MoodMovieFeature;

