import React from "react";
import { useContext } from "react";
import Register from "./RegisterAndLogin";
import { UserContext } from "./UserContext";
import Chat from "./Chat";

const Routes = () => {
  const { username, id } = useContext(UserContext);

  if (username) {
    return <Chat />;
  }

  return <Register />;
};

export default Routes;
