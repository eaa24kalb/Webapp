import React from "react";
import { useFavorites } from "../contexts/FavoritesContext";
import "../App.css";

export default function FavoriteButton({ item, small }) {
  const { isFavorited, toggle } = useFavorites();
  const id = item.id;
  return (
    <button
      aria-pressed={isFavorited(id)}
      onClick={() => toggle(item)}
      style={{
        background: "transparent",
        border: "none",
        padding: small ? 4 : 8,
        cursor: "pointer",
        fontSize: small ? 14 : 16
      }}
      title={isFavorited(id) ? "Unfavorite" : "Favorite"}
    >
      {isFavorited(id) ? "★" : "☆"}
    </button>
  );
}
