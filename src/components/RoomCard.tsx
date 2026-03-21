import { Check, Share2, LucideInbox } from "lucide-react";
import { Link } from "react-router-dom";
import getVibrantColor from "../utils/color";
import type { Room } from "../types";

type Props = {
  room: Room;
  selected: boolean;
  copied: boolean;
  onSelect?: (room: Room) => void;
  onCopy: (roomCode: string) => void;
};

export default function RoomCard({ room, selected, copied, onCopy }: Props) {
  const color = getVibrantColor(room.unique_string);

  return (
    <div
      className={`flex h-full min-w-0 max-w-md flex-col bg-gray-200/70 px-4 py-4 text-left shadow-sm dark:bg-gray-600/70 sm:px-5 ${
        selected ? "ring-2 ring-green-600" : "border-gray-500/50"
      }`}
    >
      <div className="flex justify-between">
        <div className="flex flex-col gap-1 items-start justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="h-5 w-5 shrink-0 border border-gray-500/50"
              style={{ backgroundColor: color }}
            />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm opacity-70 sm:text-base">
                {room.unique_string}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-75">
            <span>
              <span className="font-bold">Created:</span>{" "}
              {new Date(room.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <Link
            to={`/in/${room.unique_string}`}
            className="h-full shrink-0 border border-gray-800 px-3 py-3 text-sm font-bold text-gray-800 backdrop-blur-3xl hover:bg-gray-800 hover:text-gray-300 dark:hover:bg-gray-300 dark:hover:text-gray-800 dark:border-gray-300 dark:text-gray-300"
            aria-label="Open room inbox"
          >
            <LucideInbox size={16} />
          </Link>
          <button
            className="h-full shrink-0 cursor-pointer bg-gray-800 px-3 py-2 text-sm font-bold text-gray-300 backdrop-blur-3xl transition hover:bg-gray-500 dark:bg-gray-300 dark:text-gray-800"
            onClick={() => onCopy(room.unique_string)}
            aria-live="polite"
            aria-label={copied ? "Copied room link" : "Copy room link"}
            type="button"
          >
            {copied ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <Share2 size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
