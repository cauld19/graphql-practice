import { GraphQLServer } from 'graphql-yoga';
import uuidv4 from 'uuid/v4'

// Scalar types - String, Boolean, Int, Float, ID

// Demo Data
const users =[{
    id: '1',
    name: 'herm',
    email: 'herm@gmail.com'
}, {
    id: '2',
    name: 'gary',
    email: 'herm@gmail.com'
}, {
    id: '3',
    name: 'steve',
    email: 'herm@gmail.com'
}]

const posts =[
    {
        id: '1',
        title: 'new hope',
        body: 'worst',
        published: true,
        author: "1"
    }, 
    {
        id: '2',
        title: 'news hope',
        body: 'best',
        published: true,
        author: "2"
    },
    {
        id: '3',
        title: 'xzzzzz',
        body: 'worst',
        published: false,
        author: "1"
    }
]

const comments =[
    {
        id: '1',
        text: "a comment",
        post: '1',
        author: '1'
    }, 
    {
        id: '2',
        text: "another comment",
        post: '2',
        author: '2'
    },
    {
        id: '3',
        text: 'yet again',
        post: '3',
        author: '3'
    }
]

// Type defintions
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        me: User!
        posts(query: String!): [Post!]!
        comments(query: String!): [Comment!]!
    }

    type Mutation {
        createUser(name: String!, email: String!, age: Int): User!
        createPost(title: String!, body: String!, published: Boolean!, author: ID!): Post!
        createComment(text: String!, post: ID!, author: ID!): Comment!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
        comments: [Comment!]!
    }

    type Post {
        id: ID!
        title: String!
        body: String
        published: Boolean!
        author: User!
        comments: [Comment!]!
    }

    type Comment {
        id: ID!
        text: String!
        post: Post!
        author: User!
    }
`

//Resolvers
// parent, args, ctx, info
const resolvers = {
    Query: {
        
        users(parent, args, ctx, info) {
            if(!args.query) {
                return users
            } else {
                return users.filter((user)=> {
                    return user.name.toLowerCase().includes(args.query.toLowerCase())
                })
            }
        },
        me() {
            return {
                id: '1234',
                name: "Herm",
                email: "herm@gmail.com"
            }
        },
        posts(parent, args, ctx, info) {
            if(!args.query) {
                return posts
            } else {
                return posts.filter((post)=> {
                    return post.title.toLowerCase().includes(args.query.toLowerCase()) || post.body.toLowerCase().includes(args.query.toLowerCase())
                })
            }
        },
        comments(parent, args, ctx, info) {
            if(!args.query) {
                return comments
            } else {
                return comments.filter((comment)=> {
                    return comment.text.toLowerCase().includes(args.query.toLowerCase())
                })
            }
        }
    },
    Mutation: {
        createUser(parent, args, ctx, info) {
            const emailTaken = users.some((user) => user.email === args.email);
            if(emailTaken) {
                throw new Error('email taken')
            }

            const user = {
                id: uuidv4(),
                name: args.name,
                email: args.email,
                age: args.age
            }

            users.push(user);

            return user;
        },
        createPost(parent,args,ctx,info) {
            const userExists = users.some((user) => user.id === args.author)

            if(!userExists) {
                throw new Error('User not found')
            }

            const post = {
                id: uuidv4(),
                title: args.title,
                body: args.body,
                published: args.published,
                author: args.author
            }

            posts.push(post)

            return post
        },
        // createComment(parent,args,ctx,info) {
        //     const user
        // }
    },
    Post: {
        author(parent, args, ctx, info) {
            return users.find((user) => {
                return user.id === parent.author
            })
        },
        comments(parent,args,ctx,info) {
            return comments.filter((comment) => {
                return comment.post === parent.id
            })
        }
    },
    User: {
        posts(parent, args, ctx, info) {
            return posts.filter((post) => {
                return post.author === parent.id
            })
        },
        comments(parent,args,ctx,info) {
            return comments.filter((comment) => {
                return comment.author === parent.id
            })
        }
    },
    Comment: {
        post(parent,args,ctx,info) {
            return posts.find((post) => {
                return post.id === parent.post
            })
        },
        author(parent, args, ctx, info) {
            return users.find((user) => {
                return user.id === parent.author
            })
        }
    }
}

const server = new GraphQLServer({
    typeDefs,
    resolvers
})

server.start(()=> {
    console.log('server live')
})