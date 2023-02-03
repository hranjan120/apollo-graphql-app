import gql from 'graphql-tag';

export default gql`
scalar Upload

type File {
    filename: String!
    mimetype: String!
    encoding: String!
    result: S3Response!
}

type S3Response{
    ETag: String
    Location: String
    key: String
    Bucket: String
}

type Query {
    helloFile: String
}

type Mutation {
    singleUpload(file: Upload!): File!
    singleUploadStream(file: Upload!): File!
}

`;