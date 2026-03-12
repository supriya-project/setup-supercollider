import * as cache from "@actions/cache";
import * as core from "@actions/core";

async function saveVcpkgCache(): Promise<void> {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDay();
  const paths = ["~/AppData/Local/vcpkg/archives"];
  const key = `vcpkg-${process.platform}-${year}-${month}-${day}`;
  core.info(`Saving vcpkg cache with key ${key}`);
  await cache.saveCache(paths, key);
}

async function run(): Promise<void> {
  switch (process.platform) {
    case "linux":
      break;
    case "darwin":
      break;
    case "win32":
      core.startGroup("Saving cache");
      await saveVcpkgCache();
      core.endGroup();
      break;
  }
}

run();
