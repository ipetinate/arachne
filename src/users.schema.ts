export const usersTypeDefs = `
  type Query {
    getUser(userId: ID!): User
  }

  type Mutation {
    updateUser: User
  }

  type User {
    id: ID
    name: String
  }
 
`
