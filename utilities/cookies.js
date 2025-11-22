// export function setCookie(user, document, expiryDate = null) {
//   if (typeof document === "undefined") {
//     return;
//   }
//   if (expiryDate) {
//     document.cookie = `User=${encodeURIComponent(
//       {
//         id: user.id,
//         userRole: user.userRole,
//         userType: user.userType,
//         agencyTeammember: user.agencyTeamMember,
//       }
//     )}; path=/; expires=${expiryDate.toUTCString()}`;
//   } else {
//     document.cookie = `User=${encodeURIComponent(
//       {
//         id: user.id,
//         userRole: user.userRole,
//         userType: user.userType,
//         agencyTeammember: user.agencyTeamMember,
//       }
//     )}; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
//   }
// }

// // export function getCookie(user) {

// // }

export function setCookie(user, document, expiryDate = null) {
  if (typeof document === 'undefined') return

  const cookieValue = encodeURIComponent(
    JSON.stringify({
      id: user.id,
      userRole: user.userRole,
      userType: user.userType,
      agencyTeammember: user.agencyTeamMember,
    }),
  )

  const expires = expiryDate
    ? expiryDate.toUTCString()
    : 'Fri, 31 Dec 9999 23:59:59 GMT'

  document.cookie = `User=${cookieValue}; path=/; expires=${expires}`
}
