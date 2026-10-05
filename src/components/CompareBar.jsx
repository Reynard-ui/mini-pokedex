import { Link } from "react-router-dom";
import { useCompare } from "../context/CompareContext.jsx";
import { capitalize } from "../utils.js";

// Floating bar that appears when 1+ Pokémon are in the compare selection.
function CompareBar() {
  const { selection, toggleCompare, clearCompare } = useCompare();

  if (selection.length === 0) return null;

  const full = selection.length === 2;

  return (
    <div className="compare-bar">
      <div className="compare-bar-names">
        {selection.map((name) => (
          <button
            key={name}
            type="button"
            className="compare-bar-name"
            title={`Remove ${name} from the comparison`}
            onClick={() => toggleCompare(name)}
          >
            {capitalize(name)} ×
          </button>
        ))}
      </div>
      <div className="compare-bar-actions">
        {full ? (
          <Link to="/compare" className="compare-bar-go">
            Compare →
          </Link>
        ) : (
          <span className="compare-bar-hint">
            Pick 1 more to compare
          </span>
        )}
        <button
          type="button"
          className="compare-bar-clear"
          onClick={clearCompare}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default CompareBar;
