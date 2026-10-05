import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPokemon } from "../utils.js";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { useCompare } from "../context/CompareContext.jsx";
import TypeBadge from "../components/TypeBadge.jsx";
import EvolutionChain from "../components/EvolutionChain.jsx";
import TypeMatchups from "../components/TypeMatchups.jsx";
import RbyDexScreen from "../components/RbyDexScreen.jsx";

function DetailPage() {
  const { name } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { has: isInCompare, toggleCompare } = useCompare();

  useEffect(() => {
    let isCurrent = true;

    async function loadPokemon() {
      setIsLoading(true);
      setError(null);
      setPokemon(null);

      try {
        const data = await fetchPokemon(name);

        if (isCurrent) {
          setPokemon(data);
        }
      } catch (err) {
        if (isCurrent) {
          setError(err.message);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadPokemon();

    return () => {
      isCurrent = false;
    };
  }, [name]);

  if (isLoading) return <p className="status">Loading {name}…</p>;
  if (error) return <p className="status status-error">{error}</p>;

  const favorite = isFavorite(pokemon.name);
  const inCompare = isInCompare(pokemon.name);
  const typeNames = pokemon.types.map((t) => t.type.name);

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">
        ← Back to list
      </Link>

      <RbyDexScreen key={pokemon.id} pokemon={pokemon} />

      <div className="type-badge-row">
        {typeNames.map((type) => (
          <TypeBadge key={type} type={type} />
        ))}
      </div>

      <div className="detail-actions">
        <button
          type="button"
          className={`action-btn${favorite ? " action-btn-active" : ""}`}
          onClick={() => toggleFavorite(pokemon.name, pokemon.id)}
        >
          {favorite ? "★ Favorited" : "☆ Favorite"}
        </button>
        <button
          type="button"
          className={`action-btn${inCompare ? " action-btn-active" : ""}`}
          onClick={() => toggleCompare(pokemon.name)}
        >
          {inCompare ? "⇄ In compare" : "⇄ Compare"}
        </button>
      </div>

      <EvolutionChain key={`evo-${pokemon.id}`} pokemon={pokemon} />

      <TypeMatchups types={typeNames} />

      <ul className="stat-list">
        {pokemon.stats.map((s) => (
          <li key={s.stat.name}>
            <span className="stat-name">{s.stat.name}</span>
            <span className="stat-value">{s.base_stat}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DetailPage;
