import Image from "next/image";

const VideoCard = ({ playVideo, horizontal = true, title }) => {
  return (
    <div
      className={`flex  ${
        horizontal ? "flex-row items-center" : "flex-col items-start"
      } p-4 bg-white rounded-lg border border-brdColor max-w-md cursor-pointer `}
      onClick={() => {
        playVideo();
      }}
    >
      {/* Video Thumbnail */}
      <div className="w-full flex flex-row items-end gap-2">
        <div className={"relative w-[6vw] h-[10vh] flex-shrink-0"}>
          <Image
            src="/assets/youtubeplay.png" // Replace with your image path
            alt="Video thumbnail"
            layout="fill"
            className={"rounded-lg object-cover"}
          />
          {/* Play Icon */}
          {/* <div className="absolute inset-0  bg-black bg-opacity-50 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132a1 1 0 00-1.555.832v4.264a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
            </svg>
          </div> */}
        </div>
        <div className="flex px-2 py-1 flex-col justify-center items-center rounded-full border border-brdColor">
          <p className="text-sm text-gray-600">2mins</p>
        </div>
      </div>

      {/* Content Section */}
      <div className={`flex flex-col items-start  justify-left`}>
        <h3
          className="  font-medium text-gray-800 pt-1" //text-sm xl:text-lg
          style={{ fontSize: "15px" }}
        >
          {/* Learn how to add calendar */}
          {title}
        </h3>
      </div>
    </div>
  );
};

export default VideoCard;
