import CloseIcon from '@mui/icons-material/Close'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'

export default function XBarConfirmationModal({
  plan,
  open,
  onClose,
  onConfirm,
  xbarTitle: propXbarTitle, // Optional prop
}) {
  const [xbarTitle, setXbarTitle] = useState(propXbarTitle || 'X Bar Services')

  // Get Xbar title from branding if not provided as prop
  useEffect(() => {
    if (propXbarTitle) {
      setXbarTitle(propXbarTitle)
      return
    }
    
    const getXbarTitle = () => {
      try {
        const storedBranding = localStorage.getItem('agencyBranding')
        if (storedBranding) {
          const branding = JSON.parse(storedBranding)
          if (branding?.xbarTitle) {
            setXbarTitle(branding.xbarTitle)
            return
          }
        }
        // Fallback: check user data
        const userData = localStorage.getItem('User')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          const branding = parsedUser?.user?.agencyBranding || parsedUser?.agencyBranding
          if (branding?.xbarTitle) {
            setXbarTitle(branding.xbarTitle)
            return
          }
        }
      } catch (error) {}
      // Default title
      setXbarTitle('X Bar Services')
    }
    
    getXbarTitle()
    
    // Listen for branding updates
    const handleBrandingUpdate = () => {
      getXbarTitle()
    }
    window.addEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    
    return () => {
      window.removeEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    }
  }, [propXbarTitle])
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          padding: '20px',
          width: '500px',
          maxWidth: '90%',
          //   textAlign: "center",
        },
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Modal Title */}
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '18px', mt: 1 }}>
        {xbarTitle}
      </DialogTitle>

      {/* Modal Content */}
      <DialogContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          Confirm <span style={{ color: 'black' }}>{`${plan}`}</span>
        </Typography>
        <Typography sx={{ color: '#000', fontSize: '16px' }}>
          {`Please confirm you’d like to proceed with the service option you’ve
          selected.`}
        </Typography>
      </DialogContent>

      {/* Buttons */}
      <DialogActions sx={{ justifyContent: 'center', gap: 2, mt: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: 'hsl(var(--brand-primary))',
            color: 'hsl(var(--brand-primary))',
            fontWeight: 'bold',
            textTransform: 'none',
            paddingY: '0.8rem',
            borderRadius: '10px',
            width: '45%',
            '&:hover': {
              borderColor: 'hsl(var(--brand-primary))',
              backgroundColor: 'hsl(var(--brand-primary) / 0.05)',
              color: 'hsl(var(--brand-primary))',
            },
          }}
        >
          Cancel
        </Button>

        <div
          className="cursor-pointer w-[45%] flex justify-center items-center bg-brand-primary font-bold rounded-lg text-white text-center py-3"
          onClick={onConfirm}
          style={{
            color: '#fff',
            fontWeight: 'bold',
            textTransform: 'none',
            padding: '0.8rem',
            borderRadius: '10px',
            width: '45%',
          }}
        >
          Continue
        </div>
      </DialogActions>
    </Dialog>
  )
}
