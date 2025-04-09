// server.js
const { ApolloServer, gql } = require('apollo-server');

// Mock Data aligned with Finalized PostgreSQL Schema
const userData = [
  {
    id: 'u1',
    username: 'Test',
    full_name: 'Test User',
    phone: '1',
    email: 'dummy@email.som',
    profile_picture: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    location: 'Mumbai',
    bio: 'Event organizer with a passion for music.',
    host_bio: 'Professional event organizer specializing in corporate events and music festivals.',
    is_artist: true,
    artist_type: 'band',
    budget: 5000,
    host_rating: 4.3,
    host_review_count: 5,
    artist_rating: 4.5,
    artist_review_count: 10,
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2025-03-01T00:00:00Z',
  },
  {
    id: 'a1',
    username: 'johndoe',
    full_name: 'John Doe',
    phone: '2',
    email: 'artist1@test.com',
    profile_picture: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b',
    location: 'Mumbai',
    bio: 'Professional DJ with 5 years of experience.',
    host_bio: 'Experienced in organizing private events and club nights.',
    is_artist: true,
    artist_type: 'dj',
    budget: 2000,
    host_rating: 4.0,
    host_review_count: 2,
    artist_rating: 4.8,
    artist_review_count: 42,
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2025-03-01T00:00:00Z',
  },
  // Add other users similarly...
];

const eventData = [
  {
    id: 'e1',
    title: 'Rock Night',
    description: 'A night of amazing rock music with the best bands in town',
    banner: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4',
    date_time: '2025-04-01T20:00:00Z',
    venue: 'Mumbai Concert Hall',
    location_id: 'l1',
    status: 'Open',
    type: 'Concert',
    budget_min: 5000,
    budget_max: 10000,
    host_id: 'u1',
    is_draft: false,
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2025-03-01T00:00:00Z',
  },
  {
    id: 'e2',
    title: 'Jazz Evening',
    description: 'Sophisticated jazz evening for a corporate gathering',
    banner: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
    date_time: '2025-04-10T19:00:00Z',
    venue: 'Delhi Jazz Club',
    location_id: 'l2',
    status: 'Confirmed',
    type: 'Private Party',
    budget_min: 3000,
    budget_max: 7000,
    host_id: 'u1',
    is_draft: false,
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2025-03-01T00:00:00Z',
  },
  // Add other events...
];

const eventApplicationsData = [
  {
    id: 'ea1',
    event_id: 'e1',
    artist_id: 'a1',
    status: 'Applied',
    invited_by_host: false,
    created_at: '2025-03-20T10:00:00Z',
  },
  {
    id: 'ea2',
    event_id: 'e1',
    artist_id: 'a2',
    status: 'Applied',
    invited_by_host: true,
    created_at: '2025-03-20T10:05:00Z',
  },
  {
    id: 'ea3',
    event_id: 'e2',
    artist_id: 'a2',
    status: 'Confirmed',
    invited_by_host: false,
    created_at: '2025-03-20T10:10:00Z',
  },
];

const bookingsData = [
  {
    id: 'b1',
    event_id: 'e1',
    artist_id: 'a1',
    status: 'Confirmed',
    created_at: '2025-03-20T10:00:00Z',
  },
  {
    id: 'b2',
    event_id: 'e2',
    artist_id: 'a2',
    status: 'Confirmed',
    created_at: '2025-03-21T15:30:00Z',
  },
];

const portfolioItemsData = [
  {
    id: 'p1',
    artist_id: 'u1',
    media_type: 'VIDEO',
    media_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    source: 'youtube',
    created_at: '2025-03-01T00:00:00Z',
  },
  // Add other portfolio items...
];

const notificationsData = [
  {
    id: 'n1',
    user_id: 'u1',
    message: 'New event created',
    timestamp: '2025-03-01T10:00:00Z',
    type: 'GENERAL',
    related_id: 'e1',
    read: false,
    created_at: '2025-03-01T10:00:00Z',
  },
  {
    id: 'n2',
    user_id: 'u1',
    message: 'Booking confirmed',
    timestamp: '2025-03-02T12:00:00Z',
    type: 'GENERAL',
    related_id: 'b1',
    read: true,
    created_at: '2025-03-02T12:00:00Z',
  },
];

