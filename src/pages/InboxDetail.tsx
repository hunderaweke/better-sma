import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Edit3, Home, Save, Settings, Share2, VolumeX } from "lucide-react";
import ToggleTheme from "../components/ToggleTheme";
import Message from "../components/Message";

type InboxMessage = {
  id: string;
  from: string;
  body: string;
  identity: string;
  time: string;
};

type Identity = {
  id: string;
  name: string;
  uniqueString: string;
};

const messages: InboxMessage[] = [
  {
    id: "m-1",
    from: "Anon A",
    body: "Hey, just checking in to see how you are doing. Let me know if you have a minute to chat today.",
    identity: "5GaMdgTyOYe",
    time: "2d",
  },
  {
    id: "m-1",
    from: "Anon A",
    body: "Hey, just checking in to see how you are doing. Let me know if you have a minute to chat today.",
    identity: "5GaMdgTyOYe",
    time: "2d",
  },
  {
    id: "m-1",
    from: "Anon A",
    body: "Hey, just checking in to see how you are doing. Let me know if you have a minute to chat today.",
    identity: "5GaMdgTyOYe",
    time: "2d",
  },
  {
    id: "m-1",
    from: "Anon A",
    body: "Hey, just checking in to see how you are doing. Let me know if you have a minute to chat today.",
    identity: "5GaMdgTyOYe",
    time: "2d",
  },
  {
    id: "m-1",
    from: "Anon A",
    body: "Hey, just checking in to see how you are doing. Let me know if you have a minute to chat today.",
    identity: "5GaMdgTyOYe",
    time: "2d",
  },
  {
    id: "m-1",
    from: "Anon A",
    body: "Hey, just checking in to see how you are doing. Let me know if you have a minute to chat today.",
    identity: "5GaMdgTyOYe",
    time: "2d",
  },
  {
    id: "m-1",
    from: "Anon A",
    body: "Hey, just checking in to see how you are doing. Let me know if you have a minute to chat today.",
    identity: "5GaMdgTyOYe",
    time: "2d",
  },
  {
    id: "m-1",
    from: "Anon A",
    body: "Hey, just checking in to see how you are doing. Let me know if you have a minute to chat today.",
    identity: "5GaMdgTyOYe",
    time: "2d",
  },
  {
    id: "m-1",
    from: "Anon A",
    body: "Hey, just checking in to see how you are doing. Let me know if you have a minute to chat today.",
    identity: "5GaMdgTyOYe",
    time: "2d",
  },
  {
    id: "m-1",
    from: "Anon A",
    body: "Hey, just checking in to see how you are doing. Let me know if you have a minute to chat today.",
    identity: "5GaMdgTyOYe",
    time: "2d",
  },
  {
    id: "m-2",
    from: "Work Contact",
    body: "Project update attached. Please review the milestones and confirm the timelines. Happy to adjust if needed.",
    time: "2d",
    identity: "tGasMSTyOYU",
  },
  {
    id: "m-3",
    from: "Anon B",
    body: "Can we talk later today? I have a quick question about the thing we discussed last week.",
    identity: "x1Ysdz9Kpq",
    time: "2d",
  },
  {
    identity: "x1Ysdz9Kpq",
    body: "A string indicating the image format. The default type is image/png; that type is also used if the given type isn't supported. When supplied, the toCanvas function will return a blob matching the given image type and quality.",
    time: "2d",
    id: "m-3",
    from: "Anon B",
  },
];

const identities: Identity[] = [
  { id: "id-1", name: "Primary", uniqueString: "5GaMdgTyOYe" },
  { id: "id-2", name: "Work", uniqueString: "tGasMSTyOYU" },
  { id: "id-3", name: "Anon", uniqueString: "x1Ysdz9Kpq" },
];

