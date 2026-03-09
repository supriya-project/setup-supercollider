import * as cache from "@actions/cache";
import * as core from "@actions/core";

async function saveVcpkgCache(): Promise<void> {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDay();
  const paths = ["~/AppData/Local/vcpkg/archives"];
  const key = `vcpkg-${process.platform}-${year}-${month}-${day}`;
  await cache.saveCache(paths, key);
}

async function run(): Promise<void> {
  core.info("Running post ...");
  core.startGroup("Saving cache");
  switch (process.platform) {
    case "linux":
      break;
    case "darwin":
      break;
    case "win32":
      await saveVcpkgCache();
      break;
  }
  core.endGroup();
}

run();
