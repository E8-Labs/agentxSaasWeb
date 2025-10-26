import { toast } from "sonner";

// Custom toast function that mimics AgentSelectSnackMessage styling
export const customToast = {
  success: (message) => {
    toast.success(message, {
      icon: (
        <div className="w-10 h-10 flex items-center justify-center rounded-full">
          <img src="/svgIcons/successMsgIcon.svg" alt="Success" className="w-6 h-6" />
        </div>
      ),
      duration: 4000,
    });
  },

  error: (message) => {
    toast.error(message, {
      icon: (
        <div className="w-10 h-10 flex items-center justify-center rounded-full">
          <img src="/assets/salmanassets/danger_conflict.svg" alt="Error" className="w-6 h-6" />
        </div>
      ),
      duration: 4000,
    });
  },

  warning: (message) => {
    toast.warning(message, {
      icon: (
        <div className="w-10 h-10 flex items-center justify-center rounded-full">
          <img src="/assets/salmanassets/danger_conflict.svg" alt="Warning" className="w-6 h-6" />
        </div>
      ),
      duration: 4000,
    });
  },

  info: (message) => {
    toast.info(message, {
      icon: (
        <div className="w-10 h-10 flex items-center justify-center rounded-full">
          <img src="/assets/salmanassets/danger_conflict.svg" alt="Info" className="w-6 h-6" />
        </div>
      ),
      duration: 4000,
    });
  },
};
