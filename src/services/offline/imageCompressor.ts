/**
 * Utilitaire de compression client-side d'images pour usage mobile/terrain.
 * Réduit le poids des photos haute-résolution de smartphone (4-12 Mo)
 * à une taille optimale web (200-450 Ko) sans perte perceptible des détails d'intervention.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 to 1, default 0.75
  mimeType?: 'image/jpeg' | 'image/webp';
}

export interface CompressedImageResult {
  file: File;
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatioPercent: number;
  width: number;
  height: number;
}

export async function compressImageFile(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedImageResult> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.75,
    mimeType = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    // Si ce n'est pas une image (ex: PDF ou autre), on rejette
    if (!file.type.startsWith('image/')) {
      reject(new Error('Le fichier fourni n’est pas une image supportée.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcul de l'échelle en conservant le ratio d'aspect
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Impossible d’initialiser le contexte Canvas 2D.'));
          return;
        }

        // Lissage haute qualité
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Dessin de l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);

        // Conversion en base64 compressé
        const dataUrl = canvas.toDataURL(mimeType, quality);

        // Conversion en Blob puis File
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Échec de la génération du blob image compressé.'));
              return;
            }

            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '') + (mimeType === 'image/webp' ? '.webp' : '.jpg'),
              {
                type: mimeType,
                lastModified: Date.now(),
              }
            );

            const originalSizeBytes = file.size;
            const compressedSizeBytes = compressedFile.size;
            const compressionRatioPercent = Math.round(
              ((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100
            );

            resolve({
              file: compressedFile,
              dataUrl,
              originalSizeBytes,
              compressedSizeBytes,
              compressionRatioPercent: Math.max(0, compressionRatioPercent),
              width,
              height,
            });
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Erreur lors du chargement de l’image source.'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier image.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Formate un nombre d'octets en chaîne lisible (ex: 2.4 Mo, 380 Ko)
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}
