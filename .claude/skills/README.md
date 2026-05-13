# Claude Skills

These skills load automatically in Claude Code, Cursor, Codex, Gemini CLI, and any tool that follows the [Agent Skills standard](https://agentskills.io). They give the AI specialized knowledge about this stack — Claude reads only the skill names at startup (~100 tokens each) and loads the full content only when relevant to your task.

## What's installed

| Skill | Source | Purpose |
| --- | --- | --- |
| [frontend-design](./frontend-design/) | [`anthropics/skills`](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | Avoid generic AI-slop UIs. Pushes Claude toward distinctive, intentional design. |
| [next-best-practices](./next-best-practices/) | [`vercel-labs/next-skills`](https://github.com/vercel-labs/next-skills/tree/main/skills/next-best-practices) | Next.js App Router conventions: RSC boundaries, data patterns, async APIs, metadata, error handling, route handlers, image/font optimization, bundling. |
| [shadcn](./shadcn/) | [`shadcn/ui`](https://github.com/shadcn/ui/tree/main/skills/shadcn) | Official shadcn/ui skill. Reads `components.json`, knows the CLI, enforces composition rules (FieldGroup for forms, semantic color tokens, etc.). |

## How they're loaded

- **Claude Code**: Auto-discovered when in this project. Run `/skills` to see what's active.
- **Cursor**: Set the rules path to `.claude/skills/` (or use the bridge plugin).
- **Codex / Gemini CLI**: Same `.claude/skills/` path is the standard.

If you're not sure they're working, ask Claude: *"What skills do you have loaded for this project?"*

## Updating the skills

Skills are vendored (copied in) rather than referenced — that means they don't auto-update. Run `scripts/update-skills.sh` from the project root every 1–3 months to pull the latest versions:

```bash
./scripts/update-skills.sh
```

Review the diff, commit if happy. If you've made local edits to a skill, the script will warn before overwriting.

## Adding more skills

Two patterns:

**Vendor (recommended for stable skills)**
```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/<org>/<repo>.git /tmp/skill
cd /tmp/skill && git sparse-checkout set <path-to-skill>
cp -r /tmp/skill/<path> /your/project/.claude/skills/
```

**Reference via npx skills**
```bash
npx skills add <github-org>/<repo> --skill <skill-name>
```
This installs into `~/.claude/skills/` (user-level), not the project. Good for personal preferences, bad for shared team conventions.

## Writing your own

When you find yourself writing the same instructions in `CLAUDE.md` over and over, extract them into a project-specific skill:

```
.claude/skills/<your-skill-name>/
└── SKILL.md
```

The `SKILL.md` needs YAML frontmatter at the top:

```markdown
---
name: your-skill-name
description: One sentence describing when this skill should activate. Be specific.
---

# Your Skill Name

Instructions Claude follows when this skill is active...
```

Keep `SKILL.md` under ~500 lines. Put long reference material in adjacent `.md` files and link to them — they only get loaded when needed.
