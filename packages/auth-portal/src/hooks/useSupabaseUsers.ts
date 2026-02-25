import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { UserRole, AppRole } from "../types/portal";

export function useSupabaseUsers() {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("assigned_at", { ascending: false });
    if (error) setError(error.message);
    else setUsers(data ?? []);
    setLoading(false);
  }, []);

  const updateRole = async (userId: string, newRole: AppRole) => {
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId);
    if (error) throw error;
    await fetchUsers();
  };

  const removeUser = async (id: string) => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("id", id);
    if (error) throw error;
    await fetchUsers();
  };

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return { users, loading, error, updateRole, removeUser, refresh: fetchUsers };
}
