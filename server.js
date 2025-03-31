// server.js
const { ApolloServer, gql } = require('apollo-server');

// First define userData that will be used by eventData
const userData = [
  {
    id: 'u1',
    phoneNumber: '1',
    profilePicture: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    email:'dummy@email.som',
    fullName: 'Test User',
    username: 'Test',
    isArtist: true,
    bio: 'Event organizer with a passion for music.',
    budget: 5000,
    location: 'Mumbai',
    artistType: 'band',
    categoryIDs: ['1'],
    artistRating: 4.5,
    artistReviewCount: 10,
    hostRating: 4.3,
    hostReviewCount: 5,
    pastBookings: 10,
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
    pastBookings: 10,
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
    pastBookings: 10,
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
    pastBookings: 10,
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
    pastBookings: 10,
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
    pastBookings: 10,
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
    pastBookings: 10,
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
    pastBookings: 10,
  },
];

// Define event data using artist data defined above
const eventData = [
  { 
    id: 'e1', 
    title: 'Rock Night', 
    category: 'Music', 
    categories: ['Music'],
    subcategories: ['Live Band', 'Rock Band'],
    date: '2025-04-01', 
    time: '20:00',
    dateTime: '2025-04-01T20:00:00Z',
    location: { 
      lat: 19.0760,
      lng: 72.8777,
      address: 'Mumbai, India'
    }, 
    status: 'Open', 
    type: 'Concert',
    eventType: 'Concert',
    description: 'A night of amazing rock music with the best bands in town',
    banner: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4',
    budget: { min: 5000, max: 10000 },
    host: { 
      id: 'u1', 
      displayName: 'Test',
      fullName: 'Test User',
      profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      rating: 4.5,
      pastEventsCount: 10,
      reviewsCount: 18
    }, 
    isDraft: false,
    applicationsCount: 3,
    isFavorite: false,
    userApplicationStatus: null,
    applications: [
      {
        id: 'a1',
        fullName: 'John Doe',
        status: 'Applied',
        artistType: 'dj',
        location: 'Mumbai',
        artistRating: 4.8,
        artistReviewCount: 42,
        budget: 2000,
        categoryIDs: ['1'],
        subCategoryIDs: ['3','4'],
        profilePicture: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b',
        username: 'johndoe'
      },
      {
        id: 'a2',
        fullName: 'Sarah Wilson',
        status: 'Applied',
        artistType: 'vocalist',
        location: 'Delhi',
        artistRating: 4.6,
        artistReviewCount: 18,
        budget: 1500,
        categoryIDs: ['1'],
        subCategoryIDs: ['2'],
        profilePicture: 'https://images.unsplash.com/photo-1535090042247-30387519d11f',
        username: 'sarahmusic'
      },
      {
        id: 'a3',
        fullName: 'Mike Chen',
        status: 'Applied',
        artistType: 'painter',
        location: 'Mumbai',
        artistRating: 4.9,
        artistReviewCount: 26,
        budget: 3000,
        categoryIDs: ['3'],
        subCategoryIDs: ['8'],
        profilePicture: 'https://images.unsplash.com/photo-1532148179517-95962e54071f',
        username: 'miketheartist'
      }
    ],
    confirmedArtist: null
  },
  { 
    id: 'e2', 
    title: 'Jazz Evening', 
    category: 'Music', 
    categories: ['Music'],
    subcategories: ['Solo Performance'],
    date: '2025-04-10', 
    time: '19:00',
    dateTime: '2025-04-10T19:00:00Z',
    location: { 
      lat: 28.6139,
      lng: 77.2090,
      address: 'Delhi, India'
    }, 
    status: 'Confirmed', 
    type: 'Private Party',
    eventType: 'Private Party',
    description: 'Sophisticated jazz evening for a corporate gathering',
    banner: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
    budget: { min: 3000, max: 7000 },
    host: { 
      id: 'u1', 
      displayName: 'Test',
      fullName: 'Test User',
      profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      rating: 4.5,
      pastEventsCount: 10,
      reviewsCount: 18
    }, 
    isDraft: false,
    applicationsCount: 0,
    isFavorite: true,
    userApplicationStatus: null,
    applications: [],
    confirmedArtist: {
      id: 'a2',
      fullName: 'Sarah Wilson',
      status: 'Confirmed',
      artistType: 'vocalist',
      location: 'Delhi',
      artistRating: 4.6,
      artistReviewCount: 18,
      budget: 1500,
      categoryIDs: ['1'],
      subCategoryIDs: ['2'],
      profilePicture: 'https://images.unsplash.com/photo-1535090042247-30387519d11f',
      username: 'sarahmusic'
    }
  },
  { 
    id: 'e3', 
    title: 'Wedding Celebration', 
    category: 'Music', 
    categories: ['Music'],
    subcategories: ['DJ'],
    date: '2025-06-15', 
    time: '18:00',
    dateTime: '2025-06-15T18:00:00Z',
    location: { 
      lat: 19.0760,
      lng: 72.8777,
      address: 'Mumbai, India'
    }, 
    status: 'Open', 
    type: 'Wedding',
    eventType: 'Wedding',
    description: 'Looking for a DJ to play at our wedding reception',
    banner: 'https://images.unsplash.com/photo-1519741347686-c1e331fddb20',
    budget: { min: 8000, max: 15000 },
    host: { 
      id: 'u1', 
      displayName: 'Test',
      fullName: 'Test User',
      profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      rating: 4.5,
      pastEventsCount: 10,
      reviewsCount: 18
    }, 
    isDraft: false,
    applicationsCount: 5,
    isFavorite: false,
    userApplicationStatus: null,
    applications: [],
    confirmedArtist: null
  },
  { 
    id: 'e4', 
    title: 'Corporate Annual Day', 
    category: 'Dance', 
    categories: ['Dance'],
    subcategories: ['Contemporary', 'Hip Hop'],
    date: '2025-07-20', 
    time: '16:00',
    dateTime: '2025-07-20T16:00:00Z',
    location: { 
      lat: 12.9716,
      lng: 77.5946,
      address: 'Bangalore, India'
    }, 
    status: 'Open', 
    type: 'Corporate Event',
    eventType: 'Corporate Event',
    description: 'Looking for dance performers for our annual company celebration',
    banner: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a',
    budget: { min: 10000, max: 20000 },
    host: { 
      id: 'a2', 
      displayName: 'Sarah',
      fullName: 'Sarah Wilson',
      profilePicture: 'https://images.unsplash.com/photo-1535090042247-30387519d11f',
      rating: 4.6,
      pastEventsCount: 6,
      reviewsCount: 10
    }, 
    isDraft: false,
    applicationsCount: 8,
    isFavorite: false,
    userApplicationStatus: null,
    applications: [],
    confirmedArtist: null
  },
  { 
    id: 'e5', 
    title: 'Art Exhibition', 
    category: 'Art', 
    categories: ['Art'],
    subcategories: ['Photography'],
    date: '2025-05-05', 
    time: '11:00',
    dateTime: '2025-05-05T11:00:00Z',
    location: { 
      lat: 28.6139,
      lng: 77.2090,
      address: 'Delhi, India'
    }, 
    status: 'Open', 
    type: 'Exhibition',
    eventType: 'Exhibition',
    description: 'Seeking photographers for our upcoming gallery exhibition',
    banner: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea',
    budget: { min: 4000, max: 9000 },
    host: { 
      id: 'a3', 
      displayName: 'Mike',
      fullName: 'Mike Chen',
      profilePicture: 'https://images.unsplash.com/photo-1532148179517-95962e54071f',
      rating: 4.9,
      pastEventsCount: 4,
      reviewsCount: 10
    }, 
    isDraft: false,
    applicationsCount: 2,
    isFavorite: false,
    userApplicationStatus: null,
    applications: [],
    confirmedArtist: null
  }
];

