import React, { useState, useRef, useEffect } from "react";
import { Editor } from "slate-react";
import { initialValue } from "./editor.js";
import io from "socket.io-client";
import { Value } from "slate";


const socket = io("http://localhost:5000");



const SlateEditor = ({ groupId }) => {
  const [value, setValue] = useState(initialValue);
  const id = useRef(`${Date.now()}`);
  const editor = useRef(null);
  const remote = useRef(false);
  
  

  useEffect(() => {
    fetch(`http://localhost:5000/groups/${groupId}`).then((x) =>
      x.json().then((data) => {
        setValue(Value.fromJSON(data));
      })
    );
    const eventName = `new-remote-operations-${groupId}`;
    socket.on(eventName, ({ editorId, ops }) => {
      if (id.current !== editorId) {
        remote.current = true;
        ops.forEach((op) => editor.current.applyOperation(op));
        remote.current = false;
      }
    });


    

    return () => {
      socket.off(eventName);
    };
  }, [groupId]);

  return (
    <>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          
          editor.current.toggleMark("bold");
        }}
      >
        bold
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          
          editor.current.toggleMark("italic");
        }}
      >
        italic
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          
          editor.current.toggleMark("underline");
        }}
      >
        underline
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          
          editor.current.toggleMark("heading");
        }}
      >
        heading
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          
          editor.current.toggleMark("subheading");
        }}
      >
        subheading
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          
          editor.current.toggleMark("bulletlist");
        }}
      >
        bulletlist
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
         
          editor.current.toggleMark("numberedlist");
        }}
      >
        numberedlist(not working)
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
         
          editor.current.toggleMark("blockquote");
        }}
      >
        blockquotes
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
         
          editor.current.toggleMark("code");
        }}
      >
        code
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          
          editor.current.toggleMark("leftalign");
        }}
      >
        leftalign(not working)
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          
          editor.current.toggleMark("centeralign");
        }}
      >
        centeralign(not working)
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          
          editor.current.toggleMark("rightalign");
        }}
      >
        rightalign(not working)
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          
          editor.current.toggleMark("justify");
        }}
      >
        justify(not working)
      </button>
      <Editor
        ref={editor}
        style={{
          backgroundColor: "#fafafa",
          maxWidth: 800,
          minHeight: 150,
        }}
        value={value}
        renderMark={(props, _editor, next) => {
          if (props.mark.type === "bold") {
            return <strong>{props.children}</strong>;
          } else if (props.mark.type === "italic") {
            return <em>{props.children}</em>;
          } else if (props.mark.type === "underline"){
            return <u>{props.children}</u>
          } else if (props.mark.type === "subheading"){
            return <h5>{props.children}</h5>
          } else if (props.mark.type === "heading"){
            return <h1>{props.children}</h1>
          } else if (props.mark.type === "bulletlist"){
            return <ul><li>{props.children}</li></ul>
          } else if (props.mark.type === "numberedlist"){
            return <ol>{props.children}</ol>
          } else if (props.mark.type === "code"){
            return <div style={{backgroundColor:'#aaa',margin:'1vw',padding:'0.5vw',borderRadius:'10px'}}>{props.children}</div>
          } else if (props.mark.type === "blockquote"){
            return <div style={{color:'#aaa',margin:'1vw',padding:'0.5vw', borderLeft:'2px solid #aaa',borderRadius:'2px'}}>{props.children}</div>
          } else if (props.mark.type === "leftalign"){
            return <p align="left">{props.children}</p>
          } else if (props.mark.type === "centeralign"){
            return <p align="center">{props.children}</p>
          } else if (props.mark.type === "rightalign"){
            return <p align="right">{props.children}</p>
          } else if (props.mark.type === "justify"){
            return <p align="justify">{props.children}</p>
          }

          return next();
        }}
        onChange={(opts) => {
          setValue(opts.value);

          const ops = opts.operations
            .filter((o) => {
              if (o) {
                return (
                  o.type !== "set_selection" &&
                  o.type !== "set_value" &&
                  (!o.data || !o.data.has("source"))
                );
              }

              return false;
            })
            .toJS()
            .map((o) => ({ ...o, data: { source: "one" } }));

          if (ops.length && !remote.current) {
            socket.emit("new-operations", {
              editorId: id.current,
              ops,
              value: opts.value.toJSON(),
              groupId,
            });
          }
        }}
      />
    </>
  );
};

export default SlateEditor;
