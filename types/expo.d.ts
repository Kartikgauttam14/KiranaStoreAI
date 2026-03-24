declare module 'expo-router' {
  export function useRouter(): any;
  export function useLocalSearchParams(): any;
  export const Stack: any;
  export const Tabs: any;
}

declare module 'expo-location' {
  export function requestForegroundPermissionsAsync(): any;
  export function getCurrentPositionAsync(options: any): any;
  export const Accuracy: any;
}

declare module 'expo-image-picker' {
  export function launchImageLibraryAsync(options: any): any;
  export function launchCameraAsync(options: any): any;
  export const MediaTypeOptions: any;
}

declare module '@react-navigation/native' {
  export function useNavigation(): any;
  export function useRoute(): any;
  export function useFocusEffect(effect: () => void | (() => void)): void;
}

declare module '@react-navigation/bottom-tabs' {
  export interface BottomTabNavigationOptions {
    [key: string]: any;
  }
}

declare module 'react-native-safe-area-context' {
  export function SafeAreaProvider(props: any): any;
  export function useSafeAreaInsets(): any;
}
