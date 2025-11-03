import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import AuthScreen from "../screens/Auth/AuthScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import { checkOnboardingStatus } from "../utils/storage";
import SplashScreen from "../screens/SplashScreen";
import { StyleSheet, View } from "react-native";

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