import axios from "axios";

export const fetchHomeData = async () => {
  const baseURL = process.env.EXPO_PUBLIC_API_URL + "/v1/home";
  const res = await axios.get(baseURL);
  return res.data; 
};
