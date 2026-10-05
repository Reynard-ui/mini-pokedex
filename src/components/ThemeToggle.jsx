import { useTheme } from "../context/ThemeContext.jsx";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="3.5" fill="currentColor" />
          <path
            d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M13 3l-1.4 1.4M4.4 11.6L3 13"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7z"
            fill="currentColor"
          />
        </svg>
      )}
      {isDark ? "Light" : "Dark"}
    </button>
  );
}

export default ThemeToggle;
