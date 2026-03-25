import IdentityTag from "../components/IdentityTag";
import ToggleTheme from "../components/ToggleTheme";
import { useEffect, useState } from "react";
import { CircleUserRound, Inbox, LogOut, DoorOpen } from "lucide-react";
import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  clearSelectedRoomFromStorage,
  readSelectedRoomFromStorage,
} from "../utils/roomStorage";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
const authStatusUrl =
  import.meta.env.VITE_AUTH_STATUS_URL ?? `${apiBaseUrl}/api/auth/me`;
const googleAuthUrl =
  import.meta.env.VITE_GOOGLE_AUTH_URL ?? `${apiBaseUrl}/api/auth/google`;
const githubAuthUrl =
  import.meta.env.VITE_GITHUB_AUTH_URL ?? `${apiBaseUrl}/api/auth/github`;
const logoutUrl =
  import.meta.env.VITE_LOGOUT_URL ?? `${apiBaseUrl}/api/auth/logout`;

function getStoredAuthState() {
  return Boolean(
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("isLoggedIn") === "true",
  );
}
function parseAuthError(payload: unknown): string | null {
  if (typeof payload !== "string") {
    return null;
  }
  switch (payload) {
    case "email_registered_with_different_provider":
      return "This email is already registered with a different provider.";
    case "authentication_failed":
      return "Authentication failed. Please try again.";
  }
  return payload;
}

