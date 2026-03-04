const sizes = [16, 32, 48, 128];
const upload = document.getElementById('upload');

upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      sizes.forEach(size => {
        createIcon(img, size);
      });
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

function createIcon(img, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Draw image to canvas (resizing it)
  ctx.drawImage(img, 0, 0, size, size);
  
  // Create a download link for each
  const link = document.createElement('a');
  link.download = `icon${size}.png`;
  link.href = canvas.toDataURL('image/png');
  link.innerText = `Download ${size}x${size}`;
  document.getElementById('output').appendChild(link);
}
