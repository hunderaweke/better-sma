import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import api from "../utils/api";
import NotificationCenter from "./NotificationCenter";
import {
  clearStoredIdentity,
  isIdentityExpired,
  readStoredIdentity,
} from "../utils/identity";
import {
  clearSelectedRoomFromStorage,
  saveSelectedRoomToStorage,
  readSelectedRoomFromStorage,
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
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (token) {
        const nextToken = token.trim();

        if (nextToken) {
          localStorage.setItem("access_token", nextToken);

          params.delete("token");
          const nextSearch = params.toString();

          window.history.replaceState(
            null,
            "",
            `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`,
          );
        }
      }

      let isLoggedIn = false;

      try {
        await api.get(authStatusUrl);
        isLoggedIn = true;
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
      try {
        const rooms: Room[] = await api
          .get("/api/rooms", {
            params: {
              page: 1,
              page_size: 1,
              sort_by: "created_at",
              sort_order: "desc",
            },
          })
          .then((res) => res.data?.data);

        const storedRoom = readSelectedRoomFromStorage();
        if (storedRoom) {
          return;
        }

        const nextDefaultRoom = rooms[0] ?? null;

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