const reviewsData = [
  {
    id: 'r1',
    reviewer_id: 'u2',
    user_id: 'a1',
    rating: 4.5,
    comment: 'Amazing performance!',
    type: 'ARTIST',
    created_at: '2025-03-20T10:00:00Z',
  },
  {
    id: 'r2',
    reviewer_id: 'u1',
    user_id: 'a1',
    rating: 5.0,
    comment: 'Fantastic host!',
    type: 'HOST',
    created_at: '2025-03-14T10:30:00Z',
  },
];

const chatConversationsData = [
  {
    id: 'u1_a1',
    user1_id: 'u1',
    user2_id: 'a1',
    last_message_text: 'That sounds interesting. What kind of event?',
    last_message_timestamp: '2025-03-20T10:15:00Z',
    last_message_sender_id: 'a1',
    last_message_is_read: true,
    created_at: '2025-03-20T10:00:00Z',
  },
];

const messagesData = [
  {
    id: 'm1',
    conversation_id: 'u1_a1',
    sender_id: 'u1',
    text: 'Hi, I saw your profile and would love to discuss a collaboration.',
    timestamp: '2025-03-20T10:00:00Z',
    is_read: false,
    created_at: '2025-03-20T10:00:00Z',
  },
  {
    id: 'm2',
    conversation_id: 'u1_a1',
    sender_id: 'a1',
    text: 'Hello! Thanks for reaching out. I’d be happy to discuss.',
    timestamp: '2025-03-20T10:05:00Z',
    is_read: true,
    created_at: '2025-03-20T10:05:00Z',
  },
  // Add other messages...
];

