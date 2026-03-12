# setup-supercollider

Setup your GitHub Actions workflow with headless SuperCollider built from
source.

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

We strongly recommend you also use https://github.com/hendrikmuhs/ccache-action
to prior to running this action in order to cache `ccache` for additional
speedups.
