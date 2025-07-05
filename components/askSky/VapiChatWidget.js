"use client";

import React, { useCallback, useEffect, useState } from "react";
import { API_KEY, DEFAULT_ASSISTANT_ID } from "./constants";
import classNames from "classnames";
import { Loader2 } from "lucide-react";
import axios from "axios";
import Apis from "../apis/Apis";
import { m } from "framer-motion";
import Image from "next/image";

export default function VapiChatWidget({
    assistantId = DEFAULT_ASSISTANT_ID,
    show = true,
    setShowVapiChatWidget,
}) {
    const [vapi, setVapi] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let instance;
        let mounted = true;

        const initVapi = async () => {
            try {
                const mod = await import("@vapi-ai/web");
                const VapiClient = mod.default ?? mod;
                instance = new VapiClient(API_KEY);

                if (!mounted) return;

                // Save Vapi instance
                setVapi(instance);
                // Connect to assistant in chat mode

                instance.on("call-start", () => {
                    instance.setMuted(true);
                    setLoading(false)
                    // setOpen(true);
                    // setStatusMessage("Call started with Sky");
                });
                instance.on("call-end", () => {
                    // setOpen(false);
                    // setIsSpeaking(false);
                    // setStatusMessage("Call ended");
                    open = false;

                });

                instance.on("speech-start", () => setIsSpeaking(true));
                instance.on("speech-end", () => setIsSpeaking(false));


                // Listen to incoming messages
                instance.on("message", (msg) => {
                    console.log('msg received ', msg)
                    if (msg?.type === "conversation-update") {
                        let newMsg = msg?.messages || [];

                        newMsg = newMsg.filter((m) => {
                            if (m.role === "system") {
                                return null
                            }
                            return m;
                        })
                        setMessages(newMsg);
                    }
                });

                instance.on("error", (err) => {
                    console.error("Vapi error:", err);
                    handleClose();
                });
            } catch (err) {
                console.error("Failed to initialize Vapi:", err);
            }
        };

        initVapi();

        return () => {
            mounted = false;
            if (instance?.removeAllListeners) instance.removeAllListeners();
            instance?.stop?.();
        };
    }, [assistantId]);

    const sendMessage = async () => {
        if (!inputValue.trim() || !vapi) return;

        const userMessage = {
            role: "user",
            content: inputValue,
        };

        // Show user message
        // setMessages((prev) => [...prev, userMessage]);

        // Send to Vapi assistant
        try {
            await vapi.send({
                type: "add-message",
                message: {
                    role: "user",
                    content: inputValue,
                },
            });
        } catch (error) {
            console.error("Failed to send message:", error);
        }

        setInputValue("");
    };
    const getProfileSupportDetails = async () => {
        console.log("get profile support details api calling");
        let user = null;
        try {
            const data = localStorage.getItem("User");

            if (data) {
                user = JSON.parse(data);

                let path = Apis.profileSupportDetails;

                const response = await axios.get(path, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                if (response.data) {
                    if (response.data.status === true) {
                        console.log("profile support details are", response.data);
                        let data = response.data.data;
                        let pipelineData = data.pipelines;

                        delete data.pipelines;

                        return {
                            profile: user.user,
                            additionalData: response.data.data,
                            pipelines: pipelineData,
                        };
                    } else {
                        console.log("profile support message is", response.data.message);

                        return user.user;
                    }
                }
            }
        } catch (e) {
            console.log("error in get profile suppport details api is", e);
            return user.user;
        }
    };

    useEffect(() => {
        startChat()
    }, [vapi])

    const startChat = async () => {
        console.log('starting chat')
        if (vapi) {
            // vapi.setMuted(true)
            let userProfile = await getProfileSupportDetails();

            let pipelineData = userProfile?.pipelines || [];

            delete userProfile?.pipelines;
            const assistantOverrides = {
                recordingEnabled: false,
                variableValues: {
                    customer_details: JSON.stringify(userProfile),
                },
            };

            console.log("assistante overrides", assistantOverrides);

            vapi.start(assistantId, assistantOverrides);
            // setLoading(false);
        }
    }

    const handleClose = async () => {
        try {
            await vapi?.stop();

        } catch (err) {
            console.warn("Error stopping Vapi:", err);
        }
        setShowVapiChatWidget(false)
        show = false;
        // setOpen(false);
        // setShouldStartCall(false);
        // setShowAskSkyModal(false);
    }


    if (!show) return null;

    return (
        <div className="fixed bottom-6 flex flex-col items-end gap-2 right-6 w-[350px] max-h-[600px]">
            <div className="w-full h-full bg-white shadow-lg rounded-xl flex flex-col z-[9999] border border-gray-200">

                <div className="p-4 font-semibold text-purple-700 text-lg border-b border-gray-100">
                    Chat with Sky
                </div>

                {loading ? (
                    <div className="w-full flex items-center justify-center pb-4">
                        <img
                            src="/agentXOrb.gif"
                            alt="AgentX Orb"
                            className="relative z-10 rounded-full bg-white shadow-lg object-cover"
                            style={{
                                height: "120px",
                                width: "120px",
                            }}
                        />
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={classNames(
                                        "max-w-[80%] px-3 py-2 text-sm rounded",
                                        msg.role === "user"
                                            ? "self-end ml-auto text-end"
                                            : "bg-blue-100 self-start mr-auto"
                                    )}
                                >
                                    {msg.message}
                                </div>
                            ))}
                        </div>

                        <div className="p-3 border-t flex items-center gap-2">
                            <input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 border rounded px-3 py-2 text-sm"
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-purple text-white px-4 py-2 text-sm rounded"
                            >
                                Send
                            </button>
                        </div>
                    </>
                )}
            </div>
            <button
                onClick={handleClose}

                className="w-12 self-end h-12 flex flex-row items-center justify-center border-2 rounded-full bg-white"
            >
                <Image
                    src="/otherAssets/crossBlue.jpg"
                    height={2}
                    width={20}
                    alt="cross"
                />
            </button>
        </div>
    );
}
