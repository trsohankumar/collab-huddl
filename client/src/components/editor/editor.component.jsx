import React, { useState, useRef, useEffect } from "react";
import { Editor } from "slate-react";

import io from "socket.io-client";
import { Value } from "slate";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { saveDoc, getDoc, deleteDoc } from "../../api/index";
import { initialValue } from "./editor.js";

import "./editor.styles.css";

const socket = io("http://localhost:5000");

const SlateEditor = ({ groupId }) => {
  const [value, setValue] = useState(initialValue);
  const [docToFetch, setDocToFetch] = useState("");
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
    const doc = await getDoc(docToFetch, groupId);
    setValue(Value.fromJSON(doc.data));
  };

  return (
    <div className="editor-container">
      <div>
        <button
          onMouseDown={(e) => {
            e.preventDefault();

            editor.current.toggleMark("bold");
          }}
          className="buttonBlock buttonInline"
        >
          Bold
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();

            editor.current.toggleMark("italic");
          }}
          className="buttonBlock buttonInline"
        >
          Italic
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();

            editor.current.toggleMark("underline");
          }}
          className="buttonBlock buttonInline"
        >
          Underline
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();

            editor.current.toggleMark("heading");
          }}
          className="buttonBlock buttonInline"
        >
          Heading
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();

            editor.current.toggleMark("subheading");
          }}
          className="buttonBlock buttonInline"
        >
          Subheading
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();

            editor.current.toggleMark("bulletlist");
          }}
          className="buttonBlock buttonInline"
        >
          Bulletlist
        </button>

        <button
          onMouseDown={(e) => {
            e.preventDefault();

            editor.current.toggleMark("blockquote");
          }}
          className="buttonBlock buttonInline"
        >
          Blockquotes
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();

            editor.current.toggleMark("code");
          }}
          className="buttonBlock buttonInline"
        >
          Code
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();

            editor.current.toggleMark("leftalign");
          }}
          className="buttonBlock buttonInline"
        >
          Left
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();

            editor.current.toggleMark("centeralign");
          }}
          className="buttonBlock buttonInline"
        >
          Center
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();

            editor.current.toggleMark("rightalign");
          }}
          className="buttonBlock buttonInline"
        >
          Right
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();

            editor.current.toggleMark("justify");
          }}
          className="buttonBlock buttonInline"
        >
          Justify
        </button>
      </div>
      <div>
        <Editor
          ref={editor}
          className="buttonBlock buttonInline editor"
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
              return (
                <p style={{ textAlign: "center", textJustify: "inter-word" }}>
                  {props.children}
                </p>
              );
            } else if (props.mark.type === "centeralign") {
              return (
                <p style={{ textAlign: "center", textJustify: "inter-word" }}>
                  {props.children}
                </p>
              );
            } else if (props.mark.type === "rightalign") {
              return (
                <p style={{ textAlign: "right", textJustify: "inter-word" }}>
                  {props.children}
                </p>
              );
            } else if (props.mark.type === "justify") {
              return (
                <p style={{ textAlign: "justify", textJustify: "inter-word" }}>
                  {props.children}
                </p>
              );
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
      </div>
      <div className="editor-buttons-container">
        <button className="editor-buttons" onClick={saveData}>
          Save
        </button>
        <input
          type="text"
          className="input"
          value={docToFetch}
          placeholder="ENTER DOC ID"
          onChange={(e) => {
            setDocToFetch(e.target.value);
          }}
        />
        <button className="editor-buttons" onClick={fetchData}>
          Fetch
        </button>
        <button className="editor-buttons" onClick={deleteData}>
          Delete
        </button>
        <CopyToClipboard text={groupId}>
          <button className="editor-buttons">Copy ID</button>
        </CopyToClipboard>
      </div>
    </div>
  );
};

export default SlateEditor;
