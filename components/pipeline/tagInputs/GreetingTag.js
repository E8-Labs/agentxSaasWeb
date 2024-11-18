import React from "react";
import { Editor, EditorState, CompositeDecorator } from "draft-js";

const TagInput = ({handleGreetingTag}) => {
    const [warning, setWarning] = React.useState(null); // Warning message
    const [fullText, setFullText] = React.useState(""); // Full text entered by the user

    const findTag = (contentBlock, callback, contentState) => {
        const text = contentBlock.getText();
        const regex = /{(.*?)}/g; // Match everything within {}
        let matchArr;
        while ((matchArr = regex.exec(text)) !== null) {
            const tagContent = matchArr[1].trim(); // Extract content inside {}
            // Validate content inside {}
            if (!["name", "email", "phone"].includes(tagContent)) {
                setWarning(`Invalid tag: "${tagContent}". Only "name", "email", or "phone" are allowed.`);
            } else {
                setWarning(null);
            }

            // Highlight the tag in the editor
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

    const handleEditorChange = (state) => {
        setEditorState(state);

        // Get the full text from the editor
        const content = state.getCurrentContent();
        const fullText = content.getPlainText(); // Extract plain text
        setFullText(fullText);
        handleGreetingTag(fullText);
    };

    return (
        <div style={{ padding: "10px" }}>
            {warning && <div style={{ color: "red", marginBottom: "10px" }}>{warning}</div>}
            <div style={{ border: "1px solid #ccc", padding: "10px" }}>
                <Editor
                    editorState={editorState}
                    onChange={handleEditorChange}
                    placeholder="Type here..."
                />
            </div>
        </div>
    );
};

export default TagInput;
