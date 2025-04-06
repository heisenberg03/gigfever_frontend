import { gql } from '@apollo/client';

export const SIGN_UP = gql`
  mutation SignUp($phoneNumber: String!, $username: String!, $fullName: String!) {
    signUp(phoneNumber: $phoneNumber, username: $username, fullName: $fullName) {
      id
      phoneNumber
      username
      fullName
      displayName
      isArtist
    }
  }
`;

export const SIGN_IN_WITH_PHONE = gql`
  mutation SignInWithPhone($phoneNumber: String!, $otp: String!) {
    signInWithPhone(phoneNumber: $phoneNumber, otp: $otp) {
      id
      phoneNumber
      username
      fullName
      displayName
      isArtist
    }
  }
`;

export const INVITE_ARTIST = gql`
  mutation InviteArtist($artistId: ID!, $eventId: ID!) {
    inviteArtist(artistId: $artistId, eventId: $eventId) {
      id
      status
    }
  }
`;

export const START_CHAT = gql`
  mutation StartChat($receiverId: ID!) {
    startChat(receiverId: $receiverId) {
      id
      messages { content timestamp }
    }
  }
`;

export const REPORT_ARTIST = gql`
  mutation ReportArtist($artistId: ID!, $reason: String!) {
    reportArtist(artistId: $artistId, reason: $reason) {
      success
    }
  }
`;
export const APPLY_TO_EVENT = gql`
  mutation ApplyToEvent($eventId: ID!) {
    applyToEvent(eventId: $eventId) {
      id
      status
    }
  }
`;

export const SUBMIT_REVIEW = gql`
  mutation SubmitReview($eventId: ID!, $rating: Float!, $comment: String!) {
    submitReview(eventId: $eventId, rating: $rating, comment: $comment) {
      id
    }
  }
`;

export const UPDATE_INVITE = gql`
  mutation UpdateInviteStatus($inviteId: ID!, $status: String!) {
    updateInviteStatus(inviteId: $inviteId, status: $status) {
      id
      status
      updatedAt
      event {
        id
        title
      }
    }
  }
`;

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($email: String!) {
    verifyEmail(email: $email)
  }
`;

export const VERIFY_EMAIL_OTP = gql`
  mutation VerifyEmailOTP($email: String!, $otp: String!) {
    verifyEmailOTP(email: $email, otp: $otp)
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
      id
      fullName
      bio
      budget
      email
      categoryIDs
      subCategoryIDs
      youtubeId
      youtubeDisplay
      instagramUsername
      instagramDisplay
      facebookId
      facebookDisplay
      xUsername
      xDisplay
    }
  }
`;

export const LINK_SOCIAL_MEDIA = gql`
  mutation LinkSocialMedia($platform: String!, $authCode: String!) {
    linkSocialMedia(platform: $platform, authCode: $authCode) {
      platform
      identifier
    }
  }
`;

export const UNLINK_SOCIAL_MEDIA = gql`
  mutation UnlinkSocialMedia($platform: String!) {
    unlinkSocialMedia(platform: $platform)
  }
`;

export const UPDATE_BOOKING = gql`
  mutation UpdateBookingStatus($bookingId: ID!, $status: String!) {
    updateBookingStatus(bookingId: $bookingId, status: $status) {
      id
      status
      updatedAt
      event {
        id
        title
      }
    }
  }
`;

export const APPLY_AS_ARTIST = gql`
  mutation ApplyAsArtist($eventId: ID!) { 
    applyAsArtist(eventId: $eventId)
  }
`;

export const WITHDRAW_APPLICATION = gql`
  mutation WithdrawApplication($eventId: ID!) { 
    withdrawApplication(eventId: $eventId) 
  }
`;

export const ACCEPT_ARTIST = gql`
  mutation AcceptArtist($eventId: ID!, $artistId: ID!) {
    acceptArtist(eventId: $eventId, artistId: $artistId) {
      id
      status
      confirmedArtist {
        id
        fullName
      }
    }
  }
`;

export const REJECT_ARTIST = gql`
  mutation RejectArtist($eventId: ID!, $artistId: ID!) {
    rejectArtist(eventId: $eventId, artistId: $artistId) {
      id
      status
    }
  }
`;

export const TOGGLE_FAVORITE = gql`
  mutation ToggleFavoriteEvent($eventId: ID!) {
    toggleFavoriteEvent(eventId: $eventId)
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

export const DELETE_EVENT = gql`
  mutation DeleteEvent($eventId: ID!) {
    deleteEvent(eventId: $eventId)
  }
`;



export const CREATE_EVENT = gql`
  mutation CreateEvent(
    $title: String!, $type: String!, $categories: [String!]!, $subcategories: [String!]!,
    $date: String!, $time: String!, $location: LocationInput!, $description: String!,
    $budget: BudgetInput!
  ) {
    createEvent(
      title: $title, type: $type, categories: $categories, subcategories: $subcategories,
      date: $date, time: $time, location: $location, description: $description, budget: $budget
    ) { id title }
  }
`;

export const UPDATE_EVENT = gql`
  mutation UpdateEvent(
    $id: ID!, $title: String, $type: String, $categories: [String], $subcategories: [String],
    $date: String, $time: String, $location: LocationInput, $description: String,
    $budget: BudgetInput
  ) {
    updateEvent(
      id: $id, title: $title, type: $type, categories: $categories, subcategories: $subcategories,
      date: $date, time: $time, location: $location, description: $description, budget: $budget
    ) { id title }
  }
`;