import {ApolloServer, gql} from 'apollo-server';
import {v4 as uuidv4} from 'uuid';
import * as fs from "fs";

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

const database = loadDatabase();

const resolvers = {
    Query: {
        stores: () => database.stores,
        users: () => database.users
    },
    Review: {
        user(parent) {
            return database.users.find(user => user.id === parent.userId)
        },
        store(parent) {
            return database.stores.find(store => store.id === parent.storeId)
        }
    },
    User: {
        reviews(parent) {
            return database.reviews.filter(review => review.userId === parent.id)
        }
    },
    Store: {
        reviews(parent) {
            return database.reviews.filter(review => review.storeId === parent.id)
        }
    },
    Mutation: {
        postReview: (_, {review: reviewInput}) => {
            const id = uuidv4();

            database.reviews.push({
                id,
                ...reviewInput
            })

            saveDatabase(database);

            const targetStore = database.stores.find(store => store.id === reviewInput.storeId);
            const postingUser = database.users.find(user => user.id === reviewInput.userId);

            return {
                id,
                reviewText: reviewInput.reviewText,
                store: targetStore,
                user: postingUser
            };
        }
    }
};

const server = new ApolloServer({typeDefs, resolvers});

server.listen().then(({url}) => {
    console.log(`🚀  Server ready at ${url}`);
});

function loadDatabase() {
    const file = fs.readFileSync('database.json', {encoding: "utf8"});
    return JSON.parse(file);
}

function saveDatabase(data) {
    const fileBody = JSON.stringify(data);
    fs.writeFileSync('database.json', fileBody);
}
