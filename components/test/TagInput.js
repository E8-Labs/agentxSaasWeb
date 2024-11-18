import React, { useRef } from "react";

const TagInput = () => {
    const inputRef = useRef(null);

    const handleInput = () => {
        const inputBox = inputRef.current;
        const content = inputBox.innerHTML;

        // Check if "{}" is typed
        if (content.includes("{}")) {
            // Replace "{}" with editable content styled in blue
            const updatedContent = content.replace(
                "{}",
                `<span contenteditable="false" style="color: black;">{</span>
         <span class="tag" contenteditable="true" style="
            color: blue;
            font-weight: bold;
            display: inline;
         "></span>
         <span contenteditable="false" style="color: black;">}</span>&nbsp;`
            );

            // Update the input box
            inputBox.innerHTML = updatedContent;

            // Move caret inside the tag span
            const tagSpan = inputBox.querySelector(".tag");
            placeCaretInside(tagSpan);
        }
    };

    const placeCaretInside = (el) => {
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    };

    return (
        <div
            style={{
                width: "100%",
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "5px",
                minHeight: "50px",
                textAlign: "left",
                whiteSpace: "nowrap", // Prevent line breaks
                overflowX: "auto", // Allow horizontal scrolling if needed
                fontSize: "16px",
            }}
            ref={inputRef}
            contentEditable
            onInput={handleInput}
        ></div>
    );
};

export default TagInput;
