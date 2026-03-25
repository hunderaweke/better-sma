import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowUpLeft, Plus } from "lucide-react";
import ToggleTheme from "../components/ToggleTheme";
import RoomCard from "../components/RoomCard";
import api from "../utils/api";
import type { Room } from "../types";
import { notifyError, notifyInfo, notifySuccess } from "../utils/notifications";
import { isIdentityExpired, readStoredIdentity } from "../utils/identity";
import {
  clearSelectedRoomFromStorage,
  readSelectedRoomFromStorage,
  saveSelectedRoomToStorage,
} from "../utils/roomStorage";

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
  const [sortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedRoomCode, setCopiedRoomCode] = useState<string | null>(null);
  const [pendingDeleteRoom, setPendingDeleteRoom] = useState<Room | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState<boolean>(false);
  const [roomsRefreshKey, setRoomsRefreshKey] = useState<number>(0);
  const copiedResetTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();

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
        console.log("Fetched rooms payload", payload.data);
        const nextRooms = Array.isArray(payload.data) ? payload.data : [];

        setRooms(nextRooms);
        setSelectedRoom((currentSelectedRoom) => {
          if (nextRooms.length === 0) {
            return currentSelectedRoom;
          }

          const freshSelectedRoom = currentSelectedRoom
            ? nextRooms.find((room) => room.id === currentSelectedRoom.id)
            : null;

          return freshSelectedRoom ?? nextRooms[0] ?? null;
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
  }, [page, sortOrder, searchTerm, roomsRefreshKey]);

  useEffect(() => {
    if (selectedRoom) {
      saveSelectedRoomToStorage(selectedRoom);
      return;
    }

    clearSelectedRoomFromStorage();
  }, [selectedRoom]);

  useEffect(() => {
    return () => {
      if (copiedResetTimerRef.current) {
        window.clearTimeout(copiedResetTimerRef.current);
      }
    };
  }, []);

  // const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   setPage(1);
  //   setSearchTerm(searchInput.trim());
  // };

  const createRoom = async () => {
    const storedIdentity = readStoredIdentity();

    if (!storedIdentity || isIdentityExpired(storedIdentity)) {
      return;
    }

    setIsCreatingRoom(true);

    try {
      const response = await api.post<Room>("/api/rooms", {});
      const createdRoom = response.data;

      if (!createdRoom?.unique_string) {
        return;
      }

      setSelectedRoom(createdRoom);
      setPage(1);
      setSearchTerm("");
      setRoomsRefreshKey((currentRefreshKey) => currentRefreshKey + 1);
      notifySuccess(
        "Room created",
        `${createdRoom.name || createdRoom.unique_string} is ready.`,
      );
    } catch (error) {
      console.error("Failed to create room", error);
      notifyError("Create failed", "We could not create that room.");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const copyRoomCode = async (code: string) => {
    try {
      const link = `${window.location.origin}/se/${code}`;
      await navigator.clipboard.writeText(link);

      if (copiedResetTimerRef.current) {
        window.clearTimeout(copiedResetTimerRef.current);
      }

      setCopiedRoomCode(code);
      copiedResetTimerRef.current = window.setTimeout(() => {
        setCopiedRoomCode(null);
        copiedResetTimerRef.current = null;
      }, 1200);

      notifySuccess(
        "Link copied",
        "The room send link was copied to your clipboard.",
      );
    } catch (error) {
      console.error("Failed to copy room link", error);
      notifyError("Copy failed", "We could not copy the room link.");
    }
  };

  const openRoomInbox = (room: Room) => {
    setSelectedRoom(room);
    notifyInfo("Opening inbox", room.name || room.unique_string);
    navigate(`/in/${room.unique_string}`);
  };

  const updateRoomName = async (room: Room, nextName: string) => {
    const trimmedName = nextName.trim();

    if (!trimmedName) {
      notifyError("Name required", "Room names cannot be empty.");
      return;
    }

    try {
      await api.put(
        `/api/rooms/${encodeURIComponent(room.unique_string)}/name`,
        { name: trimmedName },
      );

      setRooms((currentRooms) =>
        currentRooms.map((item) =>
          item.id === room.id ? { ...item, name: trimmedName } : item,
        ),
      );

      setSelectedRoom((currentSelectedRoom) =>
        currentSelectedRoom
          ? currentSelectedRoom.id === room.id
            ? { ...currentSelectedRoom, name: trimmedName }
            : currentSelectedRoom
          : currentSelectedRoom,
      );

      notifySuccess("Room name updated", `Renamed to ${trimmedName}.`);
    } catch (error) {
      console.error("Failed to update room name", error);
      notifyError("Rename failed", "We could not update the room name.");
    }
  };

  const requestDeleteRoom = (room: Room) => {
    setPendingDeleteRoom(room);
  };

  const confirmDeleteRoom = async () => {
    if (!pendingDeleteRoom) {
      return;
    }

    const roomToDelete = pendingDeleteRoom;
    setPendingDeleteRoom(null);

    try {
      await api.delete(
        `/api/rooms/${encodeURIComponent(roomToDelete.unique_string)}`,
      );

      const nextRooms = rooms.filter((room) => room.id !== roomToDelete.id);
      setRooms(nextRooms);

      setSelectedRoom((currentSelectedRoom) => {
        if (currentSelectedRoom?.id !== roomToDelete.id) {
          return currentSelectedRoom;
        }

        const nextRoom = nextRooms[0] ?? null;

        if (nextRoom) {
          saveSelectedRoomToStorage(nextRoom);
          return nextRoom;
        }

        clearSelectedRoomFromStorage();
        return null;
      });

      notifySuccess(
        "Room deleted",
        `${roomToDelete.name || roomToDelete.unique_string} was removed.`,
      );
    } catch (error) {
      console.error("Failed to delete room", error);
      notifyError("Delete failed", "We could not delete that room.");
    }
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

      <div className="absolute z-20 top-5 right-3 sm:right-6 md:right-8">
        <ToggleTheme />
      </div>

      <div className="relative z-10 mx-auto flex flex-col px-3 py-6 sm:px-6 lg:px-8 lg:py-14">
        <div className="mt-8 flex flex-col gap-4 lg:mt-0 md:flex-row md:items-start md:justify-between sm:text-left">
          <div className="flex w-full items-start gap-2">
            <Link
              to="/"
              className="inline-flex h-8 w-8 md:h-12 md:w-12 shrink-0 items-center justify-center border text-gray-800 backdrop-blur-3xl hover:bg-gray-500 dark:text-gray-300"
            >
              <ArrowUpLeft size={20} />
            </Link>
            <div className="w-full flex justify-between">
              <h1 className="text-3xl font-light sm:text-4xl lg:text-5xl">
                Your Rooms
              </h1>
              <button
                type="button"
                onClick={() => {
                  void createRoom();
                }}
                disabled={isCreatingRoom}
                aria-label="Create a new room"
                title="Create a new room"
                className="group inline-flex w-auto items-center justify-center gap-2 border border-gray-500/50 bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-300 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-gray-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-300 dark:text-gray-800 md:text-lg"
              >
                <Plus
                  size={16}
                  className={
                    isCreatingRoom
                      ? "animate-spin"
                      : "transition-transform duration-200 group-hover:rotate-90 group-active:scale-110"
                  }
                />
                <span className="hidden sm:block">
                  {isCreatingRoom ? "Creating..." : "New Room"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* <form
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
        </form> */}

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

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4">
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
                onRename={updateRoomName}
                onCopy={(roomCode: string) => {
                  void copyRoomCode(roomCode);
                }}
                onDelete={(roomToDelete: Room) => {
                  requestDeleteRoom(roomToDelete);
                }}
                onSelect={(roomToOpen: Room) => {
                  openRoomInbox(roomToOpen);
                }}
              />
            ))
          )}
        </div>
      </div>

      {pendingDeleteRoom ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md border border-gray-500/40 bg-gray-200 p-5 text-left shadow-2xl dark:bg-gray-800 dark:text-gray-100">
            <h2 className="text-xl font-semibold">Delete room?</h2>
            <p className="mt-2 text-sm opacity-80">
              {pendingDeleteRoom.name || pendingDeleteRoom.unique_string} will
              be permanently removed. This action cannot be undone.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="border border-gray-500/40 px-4 py-2 text-sm font-semibold hover:bg-gray-500/20"
                onClick={() => setPendingDeleteRoom(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="border border-red-600/50 bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                onClick={() => {
                  void confirmDeleteRoom();
                }}
              >
                Delete room
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Rooms;
