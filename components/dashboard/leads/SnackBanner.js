export default function SnackBanner({
  title = null,
  message = DefaultMessage,
  type = SnackbarTypes.Error,
  time = 4000,
  isVisible,
  hide,
}) {
  // //console.log;
  // //console.log;
  // //console.log;
  function GetIcon() {
    if (type == SnackbarTypes.Error) {
      return '/assets/salmanassets/danger_conflict.svg'
    }
    if (type == SnackbarTypes.Success) {
      return '/svgIcons/successMsgIcon.svg'
    }
    if (type == SnackbarTypes.Warning) {
      return '/assets/salmanassets/danger_conflict.svg'
    }
    if (type == SnackbarTypes.Loading) {}

    return '/assets/salmanassets/danger_conflict.svg'
  }

  //code to hide after timer

  // useEffect(() => {
  //   // //console.log;

  //   if (isVisible) {
  //     let timer = setTimeout(() => {
  //       // setErrorMessage(null);
  //       // //console.log;
  //       hide();
  //     }, time);
  //     return () => {
  //       // //console.log;
  //       clearTimeout(timer);
  //     };
  //   }

  // }, [isVisible]);

  return (
    isVisible && (
      <div
        className="flex items-center justify-center  w-full z-[99999]"
        style={{
          position: 'absolute',
          left: '50%',
          translate: '-50%',
          top: 10,
          // display: isVisible ? "flex" : "hidden",
        }}
      >
        <div
          className="flex items-center space-x-4 p-2 bg-white  rounded-md shadow-md"
          style={{ width: 'fit-content' }}
        >
          {/* Icon Section */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-full">
              <img src={GetIcon()}></img>
            </div>
          </div>

          {/* Text Section */}
          <div style={{ width: 'fit-content' }}>
            {/* {title && ( */}
            <h3 className="text-lg font-semibold text-gray-900">
              {title || message}
            </h3>
            {/* // )} */}
            <p
              className={`${!title ? 'text-lg' : 'text-sm'} text-gray-600`}
              style={{
                fontWeight: !title ? '600' : '500',
              }}
            >
              {title && message}
            </p>
          </div>
        </div>
      </div>
    )
  )
}
