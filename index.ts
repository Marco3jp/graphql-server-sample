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
    Mutation: {
        postReview: (_, {review: reviewInput}) => {
            const targetStore = database.stores.find(store => store.id === reviewInput.storeId);
            const postingUser = database.users.find(user => user.id === reviewInput.userId);

            const review = {
                id: uuidv4(),
                reviewText: reviewInput.reviewText,
                store: targetStore,
                user: postingUser
            };

            targetStore?.reviews ? targetStore.reviews.push(review) : targetStore.reviews = [review];
            postingUser?.reviews ? postingUser.reviews.push(review) : postingUser.reviews = [review];

            saveDatabase(database);
            return review;
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