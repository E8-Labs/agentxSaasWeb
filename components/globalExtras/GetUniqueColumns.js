import axios from "axios";
import Apis from "../apis/Apis";

export const getUniquesColumn = async () => {
    try {
      // setColumnloader(true);
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        // setUser(UserDetails);
        AuthToken = UserDetails.token;
      }

      ////////console.log;

      const ApiPath = Apis.uniqueColumns;
      ////////console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // console.log("unique columns api response is",response.data.data)
        if (response.data.status === true) {
            return response.data.data
        //   setUniqueColumns(response.data.data);
        }else return null
      }
    } catch (error) {
        return null
      //// console.error("Error occured in getColumn is :", error);
    } finally {
      // setColumnloader(false)
    }
  };