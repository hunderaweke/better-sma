import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  Edit3,
  Home,
  Save,
  Settings,
  Share2,
  Check,
  Loader2,
  AlertCircle,
  Volume2,
  VolumeX,
  DoorOpen,
} from "lucide-react";
import ToggleTheme from "../components/ToggleTheme";
import Message from "../components/Message";
import api from "../utils/api";
import type { Room } from "../types";
import {
  notifyError,
  notifyInfo,
  notifySuccess,
  playNotificationRing,
} from "../utils/notifications";
import {
  readSelectedRoomFromStorage,
  saveSelectedRoomToStorage,
} from "../utils/roomStorage";

type RoomMessage = {
  id: string;
  created_at: string;
  updated_at: string;
  room_id: string;
  from_unique: string;
  text: string;
};

const MESSAGE_VOICE_MUTED_STORAGE_KEY = "better-sma:message-voice-muted";

function isValidRoomMessage(
  message: RoomMessage | null,
): message is RoomMessage {
  return Boolean(
    message &&
    message.id.trim().length > 0 &&
    message.room_id.trim().length > 0 &&
    message.from_unique.trim().length > 0 &&
    message.text.trim().length > 0,
  );
}

function normalizeRoomMessage(payload: unknown): RoomMessage | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Partial<RoomMessage>;

  if (
    typeof record.id !== "string" ||
    typeof record.created_at !== "string" ||
    typeof record.updated_at !== "string" ||
    typeof record.room_id !== "string" ||
    typeof record.from_unique !== "string" ||
    typeof record.text !== "string"
  ) {
    return null;
  }

  const normalizedMessage: RoomMessage = {
    id: record.id.trim(),
    created_at: record.created_at.trim(),
    updated_at: record.updated_at.trim(),
    room_id: record.room_id.trim(),
    from_unique: record.from_unique.trim(),
    text: record.text.trim(),
  };

  return isValidRoomMessage(normalizedMessage) ? normalizedMessage : null;
}

