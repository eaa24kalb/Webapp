// Manages favorites across the app, saved in localStorage

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const KEY = "celestia:favorites:v1";
const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [items, setItems] = useState([]);

  // Loads favorites from localStorage when the app starts
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch (e) {
      console.error("Failed to load favorites", e);
    }
  }, []);

  // Saves favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save favorites", e);
    }
  }, [items]);

  // Checks if a specific item is already a favorite
  const isFavorited = (id) => items.some((i) => i.id === id);


  // Adds a new favorite item
  const add = (item) => {
    if (!item?.id) return;
    setItems((prev) => {

      //Don’t add duplicates
      if (prev.some((i) => i.id === item.id)) return prev;
      const normalized = {
        createdAt: new Date().toISOString(),
        type: "generic",
        title: "Untitled",
        meta: {},
        ...item,
      };

    // Adds the new item to the start of the list
      return [normalized, ...prev];
    });
  };

  // Removes by id
  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  // Toggle 
  const toggle = (item) => (isFavorited(item.id) ? remove(item.id) : add(item));

  // Clears all favorites
  const clear = () => setItems([]);

  // Get only favorites of a specific type
  const byType = (type) => items.filter((i) => i.type === type);

  const value = useMemo(
    () => ({ items, add, remove, toggle, isFavorited, clear, byType }),
    [items]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Hook for components to access favorites
export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx)
    throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
