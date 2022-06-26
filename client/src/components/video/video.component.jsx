import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import { BsCameraVideoFill, BsCameraVideoOffFill } from "react-icons/bs";
import { AiFillAudio, AiOutlineAudioMuted } from "react-icons/ai";
import {MdCallEnd} from 'react-icons/md'
import "./video.styles.css";

const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};

const OtherVideo = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, []);

  return <video playsInline autoPlay ref={ref} className="peer-video-styles" />;
};

const Video = ({ id }) => {
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const roomID = id;

  useEffect(() => {
    socketRef.current = io.connect("http://localhost:5000");
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        socketRef.current.emit("join room", roomID);
        socketRef.current.on("all users", (users) => {
          const peers = [];
          users.forEach((userID) => {
            const peer = createPeer(userID, socketRef.current.id, stream);
            peersRef.current.push({
              peerID: userID,
              peer,
            });
            peers.push({
              peerID: userID,
              peer,
            });
          });
          setPeers(peers);
        });

        socketRef.current.on("user joined", (payload) => {
          const peer = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });
          const peerObj = {
            peer,
            peerID: payload.callerID,
          };

          setPeers((users) => [...users, peerObj]);
        });

        socketRef.current.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });

        socketRef.current.on("user left", (id) => {
          const peerObj = peersRef.current.find((p) => p.peerID === id);
          if (peerObj) {
            peerObj.peer.destroy();
          }
          const peers = peersRef.current.filter((p) => p.peerID !== id);
          peersRef.current = peers;
          setPeers(peers);
        });
      });
  }, []);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  const handleHide = (mode) => {
    var track;
    if (mode === "video") {
      track = userVideo.current.srcObject
        .getTracks()
        .find((track) => track.kind === "video");
      setVideoOn(!videoOn);
    }
    if (mode === "audio") {
      track = userVideo.current.srcObject
        .getTracks()
        .find((track) => track.kind === "audio");
      setAudioOn(!audioOn);
    }

    console.log(userVideo.current.srcObject.getTracks());
    if (track.enabled) {
      track.enabled = false;
    } else track.enabled = true;
  };

  return (
    <div className="video-items-container">
      <video
        muted
        ref={userVideo}
        autoPlay
        playsInline
        className="video-styles"
      />
      {peers.map((peer) => {
        return <OtherVideo key={peer.peerID} peer={peer.peer} />;
      })}
      <div>
        <button
          className="video-buttons"
          onClick={() => handleHide("video")}
        >
          {videoOn ? <BsCameraVideoFill /> : <BsCameraVideoOffFill />}
        </button>
        <button
          className="video-buttons"
          onClick={() => handleHide("audio")}
        >
          {audioOn ? <AiFillAudio /> : <AiOutlineAudioMuted/>}
        </button>
        <button className="video-buttons"><MdCallEnd /></button>
      </div>
    </div>
  );
};

export default Video;
