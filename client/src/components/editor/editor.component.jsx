import { useState, useRef, useEffect, useMemo } from "react";
import { createEditor } from "slate";
import Mitt from "mitt";
import { Slate, Editable, withReact } from "slate-react";
import { initialValue } from "./editor";

import { Operation } from "slate";

const emitter = new Mitt();

const Editor = () => {
  const editor = useMemo(() => withReact(createEditor()), [])
  const id = useRef(`${Date.now()}`);
  const [value, setValue] = useState(initialValue);
  const remote = useRef(false);

  useEffect(() => {
    emitter.on("*", (type, ops) => {
      if (id.current !== type) {
        console.log("In other editor")
        remote.current = true;
        ops.forEach((op) => {
          if(editor.current){
            editor.current.applyOperation(op)
          }});
        remote.current = false;
      }
    });
  }, []);

  return (
    //  slate is like a  wrapper for all the editable components that slatejs provides us
    <Slate editor={editor} value={value}>
      {/* editable is similar to textarea or input but also has various other rich components  */}
      <Editable
        style={{
          backgroundColor: "#fafafa",
          maxWidth: 800,
          minHeight: 150,
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
            emitter.emit(id.current, ops);
          }
        }}
      />
    </Slate>
  );
};

export default Editor;
