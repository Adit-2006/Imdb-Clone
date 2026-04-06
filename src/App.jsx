import { useEffect, useState } from "react";
import MoodSelectorPage from "./components/MoodSelectorPage";
import Movies from "./components/Movies";
import NavBar from "./components/NavBar";
import Watchlist from "./components/WatchList";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MovieContext } from "./components/MovieContext";

function App() {
  const [watchlist, setWatchList] = useState(() => {
    const moviesFromLS = localStorage.getItem("moviesFromWL");
    if (!moviesFromLS) return [];
    try {
      const parsed = JSON.parse(moviesFromLS);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("moviesFromWL", JSON.stringify(watchlist));
  }, [watchlist]);

  function addToWatchList(movieObj) {
    // Only allow unique movies in the watchlist (by TMDB id).
    const id = movieObj?.id;
    if (!id) return;
    setWatchList((prev) => {
      if (prev.some((m) => m?.id === id)) return prev;
      return [...prev, movieObj];
    });
  }

  function removeFromWatchList(movieId) {
    setWatchList((prev) => prev.filter((m) => m?.id !== movieId));
  }

  return (
    <>
      <MovieContext value={{ addToWatchList, removeFromWatchList }}>
        <BrowserRouter>
          <NavBar />

          <Routes>
            <Route path="/" element={<Movies />} />
            <Route path="/watchlist" element={<Watchlist watchlist={watchlist} />} />
            <Route path="/mood" element={<MoodSelectorPage />} />
          </Routes>
        </BrowserRouter>
      </MovieContext>
    </>
  );
}

export default App;