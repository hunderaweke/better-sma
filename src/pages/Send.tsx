import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ToggleTheme from "../components/ToggleTheme";
import NotFound from "./NotFound";
import api from "../utils/api";
import { SendIcon, Loader2, CheckIcon, AlertCircle } from "lucide-react";
import getVibrantColor from "../utils/color";
import {
  getOrCreateStoredIdentity,
  isIdentityExpired,
  readStoredIdentity,
  type StoredIdentity,
} from "../utils/identity";
import type { Room } from "../types";

function Send() {
  const { identity } = useParams();
  const [message, setMessage] = useState("");
  const [sendStatus, setSendStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [senderIdentity, setSenderIdentity] = useState<StoredIdentity | null>(
    null,
  );
  const [isPreparingIdentity, setIsPreparingIdentity] = useState(true);
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [isRoomMissing, setIsRoomMissing] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function prepareIdentity() {
      try {
        const storedIdentity = readStoredIdentity();

        if (storedIdentity && !isIdentityExpired(storedIdentity)) {
          if (isActive) {
            setSenderIdentity(storedIdentity);
          }
          return;
        }

        const nextIdentity = await getOrCreateStoredIdentity();

        if (isActive) {
          setSenderIdentity(nextIdentity);
        }
      } catch (error) {
        console.error("Failed to prepare sender identity", error);
        if (isActive) {
          setSenderIdentity(null);
        }
      } finally {
        if (isActive) {
          setIsPreparingIdentity(false);
        }
      }
    }

    void prepareIdentity();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function fetchRoomDetails() {
      if (!identity) {
        if (isActive) {
          setIsRoomMissing(true);
          setIsLoadingRoom(false);
        }
        return;
      }

      try {
        const response = await api.get<{ data?: Room[] }>("/api/rooms", {
          params: {
            unique_string: identity,
            page: 1,
            page_size: 1,
            sort_by: "created_at",
            sort_order: "desc",
          },
        });

        if (!isActive) {
          return;
        }

        const rooms = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        const nextRoom = rooms.find(
          (roomItem) => roomItem.unique_string === identity,
        );

        setRoom(nextRoom ?? null);
        setIsRoomMissing(!nextRoom);
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.error("Failed to load room details", error);
        setRoom(null);
        setIsRoomMissing(true);
      } finally {
        if (isActive) {
          setIsLoadingRoom(false);
        }
      }
    }

    void fetchRoomDetails();

    return () => {
      isActive = false;
    };
  }, [identity]);

  const handleSend = async () => {
    if (
      !message.trim() ||
      !identity ||
      isLoadingRoom ||
      isRoomMissing ||
      !room
    ) {
      return;
    }

    setSendStatus("loading");
    try {
      const currentIdentity = await getOrCreateStoredIdentity();
      await api.post(
        `/api/rooms/${encodeURIComponent(room.unique_string)}/messages`,
        {
          from_unique: currentIdentity.unique_string,
          text: message,
        },
      );
      setMessage("");
      setSendStatus("success");
      setTimeout(() => setSendStatus("idle"), 1200);
    } catch (error) {
      console.error(error);
      setSendStatus("error");
      setTimeout(() => setSendStatus("idle"), 1600);
    }
  };

  if (isRoomMissing && !isLoadingRoom) {
    return <NotFound />;
  }

  return (
    <section className="relative min-h-screen bg-gray-300 text-gray-800 dark:bg-gray-800 dark:text-gray-300 flex flex-col w-full items-center">
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

      <div className="absolute top-4 right-4 z-20">
        <ToggleTheme />
      </div>

      <div className="relative z-10 w-full mx-auto max-w-4xl px-4 pt-16 flex flex-col gap-6">
        {/* Header container */}
        <div className="border border-gray-800 dark:border-gray-500 bg-transparent p-6">
          <h1 className="text-sm lg:text-3xl font-normal text-left flex items-baseline gap-2">
            Send to
            {room ? (
              <div className="text-gray-700/80 dark:text-gray-300 flex items-center font-light">
                <span className="border-1 border-r-0 px-4" style={{}}>
                  {room.name || room.unique_string}
                </span>
                <div
                  className="inline-block h-5 w-5 lg:h-9 lg:w-9 shrink-0 ring-1"
                  style={{
                    backgroundColor: getVibrantColor(room.unique_string),
                    borderColor: getVibrantColor(room.unique_string),
                  }}
                ></div>
              </div>
            ) : identity ? (
              <div className="text-gray-700/80 dark:text-gray-300 flex items-center font-light">
                <span className="border-1 border-r-0 px-4" style={{}}>
                  {identity}
                </span>
                <div
                  className="inline-block h-5 w-5 lg:h-9 lg:w-9 shrink-0 ring-1"
                  style={{
                    backgroundColor: getVibrantColor(identity),
                    borderColor: getVibrantColor(identity),
                  }}
                ></div>
              </div>
            ) : null}
          </h1>
        </div>

        {isPreparingIdentity && (
          <div className="border border-gray-800/50 dark:border-gray-500/50 bg-transparent px-4 py-3 text-left text-xs uppercase tracking-[0.12em] text-gray-600 dark:text-gray-400">
            Preparing your sender identity...
          </div>
        )}

        <div className="flex flex-col w-full">
          <div className="text-[11px] text-left text-gray-600 dark:text-gray-400 mb-1">
            {message.length}/10000
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch h-full">
            <textarea
              className="flex-1 min-h-[100px] sm:min-h-[140px] bg-transparent border outline-gray-400 focus:outline-3 border-gray-800 dark:border-gray-500 p-4 focus:border-black dark:focus:border-gray-300 resize-y text-sm"
              placeholder="Enter your message here, then press send."
              value={message}
              maxLength={10000}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              onClick={handleSend}
              disabled={
                sendStatus === "loading" ||
                !message.trim() ||
                !senderIdentity ||
                isLoadingRoom ||
                isRoomMissing ||
                !room
              }
              className="w-full h-12 sm:h-auto sm:w-[100px] shrink-0 bg-transparent border border-gray-800 dark:border-gray-500 p-4 transition-colors hover:bg-gray-400/20 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center justify-center"
            >
              {sendStatus === "loading" && <Loader2 className="animate-spin" />}
              {sendStatus === "success" && (
                <CheckIcon className="text-green-500" />
              )}
              {sendStatus === "error" && (
                <AlertCircle className="text-red-500" />
              )}
              {sendStatus === "idle" && <SendIcon />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Send;
