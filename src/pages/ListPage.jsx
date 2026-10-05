import SearchForm from "../components/SearchForm.jsx";
import PokemonList from "../components/PokemonList.jsx";
import PixelPokeball from "../components/PixelPokeball.jsx";
import PokemonOfTheDay from "../components/PokemonOfTheDay.jsx";

// Pixel-art Pikachu (user-supplied) — white bg removed into a transparent
// PNG at public/assets/pikachu_pixel_transparent.png. The original
// pikachu_pixel.jpg stays untouched in public/assets.
// BASE_URL resolves to "/mini-pokedex/" on GitHub Pages (vite base).
const PIKACHU_ART = `${import.meta.env.BASE_URL}assets/pikachu_pixel_transparent.png`;

function ListPage() {
  return (
    <div className="list-page">
      <div className="welcome-banner">
        <div className="banner-left">
          <div className="banner-heading">
            <span className="banner-pokeball-badge" aria-hidden="true">
              <PixelPokeball size={30} />
            </span>
            <h1 className="welcome-title">
              <span className="welcome-h1-top">Welcome to the</span>
              <span className="welcome-h1-main">PokéDex!</span>
            </h1>
          </div>

          <p className="welcome-desc">
            Explore all 1,000+ Pokémon, from their basic information to types,
            abilities, and more.
          </p>

          <div className="banner-search">
            <SearchForm />
          </div>
        </div>

        <div className="banner-art" aria-hidden="true">
          <span className="banner-rings">
            <span className="ring ring-outer" />
            <span className="ring ring-inner" />
            <span className="pixel-dot px1" />
            <span className="pixel-dot px2" />
            <span className="pixel-dot px3" />
          </span>
          <span className="banner-pokeball-side">
            <PixelPokeball size={86} open />
          </span>
          <img
            className="banner-pikachu"
            src={PIKACHU_ART}
            alt=""
            width={260}
            height={220}
          />
        </div>
      </div>

      <PokemonOfTheDay />

      <PokemonList />
    </div>
  );
}

export default ListPage;
