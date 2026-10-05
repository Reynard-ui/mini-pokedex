import { API_BASE_URL } from "./config.js";

// PokeAPI's /type collection lists type names (with a default limit of 20,
// so pass an explicit one); the damage_relations live on the individual
// /type/{name} endpoints. There are 18 types, so we fetch them all in
// parallel once and cache the multipliers for the whole session — every
// subsequent call to getTypeMatchups is instant.
let typeDataCache = null;

async function loadTypeData() {
  if (typeDataCache) return typeDataCache;

  const collection = await fetch(`${API_BASE_URL}/type?limit=200`);
  if (!collection.ok) {
    throw new Error(`Couldn't load the type list (status ${collection.status}).`);
  }
  const { results } = await collection.json();

  const details = await Promise.all(
    results.map(async (entry) => {
      const response = await fetch(entry.url);
      if (!response.ok) return null;
      return response.json();
    })
  );

  // defender type -> (attacker type -> damage multiplier).
  // The relation lists hold { name, url } entries with no multiplier
  // field: the multiplier is implicit in which list the entry came from.
  typeDataCache = new Map();
  for (const type of details.filter(Boolean)) {
    const takenFrom = new Map();
    const relations = type.damage_relations ?? {};
    for (const entry of relations.double_damage_from ?? []) {
      if (entry?.name) takenFrom.set(entry.name, 2);
    }
    for (const entry of relations.half_damage_from ?? []) {
      if (entry?.name) takenFrom.set(entry.name, 0.5);
    }
    for (const entry of relations.no_damage_from ?? []) {
      if (entry?.name) takenFrom.set(entry.name, 0);
    }
    typeDataCache.set(type.name, takenFrom);
  }

  return typeDataCache;
}

// Takes the defender types of a Pokémon and returns which attacking types
// are super effective, resisted, or have no effect on it. Multipliers are
// combined across both defender types, so a dual-type's 4x weaknesses
// (e.g. Eelektross' fighting/electric) fall out naturally.
export async function getTypeMatchups(typeNames) {
  const typeData = await loadTypeData();
  const weakTo = [];
  const resists = [];
  const immune = [];

  for (const attacker of typeData.keys()) {
    let multiplier = 1;
    for (const defender of typeNames) {
      const table = typeData.get(defender);
      if (!table) continue;
      multiplier *= table.get(attacker) ?? 1;
    }

    if (multiplier === 0) {
      immune.push({ type: attacker });
    } else if (multiplier > 1) {
      weakTo.push({ type: attacker, multiplier });
    } else if (multiplier < 1) {
      resists.push({ type: attacker, multiplier });
    }
  }

  weakTo.sort((a, b) => b.multiplier - a.multiplier);
  resists.sort((a, b) => a.multiplier - b.multiplier);

  return { weakTo, resists, immune };
}
