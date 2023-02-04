import { useContext } from "react";
import { AuthContext } from "../context/auth-context";

export const Home = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div>
      <h1>This is the home page</h1>

      {user ? <p>{user.email} is logged in</p> : <p>There is no user data</p>}
    </div>
  );
};