const categoriesData = [
  { id: '1', name: 'Music', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819', created_at: '2025-03-01T00:00:00Z' },
  { id: '2', name: 'Dance', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a', created_at: '2025-03-01T00:00:00Z' },
];

const subcategoriesData = [
  { id: '1', category_id: '1', name: 'Live Band', image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4', created_at: '2025-03-01T00:00:00Z' },
  { id: '2', category_id: '1', name: 'Solo Performance', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819', created_at: '2025-03-01T00:00:00Z' },
];

const locationsData = [
  { id: 'l1', address: 'Mumbai, India', latitude: 19.0760, longitude: 72.8777, created_at: '2025-03-01T00:00:00Z' },
  { id: 'l2', address: 'Delhi, India', latitude: 28.6139, longitude: 77.2090, created_at: '2025-03-01T00:00:00Z' },
];

const mockData = {
  users: userData,
  events: eventData,
  event_applications: eventApplicationsData,
  bookings: bookingsData,
  portfolio_items: portfolioItemsData,
  notifications: notificationsData,
  reviews: reviewsData,
  chat_conversations: chatConversationsData,
  messages: messagesData,
  categories: categoriesData,
  subcategories: subcategoriesData,
  locations: locationsData,
};

// GraphQL Type Definitions
const typeDefs = gql`
  type Query {
    user(id: ID!): User
    event(id: ID!): Event
    events(hostId: ID): [Event!]!
    bookings(artistId: ID!): [Booking!]!
    eventApplications(eventId: ID!): [EventApplication!]!
    portfolioItems(artistId: ID!): [PortfolioItem!]!
    notifications(userId: ID!): [Notification!]!
    reviews(userId: ID!, type: String!): [Review!]!
    chatConversations(userId: ID!): [ChatConversation!]!
    messages(conversationId: ID!): [Message!]!
    categories: [Category!]!
    subcategories(categoryId: ID!): [Subcategory!]!
    locations: [Location!]!
  }

  type Mutation {
    login(phone: String!, otp: String!): LoginResponse!
    createEvent(input: EventInput!): Event!
    updateEventApplication(applicationId: ID!, status: String!): EventApplication!
    updateUser(id: ID!, input: UserInput!): User!
    addPortfolioItem(artistId: ID!, input: PortfolioInput!): PortfolioItem!
    sendMessage(conversationId: ID, user1Id: ID, user2Id: ID, text: String!): Message!
  }

  type LoginResponse {
    userId: ID!
    token: String!
  }

  type User {
    id: ID!
    username: String!
    full_name: String!
    phone: String!
    email: String
    profile_picture: String
    location: String
    bio: String
    host_bio: String
    is_artist: Boolean!
    artist_type: String
    budget: Float
    host_rating: Float
    host_review_count: Int
    artist_rating: Float
    artist_review_count: Int
    created_at: String!
    updated_at: String!
  }

  type Event {
    id: ID!
    title: String!
    description: String
    banner: String
    date_time: String!
    venue: String
    location: Location
    status: String!
    type: String
    budget_min: Float
    budget_max: Float
    host: User!
    is_draft: Boolean!
    created_at: String!
    updated_at: String!
    applications: [EventApplication!]
  }

  type EventApplication {
    id: ID!
    event: Event!
    artist: User!
    status: String!
    invited_by_host: Boolean!
    created_at: String!
  }

  type Booking {
    id: ID!
    event: Event!
    artist: User!
    status: String!
    created_at: String!
  }

  type PortfolioItem {
    id: ID!
    artist: User!
    media_type: String!
    media_url: String!
    thumbnail: String!
    source: String
    created_at: String!
  }

  type Notification {
    id: ID!
    user: User!
    message: String!
    timestamp: String!
    type: String!
    related_id: ID
    read: Boolean!
    created_at: String!
  }

  type Review {
    id: ID!
    reviewer: User!
    user: User!
    rating: Float!
    comment: String
    type: String!
    created_at: String!
  }

  type ChatConversation {
    id: ID!
    user1: User!
    user2: User!
    last_message_text: String
    last_message_timestamp: String
    last_message_sender: User
    last_message_is_read: Boolean!
    created_at: String!
    messages: [Message!]
  }

  type Message {
    id: ID!
    conversation: ChatConversation!
    sender: User!
    text: String!
    timestamp: String!
    is_read: Boolean!
    created_at: String!
  }

  type Category {
    id: ID!
    name: String!
    image: String
    created_at: String!
    subcategories: [Subcategory!]
  }

  type Subcategory {
    id: ID!
    category: Category!
    name: String!
    image: String
    created_at: String!
  }

  type Location {
    id: ID!
    address: String!
    latitude: Float!
    longitude: Float!
    created_at: String!
  }

  input EventInput {
    title: String!
    description: String
    banner: String
    date_time: String!
    venue: String
    location_id: ID!
    status: String!
    type: String
    budget_min: Float
    budget_max: Float
    host_id: ID!
    is_draft: Boolean!
  }

  input UserInput {
    username: String
    full_name: String
    email: String
    profile_picture: String
    location: String
    bio: String
    host_bio: String
    is_artist: Boolean
    artist_type: String
    budget: Float
  }

  input PortfolioInput {
    media_type: String!
    media_url: String!
    thumbnail: String!
    source: String
  }
`;

// Resolvers
const resolvers = {
  Query: {
    user: (_, { id }) => mockData.users.find(u => u.id === id),
    event: (_, { id }) => mockData.events.find(e => e.id === id),
    events: (_, { hostId }) => hostId ? mockData.events.filter(e => e.host_id === hostId) : mockData.events,
    bookings: (_, { artistId }) => mockData.bookings.filter(b => b.artist_id === artistId),
    eventApplications: (_, { eventId }) => mockData.event_applications.filter(ea => ea.event_id === eventId),
    portfolioItems: (_, { artistId }) => mockData.portfolio_items.filter(p => p.artist_id === artistId),
    notifications: (_, { userId }) => mockData.notifications.filter(n => n.user_id === userId),
    reviews: (_, { userId, type }) => mockData.reviews.filter(r => r.user_id === userId && r.type === type),
    chatConversations: (_, { userId }) => mockData.chat_conversations.filter(c => c.user1_id === userId || c.user2_id === userId),
    messages: (_, { conversationId }) => mockData.messages.filter(m => m.conversation_id === conversationId),
    categories: () => mockData.categories,
    subcategories: (_, { categoryId }) => mockData.subcategories.filter(s => s.category_id === categoryId),
    locations: () => mockData.locations,
  },
  Mutation: {
    login: (_, { phone, otp }) => {
      if (otp === '1') {
        const user = mockData.users.find(u => u.phone === phone);
        if (user) return { userId: user.id, token: 'mock-jwt-token' };
        throw new Error('User not found');
      }
      throw new Error('Invalid OTP');
    },
    createEvent: (_, { input }) => {
      const newEvent = {
        id: `e${mockData.events.length + 1}`,
        ...input,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockData.events.push(newEvent);
      return newEvent;
    },
    updateEventApplication: (_, { applicationId, status }) => {
      const app = mockData.event_applications.find(ea => ea.id === applicationId);
      if (app) {
        app.status = status;
        if (status === 'Confirmed') {
          const booking = {
            id: `b${mockData.bookings.length + 1}`,
            event_id: app.event_id,
            artist_id: app.artist_id,
            status: 'Confirmed',
            created_at: new Date().toISOString(),
          };
          mockData.bookings.push(booking);
        }
        return app;
      }
      throw new Error('Application not found');
    },
    updateUser: (_, { id, input }) => {
      const user = mockData.users.find(u => u.id === id);
      if (user) {
        Object.assign(user, input, { updated_at: new Date().toISOString() });
        return user;
      }
      throw new Error('User not found');
    },
    addPortfolioItem: (_, { artistId, input }) => {
      const newItem = {
        id: `p${mockData.portfolio_items.length + 1}`,
        artist_id: artistId,
        ...input,
        created_at: new Date().toISOString(),
      };
      mockData.portfolio_items.push(newItem);
      return newItem;
    },
    sendMessage: (_, { conversationId, user1Id, user2Id, text }) => {
      let convId = conversationId;
      if (!convId) {
        const sortedIds = [user1Id, user2Id].sort();
        convId = `${sortedIds[0]}_${sortedIds[1]}`;
        if (!mockData.chat_conversations.find(c => c.id === convId)) {
          mockData.chat_conversations.push({
            id: convId,
            user1_id: sortedIds[0],
            user2_id: sortedIds[1],
            last_message_text: text,
            last_message_timestamp: new Date().toISOString(),
            last_message_sender_id: user1Id,
            last_message_is_read: false,
            created_at: new Date().toISOString(),
          });
        }
      }
      const newMessage = {
        id: `m${mockData.messages.length + 1}`,
        conversation_id: convId,
        sender_id: user1Id,
        text,
        timestamp: new Date().toISOString(),
        is_read: false,
        created_at: new Date().toISOString(),
      };
      mockData.messages.push(newMessage);
      const conv = mockData.chat_conversations.find(c => c.id === convId);
      if (conv) {
        conv.last_message_text = text;
        conv.last_message_timestamp = newMessage.timestamp;
        conv.last_message_sender_id = user1Id;
        conv.last_message_is_read = false;
      }
      return newMessage;
    },
  },
  Event: {
    location: (event) => mockData.locations.find(l => l.id === event.location_id),
    host: (event) => mockData.users.find(u => u.id === event.host_id),
    applications: (event) => mockData.event_applications.filter(ea => ea.event_id === event.id),
  },
  EventApplication: {
    event: (app) => mockData.events.find(e => e.id === app.event_id),
    artist: (app) => mockData.users.find(u => u.id === app.artist_id),
  },
  Booking: {
    event: (booking) => mockData.events.find(e => e.id === booking.event_id),
    artist: (booking) => mockData.users.find(u => u.id === booking.artist_id),
  },
  PortfolioItem: {
    artist: (item) => mockData.users.find(u => u.id === item.artist_id),
  },
  Notification: {
    user: (notif) => mockData.users.find(u => u.id === notif.user_id),
  },
  Review: {
    reviewer: (review) => mockData.users.find(u => u.id === review.reviewer_id),
    user: (review) => mockData.users.find(u => u.id === review.user_id),
  },
  ChatConversation: {
    user1: (conv) => mockData.users.find(u => u.id === conv.user1_id),
    user2: (conv) => mockData.users.find(u => u.id === conv.user2_id),
    last_message_sender: (conv) => mockData.users.find(u => u.id === conv.last_message_sender_id),
    messages: (conv) => mockData.messages.filter(m => m.conversation_id === conv.id),
  },
  Message: {
    conversation: (msg) => mockData.chat_conversations.find(c => c.id === msg.conversation_id),
    sender: (msg) => mockData.users.find(u => u.id === msg.sender_id),
  },
  Subcategory: {
    category: (sub) => mockData.categories.find(c => c.id === sub.category_id),
  },
  Category: {
    subcategories: (cat) => mockData.subcategories.filter(s => s.category_id === cat.id),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen({ port: 4000 }).then(({ url }) => console.log(`🚀 Dummy GraphQL Server running at ${url}`));