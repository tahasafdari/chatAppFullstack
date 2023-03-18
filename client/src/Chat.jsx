import { useEffect, useState } from "react";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import QuestionAnswerRoundedIcon from "@mui/icons-material/QuestionAnswerRounded";
import Avatar from "./Avatar";
export default function Chat() {
  const [websocket, setWebsocket] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");
    setWebsocket(ws);
    ws.addEventListener("message", handleMessage);
  }, []);

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }
  function handleMessage(event) {
    const messageData = JSON.parse(event.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    }
  }
  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 pl-4 pt-4">
        <div className="text-blue-600 font-bold flex gap-3 mb-4">
          <QuestionAnswerRoundedIcon className="text-gray-700" />
          CHAT APP
        </div>
        {Object.keys(onlinePeople).map((p) => (
          <div id="onlinePeople" className="border-b border-gray-100 py-2">
            <div className="w-4 h-4 bg-red-200"></div>
            <Avatar />
            {onlinePeople[p]}
          </div>
        ))}
      </div>
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
