import { API_BASE_URL } from "./config.js";
import { getIdFromUrl } from "./utils.js";

// The full Pokémon name list (1351 entries) is fetched at most once per
// hour: a memory cache handles remounts within a session, and a
// localStorage cache handles full page reloads — which also keeps the
// app working when PokeAPI's rate limit is temporarily hit.
const STORAGE_KEY = "pokedex-mini:names";
const NAME_TTL_MS = 60 * 60 * 1000; // 1 hour

let cachedNames = null;
let namesPromise = null;

function readStoredNames() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { savedAt, names } = JSON.parse(raw);
    if (!Array.isArray(names)) return null;
    if (typeof savedAt !== "number") return null;
    if (Date.now() - savedAt > NAME_TTL_MS) return null;
    return names;
  } catch {
    return null;
  }
}

function storeNames(names) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ savedAt: Date.now(), names })
    );
  } catch {
    /* storage unavailable — the memory cache still works */
  }
}

export function loadPokemonNames() {
  if (cachedNames) return Promise.resolve(cachedNames);

  const stored = readStoredNames();
  if (stored) {
    cachedNames = stored;
    return Promise.resolve(stored);
  }

  if (!namesPromise) {
    namesPromise = (async () => {
      let response = await fetch(`${API_BASE_URL}/pokemon?limit=200000`);

      // PokeAPI rate limits aggressively; on 429 wait and try once more.
      if (response.status === 429) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        response = await fetch(`${API_BASE_URL}/pokemon?limit=200000`);
      }

      if (!response.ok) {
        throw new Error(`status ${response.status}`);
      }

      const data = await response.json();
      const names = data.results.map((pokemon) => ({
        name: pokemon.name,
        id: getIdFromUrl(pokemon.url),
      }));

      cachedNames = names;
      storeNames(names);
      return names;
    })();

    // A failed fetch must not poison future mounts: reset the promise so
    // the next caller can retry.
    namesPromise.catch(() => {
      namesPromise = null;
    });
  }

  return namesPromise;
}
