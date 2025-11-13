import axios from "axios";

const BASE_URL = "http://172.20.10.3:3000/auth";

export async function requestOtp(identifier, loginMethod, role) {
  const data = {
    phone: loginMethod === "phone" && identifier,
    email: loginMethod === "email" && identifier,
    role: role,
  };

  console.log('get otp');

  const response = await axios.post(`${BASE_URL}/otp/request`, data);

  return response.data
}

export async function verifyOtp(identifier, loginMethod, code) {
  const data = {
    phone: loginMethod === "phone" && identifier,
    email: loginMethod === "email" && identifier,
    code: code,
  };

  const response = await axios.post(`${BASE_URL}/otp/verify`, data);

  return response.data.accessToken
}

export async function registerCourier(courierData) {
  const response = await axios.post(`${BASE_URL}/register/courier`, {
    courierData,
  });

  return response.data.accessToken
}
