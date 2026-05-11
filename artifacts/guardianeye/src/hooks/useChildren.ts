import { useListChildren } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { getListChildrenQueryKey } from "@workspace/api-client-react";

export interface Child {
  id: string;
  name: string;
  avatar_url: string | null;
  birth_year: number | null;
  color: string | null;
}

export const useChildren = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useListChildren({ query: { enabled: !!user } as any });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey() });
  };

  return {
    children: (data ?? []) as Child[],
    loading: isLoading,
    refresh,
  };
};
