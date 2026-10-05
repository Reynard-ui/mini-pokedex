import { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { spriteFor, getIdFromUrl, capitalize, fetchSpecies } from "../utils.js";
import { useShiny } from "../context/ShinyContext.jsx";

function EvolutionChain({ pokemon, species }) {
  const [chain, setChain] = useState(null);
  const [error, setError] = useState(null);
  const { shiny } = useShiny();

  useEffect(() => {
    let isCurrent = true;

    async function loadChain() {
      try {
        // Reuse a species already fetched by the caller when provided.
        const sp = species ?? (await fetchSpecies(pokemon.id));
        const chainResponse = await fetch(sp.evolution_chain.url);
        if (!chainResponse.ok) throw new Error();

        const chainData = await chainResponse.json();
        if (isCurrent) setChain(flattenChain(chainData.chain));
      } catch {
        if (isCurrent) setError("Couldn't load the evolution chain.");
      }
    }

    loadChain();

    return () => {
      isCurrent = false;
    };
  }, [pokemon.id, species]);

  if (error) return <p className="evolution-note">{error}</p>;
  if (!chain) return <p className="evolution-note">Loading evolution…</p>;

  // A single clean flow: sprite + name per stage, with the arrow between
  // stages (not boxed into each tile). No arrows for a lone member.
  return (
    <section className="evolution">
      <h3 className="section-title">Evolution</h3>
      <div className="evolution-chain">
        {chain.map((member, index) => (
          <Fragment key={member.id}>
            {index > 0 && (
              <span className="evolution-arrow" aria-hidden="true">
                →
              </span>
            )}
            <div className="evolution-member">
              <Link to={`/pokemon/${member.name}`} className="evolution-link">
                <img
                  src={spriteFor(member.id, shiny)}
                  alt={member.name}
                  width={56}
                  height={56}
                  className={`evolution-sprite${
                    member.name === pokemon.name ? " evolution-sprite-current" : ""
                  }`}
                />
                <span className="evolution-name">{capitalize(member.name)}</span>
              </Link>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}

// Walks a (possibly branching) evolution tree into a flat, readable list.
// Chain nodes carry `species: { name, url }` (not `pokemon`), so the id is
// pulled from the species URL; branches are followed in order.
function flattenChain(node) {
  const result = [
    { id: getIdFromUrl(node.species.url), name: node.species.name },
  ];

  for (const child of node.evolves_to ?? []) {
    result.push(...flattenChain(child));
  }

  return result;
}

export default EvolutionChain;
