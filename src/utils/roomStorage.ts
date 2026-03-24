import type { Room } from "../types";

const SELECTED_ROOM_STORAGE_KEY = "better-sma:selected-room";

export function readSelectedRoomFromStorage(): Room | null {
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

export function saveSelectedRoomToStorage(room: Room) {
  localStorage.setItem(SELECTED_ROOM_STORAGE_KEY, JSON.stringify(room));
}

export function clearSelectedRoomFromStorage() {
  localStorage.removeItem(SELECTED_ROOM_STORAGE_KEY);
}
