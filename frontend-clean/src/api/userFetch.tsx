import axios from "axios";
import { UserType } from "../context/UserContext";

export async function fetchUser(jwt: string): Promise<UserType> {
  console.log("Fetching user data with JWT:", jwt);
  const res = await axios.get(
    process.env.EXPO_PUBLIC_API_URL + "/api/user/me",
    {
      headers: { Authorization: `Bearer ${jwt}` },
    }
  );
  console.log("User data fetched:", res.data); // Debugging log
  return res.data;
}
