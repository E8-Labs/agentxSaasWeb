import { CompositeDecorator, Editor, EditorState, Modifier } from 'draft-js'
import React from 'react'

const TagInput = () => {
  const [warning, setWarning] = React.useState(null)

  const findTag = (contentBlock, callback, contentState) => {
    const text = contentBlock.getText()
    const regex = /{(.*?)}/g
    let matchArr
    while ((matchArr = regex.exec(text)) !== null) {
      const tagContent = matchArr[1].trim()
      if (!['name', 'email', 'phone'].includes(tagContent)) {
        setWarning(
          `Invalid tag: "${tagContent}". Only "name", "email", or "phone" are allowed.`,
        )
      } else {
        setWarning(null)
      }
      callback(matchArr.index, matchArr.index + matchArr[0].length)
    }
  }

  const TagSpan = (props) => {
    return (
      <span style={{ backgroundColor: '#e0f7fa', color: '#004d40' }}>
        {props.children}
      </span>
    )
  }

  const decorator = new CompositeDecorator([
    {
      strategy: findTag,
      component: TagSpan,
    },
  ])

  const [editorState, setEditorState] = React.useState(
    EditorState.createEmpty(decorator),
  )

  const handleEditorChange = (state) => {
    const contentState = state.getCurrentContent()
    const text = contentState.getPlainText()
    const regex = /{(.*?)}/g
    let matchArr
    let invalid = false
    while ((matchArr = regex.exec(text)) !== null) {
      const tagContent = matchArr[1].trim()
      if (!['name', 'email', 'phonenumber'].includes(tagContent)) {
        invalid = true
      }
    }

    if (invalid) {
      setWarning(
        "Invalid input inside {}. Only 'name', 'email', or 'phonenumber' are allowed.",
      )
    } else {
      setWarning(null)
    }
    setEditorState(state)
  }

  return (
    <div style={{ padding: '10px' }}>
      {warning && (
        <div style={{ color: 'red', marginBottom: '10px' }}>{warning}</div>
      )}
      <div style={{ border: '1px solid #ccc', padding: '10px' }}>
        <Editor
          editorState={editorState}
          onChange={handleEditorChange}
          placeholder="Type here..."
        />
      </div>
    </div>
  )
}

export default TagInput
