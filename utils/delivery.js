import axios from "axios";

const BASE_URL = "http://172.20.10.3:3000/deliveries";
//const BASE_URL = "http://192.168.0.100:3000/deliveries";

export async function computePrice(distanceData, authToken) {
  const response = await axios.post(
    `${BASE_URL}/compute-price`,
    {
      pickupAddress: {
        addressLongitude: distanceData.pickupAddress.longitude,
        addressLatitude: distanceData.pickupAddress.latitude,
      },
      dropoffAddress: {
        addressLongitude: distanceData.dropoffAddress.longitude,
        addressLatitude: distanceData.dropoffAddress.latitude,
      },
    },
    { headers: { Authorization: `Bearer ${authToken}` } }
  );

  console.log("response ", response);

  return response.data;
}

export async function createDelivery(deliveryData, authToken) {
  const response = await axios.post(
    `${BASE_URL}`,
    {
      pickupAddress: {
        name: deliveryData.pickup.exactName,
        phone: deliveryData.senderPhone,
        addressText: deliveryData.pickup.addressText,
        addressLongitude: deliveryData.pickup.longitude,
        addressLatitude: deliveryData.pickup.latitude,
      },
      dropoffAddress: {
        name: deliveryData.dropoff.exactName,
        phone: deliveryData.recipientPhone,
        addressText: deliveryData.dropoff.addressText,
        addressLongitude: deliveryData.dropoff.longitude,
        addressLatitude: deliveryData.dropoff.latitude,
      },
      distanceKm: deliveryData.distance,
      remarks: deliveryData.dropoff.remarks,
      deliveryType: deliveryData.mode,
      packageSize: deliveryData.dropoff.size,
      estimatedPrice: deliveryData.price,
    },
    { headers: { Authorization: `Bearer ${authToken}` } }
  );

  return response.data;
}

export async function findDelivery(id, authToken) {
  console.log(`${BASE_URL}/${id}`);
  const response = await axios.get(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  console.log("DELIVERY FOUND", response.data);

  return response.data;
}

export async function getDeliveries(authToken) {
  const response = await axios.get(`${BASE_URL}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  return response.data;
}

export async function getPendingDeliveries(authToken) {
  //console.log(authToken);
  const response = await axios.get(`${BASE_URL}/awaiting-assignment`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  //console.log(response.data);

  return response.data;
}
