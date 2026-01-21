import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Inbox from "./pages/Inbox";
import Identities from "./pages/Identities";
import InboxDetail from "./pages/InboxDetail";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/in", element: <Inbox /> },
  { path: "/in/:identity", element: <InboxDetail /> },
  { path: "/id", element: <Identities /> },
  { path: "*", element: <NotFound /> },
]);
