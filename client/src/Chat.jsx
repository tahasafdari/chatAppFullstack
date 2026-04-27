import { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import Logo from "./Logo";
import Avatar from "./avatar";
import { UserContext } from "./UserContext";

export default function Chat() {
  const [websocket, setWebsocket] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { id } = useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:4000";
    const ws = new WebSocket(wsUrl);
    setWebsocket(ws);
    ws.addEventListener("message", handleMessage);
    return () => ws.close();
  }, []);

  useEffect(() => {
    axios.get("/people").then((res) => {
      const offline = {};
      res.data
        .filter((p) => p._id !== id)
        .filter((p) => !Object.keys(onlinePeople).includes(p._id))
        .forEach((p) => {
          offline[p._id] = p.username;
        });
      setOfflinePeople(offline);
    });
  }, [onlinePeople, id]);

  useEffect(() => {
    if (selectedUserId) {
      axios.get("/messages/" + selectedUserId).then((res) => {
        setMessages(res.data);
      });
    }
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      if (userId) people[userId] = username;
    });
    setOnlinePeople(people);
  }

  function handleMessage(event) {
    const messageData = JSON.parse(event.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      setMessages((prev) => [...prev, messageData]);
    }
  }

  function sendMessage(ev) {
    ev.preventDefault();
    if (!newMessageText.trim() || !selectedUserId || !websocket) return;
    websocket.send(
      JSON.stringify({ recipient: selectedUserId, text: newMessageText })
    );
    setMessages((prev) => [
      ...prev,
      {
        text: newMessageText,
        sender: id,
        recipient: selectedUserId,
        _id: "local-" + Date.now(),
      },
    ]);
    setNewMessageText("");
  }

  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 overflow-y-auto">
        <Logo />
        {Object.keys(onlinePeopleExclOurUser).map((p) => (
          <ContactRow
            key={p}
            userId={p}
            username={onlinePeopleExclOurUser[p]}
            online={true}
            selected={p === selectedUserId}
            onClick={() => setSelectedUserId(p)}
          />
        ))}
        {Object.keys(offlinePeople).map((p) => (
          <ContactRow
            key={p}
            userId={p}
            username={offlinePeople[p]}
            online={false}
            selected={p === selectedUserId}
            onClick={() => setSelectedUserId(p)}
          />
        ))}
      </div>
      <div className="flex flex-col bg-blue-50 w-2/3 p-2">
        <div className="flex-grow overflow-y-auto">
          {!selectedUserId && (
            <div className="flex h-full flex-grow items-center justify-center">
              <div className="text-gray-300">&larr; Select a person </div>
            </div>
          )}
          {selectedUserId && (
            <div className="flex flex-col gap-2 p-2">
              {messages.map((m) => (
                <div
                  key={m._id}
                  className={
                    "max-w-[70%] p-2 rounded-md " +
                    (m.sender === id
                      ? "bg-blue-500 text-white self-end"
                      : "bg-white text-gray-700 self-start")
                  }
                >
                  {m.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        {selectedUserId && (
          <form onSubmit={sendMessage} className="flex gap-2 rounded-sm">
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              className="bg-white border p-2 flex-grow rounded-sm"
              placeholder="Type your message ..."
            />
            <button
              type="submit"
              className="bg-blue-500 p-2 text-white rounded-sm"
            >
              <SendRoundedIcon />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ContactRow({ userId, username, online, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={
        "border-b border-gray-100 flex items-center gap-2 cursor-pointer " +
        (selected ? "bg-blue-50" : "")
      }
    >
      {selected && <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>}
      <div className="flex gap-2 py-2 pl-4 items-center">
        <div className="relative">
          <Avatar username={username} userId={userId} />
          <span
            className={
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white " +
              (online ? "bg-green-400" : "bg-gray-300")
            }
          ></span>
        </div>
        <span className="text-gray-700">{username}</span>
      </div>
    </div>
  );
}
