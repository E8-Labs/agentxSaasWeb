import classNames from 'classnames'
import { Send } from 'lucide-react'
import { useMemo, useState } from 'react'

export function ChatInterface({
  loading,
  loadingMessage,
  messages = [],
  isSpeaking,
  sendMessage,
}) {
  const [text, setText] = useState('')

  const formattedMessages = useMemo(() => {
    return messages
      .filter(
        ({ type, transcriptType }) =>
          type === 'transcript' && transcriptType === 'final',
      )
      .map(({ role, transcript }) => ({ role, transcript }))
  }, [messages])

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-2">
        <p className="italic">{loadingMessage}</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-start justify-start gap-2">
      <div className="flex flex-col gap-2 h-[calc(100%-32px)] w-full overflow-y-auto">
        {formattedMessages.map(({ role, transcript }) => (
          <div
            key={transcript}
            className={classNames(
              'w-5/6 min-h-6 rounded-md text-sm p-1',
              role === 'assistant'
                ? 'bg-accent self-start'
                : 'bg-purple text-white self-end',
            )}
          >
            {transcript}
          </div>
        ))}
        {isSpeaking && (
          <div className="w-5/6 min-h-6 rounded-md text-sm p-1 bg-accent self-start">
            ...
          </div>
        )}
      </div>
      <div className="w-full relative flex items-center justify-start">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value || '')}
          className="flex focus:border-accent focus:ring-0 focus:outline-0 w-full border-accent text-sm resize-none h-8 overflow-y-auto pr-6 p-1 rounded-md"
        />
        <button
          onClick={sendMessage}
          className="absolute bottom-1 right-1 size-6 flex flex-col items-center justify-center shrink-0 bg-accent hover:bg-purple transition-colors duration-300 hover:text-white rounded-md"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}
