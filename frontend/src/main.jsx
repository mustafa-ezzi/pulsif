import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/sora/400.css";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import "./styles/tokens.css";
import "./styles/reset.css";
import "./styles/utilities.css";
import "./styles/shell.css";
import "./styles/pages.css";
import "./styles/landing.css";
import "./styles/studio.css";
import "./motion/lab/lab.css";
import { registerMotion } from "./motion/register";
import { App } from "./app/App";

registerMotion();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
