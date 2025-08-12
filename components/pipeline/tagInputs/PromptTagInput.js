import { Box, Modal } from "@mui/material";
import { FrameCorners } from "@phosphor-icons/react";
import { PencilSimpleLine } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";

export const PromptTagInput = ({
  scrollOffset,
  promptTag,
  kycsList,
  tagValue,
  uniqueColumns,
  showSaveChangesBtn,
  saveUpdates,
  from,
  isEdit = true,
  limit
}) => {
  //// //console.log
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [options, setOptions] = useState([
    "First Name",
    "Last Name",
    "Address",
    "Email",
    "Phone",
  ]);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [text, setText] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const textFieldRef = useRef(null);
  const mirrorDivRef = useRef(null);

  //code for modal
  const [showScriptModal, setShowScriptModal] = useState(false);

  // //console.log;

  useEffect(() => {
    let arr = [...options];
    uniqueColumns?.map((item) => {
      if (!arr.includes(item)) {
        arr.push(item);
      }
    });
    setOptions(arr);

    // setOptions((prev) => {
    //   return [...prev, ...uniqueColumns];
    // });
  }, [uniqueColumns]);

  useEffect(() => {
    let mirrorDiv = null;
    if (typeof document !== "undefined") {
      mirrorDiv = document.createElement("div");
    }
    mirrorDiv.style.position = "absolute";
    mirrorDiv.style.visibility = "hidden";
    mirrorDiv.style.whiteSpace = "pre-wrap";
    mirrorDiv.style.wordWrap = "break-word";
    mirrorDiv.style.overflowWrap = "break-word";

    // Constrain the size and position
    mirrorDiv.style.top = "0";
    mirrorDiv.style.left = "0";
    mirrorDiv.style.width = "auto"; // Allow resizing only as needed
    mirrorDiv.style.height = "auto"; // Prevent unnecessary height growth
    mirrorDiv.style.maxWidth = "100%"; // Ensure it doesn't exceed screen width

    if (typeof document !== "undefined") {
      document.body.appendChild(mirrorDiv);
    }
    mirrorDivRef.current = mirrorDiv;
    // //console.log);

    return () => {
      if (
        typeof document !== "undefined" &&
        mirrorDivRef.current &&
        document.body.contains(mirrorDivRef.current)
      ) {
        typeof document !== "undefined" &&
          document.body.removeChild(mirrorDivRef.current);
      }
      mirrorDivRef.current = null;
    };
  }, []);

  useEffect(() => {
    // setText(promptTag.trim());
    setText(promptTag);
  }, [promptTag]);

  const getTextScrollOffset = () => {
    if (textFieldRef.current) {
      const scrollTop = textFieldRef.current.scrollTop;
      const scrollLeft = textFieldRef.current.scrollLeft;
      // //console.log;
      return { scrollTop, scrollLeft };
    }
    return { scrollTop: 0, scrollLeft: 0 };
  };

  const calculatePopupPositionOld = (input, textBeforeCursor) => {
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

    let spanMarker = null;
    if (typeof document !== "undefined") {
      spanMarker = document.createElement("span");
    }
    spanMarker.textContent = "|";
    mirrorDiv.appendChild(spanMarker);

    const markerRect = spanMarker.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();

    mirrorDiv.removeChild(spanMarker);

    const popupLeft = markerRect.left; // - inputRect.left + scrollOffset.scrollLeft;
    let maxLines = (markerRect.top - 1005) / 24 + 1;
    let distance = 35 + (markerRect.top - 1005);
    // //console.log;
    // if(maxLines > 18){
    //     distance = 18 * 24 + 35;
    // }
    let textOffset = getTextScrollOffset();
    let popupTop = distance - textOffset.scrollTop; //inputRect.top / markerRect.top * scrollOffset.scrollTop//markerRect.top - inputRect.top + scrollOffset.scrollTop - (markerRect.top - inputRect.top - scrollOffset.scrollTop) * 0.25;//490
    // markerRect.top - inputRect.top + scrollOffset.scrollTop + parseFloat(computedStyle.lineHeight);

    // //console.log;
    // //console.log;
    // //console.log;
    // //console.log;
    // //console.log;
    // //console.log;

    setPopupPosition({ top: popupTop, left: popupLeft });
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

    let spanMarker = null;
    if (typeof document !== "undefined") {
      spanMarker = document.createElement("span");
    }

    spanMarker.textContent = "|";
    mirrorDiv.appendChild(spanMarker);

    const markerRect = spanMarker.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();

    mirrorDiv.removeChild(spanMarker);

    const popupLeft = markerRect.left;
    let maxLines = (markerRect.top - 1005) / 24 + 1;
    let distance = 35 + markerRect.top;
    let textOffset = getTextScrollOffset();

    let popupTop = distance - textOffset.scrollTop;

    // Ensure the popupTop doesn't exceed the viewport height
    const viewportHeight = window.innerHeight;
    const popupHeight = 150; // Assume popup height; adjust based on your UI
    if (popupTop + popupHeight > viewportHeight) {
      popupTop = viewportHeight - popupHeight;
    }

    // //console.log;
    // //console.log;
    // //console.log;
    // //console.log;
    // //console.log;

    setPopupPosition({ top: popupTop, left: popupLeft });
  };

  const handleKeyUp = (e) => {
    const input = textFieldRef.current;

    if (!input) return;

    const cursorPos = input.selectionStart;
    const textBeforeCursor = input.value.substring(0, cursorPos);
    const lastOpenBraceIndex = textBeforeCursor.lastIndexOf("{");

    if (lastOpenBraceIndex !== -1) {
      const searchTerm = textBeforeCursor
        .substring(lastOpenBraceIndex + 1)
        .toLowerCase();
      let filtered = [];
      if (searchTerm.startsWith("kyc")) {
        let kycTerm = searchTerm.replace(/kyc/g, "").trim();
        kycsList?.filter((option) => {
          if (option.question.toLowerCase().startsWith(kycTerm)) {
            filtered.push(option.question);
          }
        });
        // //console.log;
        setFilteredOptions(filtered);
      } else {
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

  function removeCharacterAt(string, position) {
    return string.slice(0, position) + string.slice(position + 1);
  }

  function removeSubstring(string, start, end) {
    // Concatenate the part before the range and the part after the range
    return string.slice(0, start) + string.slice(end + 1);
  }

  const handleKeyDown = (e) => {
    const input = textFieldRef.current;

    if (!input) return;

    const cursorPos = input.selectionStart;

    // Check if the user is pressing Backspace or Delete
    if (e.key === "Backspace" || e.key === "Delete") {
      const textBeforeCursor = text.substring(0, cursorPos);
      const textAfterCursor = text.substring(cursorPos);
      //// //console.log
      //// //console.log
      let CharDel = text.substring(cursorPos - 1, cursorPos);
      // //console.log;
      let t = text;
      //find the starting position of the text
      //if found } don't delete
      //if found { then delete forward
      let ShouldDelete = true;
      let indexOfStart = cursorPos;
      let currentChar = CharDel;
      while (currentChar != "{" && indexOfStart >= 0) {
        indexOfStart -= 1;
        currentChar = t.substring(indexOfStart - 1, indexOfStart);
        if (currentChar == "}" && indexOfStart != cursorPos) {
          // //console.log;
          ShouldDelete = false;
          return;
        }
        // //console.log;
      }
      // //console.log;
      // //console.log;
      // //console.log;
      if (ShouldDelete && indexOfStart > -1) {
        const firstOccurrenceEndChar = t.indexOf("}", indexOfStart); //}
        const startCharPositionBetween = t.indexOf("{", indexOfStart + 1);
        const firstOccurrenceOfStartChar = indexOfStart; //t.indexOf("{", indexOfStart); //{

        // //console.log;
        // //console.log;
        // //console.log;

        const isTagInComplete =
          startCharPositionBetween >= firstOccurrenceOfStartChar &&
          startCharPositionBetween < firstOccurrenceEndChar;
        // //console.log;

        if (
          firstOccurrenceEndChar > firstOccurrenceOfStartChar && // "{" should be ahead of "}"
          !isTagInComplete
        ) {
          //delete all until endCharPos
          // //console.log;
          t = removeSubstring(t, indexOfStart - 1, firstOccurrenceEndChar);
          // //console.log;
          e.preventDefault(); // Prevent the default Backspace or Delete action

          setText(t);

          // Adjust cursor position
          const newCursorPos =
            e.key === "Backspace" ? indexOfStart : indexOfStart;
          setTimeout(() => {
            input.focus();
            input.setSelectionRange(newCursorPos - 1, newCursorPos - 1);
          }, 0);
        } else {
          e.preventDefault();
          // //console.log;
          t = removeSubstring(t, cursorPos - 1, cursorPos - 1);
          // //console.log;
          setText(t);
          setTimeout(() => {
            input.focus();
            input.setSelectionRange(cursorPos - 1, cursorPos - 1);
          }, 0);
        }
      }
    }

    // setCursorPosition(cursorPos);
  };

  const handleOptionSelect = (option) => {
    const input = textFieldRef.current;

    if (!input) return;

    const textBeforeCursor = text.substring(0, cursorPosition);
    const lastOpenBraceIndex = textBeforeCursor.lastIndexOf("{");
    const beforeBrace = textBeforeCursor.substring(0, lastOpenBraceIndex);
    const afterBrace = text.substring(cursorPosition);

    // //console.log;
    // //console.log;

    // //console.log;

    const updatedText = `${beforeBrace}{${option}}${afterBrace}`;
    setText(updatedText);
    tagValue(updatedText);

    setPopupVisible(false);

    setTimeout(() => {
      const newCursorPos = beforeBrace.length + option.length + 2;
      // input.focus();
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleChange = (e) => {
    setText(e.target.value);
    tagValue(e.target.value);
  };

  const styles = {
    modalsStyle: {
      // height: "auto",
      bgcolor: "transparent",
      // p: 2,
      mx: "auto",
      my: "50vh",
      transform: "translateY(-50%)",
      borderRadius: 2,
      border: "none",
      outline: "none",
    },
  };

  return (
    <div className="" style={{ position: "relative" }}>
      <div
        className="flex flex-row items-start gap-2 w-full outline-none rounded-xl focus:ring-0"
        style={{
          border: "1px solid #00000020",
          paddingRight: "10px",
        }}
      >
        <textarea
          className="outline-none rounded-xl focus:ring-0 border-none w-full  min-h-[50px]"
          onClick={() => {
            setShowScriptModal(true);
          }}
          placeholder="Type here..."
          value={text}
          maxLength={limit}
          readOnly
          // onChange={handleChange}
          style={{
            fontSize: "16px",
            width: "100%",
            fontWeight: "500",
            fontSize: 15,
            height: showSaveChangesBtn
              ? window.innerHeight <= 900
                ? "calc(100vh - 670px)"
                : "calc(100vh - 730px)"
              : "calc(100vh - 650px)",
            // maxHeight:"28vh",
            resize: "none",
            // backgroundColor:'red'
            // border: "1px solid #00000020",
          }}
        // disabled={true}
        />
        <div className="h-[50px] flex flex-col justify-center">
          <button
            onClick={() => {
              setShowScriptModal(true);
            }}
          >
            <FrameCorners size={18} />
          </button>
        </div>
      </div>

      {/*popupVisible && filteredOptions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,
            height: "200px",
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
                // borderBottom: "1px solid lightgray",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "lightblue")
              }
              onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
            >
              {option}
            </div>
          ))}
        </div>
      )*/}

      <Modal
        open={showScriptModal}
        onClose={() => setShowScriptModal(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: "#00000010",
            //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box
          className="lg:w-5/12 sm:w-full w-8/12 h-[93%] flex justify-center items-center"
          sx={styles.modalsStyle}
        >
          <div className="flex flex-row justify-center items-center w-full h-[100%]">
            <div
              className="sm:w-full w-full h-[100%]"
              style={{
                backgroundColor: "#ffffff",
                // backgroundColor: "red",
                padding: 20,
                borderRadius: "13px",
                position: "relative",
                // marginTop: 50,
              }}
            >
              <div className="h-[12%]">
                <div className="flex flex-row justify-end">
                  <button
                    onClick={() => {
                      setShowScriptModal(false);
                    }}
                  >
                    <Image
                      src={"/assets/crossIcon.png"}
                      height={40}
                      width={40}
                      alt="*"
                    />
                  </button>
                </div>

                <div
                  className="text-start sm:font-24 font-16"
                  style={{ fontWeight: "700" }}
                >
                  {isEdit ? "Edit" : "Add"} {from}
                </div>

                {
                  from === "Voicemail" && (
                    <div  className="w-full flex flex-col  items-end jutstify-end">
                      <div style={{
                        fontSize: 14, fontWeight: '500', color: '#00000060'
                      }}>
                        {text?.length}/200
                      </div>
                    </div>
                  )
                }
              </div>

              <div style={{ position: "relative", height: "80%" }}>
                <textarea
                  className="outline-none rounded-xl focus:ring-0"
                  ref={textFieldRef}
                  value={text}
                  maxLength={limit}
                  onClick={() => {
                    setShowScriptModal(true);
                  }}
                  onChange={handleChange}
                  onKeyUp={handleKeyUp}
                  onKeyDown={handleKeyDown}
                  placeholder="Type here..."
                  style={{
                    fontSize: "15px",
                    padding: "15px",
                    width: "100%",
                    fontWeight: "500",
                    height: "100%", // Initial height
                    maxHeight: "100%", // Maximum height before scrolling
                    overflowY: "auto", // Enable vertical scrolling when max-height is exceeded
                    resize: "none", // Disable manual resizing
                    border: "1px solid #00000020",
                  }}
                />

                {showSaveChangesBtn && (
                  <button
                    className="bg-purple w-full h-[50px] rounded-xl mb-4 text-white"
                    style={{ fontWeight: "600", fontSize: 15 }}
                    onClick={() => {
                      setShowScriptModal(false);
                      // saveUpdates();
                    }}
                  >
                    Save Changes
                  </button>
                )}

                {/* <textarea
                  className="outline-none rounded-xl focus:ring-0"
                  ref={textFieldRef}
                  value={text}
                  onClick={() => {
                    setShowScriptModal(true);
                  }}
                  onChange={handleChange}
                  onKeyUp={handleKeyUp}
                  onKeyDown={handleKeyDown}
                  placeholder="Type here..."
                  style={{
                    fontSize: "16px",
                    padding: "15px",
                    width: "100%",
                    fontWeight: "500",
                    fontSize: 15,
                    height: "100%",
                    resize: "none",
                    border: "1px solid #00000020",
                  }}
                /> */}

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
                      maxHeight: "250px",
                      overflow: "auto",
                      scrollbarWidth: "none",
                    }}
                  >
                    {filteredOptions.map((option) => (
                      <div
                        key={option}
                        onClick={() => handleOptionSelect(option)}
                        style={{
                          padding: "5px 10px",
                          cursor: "pointer",
                          // borderBottom: "1px solid lightgray",
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

              {/* <div className="mt-4 w-full h-[15%]">
                <button
                  className="bg-purple text-white text-xl font-medium w-full rounded-2xl h-[50px]"
                  onClick={() => {
                    setShowScriptModal(false);
                  }}
                >
                  Update & Close
                </button>
              </div> */}

              {/* Can be use full to add shadow */}
              {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};
