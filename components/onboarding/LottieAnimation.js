import React, { useRef } from 'react';
import Lottie from "lottie-react";

const LottieAnimation = () => {

    const lottieRef = useRef();

    return (
        <div>
            <Lottie
                animationData={require("/public/congratsanimation.json")}
                lottieRef={lottieRef}
                loop={true}
                style={{ height: "250px", width: "250px" }}
                onComplete={() => {
                    lottieRef.current.goToAndStop(3, true);
                }}
            />
        </div>
    )
}

export default LottieAnimation