import { createNavigationContainerRef } from '@react-navigation/native';

// Create a navigation reference that can be used outside of components
export const navigationRef = createNavigationContainerRef();

// Track current route state
let currentRoute: any = null;
let routeChangeListeners: Array<(route: any) => void> = [];

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(name, params);
  }
}

export function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}

export function getCurrentRoute() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute();
  }
  return currentRoute;
}

// Track route changes
export function onRouteChange(listener: (route: any) => void) {
  routeChangeListeners.push(listener);
  
  // Return unsubscribe function
  return () => {
    routeChangeListeners = routeChangeListeners.filter(l => l !== listener);
  };
}

// Internal function to notify route changes
export function notifyRouteChange(route: any) {
  currentRoute = route;
  routeChangeListeners.forEach(listener => listener(route));
}