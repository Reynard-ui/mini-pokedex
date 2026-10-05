import { API_BASE_URL, SPRITE_BASE_URL } from "./config.js";

export function getIdFromUrl(url) {
  // url looks like "https://pokeapi.co/api/v2/pokemon/25/"
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

export function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getSpriteUrl(id) {
  return `${SPRITE_BASE_URL}/${id}.png`;
}

// Shiny sprites live under a /shiny subfolder of the sprite dir.
export function getShinySpriteUrl(id) {
  return `${SPRITE_BASE_URL}/shiny/${id}.png`;
}

// Pick the right sprite url for a Pokémon, honoring shiny mode.
export function spriteFor(id, shiny = false) {
  return shiny ? getShinySpriteUrl(id) : getSpriteUrl(id);
}

// Small in-memory cache so the same Pokémon is only fetched once
// per session (detail page, compare page, etc.).
const pokemonCache = new Map();

export async function fetchPokemon(name) {
  const key = String(name).toLowerCase();

  if (pokemonCache.has(key)) {
    return pokemonCache.get(key);
  }

  const response = await fetch(`${API_BASE_URL}/pokemon/${key}`);

  if (!response.ok) {
    throw new Error(`No Pokémon named "${key}" — check the spelling.`);
  }

  const data = await response.json();
  pokemonCache.set(key, data);
  return data;
}

// Pokémon species (flavor text, genus, evolution chain) — cached so the
// detail page and EvolutionChain share one fetch.
const speciesCache = new Map();

export async function fetchSpecies(id) {
  const key = String(id);

  if (speciesCache.has(key)) {
    return speciesCache.get(key);
  }

  const response = await fetch(`${API_BASE_URL}/pokemon-species/${key}`);

  if (!response.ok) {
    throw new Error(`No species data for #${key}.`);
  }

  const data = await response.json();
  speciesCache.set(key, data);
  return data;
}

// "Kitten Pokémon" style classification. PokeAPI's species endpoint exposes
// `genera` (a list of { genus, language } entries), not `genus`.
export function getGenus(species) {
  if (!species) return null;
  const genera = species.genera ?? [];
  const entry =
    genera.find((g) => g?.language?.name === "en") ?? genera[0];
  const value = entry?.genus;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /pok[ée]mon$/i.test(trimmed) ? trimmed : `${trimmed} Pokémon`;
}

// Pokémon of the day: deterministic pick so the whole site shows the same
// Pokémon on the same calendar day. days-since-epoch × a prime that is
// coprime with 1025, so consecutive days land on different Pokémon and
// the sequence cycles through the whole national dex.
const NATIONAL_DEX_SIZE = 1025;

export function pokemonOfTheDayId(date = new Date()) {
  const days = Math.floor(date.getTime() / 86_400_000);
  return ((days * 7919) % NATIONAL_DEX_SIZE) + 1;
}

// Clean flavor text. PokeAPI's species endpoint exposes
// `flavor_text_entries` (a list of { flavor_text, language, version }),
// not `flavor_text`. RBY-era entries (FireRed/Emerald) are preferred so
// the text matches the Gen-3 dex screen; lines use \n and \f separators.
const PREFERRED_FLAVOR_VERSIONS = ["firered", "emerald", "leafgreen"];

export function getFlavor(species, language = "en") {
  if (!species) return null;
  const entries = (species.flavor_text_entries ?? []).filter(
    (e) => e?.language?.name === language
  );
  if (entries.length === 0) return null;

  const scored = entries.map((entry) => {
    const version = entry.version?.name ?? "";
    const preferredIndex = PREFERRED_FLAVOR_VERSIONS.indexOf(version);
    // Lower is better: a preferred Gen-3 version beats anything else.
    return { entry, score: preferredIndex === -1 ? 100 : preferredIndex };
  });
  scored.sort((a, b) => a.score - b.score);

  const raw = scored[0].entry.flavor_text;
  return raw ? raw.replace(/[\n\f\xad]+/g, " ").trim() : null;
}

