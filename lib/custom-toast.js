import Image from "next/image";
import { toast } from "sonner";

// Custom toast function that mimics AgentSelectSnackMessage styling with icons
export const customToast = {
  success: (message) => {
    toast.custom(() => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 8px 4px 4px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: 'fit-content'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          borderRadius: '50%'
        }}>
          <Image src="/svgIcons/successMsgIcon.svg" alt="Success" width={32} height={32} />
        </div>
        <p style={{ color: 'black', fontWeight: '500', fontSize: '16px', margin: 0 }}>{message}</p>
      </div>
    ), {
      duration: 4000,
    });
  },

  error: (message) => {
    toast.custom(() => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 8px 4px 4px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: 'fit-content'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fee2e2',
          borderRadius: '50%'
        }}>
          <img src="/assets/salmanassets/danger_conflict.svg" alt="Error" style={{ width: '32px', height: '32px' }} />
        </div>
        <p style={{ color: 'black', fontWeight: '500', fontSize: '16px', margin: 0 }}>{message}</p>
      </div>
    ), {
      duration: 4000,
    });
  },

  warning: (message) => {
    toast.custom(() => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 8px 4px 4px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: 'fit-content'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fee2e2',
          borderRadius: '50%'
        }}>
          <img src="/assets/salmanassets/danger_conflict.svg" alt="Warning" style={{ width: '32px', height: '32px' }} />
        </div>
        <p style={{ color: 'black', fontWeight: '500', fontSize: '16px', margin: 0 }}>{message}</p>
      </div>
    ), {
      duration: 4000,
    });
  },

  info: (message) => {
    toast.custom(() => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 8px 4px 4px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: 'fit-content'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fee2e2',
          borderRadius: '50%'
        }}>
          <img src="/assets/salmanassets/danger_conflict.svg" alt="Info" style={{ width: '32px', height: '32px' }} />
        </div>
        <p style={{ color: 'black', fontWeight: '500', fontSize: '16px', margin: 0 }}>{message}</p>
      </div>
    ), {
      duration: 4000,
    });
  },
};
