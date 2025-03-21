/* eslint-disable */
import { ChildProcess, exec } from "child_process";

var __TEARDOWN_MESSAGE__: string;
var __SERVER_PROCESS__: ChildProcess;

module.exports = async function () {
  console.log("\nSetting up...\n");

  const serverProcess = exec("nx run diax-back:serve", {
    env: { ...process.env },
  });

  globalThis.__SERVER_PROCESS__ = serverProcess;

  serverProcess.stdout?.on("data", (data) => console.log(data));
  serverProcess.stderr?.on("data", (data) => console.error(data));

  await new Promise((resolve) => setTimeout(resolve, 15000));

  globalThis.__TEARDOWN_MESSAGE__ = "\nTearing down...\n";
};
