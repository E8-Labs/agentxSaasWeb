import React from 'react'

const TestTwilioBtn = ({ handleClick }) => {
    return (
        <button onClick={() => { handleClick() }}>
            Connect
        </button>
    )
}

export default TestTwilioBtn
