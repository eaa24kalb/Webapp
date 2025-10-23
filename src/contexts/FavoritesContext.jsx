import React, { createContext, useContext, useEffect, useState } from "react";

const KEY = "celestia:favorites";
const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {
      console.error("Failed to load favorites", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save favorites", e);
    }
  }, [items]);

  function isFavorited(id) {
    return items.some(i => i.id === id);
  }

  function add(item) {
    if (!isFavorited(item.id)) setItems(prev => [...prev, item]);
  }

  function remove(id) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function toggle(item) {
    if (isFavorited(item.id)) remove(item.id);
    else add(item);
  }

  return (
    <FavoritesContext.Provider value={{ items, add, remove, toggle, isFavorited }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
