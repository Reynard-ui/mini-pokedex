import { useShiny } from "../context/ShinyContext.jsx";

function ShinyToggle() {
  const { shiny, toggle } = useShiny();
  return (
    <button
      type="button"
      className={`theme-toggle shiny-toggle${shiny ? " shiny-toggle-on" : ""}`}
      onClick={toggle}
      aria-label={shiny ? "Turn shiny mode off" : "Turn shiny mode on"}
      aria-pressed={shiny}
    >
      <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
        {/* Sparkle / star to suggest the golden variant */}
        <path
          d="M8 1l1.7 4.6L14 7l-4.3 1.4L8 13l-1.7-4.6L2 7l4.3-1.4z"
          fill="currentColor"
        />
      </svg>
      {shiny ? "Shiny On" : "Shiny"}
    </button>
  );
}

export default ShinyToggle;
