import { Link } from "react-router-dom";
import { spriteFor, capitalize } from "../utils.js";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { useCompare } from "../context/CompareContext.jsx";
import { useShiny } from "../context/ShinyContext.jsx";

function FavoritesPage() {
  const { favorites, toggleFavorite, clearFavorites } = useFavorites();
  const { has: isInCompare, toggleCompare } = useCompare();
  const { shiny } = useShiny();

  return (
    <div className="favorites-page">
      <h2>Favorites</h2>

      {favorites.length === 0 ? (
        <div className="status">
          <p>No favorites yet.</p>
          <Link to="/" className="back-link">Browse the list →</Link>
        </div>
      ) : (
        <>
          <ul className="pokemon-list">
            {favorites.map((fav) => (
              <li key={fav.name} className="pokemon-list-item">
                <Link
                  to={`/pokemon/${fav.name}`}
                  className="pokemon-link"
                >
                  <img
                    className="pokemon-sprite"
                    src={spriteFor(fav.id, shiny)}
                    alt={fav.name}
                    width={48}
                    height={48}
                  />
                  <span className="pokemon-id">
                    #{String(fav.id).padStart(3, "0")}
                  </span>
                  <span className="pokemon-name">
                    {capitalize(fav.name)}
                  </span>
                </Link>
                <div className="row-actions">
                  <button
                    type="button"
                    className="icon-btn icon-btn-active"
                    title="Remove from favorites"
                    aria-label={`Remove ${fav.name} from favorites`}
                    onClick={() => toggleFavorite(fav.name, fav.id)}
                  >
                    ★
                  </button>
                  <button
                    type="button"
                    className={`icon-btn${isInCompare(fav.name) ? " icon-btn-active" : ""}`}
                    title="Add to compare"
                    aria-label={`Add ${fav.name} to compare`}
                    onClick={() => toggleCompare(fav.name)}
                  >
                    ⇄
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="action-btn"
            onClick={clearFavorites}
          >
            Clear all
          </button>
        </>
      )}
    </div>
  );
}

export default FavoritesPage;
