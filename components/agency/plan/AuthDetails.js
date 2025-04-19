export const AuthToken = () => {
    const Data = localStorage.getItem("User");
    if (Data) {
        const D = JSON.parse(Data);
        // console.log("Auth token is", D.token);
        return D.token
    } else {
        return ("no data found")
    }
};