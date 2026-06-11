
  // @ts-ignore: allow importing react-dom/client when declaration files are missing
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  // @ts-ignore: allow importing CSS when declaration files are missing
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<App />);
  