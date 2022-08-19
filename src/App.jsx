import { useState } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import "./App.css";

const App = () => {
  const [connection, setConnection] = useState();
  const [messages, setMessages] = useState([]);

  const joinRoom = async (user, room) => {
    try {
      const connection = new HubConnectionBuilder()
        .withUrl("https://localhost:7113/chat")
        .configureLogging(LogLevel.Information)
        .build();

      connection.on("ReceiveMessage", (user, message) => {
        setMessages((messages) => [...messages, { user, message }]);
      });

      connection.onclose((e) => {
        setConnection();
        setMessages([]);
      });

      await connection.start();
      await connection.invoke("JoinRealtime", { user, room });

      setConnection(connection);
    } catch (e) {
      console.log(e);
    }
  };

  const sendMessage = async (message) => {
    try {
      await connection.invoke("SendMessage", message);
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
          <input type="text" placeholder="User" />
          <input type="text" placeholder="Room" />
          <button onClick={() => joinRoom("User", "Room")}>Join</button>
        </div>
      ) : (
        <div>
          <div>
            {messages.map((message, index) => (
              <p>
                {message.user} : {message.message}
              </p>
            ))}
          </div>
          <input type="text" placeholder="Message" />
          <button onClick={() => sendMessage("Message")}>Send</button>
        </div>
      )}
    </div>
  );
};

export default App;
