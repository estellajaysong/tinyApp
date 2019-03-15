function urlConvert(longURL) {
  if (longURL.slice(0, 4) === "www.") {
    longURL = "https://" + longURL;
  }
  else if (longURL.slice(0, 7) !== "http://" && longURL.slice(7, 11) !== "www.") {
    longURL = "http://www." + longURL;
  }
  else if (longURL.slice(0, 8) !== "https://" && longURL.slice(8, 12) !== "www.") {
    longURL = "https://www." + longURL;
  };
  return longURL
};
console.log(urlConvert("facebook.com"))