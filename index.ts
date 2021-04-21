import {ApolloServer, gql} from 'apollo-server';
import {v4 as uuidv4} from 'uuid';
import {UserAPI} from "./datasource/user";
import {StoreAPI} from "./datasource/store";
import {ReviewAPI} from "./datasource/review";

const typeDefs = gql`
    type User {
        id: ID!
        name: String!
        reviews: [Review!]
    }

    input ReviewInput {
        userId: ID!
        storeId: ID!
        reviewText: String!
    }

    type Review {
        id: ID!
        user: User!
        store: Store!
        reviewText: String!
    }

    type Store {
        id: ID!
        name: String!
        address: String
        reviews: [Review!]
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
        reviews(parent, args, {dataSources}) {
            return dataSources.reviewAPI.getReviewsByUserID(parent.id)
        }
    },
    Store: {
        reviews(parent, args, {dataSources}) {
            return dataSources.reviewAPI.getReviewsByStoreID(parent.id)
        }
    },
    Mutation: {
        postReview: (_, {review: reviewInput}, {dataSources}) => {
            const review = {
                id: uuidv4(),
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

