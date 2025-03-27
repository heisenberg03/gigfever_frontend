// server.js
const { ApolloServer, gql } = require('apollo-server');
const mockData = {
  users: [
    {
      id: 'u1',
      phoneNumber: '1',
      profilePicture: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      email:'dummy@email.som',
      fullName: 'Test User',
      username: 'Test',
      isArtist: false,
      bio: 'Event organizer with a passion for music.',
      budget: 5000,
      location: 'Mumbai',
      artistType: 'band',
      categoryIDs: ['1'],
      artistRating: 4.5,
      artistReviewCount: 10,
      hostRating: 4.3,
      hostReviewCount: 5,
      subCategoryIDs: ['1','4'],
    },
    {
      id: 'a1',
      phoneNumber: '2',
      profilePicture: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b',
      email: 'artist1@test.com',
      fullName: 'John Doe',
      username: 'johndoe',
      isArtist: true,
      bio: 'Professional DJ with 5 years of experience.',
      budget: 2000,
      location: 'Mumbai',
      artistType: 'dj',
      categoryIDs: ['1'],
      artistRating: 4.8,
      artistReviewCount: 42,
      hostRating: 4.0,
      hostReviewCount: 2,
      subCategoryIDs: ['3','4','2','1'],
      pastBookings: 36,
    },
    {
      id: 'a2',
      phoneNumber: '3',
      profilePicture: 'https://images.unsplash.com/photo-1535090042247-30387519d11f',
      email: 'artist2@test.com',
      fullName: 'Sarah Wilson',
      username: 'sarahmusic',
      isArtist: true,
      bio: 'Classical vocalist specializing in Indian and Western music.',
      budget: 1500,
      location: 'Delhi',
      artistType: 'vocalist',
      categoryIDs: ['1'],
      artistRating: 4.6,
      artistReviewCount: 18,
      hostRating: 4.2,
      hostReviewCount: 3,
      subCategoryIDs: ['2'],
      pastBookings: 23,
    },
    {
      id: 'a3',
      phoneNumber: '4',
      profilePicture: 'https://images.unsplash.com/photo-1532148179517-95962e54071f',
      email: 'artist3@test.com',
      fullName: 'Mike Chen',
      username: 'miketheartist',
      isArtist: true,
      bio: 'Contemporary artist specializing in live paintings and installations.',
      budget: 3000,
      location: 'Mumbai',
      artistType: 'painter',
      categoryIDs: ['3'],
      artistRating: 4.9,
      artistReviewCount: 26,
      hostRating: 4.7,
      hostReviewCount: 4,
      subCategoryIDs: ['8'],
      pastBookings: 19,
    },
    {
      id: 'a4',
      phoneNumber: '5',
      profilePicture: 'https://images.unsplash.com/photo-1523251343397-aaef6fe15270',
      email: 'artist4@test.com',
      fullName: 'Emma Rodriguez',
      username: 'dancequeen',
      isArtist: true,
      bio: 'Professional hip-hop dancer with experience in music videos and live performances.',
      budget: 1800,
      location: 'Bangalore',
      artistType: 'dancer',
      categoryIDs: ['2'],
      artistRating: 4.7,
      artistReviewCount: 31,
      hostRating: 4.4,
      hostReviewCount: 2,
      subCategoryIDs: ['6'],
      pastBookings: 28,
    },
    {
      id: 'a5',
      phoneNumber: '6',
      profilePicture: 'https://images.unsplash.com/photo-1487222485498-c26cdbefcc12',
      email: 'artist5@test.com',
      fullName: 'Alex Johnson',
      username: 'rockband',
      isArtist: true,
      bio: 'Lead guitarist of The Reverbs, a rock band with a unique sound.',
      budget: 4500,
      location: 'Mumbai',
      artistType: 'band',
      categoryIDs: ['1'],
      artistRating: 4.5,
      artistReviewCount: 24,
      hostRating: 4.1,
      hostReviewCount: 3,
      subCategoryIDs: ['4'],
      pastBookings: 42,
    },
    {
      id: 'a6',
      phoneNumber: '7',
      profilePicture: 'https://images.unsplash.com/photo-1554446422-d05db23719d5',
      email: 'artist6@test.com',
      fullName: 'Priya Sharma',
      username: 'dancediva',
      isArtist: true,
      bio: 'Classical ballet dancer with training in contemporary styles.',
      budget: 2200,
      location: 'Delhi',
      artistType: 'dancer',
      categoryIDs: ['2'],
      artistRating: 4.9,
      artistReviewCount: 19,
      hostRating: 4.3,
      hostReviewCount: 1,
      subCategoryIDs: ['5', '7'],
      pastBookings: 16,
    },
    {
      id: 'a7',
      phoneNumber: '8',
      profilePicture: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8',
      email: 'artist7@test.com',
      fullName: 'James Wilson',
      username: 'snapmaster',
      isArtist: true,
      bio: 'Award-winning photographer specializing in event and portrait photography.',
      budget: 3500,
      location: 'Mumbai',
      artistType: 'photographer',
      categoryIDs: ['3'],
      artistRating: 4.7,
      artistReviewCount: 37,
      hostRating: 4.5,
      hostReviewCount: 6,
      subCategoryIDs: ['10'],
      pastBookings: 53,
    },
    {
      id: 'a8',
      phoneNumber: '9',
      profilePicture: 'https://images.unsplash.com/photo-1548192746-dd526f154ed9',
      email: 'artist8@test.com',
      fullName: 'Raj Mehta',
      username: 'themixer',
      isArtist: true,
      bio: 'Experienced DJ who specializes in EDM and Bollywood mixes.',
      budget: 3000,
      location: 'Bangalore',
      artistType: 'dj',
      categoryIDs: ['1'],
      artistRating: 4.4,
      artistReviewCount: 22,
      hostRating: 4.2,
      hostReviewCount: 3,
      subCategoryIDs: ['3'],
      pastBookings: 31,
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
      {
        "id": "1",
        "name": "Music",
        "subCategories": [
          { "id": "1", "name": "Live Band" },
          { "id": "2", "name": "Solo Performance" },
          { "id": "3", "name": "DJ" },
          { "id": "4", "name": "Rock Band" }
        ]
      },
      {
        "id": "2",
        "name": "Dance",
        "subCategories": [
          { "id": "5", "name": "Ballet" },
          { "id": "6", "name": "Hip Hop" },
          { "id": "7", "name": "Contemporary" }
        ]
      },
      {
        "id": "3",
        "name": "Art",
        "subCategories": [
          { "id": "8", "name": "Painting" },
          { "id": "9", "name": "Sculpture" },
          { "id": "10", "name": "Photography" }
        ]
      },
      {
        "id": "4",
        "name": "interior designing",
        "subCategories": [
          { "id": "11", "name": "Ballet" },
          { "id": "12", "name": "Hip Hop" },
          { "id": "13", "name": "Contemporary" }
        ]
      },
      {
        "id": "5",
        "name": "desiging",
        "subCategories": [
          { "id": "14", "name": "Ballet" },
          { "id": "15", "name": "Hip Hop" },
          { "id": "16", "name": "Contemporary" }
        ]
      },
    ],
  reviews: [
    {
      id: 'r1',
      reviewerId: 'u2',
      reviewerName: 'John Doe',
      reviewerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      rating: 4.5,
      comment: 'Amazing performance! The crowd loved it.',
      createdAt: '2025-03-20T10:00:00Z',
      type: 'ARTIST',
      userId: 'u1'
    },
    {
      id: 'r2',
      reviewerId: 'u3',
      reviewerName: 'Jane Smith',
      reviewerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      rating: 5.0,
      comment: 'Very professional and punctual.',
      createdAt: '2025-03-19T15:30:00Z',
      type: 'ARTIST',
      userId: 'u1'
    },
    {
      id: 'r3',
      reviewerId: 'u4',
      reviewerName: 'Mike Johnson',
      reviewerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      rating: 4.0,
      comment: 'Great host, clear communication.',
      createdAt: '2025-03-18T09:15:00Z',
      type: 'HOST',
      userId: 'u1'
    },
  ]
};

const typeDefs = gql`
  type LoginResponse {
    userId: ID!
    token: String!
  }

  type Query {
    user(id: ID!): User
    categories: [Category!]!
  }

  type Mutation {
    login(phoneNumber: String!, otp: String!): LoginResponse!
  }

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
    subCategories: [SubCategory!]!
  }
  type SubCategory {
    id: ID!
    name: String!
  }
  type User {
    id: ID!
    phoneNumber: String!
    username: String!
    fullName: String!
    email: String
    displayName: String!
    isArtist: Boolean!
    bio: String
    budget: Int
    categoryIDs: [String!]
    subCategoryIDs: [String!]
    pastBookings: Int
    artistRating: Float
    artistReviewCount: Int
    hostRating: Float
    hostReviewCount: Int
    profilePicture: String
    location: String
    artistType: String
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
    email: String
    fullName: String
    budget: Int
    categories: [String!]
    subCategories: [String!]
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
    userReviews(userId: ID!, type: String): [Review!]!
    artists(
      search: String
      categoryId: ID
      subCategoryIds: [ID!]
      location: String
      minBudget: Int
      maxBudget: Int
      minRating: Float
      sortBy: String
    ): [User!]!
  }
  type Mutation {
    createEvent(input: EventInput!): Event!
    updateInvite(inviteId: ID!, status: String!): Invite!
    updateUser(id: ID!, input: UserInput!): User!
    addPortfolioItem(userId: ID!, input: PortfolioInput!): PortfolioItem!
    removePortfolioItem(id: ID!): Boolean!
    cancelEvent(eventId: ID!): Event!
  }
  type Review {
    id: ID!
    reviewerId: ID!
    reviewerName: String!
    reviewerImage: String
    rating: Float!
    comment: String!
    createdAt: String!
    type: String! # 'ARTIST' or 'HOST'
  }
`;

const resolvers = {
  Query: {
    user: (_, { id }) => mockData.users.find((u) => u.id === id),
    bookings: (_, { userId }) => mockData.bookings.filter((b) => b.userId === userId),
    events: (_, { userId }) => mockData.events.filter((e) => e.host.id === userId),
    invites: (_, { userId }) => mockData.invites.filter((i) => i.userId === userId),
    portfolio: (_, { userId }) => mockData.portfolio.filter((p) => p.userId === userId),
    categories: () => mockData.categories,
    subCategories: () => mockData.categories.flatMap((c) => c.subCategories),
    notifications: (_, { userId }) => mockData.notifications.filter((n) => n.userId === userId),
    userReviews: (_, { userId, type }) => {
      let reviews = mockData.reviews.filter(r => r.userId === userId);
      if (type) {
        reviews = reviews.filter(r => r.type === type);
      }
      return reviews;
    },
    artists: (_, { 
      search, 
      categoryId, 
      subCategoryIds, 
      location, 
      minBudget, 
      maxBudget, 
      minRating,
      sortBy 
    }) => {
      let filteredArtists = mockData.users.filter(user => user.isArtist);

      // Apply search filter
      if (search) {
        filteredArtists = filteredArtists.filter(artist => 
          artist.fullName.toLowerCase().includes(search.toLowerCase()) ||
          (artist.username && artist.username.toLowerCase().includes(search.toLowerCase()))
        );
      }

      // Apply category filter
      if (categoryId) {
        filteredArtists = filteredArtists.filter(artist => 
          artist.categoryIDs?.includes(categoryId)
        );
      }

      // Apply subcategory filters
      if (subCategoryIds && subCategoryIds.length > 0) {
        filteredArtists = filteredArtists.filter(artist => 
          subCategoryIds.some(subId => artist.subCategoryIDs?.includes(subId))
        );
      }

      // Apply location filter
      if (location) {
        filteredArtists = filteredArtists.filter(artist => 
          artist.location?.includes(location)
        );
      }

      // Apply budget filter
      if (minBudget) {
        filteredArtists = filteredArtists.filter(artist => 
          artist.budget >= minBudget
        );
      }
      if (maxBudget) {
        filteredArtists = filteredArtists.filter(artist => 
          artist.budget <= maxBudget
        );
      }

      // Apply rating filter
      if (minRating) {
        filteredArtists = filteredArtists.filter(artist => 
          (artist.artistRating || 0) >= minRating
        );
      }

      // Apply sorting
      if (sortBy) {
        filteredArtists.sort((a, b) => {
          switch (sortBy) {
            case 'top_rated':
              return (b.artistRating || 0) - (a.artistRating || 0);
            case 'popularity':
              return (b.artistReviewCount || 0) - (a.artistReviewCount || 0);
            case 'most_booked':
              return (b.pastBookings || 0) - (a.pastBookings || 0);
            default:
              return 0;
          }
        });
      }

      return filteredArtists;
    },
  },
  Mutation: {
    login: (_, { phoneNumber, otp }) => {
      // Simulate OTP verification
      if (otp === '1') {
        const user = mockData.users.find((u) => u.phoneNumber === phoneNumber);
        if (user) {
          return {
            currentUser: user,
            token: 'mock-jwt-token',
          };
        }
        throw new Error('User not found');
      }
      throw new Error('Invalid OTP');
    },

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