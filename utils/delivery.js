import axios from "axios";

const BASE_URL = "http://172.20.10.3:3000/deliveries";

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
  const response = await axios.post(`${BASE_URL}`, {
    pickupAddress: {
      name: deliveryData.pickup.name,
      phone: deliveryData.senderPhone,
      addressText: deliveryData.pickup.addressText,
      addressLongitude: deliveryData.pickup.longitude,
      addressLatitude: deliveryData.pickup.latitude,
    },
    dropoffAddress: {
      name: deliveryData.dropoff.name,
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
  }, {headers: {'Authorization': `Bearer ${authToken}`}});

  console.log("CREATE DELIVERY RESPONSE", response.data);

  return response.data
}
