import { useEffect, useState } from "react";

export default function BackgroundVideo({
  showImageOnly = false,
  imageUrl = "/assets/background.png",
}) {
  const [isVideoSupported, setIsVideoSupported] = useState(false);

  useEffect(() => {
    const checkVideoAutoplaySupport = async () => {
      // if (showImageOnly) {
      //   setIsVideoSupported(false);
      //   return;
      // }
      const video = document.createElement("video");
      video.src = "/banerVideo.mp4"; // Replace with your video path
      video.muted = true; // Autoplay requires the video to be muted
      video.playsInline = true;

      try {
        await video.play();
        video.remove(); // Remove the test video element
        setIsVideoSupported(true); // Autoplay supported
        // //console.log;
      } catch {
        video.remove();
        setIsVideoSupported(false); // Autoplay not supported
        // //console.log;
      }
    };

    checkVideoAutoplaySupport();
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden ">
      {!showImageOnly && isVideoSupported ? (
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
            backgroundImage: `url('${imageUrl}')`, // Replace with your image path
          }}
        />
      )}
    </div>
  );
}
