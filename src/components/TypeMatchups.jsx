import { useState, useEffect } from "react";
import { typeBadgeStyle } from "../typeColors.js";
import { getTypeMatchups } from "../typeMatchups.js";

function MatchupChip({ name, multiplier }) {
  return (
    <span className="type-badge" style={typeBadgeStyle(name)}>
      {name}
      {multiplier !== undefined ? ` ×${multiplier}` : ""}
    </span>
  );
}

function TypeMatchups({ types }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const typesKey = types.join(",");

  useEffect(() => {
    let isCurrent = true;

    getTypeMatchups(typesKey.split(","))
      .then((matchups) => {
        if (isCurrent) setResult(matchups);
      })
      .catch((err) => {
        if (isCurrent) setError(err.message);
      });

    // This component is unmounted by DetailPage whenever the Pokémon
    // changes (loading state), so no explicit reset is needed here.
    return () => {
      isCurrent = false;
    };
  }, [typesKey]);

  if (error) {
    return <p className="evolution-note">Couldn't load type matchups: {error}</p>;
  }

  if (!result) {
    return <p className="evolution-note">Loading type matchups…</p>;
  }

  const groups = [
    { title: "Weak to", items: result.weakTo },
    { title: "Resists", items: result.resists },
    { title: "Immune to", items: result.immune },
  ].filter((group) => group.items.length > 0);

  if (groups.length === 0) return null;

  return (
    <section className="matchups" id="matchups">
      <h3 className="section-title">Type matchups</h3>
      {groups.map((group) => (
        <div key={group.title} className="matchup-group">
          <span className="matchup-label">{group.title}</span>
          <div className="matchup-chips">
            {group.items.map((item) => (
              <MatchupChip
                key={item.type}
                name={item.type}
                multiplier={item.multiplier}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default TypeMatchups;
