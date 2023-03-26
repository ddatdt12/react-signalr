import React, { useCallback, useEffect, useRef, useState } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import "./App.css";
import LoginForm from "./components/LoginForm";
import { API_URL } from "./constant";

const App = () => {
  const [connection, setConnection] = useState();
  const [messages, setMessages] = useState([]);
  const [auth, setAuth] = useState({ user: null, token: null });
  const receiverInputRef = useRef(null);
  const roomIdInputRef = useRef(null);
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

  const joinRoom = async () => {
    const roomId = roomIdInputRef.current.value;
    if (!connection || !roomId || !auth.token) {
      return;
    }

    console.log("Token: ", auth.token);
    try {
      const res = await fetch(API_URL + `/api/rooms/${roomId}/messages`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      }).then((res) => res.json());

      setMessages(res.data || []);
      console.log(res);
    } catch (error) {
      console.log("error: ", error);
    }
  };

  console.log("API_URL", API_URL);
  useEffect(() => {
    if (auth.user && auth.token) {
      joinRealTime();
    }
  }, [auth?.token]);
  const joinRealTime = useCallback(async () => {
    // const room = roomInputRef.current.value;
    if (!auth.token) {
      if (connection) {
        connection.stop();
      }
      return;
    }
    console.log("Token: ", auth.token);
    try {
      const connection = new HubConnectionBuilder()
        .withUrl(API_URL + "/hubs/noti", {
          accessTokenFactory: () => auth.token,
        })
        .configureLogging(LogLevel.Debug)
        .build();
      connection.on("Pong", (message) => {
        console.log("Pong: ", message);
      });
      connection.on("Notification", (message) => {
        console.log("Notification: ", message);
      });
      connection.on("ReceiveMessage", (message) => {
        console.log("Comming message: ", message);
        setMessages((messages) => [...messages, message]);
      });
      connection.on("ReceiveTestStr", (message) => {
        console.log("Comming ReceiveTestStr: ", message);
      });
      connection.onclose((e) => {
        console.log("e", e);
        setConnection();
        setMessages([]);
      });

      await connection.start();
      setConnection(connection);
    } catch (e) {
      console.log("check error: ", e);
    }
  }, [auth.token]);

  const sendMessage = async (text) => {
    try {
      const roomId = roomIdInputRef.current.value;
      const message = {
        Content: text,
        ReceiverId: receiverInputRef.current.value || null,
        RoomId: +roomId || null,
        PostId: null,
      };
      console.log("message: ", message);
      // // await connection.invoke("SendMessage", message);
      await connection.invoke("SendMessageStr", JSON.stringify(message));
      await connection.invoke("TestStr", "Test gửi data");
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
      <div>
        <button
          onClick={() => {
            localStorage.removeItem("auth");
            setAuth({ user: null, token: null });
            // connection.off();
          }}
        >
          Logout
        </button>
      </div>
      <hr className="line" />

      {!auth?.user && (
        <LoginForm
          Form
          onSuccess={(auth) => {
            setAuth(auth);
            localStorage.setItem("auth", JSON.stringify(auth));
          }}
        />
      )}
      {auth?.user && connection && (
        <button
          onClick={() => {
            connection.invoke("Ping", "Test gửi data");
          }}
        >
          Send ping
        </button>
      )}
      {/* {auth?.user && connection && (
        <div>
          <input type="text" ref={receiverInputRef} placeholder="ReceiverId" />
          <div>
            <input type="text" ref={roomIdInputRef} placeholder="RoomId" />
            <button onClick={joinRoom}>Join</button>
          </div>
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
      )} */}
    </div>
  );
};

export default App;
