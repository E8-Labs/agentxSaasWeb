export const getAgencyLocalData = () => {
    if (typeof window === "undefined" || !("localStorage" in window)) return null;

    try {
        const ld = window.localStorage.getItem("User");
        if (!ld) return null;

        const data = JSON.parse(ld);
        return data?.user ?? null;
    } catch (err) {
        console.error("Failed to read/parse localStorage 'User':", err);
        return null;
    }
};


export const CheckStripe = () => {
    const localData = getAgencyLocalData();
    console.log("Is agency local data available 🤔", Boolean(localData));
    return localData?.canAcceptPaymentsAgencyccount;
}

//make the price/min to decimals
export const handlePricePerMinInputValue = (value) => {
    const raw = String(value).trim();

    // Empty -> empty state
    if (raw === "") {
        //   setDiscountedPrice("");
        return "";
    }

    // If user already entered a decimal, keep it
    if (raw.includes(".")) {
        //   setDiscountedPrice(raw);
        return raw;
    }

    // Keep only digits
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
        //   setDiscountedPrice("");
        return "";
    }

    const num = Number(digits);

    // If > 3, turn it into "points": 5 -> 0.5, 12 -> 0.12, etc.
    const normalized = num > 1 ? `0.${digits}` : digits;

    // setDiscountedPrice(normalized);
    return normalized;
};


