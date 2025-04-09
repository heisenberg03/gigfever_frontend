// src/graphql/queries.ts
import { gql } from '@apollo/client';

// Fetch current user (cached client-side after login)
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      username
      fullName
      phone
      email
      profilePicture
      location { id address city latitude longitude }
      bio
      budget
      artistType
      artistRating
      artistReviewCount
      hostBio
      hostRating
      hostReviewCount
      categories { id name }
      subcategories { id name }
      youtubeId
      youtubeDisplay
      instagramUsername
      instagramDisplay
      facebookId
      facebookDisplay
      xUsername
      xDisplay
      isArtist
    }
  }
`;

// Fetch artists for listing
export const GET_ARTISTS = gql`
  query GetArtists(
    $search: String
    $categoryIds: [ID!]
    $subcategoryIds: [ID!]
    $locationId: ID
    $minBudget: Float
    $maxBudget: Float
    $minRating: Float
    $sortBy: String
  ) {
    artists(
      search: $search
      categoryIds: $categoryIds
      subcategoryIds: $subcategoryIds
      locationId: $locationId
      minBudget: $minBudget
      maxBudget: $maxBudget
      minRating: $minRating
      sortBy: $sortBy
    ) {
      id
      username
      fullName
      profilePicture
      location { city }
      artistType
      artistRating
      artistReviewCount
      categories { id name }
      subcategories { id name }
    }
  }
`;

// Fetch artist profile
export const GET_ARTIST_PROFILE = gql`
  query GetArtistProfile($id: ID!) {
    user(id: $id) {
      id
      username
      fullName
      profilePicture
      location { id address city latitude longitude }
      bio
      budget
      artistType
      artistRating
      artistReviewCount
      categories { id name }
      subcategories { id name }
      youtubeId
      youtubeDisplay
      instagramUsername
      instagramDisplay
      facebookId
      facebookDisplay
      xUsername
      xDisplay
      isFavorite
    }
  }
`;

// Fetch portfolio
export const GET_PORTFOLIO = gql`
  query GetPortfolio($userId: ID!) {
    portfolio(userId: $userId) {
      id
      mediaType
      mediaUrl
      thumbnail
      source
    }
  }
`;

// Fetch chat conversations
export const GET_CHAT_CONVERSATIONS = gql`
  query GetChatConversations($userId: ID!) {
    chatConversations(userId: $userId) {
      id
      user1 { id username }
      user2 { id username }
      lastMessageText
      lastMessageTimestamp
      lastMessageSender { id }
      lastMessageIsRead
    }
  }
`;

// Fetch chat messages
export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($conversationId: ID!) {
    messages(conversationId: $conversationId) {
      id
      text
      timestamp
      sender { id username }
      isRead
    }
  }
`;

// Fetch favorite artists
export const GET_FAVORITE_ARTISTS = gql`
  query GetFavoriteArtists($userId: ID!) {
    favoriteArtists(userId: $userId) {
      id
      username
      fullName
      profilePicture
      artistRating
      artistReviewCount
    }
  }
`;

// Fetch favorite events
export const GET_FAVORITE_EVENTS = gql`
  query GetFavoriteEvents($userId: ID!) {
    favoriteEvents(userId: $userId) {
      id
      title
      dateTime
      venue
      location { id address city }
      host { id username }
    }
  }
`;

// Fetch notifications
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

// Fetch invites
export const GET_INVITES = gql`
  query GetInvites($userId: ID!) {
    invites(userId: $userId) {
      id
      status
      createdAt
      updatedAt
      event { id title dateTime }
    }
  }
`;

// Fetch applications
export const GET_APPLICATIONS = gql`
  query GetApplications($userId: ID!) {
    applications(userId: $userId) {
      id
      event { id title }
      status
    }
  }
`;