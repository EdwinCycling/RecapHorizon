import JSZip from 'jszip';

export type EpubSection = { id: string; title: string; html: string };

const isoNow = (): string => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const safeId = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `section-${Date.now()}`;

export async function buildEpub(options: {
  title: string;
  author?: string;
  lang?: string;
  sections: EpubSection[];
}): Promise<Blob> {
  const title = options.title || 'RecapHorizon Export';
  const author = options.author || 'RecapHorizon';
  const lang = options.lang || 'en';
  const sections = options.sections.map((s, i) => ({ id: safeId(s.id || `section-${i + 1}`), title: s.title || `Section ${i + 1}`, html: s.html || '' }));

  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' as any });

  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/package.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  zip.file('META-INF/container.xml', containerXml);

  const navItems = sections.map(s => `<li><a href="chapters/${s.id}.xhtml">${escapeHtml(s.title)}</a></li>`).join('');
  const navXhtml = `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="${lang}">
<head><meta charset="utf-8"/><title>${escapeHtml(title)}</title></head>
<body><nav epub:type="toc"><h1>Table of Contents</h1><ol>${navItems}</ol></nav></body></html>`;
  zip.file('OEBPS/nav.xhtml', navXhtml);

  sections.forEach(s => {
    const xhtml = `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="${lang}">
<head><meta charset="utf-8"/><title>${escapeHtml(s.title)}</title></head>
<body><h1>${escapeHtml(s.title)}</h1><article>${s.html}</article></body></html>`;
    zip.file(`OEBPS/chapters/${s.id}.xhtml`, xhtml);
  });

  const manifestItems = [`<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`, ...sections.map(s => `<item id="${s.id}" href="chapters/${s.id}.xhtml" media-type="application/xhtml+xml"/>`)].join('\n    ');
  const spineItems = [`<itemref idref="nav"/>`, ...sections.map(s => `<itemref idref="${s.id}"/>`)].join('\n    ');
  const uid = `urn:uuid:${generateUuid()}`;
  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id" xml:lang="${lang}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">${uid}</dc:identifier>
    <dc:title>${escapeHtml(title)}</dc:title>
    <dc:language>${lang}</dc:language>
    <dc:creator>${escapeHtml(author)}</dc:creator>
    <meta property="dcterms:modified">${isoNow()}</meta>
  </metadata>
  <manifest>
    ${manifestItems}
  </manifest>
  <spine>
    ${spineItems}
  </spine>
</package>`;
  zip.file('OEBPS/package.opf', opf);

  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
  return blob;
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateUuid(): string {
  const rnd = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `${rnd(8)}-${rnd(4)}-${rnd(4)}-${rnd(4)}-${rnd(12)}`;
}