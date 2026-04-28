import axios from "axios";
import { UserContextProvider } from "./UserContext";
import Routes from "./Routes";

axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";
axios.defaults.withCredentials = true;

function App() {
  return (
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
  );
}
export default App;
