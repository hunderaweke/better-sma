import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpLeft,
  Search,
} from "lucide-react";
import ToggleTheme from "../components/ToggleTheme";
import RoomCard from "../components/RoomCard";
import api from "../utils/api";
import type { Room } from "../types";

type RoomsResponse = {
  meta?: {
    page?: number;
    page_size?: number;
    total?: number;
    total_pages?: number;
    has_next?: boolean;
    has_prev?: boolean;
    sort_by?: string;
  };
  data?: Room[];
};

const PAGE_SIZE = 20;
const SELECTED_ROOM_STORAGE_KEY = "better-sma:selected-room";

function readSelectedRoomFromStorage(): Room | null {
  const storedRoom = localStorage.getItem(SELECTED_ROOM_STORAGE_KEY);

  if (!storedRoom) {
    return null;
  }

  try {
    return JSON.parse(storedRoom) as Room;
  } catch {
    return null;
  }
}

function buildPageItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    items.push("ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < totalPages - 1) {
    items.push("ellipsis");
  }

  items.push(totalPages);
  return items;
}

function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(
    readSelectedRoomFromStorage,
  );
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrev, setHasPrev] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedRoomCode, setCopiedRoomCode] = useState<string | null>(null);
  const copiedResetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let isActive = true;

    async function fetchRooms() {
      setIsLoading(true);

      try {
        const res = await api.get<RoomsResponse>("/api/rooms", {
          params: {
            page,
            page_size: PAGE_SIZE,
            sort_by: "created_at",
            sort_order: sortOrder,
            unique_string: searchTerm || undefined,
          },
        });

        if (!isActive) {
          return;
        }

        const payload = res.data;
        const nextRooms = Array.isArray(payload.data) ? payload.data : [];

        setRooms(nextRooms);
        setSelectedRoom((currentSelectedRoom) => {
          if (nextRooms.length === 0) {
            return currentSelectedRoom;
          }

          const freshSelectedRoom = currentSelectedRoom
            ? nextRooms.find((room) => room.id === currentSelectedRoom.id)
            : null;

          return (
            freshSelectedRoom ?? currentSelectedRoom ?? nextRooms[0] ?? null
          );
        });
        setPage(payload.meta?.page ?? page);
        setTotalPages(payload.meta?.total_pages ?? 1);
        setHasNext(Boolean(payload.meta?.has_next));
        setHasPrev(Boolean(payload.meta?.has_prev));
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.error("Failed to fetch rooms", error);
        setRooms([]);
        setHasNext(false);
        setHasPrev(false);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void fetchRooms();

    return () => {
      isActive = false;
    };
  }, [page, sortOrder, searchTerm]);

  useEffect(() => {
    if (selectedRoom) {
      localStorage.setItem(
        SELECTED_ROOM_STORAGE_KEY,
        JSON.stringify(selectedRoom),
      );
      return;
    }

    localStorage.removeItem(SELECTED_ROOM_STORAGE_KEY);
  }, [selectedRoom]);

  useEffect(() => {
    return () => {
      if (copiedResetTimerRef.current) {
        window.clearTimeout(copiedResetTimerRef.current);
      }
    };
  }, []);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const copyRoomCode = async (code: string) => {
    const link = `${window.location.origin}/in/${code}`;
    await navigator.clipboard.writeText(link);

    if (copiedResetTimerRef.current) {
      window.clearTimeout(copiedResetTimerRef.current);
    }

    setCopiedRoomCode(code);
    copiedResetTimerRef.current = window.setTimeout(() => {
      setCopiedRoomCode(null);
      copiedResetTimerRef.current = null;
    }, 1200);
  };

  return (
    <section className="relative min-h-screen w-full bg-gray-300 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
      <svg
        className="absolute inset-0 h-full w-full pointer-events-none opacity-20"
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

      <div className="absolute z-20 top-5 right-5">
        <ToggleTheme />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[calc(100vw-4rem)] flex-col px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="max-w-full flex items-center flex-wrap justify-center md:justify-between sm:text-left">
          <div className="flex items-start gap-2">
            <Link
              to="/"
              className="dark:text-gray-300 border backdrop-blur-3xl hover:bg-gray-500  text-gray-800"
            >
              <ArrowUpLeft size={60} />
            </Link>
            <h1 className="text-4xl font-light md:text-6xl">Your Rooms</h1>
          </div>
          <div className="min-w-0">
            {selectedRoom ? (
              <div className="mt-2 w-sm">
                <RoomCard
                  room={selectedRoom}
                  selected={true}
                  copied={copiedRoomCode === selectedRoom.unique_string}
                  onCopy={(roomCode) => {
                    void copyRoomCode(roomCode);
                  }}
                />
              </div>
            ) : (
              <p className="mt-2 text-sm opacity-75">No room selected yet.</p>
            )}
          </div>
        </div>

        <form
          className="mt-6 grid gap-3 border border-gray-500/40 bg-gray-200/70 p-3 text-sm shadow-sm dark:bg-gray-700/70 sm:grid-cols-[minmax(0,1fr)_180px_auto]"
          onSubmit={handleSearchSubmit}
        >
          <label className="flex items-center gap-2 border border-gray-500/40 bg-gray-300/70 px-3 py-2 dark:bg-gray-800/70 sm:col-span-1">
            <Search size={16} className="shrink-0 opacity-70" />
            <input
              className="w-full bg-transparent outline-none placeholder:opacity-60"
              placeholder="Search by unique string"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </label>

          <label className="flex items-center gap-2 border border-gray-500/40 bg-gray-300/70 px-3 py-2 dark:bg-gray-800/70">
            <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide opacity-70">
              Sort by
            </span>
            <select
              className="w-full bg-transparent outline-none"
              value={sortOrder}
              onChange={(event) => {
                setPage(1);
                setSortOrder(event.target.value as "asc" | "desc");
              }}
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </label>

          <button
            className="inline-flex items-center justify-center gap-2 bg-gray-800 px-6 py-2 font-bold text-gray-300 backdrop-blur-3xl hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-300 dark:text-gray-800"
            disabled={isLoading}
            type="submit"
          >
            Search
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm opacity-75">
            Page {page} of {totalPages}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!hasPrev || isLoading}
              className="inline-flex items-center gap-2 border border-gray-500/50 bg-gray-200/70 px-4 py-2 text-sm font-semibold shadow-sm transition hover:bg-gray-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700/70"
              onClick={() =>
                setPage((currentPage) => Math.max(1, currentPage - 1))
              }
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            {buildPageItems(page, totalPages).map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-sm opacity-75"
                >
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  disabled={isLoading || item === page}
                  className={`min-w-10 border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    item === page
                      ? "border-gray-800 bg-gray-800 text-gray-100 dark:border-gray-300 dark:bg-gray-300 dark:text-gray-800"
                      : "border-gray-500/50 bg-gray-200/70 hover:bg-gray-500/20 dark:bg-gray-700/70"
                  }`}
                  onClick={() => setPage(item)}
                >
                  {item}
                </button>
              ),
            )}
            <button
              type="button"
              disabled={!hasNext || isLoading}
              className="inline-flex items-center gap-2 border border-gray-500/50 bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-300 shadow-sm transition hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-300 dark:text-gray-800"
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {isLoading ? (
            <div className="col-span-full border border-gray-500/50 bg-gray-200/70 px-4 py-6 text-sm opacity-80 dark:bg-gray-700/70">
              Loading rooms...
            </div>
          ) : rooms.length === 0 ? (
            <div className="col-span-full border border-gray-500/50 bg-gray-200/70 px-4 py-6 text-sm opacity-80 dark:bg-gray-700/70">
              No rooms found.
            </div>
          ) : (
            rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                selected={selectedRoom?.id === room.id}
                copied={copiedRoomCode === room.unique_string}
                onSelect={setSelectedRoom}
                onCopy={(roomCode) => {
                  void copyRoomCode(roomCode);
                }}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default Rooms;
