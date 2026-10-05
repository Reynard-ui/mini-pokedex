import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { loadPokemonNames } from "../pokemonNames.js";
import { spriteFor, capitalize } from "../utils.js";
import { useShiny } from "../context/ShinyContext.jsx";

const BOOK_SIZE = 6;

// A Pokédex book: 6 Pokémon per "page", PREV/NEXT like the in-game dex.
// The full name list comes from the same cache that powers autocomplete,
// so opening the book never triggers an extra API call.
//
// The book is only mounted while open (see Layout), so all state is
// fresh on every open — no in-effect resets needed.
function DexBook({ onClose }) {
  const [names, setNames] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const { shiny } = useShiny();

  useEffect(() => {
    let isCurrent = true;
    loadPokemonNames()
      .then((list) => {
        if (isCurrent) setNames(list);
      })
      .catch(() => {
        if (isCurrent) setError("Couldn't load the Pokédex list.");
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pages = names ? Math.ceil(names.length / BOOK_SIZE) : 1;
  const clamped = Math.min(page, pages - 1);
  const items = names
    ? names.slice(clamped * BOOK_SIZE, (clamped + 1) * BOOK_SIZE)
    : [];

  return (
    <div
      className="dexbook-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Pokédex"
    >
      <div className="dexbook" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="dexbook-close"
          onClick={onClose}
          aria-label="Close the Pokédex"
        >
          ×
        </button>
        <div className="dexbook-screen">
          {error ? (
            <p className="dexbook-loading">{error}</p>
          ) : names ? (
            <ul className="dexbook-page">
              {items.map((p) => (
                <li key={p.name}>
                  <Link
                    to={`/pokemon/${p.name}`}
                    onClick={onClose}
                    className="dexbook-entry"
                  >
                    <img
                      className="dexbook-sprite"
                      src={spriteFor(p.id, shiny)}
                      alt=""
                      width={40}
                      height={40}
                    />
                    <span className="dexbook-id">
                      #{String(p.id).padStart(3, "0")}
                    </span>
                    <span className="dexbook-name">{capitalize(p.name)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dexbook-loading">Opening the Pokédex…</p>
          )}
        </div>
        <div className="dexbook-controls">
          <button
            type="button"
            className="dexbook-btn"
            disabled={!names || clamped === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            ◀ PREV
          </button>
          <span className="dexbook-page-num">
            {names ? `P.${clamped + 1}/${pages}` : "…"}
          </span>
          <button
            type="button"
            className="dexbook-btn"
            disabled={!names || clamped >= pages - 1}
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
          >
            NEXT ▶
          </button>
        </div>
      </div>
    </div>
  );
}

export default DexBook;
