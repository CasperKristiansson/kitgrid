-include .env

AWS_PROFILE ?= Personal
S3_BUCKET ?= kitgrid-sites
REGISTRY_JSON ?= registry.json
DEPLOY_ROOT ?= .kitgrid-cache/deploy
SYNC_PROJECTS := $(shell node -e "const fs=require('fs');const data=JSON.parse(fs.readFileSync('$(REGISTRY_JSON)','utf8'));const ids=data.filter(item => item.sync_docs).map(item => item.id);process.stdout.write(ids.join(' '));")

ifndef CF_DISTRIBUTION_ID
$(error CF_DISTRIBUTION_ID is not set. Add it to .env)
endif

.PHONY: fetch-docs build-sites package-sites clean-s3 sync-s3 invalidate deploy

fetch-docs:
	@set -e; \
	if [ -z "$(SYNC_PROJECTS)" ]; then \
		echo "No syncable projects found in $(REGISTRY_JSON)"; \
	else \
		for project in $(SYNC_PROJECTS); do \
			echo "Fetching docs for $$project"; \
			pnpm docs:fetch -- --project $$project; \
		done; \
	fi

build-sites:
	pnpm build:sites

package-sites:
	pnpm package:sites

clean-s3:
	aws --profile $(AWS_PROFILE) s3 rm s3://$(S3_BUCKET) --recursive

sync-s3:
	aws --profile $(AWS_PROFILE) s3 sync $(DEPLOY_ROOT) s3://$(S3_BUCKET) --delete

invalidate:
	@set -e; \
	paths="$$(pnpm --silent deploy:paths)"; \
	echo "Invalidating paths $$paths on distribution $(CF_DISTRIBUTION_ID)"; \
	aws --profile $(AWS_PROFILE) cloudfront create-invalidation \
		--distribution-id $(CF_DISTRIBUTION_ID) \
		--paths $$paths

deploy: fetch-docs build-sites package-sites clean-s3 sync-s3 invalidate
