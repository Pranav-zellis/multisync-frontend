// src/app/super_Admin/tenants/schema.ts

export const DELETE_SUPER_ADMIN = `
  mutation DeleteUser($input: DeleteUserInput!) {
    deleteUser(input: $input)
  }
`;

export const GET_SUPER_ADMIN = `
  query GetSuperAdmins($input: PaginatedUsersInput!) {
    getSuperAdmins(input: $input) {
      users {
        id
        username
        first_name
        last_name
        email
        phone_number
      }
      totalCount
    }
  }
`;

export const UPDATE_SUPER_ADMIN = `
   mutation CreateUser($input: CreateUserInput!) {
      createUser(input: $input) {
        username
        email
      }
    }
`;
