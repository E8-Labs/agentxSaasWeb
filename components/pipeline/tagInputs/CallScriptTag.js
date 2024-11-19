import React, { useState } from "react";
import { Editor, EditorState, Modifier, SelectionState, CompositeDecorator } from "draft-js";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

// Function to find and style all valid tags
const findTagEntities = (contentBlock, callback) => {
    const text = contentBlock.getText();

    // Allow only specific tags
    const regex = /\{(name|address|phone|email|KYC\s\|[^{}]+)\}/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        callback(match.index, match.index + match[0].length);
    }
};

// Component to render styled tags
const TagSpan = (props) => (
    <span style={{ color: "blue", fontWeight: "bold" }}>{props.children}</span>
);

// Composite decorator for styling valid tags
const decorator = new CompositeDecorator([
    {
        strategy: findTagEntities,
        component: TagSpan,
    },
]);

const CallScriptTag = ({ handleCallScriptTag }) => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty(decorator));
    const [popoverAnchor, setPopoverAnchor] = useState(null); // Popover anchor element
    const [filteredItems, setFilteredItems] = useState([]); // Items for popover

    const items = [
        { title: "real-estate" },
        { title: "investment" },
        { title: "growth" },
        { title: "confidence" },
        { title: "technology" },
    ];

    const handleEditorChange = (state) => {
        setEditorState(state);

        const contentState = state.getCurrentContent();
        const selectionState = state.getSelection();
        const text = contentState.getPlainText();

        const cursorPosition = selectionState.getAnchorOffset();
        const textBeforeCursor = text.slice(0, cursorPosition);

        // Match for "{KYC |"
        const match = textBeforeCursor.match(/\{KYC\s\|\s$/);
        if (match) {
            const domSelection = window.getSelection();
            if (domSelection && domSelection.rangeCount > 0) {
                const range = domSelection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                setPopoverAnchor({
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                });
                setFilteredItems(items);
            }
        } else {
            setPopoverAnchor(null);
        }

        handleCallScriptTag(text);
    };

    const handleSelectItem = (item) => {
        const contentState = editorState.getCurrentContent();
        const selectionState = editorState.getSelection();

        // Replace "{KYC |" with the selected item inside "{KYC | ... }"
        const textToReplace = "{KYC | ";
        const cursorPosition = selectionState.getAnchorOffset();
        const startOffset = cursorPosition - textToReplace.length;

        const blockKey = selectionState.getAnchorKey();
        const block = contentState.getBlockForKey(blockKey);

        // Extract the text up to the cursor and after the cursor
        const blockText = block.getText();
        const prefixText = blockText.slice(0, startOffset); // Text before "{KYC |"
        const suffixText = blockText.slice(cursorPosition); // Text after the cursor

        const updatedText = `${prefixText}{KYC | ${item.title}}${suffixText}`;

        // Replace only the "{KYC | ... }" part with the updated text
        const newContentState = Modifier.replaceText(
            contentState,
            SelectionState.createEmpty(blockKey).merge({
                anchorOffset: startOffset,
                focusOffset: cursorPosition,
            }),
            `{KYC | ${item.title}}`
        );

        // Create a new editor state
        const newEditorState = EditorState.push(editorState, newContentState, "insert-characters");

        // Move the cursor to the end of the inserted tag
        const updatedSelection = SelectionState.createEmpty(blockKey).merge({
            anchorOffset: startOffset + `{KYC | ${item.title}}`.length,
            focusOffset: startOffset + `{KYC | ${item.title}}`.length,
        });

        const finalEditorState = EditorState.forceSelection(newEditorState, updatedSelection);

        setEditorState(finalEditorState);
        setPopoverAnchor(null);
    };


    // const handleSelectItem = (item) => {
    //     const contentState = editorState.getCurrentContent();
    //     const selectionState = editorState.getSelection();

    //     // Replace "{KYC |" with the selected item inside "{KYC | ... }"
    //     const textToReplace = "{KYC | ";
    //     const cursorPosition = selectionState.getAnchorOffset();
    //     const startOffset = cursorPosition - textToReplace.length;

    //     const blockKey = selectionState.getAnchorKey();
    //     const block = contentState.getBlockForKey(blockKey);

    //     // Extract the text to ensure only the "{KYC | ... }" part is replaced
    //     const blockText = block.getText();
    //     const prefixText = blockText.slice(0, startOffset);
    //     const suffixText = blockText.slice(cursorPosition); // Rest of the text after the cursor

    //     const updatedText = `${prefixText}{KYC | ${item.title}}${suffixText}`;

    //     // Update content state with the replaced text
    //     const newContentState = Modifier.replaceText(
    //         contentState,
    //         SelectionState.createEmpty(blockKey).merge({
    //             anchorOffset: 0,
    //             focusOffset: block.getText().length,
    //         }),
    //         updatedText
    //     );

    //     // Create a new editor state
    //     const newEditorState = EditorState.push(editorState, newContentState, "insert-characters");

    //     // Ensure focus remains at the end of the updated text
    //     const updatedSelection = SelectionState.createEmpty(blockKey).merge({
    //         anchorOffset: prefixText.length + `{KYC | ${item.title}}`.length,
    //         focusOffset: prefixText.length + `{KYC | ${item.title}}`.length,
    //     });

    //     const finalEditorState = EditorState.forceSelection(newEditorState, updatedSelection);

    //     setEditorState(finalEditorState);
    //     setPopoverAnchor(null);
    // };

    return (
        <div style={{ padding: "10px", position: "relative" }}>
            <div style={{ border: "1px solid #ccc", padding: "10px", minHeight: "150px" }}>
                <Editor
                    editorState={editorState}
                    onChange={handleEditorChange}
                    placeholder="Type here..."
                />
            </div>
            <Popover
                open={Boolean(popoverAnchor)}
                anchorReference="anchorPosition"
                anchorPosition={popoverAnchor}
                onClose={() => setPopoverAnchor(null)}
                PaperProps={{ style: { maxHeight: "200px", overflow: "auto", width: "200px" } }}
            >
                <List>
                    {filteredItems.map((item, index) => (
                        <ListItem
                            key={index}
                            component="button"
                            onClick={() => handleSelectItem(item)}
                        >
                            <ListItemText primary={item.title} />
                        </ListItem>
                    ))}
                </List>
            </Popover>
        </div>
    );
};

export default CallScriptTag;
