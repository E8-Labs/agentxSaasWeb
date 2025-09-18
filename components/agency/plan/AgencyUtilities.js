// Keep only up to 2 fractional digits; always render as "0.xx"
// export const formatFractional2 = (raw) => {
//     if (raw == null) return "";
//     const s = raw.toString();
//     const afterDot = s.includes(".") ? s.split(".")[1] : s;
//     const digits = afterDot.replace(/\D/g, "").slice(0, 2);
//     return digits ? `0.${digits}` : "";
// };

export const formatFractional2 = (raw) => {
    if (raw == null) return "";
    const num = parseFloat(raw);
    if (isNaN(num)) return "";

    // If it's a whole number, return without decimals
    if (num % 1 === 0) {
        return num.toString();
    }

    // For decimal numbers, truncate to 2 decimal places (don't round)
    const truncated = Math.floor(num * 100) / 100;
    return truncated.toString();
};

