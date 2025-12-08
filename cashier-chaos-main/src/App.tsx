import { GameService, ComponentRefresh } from "gamez";
import { createRoot } from "react-dom/client";
import GameComponent from "./Game";
import { ASSETS, LEVELS } from "./constants";
import "./styles/globals.css";

const container = document.getElementById("root")!;
const root = createRoot(container);

//Add game-id initialisation
const gs = new GameService("game-id", LEVELS, ASSETS);

//Add ComponentRefresh for rendering app
root.render(
  <ComponentRefresh>
    <GameComponent gs={gs} />
  </ComponentRefresh>
);
