import LoadedIdentity from "../components/LoadedIdentity";
import ToggleTheme from "../components/ToggleTheme";
function Home() {
  return (
    <section className="bg-gray-200 dark:bg-gray-700 dark:text-gray-200 text-center text-gray-700 flex flex-col w-full justify-center items-center h-screen">
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
        <h1 className="text-3xl md:text-6xl font-light">
          Welcome to
          <span className="italic font-bold font-garamond"> better</span> S.M.A
        </h1>
        <h3 className="text-sm md:text-xl mt-3 font-extralight">
          Manage Anonymous messages in the best way{" "}
        </h3>
        <p className="text-xs mt-3">
          <span className="font-bold">100</span> Active Users,{" "}
          <span className="font-bold">100</span> Identities,{" "}
          <span className="font-bold">100</span> Msg and Counting...
        </p>
        <div className="mt-6 flex gap-4 justify-center">
          <a
            className="inline-flex items-center justify-center py-4 px-6 dark:bg-gray-200 dark:text-gray-700 text-gray-200 bg-gray-700 backdrop-blur-3xl font-bold hover:bg-gray-500"
            href=""
          >
            <i className="mx-2 text-xl nf-md-drama_masks nf"></i>
            Identities
          </a>
          <a
            className="inline-flex dark:bg-gray-200 dark:text-gray-700 text-gray-200 bg-gray-700  items-center justify-center py-4 px-6 backdrop-blur-3xl font-bold hover:bg-gray-500"
            href=""
          >
            <i className="nf nf-oct-inbox mx-2 text-xl"></i>Your Inbox
          </a>
        </div>
        <div className="absolute  right-30 bottom-5">
          <LoadedIdentity uniqueString="5GaMdgTyOYe" />
        </div>
        <ToggleTheme />
      </div>
    </section>
  );
}

export default Home;
