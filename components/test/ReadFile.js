import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";

const ReadFile = () => {
    const onDrop = useCallback((acceptedFiles) => {
        // Handle each file
        acceptedFiles.forEach((file) => {
            const reader = new FileReader();

            // When the file is read, process its content
            reader.onload = (event) => {
                const binaryStr = event.target.result;

                // Use XLSX to parse the file
                const workbook = XLSX.read(binaryStr, { type: "binary" });

                // Extract data from the first sheet
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet);

               // console.log("Parsed data:", data);
            };

            // Read the file as binary string
            reader.readAsBinaryString(file);
        });
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "text/csv": [".csv"],
            "application/vnd.ms-excel": [".xls", ".xlsx"],
        },
    });

    return (
        <div
            {...getRootProps()}
            style={{
                border: "2px dashed #ddd",
                padding: "20px",
                textAlign: "center",
                borderRadius: "10px",
                cursor: "pointer",
                width: "400px",
                margin: "auto",
            }}
        >
            <input {...getInputProps()} />
            <div style={{ marginBottom: "10px" }}>
                <img
                    src="/upload-icon.svg"
                    alt="Upload Icon"
                    style={{ width: "50px", marginBottom: "10px" }}
                />
            </div>
            <p style={{ fontSize: "16px", fontWeight: "bold" }}>
                Drag & drop your leads
            </p>
            <p>or</p>
            <button
                style={{
                    backgroundColor: "#007BFF",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    padding: "10px 20px",
                    cursor: "pointer",
                }}
            >
                Browse your Computer
            </button>
            <p style={{ fontSize: "14px", color: "#888", marginTop: "10px" }}>
                Upload only a CSV or Excel file
            </p>
        </div>
    );
};

export default ReadFile;
