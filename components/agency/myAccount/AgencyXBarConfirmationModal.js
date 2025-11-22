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
import React from 'react'

export default function AgencyXBarConfirmationModal({
  plan,
  open,
  onClose,
  onConfirm,
}) {
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
        X Bar Services
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
            // borderColor: "#ddd",
            border: 'none',
            color: '#000',
            fontWeight: 'bold',
            textTransform: 'none',
            paddingY: '0.8rem',
            borderRadius: '10px',
            width: '45%',
          }}
        >
          Cancel
        </Button>

        {/* <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            backgroundColor: "#7902DF",
            fontWeight: "bold",
            textTransform: "none",
            borderRadius: "10px",
            width: "45%",
            paddingY: "0.8rem",
            "&:hover": { backgroundColor: "#6901C3" },
          }}
        >
          Continue
        </Button> */}

        <div
          className="cursor-pointer w-[45%] flex justify-center items-center bg-purple font-bold rounded-lg text-white text-center py-3"
          onClick={onConfirm}
          style={{
            borderColor: '#ddd',
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