function InboxDetailView({ roomId: uniqueString }: { roomId: string }) {
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem(MESSAGE_VOICE_MUTED_STORAGE_KEY) === "true";
  });
  const [now, setNow] = useState<number>(() => Date.now());
  const [roomName, setRoomName] = useState<string>(uniqueString);
  const [roomNameDraft, setRoomNameDraft] = useState<string>(uniqueString);
  const [isEditingRoomName, setIsEditingRoomName] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const hasShownConnectionErrorRef = useRef<boolean>(false);
  const isMutedRef = useRef<boolean>(isMuted);
  const messagesRef = useRef<RoomMessage[]>(messages);

  useEffect(() => {
    isMutedRef.current = isMuted;
    localStorage.setItem(MESSAGE_VOICE_MUTED_STORAGE_KEY, String(isMuted));

    if (isMuted) {
      window.speechSynthesis?.cancel();
    }
  }, [isMuted]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    let isActive = true;

    async function fetchRoomDetails() {
      try {
        const response = await api.get<{ data?: Room[] }>("/api/rooms", {
          params: {
            unique_string: uniqueString,
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
          (room) => room.unique_string === uniqueString,
        );

        if (!nextRoom) {
          return;
        }

        setRoomName(nextRoom.name || nextRoom.unique_string);
        setRoomNameDraft(nextRoom.name || nextRoom.unique_string);

        const storedRoom = readSelectedRoomFromStorage();
        if (storedRoom?.unique_string === nextRoom.unique_string) {
          saveSelectedRoomToStorage({
            ...storedRoom,
            ...nextRoom,
          });
        }
      } catch (error) {
        console.error("Failed to load room details", error);
      }
    }

    void fetchRoomDetails();

    return () => {
      isActive = false;
    };
  }, [uniqueString]);

  function formatElapsedTime(createdAt: string) {
    const createdTime = new Date(createdAt).getTime();

    if (Number.isNaN(createdTime)) {
      return createdAt;
    }

    const elapsedMilliseconds = now - createdTime;
    const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);

    if (elapsedSeconds < 60) {
      return `${elapsedSeconds}s`;
    }

    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    if (elapsedMinutes < 60) {
      return `${elapsedMinutes}min`;
    }

    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) {
      return `${elapsedHours}hr${elapsedHours === 1 ? "" : "s"}`;
    }

    const elapsedDays = Math.floor(elapsedHours / 24);
    if (elapsedDays < 30) {
      return `${elapsedDays}d${elapsedDays === 1 ? "" : "s"}`;
    }

    const elapsedMonths = Math.floor(elapsedDays / 30);
    if (elapsedMonths < 12) {
      return `${elapsedMonths}mo${elapsedMonths === 1 ? "" : "s"}`;
    }

    const elapsedYears = Math.floor(elapsedMonths / 12);
    return `${elapsedYears}yr${elapsedYears === 1 ? "" : "s"}`;
  }

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function fetchMessages() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await api.get<RoomMessage[]>(
          `/api/rooms/${encodeURIComponent(uniqueString)}/messages`,
        );

        if (!isActive) {
          return;
        }

        const nextMessages = Array.isArray(response.data)
          ? response.data.filter(isValidRoomMessage)
          : [];

        setMessages(nextMessages);
        setLoadError(null);
      } catch {
        if (isActive) {
          setMessages([]);
          setLoadError("Unable to load messages for this identity.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void fetchMessages();

    return () => {
      isActive = false;
    };
  }, [uniqueString]);

  useEffect(() => {
    let isActive = true;

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const connect = () => {
      clearReconnectTimer();

      const eventSource = new EventSource(
        `/api/rooms/${encodeURIComponent(uniqueString)}/messages/receive`,
        {
          withCredentials: true,
        },
      );

      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        reconnectAttemptsRef.current = 0;
        hasShownConnectionErrorRef.current = false;
      };

      eventSource.onmessage = (event) => {
        if (!event.data || event.data.trim().length === 0) {
          return;
        }

        try {
          const nextMessage = normalizeRoomMessage(JSON.parse(event.data));
          console.log("Received message event:", {
            rawData: event.data,
            nextMessage,
          });
          if (!nextMessage) {
            return;
          }

          const alreadyExists = messagesRef.current.some(
            (message) => message.id === nextMessage.id,
          );

          if (!alreadyExists) {
            announceNewMessage(nextMessage);
          }

          setMessages((currentMessages) => {
            const withoutDuplicate = currentMessages.filter(
              (message) => message.id !== nextMessage.id,
            );

            return [nextMessage, ...withoutDuplicate];
          });
        } catch (error) {
          console.error("Error processing message event:", {
            error,
            rawData: event.data,
          });
        }
      };

      eventSource.onerror = () => {
        if (!isActive) {
          return;
        }

        if (!hasShownConnectionErrorRef.current) {
          notifyError(
            "Live updates paused",
            "We lost the live connection and will keep reconnecting.",
          );
          hasShownConnectionErrorRef.current = true;
        }

        eventSource.close();

        const attempt = reconnectAttemptsRef.current + 1;
        reconnectAttemptsRef.current = attempt;

        const retryDelay = Math.min(1000 * attempt, 5000);
        reconnectTimerRef.current = window.setTimeout(() => {
          if (isActive) {
            connect();
          }
        }, retryDelay);
      };
    };

    connect();

    return () => {
      isActive = false;
      clearReconnectTimer();
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [uniqueString]);

  const filtered = messages;

  const copyRoomLink = async () => {
    if (copyStatus === "loading") {
      return;
    }

    setCopyStatus("loading");

    try {
      const link = `${window.location.origin}/se/${uniqueString}`;
      await navigator.clipboard.writeText(link);
      setCopyStatus("success");
      window.setTimeout(() => setCopyStatus("idle"), 1200);
      notifySuccess(
        "Link copied",
        "The room send link was copied to your clipboard.",
      );
    } catch (error) {
      console.error("Failed to copy room link", error);
      setCopyStatus("error");
      window.setTimeout(() => setCopyStatus("idle"), 1600);
      notifyError("Copy failed", "We could not copy the room link.");
    }
  };

  const announceNewMessage = (message: RoomMessage) => {
    notifyInfo("New message", `Received from ${message.from_unique}`);

    if (!isMutedRef.current) {
      playNotificationRing();
    }
  };

  const toggleMute = () => {
    setIsMuted((currentMuted) => {
      const nextMuted = !currentMuted;
      notifyInfo(
        nextMuted ? "Notifications muted" : "Notifications enabled",
        nextMuted
          ? "New message rings are muted."
          : "New message rings are enabled.",
      );
      return nextMuted;
    });
  };

  const saveRoomName = async () => {
    const nextName = roomNameDraft.trim();

    if (!nextName) {
      notifyError("Name required", "Room names cannot be empty.");
      return;
    }

    try {
      await api.put(`/api/rooms/${encodeURIComponent(uniqueString)}/name`, {
        name: nextName,
      });

      setRoomName(nextName);
      setRoomNameDraft(nextName);

      const storedRoom = readSelectedRoomFromStorage();
      if (storedRoom?.unique_string === uniqueString) {
        saveSelectedRoomToStorage({
          ...storedRoom,
          name: nextName,
        });
      }

      notifySuccess("Room name updated", `Renamed to ${nextName}.`);
      setIsEditingRoomName(false);
    } catch (error) {
      console.error("Failed to update room name", error);
      notifyError("Rename failed", "We could not update the room name.");
    }
  };

  return (
    <section className="relative min-h-screen bg-gray-300 text-center text-gray-800 dark:bg-gray-800 dark:text-gray-300">
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
      <div className="relative z-3 mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:p-4 lg:px-8">
        <div className="flex flex-col md:grid relative w-full lg:gap-4 lg:grid-rows-1 max-h-screen lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
          <div className="p w-full lg:max-h-72 flex justify-center md:relative">
            <div className="w-full border border-gray-500/40 bg-gray-200 p-4 shadow-sm dark:bg-gray-700">
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div className="flex items-center gap-2">
                  <Link
                    to="/"
                    className="inline-flex gap-2 items-center bg-gray-800 text-gray-200 dark:bg-gray-300 dark:text-gray-800 px-3 py-2 text-xs font-semibold tracking-wide shadow-sm"
                  >
                    <Home size={16} />
                    <span className="hidden sm:block">Home</span>
                  </Link>
                  <Link
                    to="/rooms"
                    className="inline-flex gap-2 items-center bg-gray-800 text-gray-200 dark:bg-gray-300 dark:text-gray-800 px-4 py-2 text-xs font-semibold tracking-wide shadow-sm"
                  >
                    <DoorOpen size={16} />
                    <span className="hidden sm:block">Rooms</span>
                  </Link>
                </div>
                <ToggleTheme />
              </div>
              <div className="border flex flex-col border-gray-500/50 bg-gray-100/70 p-2 text-left gap-3 dark:bg-gray-800/70">
                <div className="flex gap-4 flex-row md:items-center md:gap-5 md:text-left">
                  <div className="font-bold md:text-2xl sm:shrink-0">
                    <span>Room: </span>
                  </div>

                  <div className="flex w-full items-stretch gap-2">
                    <span className="inline-flex w-full min-w-0">
                      {isEditingRoomName ? (
                        <input
                          className="w-full border border-gray-500/60 bg-gray-200/70 px-2 py-2 text-gray-800 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500/40 dark:bg-gray-700/70 dark:text-gray-100"
                          aria-label="Room name"
                          value={roomNameDraft}
                          onChange={(e) => setRoomNameDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void saveRoomName();
                            }
                          }}
                        />
                      ) : (
                        <span className="w-full border border-gray-500/60 bg-gray-200/70 p-2 text-gray-800 dark:bg-gray-700/70 dark:text-gray-100">
                          {roomName}
                        </span>
                      )}
                    </span>
                    <button
                      className="inline-flex shrink-0 items-center justify-center border border-gray-500/60 bg-gray-200/70 px-3 py-2 text-gray-800 shadow-sm dark:bg-gray-700/70 dark:text-gray-100"
                      aria-label={
                        isEditingRoomName ? "Save room name" : "Edit room name"
                      }
                      type="button"
                      onClick={() => {
                        if (isEditingRoomName) {
                          void saveRoomName();
                          return;
                        }

                        setRoomNameDraft(roomName);
                        setIsEditingRoomName(true);
                      }}
                    >
                      {isEditingRoomName ? (
                        <Save size={16} />
                      ) : (
                        <Edit3 size={16} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 min-h-[60px] lg:min-h-[140px] lg:grid-cols-2">
                  <button
                    className="border border-gray-600/60 bg-gray-800 text-gray-200 dark:bg-gray-300 dark:text-gray-800 flex items-center justify-center gap-3 md:p-4 col-span-1 lg:col-span-2"
                    type="button"
                    aria-label="Share"
                    onClick={() => {
                      void copyRoomLink();
                    }}
                    aria-live="polite"
                  >
                    {copyStatus === "loading" && (
                      <Loader2 size={22} className="animate-spin" />
                    )}
                    {copyStatus === "success" && (
                      <Check size={22} className="text-green-500" />
                    )}
                    {copyStatus === "error" && (
                      <AlertCircle size={22} className="text-red-500" />
                    )}
                    {copyStatus === "idle" && <Share2 size={22} />}
                    <span className="hidden lg:block">
                      {copyStatus === "loading"
                        ? "Copying..."
                        : copyStatus === "success"
                          ? "Copied"
                          : copyStatus === "error"
                            ? "Copy failed"
                            : "Copy link"}
                    </span>
                  </button>
                  <button
                    className="border border-gray-600/60 bg-gray-800 text-gray-200 dark:bg-gray-300 dark:text-gray-800 flex items-center justify-center gap-3 p-2 md:p-4"
                    type="button"
                    aria-label="Cog"
                  >
                    <Settings size={22} />
                    <span className="hidden lg:block">Settings</span>
                  </button>
                  <button
                    className="border border-gray-600/60 bg-gray-800 text-gray-200 dark:bg-gray-300 dark:text-gray-800 flex items-center justify-center gap-3 p-2 md:p-4"
                    type="button"
                    aria-label={
                      isMuted ? "Unmute message voice" : "Mute message voice"
                    }
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                    <span className="hidden lg:block">
                      {isMuted ? "Unmute" : "Mute"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-0 overflow-auto no-scrollbar max-h-[90vh]  border border-gray-500/40 bg-gray-200/70 p-4 shadow-sm dark:bg-gray-700/70 sm:p-6 lg:max-h-[calc(100vh-2rem)]">
            {isLoading ? (
              <div className="flex items-center max-h-screen justify-center border border-gray-500/50 bg-gray-200/70 dark:bg-gray-700/70 px-3 py-3 text-left">
                <span className="text-sm opacity-80">Loading messages...</span>
              </div>
            ) : loadError ? (
              <div className="flex items-center max-h-screen justify-center border border-gray-500/50 bg-gray-200/70 dark:bg-gray-700/70 px-3 py-3 text-left">
                <span className="text-sm opacity-80">{loadError}</span>
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((m) => {
                return (
                  <Message
                    key={m.id}
                    identity={m.from_unique}
                    text={m.text}
                    time={formatElapsedTime(m.created_at)}
                  />
                );
              })
            ) : (
              <div className="flex items-center max-h-screen justify-center border border-gray-500/50 bg-gray-200/70 dark:bg-gray-700/70 px-3 py-3 text-left">
                <span className="text-sm opacity-80">
                  No messages for this identity.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function InboxDetail() {
  const { identity } = useParams<{ identity: string }>();

  if (!identity) {
    return <Navigate to="/in" replace />;
  }

  return <InboxDetailView key={identity} roomId={identity} />;
}

export default InboxDetail;
