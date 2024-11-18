import React from "react";
import { Editor, EditorState, CompositeDecorator } from "draft-js";

const TagInput = () => {
  const findTag = (contentBlock, callback, contentState) => {
    const text = contentBlock.getText();
    const regex = /{(.*?)}/g;
    let matchArr;
    while ((matchArr = regex.exec(text)) !== null) {
      callback(matchArr.index, matchArr.index + matchArr[0].length);
    }
  };

  const TagSpan = (props) => {
    return (
      <span style={{ backgroundColor: "#e0f7fa", color: "#004d40" }}>
        {props.children}
      </span>
    );
  };

  const decorator = new CompositeDecorator([
    {
      strategy: findTag,
      component: TagSpan,
    },
  ]);

  const [editorState, setEditorState] = React.useState(
    EditorState.createEmpty(decorator)
  );

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px" }}>
      <Editor
        editorState={editorState}
        onChange={setEditorState}
        placeholder="Type here..."
      />
    </div>
  );
};

export default TagInput;
