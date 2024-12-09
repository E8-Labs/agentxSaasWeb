"use client"
import { GreetingTagInput } from '@/components/pipeline/tagInputs/GreetingTagInput'
import React, { useEffect, useRef, useState } from 'react'

const Page = () => {

    const containerRef = useRef(null); // Ref to the scrolling container
    const [greetingTagInput, setGreetingTagInput] = useState('');
    const [scrollOffset, setScrollOffset] = useState({ scrollTop: 0, scrollLeft: 0 });
    const [kycsData, setKycsData] = useState(null);

    useEffect(() => {
        const agentDetailsLocal = localStorage.getItem("agentDetails");
        if (agentDetailsLocal) {
            const localAgentData = JSON.parse(agentDetailsLocal);
            console.log("Locla agent details are :-", localAgentData);
            // setAgentDetails(localAgentData);
            setGreetingTagInput(localAgentData.greeting);
            // setScriptTagInput(localAgentData.callScript);
        }
        // getUniquesColumn();
    }, []);

    useEffect(() => {
        ////console.log("Setting scroll offset")
        const handleScroll = () => {
            console.log("Div scrolled", containerRef.current.scrollTop)
            if (containerRef.current) {
                setScrollOffset({
                    scrollTop: containerRef.current.scrollTop,
                    scrollLeft: containerRef.current.scrollLeft,
                });
            }
            else {
                ////console.log("No ref div")
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener("scroll", handleScroll);
            }
        };
    }, []);

    return (
        <div>
            <GreetingTagInput greetTag={greetingTagInput} kycsList={kycsData} tagValue={setGreetingTagInput} scrollOffset={scrollOffset} />
        </div>
    )
}

export default Page