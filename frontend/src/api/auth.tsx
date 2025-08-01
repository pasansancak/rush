import axios from "axios";

export async function loginWithGoogleBackend(idToken: string, clientType: string) {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL + "/auth/google-login";
  const response = await axios.post(apiUrl, { token: idToken, client_type: clientType });
  return response.data;
}
