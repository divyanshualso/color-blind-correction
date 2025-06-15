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
            originalCanvas.width = correctedCanvas.width = img.width;
            originalCanvas.height = correctedCanvas.height = img.height;
            oCtx.drawImage(img, 0, 0);
            correctImage(img);
        };
        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
}

/*function correctImage(img) {
    oCtx.drawImage(img, 0, 0);
    const frame = oCtx.getImageData(0, 0, img.width, img.height);
    const type = typeSelect.value;
    const data = frame.data;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

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
*/function correctImage(img) {
    oCtx.drawImage(img, 0, 0);
    const frame = oCtx.getImageData(0, 0, img.width, img.height);
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

    const m = matrices[type];

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

    cCtx.putImageData(frame, 0, 0);
}
