import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadPokemonNames } from "../pokemonNames.js";
import { capitalize, spriteFor } from "../utils.js";
import { useShiny } from "../context/ShinyContext.jsx";

const MAX_SUGGESTIONS = 8;

function SearchForm() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [allNames, setAllNames] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const { shiny } = useShiny();

  // The name list is cached at module level, so remounting (navigating
  // away and back) just awaits the same in-flight/finished promise
  // instead of hitting the API again.
  useEffect(() => {
    let isCurrent = true;

    loadPokemonNames()
      .then((names) => {
        if (isCurrent) setAllNames(names);
      })
      .catch(() => {
        // A failed fetch just means autocomplete is unavailable; a typed
        // name can still be submitted and resolved by the detail page.
        if (isCurrent) setAllNames([]);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  // Suggestions are derived from the query, so they're computed here
  // instead of synced through an effect.
  const trimmed = query.trim().toLowerCase();
  const suggestions =
    trimmed === "" || allNames.length === 0
      ? []
      : allNames
          .filter((pokemon) => pokemon.name.startsWith(trimmed))
          .slice(0, MAX_SUGGESTIONS);
  const showSuggestions = focused && suggestions.length > 0;

  function changeQuery(value) {
    setQuery(value);
    setActiveIndex(-1);
    // Any input event means the field is actively in use — re-open the
    // dropdown even after it was dismissed with Escape (the field keeps
    // DOM focus, so no new focus event would fire).
    setFocused(true);
  }

  function choose(name) {
    setError(null);
    setFocused(false);
    navigate(`/pokemon/${name}`);
  }

  function handleSubmit(event) {
    event.preventDefault();

    // If a suggestion is highlighted, pick it; otherwise trust the
    // typed name and let the detail page handle a bad spelling.
    if (showSuggestions && activeIndex >= 0 && suggestions[activeIndex]) {
      choose(suggestions[activeIndex].name);
      return;
    }

    if (trimmed === "") {
      setError("Type a Pokémon name first.");
      return;
    }

    setError(null);
    navigate(`/pokemon/${trimmed}`);
  }

  function handleKeyDown(event) {
    if (!showSuggestions) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        current + 1 >= suggestions.length ? 0 : current + 1
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current - 1 < 0 ? suggestions.length - 1 : current - 1
      );
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      choose(suggestions[activeIndex].name);
    } else if (event.key === "Escape") {
      setFocused(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="search">
      <form onSubmit={handleSubmit} className="search-form">
        <span className="search-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="2" />
          </svg>
        </span>
        <input
          type="text"
          value={query}
          onChange={(event) => changeQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setFocused(false)}
          onFocus={() => setFocused(true)}
          placeholder="Search a Pokémon by name or number..."
          className="search-input"
          aria-label="Search a Pokémon by name or number"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-autocomplete="list"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {showSuggestions && (
        <ul className="suggestion-list" role="listbox">
          {suggestions.map((pokemon, index) => (
            <li
              key={pokemon.name}
              className={`suggestion-item${index === activeIndex ? " suggestion-active" : ""}`}
              role="option"
              aria-selected={index === activeIndex}
            >
              <button
                type="button"
                className="suggestion-button"
                onMouseDown={(event) => {
                  // Keep the input focused so the blur handler doesn't
                  // close the dropdown before the click lands.
                  event.preventDefault();
                  choose(pokemon.name);
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <img
                  className="pokemon-sprite suggestion-sprite"
                  src={spriteFor(pokemon.id, shiny)}
                  alt={pokemon.name}
                  width={32}
                  height={32}
                />
                <span className="suggestion-id">
                  #{String(pokemon.id).padStart(3, "0")}
                </span>
                <span className="pokemon-name">
                  {capitalize(pokemon.name)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="status status-error">{error}</p>}
    </div>
  );
}

export default SearchForm;
