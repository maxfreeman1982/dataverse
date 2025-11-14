import { gql } from '@apollo/client';

export const CREATE_VIDEO_CALL = gql`
  mutation CreateVideoCall($input: CreateVideoCallInput!) {
    createVideoCall(input: $input) {
      id
      name
      status
      channelId
      startedById
      startedAt
      participants {
        id
        userId
        user {
          id
          username
          email
        }
        isAudioEnabled
        isVideoEnabled
        isScreenSharing
        joinedAt
        leftAt
      }
    }
  }
`;

export const JOIN_VIDEO_CALL = gql`
  mutation JoinVideoCall($input: JoinVideoCallInput!) {
    joinVideoCall(input: $input) {
      id
      userId
      isAudioEnabled
      isVideoEnabled
      isScreenSharing
      joinedAt
    }
  }
`;

export const LEAVE_VIDEO_CALL = gql`
  mutation LeaveVideoCall($callId: ID!) {
    leaveVideoCall(callId: $callId)
  }
`;

export const UPDATE_PARTICIPANT_STATUS = gql`
  mutation UpdateParticipantStatus($input: UpdateParticipantStatusInput!) {
    updateParticipantStatus(input: $input) {
      id
      isAudioEnabled
      isVideoEnabled
      isScreenSharing
    }
  }
`;

export const SEND_WEBRTC_SIGNAL = gql`
  mutation SendWebRTCSignal($input: WebRTCSignalInput!) {
    sendWebRTCSignal(input: $input)
  }
`;

export const END_VIDEO_CALL = gql`
  mutation EndVideoCall($callId: ID!) {
    endVideoCall(callId: $callId) {
      id
      status
      endedAt
    }
  }
`;

export const GET_VIDEO_CALL = gql`
  query VideoCall($id: ID!) {
    videoCall(id: $id) {
      id
      name
      status
      channelId
      channel {
        id
        name
      }
      startedById
      startedBy {
        id
        username
        email
      }
      participants {
        id
        userId
        user {
          id
          username
          email
        }
        isAudioEnabled
        isVideoEnabled
        isScreenSharing
        joinedAt
        leftAt
      }
      startedAt
      endedAt
    }
  }
`;

export const GET_VIDEO_CALLS = gql`
  query VideoCalls {
    videoCalls {
      id
      name
      status
      startedById
      startedBy {
        id
        username
      }
      participants {
        id
        userId
      }
      startedAt
      endedAt
    }
  }
`;
