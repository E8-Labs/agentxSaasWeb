export const getStatus = (item) => {
  console.log("item callOutcome", item.callOutcome)
  if (item.communicationType == 'sms' || item.communicationType == 'email') {
    let status = item?.deliveryStatus ? item?.deliveryStatus : 'Sent'
    status = status.charAt(0).toUpperCase() + status.slice(1)
    return status
  } else {
    return item.callOutcome
  }
}
