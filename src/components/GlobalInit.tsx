import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import api from "../utils/api";
import NotificationCenter from "./NotificationCenter";
import {
  clearStoredIdentity,
  createStoredIdentity,
  isIdentityExpired,
  readStoredIdentity,
} from "../utils/identity";
import {
  clearSelectedRoomFromStorage,
  readSelectedRoomFromStorage,
  saveSelectedRoomToStorage,
} from "../utils/roomStorage";
import type { Room } from "../types";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
const authStatusUrl =
  import.meta.env.VITE_AUTH_STATUS_URL ?? `${apiBaseUrl}/api/auth/me`;
let initializationStarted = false;

export function GlobalInit() {
  useEffect(() => {
    if (initializationStarted) {
      return;
    }

    initializationStarted = true;

    async function init() {
      let isLoggedIn = false;

      try {
        const authResponse = await fetch(authStatusUrl, {
          credentials: "include",
        });

        isLoggedIn = authResponse.ok;
      } catch {
        isLoggedIn = false;
      }

      if (!isLoggedIn) {
        return;
      }

      const storedIdentity = readStoredIdentity();

      if (storedIdentity && isIdentityExpired(storedIdentity)) {
        clearStoredIdentity();
      }

      const activeIdentity =
        storedIdentity && !isIdentityExpired(storedIdentity)
          ? storedIdentity
          : await createStoredIdentity();

      const selectedRoom = readSelectedRoomFromStorage();

      if (selectedRoom) {
        return;
      }

      const identity = activeIdentity.unique_string;

      try {
        const roomsRes = await api.get("/api/rooms", {
          params: {
            page: 1,
            page_size: 1,
            sort_by: "created_at",
            sort_order: "desc",
          },
        });
        const payloadData = roomsRes.data?.data;
        const rooms = Array.isArray(payloadData) ? payloadData : [];
        const ownedRooms = identity
          ? rooms.filter(
              (room: Room) =>
                room.owner_id === identity || room.unique_string === identity,
            )
          : [];

        const nextDefaultRoom = ownedRooms[0] ?? null;

        if (nextDefaultRoom) {
          saveSelectedRoomToStorage(nextDefaultRoom);
          return;
        }

        const newRoomResponse = await api.post<Room>("/api/rooms", {});

        if (newRoomResponse.data?.unique_string) {
          saveSelectedRoomToStorage(newRoomResponse.data);
          return;
        }

        clearSelectedRoomFromStorage();
      } catch (e) {
        console.error("Failed to fetch rooms", e);
      }
    }
    void init();
  }, []);

  return (
    <>
      <NotificationCenter />
      <Outlet />
    </>
  );
}
