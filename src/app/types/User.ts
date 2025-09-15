export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  user_type: string;
  tenant_names: string[]; // ✅ always array (can be empty)
  real_id?: number;         // ✅ needed for tenant updates
  tenant_ids?: string[];
}
