const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const outputContainer = document.getElementById('output-container');
const downloadZipBtn = document.getElementById('download-zip');
const sizes = [16, 32, 48, 128];
let iconBlobs = {}; 

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#58a6ff'; });
dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#30363d'; });
dropZone.addEventListener('drop', (e) => { e.preventDefault(); processFiles(e.dataTransfer.files); });
fileInput.addEventListener('change', (e) => processFiles(e.target.files));

function processFiles(files) {
    if (files.length === 0) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            outputContainer.innerHTML = ''; 
            iconBlobs = {}; 
            sizes.forEach(size => createIcon(img, size));
            downloadZipBtn.style.display = 'block';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(files[0]);
}

function createIcon(img, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, size, size);

    // Save for ZIP
    canvas.toBlob((blob) => {
        iconBlobs[`icon${size}.png`] = blob;
    }, 'image/png');

    // UI Preview
    const dataUrl = canvas.toDataURL('image/png');
    const card = document.createElement('div');
    card.className = 'icon-card';
    card.innerHTML = `<img src="${dataUrl}" width="${size > 48 ? 48 : size}"><br><small>${size}x${size}</small>`;
    outputContainer.appendChild(card);
}

downloadZipBtn.addEventListener('click', async () => {
    const zip = new JSZip();
    const iconFolder = zip.folder("icons");

    for (const [name, blob] of Object.entries(iconBlobs)) {
        iconFolder.file(name, blob);
    }

    const manifest = {
        "manifest_version": 3,
        "name": "My Extension",
        "version": "1.0",
        "icons": { "16": "icons/icon16.png", "32": "icons/icon32.png", "48": "icons/icon48.png", "128": "icons/icon128.png" },
        "action": { "default_popup": "popup.html" }
    };

    zip.file("manifest.json", JSON.stringify(manifest, null, 2));
    zip.file("popup.html", "<html><body style='width:200px'><h2>Extension Pop-up</h2></body></html>");

    const content = await zip.generateAsync({type:"blob"});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = "extension-boilerplate.zip";
    link.click();
});
