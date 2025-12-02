import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isDealer: user?.role === 'dealer',
    isDataAnalyst: user?.role === 'data_analyst',
    isTransportation: user?.role === 'transportation',
  };
}
