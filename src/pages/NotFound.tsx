import { Link } from "react-router-dom";
import ToggleTheme from "../components/ToggleTheme";

function NotFound() {
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

      <div className="relative z-10 p-8">
        <h1 className="text-4xl md:text-6xl font-light">
          404 — Page not found
        </h1>
        <p className="mt-3 text-sm">
          The page you are looking for doesn’t exist.
        </p>
        <div className="mt-6 flex gap-4 justify-center text-[11px] sm:text-sm">
          <Link
            className="dark:bg-gray-300 dark:text-gray-800 text-gray-300 bg-gray-800  items-center justify-center py-4 px-6 backdrop-blur-3xl font-bold hover:bg-gray-500"
            to="/"
          >
            Go Home
          </Link>
          <Link
            className="dark:bg-gray-300 dark:text-gray-800 text-gray-300 bg-gray-800  items-center justify-center py-4 px-6 backdrop-blur-3xl font-bold hover:bg-gray-500"
            to="/in"
          >
            Your Inbox
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NotFound;