// Define reviewsData separately to avoid circular reference
const reviewsData = [
  {
    id: 'r1',
    reviewerId: 'u2',
    reviewerName: 'John Doe',
    reviewerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    rating: 4.5,
    comment: 'Amazing performance! The crowd loved it.',
    createdAt: '2025-03-20T10:00:00Z',
    type: 'ARTIST',
    userId: 'u1',
    eventId: 'e1'
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
    userId: 'u1',
    eventId: 'e2'
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
    userId: 'u1',
    eventId: 'e3'
  },
  {
    id: 'r4',
    reviewerId: 'u5',
    reviewerName: 'Sarah Wilson',
    reviewerImage: 'https://images.unsplash.com/photo-1535090042247-30387519d11f',
    rating: 4.8,
    comment: 'Excellent event organization and communication.',
    createdAt: '2025-03-17T14:20:00Z',
    type: 'HOST',
    userId: 'u1',
    eventId: 'e4'
  },
  {
    id: 'r5',
    reviewerId: 'u6',
    reviewerName: 'David Brown',
    reviewerImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
    rating: 4.2,
    comment: 'Good performance, but started a bit late.',
    createdAt: '2025-03-16T11:45:00Z',
    type: 'ARTIST',
    userId: 'u1',
    eventId: 'e5'
  },
  {
    id: 'r6',
    reviewerId: 'a1',
    reviewerName: 'John Doe',
    reviewerImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b',
    rating: 5.0,
    comment: 'Fantastic host! Provided all necessary equipment and was very accommodating.',
    createdAt: '2025-03-14T10:30:00Z',
    type: 'HOST',
    userId: 'u1',
    eventId: 'e1'
  },
  {
    id: 'r7',
    reviewerId: 'a2',
    reviewerName: 'Sarah Wilson',
    reviewerImage: 'https://images.unsplash.com/photo-1535090042247-30387519d11f',
    rating: 4.7,
    comment: 'Great venue and extremely professional host. Would work with again!',
    createdAt: '2025-03-12T16:45:00Z',
    type: 'HOST',
    userId: 'u1',
    eventId: 'e2'
  },
  {
    id: 'r8',
    reviewerId: 'a3',
    reviewerName: 'Mike Chen',
    reviewerImage: 'https://images.unsplash.com/photo-1532148179517-95962e54071f',
    rating: 4.5,
    comment: 'Clear communication and timely payments. Wonderful experience.',
    createdAt: '2025-03-10T09:20:00Z',
    type: 'HOST',
    userId: 'u1',
    eventId: 'e3'
  }
];

