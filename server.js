// server.js
const { ApolloServer, gql } = require('apollo-server');
const mockData = {
  users: [
    {
      id: 'u1',
      phoneNumber: '1234567890',
      fullName: 'Test User',
      displayName: 'Test',
      isArtist: false,
      bio: 'Event organizer with a passion for music.',
      budget: 5000,
      categories: ['Music'],
      subcategories: ['Live Band'],
    },
  ],
  events: [
    { id: 'e1', title: 'Rock Night', category: 'Music', date: '2025-04-01', location: 'Mumbai', status: 'open', host: { id: 'u1', displayName: 'Test' }, isDraft: false },
    { id: 'e2', title: 'Jazz Evening', category: 'Music', date: '2025-04-10', location: 'Delhi', status: 'draft', host: { id: 'u1', displayName: 'Test' }, isDraft: true },
  ],
  bookings: [
    { id: 'b1', userId: 'u1', event: { id: 'e1', title: 'Rock Night' }, status: 'confirmed', date: '2025-04-01' },
  ],
  invites: [
    { id: 'i1', userId: 'u1', event: { id: 'e1', title: 'Rock Night', host: { id: 'h1', displayName: 'Host' } }, status: 'pending' },
  ],
  portfolio: [
    { id: 'p1', userId: 'u1', mediaType: 'IMAGE', mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop' },
    { id: 'p2', userId: 'u1', mediaType: 'VIDEO', mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  ],
  notifications: [
    { id: 'n1', message: 'New event created', timestamp: '2025-03-01T10:00:00Z', type: 'GENERAL', relatedId: 'e1', read: false },
    { id: 'n2', message: 'Booking confirmed', timestamp: '2025-03-02T12:00:00Z', type: 'GENERAL', relatedId: 'b1', read: true },
  ],
  categories: [
    { id: '1', name: 'Music' },
    { id: '2', name: 'Dance' },
    { id: '3', name: 'Art' },
  ],
  subCategories: [
    { id: '1', name: 'Live Band' },
    { id: '2', name: 'Solo Performance' },
    { id: '3', name: 'DJ' },
  ],
};

const typeDefs = gql`
  type Notification {
    id: ID!
    message: String!
    timestamp: String!
    type: String!
    relatedId: String!
    read: Boolean!
  }
  type Category {
    id: ID!
    name: String!
  }
  type SubCategory {
    id: ID!
    name: String!
  }
  type User {
    id: ID!
    phoneNumber: String!
    fullName: String!
    displayName: String!
    isArtist: Boolean!
    bio: String
    budget: Int
    categories: [String!]
    subcategories: [String!]
  }
  type Event {
    id: ID!
    title: String!
    category: String!
    date: String!
    location: String!
    status: String!
    host: Host!
    isDraft: Boolean!
  }
  type Host {
    id: ID!
    displayName: String!
  }
  type Booking {
    id: ID!
    userId: ID!
    event: Event!
    status: String!
    date: String!
  }
  type Invite {
    id: ID!
    userId: ID!
    event: Event!
    status: String!
  }
  type PortfolioItem {
    id: ID!
    userId: ID!
    mediaType: String!
    mediaUrl: String!
    thumbnail: String!
  }
  input EventInput {
    title: String!
    category: String!
    date: String!
    location: String!
    status: String!
    hostId: ID!
    isDraft: Boolean!
  }
  input UserInput {
    bio: String
    budget: Int
    categories: [String!]
    subcategories: [String!]
  }
  input PortfolioInput {
    mediaType: String!
    mediaUrl: String!
    thumbnail: String!
  }
  type Query {
    user(id: ID!): User
    bookings(userId: ID!): [Booking!]!
    events(userId: ID!): [Event!]!
    invites(userId: ID!): [Invite!]!
    portfolio(userId: ID!): [PortfolioItem!]!
    subCategories: [SubCategory!]!
    notifications(userId: ID!): [Notification!]!
    categories: [Category!]!
  }
  type Mutation {
    createEvent(input: EventInput!): Event!
    updateInvite(inviteId: ID!, status: String!): Invite!
    updateUser(id: ID!, input: UserInput!): User!
    addPortfolioItem(userId: ID!, input: PortfolioInput!): PortfolioItem!
    removePortfolioItem(id: ID!): Boolean!
    cancelEvent(eventId: ID!): Event!
  }
`;

const resolvers = {
  Query: {
    user: (_, { id }) => mockData.users.find((u) => u.id === id),
    bookings: (_, { userId }) => mockData.bookings.filter((b) => b.userId === userId),
    events: (_, { userId }) => mockData.events.filter((e) => e.host.id === userId),
    invites: (_, { userId }) => mockData.invites.filter((i) => i.userId === userId),
    portfolio: (_, { userId }) => mockData.portfolio.filter((p) => p.userId === userId),
  },
  Mutation: {
    createEvent: (_, { input }) => {
      const newEvent = { id: `e${mockData.events.length + 1}`, ...input, host: { id: input.hostId, displayName: 'Test' } };
      mockData.events.push(newEvent);
      return newEvent;
    },
    updateInvite: (_, { inviteId, status }) => {
      const invite = mockData.invites.find((i) => i.id === inviteId);
      if (invite) {
        invite.status = status;
        if (status === 'accepted') {
          const newBooking = {
            id: `b${mockData.bookings.length + 1}`,
            userId: invite.userId,
            event: invite.event,
            status: 'confirmed',
            date: invite.event.date,
          };
          mockData.bookings.push(newBooking);
        }
        return invite;
      }
      throw new Error('Invite not found');
    },
    updateUser: (_, { id, input }) => {
      const user = mockData.users.find((u) => u.id === id);
      if (user) {
        Object.assign(user, input);
        return user;
      }
      throw new Error('User not found');
    },
    addPortfolioItem: (_, { userId, input }) => {
      const newItem = { id: `p${mockData.portfolio.length + 1}`, userId, ...input };
      mockData.portfolio.push(newItem);
      return newItem;
    },
    removePortfolioItem: (_, { id }) => {
      const index = mockData.portfolio.findIndex((p) => p.id === id);
      if (index !== -1) {
        mockData.portfolio.splice(index, 1);
        return true;
      }
      return false;
    },
    cancelEvent: (_, { eventId }) => {
      const event = mockData.events.find((e) => e.id === eventId);
      if (event) {
        event.status = 'canceled';
        mockData.bookings = mockData.bookings.map((booking) =>
          booking.event.id === eventId ? { ...booking, status: 'canceled' } : booking
        );
        return event;
      }
      throw new Error('Event not found');
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen({ port: 4000 }).then(({ url }) => console.log(`🚀 Dummy GraphQL Server running at ${url}`));