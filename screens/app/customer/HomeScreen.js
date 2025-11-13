import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as Contacts from "expo-contacts";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import ThreeDotsLoader from "../../../components/ThreeDotsLoader";

const { width } = Dimensions.get("window");

function HomeScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState("small");
  const [selectedMode, setSelectedMode] = useState("MOTO");
  const [pickupAddress, setPickupAddress] = useState({
    name: "",
    addressText: "",
    latitude: null,
    longitude: null,
    phone: "",
  });
  const [dropoffAddress, setDropoffAddress] = useState({
    name: "",
    addressText: "",
    latitude: null,
    longitude: null,
  });
  const [recipientPhone, setRecipientPhone] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [remarks, setRemarks] = useState("");

  const [showContactsModal, setShowContactsModal] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Nouveaux états pour distance et temps
  const [distance, setDistance] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  // États pour la localisation
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationField, setLocationField] = useState(""); // 'pickup' ou 'dropoff'
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  const packageSizes = [
    { id: "SMALL", label: "Petit", icon: "📦" },
    { id: "MEDUIM", label: "Moyen", icon: "📦" },
    { id: "LARGE", label: "Large", icon: "📦" },
  ];

  const deliveryModes = [
    {
      id: "MOTO",
      label: "Moto",
      icon: "🏍️",
      time: "15-20 min",
      available: true,
    },
    {
      id: "TRICYCLE",
      label: "Tricycle",
      icon: "🛺",
      time: "20-30 min",
      available: false,
    },
    {
      id: "VOITURE",
      label: "Voiture",
      icon: "🚗",
      time: "25-35 min",
      available: false,
    },
    {
      id: "VAN",
      label: "Camion",
      icon: "🚐",
      time: "30-40 min",
      available: false,
    },
  ];

  // Calculer la distance et le temps quand pickup et dropoff sont définis
  useEffect(() => {
    if (
      pickupAddress.latitude &&
      pickupAddress.longitude &&
      dropoffAddress.latitude &&
      dropoffAddress.longitude
    ) {
      calculateRouteInfo();
    } else {
      setDistance(null);
      setEstimatedTime(null);
    }
  }, [pickupAddress, dropoffAddress, selectedMode]);

  // Fonction pour calculer la distance haversine
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  // Fonction pour calculer le temps estimé
  const calculateEstimatedTime = (distanceKm, vehicle) => {
    // Vitesses moyennes en km/h selon le véhicule et le trafic urbain
    const speeds = {
      MOTO: 25, // Moto rapide en ville
      VOITURE: 20, // Voiture en trafic urbain
      VAN: 18, // Camionnette plus lente
    };

    const speedKmh = speeds[vehicle] || 20;
    const timeHours = distanceKm / speedKmh;
    const timeMinutes = Math.round(timeHours * 60);

    return timeMinutes;
  };

  // Fonction pour calculer les infos de route avec OSRM
  const calculateRouteInfo = async () => {
    setCalculatingRoute(true);

    try {
      const { latitude: lat1, longitude: lon1 } = pickupAddress;
      const { latitude: lat2, longitude: lon2 } = dropoffAddress;

      // Appel à l'API OSRM pour obtenir la route réelle
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`
      );

      const data = await response.json();

      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = route.distance / 1000; // Convertir en km
        const durationMinutes = Math.round(route.duration / 60); // Convertir en minutes

        setDistance(distanceKm);

        // Ajuster le temps selon le véhicule
        const adjustedTime = calculateEstimatedTime(distanceKm, selectedMode);
        setEstimatedTime(adjustedTime);

        console.log("Route calculée:", {
          distance: `${distanceKm.toFixed(2)} km`,
          tempsOSRM: `${durationMinutes} min`,
          tempsAjusté: `${adjustedTime} min`,
          véhicule: selectedMode,
        });
      } else {
        // Fallback: calcul basique si OSRM échoue
        const distanceKm = calculateDistance(lat1, lon1, lat2, lon2);
        const timeMinutes = calculateEstimatedTime(distanceKm, selectedMode);

        setDistance(distanceKm);
        setEstimatedTime(timeMinutes);

        console.log("Calcul basique (OSRM non disponible):", {
          distance: `${distanceKm.toFixed(2)} km`,
          temps: `${timeMinutes} min`,
        });
      }
    } catch (error) {
      console.error("Erreur calcul route:", error);

      // Fallback en cas d'erreur
      const { latitude: lat1, longitude: lon1 } = pickupAddress;
      const { latitude: lat2, longitude: lon2 } = dropoffAddress;
      const distanceKm = calculateDistance(lat1, lon1, lat2, lon2);
      const timeMinutes = calculateEstimatedTime(distanceKm, selectedMode);

      setDistance(distanceKm);
      setEstimatedTime(timeMinutes);
    } finally {
      setCalculatingRoute(false);
    }
  };

  // Fonction pour formater la distance
  const formatDistance = (km) => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  };

  // Fonction pour formater le temps
  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`;
  };

  // Charger les contacts
  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();

      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        });

        if (data.length > 0) {
          // Filtrer et formater les contacts qui ont un numéro
          const formattedContacts = data
            .filter(
              (contact) =>
                contact.phoneNumbers && contact.phoneNumbers.length > 0
            )
            .map((contact) => ({
              id: contact.id,
              name: contact.name || "Sans nom",
              phone: contact.phoneNumbers[0].number,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

          setContacts(formattedContacts);
          setFilteredContacts(formattedContacts);
        } else {
          Alert.alert("Info", "Aucun contact trouvé sur votre appareil");
        }
      } else {
        Alert.alert(
          "Permission refusée",
          "Pour sélectionner un contact, autorisez l'accès à vos contacts dans les paramètres"
        );
      }
    } catch (error) {
      console.error("Erreur chargement contacts:", error);
      Alert.alert("Erreur", "Impossible de charger les contacts");
    } finally {
      setLoadingContacts(false);
    }
  };

  // Ouvrir le modal contacts
  const handleOpenContacts = async () => {
    setShowContactsModal(true);
    if (contacts.length === 0) {
      await loadContacts();
    }
  };

  // Rechercher dans les contacts
  const handleSearchContacts = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(query.toLowerCase()) ||
          contact.phone.includes(query)
      );
      setFilteredContacts(filtered);
    }
  };

  // Sélectionner un contact
  const handleSelectContact = (contact) => {
    setRecipientPhone(contact.phone);
    setShowContactsModal(false);
    setSearchQuery("");
  };

  // ============= GESTION DE LA LOCALISATION =============

  // Obtenir la position actuelle
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "Pour utiliser votre position actuelle, autorisez l'accès à la localisation"
        );
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("Erreur localisation:", error);
      return null;
    }
  };

  // Géocoder la position actuelle
  const reverseGeocode = async (coords) => {
    try {
      const url =
        `https://nominatim.openstreetmap.org/reverse?` +
        `lat=${coords.latitude}` +
        `&lon=${coords.longitude}` +
        `&format=json` +
        `&addressdetails=1` +
        `&accept-language=fr`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "YabaExpress/1.0",
        },
      });

      const data = await response.json();

      if (data && data.display_name) {
        return {
          id: "current-location",
          name: "Ma position actuelle",
          addressText: data.display_name,
          subtitle: formatAddress(data.address),
          latitude: coords.latitude,
          longitude: coords.longitude,
          address: data.address,
          isCurrentLocation: true,
        };
      }

      // const results = await Location.reverseGeocodeAsync(coords);
      // if (results && results.length > 0) {
      //   const address = results[0];
      //   const formatted = [
      //     address.name,
      //     address.street,
      //     address.city,
      //     address.region,
      //   ].filter(Boolean).join(', ');

      //   return formatted || 'Position actuelle';
      // }
      // return 'Position actuelle';
    } catch (error) {
      console.error("Erreur reverse geocode:", error);
      return "Position actuelle";
    }
  };

  // Formater l'adresse de manière lisible
  const formatAddress = (address) => {
    if (!address) return "";

    const parts = [];

    if (address.road) parts.push(address.road);
    if (address.suburb) parts.push(address.suburb);
    if (address.city || address.town || address.village) {
      parts.push(address.city || address.town || address.village);
    }

    return parts.join(", ") || address.display_name || "";
  };

  // Extraire un nom court pour le lieu
  const extractLocationName = (place) => {
    const address = place.address;

    // Priorité: nom du lieu > route > quartier > ville
    if (place.name && place.name !== place.display_name) {
      return place.name;
    }
    if (address.road) return address.road;
    if (address.suburb) return address.suburb;
    if (address.neighbourhood) return address.neighbourhood;
    if (address.village) return address.village;
    if (address.town) return address.town;
    if (address.city) return address.city;

    return "Lieu sélectionné";
  };

  // Rechercher des lieux avec l'API Google Places
  const searchPlaces = async (query) => {
    if (!query || query.trim().length < 3) {
      setLocationSuggestions([]);
      return;
    }

    setLoadingLocations(true);
    try {
      // Définir les limites pour Abidjan et la Côte d'Ivoire
      const viewbox = "-5.5,-4.0,4.5,10.5"; // Côte d'Ivoire approximative
      const bounded = 1; // Limiter aux résultats dans le viewbox

      const url =
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}` +
        `&format=json` +
        `&addressdetails=1` +
        `&limit=10` +
        `&countrycodes=ci` + // Côte d'Ivoire
        `&viewbox=${viewbox}` +
        `&bounded=${bounded}` +
        `&accept-language=fr`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "YabaExpress/1.0", // Nominatim requiert un User-Agent
        },
      });

      const data = await response.json();

      if (data && data.length > 0) {
        const suggestions = data.map((place, index) => ({
          id: `place-${index}`,
          name: extractLocationName(place),
          addressText: place.display_name,
          subtitle: formatAddress(place.address),
          latitude: parseFloat(place.lat),
          longitude: parseFloat(place.lon),
          address: place.address,
          isCurrentLocation: false,
        }));

        setLocationSuggestions(suggestions);
      } else {
        setLocationSuggestions([]);
      }

      // const GOOGLE_PLACES_API_KEY = 'VOTRE_CLE_API_GOOGLE'; // À remplacer

      // // Si vous n'avez pas de clé API, utilisez expo-location geocoding
      // const results = await Location.geocodeAsync(query);

      // if (results && results.length > 0) {
      //   const suggestions = results.slice(0, 5).map((result, index) => ({
      //     id: `${result.latitude}-${result.longitude}-${index}`,
      //     description: query,
      //     latitude: result.latitude,
      //     longitude: result.longitude,
      //   }));

      //   setLocationSuggestions(suggestions);
      // } else {
      //   setLocationSuggestions([]);
      // }
    } catch (error) {
      console.error("Erreur recherche lieux:", error);
      setLocationSuggestions([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Ouvrir le modal de localisation
  const handleOpenLocationModal = async (field) => {
    setLocationField(field);
    setShowLocationModal(true);
    setLocationSearchQuery("");
    setLocationSuggestions([]);

    // Charger la position actuelle
    const coords = await getCurrentLocation();
    if (coords) {
      const currentPlace = await reverseGeocode(coords);
      if (currentPlace) {
        setLocationSuggestions([currentPlace]);
      }
    }
  };

  // Recherche de lieux avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (locationSearchQuery.trim().length >= 3) {
        searchPlaces(locationSearchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [locationSearchQuery]);

  // Sélectionner un lieu
  const handleSelectLocation = (location) => {
    const locationData = {
      name: location.name,
      addressText: location.addressText,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    if (locationField === "pickupAddress") {
      setPickupAddress((prev) => ({ ...locationData, phone: prev.phone }));
      console.log("Pickup Data:", locationData);
    } else if (locationField === "dropoffAddress") {
      setDropoffAddress(locationData);
      console.log("Dropoff Data:", locationData);
    }

    setShowLocationModal(false);
    setLocationSearchQuery("");
    setLocationSuggestions([]);
  };

  // Utiliser la position actuelle
  const handleUseCurrentLocation = async () => {
    if (currentLocation) {
      const address = await reverseGeocode(currentLocation);
      handleSelectLocation({
        description: address,
        ...currentLocation,
      });
    } else {
      Alert.alert("Erreur", "Impossible d'obtenir votre position actuelle");
    }
  };

  // ⭐ Fonction pour mettre à jour le numéro directement
  const updateSenderPhone = (phone) => {
    setPickupAddress((prev) => ({
      ...prev,
      phone: phone,
    }));
  };

  const handleRequestDelivery = () => {
    if (!pickupAddress.addressText.trim()) {
      Alert.alert("Erreur", "Veuillez sélectionner le point de collecte");
      return;
    }
    if (!dropoffAddress.addressText.trim()) {
      Alert.alert("Erreur", "Veuillez sélectionner le point de livraison");
      return;
    }
    if (!senderPhone.trim()) {
      Alert.alert("Erreur", "Veuillez entrer le numéro de l'expéditeur");
      return;
    }
    if (!recipientPhone.trim()) {
      Alert.alert("Erreur", "Veuillez entrer le numéro du destinataire");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    console.log({
      pickup: pickupAddress,
      dropoff: dropoffAddress,
      size: selectedSize,
      mode: selectedMode,
      remarks: remarks.trim(),
    });
    // Navigation vers l'écran de confirmation

    navigation.navigate("DeliveryDetails", {
      pickup: pickupAddress,
      dropoff: dropoffAddress,
      size: selectedSize,
      mode: selectedMode,
      remarks: remarks.trim(),
      distance: distance ? distance.toFixed(2) : null,
      time: `${estimatedTime} min`, // Calculé dynamiquement
      recipientPhone: recipientPhone,
      senderPhone: senderPhone,
    });
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ef4444" />

      {/* Header fixe */}
      <View style={styles.headerContainer}>
        <SafeAreaView>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Bienvenue à nouveau,</Text>
              <Text style={styles.headerTitle}>Cher•e Client•e</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate("Notifications")}
            >
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Cercles décoratifs */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Map qui déborde - Positionnée avec margin négatif */}
        {/* <View style={styles.mapWrapper}>
          <View style={styles.mapContainer}> */}
        {/* <View style={styles.mapPlaceholder}>
              <View style={styles.driversNearby}>
                <View style={styles.greenDot} />
                <Text style={styles.driversText}>3 drivers nearby</Text>
              </View>

              
              <View style={[styles.marker, { top: 100, left: 180 }]}>
                <Ionicons name="bicycle" size={20} color="#fff" />
              </View>
              <View style={[styles.marker, { top: 140, right: 80 }]}>
                <Ionicons name="bicycle" size={20} color="#fff" />
              </View>
              <View style={[styles.marker, { bottom: 80, right: 20 }]}>
                <Ionicons name="bicycle" size={20} color="#fff" />
              </View>
            </View> */}

        {/* Vrai Map remplacer lors des tests en live */}
        {/* <MapView
                style={styles.mapPlaceholder}
                initialRegion={{
            latitude: 5.3350,
            longitude: -4.0120,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
              >
                <Marker coordinate={{ latitude: 5.3350, longitude: -4.0120 }}>
                  <View style={styles.marker}>
                    <Ionicons name="bicycle" size={20} color="#fff" />
                  </View>
                </Marker>
              </MapView>
          </View>
        </View> */}

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Demander une livraison</Text>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Numéro de l'expéditeur</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call" size={20} color="#ef4444" />
              <TextInput
                style={styles.input}
                placeholder="Numéro de téléphone"
                placeholderTextColor="#9ca3af"
                value={senderPhone}
                onChangeText={setSenderPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Point de collecte</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => handleOpenLocationModal("pickupAddress")}
              activeOpacity={0.7}
            >
              <Ionicons name="location" size={24} color="#ef4444" />
              <Text
                style={[
                  styles.input,
                  !pickupAddress && styles.inputPlaceholder,
                ]}
              >
                {pickupAddress.name || "Point de collecte"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Point de livraison</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => handleOpenLocationModal("dropoffAddress")}
              activeOpacity={0.7}
            >
              <Ionicons name="location-outline" size={24} color="#9ca3af" />
              <Text
                style={[
                  styles.input,
                  !dropoffAddress && styles.inputPlaceholder,
                ]}
              >
                {dropoffAddress.name || "Point de livraison"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Affichage Distance et Temps */}
          {(distance !== null || estimatedTime !== null) && (
            <View style={styles.routeInfoContainer}>
              {calculatingRoute ? (
                <View style={styles.calculatingContainer}>
                  <ActivityIndicator size="small" color="#f97316" />
                  <Text style={styles.calculatingText}>Calcul en cours...</Text>
                </View>
              ) : (
                <View style={styles.routeInfoRow}>
                  {distance !== null && (
                    <View style={styles.routeInfoItem}>
                      <Ionicons name="navigate" size={16} color="#6b7280" />
                      <Text style={styles.routeInfoText}>
                        {formatDistance(distance)}
                      </Text>
                    </View>
                  )}
                  {estimatedTime !== null && (
                    <View style={styles.routeInfoItem}>
                      <Ionicons name="time" size={16} color="#6b7280" />
                      <Text style={styles.routeInfoText}>
                        {formatTime(estimatedTime)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          <View style={styles.inputSection}>
            <Text style={styles.label}>Numéro du destinataire</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call" size={20} color="#ef4444" />
              <TextInput
                style={styles.input}
                placeholder="Numéro de téléphone"
                placeholderTextColor="#9ca3af"
                value={recipientPhone}
                onChangeText={setRecipientPhone}
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                style={styles.contactsButton}
                onPress={handleOpenContacts}
              >
                <Ionicons name="people" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>
              Remarque <Text style={styles.optionalText}>(facultatif)</Text>
            </Text>
            <TextInput
              style={styles.remarksInput}
              placeholder="Ajoutez des instructions pour le livreur..."
              placeholderTextColor="#9ca3af"
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Taille du colis</Text>
            <View style={styles.sizeContainer}>
              {packageSizes.map((size) => (
                <TouchableOpacity
                  key={size.id}
                  style={[
                    styles.sizeButton,
                    selectedSize === size.id && styles.sizeButtonActive,
                  ]}
                  onPress={() => setSelectedSize(size.id)}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      selectedSize === size.id && styles.sizeTextActive,
                    ]}
                  >
                    {size.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Mode de livraison</Text>
            <View style={styles.modesGrid}>
              {deliveryModes.map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  style={[
                    styles.modeCard,
                    selectedMode === mode.id && styles.modeCardActive,
                    !mode.available && styles.modeCardDisabled,
                  ]}
                  onPress={() => mode.available && setSelectedMode(mode.id)}
                  disabled={!mode.available}
                >
                  {!mode.available && (
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonText}>Bientôt</Text>
                    </View>
                  )}
                  <Text style={styles.modeIcon}>{mode.icon}</Text>
                  <Text
                    style={[
                      styles.modeLabel,
                      selectedMode === mode.id && styles.modeLabelActive,
                      !mode.available && styles.modeLabelDisabled,
                    ]}
                  >
                    {mode.label}
                  </Text>
                  {/* <View style={styles.modeTimeContainer}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={!mode.available ? "#d1d5db" : "#6b7280"}
                    />
                    <Text
                      style={[
                        styles.modeTime,
                        !mode.available && styles.modeTimeDisabled,
                      ]}
                    >
                      {mode.time}
                    </Text>
                  </View> */}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.requestButton}
            onPress={handleRequestDelivery}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ThreeDotsLoader color="#fff" size={10} />
            ) : (
              <>
                <Ionicons name="cube-outline" size={24} color="#fff" />
                <Text style={styles.requestButtonText}>Valider la requête</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>

      {/* Modal Contacts */}
      <Modal
        visible={showContactsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowContactsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.contactsModal}>
            {/* Header Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner un contact</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowContactsModal(false);
                  setSearchQuery("");
                }}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Barre de recherche */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#9ca3af" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un contact..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={handleSearchContacts}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearchContacts("")}>
                  <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>

            {/* Liste des contacts */}
            {loadingContacts ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                  Chargement des contacts...
                </Text>
              </View>
            ) : filteredContacts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={64} color="#d1d5db" />
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? "Aucun contact trouvé"
                    : "Aucun contact disponible"}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredContacts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.contactItem}
                    onPress={() => handleSelectContact(item)}
                  >
                    <View style={styles.contactAvatar}>
                      <Text style={styles.contactAvatarText}>
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{item.name}</Text>
                      <Text style={styles.contactPhone}>{item.phone}</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#d1d5db"
                    />
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Localisation */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.contactsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {locationField === "pickup"
                  ? "Point de collecte"
                  : "Point de livraison"}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowLocationModal(false);
                  setLocationSearchQuery("");
                }}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#9ca3af" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher une adresse..."
                placeholderTextColor="#9ca3af"
                value={locationSearchQuery}
                onChangeText={setLocationSearchQuery}
                autoFocus
              />
              {locationSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setLocationSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>

            {loadingLocations ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f97316" />
                <Text style={styles.loadingText}>Recherche en cours...</Text>
              </View>
            ) : locationSuggestions.length === 0 &&
              locationSearchQuery.length >= 3 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="location-outline" size={64} color="#d1d5db" />
                <Text style={styles.emptyText}>Aucun lieu trouvé</Text>
              </View>
            ) : (
              <FlatList
                data={locationSuggestions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.locationItem}
                    onPress={() => handleSelectLocation(item)}
                  >
                    <View
                      style={[
                        styles.locationIcon,
                        item.isCurrentLocation && styles.currentLocationIcon,
                      ]}
                    >
                      <Ionicons
                        name={item.isCurrentLocation ? "navigate" : "location"}
                        size={20}
                        color={item.isCurrentLocation ? "#10b981" : "#f97316"}
                      />
                    </View>
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationDescription}>
                        {item.description}
                      </Text>
                      {item.subtitle && (
                        <Text style={styles.locationSubtitle}>
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#d1d5db"
                    />
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                  locationSearchQuery.length < 3 ? (
                    <View style={styles.emptyContainer}>
                      <Ionicons
                        name="location-outline"
                        size={64}
                        color="#d1d5db"
                      />
                      <Text style={styles.emptyText}>
                        Tapez au moins 3 caractères pour rechercher
                      </Text>
                    </View>
                  ) : null
                }
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  headerContainer: {
    backgroundColor: "#ef4444",
    paddingBottom: 40,
    overflow: "hidden",
    position: "relative",
    zIndex: 10,
    elevation: 8,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: "#ef4444",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingBottom: 80, // Espace pour la map qui va déborder
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    //paddingBottom: 20,
  },
  greeting: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fbbf24",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ef4444",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  decorativeCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    bottom: -30,
    left: -40,
  },
  mapWrapper: {
    marginTop: 30, // Fait remonter la map pour qu'elle déborde du rouge
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mapContainer: {
    // Container pour l'ombre
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  mapPlaceholder: {
    height: 280,
    backgroundColor: "#e5e7eb",
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  driversNearby: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  driversText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  marker: {
    position: "absolute",
    width: 40,
    height: 40,
    backgroundColor: "#ef4444",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  inputPlaceholder: {
    color: "#9ca3af",
  },
  routeInfoContainer: {
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#fef3c7",
  },
  calculatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  calculatingText: {
    fontSize: 14,
    color: "#92400e",
    fontWeight: "500",
  },
  routeInfoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  routeInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  routeInfoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400e",
  },
  contactsButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: "#e539353f",
    justifyContent: "center",
    alignItems: "center",
  },
  remarksInput: {
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sizeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  sizeButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  sizeButtonActive: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  sizeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  sizeTextActive: {
    color: "#ef4444",
  },
  modesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  modeCard: {
    width: (width - 52) / 2,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    position: "relative",
  },
  modeCardActive: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  modeCardDisabled: {
    opacity: 0.6,
  },
  comingSoonBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#f59e0b",
  },
  modeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  modeLabelActive: {
    color: "#ef4444",
  },
  modeLabelDisabled: {
    color: "#9ca3af",
  },
  modeTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  modeTime: {
    fontSize: 12,
    color: "#6b7280",
  },
  modeTimeDisabled: {
    color: "#d1d5db",
  },
  requestButton: {
    flexDirection: "row",
    backgroundColor: "#ef4444",
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
    elevation: 4,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  requestButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  // Modal contact
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  contactsModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1f2937",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 15,
    color: "#6b7280",
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: "#6b7280",
    marginTop: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
  },
  contactAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: "#6b7280",
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff5f0",
    justifyContent: "center",
    alignItems: "center",
  },
  currentLocationIcon: {
    backgroundColor: "#d1fae5",
  },
  locationInfo: {
    flex: 1,
  },
  locationDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  locationSubtitle: {
    fontSize: 13,
    color: "#10b981",
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 24,
  },
});

export default HomeScreen;
