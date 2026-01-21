import IdentityTag from "./LoadedIdentity";
interface MessageProps {
  identity: string;
  text: string;
  time: string;
}
export default function Message(props: MessageProps) {
  return (
    <div className="relative text-left">
      <div className="absolute -top-3 -left-5">
        <IdentityTag uniqueString={props.identity} />
      </div>
      <div className="border p-3 flex">
        <p>{props.text}</p>
        <p className="flex items-end text-xs">{props.time}</p>
      </div>
    </div>
  );
}
