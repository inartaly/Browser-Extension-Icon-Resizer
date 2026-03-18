// ---------------- ICON GENERATOR ----------------

const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const outputContainer = document.getElementById("output-container");
const downloadZipBtn = document.getElementById("download-zip");
const sizes = [16, 32, 48, 128, 192, 512];
let iconBlobs = {};

dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "#58a6ff";
});
dropZone.addEventListener("dragleave", () => {
  dropZone.style.borderColor = "#30363d";
});
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  processFiles(e.dataTransfer.files);
});
fileInput.addEventListener("change", (e) => processFiles(e.target.files));

function processFiles(files) {
  if (files.length === 0) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      outputContainer.innerHTML = "";
      iconBlobs = {};
      sizes.forEach((size) => createIcon(img, size));
      downloadZipBtn.style.display = "block";
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(files[0]);
}

function createIcon(img, size) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, size, size);

  canvas.toBlob((blob) => {
    iconBlobs[`icon${size}.png`] = blob;
  }, "image/png");

  const dataUrl = canvas.toDataURL("image/png");
  const card = document.createElement("div");
  card.className = "icon-card";
  card.innerHTML = `<img src="${dataUrl}" width="${size > 48 ? 48 : size}"><br><small>${size}x${size}</small>`;
  outputContainer.appendChild(card);
}

downloadZipBtn.addEventListener("click", async () => {
  const zip = new JSZip();

  for (const [name, blob] of Object.entries(iconBlobs)) {
    zip.file(name, blob);
  }

  const content = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(content);
  link.download = "chrome-extension-icons.zip";
  link.click();
});

// ---------------- SNAPSHOT GENERATOR ----------------

let snapshotBlobs = {};

function cropToAspect(img, targetW, targetH) {
  const aspect = targetW / targetH;
  const imgAspect = img.width / img.height;

  let sx, sy, sw, sh;

  if (imgAspect > aspect) {
    sh = img.height;
    sw = sh * aspect;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / aspect;
    sx = 0;
    sy = (img.height - sh) / 2;
  }

  return { sx, sy, sw, sh };
}

async function generateSnapshotSizes(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const sizes = [
        { w: 1280, h: 800, name: "snapshot-1280x800.png" },
        { w: 640, h: 400, name: "snapshot-640x400.png" },
      ];

      const outputs = [];
      snapshotBlobs = {};

      sizes.forEach((size) => {
        const { w, h, name } = size;
        const { sx, sy, sw, sh } = cropToAspect(img, w, h);

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

        const dataUrl = canvas.toDataURL("image/png");

        outputs.push({ name, blob: dataUrl });

        // Save blob for ZIP
        canvas.toBlob((blob) => {
          snapshotBlobs[name] = blob;
        }, "image/png");
      });

      resolve(outputs);
    };

    img.src = URL.createObjectURL(file);
  });
}

// ---------------- SNAPSHOT DROPZONE (AUTO-GENERATE) ----------------

const snapshotDrop = document.getElementById("snapshot-drop");
const snapshotInput = document.getElementById("snapshot-input");
const snapshotResults = document.getElementById("snapshot-results");
const snapshotZipBtn = document.getElementById("download-snapshot-zip");

snapshotDrop.addEventListener("click", () => snapshotInput.click());

snapshotDrop.addEventListener("dragover", (e) => {
  e.preventDefault();
  snapshotDrop.style.borderColor = "#58a6ff";
});

snapshotDrop.addEventListener("dragleave", () => {
  snapshotDrop.style.borderColor = "#30363d";
});

snapshotDrop.addEventListener("drop", (e) => {
  e.preventDefault();
  snapshotDrop.style.borderColor = "#30363d";
  processSnapshotFiles(e.dataTransfer.files);
});

snapshotInput.addEventListener("change", (e) => {
  processSnapshotFiles(e.target.files);
});

function processSnapshotFiles(files) {
  if (!files.length) return;

  const file = files[0];

  generateSnapshotSizes(file).then((results) => {
    snapshotResults.innerHTML = "";
    snapshotZipBtn.style.display = "block";

    results.forEach((r) => {
      const img = document.createElement("img");
      img.src = r.blob;
      img.style.width = "100%";
      img.style.borderRadius = "12px";
      img.style.marginBottom = "8px";
      img.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";

      snapshotResults.appendChild(img);
    });
  });
}

// ---------------- SNAPSHOT ZIP DOWNLOAD ----------------

snapshotZipBtn.addEventListener("click", async () => {
  const zip = new JSZip();

  for (const [name, blob] of Object.entries(snapshotBlobs)) {
    zip.file(name, blob);
  }

  const content = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(content);
  link.download = "extension-snapshots.zip";
  link.click();
});
