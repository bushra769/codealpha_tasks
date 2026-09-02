import { useEffect, useRef, useState } from "react";

function VideoCall({ roomId, socket }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);

  useEffect(() => {
    if (!roomId || !socket) return;

    const createPeerConnection = () => {
      const peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      });

      peerConnectionRef.current = peer;

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          peer.addTrack(track, localStreamRef.current);
        });
      }

      peer.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            roomId,
            candidate: event.candidate,
          });
        }
      };

      return peer;
    };

    const createOffer = async () => {
      const peer = createPeerConnection();

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("offer", {
        roomId,
        offer,
      });
    };

    const createAnswer = async (offer) => {
      const peer = createPeerConnection();

      await peer.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("answer", {
        roomId,
        answer,
      });
    };

    const handleUserJoined = async () => {
      await createOffer();
    };

    const handleOffer = async ({ offer }) => {
      await createAnswer(offer);
    };

    const handleAnswer = async ({ answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      if (peerConnectionRef.current && candidate) {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setCameraOn(true);

        socket.emit("join-room", roomId);
      } catch (error) {
        console.error("Camera error:", error);
        alert("Camera aur microphone ki permission allow karo.");
      }
    };

    socket.on("user-joined", handleUserJoined);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);

    startCamera();

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [roomId, socket]);

  return (
    <div className="video-call">
      <button
  onClick={() => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];

    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
    }
  }}
>
  {micOn ? "🎤 Microphone On" : "🔇 Microphone Off"}
</button>
<button
  onClick={() => {
    const videoTrack =
      localStreamRef.current?.getVideoTracks()[0];

    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraOn(videoTrack.enabled);
    }
  }}
>
  {cameraOn ? "📹 Camera On" : "📷 Camera Off"}
</button>
<button
  onClick={async () => {
    try {
      if (!screenSharing) {
        const screenStream =
          await navigator.mediaDevices.getDisplayMedia({
            video: true,
          });

        const screenTrack = screenStream.getVideoTracks()[0];

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          setScreenSharing(false);

          if (localStreamRef.current && localVideoRef.current) {
            localVideoRef.current.srcObject =
              localStreamRef.current;
          }
        };

        setScreenSharing(true);
      }
    } catch (error) {
      console.error("Screen sharing error:", error);
    }
  }}
>
  {screenSharing ? "🖥️ Stop Sharing" : "🖥️ Share Screen"}
</button>
      <div className="video-grid">
        <div className="video-container">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
          />

          <span>You</span>

          {!cameraOn && <p>Camera is off</p>}
        </div>

        <div className="video-container">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
          />

          <span>Remote User</span>
        </div>
      </div>
    </div>
  );
}

export default VideoCall;