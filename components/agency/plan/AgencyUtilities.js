// Keep only up to 2 fractional digits; always render as "0.xx"
export const formatFractional2 = (raw) => {
    if (raw == null) return "";
    const s = raw.toString();
    const afterDot = s.includes(".") ? s.split(".")[1] : s;
    const digits = afterDot.replace(/\D/g, "").slice(0, 2);
    return digits ? `0.${digits}` : "";
};