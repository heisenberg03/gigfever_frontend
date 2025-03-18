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

export const GET_EVENTS = gql`
  query GetEvents {
    events {
      id
      title
      category
      date
      location
      host {
        id
        displayName
        rating
        reviewCount
      }
      status
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

// src/graphql/queries.ts
export const GET_INVITES = gql`query { invites { id event { id title } status } }`;
export const GET_BOOKINGS = gql`query { bookings { id event { id title } status } }`;
export const GET_APPLICATIONS = gql`query { applications { id event { id title } status } }`;
export const GET_EVENTS_TO_APPLY = gql`query { events { id title date } }`;

export const GET_PORTFOLIO = gql`
  query GetPortfolio {
    portfolio {
      id
      type
      url
    }
  }
`;

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
      name
    }
  }
`;

export const GET_SUB_CATEGORIES = gql`
  query GetSubCategories {
    subCategories {
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
    }
  }
`;
