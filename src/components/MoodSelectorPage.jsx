import React from "react";
import MoodMovieFeature from "../features/MoodMovieFeature";

const MOODS = [
  "Happy",
  "Sad",
  "Excited",
  "Relaxed",
  "Romantic",
  "Nostalgic",
  "Thrilled",
  "Curious",
  "Motivated",
  "Lonely",
  "Adventurous",
  "Emotional",
];

function MoodSelectorPage() {
  return <MoodMovieFeature moods={MOODS} />;
}

export default MoodSelectorPage;

