function S4() {
  /* eslint-disable-next-line */
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

// uuid
function guid() {
  return (`${S4() + S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`);
}
module.exports = {
  guid,
};
