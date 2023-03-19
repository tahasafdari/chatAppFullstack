import { useEffect, useState, useContext } from "react";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import Logo from "./Logo";
import Avatar from "./Avatar";
import { UserContext } from "./UserContext";

export default function Chat() {
  const [websocket, setWebsocket] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { username, id } = useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState(null);

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

  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 ">
        <Logo />
        {Object.keys(onlinePeopleExclOurUser).map((p) => (
          <div
            key={p}
            onClick={() => setSelectedUserId(p)}
            id="onlinePeople"
            className={
              "border-b border-gray-100 flex items-center gap-2 cursor-pointer " +
              (selectedUserId === p ? "bg-blue-50" : "")
            }
          >
            {p === selectedUserId && (
              <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
            )}
            <div className="flex gap-2 py-2 pl-4 items-center">
              <Avatar username={onlinePeople[p]} userId={p} />
              <span className="text-gray-700">{onlinePeople[p]}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col bg-blue-50 w-2/3 p-2">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex h-full flex-grow items-center justify-center">
              <div className="text-gray-300">&larr; Select a person </div>
            </div>
          )}
        </div>
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
