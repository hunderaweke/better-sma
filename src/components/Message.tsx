import { useRef, useState } from "react";
import { domToPng } from "modern-screenshot";
import IdentityTag from "./LoadedIdentity";
import {
  ClipboardCopyIcon,
  CheckIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface MessageProps {
  identity: string;
  text: string;
  time: string;
}

export default function Message(props: MessageProps) {
  const messageRef = useRef<HTMLDivElement>(null);
  const [copyStatus, setCopyStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const captureAsPng = async () => {
    if (!messageRef.current || copyStatus === "loading") return;
    setCopyStatus("loading");

    const elBg = document.documentElement.classList.contains("dark")
      ? "#1F2937"
      : "#D1D5DB";

    try {
      const dataUrl = await domToPng(messageRef.current, {
        scale: 2,
        quality: 1,
        backgroundColor: elBg,
        filter: (node) => node.nodeName !== "BUTTON",
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);

      setCopyStatus("success");
      setTimeout(() => setCopyStatus("idle"), 1200);
    } catch (error) {
      console.error("capture failed: ", error);
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 1600);
    }
  };

  return (
    <div className="p-3" ref={messageRef}>
      <div className="relative text-left pt-4">
        <div className="absolute top-0 left-0">
          <IdentityTag uniqueString={props.identity} />
        </div>
        <div className="bg-gray-300 dark:bg-gray-700 border mx-3 p-3 flex gap-5">
          <p className="flex-1">{props.text}</p>
          <div className="flex flex-col justify-between items-center gap-2">
            <p className="flex items-end text-xs">{props.time}</p>
            <button
              onClick={captureAsPng}
              className="border disabled:opacity-50"
              disabled={copyStatus === "loading"}
              aria-live="polite"
              aria-label={
                copyStatus === "loading"
                  ? "Copying image"
                  : copyStatus === "success"
                    ? "Copied image"
                    : copyStatus === "error"
                      ? "Copy failed"
                      : "Copy image to clipboard"
              }
            >
              {copyStatus === "loading" && (
                <Loader2 className="p-1 animate-spin" />
              )}
              {copyStatus === "success" && (
                <CheckIcon className="p-1 text-green-500" />
              )}
              {copyStatus === "error" && (
                <AlertCircle className="p-1 text-red-500" />
              )}
              {copyStatus === "idle" && <ClipboardCopyIcon className="p-1" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
