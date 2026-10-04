# HSC Biology Question Builder

A specialized, client-side web application designed for creating, editing, and formatting Bangladeshi **HSC Biology examination question papers** from uploaded images, and exporting them as genuine editable Microsoft Word (`.docx`) documents.

Built specifically for static hosting on **GitHub Pages** with no required backend servers, database, or external API keys.

---

## Key Features

1. **Authentic HSC Biology Question Layout**
   - Strictly models the typography, margins, header structure, and right-aligned mark distribution used by Bangladeshi Education Boards.
   - Distinct formatting for **Creative Questions (CQ)** (উদ্দীপক + `ক`, `খ`, `গ`, `ঘ` with 1 + 2 + 3 + 4 = 10 marks) and **Multiple Choice Questions (MCQ)**.

2. **Client-Side Bangla + English OCR**
   - Offline Tesseract.js engine with bundled Bengali (`ben`) and English (`eng`) language models.
   - Automatic image preprocessing (contrast stretching and binarization).
   - Preserves biological notation and terms without corruption (`DNA`, `RNA`, `ATP`, `CO₂`, `H₂O`, `pH`, `%`, etc.).
   - Biology diagrams and illustration regions are preserved and attached directly to questions.

3. **Bangla Unicode & Bijoy Classic Engine**
   - Unicode as the canonical internal representation (`NFC` normalized with precomposed Bengali nuktas).
   - Real, full-parity two-way conversion: **Bijoy (SutonnyMJ / ANSI) ⇄ Unicode**.
   - Live keyboard mode toggle (Unicode / Bijoy Classic).
   - Quick-insert badges for common HSC Biology symbols (`DNA`, `ATP`, `CO₂`, `pH`, `F₁`, `F₂`, `♂`, `♀`, etc.).

4. **Genuine DOCX Export**
   - Exports real, editable text (not screenshots) using the `docx` library.
   - Applies proper Bengali fonts (`Kalpurush`, `SutonnyMJ`, `Noto Sans Bengali`).
   - Generates clean tables for metadata and right-aligned mark boxes.
   - Preserves embedded biology illustrations and diagrams (`ImageRun`).

5. **Signature Minimalist Design**
   - Monochrome, editorial visual language inspired by Juwain Haque's design portfolio (`#000000` background, `#FAFAFA` canvas, subtle `#DAAB4E` warm gold accents, square corners, and refined typography).

6. **GitHub Pages Deployment Ready**
   - Pure client-side static build with relative asset paths (`base: './'`).
   - Automated GitHub Actions deployment workflow included (`.github/workflows/deploy.yml`).

---

## Live Deployment on GitHub Pages

The project is pre-configured to build and deploy automatically to GitHub Pages:

```
https://juwainhq.github.io/mammi-biology-project/
```

### How to Enable GitHub Pages in Repository Settings:

1. Push the code to GitHub on the `main` branch:
   ```bash
   git push origin main
   ```
2. Navigate to your repository on GitHub:
   `https://github.com/juwainhq/mammi-biology-project`
3. Click on **Settings** ➔ **Pages** (under "Code and automation" in the left sidebar).
4. Under **Build and deployment** ➔ **Source**, select:
   **GitHub Actions**
5. That's all! The workflow in `.github/workflows/deploy.yml` will automatically trigger on push, run tests, build the static site, and deploy it to GitHub Pages.

---

## Local Development

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Setup & Run
```bash
# Clone the repository
git clone https://github.com/juwainhq/mammi-biology-project.git
cd mammi-biology-project

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Run Unit Tests
```bash
npm run test
```

### Build Static Site
```bash
npm run build
```
The production-ready static assets will be output to `./dist`.

---

## License
MIT License.
