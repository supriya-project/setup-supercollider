# setup-supercollider

Setup your GitHub Actions workflow with headless SuperCollider built from
source.

Validated to work on GitHub's standard `macos-15`, `ubuntu-latest`, and
`windows-latest` runners.

## Inputs

| Title   | Required | Type   | Default                                              | Description                  |
|---------|----------|--------|------------------------------------------------------|------------------------------|
| origin  | False    | string | `https://github.com/supercollider/supercollider.git` | SuperCollider repository URL |
| ref     | False    | string | `develop`                                            | SuperCollider branch/tag ref |

## Outputs

| Title          | Type   | Description                  |
|----------------|--------|------------------------------|
| sclang_path    | string | path to `sclang` binary      |
| scsynth_path   | string | path to `scsynth` binary     |
| supernova_path | string | path to `supernova` binary   |

## Caching

Windows workflows will automatically cache `vcpkg` archives.

We also strongly recommend that you use
https://github.com/hendrikmuhs/ccache-action prior to running this action for
additional speedups.
