import * as pdfjsLib from 'pdfjs-dist';

// Use CDN for worker to avoid create-react-app webpack 5 configuration issues with pdfjs-dist
// Ensure the version matches the installed version
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const extractTextFromPdf = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item) => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
};

export const formatToTopics = (text) => {
    // Basic heuristic to try and format extracted text into a list of topics
    // This is a naive implementation; real TOC parsing is hard without structure
    // We will just clean it up and split by newlines or sensible delimiters
    if (!text) return "No content extracted.";

    const lines = text.split('\n').filter(line => line.trim().length > 0);
    // Take first 10 meaningful lines as a preview if it's too long
    return lines.join('\n');
};
