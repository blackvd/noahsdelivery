import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "@onboarding_completed";

export const checkOnboardingStatus = async () => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value !== null;
  } catch (error) {
    console.error("Erreur lors de la vérification:", error);
    return false;
  }
};

export const completeOnboarding = async () => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
  }
};

export const resetOnboarding = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch (error) {
    console.error("Erreur lors de la réinitialisation:", error);
  }
};
