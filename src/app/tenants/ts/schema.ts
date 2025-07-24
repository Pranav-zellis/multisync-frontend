export const GET_TENANTS_SCHEMA = `
    query GetTenantsBySchemas($user: UserInput!) {
        tenantsBySchemas(user: $user) {
            schema
            tenant_name
            tenant_status
        }
    }
`;