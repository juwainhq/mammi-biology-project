import { describe, expect, it } from 'vitest';
import { SAMPLE_HSC_PAPER } from '../../model/samplePaper';
import { exportPaperToDocx } from '../docxExporter';
import mammoth from 'mammoth';

describe('exportPaperToDocx', () => {
  it('generates a valid DOCX blob from HSC Biology Question Paper', async () => {
    const blob = await exportPaperToDocx(SAMPLE_HSC_PAPER);
    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(1000);
    expect(blob.type).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );

    // Verify mammoth can parse the generated DOCX and extracts real Bangla text
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    expect(text).toContain('মাধ্যমিক ও উচ্চমাধ্যমিক শিক্ষা বোর্ড');
    expect(text).toContain('উচ্চ মাধ্যমিক সার্টিফিকেট');
    expect(text).toContain('জীববিজ্ঞান');
    expect(text).toContain('মাইটোকন্ড্রিয়া');
    expect(text).toContain('DNA');
    expect(text).toContain('ক)');
    expect(text).toContain('খ)');
    expect(text).toContain('গ)');
    expect(text).toContain('ঘ)');
  });
});
