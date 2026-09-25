/* ShilpSaathi (शिल्प साथी) — mobile app (Expo SDK 57).
   Same backend and design as web/ — artisan AI wizard + buyer marketplace. */
import { View, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { C } from "./src/theme";
import { ToastProvider, Loading } from "./src/ui";
import { SessionProvider, useSession } from "./src/session";
import { WelcomeScreen, LoginScreen, OnboardingScreen } from "./src/screens/Auth";
import { ArtisanDashboard, MyProductsScreen, EnquiriesScreen, EnquiryDetailScreen, ArtisanProfileScreen } from "./src/screens/artisan/ArtisanScreens";
import AddProductScreen from "./src/screens/artisan/AddProduct";
import {
  MarketHomeScreen, ProductListScreen, ProductDetailScreen, BulkEnquiryScreen, ChatsScreen, ChatDetailScreen, BuyerHomeScreen, StorefrontScreen,
} from "./src/screens/buyer/BuyerScreens";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: C.bg, primary: C.green, card: C.white, text: C.ink, border: C.border } };
const stackOpts = {
  headerTintColor: C.ink,
  headerTitleStyle: { fontWeight: "800", color: C.navy },
  headerShadowVisible: false,
  headerStyle: { backgroundColor: C.white },
  contentStyle: { backgroundColor: C.bg },
};
const tabOpts = (color) => ({
  headerShown: false,
  tabBarActiveTintColor: color,
  tabBarInactiveTintColor: C.muted,
  tabBarLabelStyle: { fontWeight: "700", fontSize: 11 },
});
const icon = (name) => ({ color, size }) => <Feather name={name} size={size - 2} color={color} />;

function AddTabButton({ onPress }) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: "center", justifyContent: "center" }} accessibilityLabel="Add product">
      <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: C.green, alignItems: "center", justifyContent: "center", marginTop: -18, elevation: 6, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }}>
        <Feather name="plus" size={28} color={C.white} />
      </View>
    </Pressable>
  );
}

const Empty = () => null;

function ArtisanTabs({ navigation }) {
  return (
    <Tab.Navigator screenOptions={tabOpts(C.green)}>
      <Tab.Screen name="Home" component={ArtisanDashboard} options={{ tabBarIcon: icon("grid"), title: "Dashboard" }} />
      <Tab.Screen name="Products" component={MyProductsScreen} options={{ tabBarIcon: icon("package"), title: "My Products" }} />
      <Tab.Screen name="Add" component={Empty} options={{ title: "", tabBarButton: () => <AddTabButton onPress={() => navigation.navigate("AddProduct")} /> }} />
      <Tab.Screen name="Enquiries" component={EnquiriesScreen} options={{ tabBarIcon: icon("message-square") }} />
      <Tab.Screen name="Profile" component={ArtisanProfileScreen} options={{ tabBarIcon: icon("user") }} />
    </Tab.Navigator>
  );
}

function BuyerTabs() {
  return (
    <Tab.Navigator screenOptions={tabOpts(C.blue)}>
      <Tab.Screen name="Market" component={MarketHomeScreen} options={{ tabBarIcon: icon("home"), title: "Home" }} />
      <Tab.Screen name="Products" component={ProductListScreen} options={{ tabBarIcon: icon("search") }} />
      <Tab.Screen name="Chats" component={ChatsScreen} options={{ tabBarIcon: icon("message-circle") }} />
      <Tab.Screen name="Account" component={BuyerHomeScreen} options={{ tabBarIcon: icon("user"), title: "Dashboard" }} />
    </Tab.Navigator>
  );
}

/**
 * One stack whose screens depend on the active role (React Navigation's auth-flow
 * pattern). When the role changes, the screen set changes and the navigator jumps
 * to the first screen of the new set; `navigationKey` drops shared screens such as
 * Login so switching roles never leaves you on a stale screen.
 */
function RootNavigator() {
  const { ready, activeRole, sessions } = useSession();
  if (!ready) return <Loading label="Starting ShilpSaathi…" />;
  const role = activeRole && sessions[activeRole] ? activeRole : "guest";
  const needsOnboarding = role === "artisan" && !sessions.artisan?.user?.craft;

  return (
    <Stack.Navigator screenOptions={stackOpts}>
      {role === "artisan" && (
        <Stack.Group>
          {needsOnboarding && <Stack.Screen name="Welcome-Onboarding" component={OnboardingScreen} options={{ title: "Your Profile", headerBackVisible: false }} />}
          <Stack.Screen name="ArtisanTabs" component={ArtisanTabs} options={{ headerShown: false }} />
          <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ title: "Add Product with AI" }} />
          <Stack.Screen name="EnquiryDetail" component={EnquiryDetailScreen} options={{ title: "Negotiation" }} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ title: "Your Profile" }} />
        </Stack.Group>
      )}
      {role === "buyer" && (
        <Stack.Group>
          <Stack.Screen name="BuyerTabs" component={BuyerTabs} options={{ headerShown: false }} />
          <Stack.Screen name="BulkEnquiry" component={BulkEnquiryScreen} options={{ title: "Request Bulk Order" }} />
          <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ title: "Chat / Negotiation" }} />
        </Stack.Group>
      )}
      {role === "guest" && (
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        </Stack.Group>
      )}
      <Stack.Group navigationKey={role}>
        {role !== "guest" && <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: "Product Details" }} />}
        {role !== "guest" && <Stack.Screen name="Storefront" component={StorefrontScreen} options={{ title: "Artisan Shop" }} />}
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false, presentation: role === "guest" ? "card" : "modal" }} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <ToastProvider>
          <NavigationContainer theme={theme}>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </ToastProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}
