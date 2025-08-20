import { useState, useEffect } from "react";
import io from "socket.io-client";
import "../App.css";

const socket = io("http://localhost:5000");

function ChatRoom() {
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };
    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []);

  const joinRoom = () => {
    if (room && username) {
      socket.emit("join_room", room);
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (message) {
      const data = { room, author: username, message };
      socket.emit("send_message", data);
      setMessage("");
    }
  };

  useEffect(() => {
    // Auto-scroll messages
    const box = document.querySelector(".message-box");
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages]);

  return (
    <div className="chat-room">
      {!joined ? (
        <div style={{ textAlign: "center" }}>
          <h2>Join a Chat Room</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              joinRoom();
            }}
          >
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="text"
              placeholder="Room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
            <button type="submit">Join</button>
          </form>
        </div>
      ) : (
        <>
          <h3>Room: {room}</h3>
          <div className="message-box">
            {messages.map((msg, i) => (
              <p key={i}>
                <b>{msg.author}:</b> {msg.message}
              </p>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatRoom;
