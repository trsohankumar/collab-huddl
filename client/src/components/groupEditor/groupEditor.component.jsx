import React from 'react'
import { useParams } from 'react-router-dom';
import SlateEditor from '../editor/editor.component';

const GroupEditor = () => {
    const {id}= useParams()
  return (
    <div>
    <SlateEditor groupId={id}/>
    </div>
  )
}

export default GroupEditor;