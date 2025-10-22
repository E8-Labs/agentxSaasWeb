import React, { useRef, useLayoutEffect, useState, useEffect } from "react";

const FitText = ({ text, max = 16, min = 10 }) => {
    const ref = useRef();
    const [fontSize, setFontSize] = useState(max);

    const resizeText = () => {
        const el = ref.current;
        if (!el) return;
        el.style.fontSize = `${max}px`;
        let size = max;
        while (el.scrollWidth > el.clientWidth && size > min) {
            size -= 0.5;
            el.style.fontSize = `${size}px`;
        }
        setFontSize(size);
    };

    useLayoutEffect(() => {
        resizeText();
        const ro = new ResizeObserver(resizeText);
        ro.observe(ref.current?.parentElement || ref.current);
        return () => ro.disconnect();
    }, [text]);

    // Handle window resize manually
    useEffect(() => {
        window.addEventListener("resize", resizeText);
        return () => window.removeEventListener("resize", resizeText);
    }, []);

    return (
        <span
            ref={ref}
            style={{
                display: "inline-block",
                fontSize,
                whiteSpace: "nowrap",
                verticalAlign: "middle",
                lineHeight: "1.3",
            }}
        >
            {text}
        </span>
    );
};

export default FitText;
