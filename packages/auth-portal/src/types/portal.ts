export type AppRole = "ceo" | "cto" | "merchant" | "investor" | "consumer";

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_at: string;
}

export interface RolePermission {
  id: string;
  role: AppRole;
  resource: string;
  can_select: boolean;
  can_insert: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  merchant_id: string;
  ethical_score: number;
  in_stock: boolean;
  created_at: string;
}

export interface Merchant {
  id: string;
  name: string;
  email: string;
  category: string;
  ethical_score: number;
  status: "active" | "pending" | "suspended";
  joined_at: string;
  product_count: number;
  total_sales: number;
}
