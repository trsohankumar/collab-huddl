import { React, useState } from "react";

import { v4 as uuidv4 } from "uuid";

import { useHistory } from "react-router-dom";

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
      <div>HUDDL</div>
      <div>
        <button onClick={handleCreateRoom}>Create Room</button>
        <input
          type="text"
          value={idToCall}
          placeholder="ENTER ROOM CODE"
          onChange={(e) => {
            setIdToCall(e.target.value);
          }}
        />
        <button onClick={handleJoinRoom}>Join Room</button>
      </div>
    </>
  );
};

export default HomePage;
