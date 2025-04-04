import Image from "next/image";

const VideoCard = ({
  playVideo,
  horizontal = true,
  title,
  duration = "2 mins",
  width = "80",
  height = "150",
}) => {
  return (
    <div
      className={`flex ${
        horizontal ? "flex-row items-center" : "flex-col items-start"
      } 
    p-4 rounded-lg border border-purple max-w-md cursor-pointer bg-white`}
      onClick={() => {
        playVideo();
      }}
    >
      {/* Video Thumbnail */}
      <div className="flex flex-row items-end gap-4">
        <div className="relative flex-shrink-0">
          <Image
            src="/assets/youtubeplay.png"
            alt="Video thumbnail"
            width={parseInt(width, 10)}
            height={parseInt(height, 10)}
            priority
            className="rounded-lg object-cover"
          />
        </div>

        {/* Duration div */}
        <div className="flex px-2 py-1 flex-col justify-center items-center rounded-full border border-brdColor lg:block hidden min-w-[80px]">
          <p className="text-sm md:text-xs text-gray-600">{duration}</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col items-start mt-2">
        <h3
          className="font-medium text-gray-800 pt-1"
          style={{ fontSize: "15px" }}
        >
          {title}
        </h3>
      </div>
    </div>
  );
};

export default VideoCard;
