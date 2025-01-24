// utils/facebookPixel.js
import ReactPixel from "react-facebook-pixel";

export const initFacebookPixel = (pixelId) => {
  ReactPixel.init(pixelId);
  ReactPixel.pageView(); // Trigger an initial page view
};

export const trackEvent = (event, data) => {
  ReactPixel.track(event, data);
};
