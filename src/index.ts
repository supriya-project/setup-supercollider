import * as artifact from "@actions/artifact";
import * as cache from "@actions/cache";
import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as glob from "@actions/glob";
import * as io from "@actions/io";

const REPO_DIR = "/tmp/supercollider";
const BUILD_DIR = `${REPO_DIR}/build`;

async function restoreVcpkgCache(): Promise<void> {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDay();
  const paths = ["~/AppData/Local/vcpkg/archives"];
  const key = `vcpkg-${process.platform}-${year}-${month}-${day}`;
  const restoreKeys = [
    `vcpkg-${process.platform}-${year}-${month}-`,
    `vcpkg-${process.platform}-${year}-`,
    `vcpkg-${process.platform}-`,
  ];
  core.info(`Restoring vcpkg cache with key ${key}`);
  await cache.restoreCache(paths, key, restoreKeys);
}

async function restoreCache(): Promise<void> {
  switch (process.platform) {
    case "linux":
      break;
    case "darwin":
      break;
    case "win32":
      await core.group("Restoring vcpkg cache", restoreVcpkgCache);
      break;
  }
}

async function cloneSuperCollider(): Promise<void> {
  const origin = core.getInput("origin");
  const ref = core.getInput("ref");
  await exec.exec("git", [
    "clone",
    "--depth=1",
    "--recursive",
    "--shallow-submodules",
    "--branch",
    ref,
    origin,
    REPO_DIR,
  ]);
}

async function installDependencies(): Promise<void> {
  switch (process.platform) {
    case "linux":
      await exec.exec("sudo", ["apt-get", "update"]);
      await exec.exec("sudo", [
        "apt-get",
        "install",
        "--yes",
        "build-essential",
        "cmake",
        "emacs",
        "libasound2-dev",
        "libavahi-client-dev",
        "libfftw3-dev",
        "libicu-dev",
        "libjack-jackd2-dev",
        "libreadline6-dev",
        "libsndfile1-dev",
        "libudev-dev",
        "libxt-dev",
        "pkg-config",
      ]);
      break;
    case "darwin":
      await exec.exec("brew", ["install", "fftw", "libsndfile", "portaudio"]);
      break;
    case "win32":
      await exec.exec("vcpkg", [
        "install",
        "--triplet=x64-windows-release",
        "--overlay-triplets=/tmp/vcpkg/triplets",
        "asiosdk",
        "fftw3",
        "libsndfile",
        "readline",
      ]);
      await exec.exec("ls", ["-l", "~/AppData/Local/vcpkg/archives"]);
      break;
  }
}

async function configureSuperCollider(): Promise<void> {
  await io.mkdirP(BUILD_DIR);
  const cmakeArgs = [
    "-DRULE_LAUNCH_COMPILE=ccache",
    "-DSC_ED=OFF",
    "-DSC_EL=OFF",
    "-DSC_IDE=OFF",
    "-DSC_QT=OFF",
    "-DSC_VIM=OFF",
    "-DSUPERNOVA=ON",
  ];
  const env: { [key: string]: string } = { ...process.env };
  switch (process.platform) {
    case "darwin":
      cmakeArgs.push("-GXcode");
      break;
    case "win32":
      cmakeArgs.push(
        ...[
          "-A",
          "x64",
          "-DCMAKE_BUILD_TYPE=Release",
          "-DFFTW3F_LIBRARY_DIR=C:/vcpkg/installed/x64-windows-release/bin/",
          "-DVCPKG_TARGET_TRIPLET=x64-windows-release",
          "-G",
          "Visual Studio 17 2022",
        ],
      );
      env.VCPKG_ROOT = "C:\\vcpkg";
      break;
  }
  await exec.exec("cmake", [...cmakeArgs, ".."], {
    cwd: BUILD_DIR,
    env: env,
  });
}

async function buildSuperCollider(): Promise<void> {
  switch (process.platform) {
    case "linux":
      await exec.exec("make", ["-j2"], { cwd: BUILD_DIR });
      break;
    case "darwin":
      await exec.exec("cmake", [
        "--build",
        BUILD_DIR,
        "--config",
        "Release",
        "--target",
        "install",
      ]);
      break;
    case "win32":
      await exec.exec("cmake", [
        "--build",
        BUILD_DIR,
        "--config",
        "Release",
        "--target",
        "install",
      ]);
      break;
  }
}

async function installSuperCollider(): Promise<void> {
  switch (process.platform) {
    case "linux":
      await exec.exec("sudo", ["make", "install", "-j2"], { cwd: BUILD_DIR });
      await io.mkdirP("/home/runner/.local/share/SuperCollider/synthdefs");
      break;
    case "darwin":
      await io.mkdirP(
        "/Users/runner/Library/Application Support/SuperCollider/synthdefs",
      );
      break;
    case "win32":
      await io.mkdirP(
        "C:/Users/runneradmin/AppData/Local/SuperCollider/synthdefs",
      );
  }
}

async function setOutputs(): Promise<void> {
  switch (process.platform) {
    case "linux":
      core.setOutput("sclang_path", "");
      core.setOutput("scsynth_path", "");
      core.setOutput("supernova_path", "");
      break;
    case "darwin":
      core.addPath(
        "/tmp/supercollider/build/Install/SuperCollider/SuperCollider.app/Contents/MacOS",
      );
      core.addPath(
        "/tmp/supercollider/build/Install/SuperCollider/SuperCollider.app/Contents/Resources",
      );
      core.setOutput(
        "sclang_path",
        "/tmp/supercollider/build/Install/SuperCollider/SuperCollider.app/Contents/MacOS/sclang",
      );
      core.setOutput(
        "scsynth_path",
        "/tmp/supercollider/build/Install/SuperCollider/SuperCollider.app/Contents/Resources/scsynth",
      );
      core.setOutput(
        "supernova_path",
        "/tmp/supercollider/build/Install/SuperCollider/SuperCollider.app/Contents/Resources/supernova",
      );
      break;
    case "win32":
      core.setOutput("sclang_path", "");
      core.setOutput("scsynth_path", "");
      core.setOutput("supernova_path", "");
      break;
  }
}

async function uploadArtifacts(): Promise<void> {
  const globber = await glob.create("/tmp/supercollider/build/**/*", {
    matchDirectories: false,
  });
  const client = new artifact.DefaultArtifactClient();
  await client.uploadArtifact(
    `supercollider-build-${process.platform}`,
    await globber.glob(),
    "/tmp/supercollider/build",
  );
}

async function run(): Promise<void> {
  await restoreCache();
  await core.group("Cloning SuperCollider", cloneSuperCollider);
  await core.group("Installing dependencies", installDependencies);
  await core.group("Configuring SuperCollider", configureSuperCollider);
  await core.group("Building SuperCollider", buildSuperCollider);
  await core.group("Uploading artifacts", uploadArtifacts);
  await core.group("Installing SuperCollider", installSuperCollider);
  await core.group("Setting outputs", setOutputs);
}

run();
