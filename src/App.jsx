import React, { useRef, useState } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import "./App.css";

const App = () => {
  const [connection, setConnection] = useState();
  const [messages, setMessages] = useState([]);
  const userNameInputRef = useRef(null);
  const roomInputRef = useRef(null);
  const messageInputRef = useRef(null);

  const joinRoom = async () => {
    const userName = userNameInputRef.current.value;
    // const room = roomInputRef.current.value;
    try {
      const connection = new HubConnectionBuilder()
        .withUrl("https://localhost:7113/chat")
        .configureLogging(LogLevel.Information)
        .build();

      connection.on("ReceiveMessage", (message) => {
        console.log("Comming message: ", message);
        // setMessages((messages) => [...messages, { ...message }]);
      });

      connection.onclose((e) => {
        setConnection();
        setMessages([]);
      });

      await connection.start();
      await connection.invoke("JoinRealtime", userName);

      setConnection(connection);
    } catch (e) {
      console.log(e);
    }
  };

  const sendMessage = async (message) => {
    try {
      await connection.invoke("SendMessage", { content: message });
    } catch (e) {
      console.log(e);
    }
  };

  const closeConnection = async () => {
    try {
      await connection.stop();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="app">
      <h2>MyChat</h2>
      <hr className="line" />
      {!connection ? (
        <div>
          <input type="text" ref={userNameInputRef} placeholder="User" />
          <input type="text" ref={roomInputRef} placeholder="Room" />
          <button onClick={joinRoom}>Join</button>
        </div>
      ) : (
        <div>
          {userNameInputRef.current.value} Joined
          <div>
            {messages.map((message, index) => (
              <p key={index}>
                {message.userId} : {message.message}
              </p>
            ))}
          </div>
          <input type="text" placeholder="Message" ref={messageInputRef} />
          <button onClick={() => sendMessage(messageInputRef.current.value)}>
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
