import axios from "axios";
import React from "react";

const Register = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  function register(event) {
    event.preventDefault();
    axios.post("/register", { username, password });
  }

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form action="" className="w-64 mx-auto mb-12" onSubmit={register}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          name=""
          id=""
          placeholder="username"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          name=""
          id=""
          placeholder="password"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <button
          type="Register"
          className="bg-blue-500 text-white font-bold w-full rounded-sm p-2"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
