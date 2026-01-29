import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Use CDN for worker to avoid create-react-app webpack 5 configuration issues with pdfjs-dist
// Ensure the version matches the installed version
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const extractTextFromPdf = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let pItems = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // Map items to { str, x }
            const items = textContent.items.map(item => ({
                str: item.str,
                x: item.transform[4] // x-coordinate
            }));

            if (items.length === 0) continue;

            // Find min x (baseline) using "Smart Baseline" approach
            // Instead of absolute min, find the left-most "significant" x-coordinate
            // to ignore outliers like page numbers or artifacts in the margin.
            const xHistogram = {};
            const bucketSize = 5;
            let totalItems = 0;

            items.forEach(it => {
                if (!it.str.trim()) return;
                const bucket = Math.floor(it.x / bucketSize) * bucketSize;
                xHistogram[bucket] = (xHistogram[bucket] || 0) + 1;
                totalItems++;
            });

            // Find valid buckets (threshold: >10% of items to ensure we pick main body text)
            // Increased from 2% to 10% to completely ignore margin notes/numbers.
            const threshold = Math.max(1, Math.floor(totalItems * 0.10));
            const validBuckets = Object.keys(xHistogram)
                .map(Number)
                .filter(x => xHistogram[x] >= threshold)
                .sort((a, b) => a - b);

            // Use the left-most significant bucket as minX, or fallback to absolute min if empty
            const minX = validBuckets.length > 0 ? validBuckets[0] : Math.min(...items.map(it => it.x));

            // Process items into lines with indentation
            items.forEach(item => {
                if (!item.str.trim()) return; // Skip empty/whitespace items

                // Calculate indentation level (approx every 35 units is a tab/level)
                // Adjusted to 35 based on user feedback (50 was too large, 25 too small)
                const indentLevel = Math.max(0, Math.floor((item.x - minX) / 35));
                pItems.push({
                    text: item.str,
                    indent: indentLevel
                });
            });
        }

        // Normalize indentation: Shift everything left so the minimum indentation is 0
        // This is a failsafe: if after Per-Page processing, ALL lines are still indented (e.g. indent 1),
        // we shift them all back to 0.
        if (pItems.length > 0) {
            const minGlobalIndent = Math.min(...pItems.map(item => item.indent));
            if (minGlobalIndent > 0) {
                pItems.forEach(item => {
                    item.indent -= minGlobalIndent;
                });
            }
        }


        // Post-processing: Merge orphan bullets and detect list items
        const mergedLines = [];
        const isBullet = (str) => {
            const s = str.trim();
            // Expanded bullet definitions
            return ['●', '•', 'o', '*', '-', '·'].includes(s) || (s.length < 2 && /[^a-zA-Z0-9]/.test(s));
        };

        for (let i = 0; i < pItems.length; i++) {
            const current = pItems[i];

            // Case 1: Orphan bullet followed by text
            if (isBullet(current.text) && i + 1 < pItems.length) {
                const next = pItems[i + 1];
                mergedLines.push({
                    text: next.text.trim(), // text without bullet
                    indent: current.indent, // use indent of the bullet
                    isList: true
                });
                i++;
            }
            // Case 2: Line starts with a bullet character natively (e.g. "• Item")
            else if (isBullet(current.text.charAt(0)) || current.text.trim().match(/^[●•o*\-·]/)) {
                // Strip the bullet
                const cleanText = current.text.replace(/^[●•o*\-·]\s*/, '').trim();
                mergedLines.push({
                    text: cleanText,
                    indent: current.indent,
                    isList: true
                });
            }
            // Case 3: Regular text
            else {
                mergedLines.push({
                    ...current,
                    isList: false
                });
            }
        }

        // Convert to HTML
        // Quill prefers <ul><li> structure for lists
        let html = '';
        let inList = false;

        mergedLines.forEach((line) => {
            const indentClass = line.indent > 0 ? ` class="ql-indent-${line.indent}"` : '';

            if (line.isList) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                html += `<li${indentClass}>${line.text}</li>`;
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                html += `<p${indentClass}>${line.text}</p>`;
            }
        });

        if (inList) html += '</ul>';

        return html;

    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
};

export const extractTextFromDocx = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        return result.value; // Returns HTML which is great for the rich text editor
    } catch (error) {
        console.error('Error parsing DOCX:', error);
        throw new Error('Failed to extract text from DOCX');
    }
};

export const extractTextFromFile = async (file) => {
    const fileType = file.type;
    if (fileType === 'application/pdf') {
        return await extractTextFromPdf(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return await extractTextFromDocx(file);
    } else {
        throw new Error('Unsupported file type. Please upload PDF or DOCX.');
    }
};

export const formatToTopics = (text) => {
    // If it's HTML (from mammoth), return as is
    if (/<[a-z][\s\S]*>/i.test(text)) return text;

    const rawLines = text.split('\n').filter(line => line.trim().length > 0);
    const mergedLines = [];
    let pendingBullet = null;

    // definition of a standalone bullet line
    const isBullet = (str) => {
        const s = str.trim();
        // Check for common bullet chars or single non-alphanumeric chars (excluding digits)
        // Also strictly check 'o' as user uses it for bullets
        return ['●', '•', 'o', '*', '-', '·'].includes(s) || (s.length < 2 && /[^a-zA-Z0-9]/.test(s));
    };

    rawLines.forEach((line) => {
        const isLineBullet = isBullet(line);

        if (isLineBullet) {
            // It's a bullet, save it for the next line
            pendingBullet = line.trim();
        } else {
            // It's text
            if (pendingBullet) {
                mergedLines.push(`${pendingBullet} ${line.trim()}`);
                pendingBullet = null;
            } else {
                mergedLines.push(line);
            }
        }
    });

    // Valid HTML paragraph per line
    return mergedLines.map(line => `<p>${line}</p>`).join('');
};
