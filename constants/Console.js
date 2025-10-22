export const Console = (title, log) => {
    const environment = process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT;
    if (environment === "Development") {
        console.log(`${title}`, log);
    }
    return null;
}