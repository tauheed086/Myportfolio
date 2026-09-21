# Git Remote Operations Rule

## Behavioral Constraint: No Unprompted Remote Pushes
- **NEVER** run `git push` or publish commits to any remote repository (GitHub, GitLab, Bitbucket, etc.) automatically.
- Only run `git push` if the user explicitly instructs you in the prompt (e.g., "push to github", "push my changes to git", or "git push").
- Commits may be made locally if requested or needed, but remote synchronization must always remain strictly opt-in by the user.
