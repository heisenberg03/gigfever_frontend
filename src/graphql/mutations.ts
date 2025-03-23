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

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
      id
      bio
      budget
      category
      subcategories
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