import React from "react";
import { useFavorites } from "../contexts/FavoritesContext";
import styles from "../styles/FavoriteButton.module.css";

export default function FavoriteButton({ item, small = false }) {
  const { isFavorited, toggle } = useFavorites();
  const active = isFavorited(item.id);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      className={`${styles.favBtn} ${small ? styles.small : ""} ${
        active ? styles.active : ""
      }`}
      onClick={() => toggle(item)}
      title={active ? "Unfavorite" : "Favorite"}
    >
      <span className={styles.icon} aria-hidden="true">
        {active ? "★" : "☆"}
      </span>
    </button>
  );
}
