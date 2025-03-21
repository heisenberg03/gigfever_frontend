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
const dummyEvents = [
  {
    id: '1',
    title: 'Rock Night',
    dateTime: '2025-04-15T19:00:00Z', // Updated to ISO 8601 format
    location: 'Mumbai',
    status: 'Open',
    bannerUrl: 'https://source.unsplash.com/600x400/?concert',
    hostId: 'user1',
    mapLink: 'https://maps.google.com/?q=Mumbai',
    description: 'A night full of rock music with top local bands.',
  },
  {
    id: '2',
    title: 'Jazz Evening',
    dateTime: '2025-05-02T20:00:00Z', // Updated to ISO 8601 format
    location: 'Delhi',
    status: 'Closed',
    bannerUrl: 'https://source.unsplash.com/600x400/?jazz',
    hostId: 'user1',
    mapLink: 'https://maps.google.com/?q=Delhi',
    description: 'Smooth jazz performances and cocktails.',
  },
  {
    id: '3',
    title: 'Indie Festival',
    dateTime: '2025-06-10T18:00:00Z', // Updated to ISO 8601 format
    location: 'Bangalore',
    status: 'Draft',
    bannerUrl: 'https://source.unsplash.com/600x400/?indie',
    hostId: 'user2',
    mapLink: 'https://maps.google.com/?q=Bangalore',
    description: 'Draft event not yet published.',
  },
];

const dummyPortfolio = [
  {
    id: 'p1',
    bannerUrl: 'https://source.unsplash.com/400x400/?music',
    type: 'image',
    source: 'instagram',
  },
  {
    id: 'p2',
    bannerUrl: 'https://source.unsplash.com/400x400/?band',
    type: 'image',
    source: 'youtube',
  },
];

const dummyBookings = [
  {
    id: 'b1',
    event: dummyEvents[1],
    status: 'confirmed',
  },
];

const dummyInvites = [
  {
    id: 'i1',
    event: dummyEvents[0],
    status: 'pending',
  },
];

// GraphQL Schema
const typeDefs = gql`
  type User {
    id: ID!
    displayName: String!
    rating: Float!
    reviewCount: Int!
  }
  type Location {
    lat: Float!
    lng: Float!
    address: String!
  }
  type Budget {
    min: Int!
    max: Int!
  }
  type Host {
    id: ID!
    fullName: String!
    rating: Float!
    pastEventsCount: Int!
    profilePic: String
    reviews: [Review!]!
  }
  type Applicant {
    id: ID!
    fullName: String!
    status: String!
  }
  type Artist {
    id: ID!
    fullName: String!
  }
  type Event {
    id: ID!
    title: String!
    dateTime: String!
    location: String!
    status: String!
    bannerUrl: String
    type: String!
    hostId: ID!
    mapLink: String
    description: String
  }

  type EventDetails {
    id: ID!
    title: String!
    bannerUrl: String
    dateTime: String!
    location: Location!
    type: String!
    categoryId: String!
    subcategories: [String!]!
    description: String!
    budget: Budget!
    host: Host!
    applicants: [Applicant!]!
    confirmedArtist: Artist
    status: String!
    userApplicationStatus: String
  }

  input LocationInput {
    lat: Float!
    lng: Float!
    address: String!
  }
  input BudgetInput {
    min: Int!
    max: Int!
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
    bannerUrl: String!
    type: String!
    source: String!
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
    events: [Event]
    myEvents: [Event]
    portfolio: [PortfolioItem]
    bookings: [Booking]
    invites: [Invite]
    artists: [Artist!]!
    applications: [Application!]!
    chatMessages(receiverId: ID!): [ChatMessage!]!
    event(id: ID!): Event
    notifications: [Notification!]!
  }

  type Mutation {
    applyToEvent(eventId: ID!): Application!
    submitReview(eventId: ID!, rating: Float!, comment: String!): Review!
     applyAsArtist(eventId: ID!): Applicant!
    withdrawApplication(eventId: ID!): Boolean!
    createEvent(
      title: String!, type: String!, categories: [String!]!, subcategories: [String!]!,
      date: String!, time: String!, location: LocationInput!, description: String!,
      budget: BudgetInput!
    ): Event!
    updateEvent(
      id: ID!, title: String, type: String, categories: [String], subcategories: [String],
      date: String, time: String, location: LocationInput, description: String,
      budget: BudgetInput
    ): Event!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    categories: () => mockData.categories,
    subCategories: () => mockData.subCategories,
    artists: () => mockData.artists,
    applications: () => mockData.applications,
    chatMessages: (_, { receiverId }) => mockData.chatMessages,
    event: (_, { id }) => mockData.events.find((e) => e.id === id),
    events: () => dummyEvents.filter(e => e.status === 'Open'),
    myEvents: () => dummyEvents.filter(e => e.hostId === 'user1'),
    portfolio: () => dummyPortfolio,
    bookings: () => dummyBookings.map((booking) => ({
      ...booking,
      event: {
        ...booking.event,
        dateTime: booking.event.dateTime || new Date().toISOString(), // Fallback to current date/time
      },
    })),
    invites: () => dummyInvites,
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