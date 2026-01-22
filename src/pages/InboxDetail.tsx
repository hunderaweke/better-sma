import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Home, User2 } from "lucide-react";
import ToggleTheme from "../components/ToggleTheme";
import Message from "../components/Message";
import IdentityDropdown from "../components/IdentityDropdown";

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
  const navigate = useNavigate();
  const selected = identities.find((i) => i.uniqueString === identity);
  const resolved = selected ?? identities[0];
  if (!identity || !selected) {
    return <Navigate to={`/in/${resolved.uniqueString}`} replace />;
  }

  const filtered = messages.filter((m) => m.identity === resolved.uniqueString);

  return (
    <section className="bg-gray-300 dark:bg-gray-800 dark:text-gray-300 text-center text-gray-800 flex flex-col w-full items-center min-h-screen">
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

      <div className="absolute z-10 top-0 right-2">
        <ToggleTheme />
      </div>

      <div className="relative  p-8 pb-0 w-full max-w-3xl">
        {/* <div className="mt-6 flex justify-center">
          <IdentityDropdown
            identities={identities}
            onSelect={(id) => {
              const next = identities.find((i) => i.id === id);
              if (next) navigate(`/in/${next.uniqueString}`);
            }}
          />
        </div> */}

        <div className="mt-4  overflow-y-scroll no-scrollbar max-h-[75vh]">
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
      <div className="sticky bottom-0 border p-3 w-[85vw] max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-light">Inbox</h1>
        <p className="mt-3 text-sm opacity-80">
          Messages for the selected identity.
        </p>
        <div className="mt-6 flex gap-4 justify-center text-[11px] sm:text-sm flex-wrap">
          <Link
            to="/"
            className="inline-flex gap-3 dark:bg-gray-300 dark:text-gray-800 text-gray-300 bg-gray-800  items-center justify-center py-2 px-6 backdrop-blur-3xl font-bold hover:bg-gray-500"
          >
            <Home size={16} />
            Home
          </Link>
          <Link
            to="/id"
            className="inline-flex gap-3 dark:bg-gray-300 dark:text-gray-800 text-gray-300 bg-gray-800  items-center justify-center py-2 px-6 backdrop-blur-3xl font-bold hover:bg-gray-500"
          >
            <User2 size={16} />
            Identities
          </Link>
          <Link
            to="/in"
            className="inline-flex gap-3 dark:bg-gray-300 dark:text-gray-800 text-gray-300 bg-gray-800  items-center justify-center py-2 px-6 backdrop-blur-3xl font-bold hover:bg-gray-500"
          >
            Inbox
          </Link>
        </div>
      </div>
    </section>
  );
}

export default InboxDetail;
