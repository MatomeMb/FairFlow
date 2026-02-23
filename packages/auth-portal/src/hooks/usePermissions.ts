import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { RolePermission } from "../types/portal";

export function usePermissions() {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("role_permissions")
      .select("*")
      .order("role")
      .order("resource")
      .then(({ data }) => {
        setPermissions(data ?? []);
        setLoading(false);
      });
  }, []);

  return { permissions, loading };
}
