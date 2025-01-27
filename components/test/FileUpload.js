import Image from "next/image";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

const FileUpload = () => {
    const onDrop = useCallback((acceptedFiles) => {
       // console.log(acceptedFiles);
        // Handle the uploaded files
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
            <div className="w-full flex-row flex justify-center" style={{ marginBottom: "10px" }}>
                <Image
                    src="/assets/docIcon.png"
                    alt="Upload Icon"
                    height={30}
                    width={30}
                    style={{ marginBottom: "10px" }}
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

export default FileUpload;
