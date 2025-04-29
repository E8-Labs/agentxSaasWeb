import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, CircularProgress, TextField } from "@mui/material";
import { useRouter } from "next/navigation";

const boxVariants = {
    enter: (direction) => ({
        x: direction > 0 ? "100%" : "-100%",
        opacity: 0.4,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction) => ({
        x: direction < 0 ? "100%" : "-100%",
        opacity: 0.4,
    }),
};

export default function SlideModal() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(1);

    const handleContinue = () => {
        setDirection(1);
        setCurrentIndex((prevIndex) => prevIndex + 1);
    };

    const handleBack = () => {
        setDirection(-1);
        setCurrentIndex((prevIndex) => prevIndex - 1);
    };

    return (
        <div className="relative flex justify-center items-center">
            <AnimatePresence initial={false} custom={direction}>
                {currentIndex === 0 && (
                    <motion.div
                        key="box1"
                        custom={direction}
                        variants={boxVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="p-8 rounded-lg w-96 shadow-lg bg-red"
                    >
                        <h2 className="text-lg font-bold text-center">Step 1: Create Account</h2>
                        <TextField
                            label="Username"
                            fullWidth
                            variant="outlined"
                            className="mt-4"
                        />
                        <Button
                            className="w-full mt-6 bg-purple text-white"
                            onClick={handleContinue}
                        >
                            Continue
                        </Button>
                    </motion.div>
                )}

                {currentIndex === 1 && (
                    <motion.div
                        key="box2"
                        custom={direction}
                        variants={boxVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="p-8 rounded-lg w-96 shadow-lg"
                    >
                        <h2 className="text-lg font-bold text-center">Step 2: Set Your Email</h2>
                        <TextField
                            label="Email"
                            fullWidth
                            variant="outlined"
                            className="mt-4"
                        />
                        <Button
                            className="w-full mt-6 bg-purple text-white"
                            onClick={handleContinue}
                        >
                            Continue
                        </Button>
                        <Button
                            className="w-full mt-2 text-purple"
                            onClick={handleBack}
                        >
                            Back
                        </Button>
                    </motion.div>
                )}

                {currentIndex === 2 && (
                    <motion.div
                        key="box3"
                        custom={direction}
                        variants={boxVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="p-8 rounded-lg w-96 shadow-lg"
                    >
                        <h2 className="text-lg font-bold text-center">Step 3: Set Password</h2>
                        <TextField
                            label="Password"
                            fullWidth
                            type="password"
                            variant="outlined"
                            className="mt-4"
                        />
                        <Button
                            className="w-full mt-6 bg-purple text-white"
                            onClick={() => {
                                console.log("Account Created");
                            }}
                        >
                            Finish
                        </Button>
                        <Button
                            className="w-full mt-2 text-purple"
                            onClick={handleBack}
                        >
                            Back
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
