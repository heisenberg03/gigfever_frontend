import { gql } from '@apollo/client';

export const GET_ARTISTS = gql`
  query GetArtists {
    artists {
      id
      displayName
      profilePicture
      categories
      subCategories
      rating
      reviewCount
      pastBookings
      bio
    }
  }
`;

export const GET_ARTIST_PORTFOLIO = gql`
  query GetArtistPortfolio($id: ID!) {
    artist(id: $id) {
      portfolio {
        type
        url
      }
    }
  }
`;

export const GET_ARTIST_REVIEWS = gql`
  query GetArtistReviews($id: ID!) {
    artist(id: $id) {
      reviews {
        id
        rating
        comment
        reviewer { displayName }
      }
    }
  }
`;

export const GET_APPLICATIONS = gql`query { applications { id event { id title } status } }`;
export const GET_EVENTS_TO_APPLY = gql`query { events { id title date } }`;

export const GET_TRENDING_ARTISTS = gql`
  query GetTrendingArtists {
    trendingArtists {
      id
      displayName
      rating
      reviewCount
      subCategories
    }
  }
`;
export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($receiverId: ID!) {
    chatMessages(receiverId: $receiverId) {
      id
      content
      timestamp
    }
  }
`;

export const GET_EVENT_ARTISTS = gql`
  query GetEventArtists($id: ID!) {
    event(id: $id) {
      artists {
        id
        displayName
        profilePicture
        categories
        subCategories
        portfolio { type url }
        rating
        reviewCount
        pastBookings
      }
    }
  }
`;

export const GET_EVENT_REVIEWS = gql`
  query GetEventReviews($id: ID!) {
    event(id: $id) {
      reviews {
        id
        rating
        comment
        reviewer { displayName }
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
    }
  }
`;

export const GET_SUB_CATEGORIES = gql`
  query GetSubCategories {
    subCategories {
      id
      name
    }
  }
`;

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($userId: ID!) {
    notifications(userId: $userId) {
      id
      message
      timestamp
      type
      relatedId
      read
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      phoneNumber
      fullName
      displayName
      isArtist
      bio
      budget
      categories
      subcategories
    }
  }
`;

export const GET_BOOKINGS = gql`
  query GetBookings($userId: ID!) {
    bookings(userId: $userId) {
      id
      event { id title }
      status
      date
    }
  }
`;

export const GET_EVENTS = gql`
  query GetEvents($userId: ID!) {
    events(userId: $userId) {
      id
      title
      category
      date
      location
      status
      host { id displayName }
      isDraft
    }
  }
`;

export const GET_INVITES = gql`
  query GetInvites($userId: ID!) {
    invites(userId: $userId) {
      id
      event { id title host { id displayName } }
      status
    }
  }
`;

export const GET_PORTFOLIO = gql`
  query GetPortfolio($userId: ID!) {
    portfolio(userId: $userId) {
      id
      mediaType
      mediaUrl
      thumbnail
    }
  }
`;

export const CREATE_EVENT = gql`
  mutation CreateEvent($input: EventInput!) {
    createEvent(input: $input) {
      id
      title
      category
      date
      location
      status
      host { id displayName }
      isDraft
    }
  }
`;

export const UPDATE_INVITE = gql`
  mutation UpdateInvite($inviteId: ID!, $status: String!) {
    updateInvite(inviteId: $inviteId, status: $status) {
      id
      event { id title }
      status
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
      id
      bio
      budget
      categories
      subcategories
    }
  }
`;

export const ADD_PORTFOLIO_ITEM = gql`
  mutation AddPortfolioItem($userId: ID!, $input: PortfolioInput!) {
    addPortfolioItem(userId: $userId, input: $input) {
      id
      mediaType
      mediaUrl
      thumbnail
    }
  }
`;

export const REMOVE_PORTFOLIO_ITEM = gql`
  mutation RemovePortfolioItem($id: ID!) {
    removePortfolioItem(id: $id)
  }
`;

export const CANCEL_EVENT = gql`
  mutation CancelEvent($eventId: ID!) {
    cancelEvent(eventId: $eventId) {
      id
      status
    }
  }
`;