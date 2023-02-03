import gql from 'graphql-tag';

export default gql`
    type Post{
        id: ID
        title: String
        description: String
        postStatus: String
        createdAt: String
        updatedAt: String
    }

    type Query {
        hello: String
        userLogin: String
        getAllPosts: [Post]
        getPost(id: ID): Post
    }

    input postInput {
        title: String!
        description: String!
        postStatus: String!
    }

    type Mutation {
        createPost(post: postInput): Post
        deletePost(id: ID): String
        updatePost(id: ID, post: postInput): Post
    }
`;