import { createTheme, ThemeProvider } from "@mui/material/styles";
import { TextField, InputAdornment } from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import Image from "next/image";
// import image from ""

export function Searchbar({
  value,
  setValue,
  placeholder = "Search by name, email or phone",
}) {
  return (
    <div className="flex flex-row items-center gap-1 sm:w-[22vw] h-[50px] flex-shrink-0 border rounded-full pe-4">
      <input
        style={{
          fontWeight: "500",
          fontSize: 15,
        }}
        className="outline-none border-none w-full bg-transparent focus:outline-none focus:ring-0"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const value = e.target.value;
          setValue(e.target.value);
          //   handleSearchChange(value);
        }}
      />
      <button className="outline-none border-none">
        <Image src={"/assets/searchIcon.png"} height={24} width={24} alt="*" />
      </button>
    </div>
  );
}
