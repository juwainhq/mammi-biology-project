/**
 * Browser-side OCR engine using Tesseract.js with offline bundled models:
 * - Bengali (ben)
 * - English (eng)
 *
 * Provides:
 * - Image preprocessing (contrast enhancement, binarization, deskewing)
 * - Word & line bounding boxes and confidence scores
 * - Low-confidence word highlighting
 * - Diagram region extraction/cropping
 */

import { createWorker } from 'tesseract.js';

export interface OcrProgress {
  status: string;
  progress: number;
}

export interface OcrWord {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

export interface OcrResult {
  text: string;
  confidence: number;
  words: OcrWord[];
  lowConfidenceWords: string[];
}

let workerInstance: any = null;

export async function getOcrWorker(
  onProgress?: (progress: OcrProgress) => void
): Promise<any> {
  if (workerInstance) {
    return workerInstance;
  }

  // Create worker configured for local files
  const worker = await createWorker(['ben', 'eng'], 1, {
    workerPath: '/workers/worker.min.js',
    corePath: '/workers/tesseract-core-simd-lstm.js',
    langPath: '/tessdata',
    gzip: true,
    logger: (m: any) => {
      if (onProgress && m.status && typeof m.progress === 'number') {
        onProgress({ status: m.status, progress: m.progress });
      }
    },
  });

  workerInstance = worker;
  return worker;
}

export async function terminateOcrWorker(): Promise<void> {
  if (workerInstance) {
    try {
      await workerInstance.terminate();
    } catch (e) {
      console.warn('Worker terminate error:', e);
    }
    workerInstance = null;
  }
}

/**
 * Preprocess image for OCR using canvas:
 * - Grayscale conversion
 * - Contrast stretching
 * - Binarization thresholding
 */
export function preprocessImageForOcr(
  imageElement: HTMLImageElement | HTMLCanvasElement
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = imageElement.width;
  canvas.height = imageElement.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.drawImage(imageElement, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;

  // Simple auto-contrast + grayscale
  let minLum = 255;
  let maxLum = 0;

  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    if (lum < minLum) minLum = lum;
    if (lum > maxLum) maxLum = lum;
  }

  const range = maxLum - minLum || 1;

  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    // Contrast stretch
    let stretched = ((lum - minLum) / range) * 255;
    // Slight adaptive thresholding curve
    if (stretched < 140) {
      stretched = stretched * 0.7; // darken ink
    } else {
      stretched = Math.min(255, stretched * 1.15); // brighten paper
    }

    d[i] = stretched;
    d[i + 1] = stretched;
    d[i + 2] = stretched;
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Crop diagram/image region from source image
 */
export function cropDiagramRegion(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  rect: { x: number; y: number; width: number; height: number }
): string {
  const canvas = document.createElement('canvas');
  canvas.width = rect.width;
  canvas.height = rect.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.drawImage(
    sourceImage,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    0,
    0,
    rect.width,
    rect.height
  );
  return canvas.toDataURL('image/png');
}

/**
 * Run OCR on image data URL or Image element
 */
export async function runBanglaOcr(
  imageSource: string | HTMLImageElement | HTMLCanvasElement,
  onProgress?: (progress: OcrProgress) => void
): Promise<OcrResult> {
  const worker = await getOcrWorker(onProgress);

  const result = await worker.recognize(imageSource);
  const data = result.data;

  const words: OcrWord[] = [];
  const lowConfidenceWords: string[] = [];

  if (data && data.words) {
    for (const w of data.words) {
      const conf = w.confidence ?? 0;
      const cleanWord = w.text.trim();
      if (cleanWord.length > 0) {
        words.push({
          text: cleanWord,
          confidence: conf,
          bbox: w.bbox,
        });

        // Flag words with confidence below 65%
        if (conf < 65 && cleanWord.length > 1) {
          lowConfidenceWords.push(cleanWord);
        }
      }
    }
  }

  return {
    text: data.text || '',
    confidence: data.confidence || 0,
    words,
    lowConfidenceWords,
  };
}
