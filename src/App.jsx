import React, { useCallback, useEffect, useRef, useState } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import "./App.css";
import LoginForm from "./components/LoginForm";

const App = () => {
  const [connection, setConnection] = useState();
  const [messages, setMessages] = useState([]);
  const [auth, setAuth] = useState({ user: null, token: null });
  const receiverInputRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem("auth");
      if (savedAuth) {
        setAuth(JSON.parse(savedAuth));
      }
    } catch (error) {
      localStorage.removeItem("auth");
    }
  }, []);

  useEffect(() => {
    if (auth.user && auth.token) {
      joinRealTime();
    }
  }, [auth?.token]);
  const joinRealTime = useCallback(async () => {
    // const room = roomInputRef.current.value;
    if (!auth.token) {
      return;
    }
    try {
      const connection = new HubConnectionBuilder()
        .withUrl("https://localhost:7113/hubs/chat", {
          accessTokenFactory: () => auth.token,
        })
        .configureLogging(LogLevel.Information)
        .build();
      connection.on("ReceiveMessage", (message) => {
        console.log("Comming message: ", message);
        setMessages((messages) => [...messages, message]);
      });

      connection.onclose((e) => {
        console.log("e", e);
        setConnection();
        setMessages([]);
      });

      await connection.start();
      await connection.invoke("JoinRealtime");

      setConnection(connection);
    } catch (e) {
      console.log("check error: ", e);
    }
  }, [auth.token]);

  const sendMessage = async (message) => {
    try {
      await connection.invoke("SendMessage", {
        content: message,
        receiverId: receiverInputRef.current.value,
      });
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
      {!auth?.user && (
        <LoginForm
          onSuccess={(auth) => {
            setAuth(auth);
            localStorage.setItem("auth", JSON.stringify(auth));
          }}
        />
      )}
      {auth?.user && connection && (
        <div>
          <input type="text" ref={receiverInputRef} placeholder="ReceiverId" />
          {/* <button onClick={joinRoom}>Join</button> */}
          <div>{JSON.stringify(auth.user)} Joined</div>
          <div>
            {messages.map((message, index) => (
              <p key={message.id}>
                {message.senderId} : {message.content}
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
