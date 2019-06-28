# Github drive Jira

Use Github webhook to update Jira ticket

## How to use

TBD

## Prepend commit messages with branch name

Install pre-commit on your local machine:

```
brew install pre-commit
```

Add a `.pre-commit-config.yaml` file to your project with the following content:

```yaml
repos:
  - repo: https://github.com/milin/giticket
    rev: "868d937"
    hooks:
      - id: giticket
        args: ["--format=[{ticket}] {commit_msg}"] # Optional
```
