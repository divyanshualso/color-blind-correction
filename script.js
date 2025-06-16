/* Using second code with Daltonization, added error handling to fix rendering issue */
const imageUpload = document.getElementById("imageUpload");
const typeSelect = document.getElementById("blindType");
const originalCanvas = document.getElementById("originalCanvas");
const correctedCanvas = document.getElementById("correctedCanvas");
const oCtx = originalCanvas && originalCanvas.getContext("2d");
const cCtx = correctedCanvas && correctedCanvas.getContext("2d");

if (!imageUpload || !typeSelect || !originalCanvas || !correctedCanvas || !oCtx || !cCtx) {
  console.error("One or more DOM elements or canvas contexts are missing. Check HTML IDs and canvas support.");
} else {
  imageUpload.addEventListener("change", handleImageUpload);
}

function handleImageUpload(e) {
  try {
    const file = e.target.files[0];
    if (!file) {
      console.error("No file selected.");
      return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
      try {
        const img = new Image();
        img.onload = function() {
          const scale = 0.75;
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;

          originalCanvas.width = correctedCanvas.width = scaledWidth;
          originalCanvas.height = correctedCanvas.height = scaledHeight;

          // Draw original image first
          oCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
          console.log("Original image drawn successfully.");

          // Attempt correction
          correctImage(img, scaledWidth, scaledHeight, cCtx);
        };
        img.onerror = function() {
          console.error("Failed to load image.");
        };
        img.src = event.target.result;
      } catch (err) {
        console.error("Error loading image:", err);
      }
    };
    reader.onerror = function() {
      console.error("Failed to read file.");
    };
    reader.readAsDataURL(file);
  } catch (err) {
    console.error("Error handling file upload:", err);
  }
}

function correctImage(img, width, height, ctx) {
  try {
    oCtx.drawImage(img, 0, 0, width, height);
    const frame = oCtx.getImageData(0, 0, width, height);
    const data = frame.data;
    const type = typeSelect.value;

    // Simulation matrices for Protanopia, Deuteranopia, Tritanopia
    const matrices = {
      protanopia: [
        [0.567, 0.433, 0.0],
        [0.558, 0.442, 0.0],
        [0.0,   0.242, 0.758]
      ],
      deuteranopia: [
        [0.625, 0.375, 0.0],
        [0.7,   0.3,   0.0],
        [0.0,   0.3,   0.7]
      ],
      tritanopia: [
        [0.95,  0.05,  0.0],
        [0.0,   0.433, 0.567],
        [0.0,   0.475, 0.525]
      ]
    };

    const m = matrices[type] || matrices.protanopia; // Fallback to protanopia if type is invalid

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Simulate color blindness
      const r_blind = r * m[0][0] + g * m[0][1] + b * m[0][2];
      const g_blind = r * m[1][0] + g * m[1][1] + b * m[1][2];
      const b_blind = r * m[2][0] + g * m[2][1] + b * m[2][2];

      // Daltonization: Enhance color difference
      const dr = r - r_blind;
      const dg = g - g_blind;
      const db = b - b_blind;

      data[i]     = Math.min(255, Math.max(0, r + dr * 2));
      data[i + 1] = Math.min(255, Math.max(0, g + dg * 2));
      data[i + 2] = Math.min(255, Math.max(0, b + db * 2));
    }

    ctx.putImageData(frame, 0, 0);
    console.log("Corrected image drawn successfully for type:", type);
  } catch (err) {
    console.error("Error correcting image:", err);
  }
}
