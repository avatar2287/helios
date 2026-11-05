import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SolarApp } from "@/components/solar/app";
import "@/styles.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <main className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
        <SolarApp />
      </main>
    </StrictMode>,
  );
}
