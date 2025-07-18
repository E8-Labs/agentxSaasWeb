import React, { useState } from "react";
import { Button, Menu, MenuItem, Typography, IconButton } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { CaretDown, CaretUp } from "@phosphor-icons/react";

const examples = [
    {
        id: 1,
        text: "Hey Brian! This is Jane from company_name. I see that you weren't able to make it for your appointment. Would you like to reschedule? - https://www.mycompany.com/book. Reply STOP to unsubscribe.",
    },
    {
        id: 2,
        text: "Hello, this is Dr. Lea. We are confirming your appointment tomorrow at 9 am. Reply STOP to cancel.",
    }
];

const ExamplesComponent = () => {

    const [anchorEl, setAnchorEl] = useState(null);
    const [copiedIdx, setCopiedIdx] = useState(null);

    const handleOpen = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => {
        setAnchorEl(null);
        // setTimeout(() => setCopiedIdx(null), 500); // Optionally reset after closing
    };

    const handleCopy = (text, idx) => {
        navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 1500);
        handleClose();
    };

    const styles = {
        regularFont: {
            fontWeight: "400",
            fontSize: 15,
        },
        normalFont: {
            fontWeight: "500",
            fontSize: 15,
        },
        semiBold: {
            fontWeight: "600",
            fontSize: 15,
        }
    }

    return (
        <div>
            <button className="flex flex-row items-center gap-2" onClick={handleOpen}>
                <div
                    style={styles.regularFont}
                    className="cursor-pointer text-violet-blue underline"
                >
                    See Example
                </div>
                {
                    anchorEl ? (
                        <CaretUp size={16} className="text-[#5B0EFF]" />
                    ) : (
                        <CaretDown size={16} className="text-[#5B0EFF]" />
                    )
                }
            </button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left", // Anchor to the left of the button
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left", // Menu appears to the left
                }}
            >
                {examples.map((example) => (
                    <MenuItem
                        key={example.id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            maxWidth: 350,
                            whiteSpace: "normal",
                        }}
                    >
                        <Typography variant="body2" style={{ flex: 1 }}>
                            {example.text}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={() => handleCopy(example.text, example.id)}
                            aria-label="Copy"
                        >
                            {copiedIdx === example.id ? (
                                <CheckIcon color="success" fontSize="small" />
                            ) : (
                                <ContentCopyIcon fontSize="small" />
                            )}
                        </IconButton>
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
}

export default ExamplesComponent;