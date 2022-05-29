import React, { useState, useRef, useEffect } from "react";
import { Editor } from "slate-react";
import { initialValue } from "./editor.js";
import io from "socket.io-client";
import { Value } from "slate";

const socket = io("http://localhost:5000");

const SlateEditor = ({groupId}) => {
  const [value, setValue] = useState(initialValue);
  const id = useRef(`${Date.now()}`);
  const editor = useRef(null);
  const remote = useRef(false);

  useEffect(() => {
    fetch(`http://localhost:5000/groups/${groupId}`).then(x =>
      x.json().then(data => {
        setValue(Value.fromJSON(data));
      })
    );
    const eventName = `new-remote-operations-${groupId}`;
    socket.on(
      eventName,
      ( {editorId, ops }) => {
        if (id.current !== editorId) {
          remote.current = true;
          ops.forEach((op) => editor.current.applyOperation(op));
          remote.current = false;
        }
      }
    );

    return () => {
      socket.off(eventName);
    };
  }, [groupId]);

  return (
    <Editor
      ref={editor}
      style={{
        backgroundColor: "#fafafa",
        maxWidth: 800,
        minHeight: 150,
      }}
      value={value}
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
            groupId
          });
        }
      }}
    />
  );
};

export default SlateEditor;
