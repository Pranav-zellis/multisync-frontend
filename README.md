# multisync-frontend
ZELLIS Multisync frontend repository

# Branching policy

## development branch
New feature branches should be merged to the `development` branch.

## staging branch
This branch is a mirror branch of `development` branch for **QA**. When `development` branch is ready for QA, merge it into `staging` to start QA/CD pipeline.

## main branch
Only fully tested, production-ready code is merged here (always from `staging` branch).

### Exception workflow
For hotfixes or bespoke client changes that require quick deployment, the developer may directly merge the feature/hotfix branch to `staging` branch, run QA/CD pipeline and then merge with `main`. 
You must ensure to keep the development branch up-to-date with the staging branch when you merge a hotfix/feature branch to staging via:
1. Cherry pick the commit from staging to development branch (recommended - gives granular control of commits being added to development with clean history)
2. Back-merge to development branch.

test - gh actions ecr image push