import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Inbox from "./pages/Inbox";
import Identities from "./pages/Identities";
import Rooms from "./pages/Rooms";
import InboxDetail from "./pages/InboxDetail";
import NotFound from "./pages/NotFound";
import Send from "./pages/Send";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/in", element: <Inbox /> },
  { path: "/in/:identity", element: <InboxDetail /> },
  { path: "/id", element: <Identities /> },
  { path: "/rooms", element: <Rooms /> },
  { path: "/send/:identity", element: <Send /> },
  { path: "*", element: <NotFound /> },
]);
