import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import { getIdFromUrl, capitalize, spriteFor } from "../utils.js";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { useCompare } from "../context/CompareContext.jsx";
import { useShiny } from "../context/ShinyContext.jsx";
import { typeBadgeStyle } from "../typeColors.js";

const PAGE_SIZE = 15;

// National-dex ranges per generation (ids are global national numbers).
const GENERATIONS = [
  { label: "All" },
  { label: "Kanto", from: 1, to: 151 },
  { label: "Johto", from: 152, to: 251 },
  { label: "Hoenn", from: 252, to: 386 },
  { label: "Sinnoh", from: 387, to: 479 },
  { label: "Unova", from: 480, to: 649 },
  { label: "Kalos", from: 650, to: 721 },
  { label: "Alola", from: 722, to: 809 },
  { label: "Galar", from: 810, to: 905 },
  { label: "Paldea", from: 906, to: 1025 },
];

const SORTS = [
  { value: "id", label: "# National Dex" },
  { value: "name", label: "Name A–Z" },
];

// Batch endpoint used for the card grid: id + name in one request.
// (PokeAPI's bulk list does not include types, so types are fetched
// per Pokémon and cached in this module for the session.)
const typeCache = new Map();

async function fetchGridPage(fromId, size, generation) {
  const response = await fetch(
    `${API_BASE_URL}/pokemon?limit=${size}&offset=${fromId}`
  );
  if (!response.ok) {
    throw new Error(`Server responded with status ${response.status}`);
  }
  const data = await response.json();
  let items = data.results.map((pokemon) => ({
    name: pokemon.name,
    id: getIdFromUrl(pokemon.url),
  }));

  if (generation) {
    items = items.filter(
      (p) => p.id >= generation.from && p.id <= generation.to
    );
  }
  return items;
}

