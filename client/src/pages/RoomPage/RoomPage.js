import React from "react";

import GroupEditor from "../../components/groupEditor/groupEditor.component";
import {ReactComponent as Logo} from '../../assets/logo.svg'
const RoomPage = () => {
  return (
    <>
    <div className="logo_section" style={{marginTop:'2vh',marginLeft:'0.5vw'}}>
      <Logo style={{maxHeight:'8vh',maxWidth:'8vw'}} />
      </div>
    <div>
      <GroupEditor />
    </div>
    </>
  );

};


export default RoomPage;
