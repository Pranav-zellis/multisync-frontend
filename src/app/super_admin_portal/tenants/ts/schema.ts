// src/app/super_Admin/tenants/schema.ts

export const GET_TENANTS_QUERY = `
  query GetTenants($skip: Int!, $take: Int!, $search: String) {
    tenants(skip: $skip, take: $take, search: $search) {
      tenants {
        tenant_name
        tenant_status
        schema
        created_at
        last_modified
      }
      totalCount
      activeTenants {
        tenant_name
      }
    }
  }
`;

export const CREATE_TENANT_MUTATION = `
  mutation CreateTenant($input: CreateTenantInput!) {
    createTenant(createTenantInput: $input) {
      tenant_name
      tenant_status
      schema
    }
  }
`;

export const UPDATE_TENANT_MUTATION = `
  mutation UpdateTenant($input: UpdateTenantInput!) {
    updateTenant(updateTenantInput: $input) {
      schema
      tenant_name
      tenant_status
    }
  }
`;
