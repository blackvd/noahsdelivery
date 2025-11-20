import axios from "axios";

const BASE_URL = "http://172.20.10.3:3000/couriers";
//const BASE_URL = "http://192.168.0.100:3000/clients";

export async function getCourierData(authToken) {
  //console.log(authToken);
  const response = await axios.get(`${BASE_URL}/infos`, {headers: {'Authorization': `Bearer ${authToken}`}});
  
  //console.log(response.data)

  return response.data
}

export async function getDailyPerformance(authToken){
  
  const response = await axios.get(`${BASE_URL}/daily-performance`, {headers: {'Authorization': `Bearer ${authToken}`}})

  return response.data
}