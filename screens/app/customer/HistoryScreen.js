import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import DeliveryCard from "../../../components/DeliveryCard";

function HistoryScreen ({navigation}) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  // Données mockées
  const deliveries = [
    {
      id: 'DEL1730734561234',
      date: '01/11/2024',
      time: '14:30',
      status: 'completed',
      pickup: {
        location: 'Cocody, Abidjan',
        address: 'Rue des Jardins, Cocody',
      },
      dropoff: {
        location: 'Plateau, Abidjan',
        address: 'Avenue Chardy, Plateau',
      },
      driver: {
        name: 'Kouassi Yao',
        photo: 'https://i.pravatar.cc/150?img=12',
        vehicle: 'Honda CB125F',
        rating: 5,
      },
      price: 2500,
      packageSize: 'small',
      deliveryMode: 'motorbike',
    },
    {
      id: 'DEL1730634561234',
      date: '02/11/2024',
      time: '10:15',
      status: 'completed',
      pickup: {
        location: 'Marcory, Abidjan',
        address: 'Zone 4, Marcory',
      },
      dropoff: {
        location: 'Yopougon, Abidjan',
        address: 'Siporex, Yopougon',
      },
      driver: {
        name: 'Aya',
        photo: 'https://i.pravatar.cc/150?img=25',
        vehicle: 'Yamaha FZ',
        rating: 4,
      },
      price: 3200,
      packageSize: 'medium',
      deliveryMode: 'motorbike',
    },
    {
      id: 'DEL1730534561234',
      date: '03/11/2024',
      time: '16:45',
      status: 'canceled',
      pickup: {
        location: 'Adjamé, Abidjan',
        address: 'Marché Adjamé',
      },
      dropoff: {
        location: 'Abobo, Abidjan',
        address: 'Abobo Gare',
      },
      driver: {
        name: 'Koffi',
        photo: 'https://i.pravatar.cc/150?img=33',
        vehicle: 'TVS Apache',
        rating: 0,
      },
      price: 1800,
      packageSize: 'small',
      deliveryMode: 'motorbike',
    },
  ];

  const filters = [
    { id: 'all', label: 'Tout' },
    { id: 'completed', label: 'Terminée' },
    { id: 'canceled', label: 'Annulée' },
  ];

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
      <ScrollView
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
      </ScrollView>
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
})

export default HistoryScreen