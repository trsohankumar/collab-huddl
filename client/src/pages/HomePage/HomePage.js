import { React, useState } from "react";

import { v4 as uuidv4 } from "uuid";
import './HomePage.css'

import { useHistory } from "react-router-dom";
import {ReactComponent as Logo} from '../../assets/logo.svg'

const HomePage = () => {
  const history = useHistory();
  const [idToCall, setIdToCall] = useState("");
  

  const handleCreateRoom = () => {
    const currentRoomId = uuidv4();
    history.push(`/room/${currentRoomId}`);
  };
  
 const handleJoinRoom = () =>{
    history.push(`room/${idToCall}`)
  }

  return (
    <>
      <div className="logo_section" style={{marginTop:'2vh',marginLeft:'2vw'}}>
      <Logo style={{maxHeight:'8vh',maxWidth:'8vw'}} />
      </div>
      <div className="branding_section">Brainstorming made convenient</div>
      <div className="branding_info">Meet Huddl, the modern Collab tool<br/> Write like a doc, collab and discuss realtime</div>
      <div className="room_section">
      <button onClick={handleCreateRoom} style={{marginRight:'1vw'}} className="gradient-buttons">Create Room</button>
        <input
          type="text"
          value={idToCall}
          placeholder="Enter Room Code"
          className="input"
          onChange={(e) => {
            setIdToCall(e.target.value);
          }}
        />
        <button onClick={handleJoinRoom} className="gradient-buttons">Join Room</button>
      </div>
    </>
  );
};

export default HomePage;
