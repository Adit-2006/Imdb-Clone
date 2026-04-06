import { createContext } from "react";

// Context provides watchlist mutations across pages/components.
// Shape: { addToWatchList(movieObj), removeFromWatchList(movieId) }
export const MovieContext = createContext({
  addToWatchList: () => {},
  removeFromWatchList: () => {},
});
