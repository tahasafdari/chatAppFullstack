import { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { BsArrowRight, BsBoxArrowRight, BsBell, BsBellFill } from "react-icons/bs";
import Logo from "./Logo";
import Avatar from "./avatar";
import { UserContext } from "./UserContext";

export default function Chat() {
  const [websocket, setWebsocket] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { id, username: ourUsername, setId, setUsername } = useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState({});
  const [toasts, setToasts] = useState([]);
  const messagesEndRef = useRef(null);
  const idRef = useRef(null);
  const selectedUserIdRef = useRef(null);
  const onlinePeopleRef = useRef({});
  const offlinePeopleRef = useRef({});

  useEffect(() => {
    idRef.current = id;
  }, [id]);

  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  useEffect(() => {
    onlinePeopleRef.current = onlinePeople;
  }, [onlinePeople]);

  useEffect(() => {
    offlinePeopleRef.current = offlinePeople;
  }, [offlinePeople]);

  async function handleLogout() {
    try {
      await axios.post("/logout");
    } catch (e) {}
    websocket?.close();
    setId(null);
    setUsername(null);
  }

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
  }, [messages, selectedUserId]);

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      if (userId) people[userId] = username;
    });
    setOnlinePeople(people);
  }

  function pushToast(toast) {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 4500);
  }

  function dismissToast(toastId) {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }

  function selectContact(contactId) {
    setSelectedUserId(contactId);
    setUnread((prev) => {
      if (!prev[contactId]) return prev;
      const next = { ...prev };
      delete next[contactId];
      return next;
    });
  }

  function handleMessage(event) {
    const messageData = JSON.parse(event.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      if (messageData.sender === idRef.current) return;
      setMessages((prev) => [...prev, messageData]);

      if (messageData.sender !== selectedUserIdRef.current) {
        setUnread((prev) => ({
          ...prev,
          [messageData.sender]: (prev[messageData.sender] || 0) + 1,
        }));
        const senderName =
          onlinePeopleRef.current[messageData.sender] ||
          offlinePeopleRef.current[messageData.sender] ||
          "Someone";
        pushToast({
          id:
            (messageData._id ? String(messageData._id) : "t") +
            "-" +
            Date.now(),
          contactId: messageData.sender,
          senderName,
          text: messageData.text,
        });
      }
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

  const selectedName =
    onlinePeopleExclOurUser[selectedUserId] || offlinePeople[selectedUserId];
  const selectedIsOnline = !!onlinePeopleExclOurUser[selectedUserId];

  const visibleMessages = messages.filter(
    (m) =>
      (m.sender === id && m.recipient === selectedUserId) ||
      (m.sender === selectedUserId && m.recipient === id)
  );

  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

  return (
    <div className="flex h-screen bg-ink-800 text-cream-50">
      {/* Sidebar */}
      <aside className="w-[320px] flex flex-col border-r border-ink-700">
        <Logo />

        <div className="px-6 mt-2 mb-3 text-[10px] tracking-editorial uppercase text-muted">
          Correspondents&nbsp;·&nbsp;
          <span className="text-cream-200">
            {Object.keys(onlinePeopleExclOurUser).length} online
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pb-6">
          {Object.keys(onlinePeopleExclOurUser).map((p) => (
            <ContactRow
              key={p}
              userId={p}
              username={onlinePeopleExclOurUser[p]}
              online={true}
              selected={p === selectedUserId}
              unread={unread[p] || 0}
              onClick={() => selectContact(p)}
            />
          ))}
          {Object.keys(offlinePeople).length > 0 && (
            <div className="px-6 mt-6 mb-2 text-[10px] tracking-editorial uppercase text-muted">
              Quiet
            </div>
          )}
          {Object.keys(offlinePeople).map((p) => (
            <ContactRow
              key={p}
              userId={p}
              username={offlinePeople[p]}
              online={false}
              selected={p === selectedUserId}
              unread={unread[p] || 0}
              onClick={() => selectContact(p)}
            />
          ))}
        </div>

        <div className="border-t border-ink-700 px-6 py-4 flex items-center gap-3">
          <Avatar username={ourUsername || "?"} userId={id || "0"} />
          <div className="flex-1 min-w-0">
            <div className="font-display text-[15px] leading-tight truncate">
              {ourUsername}
            </div>
            <div className="text-[10px] tracking-editorial uppercase text-muted">
              You — Online
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            className="group flex items-center gap-1.5 text-[10px] tracking-editorial uppercase text-muted hover:text-ember-400 transition-colors"
          >
            Sign out
            <BsBoxArrowRight className="text-sm group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </aside>

      {/* Conversation */}
      <main className="flex-1 flex flex-col relative grain">
        {/* Bell */}
        <div className="absolute top-6 right-8 z-30 flex items-center gap-3">
          {totalUnread > 0 && (
            <span className="text-[10px] tracking-editorial uppercase text-ember-400 rise">
              {totalUnread} new
            </span>
          )}
          <div className="relative">
            {totalUnread > 0 ? (
              <BsBellFill className="text-ember-400 text-lg ember-pulse" />
            ) : (
              <BsBell className="text-muted text-lg" />
            )}
          </div>
        </div>

        {!selectedUserId && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="text-[10px] tracking-editorial uppercase text-muted mb-5">
              No correspondent selected
            </div>
            <div className="font-display italic text-[44px] leading-tight tracking-tight max-w-[18ch] text-cream-100">
              Pick a name to begin a letter.
            </div>
            <div className="mt-6 text-muted max-w-md leading-relaxed">
              Conversations live forever. They survive refreshes, reboots, and
              rainy weekends.
            </div>
          </div>
        )}

        {selectedUserId && (
          <>
            <header className="px-10 pt-8 pb-6 border-b border-ink-700 flex items-end justify-between pr-32">
              <div>
                <div className="text-[10px] tracking-editorial uppercase text-muted mb-1">
                  In conversation with
                </div>
                <div className="font-display text-[34px] leading-none tracking-tight">
                  {selectedName || "Unknown"}
                </div>
              </div>
              <div className="text-[10px] tracking-editorial uppercase text-muted flex items-center gap-2">
                {selectedIsOnline ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-ember-400 ember-pulse" />
                    Currently writing
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 bg-ink-500" />
                    Away
                  </>
                )}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-10 py-8">
              <div className="flex flex-col gap-3 max-w-3xl mx-auto">
                {visibleMessages.map((m, i) => {
                  const mine = m.sender === id;
                  const prev = visibleMessages[i - 1];
                  const continuing = prev && prev.sender === m.sender;
                  return (
                    <div
                      key={m._id}
                      className={
                        "max-w-[68%] px-4 py-3 text-[15px] leading-snug rise " +
                        (mine
                          ? "self-end bg-ember-400 text-ink-900 rounded-[2px]"
                          : "self-start bg-ink-700 text-cream-50 rounded-[2px] border border-ink-600")
                      }
                      style={{
                        marginTop: continuing ? "-4px" : "8px",
                      }}
                    >
                      {m.text}
                    </div>
                  );
                })}
                {visibleMessages.length === 0 && (
                  <div className="self-center text-muted text-sm font-display italic mt-12">
                    — no letters yet. say something.
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <form
              onSubmit={sendMessage}
              className="border-t border-ink-700 px-10 py-5 flex items-center gap-4 max-w-5xl mx-auto w-full"
            >
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Write a letter…"
                className="flex-1 bg-transparent outline-none text-[17px] font-display placeholder:text-ink-400 placeholder:italic py-2 border-b border-ink-700 focus:border-ember-400 transition-colors"
              />
              <button
                type="submit"
                className="group flex items-center gap-2 text-[10px] tracking-editorial uppercase text-muted hover:text-ember-400 transition-colors"
              >
                Send
                <BsArrowRight className="text-base group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </>
        )}

        {/* Toasts */}
        <div className="fixed top-20 right-6 z-40 flex flex-col gap-3 w-[320px] pointer-events-none">
          {toasts.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                selectContact(t.contactId);
                dismissToast(t.id);
              }}
              className="pointer-events-auto text-left bg-ink-700/95 backdrop-blur border border-ink-600 hover:border-ember-400 px-4 py-3 shadow-2xl rise transition-colors group"
            >
              <div className="text-[10px] tracking-editorial uppercase text-muted mb-1 flex items-center justify-between">
                <span>New letter from {t.senderName}</span>
                <span className="text-ember-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open →
                </span>
              </div>
              <div className="font-display text-[15px] text-cream-50 leading-snug line-clamp-2">
                {t.text}
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

function ContactRow({ userId, username, online, selected, unread, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "w-full text-left px-6 py-3 flex items-center gap-3 transition-colors group " +
        (selected ? "bg-ink-700" : "hover:bg-ink-700/50")
      }
    >
      <div className="relative">
        <Avatar username={username} userId={userId} />
        {online && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-ember-400 ring-2 ring-ink-800" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={
            "font-display text-[16px] leading-tight truncate " +
            (online ? "text-cream-50" : "text-cream-200/60")
          }
        >
          {username}
        </div>
        <div className="text-[10px] tracking-editorial uppercase text-muted mt-0.5">
          {online ? "Online" : "Last seen recently"}
        </div>
      </div>
      {unread > 0 && (
        <span className="font-display text-[13px] text-ember-400 ember-pulse">
          {unread}
        </span>
      )}
      {selected && <div className="w-1 h-8 bg-ember-400" />}
    </button>
  );
}
