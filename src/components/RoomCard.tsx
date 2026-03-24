import { Check, Edit3, Save, Share2, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import getVibrantColor from "../utils/color";
import type { Room } from "../types";

type Props = {
  room: Room;
  selected: boolean;
  copied: boolean;
  onSelect?: (room: Room) => void;
  onRename?: (room: Room, nextName: string) => Promise<void> | void;
  onCopy: (roomCode: string) => void;
  onDelete?: (room: Room) => void;
};

function RoomCard({
  room,
  selected,
  copied,
  onRename,
  onCopy,
  onDelete,
  onSelect,
}: Props) {
  const color = getVibrantColor(room.unique_string);
  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(room.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = () => {
    onSelect?.(room);
  };

  useEffect(() => {
    if (!isEditing) {
      setNameDraft(room.name || "");
      return;
    }

    queueMicrotask(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [isEditing, room.name]);

  const startEditing = () => {
    if (!onRename) {
      return;
    }

    setNameDraft(room.name || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setNameDraft(room.name || "");
    setIsEditing(false);
  };

  const saveName = async () => {
    if (!onRename) {
      return;
    }

    const nextName = nameDraft.trim();

    if (!nextName) {
      return;
    }

    setIsSaving(true);

    try {
      await onRename(room, nextName);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`flex h-full min-w-0 w-full max-w-full cursor-pointer flex-col bg-gray-200/70 px-4 py-4 text-left shadow-sm transition hover:bg-gray-200 dark:bg-gray-600/70 dark:hover:bg-gray-600 sm:px-5 ${
        selected ? "ring-2 ring-green-600" : "border-gray-500/50"
      }`}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleSelect();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2 items-start justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="h-5 w-5 shrink-0 border border-gray-500/50"
              style={{ backgroundColor: color }}
            />
            {isEditing ? (
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <input
                  ref={inputRef}
                  className="min-w-0 flex-1 border border-gray-500/60 bg-gray-300/80 px-3 py-2 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-gray-500/40 dark:bg-gray-800/70 dark:text-gray-100"
                  aria-label="Room name"
                  value={nameDraft}
                  onChange={(event) => setNameDraft(event.target.value)}
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void saveName();
                    }

                    if (event.key === "Escape") {
                      event.preventDefault();
                      cancelEditing();
                    }
                  }}
                />
                <button
                  className="inline-flex shrink-0 items-center justify-center border border-gray-800 px-3 py-2 text-sm font-bold text-gray-800 backdrop-blur-3xl hover:bg-gray-700 hover:text-gray-100 dark:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-500 dark:hover:text-gray-100"
                  aria-label="Save room name"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void saveName();
                  }}
                  disabled={isSaving}
                >
                  <Save size={16} />
                </button>
                <button
                  className="inline-flex shrink-0 items-center justify-center border border-gray-500/60 px-3 py-2 text-sm font-bold text-gray-700 backdrop-blur-3xl hover:bg-gray-500/20 dark:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-500/20"
                  aria-label="Cancel room edit"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    cancelEditing();
                  }}
                  disabled={isSaving}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold opacity-85 sm:text-base">
                  {room.name || room.unique_string}
                </span>
                <span className="truncate text-[11px] opacity-65 sm:text-xs">
                  {room.unique_string}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-75">
            <span>
              <span className="font-bold">Created:</span>{" "}
              {new Date(room.created_at).toLocaleDateString()}
            </span>
            <span>
              <span className="font-bold">Msgs:</span> {room.messages_cnt ?? 0}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onRename && !isEditing && (
            <button
              className="h-full shrink-0 border border-gray-800 px-3 py-3 text-sm font-bold text-gray-800 backdrop-blur-3xl hover:bg-gray-700 hover:text-gray-100 dark:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-500 dark:hover:text-gray-100"
              aria-label="Edit room name"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                startEditing();
              }}
            >
              <Edit3 size={16} />
            </button>
          )}
          <button
            className="h-full shrink-0 border border-gray-800 px-3 py-3 text-sm font-bold text-gray-800 backdrop-blur-3xl hover:bg-red-700 hover:text-gray-100 dark:border-gray-300 dark:text-gray-300 dark:hover:bg-red-500 dark:hover:text-gray-100"
            aria-label="Delete room"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.(room);
            }}
          >
            <Trash2 size={16} />
          </button>
          <button
            className="h-full shrink-0 cursor-pointer bg-gray-800 px-3 py-2 text-sm font-bold text-gray-300 backdrop-blur-3xl transition hover:bg-gray-500 dark:bg-gray-300 dark:text-gray-800"
            onClick={(event) => {
              event.stopPropagation();
              onCopy(room.unique_string);
            }}
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

export default RoomCard;
