import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const { token, user } = useAuthStore();
  
  if (!token) {
    return <Redirect href="/(auth)/role-select" />;
  }
  
  // If token exists, redirect to appropriate group
  return <Redirect href={user?.role === 'owner' ? '/(owner)' : '/(customer)'} />;
}
