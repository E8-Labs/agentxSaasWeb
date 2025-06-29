import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ShareIcon from "@mui/icons-material/Share";


export const AudioPlayer = ({ previewUrl }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = "voice.mp3";
    a.click();
    handleClose();
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Clipboard error:", err);
    }
    handleClose();
  };

  return (
    <>
      <IconButton onClick={handleMenuClick} size="small">
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          elevation: 2,
          sx: { mt: 1, minWidth: 160 },
        }}
      >
        <MenuItem onClick={handleDownload}>
          <FileDownloadIcon fontSize="small" style={{ marginRight: 8 }} />
          Download
        </MenuItem>
        <MenuItem onClick={handleShare}>
          <ShareIcon fontSize="small" style={{ marginRight: 8 }} />
          Share
        </MenuItem>
      </Menu>
    </>
  );
};
