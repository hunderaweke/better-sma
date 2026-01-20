import getVibrantColor from "../utils/color";

interface IdentityProps {
  uniqueString: string;
}

function LoadedIdentity(props: IdentityProps) {
  const color = getVibrantColor(props.uniqueString);
  return (
    <div className="bg-gray-300 border text-sm w-fit border-gray-500 flex">
      <div style={{ backgroundColor: color }} className="w-5"></div>
      <div className="px-2">{props.uniqueString}</div>
    </div>
  );
}

export default LoadedIdentity;
