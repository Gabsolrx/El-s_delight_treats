/**
 * Compresses an image file from the device gallery/camera and returns an optimized Base64 data URL.
 * Automatically downscales oversized camera photos (e.g. 10MB+) to lightweight, high-clarity web sizes.
 */
export async function processGalleryImage(
  file: File,
  maxWidth = 720,
  maxHeight = 720,
  quality = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file (JPG, PNG, WebP).'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Could not read image file.'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        // Fill background with white in case of transparent PNG converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        // Always compress to image/jpeg for guaranteed file size reduction (PNG ignores quality)
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        // If still > 130KB, do a second tighter pass to stay lean and avoid quota issues
        if (compressedDataUrl.length > 130000) {
          const secondCanvas = document.createElement('canvas');
          secondCanvas.width = Math.round(width * 0.75);
          secondCanvas.height = Math.round(height * 0.75);
          const secondCtx = secondCanvas.getContext('2d');
          if (secondCtx) {
            secondCtx.fillStyle = '#FFFFFF';
            secondCtx.fillRect(0, 0, secondCanvas.width, secondCanvas.height);
            secondCtx.drawImage(canvas, 0, 0, secondCanvas.width, secondCanvas.height);
            compressedDataUrl = secondCanvas.toDataURL('image/jpeg', 0.65);
          }
        }

        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        // Fallback to original data URL if image element rendering fails
        resolve(dataUrl);
      };

      img.src = dataUrl;
    };

    reader.onerror = () => reject(new Error('Failed to read file from gallery.'));
    reader.readAsDataURL(file);
  });
}