function InboxDetail() {
  const { identity } = useParams<{ identity: string }>();
  // const navigate = useNavigate();
  const selected = identities.find((i) => i.uniqueString === identity);
  const resolved = selected ?? identities[0];

  const [isEditingRoomUniqueString, setIsEditingRoomUniqueString] =
    useState(false);
  const [roomUniqueString, setRoomUniqueString] = useState(
    resolved.uniqueString,
  );
  const [roomUniqueStringDraft, setRoomUniqueStringDraft] = useState(
    resolved.uniqueString,
  );

  if (!identity || !selected) {
    return <Navigate to={`/in/${resolved.uniqueString}`} replace />;
  }

  const filtered = messages.filter((m) => m.identity === resolved.uniqueString);

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

      <div className="absolute z-20 -top-4 md:top-0 right-2">
        <ToggleTheme />
      </div>
      <div className="relative z-3 mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid relative w-full gap-4 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
          <div className="sticky top-10 z-20 self-start flex justify-center md:relative">
            <div className="w-full border border-gray-500/40 bg-gray-200 p-4 shadow-sm dark:bg-gray-700/70 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/"
                  className="inline-flex gap-2 items-center bg-gray-800 text-gray-200 dark:bg-gray-300 dark:text-gray-800 px-3 py-2 text-xs font-semibold tracking-wide shadow-sm"
                >
                  <Home size={16} />
                  Home
                </Link>
                <button className="inline-flex gap-2 items-center bg-gray-800 text-gray-200 dark:bg-gray-300 dark:text-gray-800 px-4 py-2 text-xs font-semibold tracking-wide shadow-sm">
                  New Room
                </button>
              </div>
              <div className="border flex flex-col border-gray-500/50 bg-gray-100/70 p-2 text-left gap-3 dark:bg-gray-800/70">
                <div className="flex flex-col gap-4 sm:flex-row md:items-center md:gap-5 md:text-left">
                  <div className="font-bold text-2xl sm:shrink-0">
                    <span>Room</span>
                  </div>

                  <div className="flex w-full items-stretch gap-2">
                    <span className="inline-flex w-full min-w-0">
                      {isEditingRoomUniqueString ? (
                        <input
                          className="w-full border border-gray-500/60 bg-gray-200/70 px-2 py-2 text-gray-800 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500/40 dark:bg-gray-700/70 dark:text-gray-100"
                          aria-label="Room unique string"
                          value={roomUniqueStringDraft}
                          onChange={(e) =>
                            setRoomUniqueStringDraft(e.target.value)
                          }
                        />
                      ) : (
                        <span className="w-full border border-gray-500/60 bg-gray-200/70 p-2 text-gray-800 dark:bg-gray-700/70 dark:text-gray-100">
                          {roomUniqueString}
                        </span>
                      )}
                    </span>
                    <button
                      className="inline-flex shrink-0 items-center justify-center border border-gray-500/60 bg-gray-200/70 px-3 py-2 text-gray-800 shadow-sm dark:bg-gray-700/70 dark:text-gray-100"
                      aria-label={
                        isEditingRoomUniqueString
                          ? "Save room unique string"
                          : "Edit room unique string"
                      }
                      type="button"
                      onClick={() => {
                        if (isEditingRoomUniqueString) {
                          const next = roomUniqueStringDraft.trim();
                          setRoomUniqueString(
                            next.length > 0 ? next : roomUniqueString,
                          );
                          setRoomUniqueStringDraft(
                            next.length > 0 ? next : roomUniqueString,
                          );
                          setIsEditingRoomUniqueString(false);
                          return;
                        }

                        setRoomUniqueStringDraft(roomUniqueString);
                        setIsEditingRoomUniqueString(true);
                      }}
                    >
                      {isEditingRoomUniqueString ? (
                        <Save size={16} />
                      ) : (
                        <Edit3 size={16} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 min-h-[60px] md:min-h-[140px] sm:grid-cols-2">
                  <button
                    className="border border-gray-600/60 bg-gray-800 text-gray-200 dark:bg-gray-300 dark:text-gray-800 flex items-center justify-center gap-3 md:p-4 col-span-1 md:col-span-2"
                    type="button"
                    aria-label="Share"
                  >
                    <Share2 size={22} />
                    <span className="hidden md:block">Copy link</span>
                  </button>
                  <button
                    className="border border-gray-600/60 bg-gray-800 text-gray-200 dark:bg-gray-300 dark:text-gray-800 flex items-center justify-center gap-3 p-2 md:p-4"
                    type="button"
                    aria-label="Cog"
                  >
                    <Settings size={22} />
                    <span className="hidden md:block">Settings</span>
                  </button>
                  <button
                    className="border border-gray-600/60 bg-gray-800 text-gray-200 dark:bg-gray-300 dark:text-gray-800 flex items-center justify-center gap-3 p-2 md:p-4"
                    type="button"
                    aria-label="Mute"
                  >
                    <VolumeX size={22} />
                    <span className="hidden md:block">Mute</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full min-w-0">
            <div className="mt-0 max-h-screen overflow-y-auto no-scrollbar border border-gray-500/40 bg-gray-200/70 p-4 shadow-sm dark:bg-gray-700/70 sm:p-6 lg:max-h-[calc(100vh-4rem)]">
              {filtered.length > 0 ? (
                filtered.map((m) => {
                  return (
                    <Message
                      key={m.id}
                      identity={m.identity}
                      text={m.body}
                      time={m.time}
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
      </div>
    </section>
  );
}

export default InboxDetail;
