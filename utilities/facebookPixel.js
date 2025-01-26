import ReactPixel from "react-facebook-pixel";

export const initFacebookPixel = (pixelId) => {
  if (typeof window !== "undefined") {
    ReactPixel.init(pixelId);
    ReactPixel.pageView(); // Trigger an initial page view
  }
};

export const trackEvent = (event, data) => {
  if (typeof window !== "undefined") {
    ReactPixel.track(event, data);
  }
};
