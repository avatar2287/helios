import { createFileRoute } from "@tanstack/react-router";
import { SolarApp } from "@/components/solar/app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      <SolarApp />
    </main>
  );
}
