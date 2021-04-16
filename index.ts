import {ApolloServer, gql} from 'apollo-server';

const typeDefs = gql`

    type Store {
        id: ID!
        name: String!
        address: String
    }

    type Query {
        stores: [Store!]!
    }
`;

const stores = [
    {
        id: '0',
        name: '美味しいお寿司屋',
        address: '海の近く',
    },
    {
        id: '1',
        name: '美味しい天ぷら屋',
        address: '油の近く',
    },
    {
        id: '2',
        name: '美味しい居酒屋',
        address: 'アルコールの近く'
    },
    {
        id: '3',
        name: '美味しいお好み焼き屋',
        address: '粉の近く',
    },
    {
        id: '4',
        name: '美味しい焼肉屋',
        address: '肉の近く',
    }
]


const resolvers = {
    Query: {
        stores: () => stores
    },
};

const server = new ApolloServer({typeDefs, resolvers});

server.listen().then(({url}) => {
    console.log(`🚀  Server ready at ${url}`);
});
