// gigfever_dummy_backend/server.js
const { ApolloServer, gql } = require('apollo-server');

// Mock Data
const mockData = {
  categories: [{ name: 'Music' }, { name: 'Dance' }, { name: 'Comedy' }],
  subCategories: [{ name: 'Rock' }, { name: 'Jazz' }, { name: 'Stand-up' }],
  events: [
    { id: '1', title: 'Rock Night', category: 'Music', date: '2025-04-01', location: 'Mumbai', host: { id: 'h1', displayName: 'Priya', rating: 4.5, reviewCount: 10 }, status: 'open', artists: [] },
    { id: '2', title: 'Jazz Evening', category: 'Music', date: '2025-04-02', location: 'Delhi', host: { id: 'h2', displayName: 'Rahul', rating: 4.8, reviewCount: 15 }, status: 'confirmed', artists: [] },
  ],
  artists: [
    { id: 'a1', displayName: 'Amit Singer', profilePicture: 'https://example.com/amit.jpg', categories: ['Music'], subCategories: ['Rock'], rating: 4.7, reviewCount: 20, pastBookings: 5, bio: 'Rockstar from Mumbai' },
    { id: 'a2', displayName: 'Neha Dancer', profilePicture: 'https://example.com/neha.jpg', categories: ['Dance'], subCategories: ['Jazz'], rating: 4.9, reviewCount: 25, pastBookings: 8, bio: 'Jazz dancer from Delhi' },
  ],
  invites: [{ id: 'i1', event: { id: '1', title: 'Rock Night' }, status: 'pending' }],
  bookings: [{ id: 'b1', event: { id: '2', title: 'Jazz Evening' }, status: 'confirmed' }],
  applications: [{ id: 'app1', event: { id: '1', title: 'Rock Night' }, status: 'pending' }],
  portfolio: [{ id: 'p1', type: 'video', url: 'https://example.com/video.mp4' }],
  chatMessages: [{ id: 'm1', content: 'Hey, interested?', timestamp: '2025-03-16T10:00:00Z' }],
  reviews: [{ id: 'r1', rating: 4.5, comment: 'Great event!', reviewer: { displayName: 'Priya' } }],
  notifications: [
    { id: 'n1', message: 'New invite received', timestamp: '2025-03-16T10:00:00Z', type: 'general' },
    { id: 'n2', message: 'Chat from Priya', timestamp: '2025-03-16T11:00:00Z', type: 'chat', relatedId: 'c1' },
  ],
  
};

// GraphQL Schema
const typeDefs = gql`
  type User {
    id: ID!
    displayName: String!
    rating: Float!
    reviewCount: Int!
  }
  type Event {
    id: ID!
    title: String!
    category: String!
    date: String!
    location: String!
    host: User!
    status: String!
    artists: [Artist!]!
  }
  type Artist {
    id: ID!
    displayName: String!
    profilePicture: String!
    categories: [String!]!
    subCategories: [String!]!
    rating: Float!
    reviewCount: Int!
    pastBookings: Int!
    bio: String!
  }
  type Invite {
    id: ID!
    event: Event!
    status: String!
  }
  type Booking {
    id: ID!
    event: Event!
    status: String!
  }
  type Application {
    id: ID!
    event: Event!
    status: String!
  }
  type PortfolioItem {
    id: ID!
    type: String!
    url: String!
  }
  type ChatMessage {
    id: ID!
    content: String!
    timestamp: String!
  }
  type Review {
    id: ID!
    rating: Float!
    comment: String!
    reviewer: User!
  }
  type Category {
    name: String!
  }
  type SubCategory {
    name: String!
  }
  type Notification {
    id: ID!
    message: String!
    timestamp: String!
    type: String!
    relatedId: String
  }

  type Query {
    categories: [Category!]!
    subCategories: [SubCategory!]!
    events: [Event!]!
    artists: [Artist!]!
    invites: [Invite!]!
    bookings: [Booking!]!
    applications: [Application!]!
    portfolio: [PortfolioItem!]!
    chatMessages(receiverId: ID!): [ChatMessage!]!
    event(id: ID!): Event
    notifications: [Notification!]!
  }

  type Mutation {
    applyToEvent(eventId: ID!): Application!
    submitReview(eventId: ID!, rating: Float!, comment: String!): Review!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    categories: () => mockData.categories,
    subCategories: () => mockData.subCategories,
    events: () => mockData.events,
    artists: () => mockData.artists,
    invites: () => mockData.invites,
    bookings: () => mockData.bookings,
    applications: () => mockData.applications,
    portfolio: () => mockData.portfolio,
    chatMessages: (_, { receiverId }) => mockData.chatMessages,
    event: (_, { id }) => mockData.events.find((e) => e.id === id),
  },
  Mutation: {
    applyToEvent: (_, { eventId }) => ({
      id: `app${Date.now()}`,
      event: mockData.events.find((e) => e.id === eventId),
      status: 'pending',
    }),
    submitReview: (_, { eventId, rating, comment }) => ({
      id: `r${Date.now()}`,
      rating,
      comment,
      reviewer: { displayName: 'Mock User' },
    }),
  },
};

// Start Server
const server = new ApolloServer({ typeDefs, resolvers });
server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 Dummy GraphQL Server running at ${url}`);
});