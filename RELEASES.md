# Theme releases

Every theme version bump in `config/settings_schema.json` (`theme_version`) **must** have a matching GitHub Release and git tag.

## When to release

Create a new release whenever `theme_version` is incremented (e.g. `1.7.7` → `1.7.8`).

## How to release

1. Commit and push all changes to `main`.
2. Confirm `theme_version` in `config/settings_schema.json` matches the tag you will create.
3. Deploy to Shopify and verify (no schema errors, homepage loads).
4. Create the GitHub Release:

   ```bash
   gh release create vX.Y.Z --title "vX.Y.Z — short summary" --notes-file RELEASE_NOTES.md --target main
   ```

5. Tag name must match `theme_version` with a `v` prefix: `theme_version` `1.7.8` → tag `v1.7.8`.

## Do not skip releases

Bumping `theme_version` without a GitHub Release leaves the Releases page out of date and makes it hard to track what is deployed.
