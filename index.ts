import {ApolloServer, gql, SchemaDirectiveVisitor} from 'apollo-server';
import {v4 as uuidv4} from 'uuid';

const bcrypt = require('bcrypt');
import {UserAPI} from "./datasource/user";
import {StoreAPI} from "./datasource/store";
import {ReviewAPI} from "./datasource/review";
import {defaultFieldResolver, GraphQLField, GraphQLInterfaceType, GraphQLObjectType} from "graphql";

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
        deleteReview(reviewId: ID): DeleteReviewPayload @auth
    }

    type DeleteReviewPayload {
        msg: String
    }

    directive @auth on FIELD_DEFINITION
`;

class AuthDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field: GraphQLField<any, any>, details: { objectType: GraphQLObjectType | GraphQLInterfaceType }): GraphQLField<any, any> | void | null {
        const {resolve = defaultFieldResolver} = field;

        field.resolve = async function (source, args, context, info) {
            const storedUserPasswordHash = context.dataSources.userAPI.getUserPasswordHashByUserId(context.userId);
            if (context.rawPassword && storedUserPasswordHash) {
                bcrypt.compare(context.rawPassword, storedUserPasswordHash).then((result) => {
                    if (result) {
                        return resolve.apply(this, [source, args, context, info]);
                    }
                })
            }
            // reject authentication
            return {
                msg: 'Rejected authentication'
            }
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

            delete review.isPublished

            dataSources.reviewAPI.postReview(review);

            return review
        },
        async deleteReview(parent, args, context) {
            const targetReview = await context.dataSources.reviewAPI.getReviewById.load(args.reviewId);
            // do authorization, only permit myself
            if (targetReview && context.userId === targetReview.userId) {
                return {
                    msg: context.dataSources.reviewAPI.deleteReview(args.reviewId)
                }
            }else {
                return {
                    msg: "There is not target review"
                }
            }
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
        auth: AuthDirective
    },
    context: ({req}) => {
        return {
            rawPassword: req.headers.rawpassword,
            userId: req.headers.userid,
        }
    }
});

server.listen().then(({url}) => {
    console.log(`🚀  Server ready at ${url}`);
});

