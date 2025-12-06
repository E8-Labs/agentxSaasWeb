import React, { useState } from 'react'
import { Mention, MentionsInput } from 'react-mentions'

const MentionsInputTest = () => {
  const [value, setValue] = useState('')

  const handleChange = (event) => {
    setValue(event.target.value)
  }

  return (
    <div>
      <MentionsInput
        value={value}
        onChange={handleChange}
        style={{ width: '100%', height: '100px' }}
      >
        <Mention
          trigger="@"
          data={[
            { id: 'user1', display: 'User One' },
            { id: 'user2', display: 'User Two' },
          ]}
        />
      </MentionsInput>
    </div>
  )
}

export default MentionsInputTest
