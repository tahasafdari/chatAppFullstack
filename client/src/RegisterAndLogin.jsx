import axios from "axios";
import { useState, useContext } from "react";
import { UserContext } from "./UserContext.jsx";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setUsername: setLoggedInUserName, setId } = useContext(UserContext);
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("register");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const url = isLoginOrRegister === "register" ? "register" : "login";
    try {
      const res = await axios.post(url, { username, password });
      setLoggedInUserName(username);
      setId(res.data.id);
    } catch (err) {
      setError(err?.response?.data?.error || "request failed");
    }
  }

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
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
        {error && (
          <div className="text-red-500 text-sm mb-2 text-center">{error}</div>
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white font-bold w-full rounded-sm p-2"
        >
          {isLoginOrRegister === "register" ? "Register" : "Login"}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister === "register" && (
            <div>
              Already a member?{" "}
              <button
                type="button"
                onClick={() => setIsLoginOrRegister("login")}
              >
                Login here!
              </button>
            </div>
          )}
          {isLoginOrRegister === "login" && (
            <div>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setIsLoginOrRegister("register")}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default Register;