function CardTypeBadges({ pokemon }) {
  const [types, setTypes] = useState(() => typeCache.get(pokemon.id) ?? null);

  useEffect(() => {
    if (typeCache.has(pokemon.id)) return;
    let cancelled = false;
    fetch(`${API_BASE_URL}/pokemon/${pokemon.id}`)
      .then((res) => res.json())
      .then((data) => {
        const list = data.types.map((t) => t.type.name);
        typeCache.set(pokemon.id, list);
        if (!cancelled) setTypes(list);
      })
      .catch(() => {
        typeCache.set(pokemon.id, []);
        if (!cancelled) setTypes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [pokemon.id]);

  if (!types) return null;

  return (
    <span className="pokemon-card-types" aria-label="types">
      {types.slice(0, 2).map((type) => (
        <span key={type} className="pokemon-card-type" style={typeBadgeStyle(type)}>
          {type}
        </span>
      ))}
    </span>
  );
}

function PokemonGrid() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generation, setGeneration] = useState(null);
  const [sort, setSort] = useState("id");
  const [page, setPage] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { has: isInCompare, toggleCompare } = useCompare();
  const { shiny } = useShiny();

  // The list of Pokémon that are in the active generation range; "All"
  // means the whole national dex. A single batch fetch grabs up to 300
  // entries and filters locally — enough to fill a page for every
  // generation we support (they are all under 300 apart).
  useEffect(() => {
    let isCurrent = true;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        let fromId = 0;
        let target;

        if (generation) {
          fromId = generation.from - 1;
          target = generation.to - generation.from + 1;
        } else {
          target = 1025;
        }

        const fetched = await fetchGridPage(
          fromId,
          Math.max(target, PAGE_SIZE),
          generation ?? undefined
        );

        // Only keep Pokémon inside the active range (the batch fetch can
        // overshoot the last generation at the tail of the national dex).
        const inRange = generation
          ? fetched.filter(
              (p) => p.id >= generation.from && p.id <= generation.to
            )
          : fetched;

        if (isCurrent) setItems(inRange);
      } catch (err) {
        if (isCurrent) setError(err.message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    load();

    return () => {
      isCurrent = false;
    };
  }, [generation]);

  // Note: the visible page is clamped below (safePage), and the page index
  // is reset to 0 directly in the filter/sort handlers — no effect needed.

  const sorted = useMemo(() => {
    const copy = [...items];
    if (sort === "name") copy.sort((a, b) => a.name.localeCompare(b.name));
    return copy;
  }, [items, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = sorted.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE
  );

  // Windowed pagination: at most 10 numbered pages, centered on the
  // current page, plus prev/next and a jump-to-last control.
  const PAGE_WINDOW = 10;
  const windowStart =
    pageCount <= PAGE_WINDOW
      ? 0
      : Math.min(Math.max(safePage - 4, 0), pageCount - PAGE_WINDOW);
  const windowPages = Array.from(
    { length: Math.min(PAGE_WINDOW, pageCount - windowStart) },
    (_, i) => windowStart + i
  );

  if (isLoading) {
    return <p className="status">Loading Pokémon…</p>;
  }

  if (error) {
    return <p className="status status-error">Couldn't load the list: {error}</p>;
  }

  return (
    <>
      <div className="grid-controls">
        <div className="gen-filters" role="group" aria-label="Filter by generation">
          {GENERATIONS.map((gen) => (
            <button
              key={gen.label}
              type="button"
              className={`gen-chip${(gen.label === "All" ? generation === null : generation === gen) ? " gen-chip-active" : ""}`}
              onClick={() => {
                setPage(0);
                setGeneration(gen.label === "All" ? null : gen);
              }}
            >
              {gen.label}
            </button>
          ))}
        </div>
        <label className="sort-control">
          <span className="sort-label">Sort by</span>
          <select
            className="sort-select"
            value={sort}
            onChange={(event) => {
              setPage(0);
              setSort(event.target.value);
            }}
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="pokemon-grid">
        {visible.map((pokemon) => {
          const favorite = isFavorite(pokemon.name);
          const inCompare = isInCompare(pokemon.name);
          return (
            <li key={pokemon.id} className="pokemon-card">
              <Link
                to={`/pokemon/${pokemon.name}`}
                className="pokemon-card-link"
              >
              <div className="pokemon-card-top">
                <span className="pokemon-card-id">
                  #{String(pokemon.id).padStart(3, "0")}
                </span>
                <CardTypeBadges pokemon={pokemon} />
              </div>
              <img
                className="pokemon-card-sprite"
                src={spriteFor(pokemon.id, shiny)}
                alt={pokemon.name}
                width={96}
                height={96}
              />
              <span className="pokemon-card-name">
                {capitalize(pokemon.name)}
              </span>
              </Link>
              <div className="pokemon-card-actions">
                <button
                  type="button"
                  className={`pokemon-card-btn${favorite ? " pokemon-card-btn-active" : ""}`}
                  title={favorite ? "Remove from favorites" : "Add to favorites"}
                  aria-label={
                    favorite
                      ? `Remove ${pokemon.name} from favorites`
                      : `Add ${pokemon.name} to favorites`
                  }
                  onClick={() => toggleFavorite(pokemon.name, pokemon.id)}
                >
                  {favorite ? "★" : "☆"}
                </button>
                <button
                  type="button"
                  className={`pokemon-card-btn${inCompare ? " pokemon-card-btn-active" : ""}`}
                  title={inCompare ? "Remove from compare" : "Add to compare"}
                  aria-label={
                    inCompare
                      ? `Remove ${pokemon.name} from compare`
                      : `Add ${pokemon.name} to compare`
                  }
                  onClick={() => toggleCompare(pokemon.name)}
                >
                  ⇄
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {pageCount > 1 && (
        <nav className="pagination" aria-label="Pokémon pages">
          <button
            type="button"
            className="page-btn"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            aria-label="Previous page"
          >
            &lt;
          </button>
          {windowStart > 0 && (
            <button
              type="button"
              className="page-btn page-btn-ellipsis"
              onClick={() => setPage(0)}
              aria-label="First page"
            >
              1
            </button>
          )}
          {windowStart > 1 && (
            <span className="page-ellipsis" aria-hidden="true">
              …
            </span>
          )}
          {windowPages.map((i) => (
            <button
              key={i}
              type="button"
              className={`page-btn${i === safePage ? " page-btn-active" : ""}`}
              onClick={() => setPage(i)}
            >
              {i + 1}
            </button>
          ))}
          {windowStart + windowPages.length < pageCount - 1 && (
            <span className="page-ellipsis" aria-hidden="true">
              …
            </span>
          )}
          <button
            type="button"
            className="page-btn"
            disabled={safePage >= pageCount - 1}
            onClick={() =>
              setPage((p) => Math.min(pageCount - 1, p + 1))
            }
            aria-label="Next page"
          >
            &gt;
          </button>
          {safePage < pageCount - 1 && (
            <button
              type="button"
              className="page-btn"
              onClick={() => setPage(pageCount - 1)}
              aria-label="Last page"
            >
              Last
            </button>
          )}
        </nav>
      )}
    </>
  );
}

export default PokemonGrid;
