import { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";
import ShinyToggle from "./ShinyToggle.jsx";
import CompareBar from "./CompareBar.jsx";
import DexBook from "./DexBook.jsx";
import PixelPokeball from "./PixelPokeball.jsx";

/** Full-width top bar: Pokédex ball + title (left), small ball + 5 dots (right). */
function TopBar() {
  return (
    <header className="top-bar">
      <div className="top-bar-inner">
        <div className="top-bar-left">
          <Link to="/" className="topbar-brand-link" aria-label="Go to home page">
            <PixelPokeball size={34} className="topbar-brand-ball" />
          </Link>
          <span className="topbar-title">Pokédex</span>
        </div>
        <div className="top-bar-right" aria-hidden="true">
          <PixelPokeball size={18} open />
          <div className="topbar-dots">
            <span /><span /><span /><span /><span />
          </div>
        </div>
      </div>
    </header>
  );
}

function Sidebar() {
  const [dexBookOpen, setDexBookOpen] = useState(false);

  return (
    <>
      <aside className="app-sidebar">
        <nav className="sidebar-nav" aria-label="Main navigation">
          <NavLink to="/" end className="sidebar-link">
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M2 8l6-5.5L14 8v6h-4.5v-3.5h-3V14H2z"
                fill="currentColor"
              />
            </svg>
            Home
          </NavLink>
          <NavLink to="/favorites" className="sidebar-link">
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M8 2l2 4.3 4.6.5-3.4 3 1 4.5L8 11.6 3.8 14.3l1-4.5-3.4-3 4.6-.5z"
                fill="currentColor"
              />
            </svg>
            Favorites
          </NavLink>
          <NavLink to="/compare" className="sidebar-link">
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 6h11M9 3l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M14 10H3M7 7l-3 3 3 3" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            Compare
          </NavLink>
          <button
            type="button"
            className="sidebar-link"
            onClick={() => setDexBookOpen(true)}
          >
            <PixelPokeball size={14} open />
            Dex Book
          </button>
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-toggle-row">
            <ThemeToggle />
            <ShinyToggle />
          </div>
          <div className="sidebar-pokeball-row" aria-hidden="true">
            <span className="sidebar-pixels" />
            <PixelPokeball size={64} open />
          </div>
          <p className="sidebar-footer-text">
            Gotta catch<br />&#8217;em all!
          </p>
        </div>
      </aside>
      {dexBookOpen && <DexBook onClose={() => setDexBookOpen(false)} />}
    </>
  );
}

function Layout() {
  return (
    <div className="app">
      <TopBar />
      <div className="app-body">
        <Sidebar />
        <main>
          <Outlet />
        </main>
      </div>
      <CompareBar />
    </div>
  );
}

export default Layout;