function getDisplayName(authData: unknown) {
  if (!authData || typeof authData !== "object") {
    return null;
  }

  const user = authData as {
    name?: unknown;
    displayName?: unknown;
    fullName?: unknown;
    email?: unknown;
    user?: {
      name?: unknown;
      displayName?: unknown;
      fullName?: unknown;
      email?: unknown;
    };
  };

  const candidate =
    user.displayName ??
    user.fullName ??
    user.name ??
    user.user?.displayName ??
    user.user?.fullName ??
    user.user?.name ??
    user.email ??
    user.user?.email;

  return typeof candidate === "string" && candidate.trim().length > 0
    ? candidate.trim()
    : null;
}

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(getStoredAuthState());
  const [loggedInUserName, setLoggedInUserName] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<{
    identities: number;
    messages: number;
    users: number;
    rooms: number;
  } | null>(null);
  const [displayedAnalytics, setDisplayedAnalytics] = useState({
    identities: 0,
    messages: 0,
    users: 0,
    rooms: 0,
  });
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const defaultRoom = readSelectedRoomFromStorage();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorCode = params.get("error");
    const nextError = parseAuthError(errorCode);

    const errorTimerId = window.setTimeout(() => {
      setError(nextError);
    }, 10000);

    if (!nextError) {
      return () => window.clearTimeout(errorTimerId);
    }

    const timeoutId = window.setTimeout(() => {
      setError(null);
    }, 3000);

    navigate(location.pathname, { replace: true });
    return () => {
      window.clearTimeout(errorTimerId);
      window.clearTimeout(timeoutId);
    };
  }, [location.pathname, location.search, navigate]);

  const handleOpenInbox = () => {
    try {
      const storedRoom = localStorage.getItem("better-sma:selected-room");

      if (storedRoom) {
        const parsed = JSON.parse(storedRoom) as { unique_string?: string };
        if (parsed.unique_string === "") {
          return;
        }
        if (parsed.unique_string) {
          navigate(`/in/${parsed.unique_string}`);
          return;
        }
      }
    } catch {
      // ignore
    }

    navigate("/in");
  };
  useEffect(() => {
    let isActive = true;

    async function checkAuth() {
      try {
        const response = await fetch(authStatusUrl, {
          credentials: "include",
        });

        if (!isActive) {
          return;
        }

        if (response.ok) {
          let nextUserName: string | null = null;

          try {
            const authData: unknown = await response.json();
            nextUserName = getDisplayName(authData);
          } catch {
            nextUserName = null;
          }

          setIsLoggedIn(true);
          setLoggedInUserName(nextUserName);
          return;
        }

        if (response.status === 401 || response.status === 403) {
          setIsLoggedIn(false);
          setLoggedInUserName(null);
          return;
        }
      } catch {
        if (!isActive) {
          return;
        }
      }

      if (isActive) {
        setIsLoggedIn(getStoredAuthState());
      }
    }

    void checkAuth();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!analytics) {
      return;
    }

    let frameId = 0;
    const startTime = window.performance.now();
    const duration = 900;

    const animate = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayedAnalytics({
        identities: Math.round(analytics.identities * eased),
        messages: Math.round(analytics.messages * eased),
        users: Math.round(analytics.users * eased),
        rooms: Math.round(analytics.rooms * eased),
      });

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [analytics]);

  useEffect(() => {
    let isActive = true;

    async function loadAnalytics() {
      try {
        const response = await api.get<{
          identities: number;
          messages: number;
          users: number;
          rooms: number;
        }>("/api/analytics");

        if (isActive) {
          setAnalytics(response.data);
        }
      } catch (error) {
        console.error("Failed to load analytics", error);
      }
    }

    void loadAnalytics();

    return () => {
      isActive = false;
    };
  }, []);

  function handleLogout() {
    clearSelectedRoomFromStorage();
    setIsLoggedIn(false);
    setLoggedInUserName(null);
    api.post(logoutUrl, {}).catch(() => {});
  }

  return (
    <section className="bg-gray-300 dark:bg-gray-800 dark:text-gray-300 text-center text-gray-800 flex flex-col w-full justify-center items-center h-screen">
      <div className="absolute top-4 right-10">
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
        {isLoggedIn && (
          <div className="mb-10 flex justify-center">
            <div className="relative inline-flex flex-col items-center">
              <div className="inline-flex items-center gap-3 border border-gray-500/40 bg-gray-200/80 px-4 py-2 backdrop-blur  dark:bg-gray-900/50">
                <span className="relative flex h-10 w-10 items-center justify-center bg-gray-800 text-gray-100 dark:bg-gray-200 dark:text-gray-800">
                  <CircleUserRound className="h-6 w-6" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 border-2 border-gray-200 bg-emerald-500 dark:border-gray-900" />
                </span>
                <div className="text-left leading-tight">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-gray-600 dark:text-gray-400">
                    Logged in
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {loggedInUserName ?? "Authenticated user"}
                  </p>
                </div>
                <button
                  className="h-8 w-8 border flex items-center cursor-pointer justify-center border-gray-800 hover:border-gray-500 hover:bg-gray-800 dark:border-gray-300 hover:text-gray-200 transition"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" onClick={handleLogout} />
                </button>
              </div>
            </div>
          </div>
        )}
        <h1 className="text-4xl md:text-6xl font-light">
          Welcome to
          <span className="italic font-bold font-garamond"> better</span> S.M.A
        </h1>
        <h3 className="text-xs md:text-2xl mt-3 font-light">
          Better Anon Messages{" "}
        </h3>
        <p className="text-xs mt-5">
          <span className="font-bold">{displayedAnalytics.users}</span> Active
          users,{" "}
          <span className="font-bold">{displayedAnalytics.identities}</span>{" "}
          Identities,{" "}
          <span className="font-bold">{displayedAnalytics.messages}</span> Sent
          Msgs, <span className="font-bold">{displayedAnalytics.rooms}</span>{" "}
          Rooms
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-[11px] sm:text-sm justify-center items-center">
          {isLoggedIn ? (
            <>
              <Link
                className="items-center justify-center py-4 px-6 dark:bg-gray-300 cursor-pointer dark:text-gray-800 text-gray-300 bg-gray-800 backdrop-blur-3xl font-bold hover:bg-gray-500"
                to="/rooms"
              >
                <DoorOpen className="inline mx-2" />
                Rooms
              </Link>
              <button
                type="button"
                className="dark:bg-gray-300 dark:text-gray-800 cursor-pointer text-gray-300 bg-gray-800  items-center justify-center py-4 px-6 backdrop-blur-3xl font-bold hover:bg-gray-500"
                onClick={handleOpenInbox}
              >
                <Inbox className="inline mx-2" />
                Your Inbox
                {defaultRoom && (
                  <div className="absolute dark:text-gray-300 font-light text-gray-800 -right-10 -bottom-4">
                    <IdentityTag uniqueString={defaultRoom.unique_string} />
                  </div>
                )}
              </button>
            </>
          ) : (
            <>
              <a
                className="inline-flex items-center justify-center gap-2 py-4 px-6 dark:bg-gray-300 dark:text-gray-800 text-gray-300 bg-gray-800 backdrop-blur-3xl font-bold hover:bg-gray-500"
                href={googleAuthUrl}
              >
                <SiGoogle className="h-4 w-4" />
                Continue by Google
              </a>
              <a
                className="inline-flex items-center justify-center gap-2 py-4 px-6 dark:bg-gray-300 dark:text-gray-800 text-gray-300 bg-gray-800 backdrop-blur-3xl font-bold hover:bg-gray-500"
                href={githubAuthUrl}
              >
                <SiGithub className="h-4 w-4" />
                Continue by GitHub
              </a>
            </>
          )}
        </div>
        {error && (
          <div className="mt-6 inline-flex max-w-80 items-start gap-3 border border-red-500/30 bg-red-100/80 px-4 py-3 text-left text-sm font-medium text-red-900 backdrop-blur dark:border-red-400 dark:bg-red-800 dark:text-red-100">
            <span className="mt-0.5 h-2.5 w-2.5 shrink-0 bg-red-500 dark:bg-red-300" />
            <p>{error}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Home;
