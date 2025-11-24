import Image from 'next/image'

/**
 * Formats duration string to mm:ss format
 * Handles formats like:
 * - "16 min 30 sec" -> "16:30"
 * - "1 min 38 sec" -> "1:38"
 * - "2 mins" -> "2:00"
 * - "2 mins 5 sec" -> "2:05"
 */
const formatDuration = (duration) => {
  if (!duration || typeof duration !== 'string') {
    return duration || '0:00'
  }

  // Extract minutes and seconds using regex
  const minMatch = duration.match(/(\d+)\s*(?:min|mins|minute|minutes)/i)
  const secMatch = duration.match(/(\d+)\s*(?:sec|secs|second|seconds)/i)

  const minutes = minMatch ? parseInt(minMatch[1], 10) : 0
  const seconds = secMatch ? parseInt(secMatch[1], 10) : 0

  // Format as mm:ss
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const VideoCard = ({
  playVideo,
  horizontal = true,
  title,
  duration = '2 mins',
  width = '80',
  height = '180',
}) => {
  const formattedDuration = formatDuration(duration)
  return (
    <div
      className={`flex ${
        horizontal ? 'flex-row items-center' : 'flex-col items-start'
      } 
    p-4 rounded-lg border border-brand-primary max-w-md cursor-pointer bg-white`}
      onClick={() => {
        playVideo()
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
              height={20}
              width={20}
              alt="*"
            />

            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: 'black',
              }}
            >
              Show me how!
            </div>
          </div>
        </div>

        <div className="flex px-2 py-1 rounded-full border min-w-[40px] border-brdColor ">
          <p className="text-sm md:text-xs text-gray-600">{duration}</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col items-start gap-3">
        <h3
          className="font-medium text-gray-800 pt-1"
          style={{ fontSize: '15px' }}
        >
          {title}
        </h3>
      </div>
    </div>
  )
}

export default VideoCard
