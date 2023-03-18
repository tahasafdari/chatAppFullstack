import axios from "axios";
import React from "react";
import { useContext } from "react";
import { UserContext } from "./UserContext.jsx";

function Register() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const { setUsername: setLoggedInUserName, setId } = useContext(UserContext);

  async function register(event) {
    event.preventDefault();
    const { data } = axios
      .post("/register", { username, password })
      .then((res) => {
        setLoggedInUserName(username);
        setId(res.data.id);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={register}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          id="usernameinput"
          placeholder="username"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          id="passwordinput"
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
}

export default Register;
