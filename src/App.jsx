import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import { CompareProvider } from "./context/CompareContext.jsx";
import { ShinyProvider } from "./context/ShinyContext.jsx";
import Layout from "./components/Layout.jsx";
import ListPage from "./pages/ListPage.jsx";
import DetailPage from "./pages/DetailPage.jsx";
import FavoritesPage from "./pages/FavoritesPage.jsx";
import ComparePage from "./pages/ComparePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function App() {
  return (
    <ThemeProvider>
      <ShinyProvider>
        <FavoritesProvider>
          <CompareProvider>
            <HashRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<ListPage />} />
                  <Route path="/pokemon/:name" element={<DetailPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </HashRouter>
          </CompareProvider>
        </FavoritesProvider>
      </ShinyProvider>
    </ThemeProvider>
  );
}

export default App;
