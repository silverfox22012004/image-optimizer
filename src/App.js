import React, { useState, useRef } from "react";

import "./App.css";

function App() {
  const [progress, setProgress] = useState(0);

  const [darkMode, setDarkMode] = useState(true);

  const [imageFile, setImageFile] = useState(null);
  const [originalPreview, setOriginalPreview] = useState(null);
  const [convertedPreview, setConvertedPreview] = useState(null);

  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [originalWidth, setOriginalWidth] = useState(null);
  const [originalHeight, setOriginalHeight] = useState(null);

  const [lockRatio, setLockRatio] = useState(true);
  const [format, setFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(80);

  const [originalSizeKB, setOriginalSizeKB] = useState(null);
  const [finalSizeKB, setFinalSizeKB] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isReadyForDownload, setIsReadyForDownload] = useState(false);

  const canvasRef = useRef(null);

  const toKB = (bytes) => (bytes / 1024).toFixed(2);
React.useEffect(() => {
  const handleKey = (e) => {
    if (e.key === "Enter" && !isProcessing && imageFile) {
      processImage();
    }
  };
  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}, [isProcessing, imageFile, width, height, quality, format]);

  /* ---------- FILE HANDLING ---------- */
  const handleFile = (file) => {
    if (!file) return;

    setImageFile(file);
    setOriginalSizeKB(toKB(file.size));

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      setOriginalPreview(img.src);
      setWidth(img.width);
      setHeight(img.height);
      setOriginalWidth(img.width);
      setOriginalHeight(img.height);
    };

    setConvertedPreview(null);
    setFinalSizeKB(null);
    setIsReadyForDownload(false);
  };

  /* ---------- ASPECT RATIO ---------- */
  const handleWidthChange = (e) => {
    const newWidth = e.target.value;
    setWidth(newWidth);
    if (lockRatio && originalWidth && originalHeight) {
      setHeight(Math.round(newWidth / (originalWidth / originalHeight)));
    }
  };

  const handleHeightChange = (e) => {
    const newHeight = e.target.value;
    setHeight(newHeight);
    if (lockRatio && originalWidth && originalHeight) {
      setWidth(Math.round(newHeight * (originalWidth / originalHeight)));
    }
  };

  /* ---------- PROCESS ---------- */
const processImage = async () => {
  if (!imageFile) return;

  setIsProcessing(true);
  setProgress(0);

  const img = new Image();
  img.src = originalPreview;
  await new Promise((res) => (img.onload = res));

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  setProgress(40);

  const dataUrl = canvas.toDataURL(format, quality / 100);
  setProgress(70);

  const blob = await (await fetch(dataUrl)).blob();
  setProgress(90);

  setConvertedPreview(URL.createObjectURL(blob));
  setFinalSizeKB(toKB(blob.size));

  setProgress(100);
  setIsProcessing(false);
  setIsReadyForDownload(true);
};


  /* ---------- DOWNLOAD ---------- */
  const download = () => {
    const link = document.createElement("a");
    link.href = convertedPreview;
    link.download = `optimized.${format.split("/")[1]}`;
    link.click();
  };

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      <header className="header">
        <h1>Image Optimizer By Aryan For Chhotu Chacha</h1>
        <button className="toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌙 Dark" : "☀️ Light"}
        </button>
      </header>

      <div className="card">
        <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} />

        {originalPreview && (
          <>
            <div className="preview-grid">
              <div>
                <h3>Original</h3>
                <img src={originalPreview} />
                <p>{originalSizeKB} KB</p>
              </div>

            <div>
              <h3>Optimized</h3>

              {isProcessing ? (
                <div className="skeleton"></div>
              ) : convertedPreview ? (
                <>
                  <img key={convertedPreview} src={convertedPreview} />
                  <p>{finalSizeKB} KB</p>
                </>
              ) : (
                <div className="placeholder">Not processed</div>
              )}
            </div>

            </div>

            <div className="controls">
              <div>
                <label>Width</label>
                <input type="number" value={width} onChange={handleWidthChange} />
              </div>

              <div>
                <label>Height</label>
                <input type="number" value={height} onChange={handleHeightChange} />
              </div>

              <div className="checkbox">
                <input type="checkbox" checked={lockRatio} onChange={(e) => setLockRatio(e.target.checked)} />
                <span>Lock Ratio</span>
              </div>

              <div>
                <label>Format</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)}>
                  <option value="image/jpeg">JPG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WEBP</option>
                </select>
              </div>

              <div>
                <label>Quality: {quality}%</label>
                <input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(e.target.value)} />
              </div>
            </div>

            <div className="actions">
              <button onClick={processImage}>
               {isProcessing ? (
                <div
                  className="progress-ring"
                  style={{ "--progress": progress }}
                >
                  <span>{progress}%</span>
                </div>
              ) : (
                "Optimize"
              )}

              </button>
              <button disabled={!isReadyForDownload} onClick={download}>
                Download
              </button>
            </div>
          </>
        )}

        <canvas ref={canvasRef} hidden />
      </div>
    </div>
  );
}

export default App;
