// Keep only up to 2 fractional digits; always render as "0.xx"
// export const formatFractional2 = (raw) => {
//     if (raw == null) return "";
//     const s = raw.toString();
//     const afterDot = s.includes(".") ? s.split(".")[1] : s;
//     const digits = afterDot.replace(/\D/g, "").slice(0, 2);
//     return digits ? `0.${digits}` : "";
// };

// export const formatFractional2 = (raw) => {
//     if (raw == null) return "";
//     const num = parseFloat(raw);
//     if (isNaN(num)) return "";

//     // If it's a whole number, return without decimals
//     if (num % 1 === 0) {
//         return num.toString();
//     }

//     // For decimal numbers, truncate to 2 decimal places (don't round)
//     const truncated = Math.floor(num * 100) / 100;
//     return truncated.toString();
// };

export const formatFractional2 = (raw) => {
    if (raw == null) return "";
    const num = parseFloat(raw);
    if (isNaN(num)) return "";

    // Whole number → no decimals
    if (num % 1 === 0) {
        return num.toString();
    }

    // Keep 2 decimals (round, not truncate)
    let fixed = num.toFixed(2);

    // If it ends with ".00" → strip decimals
    if (fixed.endsWith(".00")) {
        return parseInt(fixed, 10).toString();
    }

    // If it ends with "0" (like "6.50") → keep the zero
    // If it ends with ".50" → keep ".50"
    // If it ends with ".10", ".20" etc, also keep
    return fixed.replace(/(\.\d)0$/, "$1");
};
