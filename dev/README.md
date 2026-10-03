# dev/

Only for people who improve the framework itself (maintainer mode). Website users never need this folder.

| Path | What |
|---|---|
| [docs/](docs/README.md) | product principles, decisions, process, research, changelog |
| `scripts/` | repository maintenance: docs check, changelog archive, smoke test |
| `tests/` | automated tests (`npm test`) |
| `hooks/` | git hooks (conventional commits, protected main, secret guard); activated by `npm run setup` |
| `config/` | Prettier, ESLint and commit message configuration |

Quality gates: `npm run check`. Workflow: [git workflow](docs/process/git-workflow.md).
