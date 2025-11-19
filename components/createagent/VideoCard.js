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
      className={`flex ${horizontal ? "flex-row items-center" : "flex-col items-start"
        } 
    p-4 rounded-lg border border-purple max-w-md cursor-pointer bg-white`}
      onClick={() => {
        playVideo();
      }}
    >
      {/* Video Thumbnail */}
      <div className="flex flex-row items-start justify-between w-full">
        <div className="flex flex-row items-end gap-2">
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
          <div className="flex flex-row items-center gap-2 p-1 bg-[#00000010] rounded-lg">
            <Image
              src={'/svgIcons/youtube.svg'}
              height={20} width={20} alt="*"
            />

            <div style={{
              fontSize: 12, fontWeight: 500, color: "black"
            }}>
              Show me how!
            </div>
          </div>

        </div>

        <div className="flex px-2 py-1 rounded-full border min-w-[50px] border-brdColor ">
          <p className="text-sm md:text-xs text-gray-600">{duration}</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col items-start gap-3">
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
