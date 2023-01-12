import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Relationship {
      parentUser: User!
      childUser: User!
      createdAt: DateTime!
      relation: String!
    }

    type PaginatedRelationship {
      page: PageInfo!
      nodes: [Relationship!]!
    }

    input RelationshipFilter {
      parentUser: UserFilter
      childUser: UserFilter
      createdAt: DateTimeFilter
      relation: StringFilter
    }

    input RelationshipOrder {
      parentUser: UserOrder
      childUser: UserOrder
      createdAt: OrderDirection
      relation: OrderDirection
    }

    input RelationshipUpdate {
      relation: String
    }
  `,
})
