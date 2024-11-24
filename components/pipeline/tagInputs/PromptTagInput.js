import React, { useState, useRef, useEffect } from "react";

export const PromptTagInput = ({ scrollOffset, promptTag, kycsList, tagValue }) => {
    // console.log("Scroll Offset Parent ", scrollOffset)
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const [options] = useState(["name", "address", "email", "phone"]);
    const [filteredOptions, setFilteredOptions] = useState(options);
    const [text, setText] = useState("");
    const [cursorPosition, setCursorPosition] = useState(0);
    const textFieldRef = useRef(null);
    const mirrorDivRef = useRef(null);

    useEffect(() => {
        const mirrorDiv = document.createElement("div");
        mirrorDiv.style.position = "absolute";
        mirrorDiv.style.visibility = "hidden";
        mirrorDiv.style.whiteSpace = "pre-wrap";
        mirrorDiv.style.wordWrap = "break-word";
        mirrorDiv.style.overflowWrap = "break-word";
        document.body.appendChild(mirrorDiv);
        mirrorDivRef.current = mirrorDiv;

        return () => {
            if (mirrorDivRef.current) {
                document.body.removeChild(mirrorDivRef.current);
            }
        };
    }, []);

    useEffect(() => {
        setText(promptTag)
    }, [promptTag])


    const getTextScrollOffset = () => {
        if (textFieldRef.current) {
            const scrollTop = textFieldRef.current.scrollTop;
            const scrollLeft = textFieldRef.current.scrollLeft;
            console.log("Scroll Offset - Top:", scrollTop, "Left:", scrollLeft);
            return { scrollTop, scrollLeft };
        }
        return { scrollTop: 0, scrollLeft: 0 };
    };

    const calculatePopupPosition = (input, textBeforeCursor) => {
        const mirrorDiv = mirrorDivRef.current;

        if (!mirrorDiv) return;

        const computedStyle = getComputedStyle(input);
        const properties = [
            "fontFamily",
            "fontSize",
            "fontWeight",
            "lineHeight",
            "paddingTop",
            "paddingLeft",
            "paddingRight",
            "paddingBottom",
            "borderWidth",
            "boxSizing",
            "whiteSpace",
            "overflow",
            "wordWrap",
            "textAlign",
        ];
        properties.forEach((prop) => {
            mirrorDiv.style[prop] = computedStyle[prop];
        });

        mirrorDiv.textContent = textBeforeCursor;
        mirrorDiv.style.width = `${input.clientWidth}px`;

        const spanMarker = document.createElement("span");
        spanMarker.textContent = "|";
        mirrorDiv.appendChild(spanMarker);

        const markerRect = spanMarker.getBoundingClientRect();
        const inputRect = input.getBoundingClientRect();

        mirrorDiv.removeChild(spanMarker);

        const popupLeft = markerRect.left// - inputRect.left + scrollOffset.scrollLeft;
        let maxLines = (markerRect.top - 1005) / 24 + 1
        let distance = 35 + (markerRect.top - 1005)
        console.log("Max Lines ", maxLines)
        // if(maxLines > 18){
        //     distance = 18 * 24 + 35;
        // }
        let textOffset = getTextScrollOffset()
        let popupTop = distance - textOffset.scrollTop//inputRect.top / markerRect.top * scrollOffset.scrollTop//markerRect.top - inputRect.top + scrollOffset.scrollTop - (markerRect.top - inputRect.top - scrollOffset.scrollTop) * 0.25;//490
        // markerRect.top - inputRect.top + scrollOffset.scrollTop + parseFloat(computedStyle.lineHeight);

        console.log("Text Offset: ", textOffset);
        console.log("Scroll Offset: ", scrollOffset);
        console.log("Marker Rect: ", markerRect);
        console.log("Input Rect: ", inputRect);
        console.log("Popup Left: ", popupLeft);
        console.log("Popup Top: ", popupTop);

        setPopupPosition({ top: popupTop, left: popupLeft });
    };

    const handleKeyUp = (e) => {
        const input = textFieldRef.current;

        if (!input) return;

        const cursorPos = input.selectionStart;
        const textBeforeCursor = input.value.substring(0, cursorPos);
        const lastOpenBraceIndex = textBeforeCursor.lastIndexOf("{");

        if (lastOpenBraceIndex !== -1) {
            const searchTerm = textBeforeCursor.substring(lastOpenBraceIndex + 1).toLowerCase();
            let filtered = []
            if (searchTerm.startsWith("kyc")) {
                let kycTerm = searchTerm.replace(/kyc/g, "").trim();
                kycsList.filter((option) => {
                    if (option.question.toLowerCase().startsWith(kycTerm)) {
                        filtered.push(option.question)
                    }
                }
                );
                console.log("Filered kyc ", filtered)
                setFilteredOptions(filtered);
            }
            else {
                filtered = options.filter((option) =>
                    option.toLowerCase().startsWith(searchTerm)
                );
                setFilteredOptions(filtered);
            }


            if (filtered.length > 0) {
                calculatePopupPosition(input, textBeforeCursor);
                setPopupVisible(true);
            } else {
                setPopupVisible(false);
            }
        } else {
            setPopupVisible(false);
        }

        setCursorPosition(cursorPos);
    };

    const handleKeyDown = (e) => {
        const input = textFieldRef.current;

        if (!input) return;

        const cursorPos = input.selectionStart;

        // Check if the user is pressing Backspace or Delete
        if (e.key === "Backspace" || e.key === "Delete") {
            const textBeforeCursor = text.substring(0, cursorPos);
            const textAfterCursor = text.substring(cursorPos);

            // Find all tags using a regular expression
            const tagRegex = /\{[^\}]*\}/g; // Matches {name}, {address}, etc.
            let match;
            let tagToDelete = null;

            while ((match = tagRegex.exec(text))) {
                const start = match.index;
                const end = match.index + match[0].length;

                // Check if the cursor is within a tag
                if (cursorPos > start && cursorPos <= end) {
                    tagToDelete = { start, end };
                    break;
                }
            }

            // If a tag is found, delete the entire tag
            if (tagToDelete) {
                e.preventDefault(); // Prevent the default Backspace or Delete action
                const newText =
                    text.substring(0, tagToDelete.start) + text.substring(tagToDelete.end);
                setText(newText);

                // Adjust cursor position
                const newCursorPos = e.key === "Backspace" ? tagToDelete.start : tagToDelete.start;
                setTimeout(() => {
                    input.focus();
                    input.setSelectionRange(newCursorPos, newCursorPos);
                }, 0);
                return;
            }
        }

        setCursorPosition(cursorPos);
    };

    const handleOptionSelect = (option) => {
        const input = textFieldRef.current;

        if (!input) return;

        const textBeforeCursor = text.substring(0, cursorPosition);
        const lastOpenBraceIndex = textBeforeCursor.lastIndexOf("{");
        const beforeBrace = textBeforeCursor.substring(0, lastOpenBraceIndex);
        const afterBrace = text.substring(cursorPosition);

        const updatedText = `${beforeBrace}{${option}}${afterBrace}`;
        setText(updatedText);
        tagValue(updatedText);

        setPopupVisible(false);

        setTimeout(() => {
            const newCursorPos = beforeBrace.length + option.length + 2;
            input.focus();
            input.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleChange = (e) => {
        setText(e.target.value);
    };

    return (
        <div style={{ position: "relative" }}>
            <textarea
                className="outline-none border rounded-xl"
                ref={textFieldRef}
                rows="20"
                cols="50"
                value={text}
                onChange={handleChange}
                onKeyUp={handleKeyUp}
                onKeyDown={handleKeyDown}
                placeholder="Type here..."
                style={{ fontSize: "16px", padding: "10px", width: "100%", fontWeight: "500", fontSize: 15, height: 500, resize: "none" }}
            />
            {popupVisible && filteredOptions.length > 0 && (
                <div
                    style={{
                        position: "absolute",
                        top: `${popupPosition.top}px`,
                        left: `${popupPosition.left}px`,
                        backgroundColor: "white",
                        border: "1px solid lightgray",
                        borderRadius: "5px",
                        boxShadow: "0 0 5px rgba(0, 0, 0, 0.2)",
                        zIndex: 1000,
                        padding: "10px",
                        minWidth: "150px",
                    }}
                >
                    {filteredOptions.map((option) => (
                        <div
                            key={option}
                            onClick={() => handleOptionSelect(option)}
                            style={{
                                padding: "5px 10px",
                                cursor: "pointer",
                                borderBottom: "1px solid lightgray",
                            }}
                            onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "lightblue")
                            }
                            onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = "white")
                            }
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
