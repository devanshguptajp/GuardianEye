import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Child {
  id: string;
  name: string;
  avatar_url: string | null;
  birth_year: number | null;
  color: string | null;
}

export const useChildren = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user) return;
    const { data } = await supabase.from("children").select("*").order("created_at", { ascending: true });
    setChildren(data ?? []);
    setLoading(false);
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [user?.id]);

  return { children, loading, refresh };
};
