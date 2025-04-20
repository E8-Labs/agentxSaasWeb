// components/CommentModal.js
import React, { useState } from "react";

export function CommentModal({ open, onClose, onSubmit }) {
    const [input, setInput] = useState("");

    if (!open) return null;

    const handleSubmit = () => {
        onSubmit(input);
        setInput("");
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded-md shadow-md w-80">
                <h2 className="text-lg font-semibold mb-2">Add Comment</h2>
                <input
                    className="w-full border px-2 py-1 rounded mb-3"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your comment"
                />
                <div className="flex justify-end gap-2">
                    <button
                        className="px-3 py-1 text-white bg-gray-500 rounded"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-3 py-1 text-white bg-purple rounded"
                        onClick={handleSubmit}
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}
