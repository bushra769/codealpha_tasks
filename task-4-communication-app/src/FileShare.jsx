import { useState } from "react";

function FileShare() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDownload = () => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = file.name;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="file-share">
      <h2>📁 File Sharing</h2>

      <input type="file" onChange={handleFileChange} />

      {file && (
        <div className="file-info">
          <p>
            <strong>File:</strong> {file.name}
          </p>

          <p>
            <strong>Size:</strong>{" "}
            {(file.size / 1024).toFixed(2)} KB
          </p>

          <button onClick={handleDownload}>
            Download File
          </button>
        </div>
      )}
    </div>
  );
}

export default FileShare;