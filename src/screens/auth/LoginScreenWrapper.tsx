import React from "react";
import { LoginScreen as LoginScreenComponent } from "../LoginScreen";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AuthStackParamList } from "../../navigation/RootNavigator";

type LoginNavigationProp = StackNavigationProp<AuthStackParamList, "Login">;

export const LoginScreenWrapper: React.FC = () => {
  const navigation = useNavigation<LoginNavigationProp>();

  const handleLoginSuccess = () => {
    // Navigation will be handled by the root navigator based on authentication state
    console.log("Login successful - navigation will be handled automatically");
  };

  return <LoginScreenComponent onLoginSuccess={handleLoginSuccess} />;
};
