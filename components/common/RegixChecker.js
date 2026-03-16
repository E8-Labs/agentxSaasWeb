// Helper function to strip HTML tags and convert to plain text while preserving line breaks
export const stripHTML = (html) => {
    if (!html) return ''
    if (typeof document !== 'undefined') {
        const tempDiv = document.createElement('div')
        // Convert <p> tags to newlines before processing (Quill uses <p> for paragraphs)
        // Also convert <br> and <br/> to newlines
        let processedHtml = html
            .replace(/<p[^>]*>/gi, '\n')  // Convert opening <p> tags to newlines
            .replace(/<\/p>/gi, '')        // Remove closing </p> tags
            .replace(/<br\s*\/?>/gi, '\n') // Convert <br> and <br/> to newlines
            .replace(/<\/div>/gi, '\n')    // Convert closing </div> to newlines (for nested divs)
            .replace(/<div[^>]*>/gi, '')   // Remove opening <div> tags
        tempDiv.innerHTML = processedHtml
        const text = tempDiv.textContent || tempDiv.innerText || ''
        // Normalize multiple newlines to single newlines, but preserve intentional line breaks
        return text.replace(/\n{3,}/g, '\n\n').trim();
    }
    // Fallback for SSR: strip HTML tags and preserve line breaks
    return html
        .replace(/<p[^>]*>/gi, '\n')     // Convert <p> tags to newlines
        .replace(/<\/p>/gi, '')          // Remove closing </p> tags
        .replace(/<br\s*\/?>/gi, '\n')   // Convert <br> to newlines
        .replace(/<\/div>/gi, '\n')      // Convert closing </div> to newlines
        .replace(/<div[^>]*>/gi, '')     // Remove opening <div> tags
        .replace(/<[^>]*>/g, '')         // Remove any remaining HTML tags
        .replace(/&nbsp;/g, ' ')         // Convert &nbsp; to spaces
        .replace(/&amp;/g, '&')          // Convert &amp; to &
        .replace(/&lt;/g, '<')           // Convert &lt; to <
        .replace(/&gt;/g, '>')           // Convert &gt; to >
        .replace(/\n{3,}/g, '\n\n')      // Normalize multiple newlines
        .trim();
}