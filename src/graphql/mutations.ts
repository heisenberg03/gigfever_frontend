// src/graphql/mutations.ts
import { gql } from '@apollo/client';

// Sign up
export const SIGN_UP = gql`
  mutation SignUp($phone: String!, $username: String!, $fullName: String!) {
    signUp(phone: $phone, username: $username, fullName: $fullName) {
      id
      phone
      username
      fullName
      isArtist
    }
  }
`;

// Sign in with phone OTP
export const SIGN_IN_WITH_PHONE = gql`
  mutation SignInWithPhone($phone: String!, $otp: String!) {
    signInWithPhone(phone: $phone, otp: $otp) {
      accessToken
      user {
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
  }
`;

// Submit a review
export const SUBMIT_REVIEW = gql`
  mutation SubmitReview($userId: ID!, $rating: Float!, $comment: String!, $type: String!) {
    submitReview(userId: $userId, rating: $rating, comment: $comment, type: $type) {
      id
      rating
      comment
      type
      createdAt
      updatedAt
    }
  }
`;

// Update a review
export const UPDATE_REVIEW = gql`
  mutation UpdateReview($reviewId: ID!, $rating: Float, $comment: String) {
    updateReview(reviewId: $reviewId, rating: $rating, comment: $comment) {
      id
      rating
      comment
      updatedAt
    }
  }
`;

// Delete a review
export const DELETE_REVIEW = gql`
  mutation DeleteReview($reviewId: ID!) {
    deleteReview(reviewId: $reviewId)
  }
`;

// Create an event
export const CREATE_EVENT = gql`
  mutation CreateEvent(
    $title: String!, $type: String!, $categoryIds: [ID!]!, $subcategoryIds: [ID!]!,
    $dateTime: String!, $venue: String, $locationId: ID!, $description: String!,
    $budgetMin: Float, $budgetMax: Float
  ) {
    createEvent(
      title: $title, type: $type, categoryIds: $categoryIds, subcategoryIds: $subcategoryIds,
      dateTime: $dateTime, venue: $venue, locationId: $locationId, description: $description,
      budgetMin: $budgetMin, budgetMax: $budgetMax
    ) { id title }
  }
`;

// Update an event
export const UPDATE_EVENT = gql`
  mutation UpdateEvent(
    $id: ID!, $title: String, $type: String, $categoryIds: [ID!], $subcategoryIds: [ID!],
    $dateTime: String, $venue: String, $locationId: ID, $description: String,
    $budgetMin: Float, $budgetMax: Float
  ) {
    updateEvent(
      id: $id, title: $title, type: $type, categoryIds: $categoryIds, subcategoryIds: $subcategoryIds,
      dateTime: $dateTime, venue: $venue, locationId: $locationId, description: $description,
      budgetMin: $budgetMin, budgetMax: $budgetMax
    ) { id title }
  }
`;

// Delete an event
export const DELETE_EVENT = gql`
  mutation DeleteEvent($eventId: ID!) {
    deleteEvent(eventId: $eventId)
  }
`;

// Toggle favorite (event or artist)
export const TOGGLE_FAVORITE = gql`
  mutation ToggleFavorite($targetId: ID!, $type: String!) {
    toggleFavorite(targetId: $targetId, type: $type)
  }
`;

// Invite an artist
export const INVITE_ARTIST = gql`
  mutation InviteArtist($artistId: ID!, $eventId: ID!) {
    inviteArtist(artistId: $artistId, eventId: $eventId) {
      id
      status
    }
  }
`;

// Update invite status
export const UPDATE_INVITE = gql`
  mutation UpdateInvite($inviteId: ID!, $status: String!) {
    updateInvite(inviteId: $inviteId, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

// Apply to an event
export const APPLY_TO_EVENT = gql`
  mutation ApplyToEvent($eventId: ID!) {
    applyToEvent(eventId: $eventId) {
      id
      status
    }
  }
`;

// Withdraw application
export const WITHDRAW_APPLICATION = gql`
  mutation WithdrawApplication($eventId: ID!) {
    withdrawApplication(eventId: $eventId)
  }
`;

// Accept an artist
export const ACCEPT_ARTIST = gql`
  mutation AcceptArtist($eventId: ID!, $artistId: ID!) {
    acceptArtist(eventId: $eventId, artistId: $artistId) {
      id
      status
    }
  }
`;

// Reject an artist
export const REJECT_ARTIST = gql`
  mutation RejectArtist($eventId: ID!, $artistId: ID!) {
    rejectArtist(eventId: $eventId, artistId: $artistId) {
      id
      status
    }
  }
`;

// Report a target (artist, host, or event)
export const REPORT = gql`
  mutation Report($targetId: ID!, $reason: String!, $type: String!) {
    report(targetId: $targetId, reason: $reason, type: $type)
  }
`;

// Start a chat
export const START_CHAT = gql`
  mutation StartChat($receiverId: ID!) {
    startChat(receiverId: $receiverId) {
      id
    }
  }
`;

// Link social media
export const LINK_SOCIAL_MEDIA = gql`
  mutation LinkSocialMedia($platform: String!, $authCode: String!) {
    linkSocialMedia(platform: $platform, authCode: $authCode) {
      platform
      identifier
    }
  }
`;

// Unlink social media
export const UNLINK_SOCIAL_MEDIA = gql`
  mutation UnlinkSocialMedia($platform: String!) {
    unlinkSocialMedia(platform: $platform)
  }
`;

// Update user profile
export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
      id
      fullName
      bio
      budget
      email
    }
  }
`;

// Add portfolio item
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

// Remove portfolio item
export const REMOVE_PORTFOLIO_ITEM = gql`
  mutation RemovePortfolioItem($id: ID!) {
    removePortfolioItem(id: $id)
  }
`;

// Logout
export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;