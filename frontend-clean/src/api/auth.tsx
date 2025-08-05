import axios from "axios";

export async function loginWithGoogleBackend(idToken: string, clientType: string) {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL + "/auth/google-login";
  const response = await axios.post(apiUrl, { id_token: idToken, client_type: clientType });
  return response.data;
}

export async function loginWithAppleBackend(identityToken: string, clientType: string) {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL + "/auth/apple-login";
  const response = await axios.post(apiUrl, { id_token: identityToken, client_type: clientType });
  return response.data;
}

export async function registerWithEmailBackend({
  name,
  email,
  phone,
  password,
  gender,
  birthday,
  profile_image,
}: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  gender?: string;
  birthday?: string; // "YYYY-MM-DD"
  profile_image?: string; // URL veya base64
}) {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL + "/auth/register";

  const data: any = {
    name,
    email,
    password,
    provider: "normal",
  };

  if (phone) data.phone = phone;
  if (gender) data.gender = gender;
  if (birthday) data.birthday = birthday;
  if (profile_image) data.profile_image = profile_image;

  const response = await axios.post(apiUrl, data);
  return response.data;
}
