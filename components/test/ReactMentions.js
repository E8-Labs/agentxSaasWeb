// import React, { useState } from "react";
// import { MentionsInput, Mention } from "react-mentions";
// const users = [
//     { id: "1", display: "John Doe" },
//     { id: "2", display: "Jane Smith" },
// ];
// const ReactMentions = () => {
//     const [value, setValue] = useState("");
//     const handleChange = (event) => {
//         setValue(event.target.value);
//     };
//     return (
//         <MentionsInput
//             value={value}
//             onChange={handleChange}
//             style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "5px" }}
//             placeholder="Type @ to tag someone"
//             markup="@[__display__](__id__)"
//         >
//             <Mention
//                 trigger="@"
//                 data={users}
//                 style={{ backgroundColor: "#d8dfea" }}
//             />
//         </MentionsInput>
//     );
// };
// export default ReactMentions;
import React, { useState } from 'react'
import { Mention, MentionsInput } from 'react-mentions'

const ReactMentions = (props) => {
  const [value, setValue] = useState('') // State to hold the input value

  // Handler for input change
  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  // Example render function for user suggestions
  const renderUserSuggestion = (suggestion, search, highlightedDisplay) => (
    <div>{highlightedDisplay}</div>
  )

  // Example render function for tag suggestions
  const renderTagSuggestion = (suggestion, search, highlightedDisplay) => (
    <div>{highlightedDisplay}</div>
  )

  // Placeholder function for requesting tags (update with your logic)
  const requestTag = () => {
    return [
      { id: '1', display: '#react' },
      { id: '2', display: '#javascript' },
    ]
  }

  return (
    <div>
      <MentionsInput value={value} onChange={handleChange}>
        <Mention
          trigger="@"
          data={props.users}
          renderSuggestion={renderUserSuggestion}
        />
        <Mention
          trigger="#"
          data={requestTag()}
          renderSuggestion={renderTagSuggestion}
        />
      </MentionsInput>
    </div>
  )
}

export default ReactMentions
