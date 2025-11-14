'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import { SEND_WEBRTC_SIGNAL } from '@/graphql/video';
import { useWebSocket } from './use-websocket';

interface Peer {
  userId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

interface UseWebRTCOptions {
  callId: string;
  currentUserId: string;
  localStream: MediaStream | null;
  onRemoteStream: (userId: string, stream: MediaStream) => void;
  onRemoteStreamEnded: (userId: string) => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useWebRTC({
  callId,
  currentUserId,
  localStream,
  onRemoteStream,
  onRemoteStreamEnded,
}: UseWebRTCOptions) {
  const [peers, setPeers] = useState<Map<string, Peer>>(new Map());
  const peersRef = useRef<Map<string, Peer>>(new Map());
  const [sendSignal] = useMutation(SEND_WEBRTC_SIGNAL);

  // Keep ref in sync
  useEffect(() => {
    peersRef.current = peers;
  }, [peers]);

  // Create peer connection for a user
  const createPeerConnection = (userId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          variables: {
            input: {
              callId,
              targetUserId: userId,
              type: 'ice-candidate',
              data: JSON.stringify(event.candidate),
            },
          },
        });
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        onRemoteStream(userId, event.streams[0]);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        onRemoteStreamEnded(userId);
        removePeer(userId);
      }
    };

    return pc;
  };

  // Add or get peer
  const getOrCreatePeer = (userId: string): Peer => {
    let peer = peersRef.current.get(userId);
    if (!peer) {
      const connection = createPeerConnection(userId);
      peer = { userId, connection };
      setPeers(new Map(peersRef.current.set(userId, peer)));
    }
    return peer;
  };

  // Remove peer
  const removePeer = (userId: string) => {
    const peer = peersRef.current.get(userId);
    if (peer) {
      peer.connection.close();
      peersRef.current.delete(userId);
      setPeers(new Map(peersRef.current));
    }
  };

  // Create offer for a new participant
  const createOffer = async (userId: string) => {
    const peer = getOrCreatePeer(userId);
    const offer = await peer.connection.createOffer();
    await peer.connection.setLocalDescription(offer);

    await sendSignal({
      variables: {
        input: {
          callId,
          targetUserId: userId,
          type: 'offer',
          data: JSON.stringify(offer),
        },
      },
    });
  };

  // Handle WebRTC signals
  const handleSignal = async (signal: {
    fromUserId: string;
    type: string;
    data: any;
  }) => {
    const { fromUserId, type, data } = signal;

    // Don't process signals from self
    if (fromUserId === currentUserId) return;

    const peer = getOrCreatePeer(fromUserId);

    try {
      if (type === 'offer') {
        await peer.connection.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await peer.connection.createAnswer();
        await peer.connection.setLocalDescription(answer);

        await sendSignal({
          variables: {
            input: {
              callId,
              targetUserId: fromUserId,
              type: 'answer',
              data: JSON.stringify(answer),
            },
          },
        });
      } else if (type === 'answer') {
        await peer.connection.setRemoteDescription(new RTCSessionDescription(data));
      } else if (type === 'ice-candidate') {
        await peer.connection.addIceCandidate(new RTCIceCandidate(data));
      }
    } catch (error) {
      console.error('Error handling WebRTC signal:', error);
    }
  };

  // Listen for WebRTC signals via WebSocket
  const socket = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('webrtc:signal', handleSignal);

    return () => {
      socket.off('webrtc:signal', handleSignal);
    };
  }, [socket, callId, currentUserId]);

  // Update local stream tracks when it changes
  useEffect(() => {
    if (!localStream) return;

    peersRef.current.forEach((peer) => {
      const senders = peer.connection.getSenders();
      const tracks = localStream.getTracks();

      // Replace or add tracks
      tracks.forEach((track) => {
        const sender = senders.find((s) => s.track?.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track);
        } else {
          peer.connection.addTrack(track, localStream);
        }
      });
    });
  }, [localStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      peersRef.current.forEach((peer) => {
        peer.connection.close();
      });
      peersRef.current.clear();
    };
  }, []);

  return {
    createOffer,
    handleSignal,
    removePeer,
  };
}
