import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import { spriteFor, capitalize, pokemonOfTheDayId } from "../utils.js";
import { useShiny } from "../context/ShinyContext.jsx";
import { typeBadgeStyle } from "../typeColors.js";

function PokemonOfTheDay() {
  const { shiny } = useShiny();
  const [pokemon, setPokemon] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const id = pokemonOfTheDayId();
    let isCurrent = true;

    fetch(`${API_BASE_URL}/pokemon/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (isCurrent) setPokemon(data);
      })
      .catch(() => {
        if (isCurrent) setError(true);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  if (error || !pokemon) {
    return (
      <div className="pod-card">
        <span className="pod-label">⭐ Pokémon of the day</span>
        <p className="pod-loading">Loading today's Pokémon…</p>
      </div>
    );
  }

  const types = pokemon.types.map((t) => t.type.name);

  return (
    <Link to={`/pokemon/${pokemon.name}`} className="pod-card">
      <span className="pod-label" aria-hidden="true">
        ⭐ Pokémon of the day
      </span>
      <div className="pod-body">
        <img
          className="pod-sprite"
          src={spriteFor(pokemon.id, shiny)}
          alt={pokemon.name}
          width={72}
          height={72}
        />
        <div className="pod-info">
          <span className="pod-name">
            #{String(pokemon.id).padStart(3, "0")} {capitalize(pokemon.name)}
          </span>
          <span className="pod-types">
            {types.slice(0, 2).map((type) => (
              <span key={type} className="pod-type" style={typeBadgeStyle(type)}>
                {type}
              </span>
            ))}
          </span>
          <span className="pod-cta">View entry →</span>
        </div>
      </div>
    </Link>
  );
}

export default PokemonOfTheDay;
