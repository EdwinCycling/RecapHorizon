import jsPDF from 'jspdf';

// Try to load and register a Unicode-capable TTF font at runtime from /fonts.
// Place DejaVuSans.ttf and optionally DejaVuSans-Bold.ttf in public/fonts.
// Returns true if the font was loaded and registered, false otherwise.
export async function tryUseUnicodeFont(doc: jsPDF): Promise<boolean> {
  try {
    const toBase64 = (buffer: ArrayBuffer) => {
      if (!buffer || buffer.byteLength === 0) {
        throw new Error('Invalid or empty font buffer');
      }
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const chunkSize = 0x8000; // 32KB chunks to avoid call stack limits
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      // btoa expects binary string
      return btoa(binary);
    };

    // Try regular first
    const regularResp = await fetch('/fonts/DejaVuSans.ttf');
    if (!regularResp.ok) {
      console.warn('DejaVuSans.ttf not found, using default font');
      return false;
    }
    
    const regularBuf = await regularResp.arrayBuffer();
    if (!regularBuf || regularBuf.byteLength === 0) {
      console.warn('DejaVuSans.ttf is empty or corrupted');
      return false;
    }
    
    const regularB64 = toBase64(regularBuf);
    if (!regularB64) {
      console.warn('Failed to convert font to base64');
      return false;
    }
    
    doc.addFileToVFS('DejaVuSans.ttf', regularB64);
    doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');

    // Try bold variant (optional)
    try {
      const boldResp = await fetch('/fonts/DejaVuSans-Bold.ttf');
      if (boldResp.ok) {
        const boldBuf = await boldResp.arrayBuffer();
        if (boldBuf && boldBuf.byteLength > 0) {
          const boldB64 = toBase64(boldBuf);
          if (boldB64) {
            doc.addFileToVFS('DejaVuSans-Bold.ttf', boldB64);
            doc.addFont('DejaVuSans-Bold.ttf', 'DejaVuSans', 'bold');
          }
        }
      }
    } catch (e) {
      console.warn('Bold font variant not available:', e);
    }

    // Switch to Unicode font
    doc.setFont('DejaVuSans', 'normal');
    return true;
  } catch (e) {
    console.warn('Unicode font load failed, falling back to helvetica', e);
    return false;
  }
}