import { useEffect, useState } from "react";

export default function BackgroundVideo({ height = 100 }) {
  const [isVideoSupported, setIsVideoSupported] = useState(false);

  useEffect(() => {
    const checkVideoAutoplaySupport = async () => {
      const video = document.createElement("video");
      video.src = "/banerVideo.mp4"; // Replace with your video path
      video.muted = true; // Autoplay requires the video to be muted
      video.playsInline = true;

      try {
        await video.play();
        video.remove(); // Remove the test video element
        setIsVideoSupported(true); // Autoplay supported
      } catch {
        video.remove();
        setIsVideoSupported(false); // Autoplay not supported
      }
    };

    checkVideoAutoplaySupport();
  }, []);

  return (
    <div className={`relative w-full h-screen overflow-hidden`}>
      {isVideoSupported ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/banerVideo.mp4" type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/background.png')", // Replace with your image path
          }}
        />
      )}
    </div>
  );
}
