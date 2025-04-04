// src/graphql/queries.ts
import { gql } from '@apollo/client';

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($receiverId: ID!) {
    chatMessages(receiverId: $receiverId) {
      id
      content
      timestamp
      senderId
      receiverId
      read
    }
  }
`;

export const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: ID!) {
    user(id: $userId) {
      id
      fullName
      profilePicture
      isOnline
    }
  }
`;

export const GET_CHAT_LIST = gql`
  query GetChatList {
    chatList {
      id
      userId
      fullName
      profilePicture
      lastMessage {
        content
        timestamp
        senderId
      }
      unreadCount
      isOnline
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

export const MARK_AS_READ = gql`
  mutation MarkMessageAsRead($messageId: ID!) {
    markMessageAsRead(messageId: $messageId)
  }
`;
export const GET_ARTISTS = gql`
  query GetArtists(
    $search: String
    $categoryId: ID
    $subCategoryIds: [ID!]
    $location: String
    $minBudget: Int
    $maxBudget: Int
    $minRating: Float
    $sortBy: String
  ) {
    artists(
      search: $search
      categoryId: $categoryId
      subCategoryIds: $subCategoryIds
      location: $location
      minBudget: $minBudget
      maxBudget: $maxBudget
      minRating: $minRating
      sortBy: $sortBy
    ) {
      id
      phoneNumber
      username
      fullName
      email
      profilePicture
      isArtist
      bio
      budget
      location
      artistType
      categoryIDs
      subCategoryIDs
      artistRating
      artistReviewCount
      hostRating
      hostReviewCount
      pastBookings
      youtubeDisplay
      youtubeId
      instagramDisplay
      instagramUsername
      facebookDisplay
      facebookId
      xDisplay
      xUsername
    }
  }
`;

export const GET_FAVORITE_ARTISTS = gql`
  query GetFavoriteArtists {
    artists {
      id
      phoneNumber
      username
      fullName
      email
      profilePicture
      isArtist
      bio
      budget
      location
      artistType
      categoryIDs
      subCategoryIDs
      artistRating
      artistReviewCount
      hostRating
      hostReviewCount
      pastBookings
      youtubeDisplay
      youtubeId
      instagramDisplay
      instagramUsername
      facebookDisplay
      facebookId
      xDisplay
      xUsername
    }
  }
`;

export const GET_FAVORITE_EVENTS = gql`
  query GetFavoriteEvents {
    events {
      id
      title
      description
      banner
      dateTime
      location {
        lat
        lng
        address
      }
      status
      eventType
      budget {
        min
        max
      }
      category
      subcategories
      host { 
        id 
        displayName 
        profilePicture
      }
    }
  }
`;

export const GET_ARTIST_PORTFOLIO = gql`
  query GetArtistPortfolio($id: ID!) {
    portfolio(userId: $id) {
      id
      mediaType
      mediaUrl
      thumbnail
      source
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



export const GET_EVENT_ARTISTS = gql`
  query GetEventArtists($id: ID!) {
    event(id: $id) {
      artists {
        id
        displayName
        profilePicture
        categories
        subcategories
        portfolio { type url }
        rating
        reviewCount
        pastBookings
        youtubeDisplay
        youtubeId
        instagramDisplay
        instagramUsername
        facebookDisplay
        facebookId
        xDisplay
        xUsername
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
      youtubeDisplay
      youtubeId
      instagramDisplay
      instagramUsername
      facebookDisplay
      facebookId
      xDisplay
      xUsername
    }
  }
`;

export const GET_BOOKINGS = gql`
  query GetBookings($userId: ID!) {
    bookings(userId: $userId) {
      id
      userId
      event {
        id
        title
        banner
        dateTime
        location {
          address
        }
        host {
          id
          fullName
          profilePicture
        }
        type
        budget {
          min
          max
        }
        status
      }
      status
      date
      createdAt
      updatedAt
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
      source
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
      source
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

export const GET_EVENTS_WITH_FILTERS = gql`
  query GetEventsWithFilters(
    $search: String
    $categoryId: ID
    $subCategoryIds: [ID!]
    $location: String
    $minBudget: Int
    $maxBudget: Int
    $startDate: String
    $endDate: String
    $sortBy: String
  ) {
    events(
      search: $search
      categoryId: $categoryId
      subCategoryIds: $subCategoryIds
      location: $location
      minBudget: $minBudget
      maxBudget: $maxBudget
      startDate: $startDate
      endDate: $endDate
      sortBy: $sortBy
    ) {
      id
      title
      description
      banner
      dateTime
      location {
        lat
        lng
        address
      }
      status
      eventType
      budget {
        min
        max
      }
      category
      subcategories
      host { 
        id 
        displayName 
        profilePicture
        rating
        reviewsCount
        pastEventsCount
      }
      applicationsCount
      isFavorite
      userApplicationStatus
    }
  }
`;

export const GET_TOP_CATEGORIES = gql`
  query GetTopCategories {
    categories {
      id
      name
      image
    }
  }
`;

export const GET_TOP_ARTISTS = gql`
  query GetTopArtists {
    artists {
      id
      phoneNumber
      username
      fullName
      email
      profilePicture
      isArtist
      bio
      budget
      location
      artistType
      categoryIDs
      subCategoryIDs
      artistRating
      artistReviewCount
      hostRating
      hostReviewCount
      pastBookings
      youtubeDisplay
      youtubeId
      instagramDisplay
      instagramUsername
      facebookDisplay
      facebookId
      xDisplay
      xUsername
    }
  }
`;

export const GET_TOP_EVENTS = gql`
  query GetTopEvents {
    events {
      id
      title
      banner
      dateTime
      location {
        address
        lat
        lng
      }
      status
      eventType
      budget {
        min
        max
      }
      category
      subcategories
      host { 
        id 
        displayName 
        profilePicture
      }
      applicationsCount
      isFavorite
      userApplicationStatus
    }
  }
`;