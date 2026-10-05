import { useState, useEffect } from "react";
import { fetchSpecies, getGenus, getFlavor, capitalize } from "../utils.js";
import { Link } from "react-router-dom";
import { useShiny } from "../context/ShinyContext.jsx";

// Formats a height in decimetres the RBY way (e.g. 2'00").
function formatHeight(dm) {
  const feet = Math.floor(dm / 30.48);
  const inches = Math.round((dm - feet * 30.48) * 10);
  return `${feet}'${String(inches).padStart(2, "0")}"`;
}

// Formats a weight in hectograms the RBY way (e.g. 24.3 lbs.).
function formatWeight(hg) {
  const lbs = Math.round((hg / 10) * 2.20462 * 10) / 10;
  return `${lbs} lbs.`;
}

// The Gen-3 Pokédex screen: purple menu bar, gray info box,
// and a white description box with a pink frame.
//
// Parent should pass `key={pokemon.id}` so the UI (page index, sprite
// size, cry state) resets when a different Pokémon loads.
// When a `species` prop is supplied it is used as-is; otherwise the
// component fetches it itself.
function RbyDexScreen({ pokemon, species }) {
  const [fetchedSpecies, setFetchedSpecies] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [sizeLarge, setSizeLarge] = useState(false);
  const [cryPlaying, setCryPlaying] = useState(false);
  const { shiny } = useShiny();

  // Self-fetch only when the parent did not already load the species.
  useEffect(() => {
    if (species !== undefined) return undefined;
    let isCurrent = true;
    fetchSpecies(pokemon.id)
      .then((data) => {
        if (isCurrent) setFetchedSpecies(data);
      })
      .catch(() => {
        if (isCurrent) setFetchedSpecies(null);
      });
    return () => {
      isCurrent = false;
    };
  }, [pokemon.id, species]);

  const sp = species !== undefined ? species : fetchedSpecies;

  // ── Description text, one page at a time, like the RBY dex ──
  const rawFlavor = sp ? getFlavor(sp) : null;
  const flavorPages = rawFlavor
    ? rawFlavor
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : null;
  const page = flavorPages
    ? flavorPages[pageIndex % flavorPages.length]
    : null;

  function handlePage() {
    if (flavorPages) setPageIndex((i) => (i + 1) % flavorPages.length);
  }

  function handleCry() {
    const url = pokemon.cries?.latest || pokemon.cries?.legacy;
    if (!url || cryPlaying) return;
    const audio = new Audio(url);
    setCryPlaying(true);
    audio.onended = () => setCryPlaying(false);
    audio.onerror = () => setCryPlaying(false);
    audio.play().catch(() => setCryPlaying(false));
  }

  function handleType() {
    document.getElementById("matchups")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const genus = sp ? getGenus(sp) : null;
  const spriteSize = sizeLarge ? 96 : 48;

  return (
    <div className="rby-dex">
      {/* ── RBY purple menu bar ── */}
      <div className="dex-menu" role="toolbar" aria-label="Pokédex menu">
        <button type="button" className="dex-btn" onClick={handlePage}>
          PAGE
        </button>
        <button type="button" className="dex-btn" onClick={handleCry}>
          {cryPlaying ? "♪ PLAYING" : "CRY"}
        </button>
        <button
          type="button"
          className={`dex-btn${sizeLarge ? "" : " dex-btn-off"}`}
          onClick={() => setSizeLarge((v) => !v)}
        >
          SIZE
        </button>
        <button type="button" className="dex-btn" onClick={handleType}>
          TYPE
        </button>
        <Link to="/" className="dex-cancel">
          <span className="dex-circle" aria-hidden="true">
            B
          </span>
          CANCEL
        </Link>
      </div>

      {/* ── RBY gray info box ── */}
      <div className="dex-info">
        <div className="dex-sprite-wrap">
          <img
            className="dex-sprite"
            src={shiny ? pokemon.sprites.front_shiny || pokemon.sprites.front_default : pokemon.sprites.front_default}
            alt={pokemon.name}
            width={spriteSize}
            height={spriteSize}
          />
        </div>
        <div className="dex-meta">
          <div className="dex-meta-box">
            <span className="dex-no">No{String(pokemon.id).padStart(3, "0")}</span>
            <div className="dex-name">{capitalize(pokemon.name)}</div>
            <span className="dex-genus">{genus ?? "…"}</span>
          </div>
          <div className="dex-htwt">
            <span>HT {formatHeight(pokemon.height)}</span>
            <span>WT {formatWeight(pokemon.weight)}</span>
          </div>
        </div>
        <span className="dex-icon" aria-hidden="true">
          ⭐
        </span>
      </div>

      {/* ── RBY white description box with pink frame ── */}
      <div className="dex-desc">
        <span className="dex-page-label">
          PAGE {flavorPages ? pageIndex + 1 : 1}
          {flavorPages && flavorPages.length > 1
            ? ` / ${flavorPages.length}`
            : ""}
        </span>
        <p className="dex-flavor">
          {page ?? (sp ? "No Pokédex entry found." : "Loading Pokédex entry…")}
        </p>
      </div>
    </div>
  );
}

export default RbyDexScreen;
