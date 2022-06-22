import React, { useState, useRef, useEffect } from "react";
import { Editor } from "slate-react";
import { initialValue } from "./editor.js";
import io from "socket.io-client";
import { Value } from "slate";

import { saveDoc, updateDoc, getDoc, deleteDoc } from "../../api/index";

const socket = io("http://localhost:5000");

const SlateEditor = ({ groupId }) => {
  const [value, setValue] = useState(initialValue);
  const [ docToFetch, setDocToFetch ] = useState('');
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

  const saveData = async () => {
    await saveDoc(groupId);
  };

  const deleteData = async () => {
    await deleteDoc(groupId);
    fetch(`http://localhost:5000/groups/${groupId}`).then((x) =>
      x.json().then((data) => {
        setValue(Value.fromJSON(data));
      })
    );
  };

  const fetchData = async () => {
    const doc = await getDoc(docToFetch,groupId);
    setValue(Value.fromJSON(doc.data))
  };

  return (
    <>
      <button
        onMouseDown={(e) => {
          e.preventDefault();

          editor.current.toggleMark("bold");
        }}
        className="buttonBlock buttonInline"
      >
        bold
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();

          editor.current.toggleMark("italic");
        }}
        className="buttonBlock buttonInline"
      >
        italic
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();

          editor.current.toggleMark("underline");
        }}
        className="buttonBlock buttonInline"
      >
        underline
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();

          editor.current.toggleMark("heading");
        }}
        className="buttonBlock buttonInline"
      >
        heading
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();

          editor.current.toggleMark("subheading");
        }}
        className="buttonBlock buttonInline"
      >
        subheading
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();

          editor.current.toggleMark("bulletlist");
        }}
        className="buttonBlock buttonInline"
      >
        bulletlist
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();

          editor.current.toggleMark("numberedlist");
        }}
        className="buttonBlock buttonInline"
      >
        numberedlist(not working)
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();

          editor.current.toggleMark("blockquote");
        }}
        className="buttonBlock buttonInline"
      >
        blockquotes
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();

          editor.current.toggleMark("code");
        }}
        className="buttonBlock buttonInline"
      >
        code
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();

          editor.current.toggleMark("leftalign");
        }}
        className="buttonBlock buttonInline"
      >
        leftalign
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();

          editor.current.toggleMark("centeralign");
        }}
        className="buttonBlock buttonInline"
      >
        centeralign
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();

          editor.current.toggleMark("rightalign");
        }}
        className="buttonBlock buttonInline"
      >
        rightalign
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();

          editor.current.toggleMark("justify");
        }}
        className="buttonBlock buttonInline"
      >
        justify
      </button>
      <Editor
        ref={editor}
        className="buttonBlock buttonInline"
        style={{
          backgroundColor: "#fafafa",
          minWidth: 800,
          minHeight: 300,
        }}
        value={value}
        renderMark={(props, _editor, next) => {
          if (props.mark.type === "bold") {
            return <strong>{props.children}</strong>;
          } else if (props.mark.type === "italic") {
            return <em>{props.children}</em>;
          } else if (props.mark.type === "underline") {
            return <u>{props.children}</u>;
          } else if (props.mark.type === "subheading") {
            return <h5>{props.children}</h5>;
          } else if (props.mark.type === "heading") {
            return <h1>{props.children}</h1>;
          } else if (props.mark.type === "bulletlist") {
            return (
              <ul>
                <li>{props.children}</li>
              </ul>
            );
          } else if (props.mark.type === "numberedlist") {
            return <ol>{props.children}</ol>;
          } else if (props.mark.type === "code") {
            return (
              <div
                style={{
                  backgroundColor: "#aaa",
                  margin: "1vw",
                  padding: "0.5vw",
                  borderRadius: "10px",
                }}
              >
                {props.children}
              </div>
            );
          } else if (props.mark.type === "blockquote") {
            return (
              <div
                style={{
                  color: "#aaa",
                  margin: "1vw",
                  padding: "0.5vw",
                  borderLeft: "2px solid #aaa",
                  borderRadius: "2px",
                }}
              >
                {props.children}
              </div>
            );
          } else if (props.mark.type === "leftalign") {
            return <p style={{"textAlign":"center","textJustify":"inter-word"}}>{props.children}</p>;
          } else if (props.mark.type === "centeralign") {
            return <p style={{"textAlign":"center","textJustify":"inter-word"}}>{props.children}</p>;
          } else if (props.mark.type === "rightalign") {
            return <p style={{"textAlign":"right","textJustify":"inter-word"}}>{props.children}</p>;
          } else if (props.mark.type === "justify") {
            return <p style={{"textAlign":"justify","textJustify":"inter-word"}}>{props.children}</p>;
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
      <button onClick={saveData}>Save Data</button>
      <input
              type="text"
              value={docToFetch}
              placeholder='ENTER DOC ID'
              onChange={
              (e) => {setDocToFetch(e.target.value)}
              }
          />
      <button onClick={fetchData}>Fetch</button>
      <button onClick={deleteData}>Delete</button>
    </>
  );
};

export default SlateEditor;
