/* eslint-disable */
module.exports = async function () {
  console.log(globalThis.__TEARDOWN_MESSAGE__);
  if (globalThis.__SERVER_PROCESS__) {
    console.log("\nStopping backend server...\n");
    globalThis.__SERVER_PROCESS__.kill();
  }
};
