export function generateId() {
  const randomChars = (length = 8) => Array.from({ length }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join("");
  return `${randomChars()}-${randomChars(4)}-${randomChars(4)}-${randomChars(4)}-${randomChars(12)}`;
}
export function oneOf(list) {
  var min = 0;
  var max = list.length-1;
  var idx = Math.floor( Math.random() * (max - min + 1)) + min;
  return list[idx];
}
