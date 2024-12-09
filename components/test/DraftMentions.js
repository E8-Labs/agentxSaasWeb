import React, { useState, useMemo, useCallback } from 'react';
import { EditorState } from 'draft-js';
import Editor from '@draft-js-plugins/editor';
import createMentionPlugin, { defaultSuggestionsFilter } from '@draft-js-plugins/mention';

const mentions = [
    { name: 'John Doe' },
    { name: 'Jane Smith' },
    { name: 'Emily Johnson' },
];

export default function DraftMentions() {
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [suggestions, setSuggestions] = useState(mentions);
    const [open, setOpen] = useState(false);

    const { plugins, MentionSuggestions } = useMemo(() => {
        const mentionPlugin = createMentionPlugin();
        const { MentionSuggestions } = mentionPlugin;
        return { plugins: [mentionPlugin], MentionSuggestions };
    }, []);

    const onSearchChange = ({ value }) => {
        console.log("Search Value:", value);
        const filteredSuggestions = defaultSuggestionsFilter(value, mentions);
        console.log("Filtered Suggestions:", filteredSuggestions);
        setSuggestions(filteredSuggestions);
    };
    const onOpenChange = useCallback((_open) => {
        console.log("Open cahgned ", _open)
        setOpen(_open);
      }, []);
      

    return (
        <div style={{ border: '1px solid #ddd', padding: '10px', minHeight: '200px' }}>
            <Editor
                editorState={editorState}
                onChange={setEditorState}
                
                plugins={plugins}
            />
            <MentionSuggestions
                suggestions={suggestions}
                onOpenChange={onOpenChange}
                onSearchChange={onSearchChange}
                open={true}
            />
        </div>
    );
}
