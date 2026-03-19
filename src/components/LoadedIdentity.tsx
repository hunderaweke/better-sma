import { useMemo } from "react";
import getVibrantColor from "../utils/color";
import type { IdentityTagProps } from "../types";

function IdentityTag(props: IdentityTagProps) {
  const color = useMemo(
    () => getVibrantColor(props.uniqueString),
    [props.uniqueString],
  );
  return (
    <div className="bg-gray-300 dark:bg-gray-700 border text-sm w-fit border-gray-500 flex">
      <div style={{ backgroundColor: color }} className="w-5 h-5"></div>
      <div className="px-2">{props.uniqueString}</div>
    </div>
  );
}

export default IdentityTag;
