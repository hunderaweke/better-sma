import LoadedIdentity from "../components/LoadedIdentity";
import ToggleTheme from "../components/ToggleTheme";
import IdentityDropdown from "../components/IdentityDropdown";
import { useState } from "react";

function Home() {
  const identities = [
    { id: "id-1", name: "Primary", uniqueString: "5GaMdgTyOYe" },
    { id: "id-2", name: "Work", uniqueString: "tGasMSTyOYU" },
    { id: "id-3", name: "Anon", uniqueString: "x1Ysdz9Kpq" },
  ];
  const [selectedId, setSelectedId] = useState<string | undefined>(
    identities[0]?.id,
  );
  const selected = identities.find((i) => i.id === selectedId);

  return (
    <section className="bg-gray-200 dark:bg-gray-700 dark:text-gray-200 text-center text-gray-700 flex flex-col w-full justify-center items-center h-screen">
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
        <div className="mt-6 flex gap-4 text-[11px] sm:text-sm justify-center">
          <a
            className="items-center justify-center py-4 px-6 dark:bg-gray-200 dark:text-gray-700 text-gray-200 bg-gray-700 backdrop-blur-3xl font-bold hover:bg-gray-500"
            href=""
          >
            <i className="mx-2 text-xl nf-md-drama_masks nf"></i>
            Identities
          </a>
          <a
            className="dark:bg-gray-200 dark:text-gray-700 text-gray-200 bg-gray-700  items-center justify-center py-4 px-6 backdrop-blur-3xl font-bold hover:bg-gray-500"
            href=""
          >
            <i className="nf nf-oct-inbox mx-2 text-xl"></i>Your Inbox
            {selected && (
              <div className="absolute dark:text-gray-200 font-light text-gray-700 -right-10 -bottom-4">
                <LoadedIdentity uniqueString={selected.uniqueString} />
              </div>
            )}
          </a>
        </div>
        <div className="block absolute left-43.75 bottom-4 w-36 h-fit">
          <IdentityDropdown identities={identities} onSelect={setSelectedId} />
        </div>
      </div>
    </section>
  );
}

export default Home;
