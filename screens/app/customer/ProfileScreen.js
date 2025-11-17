// src/screens/ProfileScreen.js
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../../store/context/auth-context";
import { getClientProfile } from "../../../utils/client";
import ThreeDotsLoader from "../../../components/ThreeDotsLoader";

const ProfileScreen = ({ navigation }) => {
  const authCtx = useContext(AuthContext);
  const [client, setClient] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Données utilisateur (à remplacer par des vraies données)
  const userData = {
    name: "John Doe",
    phone: "+237 6 XX XX XX XX",
    email: "john.doe@example.com",
    rating: 4.9,
    totalRatings: 42,
    totalDeliveries: 127,
    paymentMethods: 2,
    memberSince: "January 2024",
  };

  useEffect(() => {
    fecthUserDetails()
  }, []);

  const fecthUserDetails = async () => {
    try {
      setIsLoading(true);

      const response = await getClientProfile(authCtx.token);
      
      setClient(response);

      // Animation d'apparition
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("Erreur chargement historique:", error);
      Alert.alert(
        'Erreur',
        'Impossible de charger votre profil. Veuillez réessayer.',
        [
          { text: 'Réessayer', onPress: fecthUserDetails },
          { text: 'Annuler', style: 'cancel' },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            // Logique de déconnexion
            authCtx.logout();
            // navigation.reset({
            //   index: 0,
            //   routes: [{ name: 'Auth' }],
            // });
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Calculer dynamiquement les stats depuis userData
  const getStats = () => {
    if (!client) return [];

    return [
      {
        id: 'deliveries',
        icon: 'cube-outline',
        value: client.clientProfile.bookedDeliveriesCount || 0,
        label: 'Livraisons',
        color: '#ef4444',
      },
      {
        id: 'methods',
        icon: 'card-outline',
        value:  1,
        label: 'Méthodes',
        color: '#ef4444',
      },
      {
        id: 'rating',
        icon: 'star',
        value: client.clientProfile.averageRating,
        label: 'Note',
        color: '#fbbf24',
      },
    ];
  };

  const menuItems = [
    {
      id: "edit-profile",
      title: "Profil",
      subtitle: "Mettez à jour vos informations personnelles",
      icon: "person-outline",
      iconBg: "#fef2f2",
      iconColor: "#ef4444",
      onPress: () => navigation.navigate("EditProfile"),
    },
    {
      id: "payment",
      title: "Methodes de paiement",
      subtitle: "Gérez vos options de paiement",
      icon: "card-outline",
      iconBg: "#fef2f2",
      iconColor: "#ef4444",
      onPress: () => navigation.navigate("PaymentMethods"),
    },
    {
      id: "notifications",
      title: "Notifications",
      subtitle: "Configurer les préférences de notification",
      icon: "notifications-outline",
      iconBg: "#fef2f2",
      iconColor: "#ef4444",
      onPress: () => navigation.navigate("Notifications"),
    },
    {
      id: "privacy",
      title: "Confidentialité et Sécurité",
      subtitle: "Gérez vos paramètres de confidentialité",
      icon: "shield-checkmark-outline",
      iconBg: "#fef2f2",
      iconColor: "#ef4444",
      onPress: () => navigation.navigate("Privacy"),
    },
    {
      id: "help",
      title: "Support",
      subtitle: "Obtenir de l'aide et consulter la FAQ",
      icon: "help-circle-outline",
      iconBg: "#fef2f2",
      iconColor: "#ef4444",
      onPress: () => navigation.navigate("HelpCenter"),
    },
  ];

  // Loader Component
  const LoaderComponent = () => (
    <View style={styles.loaderContainer}>
      <View style={styles.loaderContent}>
        <View style={styles.loaderIconContainer}>
          <Ionicons name="person-outline" size={40} color="#ef4444" />
        </View>
        <ThreeDotsLoader color="#ef4444" size={12} />
        <Text style={styles.loaderTitle}>Chargement du profil</Text>
        <Text style={styles.loaderSubtitle}>Récupération de vos informations...</Text>
      </View>
    </View>
  );

  // Afficher le loader pendant le chargement initial
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="#ef4444" />
        <LoaderComponent />
      </SafeAreaView>
    );
  }

  // Si pas de données utilisateur
  if (!client) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="#ef4444" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Erreur de chargement</Text>
          <Text style={styles.errorSubtitle}>
            Impossible de charger votre profil
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const stats = getStats()
  /* [
    {
      id: "deliveries",
      icon: "cube-outline",
      value: userData.totalDeliveries,
      label: "Deliveries",
      color: "#ef4444",
    },
    {
      id: "methods",
      icon: "card-outline",
      value: userData.paymentMethods,
      label: "Methods",
      color: "#ef4444",
    },
    {
      id: "rating",
      icon: "star",
      value: userData.rating,
      label: "Rating",
      color: "#fbbf24",
    },
  ]; */

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar style="light" backgroundColor="#ef4444" />

      {/* Header avec dégradé */}
      <View style={styles.headerContainer}>
        <SafeAreaView>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
        </SafeAreaView>

        {/* Cercles décoratifs */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color="#fff" />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{client.clientProfile.fullName === null ? "Anonyme" : client.clientProfile.fullName}</Text>
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={14} color="#6b7280" />
              <Text style={styles.userPhone}>{client.phone}</Text>
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text style={styles.ratingText}>
                {client.clientProfile.averageRating}{" "}
                {/* <Text style={styles.ratingCount}>
                  ({client.clientProfile.averageRating} ratings)
                </Text> */}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <React.Fragment key={stat.id}>
                <View style={styles.statItem}>
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: `${stat.color}20` },
                    ]}
                  >
                    <Ionicons name={stat.icon} size={24} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
                {index < stats.length - 1 && (
                  <View style={styles.statDivider} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={24} color={item.iconColor} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Noah's Delivery v1.0.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  headerContainer: {
    backgroundColor: "#ef4444",
    paddingBottom: 100,
    overflow: "hidden",
    position: "relative",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
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
    right: 100,
  },
  content: {
    flex: 1,
    marginTop: -80,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  avatarContainer: {
    alignSelf: "center",
    marginBottom: 16,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
    elevation: 4,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  userPhone: {
    fontSize: 15,
    color: "#6b7280",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  ratingCount: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6b7280",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: "#e5e7eb",
    alignSelf: "center",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 8,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
    borderRadius: 16,
    paddingVertical: 18,
    gap: 12,
    borderWidth: 2,
    borderColor: "#fee2e2",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ef4444",
  },
  versionText: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 24,
  },
  // Loader
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loaderContent: {
    alignItems: 'center',
    padding: 32,
  },
  loaderIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#fee2e2',
  },
  loaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 24,
  },
  loaderSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  dotsLoaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ProfileScreen;
