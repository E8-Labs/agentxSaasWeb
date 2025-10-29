import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Tooltip } from "@mui/material";

const FeatureLine = ({
    text,
    info,
    max = 16,
    min = 10,
    gap = 4,
    iconSize = 12,
}) => {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [fontSize, setFontSize] = useState(max);

    const fit = () => {
        const container = containerRef.current;
        const textEl = textRef.current;
        if (!container || !textEl) return;

        let size = max;
        textEl.style.fontSize = `${size}px`;

        // Reserve space for icon + gap if there's a tooltip
        const reserved = info ? iconSize + gap : 0;
        const availableForText = Math.max(0, container.clientWidth - reserved);

        textEl.style.whiteSpace = "nowrap";
        while (textEl.scrollWidth > availableForText && size > min) {
            size -= 0.5;
            textEl.style.fontSize = `${size}px`;
        }

        setFontSize(size);
    };

    useLayoutEffect(() => {
        fit();
        const ro = new ResizeObserver(fit);
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [text, max, min, gap, iconSize, info]);

    useEffect(() => {
        const onResize = () => fit();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    return (
        <div
            ref={containerRef}
            className="flex items-center w-full min-w-0"
            style={{ lineHeight: 1.35 }}
        >
            <span
                ref={textRef}
                style={{
                    fontSize,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
                className="min-w-0"
            >
                {text}
            </span>

            {info && (
                <Tooltip
                    title={info}
                    arrow
                    placement="top"
                    componentsProps={{
                        tooltip: {
                            sx: {
                                backgroundColor: "#ffffff",
                                color: "#333",
                                fontSize: "10px",
                                padding: "10px 15px",
                                borderRadius: "8px",
                                boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                            },
                        },
                        arrow: { sx: { color: "#ffffff" } },
                    }}
                >
                    <div
                        className="flex-shrink-0"
                        style={{
                            width: iconSize,
                            height: iconSize,
                            marginLeft: gap,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transform: "translateY(1px)",
                            cursor: "pointer",
                        }}
                    >
                        <Image
                            src="/agencyIcons/InfoIcon.jpg"
                            alt="info"
                            width={iconSize}
                            height={iconSize}
                            className="rounded-full"
                        />
                    </div>
                </Tooltip>
            )}
        </div>
    );
};

export default FeatureLine;
