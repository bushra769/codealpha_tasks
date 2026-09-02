import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import VideoCall from "./VideoCall";
import FileShare from "./FileShare";
import Whiteboard from "./Whiteboard";
import Chat from "./Chat";
import Login from "./Login";
import "./App.css";

const socket = io(import.meta.env.VITE_SOCKET_URL);

function App() {
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const joinRoom = () => {
    if (!roomId.trim()) {
      alert("Please enter a Room ID");
      return;
    }

    socket.emit("join-room", roomId);
    setJoined(true);
  };
  if (!loggedIn) {
  return <Login onLogin={() => setLoggedIn(true)} />;
}

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>ConnectHub</h1>
          <p>Video Conferencing & Collaboration</p>
        </div>

        <div className="status">
          <span className={connected ? "online" : "offline"}></span>
          {connected ? "Connected" : "Disconnected"}
        </div>
        <button
  onClick={() => {
    setLoggedIn(false);
    setJoined(false);
    setRoomId("");
  }}
>
  Logout
</button>
      </header>

      {!joined ? (
        <div className="join-container">
          <h2>Join a Meeting</h2>

          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />

          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <main className="dashboard">
          <section className="video-section">
            <h2>Room: {roomId}</h2>

            <div className="video-box">
              <VideoCall roomId={roomId} socket={socket} />
            </div>

            <div className="controls">
              <button>🎤 Microphone</button>
              <button>📹 Camera</button>
              <button>🖥️ Share Screen</button>
              <button className="leave">📞 Leave Call</button>
            </div>
          </section>

          <aside className="side-panel">
            <h2>Collaboration Tools</h2>

            <FileShare />
            <Whiteboard />
            <Chat />

            <div className="participants">
              <h3>Participants</h3>
              <p>👤 You</p>
            </div>
          </aside>
        </main>
      )}
    </div>
  );
}

export default App;