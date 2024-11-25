import { mergeSchema } from '@/utils'

describe('mergeSchema', () => {
  test('should merge schemas correctly', () => {
    const inputSchema = `type Query {
    signIn: Boolean
}

type Mutation {
  signOut: Boolean
  register: User
}

type User {
  id: ID
  name: String
}

type Query {
  getUser: User
  signIn: Boolean
}

type Mutation {
  updateUser: User
  signOut: Boolean
  register: User
}

type User {
  id: ID
  name: String
  email: String
}`

    const expectedOutput = `type Query {
  getUser: User
  signIn: Boolean
}

type Mutation {
  register: User
  signOut: Boolean
  updateUser: User
}

type User {
  email: String
  id: ID
  name: String
}`.trim()

    const result = mergeSchema(inputSchema)
    expect(result).toEqual(expectedOutput)
  })

  test('should handle empty schema', () => {
    const inputSchema = ``

    const expectedOutput = ``

    const result = mergeSchema(inputSchema)

    expect(result).toEqual(expectedOutput)
  })

  test('should handle types without repeated fields', () => {
    const inputSchema = `
        type Query {
            getUser: User
        }

        type Query {
            getUser: User
        }
    `

    const expectedOutput = `type Query {
  getUser: User
}`.trim()

    const result = mergeSchema(inputSchema)

    expect(result).toEqual(expectedOutput)
  })

  test('should merge types correctly even with unnecessary spaces', () => {
    const inputSchema = `
        type Query {
            signIn: Boolean
        }

        type   Query   {
            getUser : User
        }

        type   Query    {
             signIn  :  Boolean 
        }
    `

    const expectedOutput = `type Query {
  getUser: User
  signIn: Boolean
}`.trim()

    const result = mergeSchema(inputSchema)

    expect(result).toEqual(expectedOutput)
  })

  test('should merge schemas with input types correctly', () => {
    const inputSchema = `
        input UserInput {
          name: String
          email: String
        }

        input UserInput {
          phone: String
        }
    `

    const expectedOutput = `input UserInput {
  email: String
  name: String
  phone: String
}`.trim()

    const result = mergeSchema(inputSchema)
    expect(result).toEqual(expectedOutput)
  })

  test('should merge schemas with enum types correctly', () => {
    const inputSchema = `
        enum UserRole {
          ADMIN
          USER
        }

        enum UserRole {
          GUEST
        }
    `

    const expectedOutput = `enum UserRole {
  ADMIN
  GUEST
  USER
}`.trim()

    const result = mergeSchema(inputSchema)
    expect(result).toEqual(expectedOutput)
  })

  test('should merge schemas with interface types correctly', () => {
    const inputSchema = `
        interface Node {
          id: ID
        }

        interface Node {
          createdAt: String
        }
    `

    const expectedOutput = `interface Node {
  createdAt: String
  id: ID
}`.trim()

    const result = mergeSchema(inputSchema)
    expect(result).toEqual(expectedOutput)
  })

  test('should merge schemas with scalar types correctly', () => {
    const inputSchema = `
        scalar DateTime

        scalar JSON
    `

    const expectedOutput = `scalar DateTime
scalar JSON`.trim()

    const result = mergeSchema(inputSchema)
    expect(result).toEqual(expectedOutput)
  })

  test('should handle schemas with comments', () => {
    const inputSchema = `
        # This is a comment
        type Query {
          getUser: User
        }

        # Another comment
        type Query {
          signIn: Boolean
        }
    `

    const expectedOutput = `type Query {
  getUser: User
  signIn: Boolean
}`.trim()

    const result = mergeSchema(inputSchema)
    expect(result).toEqual(expectedOutput)
  })

  test('should handle schemas with descriptions', () => {
    const inputSchema = `
        """
        This is a description
        """
        type Query {
          getUser: User
        }

        """
        Another description
        """
        type Query {
          signIn: Boolean
        }
    `

    const expectedOutput = `type Query {
  getUser: User
  signIn: Boolean
}`.trim()

    const result = mergeSchema(inputSchema)
    expect(result).toEqual(expectedOutput)
  })

  test('should handle schemas with multiple types and fields', () => {
    const inputSchema = `
        type Query {
          getUser: User
          signIn: Boolean
        }

        type Mutation {
          register: User
          signOut: Boolean
        }

        type User {
          id: ID
          name: String
        }

        type Query {
          getUser: User
          signIn: Boolean
        }

        type Mutation {
          updateUser: User
          signOut: Boolean
          register: User
        }

        type User {
          id: ID
          name: String
          email: String
        }
    `

    const expectedOutput = `type Query {
  getUser: User
  signIn: Boolean
}

type Mutation {
  register: User
  signOut: Boolean
  updateUser: User
}

type User {
  email: String
  id: ID
  name: String
}`.trim()

    const result = mergeSchema(inputSchema)
    expect(result).toEqual(expectedOutput)
  })
})
