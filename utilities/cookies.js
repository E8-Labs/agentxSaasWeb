export function setCookie(user, document, expiryDate = null) {
  if (typeof document === "undefined") {
    return;
  }
  if (expiryDate) {
    document.cookie = `User=${encodeURIComponent(
      user.id
    )}; path=/; expires=${expiryDate.toUTCString()}`;
  } else {
    document.cookie = `User=${encodeURIComponent(
      user.id
    )}; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
  }
}

// export function getCookie(user) {

// }
