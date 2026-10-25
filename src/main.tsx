import { StrictMode, createElement, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import "./data";

const appModules = import.meta.glob<{ default: ComponentType }>("./App.tsx", {
  eager: true,
});
const App = appModules["./App.tsx"]?.default;
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Missing root element. Add <div id="root"></div> to index.html.');
}

createRoot(rootElement).render(
  <StrictMode>
    {App
      ? createElement(App)
      : createElement(
          "main",
          { style: { fontFamily: "system-ui, sans-serif", padding: "2rem" } },
          createElement("h1", null, "RBU ClassLens"),
          createElement(
            "p",
            null,
            "Local-first demo is ready. Add src/App.tsx to connect the application interface.",
          ),
        )}
  </StrictMode>,
);
