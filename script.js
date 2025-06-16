const imageUpload = document.getElementById("imageUpload");
const typeSelect = document.getElementById("blindType");
const originalCanvas = document.getElementById("originalCanvas");
const correctedCanvas = document.getElementById("correctedCanvas");
const oCtx = originalCanvas.getContext("2d");
const cCtx = correctedCanvas.getContext("2d");

imageUpload.addEventListener("change", handleImageUpload);

function handleImageUpload(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const scale = 0.75; 
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;

            originalCanvas.width = correctedCanvas.width = scaledWidth;
            originalCanvas.height = correctedCanvas.height = scaledHeight;

            oCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
            correctImage(scaledWidth, scaledHeight);
        };
        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
}

function correctImage(width, height) {
    const frame = oCtx.getImageData(0, 0, width, height);
    const type = typeSelect.value;
    const data = frame.data;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i], g = data[i + 1], b = data[i + 2];

        if (type === 'protanopia') {
            data[i] = 0.56667 * r + 0.43333 * g;
            data[i + 1] = 0.55833 * r + 0.44167 * g;
            data[i + 2] = b;
        } else if (type === 'deuteranopia') {
            data[i] = 0.625 * r + 0.375 * g;
            data[i + 1] = 0.7 * r + 0.3 * g;
            data[i + 2] = b;
        } else if (type === 'tritanopia') {
            data[i] = r;
            data[i + 1] = 0.95 * g + 0.05 * b;
            data[i + 2] = 0.433 * g + 0.567 * b;
        }
    }

    cCtx.putImageData(frame, 0, 0);
}
