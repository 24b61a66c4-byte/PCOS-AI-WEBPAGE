# Git history removal and key rotation

This document describes safe steps to remove committed secrets from git history and rotate affected credentials. Follow these steps carefully and coordinate with any collaborators before force-pushing rewritten branches.

## Summary
- Identify commits containing secrets.
- Rewrite history to remove those secrets (recommended: `git filter-repo` or BFG).
- Rotate all exposed credentials (Supabase, OpenRouter/OpenAI, Perplexity, any other keys).
- Update tracked files to use placeholders and move real secrets to environment variables.

## 1) Identify sensitive commits

Use `git grep` to find files with secrets and note commit ranges:

```bash
git grep -n "SUPABASE_ANON_KEY\|SUPABASE_URL\|OPENROUTER_API_KEY\|OPENAI_API_KEY\|service_role" -- './'
```

Inspect git history for the files found:

```bash
git log --pretty=oneline -- <path/to/file>
```

## 2) Prepare for history rewrite

- Inform collaborators and coordinate a maintenance window.
- Create a backup branch: `git branch backup-before-rewrite` and push it to origin.

## 3) Rewrite history (recommended: git filter-repo)

Install `git-filter-repo` (Python tool):

```bash
pip install git-filter-repo
```

Example: remove a string value (replace `SECRET_VALUE` with actual secret) from all history:

```bash
git filter-repo --replace-text <(printf "SECRET_VALUE==>REMOVED_FROM_HISTORY")
```

Alternatively, remove files entirely (e.g., `frontend/config.prod.js`):

```bash
git filter-repo --invert-paths --path frontend/config.prod.js
```

After rewrite, run `git log -- <file>` to confirm the sensitive content is gone.

## 4) Push rewritten branches (force)

After testing locally, force-push the rewritten branch to origin. Example for `main`:

```bash
git push --force origin main
```

Warning: This rewrites history for everyone. Ask collaborators to re-clone or run `git fetch` + `git reset --hard origin/main`.

## 5) Rotate exposed credentials

For each exposed service, immediately rotate keys in the provider dashboard and update any deployed environments.

- Supabase:
  - Rotate `service_role`/anon keys in Supabase project settings.
  - Recreate any DB credentials if necessary.
  - Update server-side environment variables (`.env`, CI secrets).

- OpenRouter / OpenAI / other AI providers:
  - Revoke the exposed API key and create a new one.
  - Update backend env (e.g., `OPENROUTER_API_KEY`) and any serverless secrets.

- Perplexity / other services: follow the provider's rotation steps.

## 6) Update repository to avoid reintroducing secrets

- Replace secrets in tracked files with placeholders (done).
- Add `.env.example` with the environment variable names and usage notes.
- Add or update `.gitignore` to avoid committing secret files.
- Use server-side proxies for AI keys; do not put secret keys in frontend code.

## 7) Validate

- Run `git grep` across the repository to confirm no secrets remain in the current branch.
- Use secret-scanning tools (GitHub Advanced Security, truffleHog, detect-secrets) to verify.

## 8) Post-rewrite collaborator instructions

- Everyone must re-clone the repository, or run:

```bash
git fetch origin
git checkout main
git reset --hard origin/main
```

## Notes
- If you cannot use `git-filter-repo`, the BFG Repo-Cleaner is an alternative: https://rtyley.github.io/bfg-repo-cleaner/
- Preserve backups until you confirm all services work with rotated keys.

---
Prepared by automated assistant to help remove committed secrets and rotate credentials.
