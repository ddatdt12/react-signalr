import React, { useRef } from "react";
import { API_URL } from "../constant";
const LoginForm = ({ onSuccess }) => {
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const handleLogin = async () => {
    //post login with fetch
    const email = emailInputRef.current.value;
    const password = passwordInputRef.current.value;
    try {
      const res = await fetch(API_URL + "/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }).then((res) => res.json());

      console.log(res);
      onSuccess({ user: res.data, token: res.token });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  return (
    <div>
      <input type="text" ref={emailInputRef} placeholder="Email" />
      <input type="text" ref={passwordInputRef} placeholder="Password" />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default LoginForm;
