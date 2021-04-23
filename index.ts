import {ApolloServer, gql} from 'apollo-server';
import {v4 as uuidv4} from 'uuid';
import {UserAPI} from "./datasource/user";
import {StoreAPI} from "./datasource/store";
import {ReviewAPI} from "./datasource/review";

const typeDefs = gql`
    type User {
        id: ID!
        name: String!
        reviews(isOnlyPublished: Boolean = false): [Review!]
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
        publishedAt: String
        deletedAt: String
    }

    type Store {
        id: ID!
        name: String!
        address: String
        reviews(isOnlyPublished: Boolean = false): [Review!]
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
`;

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
            return await dataSources.reviewAPI.getReviewsByUserIDs.load({
                userId: parent.id,
                isPublished: args.isOnlyPublished
            })
        }
    },
    Store: {
        async reviews(parent, args, {dataSources}) {
            return await dataSources.reviewAPI.getReviewsByStoreIDs.load({
                storeId: parent.id,
                isPublished: args.isOnlyPublished
            })
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
});

server.listen().then(({url}) => {
    console.log(`🚀  Server ready at ${url}`);
});

