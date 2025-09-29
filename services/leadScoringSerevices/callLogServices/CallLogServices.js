export const getStatus = (item) => {
    if (item.communicationType == "sms" || item.communicationType == "email") {
      let status = item?.deliveryStatus ? item?.deliveryStatus : "Ongoing";
      status = status.charAt(0).toUpperCase() + status.slice(1);
      return status
    } else {
      return item.callOutcome;
    }
  };
