import IdentityTag from "../components/LoadedIdentity";
import ToggleTheme from "../components/ToggleTheme";
import { useState } from "react";
import { Inbox, HatGlasses } from "lucide-react";
import { Link } from "react-router-dom";

function Home() {
  const identities = [
    { id: "id-1", name: "Primary", uniqueString: "5GaMdgTyOYe" },
    { id: "id-2", name: "Work", uniqueString: "tGasMSTyOYU" },
    { id: "id-3", name: "Anon", uniqueString: "x1Ysdz9Kpq" },
  ];
  const [selectedId] = useState<string | undefined>(identities[0]?.id);
  const selected = identities.find((i) => i.id === selectedId);

  return (
    <section className="bg-gray-300 dark:bg-gray-800 dark:text-gray-300 text-center text-gray-800 flex flex-col w-full justify-center items-center h-screen">
      <div className="absolute top-0 right-2">
        <ToggleTheme />
      </div>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        aria-hidden="true"
      >
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.5"
            numOctaves="3"
            stitchTiles="stitch"
          ></feTurbulence>
        </filter>
        <rect
          width="100%"
          height="100%"
          filter="url(#noiseFilter)"
          fill="white"
        ></rect>
      </svg>
      <div className="relative z-10 p-8">
        <h1 className="text-4xl md:text-6xl font-light">
          Welcome to
          <span className="italic font-bold font-garamond"> better</span> S.M.A
        </h1>
        <h3 className="text-xs md:text-xl mt-3 font-extralight">
          Manage Anonymous messages in the best way{" "}
        </h3>
        <p className="text-xs mt-3">
          <span className="font-bold">100</span> Active Users,{" "}
          <span className="font-bold">100</span> Identities,{" "}
          <span className="font-bold">100</span> Msg and Counting...
        </p>
        <div className="mt-6 flex gap-4 text-[11px] sm:text-sm justify-center items-center">
          <Link
            className="items-center justify-center py-4 px-6 dark:bg-gray-300 dark:text-gray-800 text-gray-300 bg-gray-800 backdrop-blur-3xl font-bold hover:bg-gray-500"
            to="/id"
          >
            <HatGlasses className="inline mx-2" />
            Identities
          </Link>
          <Link
            className="dark:bg-gray-300 dark:text-gray-800 text-gray-300 bg-gray-800  items-center justify-center py-4 px-6 backdrop-blur-3xl font-bold hover:bg-gray-500"
            to={selected ? `/in?identity=${selected.uniqueString}` : "/in"}
          >
            <Inbox className="inline mx-2" />
            Your Inbox
            {selected && (
              <div className="absolute dark:text-gray-300 font-light text-gray-800 -right-10 -bottom-4">
                <IdentityTag uniqueString={selected.uniqueString} />
              </div>
            )}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Home;
