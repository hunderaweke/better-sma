import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Home, User2 } from "lucide-react";
import ToggleTheme from "../components/ToggleTheme";
import getVibrantColor from "../utils/color";

type Identity = {
  id: string;
  name: string;
  uniqueString: string;
};

function Inbox() {
  const identities: Identity[] = [
    { id: "id-1", name: "Primary", uniqueString: "5GaMdgTyOYe" },
    { id: "id-2", name: "Work", uniqueString: "tGasMSTyOYU" },
    { id: "id-3", name: "Anon", uniqueString: "x1Ysdz9Kpq" },
  ];
  const [searchParams] = useSearchParams();
  const paramIdentity = searchParams.get("identity");
  if (paramIdentity) {
    return <Navigate to={`/in/${paramIdentity}`} replace />;
  }
  return (
    <section className="bg-gray-300 dark:bg-gray-800 dark:text-gray-300 text-center text-gray-800 flex flex-col w-full justify-center items-center h-screen relative">
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        aria-hidden="true"
      >
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter="url(#noiseFilter)"
          fill="white"
        />
      </svg>

      <div className="absolute top-0 right-2">
        <ToggleTheme />
      </div>

      <div className="relative z-10 p-8 w-full max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-light">Your Inbox</h1>
        <p className="mt-3 text-sm opacity-80">
          Read incoming messages tied to your identities.
        </p>

        <div className="mt-6 flex gap-4 justify-center text-[11px] sm:text-sm flex-wrap">
          <Link
            to="/"
            className="inline-flex gap-3 dark:bg-gray-300 dark:text-gray-800 text-gray-300 bg-gray-800  items-center justify-center py-2 px-6 backdrop-blur-3xl font-bold hover:bg-gray-500"
          >
            <Home size={16} />
            Home
          </Link>
          <Link
            to="/id"
            className="inline-flex gap-3 dark:bg-gray-300 dark:text-gray-800 text-gray-300 bg-gray-800  items-center justify-center py-2 px-6 backdrop-blur-3xl font-bold hover:bg-gray-500"
          >
            <User2 size={16} />
            Identities
          </Link>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {identities.map((i) => {
            const color = getVibrantColor(i.uniqueString);
            return (
              <Link
                key={i.id}
                to={`/in/${i.uniqueString}`}
                className="flex items-center justify-between border border-gray-500/50 bg-gray-200/70 dark:bg-gray-700/70 px-3 py-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-5 h-5 rounded-sm border border-gray-500/50"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold">{i.name}</span>
                    <span className="text-xs opacity-70">{i.uniqueString}</span>
                  </div>
                </div>
                <span className="inline-flex gap-3 dark:bg-gray-300 dark:text-gray-800 text-gray-300 bg-gray-800 items-center justify-center py-2 px-3 backdrop-blur-3xl font-bold text-xs hover:bg-gray-500">
                  Proceed
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Inbox;
