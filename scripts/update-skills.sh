#!/usr/bin/env bash
#
# Update Claude skills to their latest versions from upstream.
# Run from the project root: ./scripts/update-skills.sh
#
# Skills are vendored (copied in) rather than referenced via submodules,
# so they don't auto-update. Run this every 1-3 months to refresh.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SKILLS_DIR="$ROOT_DIR/.claude/skills"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "→ Updating skills in $SKILLS_DIR"
echo ""

# Helper: sparse-clone a single skill folder out of an upstream repo.
# args: <repo_url> <subpath_in_repo> <local_skill_name>
fetch_skill() {
  local repo_url="$1"
  local subpath="$2"
  local local_name="$3"
  local target="$SKILLS_DIR/$local_name"
  local clone_dir="$TMP_DIR/$local_name"

  echo "→ $local_name (from $repo_url)"

  git clone --quiet --depth 1 --filter=blob:none --sparse "$repo_url" "$clone_dir"
  (cd "$clone_dir" && git sparse-checkout set "$subpath" --quiet)

  if [ ! -d "$clone_dir/$subpath" ]; then
    echo "  ✗ Subpath '$subpath' not found in $repo_url — upstream may have moved it."
    return 1
  fi

  if [ -d "$target" ]; then
    rm -rf "$target"
  fi
  cp -r "$clone_dir/$subpath" "$target"
  echo "  ✓ Updated"
  echo ""
}

# Skills to keep in sync. Edit this list to add/remove.
fetch_skill "https://github.com/anthropics/skills.git"      "skills/frontend-design"      "frontend-design"
fetch_skill "https://github.com/vercel-labs/next-skills.git" "skills/next-best-practices"  "next-best-practices"
fetch_skill "https://github.com/shadcn/ui.git"               "skills/shadcn"               "shadcn"

echo "Done. Review changes with:"
echo "  git diff --stat .claude/skills/"
echo ""
echo "Commit if everything looks good:"
echo "  git add .claude/skills/ && git commit -m 'chore(skills): refresh from upstream'"
