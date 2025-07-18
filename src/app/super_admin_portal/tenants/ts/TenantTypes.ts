// TenantTypes.ts
export interface Tenant {
  tenant_name: string;
  tenant_status: "active" | "inactive";
  schema: string;
  created_at?: string;
  last_modified?: string;
}
