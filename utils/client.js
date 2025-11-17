import axios from "axios"

//const BASE_URL = "http://172.20.10.3:3000/auth";
const BASE_URL = "http://192.168.0.100:3000/clients";

export async function getClientProfile(authToken) {
  const response = await axios.get(`${BASE_URL}`, {headers: {'Authorization': `Bearer ${authToken}`}});
  
  console.log(response.data)

  return response.data
}