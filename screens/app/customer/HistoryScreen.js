import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useRef, useState } from "react";
import { Animated, FlatList, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import DeliveryCard from "../../../components/DeliveryCard";
import { getDeliveries } from "../../../utils/delivery";
import { AuthContext } from "../../../store/context/auth-context";
import ThreeDotsLoader from "../../../components/ThreeDotsLoader";
import EmptyState from "../../../components/EmptyState";

function HistoryScreen ({navigation}) {
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const authCtx = useContext(AuthContext);

  const filters = [
    { id: 'all', label: 'Tout' },
    { id: 'DELIVERED', label: 'Terminée' },
    { id: 'CANCELLED', label: 'Annulée' },
  ];

  const packageSize = [
    {
      id: 'SMALL',
      name: 'Petit'
    },
    {
      id: 'MEDIUM',
      name: 'Moyen'
    },
    {
      id: 'LARGE',
      name: 'Large'
    },
  ]

  useEffect(() => {
    loadingHistory()
  }, [])

  // Animation du loader
  useEffect(() => {
    if (isLoading) {
      // Rotation de l'icône
      Animated.loop(
        Animated.timing(iconRotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();

      // Pulse effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isLoading]);

  const loadingHistory = async () => {
    try{
      setIsLoading(true);

      const response = await getDeliveries(authCtx.token)

      setDeliveries(response)

      // Animer l'apparition
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }catch(error) {
      console.error('Erreur chargement historique:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Rafraîchir
  const onRefresh = async () => {
    setRefreshing(true);
    await loadingHistory();
    setRefreshing(false);
  }

  // Obtenir le badge de statut
  const getStatusBadge = (status) => {
    //console.log(status);
    const statusMap = {
      DELIVERED: { label: 'Livré', color: '#10b981', icon: 'checkmark-circle' },
      CANCELLED: { label: 'Annulé', color: '#ef4444', icon: 'close-circle' },
      PENDING: { label: 'En attente', color: '#f59e0b', icon: 'time' },
    };
    return statusMap[status] || statusMap.PENDING;
  };

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };
  // Loader Component
  const LoaderComponent = () => {
    const spin = iconRotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={styles.loaderContainer}>
        <View style={styles.loaderContent}>
          {/* Animated Icon */}
          {/* <Animated.View
            style={{
              transform: [{ rotate: spin }],
            }}
          >
            <View style={styles.loaderIconContainer}>
              <Ionicons name="time-outline" size={40} color="#ef4444" />
            </View>
          </Animated.View> */}

          {/* Three Dots Loader */}
          <ThreeDotsLoader color="#ef4444" size={14} />

          {/* Text */}
          <Text style={styles.loaderTitle}>Chargement de l'historique</Text>
          <Text style={styles.loaderSubtitle}>Récupération de vos livraisons...</Text>
        </View>
      </View>
    );
  };

  // Filtrer les livraisons
  // const getFilteredDeliveries = () => {
  //   if (filter === 'all') return deliveries;
  //   if (filter === 'completed') {
  //     return deliveries.filter(d => d.status === 'DELIVERED');
  //   }
  //   if (filter === 'cancelled') {
  //     return deliveries.filter(d => d.status === 'CANCELLED');
  //   }
  //   return deliveries;
  // };

  // Render Item
  const renderItem = ({ item, index }) => {
    const statusBadge = getStatusBadge(item.status);

    return (
      <Animated.View
        style={[
          styles.deliveryCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 30],
                  outputRange: [0, 30],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate('DeliveryHistoryDetails', { delivery: item })
          }
        >
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.statusIcon, { backgroundColor: `${statusBadge.color}15` }]}>
                <Ionicons name={statusBadge.icon} size={20} color={statusBadge.color} />
              </View>
              <View>
                <Text style={styles.cardId}>#{item.id}</Text>
                <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
              </View>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: `${statusBadge.color}15` }]}>
              <Text style={[styles.statusBadgeText, { color: statusBadge.color }]}>
                {statusBadge.label}
              </Text>
            </View>
          </View>

          {/* Addresses */}
          <View style={styles.addressesContainer}>
            <View style={styles.addressRow}>
              <View style={[styles.addressDot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.addressText} numberOfLines={1}>
                {item.addressDeliveries.find(
                  (addr) => addr.type === "PICKUP"
                ).name}
              </Text>
            </View>

            <View style={styles.addressLine} />

            <View style={styles.addressRow}>
              <View style={[styles.addressDot, { backgroundColor: '#1f2937' }]} />
              <Text style={styles.addressText} numberOfLines={1}>
                {item.addressDeliveries.find(
                  (addr) => addr.type === "DROPOFF"
                ).name}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <View style={styles.cardFooterItem}>
              <Ionicons name="cube-outline" size={16} color="#6b7280" />
              <Text style={styles.cardFooterText}>{packageSize.find(size => size.id === item.packageSize).name}</Text>
            </View>

            <View style={styles.cardFooterItem}>
              <Ionicons name="bicycle-outline" size={16} color="#6b7280" />
              <Text style={styles.cardFooterText}>{item.deliveryType}</Text>
            </View>

            <View style={styles.cardFooterItem}>
              <Text style={styles.cardPrice}>{item.estimatedPrice} FCFA</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Afficher le loader pendant le chargement initial
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <LoaderComponent />
      </SafeAreaView>
    );
  }

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesFilter = selectedFilter === 'all' || delivery.status === selectedFilter;
    const matchesSearch = 
      delivery.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.pickup.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.dropoff.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDeliveryPress = (delivery) => {
    navigation.navigate('DeliveryHistoryDetails', { delivery });
  };

  return (
    <SafeAreaProvider style={styles.container}>
    <StatusBar barStyle="dark-content" backgroundColor="#ef4444" />
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          {/* <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity> */}
          <Text style={styles.headerTitle}>Historique</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#fff" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location or order ID"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </SafeAreaView>
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter.id && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Deliveries List */}
      {/* <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredDeliveries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucune courses trouvées</Text>
          </View>
        ) : (
          filteredDeliveries.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              onPress={() => handleDeliveryPress(delivery)}
            />
          ))
        )}

        <View style={{ height: 20 }} />
      </ScrollView> */}

      {/* List */}
      <FlatList
        data={filteredDeliveries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerSafeArea: {
    backgroundColor: '#ef4444',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  filterButtonActive: {
    backgroundColor: '#ef4444',
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  deliveryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Addresses
  addressesContainer: {
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  addressLine: {
    width: 2,
    height: 20,
    backgroundColor: '#e5e7eb',
    marginLeft: 4,
    marginVertical: 4,
  },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  cardFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardFooterText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
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
})

export default HistoryScreen