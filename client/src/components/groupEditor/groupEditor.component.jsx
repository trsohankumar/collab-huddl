import React from "react";
import { useParams } from "react-router-dom";

import SlateEditor from "../editor/editor.component";
import Video from "../video/video.component";

import "./groupEditor.styles.css";

const GroupEditor = () => {
  const { id } = useParams();

  return (
    <div className="group-editor-container">
      <div>
        <SlateEditor groupId={id} />
      </div>
      <div>
        <Video id={id} />
      </div>
    </div>
  );
};

export default GroupEditor;