// Update event host data to include reviews
eventData.forEach(event => {
  if (event.host && event.host.id) {
    // Add reviews to the host
    event.host.reviews = reviewsData.filter(review => 
      review.userId === event.host.id && review.type === 'HOST'
    );
  }
});

const mockData = {
  users: userData,
  events: eventData,
  reviews: reviewsData,
  bookings: [
    { id: 'b1', userId: 'u1', event: { id: 'e1', title: 'Rock Night' }, status: 'confirmed', date: '2025-04-01' },
  ],
  invites: [
    { id: 'i1', userId: 'u1', event: { id: 'e1', title: 'Rock Night', host: { id: 'h1', displayName: 'Host' } }, status: 'pending' },
  ],
  portfolio: [
    {
      id: 'p1',
      userId: 'a1',
      mediaType: 'VIDEO',
      mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Changed to watch format
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      source: 'youtube'
    },
    {
      id: 'p2',
      userId: 'a1',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
    },
    {
      id: 'p3',
      userId: 'a1',
      mediaType: 'VIDEO',
      mediaUrl: 'https://www.instagram.com/reel/CzN9rrPx5mZ/',
      thumbnail: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      source: 'instagram'
    },
    {
      id: 'p4',
      userId: 'a1',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
    },
    {
      id: 'p5',
      userId: 'a1',
      mediaType: 'VIDEO',
      mediaUrl: 'https://www.youtube.com/watch?v=BTYAsjAVa3I', // Changed to watch format      
      thumbnail: 'https://img.youtube.com/vi/BTYAsjAVa3I/maxresdefault.jpg',
      source: 'youtube'
    },
    {
      id: 'p6',
      userId: 'a1',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    },
    {
      id: 'p7',
      userId: 'a1',
      mediaType: 'VIDEO',
      mediaUrl: 'https://www.instagram.com/p/C0-e3uWthz-/',
      thumbnail: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      source: 'instagram'
    },
    {
      id: 'p8',
      userId: 'a1',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    },
    {
      id: 'p9',
      userId: 'a1',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    },
    {
      id: 'p10',
      userId: 'a2',
      mediaType: 'VIDEO',
      mediaUrl: 'https://www.instagram.com/reel/CrYPOk2rtpw/',
      thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      source: 'instagram'
    },
    {
      id: 'p11',
      userId: 'a2',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1563841930606-67e2bce48b78?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1036&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1563841930606-67e2bce48b78?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1036&q=80',
    },
    {
      id: 'p12',
      userId: 'a2',
      mediaType: 'VIDEO',
      mediaUrl: 'https://www.youtube.com/watch?v=V3d-4ChAwo0', // Changed to watch format      
      thumbnail: 'https://img.youtube.com/vi/V3d-4ChAwo0/maxresdefault.jpg',
      source: 'youtube'
    }
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
};

// Update existing events in mockData
mockData.events = mockData.events.map(event => {
  // Ensure all events have the required structure
  if (!event.applications) event.applications = [];
  if (!event.isFavorite) event.isFavorite = false;
  if (!event.userApplicationStatus) event.userApplicationStatus = null;
  
  // Add reviews to the host if not already present
  if (event.host && event.host.id && !event.host.reviews) {
    event.host.reviews = mockData.reviews.filter(review => 
      review.userId === event.host.id && review.type === 'HOST'
    );
  }
  
  // Update status format (capitalize first letter)
  if (event.status === 'open') event.status = 'Open';
  if (event.status === 'confirmed') event.status = 'Confirmed';
  if (event.status === 'canceled') event.status = 'Cancelled';
  
  // Convert location to object if it's a string
  if (typeof event.location === 'string') {
    let lat = 0, lng = 0;
    if (event.location === 'Mumbai') { lat = 19.0760; lng = 72.8777; }
    else if (event.location === 'Delhi') { lat = 28.6139; lng = 77.2090; }
    else if (event.location === 'Bangalore') { lat = 12.9716; lng = 77.5946; }
    
    event.location = {
      lat, lng, address: event.location + ', India'
    };
  }
  
  return event;
});

// Add chat-related mock data
const chatData = {
  messages: [
    {
      id: 'm1',
      senderId: 'u1',
      receiverId: 'a1',
      content: 'Hi, I saw your profile and would love to discuss a potential collaboration.',
      timestamp: '2025-03-20T10:00:00Z',
      read: false
    },
    {
      id: 'm2',
      senderId: 'a1',
      receiverId: 'u1',
      content: 'Hello! Thanks for reaching out. I\'d be happy to discuss.',
      timestamp: '2025-03-20T10:05:00Z',
      read: true
    },
    {
      id: 'm3',
      senderId: 'u1',
      receiverId: 'a1',
      content: 'Great! I\'m organizing a corporate event next month.',
      timestamp: '2025-03-20T10:10:00Z',
      read: false
    },
    {
      id: 'm4',
      senderId: 'a1',
      receiverId: 'u1',
      content: 'That sounds interesting. What kind of event are you planning?',
      timestamp: '2025-03-20T10:15:00Z',
      read: true
    }
  ],
  chatList: [
    {
      id: 'c1',
      userId: 'a1',
      fullName: 'John Doe',
      profilePicture: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b',
      lastMessage: {
        content: 'That sounds interesting. What kind of event are you planning?',
        timestamp: '2025-03-20T10:15:00Z',
        senderId: 'a1'
      },
      unreadCount: 2,
      isOnline: true
    },
    {
      id: 'c2',
      userId: 'a2',
      fullName: 'Sarah Wilson',
      profilePicture: 'https://images.unsplash.com/photo-1535090042247-30387519d11f',
      lastMessage: {
        content: 'I\'m available for that date.',
        timestamp: '2025-03-19T15:30:00Z',
        senderId: 'a2'
      },
      unreadCount: 0,
      isOnline: false
    },
    {
      id: 'c3',
      userId: 'a3',
      fullName: 'Mike Chen',
      profilePicture: 'https://images.unsplash.com/photo-1532148179517-95962e54071f',
      lastMessage: {
        content: 'Let\'s discuss the details.',
        timestamp: '2025-03-18T09:15:00Z',
        senderId: 'u1'
      },
      unreadCount: 1,
      isOnline: true
    }
  ]
};

const typeDefs = gql`
  type LoginResponse {
    userId: ID!
    token: String!
  }

  type Query {
    user(id: ID!): User
    event(id: ID!): Event
    categories: [Category!]!
    portfolio(userId: ID!): [PortfolioItem!]!
    events(
      userId: ID
      search: String
      categoryId: ID
      subCategoryIds: [ID!]
      location: String
      minBudget: Int
      maxBudget: Int
      startDate: String
      endDate: String
      sortBy: String
    ): [Event!]!
    bookings(userId: ID!): [Booking!]!
    invites(userId: ID!): [Invite!]!
    subCategories: [SubCategory!]!
    notifications(userId: ID!): [Notification!]!
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
    chatMessages(receiverId: ID!): [ChatMessage!]!
    chatList: [ChatListItem!]!
  }

  type Mutation {
    login(phoneNumber: String!, otp: String!): LoginResponse!
    createEvent(input: EventInput!): Event!
    updateInvite(inviteId: ID!, status: String!): Invite!
    updateUser(id: ID!, input: UserInput!): User!
    addPortfolioItem(userId: ID!, input: PortfolioInput!): PortfolioItem!
    removePortfolioItem(id: ID!): Boolean!
    cancelEvent(eventId: ID!): Event!
    applyAsArtist(eventId: ID!): Event!
    withdrawApplication(eventId: ID!): Boolean!
    acceptArtist(eventId: ID!, artistId: ID!): Event!
    rejectArtist(eventId: ID!, artistId: ID!): Event!
    toggleFavoriteEvent(eventId: ID!): Boolean!
    deleteEvent(eventId: ID!): Boolean!
    sendMessage(receiverId: ID!, content: String!): ChatMessage!
    markMessageAsRead(messageId: ID!): Boolean!
    markAllMessagesAsRead(receiverId: ID!): Boolean!
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
    category: String
    categories: [String!]
    subcategories: [String!]
    date: String!
    time: String
    dateTime: String
    location: Location!
    status: String!
    type: String!
    eventType: String
    description: String
    banner: String
    budget: Budget
    host: Host!
    isDraft: Boolean
    applicationsCount: Int
    isFavorite: Boolean
    userApplicationStatus: String
    applications: [Artist]
    confirmedArtist: Artist
  }
  type Location {
    lat: Float!
    lng: Float!
    address: String!
  }
  type Budget {
    min: Int
    max: Int
  }
  type Host {
    id: ID!
    displayName: String
    fullName: String!
    rating: Float
    reviewsCount: Int
    pastEventsCount: Int
    profilePicture: String
    reviews: [Review]
  }
  type Artist {
    id: ID!
    fullName: String!
    status: String
    artistType: String
    location: String
    artistRating: Float
    artistReviewCount: Int
    budget: Int
    categoryIDs: [String!]
    subCategoryIDs: [String!]
    profilePicture: String
    username: String
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
  type Review {
    id: ID!
    reviewerId: ID!
    reviewerName: String!
    reviewerImage: String
    rating: Float!
    comment: String!
    createdAt: String!
    type: String! # 'ARTIST' or 'HOST'
    userId: ID!
    eventId: ID
  }
  type ChatMessage {
    id: ID!
    senderId: ID!
    receiverId: ID!
    content: String!
    timestamp: String!
    read: Boolean!
  }
  type ChatListItem {
    id: ID!
    userId: ID!
    fullName: String!
    profilePicture: String
    lastMessage: LastMessage
    unreadCount: Int!
    isOnline: Boolean!
  }
  type LastMessage {
    content: String!
    timestamp: String!
    senderId: ID!
  }
`;

const resolvers = {
  Query: {
    user: (_, { id }) => mockData.users.find((u) => u.id === id),
    event: (_, { id }) => mockData.events.find(e => e.id === id),
    userReviews: (_, { userId, type }) => mockData.reviews.filter(r => r.userId === userId && (!type || r.type === type)),
    bookings: (_, { userId }) => mockData.bookings.filter((b) => b.userId === userId),
    events: (_, { 
      userId, 
      search, 
      categoryId, 
      subCategoryIds, 
      location, 
      minBudget, 
      maxBudget, 
      startDate, 
      endDate, 
      sortBy 
    }) => {
      // If userId is provided, filter by host ID
      let filteredEvents = userId ? 
        mockData.events.filter(e => e.host.id === userId) : 
        mockData.events;
      
      // Apply search filter
      if (search) {
        filteredEvents = filteredEvents.filter(event => 
          event.title.toLowerCase().includes(search.toLowerCase()) ||
          (event.description && event.description.toLowerCase().includes(search.toLowerCase()))
        );
      }

      // Apply category filter
      if (categoryId) {
        const category = mockData.categories.find(c => c.id === categoryId);
        if (category) {
          filteredEvents = filteredEvents.filter(event => 
            event.category === category.name || (event.categories && event.categories.includes(category.name))
          );
        }
      }

      // Apply subcategory filters
      if (subCategoryIds && subCategoryIds.length > 0) {
        // Get subcategory names from IDs
        const subCategoryNames = mockData.categories
          .flatMap(cat => cat.subCategories)
          .filter(sub => subCategoryIds.includes(sub.id))
          .map(sub => sub.name);
        
        filteredEvents = filteredEvents.filter(event => 
          (event.subcategories && event.subcategories.some(sub => subCategoryNames.includes(sub))) ||
          (event.subCategories && event.subCategories.some(sub => subCategoryNames.includes(sub)))
        );
      }

      // Apply location filter
      if (location) {
        filteredEvents = filteredEvents.filter(event => {
          if (typeof event.location === 'object' && event.location.address) {
            return event.location.address.includes(location);
          } else if (typeof event.location === 'string') {
            return event.location.includes(location);
          }
          return false;
        });
      }

      // Apply budget filter
      if (minBudget) {
        filteredEvents = filteredEvents.filter(event => 
          event.budget && event.budget.min >= minBudget
        );
      }
      if (maxBudget) {
        filteredEvents = filteredEvents.filter(event => 
          event.budget && event.budget.max <= maxBudget
        );
      }

      // Apply date filters
      if (startDate) {
        const start = new Date(startDate);
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.dateTime) >= start
        );
      }
      if (endDate) {
        const end = new Date(endDate);
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.dateTime) <= end
        );
      }

      // Apply sorting
      if (sortBy) {
        filteredEvents.sort((a, b) => {
          switch (sortBy) {
            case 'dateAsc':
              return new Date(a.dateTime) - new Date(b.dateTime);
            case 'dateDesc':
              return new Date(b.dateTime) - new Date(a.dateTime);
            case 'priceAsc':
              return (a.budget?.min || 0) - (b.budget?.min || 0);
            case 'priceDesc':
              return (b.budget?.max || 0) - (a.budget?.max || 0);
            default:
              return 0;
          }
        });
      }

      return filteredEvents;
    },
    invites: (_, { userId }) => mockData.invites.filter((i) => i.userId === userId),
    portfolio: (_, { userId }) => mockData.portfolio.filter(item => item.userId === userId),
    categories: () => mockData.categories,
    subCategories: () => mockData.categories.flatMap((c) => c.subCategories),
    notifications: (_, { userId }) => mockData.notifications.filter((n) => n.userId === userId),
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
    chatMessages: (_, { receiverId }) => {
      return chatData.messages.filter(
        message => message.receiverId === receiverId || message.senderId === receiverId
      );
    },
    chatList: () => {
      return chatData.chatList;
    }
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
    applyAsArtist: (_, { eventId }) => {
      const event = mockData.events.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');
      
      // Find the current user (using u1 as a placeholder)
      const currentUser = mockData.users.find(u => u.id === 'u1');
      
      // Create an applicant object for the current user
      const newApplicant = {
        id: currentUser.id,
        fullName: currentUser.fullName,
        status: 'Applied',
        artistType: currentUser.artistType,
        location: currentUser.location,
        artistRating: currentUser.artistRating,
        artistReviewCount: currentUser.artistReviewCount,
        budget: currentUser.budget,
        categoryIDs: currentUser.categoryIDs,
        subCategoryIDs: currentUser.subCategoryIDs,
        profilePicture: currentUser.profilePicture,
        username: currentUser.username
      };
      
      // Add to applications if not already there
      if (!event.applications.find(a => a.id === currentUser.id)) {
        event.applications.push(newApplicant);
        event.applicationsCount = event.applications.length;
      }
      
      event.userApplicationStatus = 'Applied';
      return event;
    },
    withdrawApplication: (_, { eventId }) => {
      const event = mockData.events.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');
      
      // Remove from applications (assuming current user is u1)
      event.applications = event.applications.filter(a => a.id !== 'u1');
      event.applicationsCount = event.applications.length;
      event.userApplicationStatus = null;
      
      // If this was a confirmed artist, remove that as well
      if (event.confirmedArtist && event.confirmedArtist.id === 'u1') {
        event.confirmedArtist = null;
        event.status = 'Open';
      }
      
      return true;
    },
    acceptArtist: (_, { eventId, artistId }) => {
      const event = mockData.events.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');
      
      const artist = event.applications.find(a => a.id === artistId);
      if (!artist) throw new Error('Artist not found in applications');
      
      artist.status = 'Confirmed';
      event.confirmedArtist = artist;
      event.status = 'Confirmed';
      
      // Remove all other applications
      event.applications = [];
      event.applicationsCount = 0;
      
      return event;
    },
    rejectArtist: (_, { eventId, artistId }) => {
      const event = mockData.events.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');
      
      // Remove from applications
      event.applications = event.applications.filter(a => a.id !== artistId);
      event.applicationsCount = event.applications.length;
      
      return event;
    },
    toggleFavoriteEvent: (_, { eventId }) => {
      const event = mockData.events.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');
      
      event.isFavorite = !event.isFavorite;
      return event.isFavorite;
    },
    deleteEvent: (_, { eventId }) => {
      const index = mockData.events.findIndex(e => e.id === eventId);
      if (index === -1) throw new Error('Event not found');
      
      mockData.events.splice(index, 1);
      return true;
    },
    sendMessage: (_, { receiverId, content }) => {
      const newMessage = {
        id: `m${chatData.messages.length + 1}`,
        senderId: 'u1', // Assuming current user is u1
        receiverId,
        content,
        timestamp: new Date().toISOString(),
        read: false
      };
      chatData.messages.push(newMessage);

      // Update chat list
      const chatListItem = chatData.chatList.find(chat => chat.userId === receiverId);
      if (chatListItem) {
        chatListItem.lastMessage = {
          content,
          timestamp: newMessage.timestamp,
          senderId: 'u1'
        };
        chatListItem.unreadCount += 1;
      } else {
        // Create new chat list item if it doesn't exist
        const user = mockData.users.find(u => u.id === receiverId);
        if (user) {
          chatData.chatList.push({
            id: `c${chatData.chatList.length + 1}`,
            userId: receiverId,
            fullName: user.fullName,
            profilePicture: user.profilePicture,
            lastMessage: {
              content,
              timestamp: newMessage.timestamp,
              senderId: 'u1'
            },
            unreadCount: 1,
            isOnline: false
          });
        }
      }

      return newMessage;
    },
    markMessageAsRead: (_, { messageId }) => {
      const message = chatData.messages.find(m => m.id === messageId);
      if (message) {
        message.read = true;
        return true;
      }
      return false;
    },
    markAllMessagesAsRead: (_, { receiverId }) => {
      const messages = chatData.messages.filter(
        m => m.receiverId === 'u1' && m.senderId === receiverId && !m.read
      );
      messages.forEach(m => m.read = true);

      // Update chat list
      const chatListItem = chatData.chatList.find(chat => chat.userId === receiverId);
      if (chatListItem) {
        chatListItem.unreadCount = 0;
      }

      return true;
    }
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen({ port: 4000 }).then(({ url }) => console.log(`🚀 Dummy GraphQL Server running at ${url}`));