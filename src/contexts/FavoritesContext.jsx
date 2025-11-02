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

  // Load once
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

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save favorites", e);
    }
  }, [items]);

  const isFavorited = (id) => items.some((i) => i.id === id);

  const add = (item) => {
    if (!item?.id) return;
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      const normalized = {
        createdAt: new Date().toISOString(),
        type: "generic",
        title: "Untitled",
        meta: {},
        ...item,
      };
      return [normalized, ...prev];
    });
  };

  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const toggle = (item) => (isFavorited(item.id) ? remove(item.id) : add(item));

  const clear = () => setItems([]);

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

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx)
    throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
