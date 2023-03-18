import { BiSend } from "react-icons/bi";
import { useEffect, useState } from "react";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

export default function Chat() {
  const [websocket, setWebsocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");
    setWebsocket(ws);
    ws.addEventListener("message", handleMessage);
  }, []);

  function handleMessage(event) {
    console.log("new message", event);
  }
  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3">contacts</div>
      <div className="flex flex-col bg-blue-50 w-2/3 p-2">
        <div className="flex-grow">messages with selected person!</div>
        <div className="flex gap-2 rounded-sm">
          <input
            type={"text"}
            className="bg-white border p-2 flex-grow rounded-sm"
            placeholder="Type your message ..."
          />
          <button className="bg-blue-500 p-2 text-white rounded-sm ">
            <SendRoundedIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
