import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import OnboardingScreen from "../screens/OnboardingScreen";
import { checkOnboardingStatus } from "../utils/storage";
import SplashScreen from "../screens/SplashScreen";
import { StyleSheet, View } from "react-native";
import AuthScreen from "../screens/auth/AuthScreen";
import OTPScreen from "../screens/auth/OTPScreen";
import MainTabNavigator from "../screens/app/customer/MainTabNavigator";
import DeliveryDetailsScreen from "../screens/app/customer/DeliveryDetailsScreen";
import TrackingScreen from "../screens/app/customer/TrackingScreen";
import RatingScreen from "../screens/app/customer/RatingScreen";
import DeliveryHistoryDetailsScreen from "../screens/app/customer/DeliveryHistoryDetailsScreen";
import DriverRegistrationScreen from "../screens/auth/DriverRegistrationScreen";
import DriverHomeScreen from "../screens/app/driver/DriverHomeScreen";
import DeliveryInProgressScreen from "../screens/app/driver/DeliveryInProgressScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkInitialRoute();
  }, []);

  const checkInitialRoute = async () => {
    try {
      const completed = await checkOnboardingStatus();
      setHasCompletedOnboarding(completed);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setTimeout(()=> {
        setIsLoading(false);
      }, 2000)
    }
  };

  if (isLoading) {
    return (
      <>
        <SplashScreen />
      </>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
          animation: 'scale_from_center'
        }}
        initialRouteName={hasCompletedOnboarding ? 'Auth' : 'Onboarding'}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen}/>
        <Stack.Screen name="Auth" component={AuthScreen}/>
        <Stack.Screen name="OTP" component={OTPScreen}/>
        <Stack.Screen name="CustomerApp" component={MainTabNavigator} />
        <Stack.Screen name="DeliveryDetails" component={DeliveryDetailsScreen} />
        <Stack.Screen name="Tracking" component={TrackingScreen} />
        <Stack.Screen name="Rating" component={RatingScreen} />
        <Stack.Screen name="DeliveryHistoryDetails" component={DeliveryHistoryDetailsScreen} />
        <Stack.Screen name="DriverRegistration" component={DriverRegistrationScreen} />
        <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
        <Stack.Screen name="DeliveryInProgress" component={DeliveryInProgressScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 30
  }
})

export default AppNavigator