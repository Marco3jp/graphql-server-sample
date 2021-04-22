import {ApolloServer, gql, SchemaDirectiveVisitor} from 'apollo-server';
import {v4 as uuidv4} from 'uuid';
import {UserAPI} from "./datasource/user";
import {StoreAPI} from "./datasource/store";
import {ReviewAPI} from "./datasource/review";
import {GraphQLField} from "graphql";

const typeDefs = gql`
    type User {
        id: ID!
        name: String!
        reviews: [Review!] @publishedOnly
        createdAt: String!
        deletedAt: String
    }

    input ReviewInput {
        userId: ID!
        storeId: ID!
        reviewText: String!
        isPublished: Boolean! = true
    }

    type Review {
        id: ID!
        user: User!
        store: Store!
        reviewText: String!
        isPublished: Boolean!
        createdAt: String!
        publishAt: String
        deletedAt: String
    }

    type Store {
        id: ID!
        name: String!
        address: String
        reviews: [Review!] @publishedOnly
        createdAt: String!
        deletedAt: String
    }

    type Query {
        stores: [Store!]!
        users: [User!]!
    }

    type Mutation {
        postReview(review: ReviewInput): Review!
    }

    directive @publishedOnly on FIELD_DEFINITION
`;

class PublishedOnlyDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field: GraphQLField<any, any>) {
        field.resolve = function (){
            // TODO: Reviewがまだないのでどうにかする
        }
    }
}

const resolvers = {
    Query: {
        stores: (parent, args, {dataSources}) => dataSources.storeAPI.stores,
        users: (parent, args, {dataSources}) => dataSources.userAPI.users
    },
    Review: {
        user(parent, args, {dataSources}) {
            return dataSources.userAPI.getUserById(parent.userId)
        },
        store(parent, args, {dataSources}) {
            return dataSources.storeAPI.getStoreById(parent.storeId);
        }
    },
    User: {
        async reviews(parent, args, {dataSources}) {
            return await dataSources.reviewAPI.getReviewsByUserIDs.load(parent.id)
        }
    },
    Store: {
        async reviews(parent, args, {dataSources}) {
            return await dataSources.reviewAPI.getReviewsByStoreIDs.load(parent.id)
        }
    },
    Mutation: {
        postReview: (_, {review: reviewInput}, {dataSources}) => {
            const review = {
                id: uuidv4(),
                createdAt: Math.round(Date.now() / 1000),
                publishedAt: reviewInput.isPublished ? Math.round(Date.now() / 1000) : null,
                deletedAt: null,
                ...reviewInput
            }

            dataSources.reviewAPI.postReview(review);

            return review
        }
    }
};

const server = new ApolloServer({
    typeDefs, resolvers,
    dataSources: () => {
        return {
            userAPI: new UserAPI(),
            storeAPI: new StoreAPI(),
            reviewAPI: new ReviewAPI()
        }
    },
    schemaDirectives: {
        publishedOnly: PublishedOnlyDirective
    }
});

server.listen().then(({url}) => {
    console.log(`🚀  Server ready at ${url}`);
});

