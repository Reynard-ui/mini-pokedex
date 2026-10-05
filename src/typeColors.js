// Type badge colors, roughly matching the official Pokémon type colors.
export const TYPE_COLORS = {
  normal: "#a8a77e",
  fire: "#ee8130",
  water: "#6390f0",
  grass: "#7ac74c",
  electric: "#f7d02c",
  ice: "#98d8c8",
  fighting: "#c03040",
  poison: "#a33ea1",
  ground: "#e0b260",
  flying: "#a98ff3",
  psychic: "#f95587",
  bug: "#a5c83b",
  rock: "#c9a060",
  ghost: "#733585",
  dragon: "#0a77ff",
  dark: "#705848",
  steel: "#8b9bb0",
  fairy: "#ec8fe6",
};

// Badge colors that are too light for white text.
const DARK_TEXT_TYPES = new Set([
  "normal",
  "electric",
  "grass",
  "ice",
  "bug",
  "ground",
  "flying",
  "rock",
  "fairy",
]);

export function typeBadgeStyle(type) {
  return {
    background: TYPE_COLORS[type] ?? "#9ca3af",
    color: DARK_TEXT_TYPES.has(type) ? "#222" : "#fff",
  };
}
