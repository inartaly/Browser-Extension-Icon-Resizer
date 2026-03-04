const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const outputContainer = document.getElementById('output-container');
const sizes = [16, 32, 48, 128];

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
            sizes.forEach(size => createIcon(img, size));
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

    const dataUrl = canvas.toDataURL('image/png');
    const card = document.createElement('div');
    card.className = 'icon-card';
    card.innerHTML = `
        <img src="${dataUrl}" width="${size > 48 ? 48 : size}" alt="${size}">
        <div style="font-size: 12px; margin-bottom: 10px;">${size}x${size}</div>
        <a href="${dataUrl}" download="icon${size}.png" class="download-btn">Download</a>
    `;
    outputContainer.appendChild(card);
}
