import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { capitalize, spriteFor, fetchPokemon } from "../utils.js";
import TypeBadge from "../components/TypeBadge.jsx";
import StatBar from "../components/StatBar.jsx";
import { useCompare } from "../context/CompareContext.jsx";
import { useShiny } from "../context/ShinyContext.jsx";

const STAT_LABELS = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

const STAT_BAR_COLORS = {
  hp: "#6aa84f",
  attack: "#e0645a",
  defense: "#e0a45a",
  "special-attack": "#5a8be0",
  "special-defense": "#9a5ae0",
  speed: "#3fc1c9",
};

function ComparePage() {
  const { selection, toggleCompare, clearCompare } = useCompare();
  const { shiny } = useShiny();
  const [data, setData] = useState({});

  useEffect(() => {
    let isCurrent = true;

    async function loadSelected() {
      const results = {};

      await Promise.all(
        selection.map(async (name) => {
          try {
            results[name] = await fetchPokemon(name);
          } catch {
            results[name] = null;
          }
        })
      );

      if (isCurrent) setData(results);
    }

    if (selection.length > 0) loadSelected();

    return () => {
      isCurrent = false;
    };
  }, [selection]);

  // The compare page needs exactly two picks; if only one is selected,
  // the second column shows a hint instead of a Pokémon.
  if (selection.length < 2) {
    return (
      <div className="status">
        <h2>Compare</h2>
        <p>
          {selection.length === 1
            ? `Comparing ${capitalize(selection[0])} — pick one more Pokémon to get started.`
            : "Pick two Pokémon to compare side by side."}
        </p>
        <Link to="/" className="back-link">← Back to list</Link>
      </div>
    );
  }

  const [first, second] = selection;

  return (
    <div className="compare-page">
      <h2>Compare</h2>
      <div className="compare-grid">
        {[first, second].map((name) => {
          const pokemon = data[name];

          if (pokemon === null && data[name] !== undefined) {
            return (
              <div key={name} className="compare-card compare-card-error">
                <p>Couldn't load {name}.</p>
                <button type="button" className="action-btn" onClick={() => toggleCompare(name)}>
                  Remove
                </button>
              </div>
            );
          }

          if (pokemon === undefined) {
            return <div key={name} className="compare-card">Loading…</div>;
          }

          const total = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);

          return (
            <div key={name} className="compare-card">
              <Link to={`/pokemon/${pokemon.name}`} className="compare-card-link">
                <img
                  className="pokemon-sprite pokemon-sprite-lg"
                  src={spriteFor(pokemon.id, shiny)}
                  alt={pokemon.name}
                  width={96}
                  height={96}
                />
                <h3>{capitalize(pokemon.name)}</h3>
                <div className="type-badge-row">
                  {pokemon.types.map((t) => (
                    <TypeBadge key={t.type.name} type={t.type.name} />
                  ))}
                </div>
              </Link>

              <dl className="compare-facts">
                <div>
                  <dt>Height</dt>
                  <dd>{pokemon.height / 10} m</dd>
                </div>
                <div>
                  <dt>Weight</dt>
                  <dd>{pokemon.weight / 10} kg</dd>
                </div>
                <div>
                  <dt>Abilities</dt>
                  <dd>{pokemon.abilities.map((a) => a.ability.name.replace("-", " ")).join(", ")}</dd>
                </div>
                <div>
                  <dt>Total stats</dt>
                  <dd>{total}</dd>
                </div>
              </dl>

              <div className="compare-stats">
                {pokemon.stats.map((s) => (
                  <StatBar
                    key={s.stat.name}
                    label={STAT_LABELS[s.stat.name] ?? s.stat.name}
                    value={s.base_stat}
                    color={STAT_BAR_COLORS[s.stat.name] ?? "#888"}
                  />
                ))}
              </div>

              <button
                type="button"
                className="action-btn"
                onClick={() => toggleCompare(pokemon.name)}
              >
                Remove from compare
              </button>
            </div>
          );
        })}
      </div>

      <button type="button" className="action-btn" onClick={clearCompare}>
        Clear comparison
      </button>
    </div>
  );
}

export default ComparePage;
