'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_VIDEO_CALL,
  JOIN_VIDEO_CALL,
  LEAVE_VIDEO_CALL,
  UPDATE_PARTICIPANT_STATUS,
} from '@/graphql/video';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MonitorUp,
  Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useWebRTC } from '@/hooks/use-webrtc';
import { useWebSocket } from '@/hooks/use-websocket';

interface RemoteStream {
  userId: string;
  username: string;
  stream: MediaStream;
}

export default function VideoCallPage() {
  const params = useParams();
  const router = useRouter();
  const callId = params.callId as string;
  const { user } = useAuth();
  const socket = useWebSocket();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);

  const { data, refetch } = useQuery(GET_VIDEO_CALL, {
    variables: { id: callId },
    skip: !callId,
  });

  const [joinCall] = useMutation(JOIN_VIDEO_CALL);
  const [leaveCall] = useMutation(LEAVE_VIDEO_CALL);
  const [updateStatus] = useMutation(UPDATE_PARTICIPANT_STATUS);

  const call = data?.videoCall;
  const activeParticipants = call?.participants?.filter((p: any) => !p.leftAt) || [];

  // Handle remote stream callbacks
  const handleRemoteStream = (userId: string, stream: MediaStream) => {
    const participant = activeParticipants.find((p: any) => p.userId === userId);
    setRemoteStreams((prev) => {
      const existing = prev.find((s) => s.userId === userId);
      if (existing) {
        return prev.map((s) =>
          s.userId === userId
            ? { ...s, stream, username: participant?.user?.username }
            : s
        );
      }
      return [
        ...prev,
        { userId, stream, username: participant?.user?.username || 'Unknown' },
      ];
    });
  };

  const handleRemoteStreamEnded = (userId: string) => {
    setRemoteStreams((prev) => prev.filter((s) => s.userId !== userId));
  };

  // WebRTC hook
  const { createOffer, removePeer } = useWebRTC({
    callId,
    currentUserId: user?.id || '',
    localStream,
    onRemoteStream: handleRemoteStream,
    onRemoteStreamEnded: handleRemoteStreamEnded,
  });

  // Initialize media stream
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Join the call
        if (user?.id) {
          await joinCall({ variables: { input: { callId } } });
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Could not access camera/microphone. Please check permissions.');
      }
    };

    initMedia();

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, [callId, user?.id]);

  // Listen for participant events
  useEffect(() => {
    if (!socket) return;

    const handleParticipantJoined = (data: any) => {
      if (data.callId === callId && data.participant.userId !== user?.id) {
        refetch();
        // Create offer to new participant
        createOffer(data.participant.userId);
      }
    };

    const handleParticipantLeft = (data: any) => {
      if (data.callId === callId) {
        refetch();
        removePeer(data.userId);
        handleRemoteStreamEnded(data.userId);
      }
    };

    const handleCallEnded = (data: any) => {
      if (data.callId === callId) {
        router.push('/dashboard/chat');
      }
    };

    socket.on('call:participant-joined', handleParticipantJoined);
    socket.on('call:participant-left', handleParticipantLeft);
    socket.on('call:ended', handleCallEnded);

    return () => {
      socket.off('call:participant-joined', handleParticipantJoined);
      socket.off('call:participant-left', handleParticipantLeft);
      socket.off('call:ended', handleCallEnded);
    };
  }, [socket, callId, user?.id]);

  // Create offers to existing participants when we join
  useEffect(() => {
    if (activeParticipants.length > 0 && localStream && user?.id) {
      activeParticipants.forEach((participant: any) => {
        if (participant.userId !== user.id) {
          createOffer(participant.userId);
        }
      });
    }
  }, [activeParticipants.length, localStream, user?.id]);

  // Toggle audio
  const toggleAudio = async () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);

      await updateStatus({
        variables: {
          input: { callId, isAudioEnabled: audioTrack.enabled },
        },
      });
    }
  };

  // Toggle video
  const toggleVideo = async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);

      await updateStatus({
        variables: {
          input: { callId, isVideoEnabled: videoTrack.enabled },
        },
      });
    }
  };

  // Toggle screen share
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const screenTrack = screenStream.getVideoTracks()[0];

        // Replace video track with screen track
        if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          localStream.removeTrack(videoTrack);
          localStream.addTrack(screenTrack);
          videoTrack.stop();

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }

          setIsScreenSharing(true);

          // When screen share ends
          screenTrack.onended = async () => {
            const cameraStream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
            const cameraTrack = cameraStream.getVideoTracks()[0];
            localStream.removeTrack(screenTrack);
            localStream.addTrack(cameraTrack);

            if (localVideoRef.current) {
              localVideoRef.current.srcObject = localStream;
            }

            setIsScreenSharing(false);
            await updateStatus({
              variables: { input: { callId, isScreenSharing: false } },
            });
          };

          await updateStatus({
            variables: { input: { callId, isScreenSharing: true } },
          });
        }
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  // Leave call
  const handleLeaveCall = async () => {
    localStream?.getTracks().forEach((track) => track.stop());
    await leaveCall({ variables: { callId } });
    router.push('/dashboard/chat');
  };

  if (!call) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading call...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-800 p-4">
        <div>
          <h1 className="text-xl font-bold text-white">{call.name}</h1>
          <p className="text-sm text-gray-400">
            {activeParticipants.length} participant{activeParticipants.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-400" />
          <span className="text-white">{activeParticipants.length}</span>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div
          className={`grid gap-4 ${
            remoteStreams.length === 0
              ? 'grid-cols-1'
              : remoteStreams.length <= 2
              ? 'grid-cols-2'
              : remoteStreams.length <= 4
              ? 'grid-cols-2'
              : 'grid-cols-3'
          }`}
        >
          {/* Local video */}
          <Card className="relative aspect-video overflow-hidden bg-gray-800">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-sm text-white">
              You {isScreenSharing && '(Screen)'}
            </div>
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                <VideoOff className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </Card>

          {/* Remote videos */}
          {remoteStreams.map((remote) => (
            <RemoteVideo key={remote.userId} remote={remote} />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 bg-gray-800 p-4">
        <Button
          variant={isAudioEnabled ? 'secondary' : 'destructive'}
          size="lg"
          onClick={toggleAudio}
          className="rounded-full"
        >
          {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>

        <Button
          variant={isVideoEnabled ? 'secondary' : 'destructive'}
          size="lg"
          onClick={toggleVideo}
          className="rounded-full"
        >
          {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </Button>

        <Button
          variant={isScreenSharing ? 'default' : 'secondary'}
          size="lg"
          onClick={toggleScreenShare}
          className="rounded-full"
        >
          <MonitorUp className="h-6 w-6" />
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={handleLeaveCall}
          className="rounded-full"
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

function RemoteVideo({ remote }: { remote: RemoteStream }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && remote.stream) {
      videoRef.current.srcObject = remote.stream;
    }
  }, [remote.stream]);

  return (
    <Card className="relative aspect-video overflow-hidden bg-gray-800">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover"
      />
      <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-sm text-white">
        {remote.username}
      </div>
    </Card>
  );
}
