# ──────────────────────────────────────────────────────────────────────────────
# Michael Phillips — Personal Website
# ──────────────────────────────────────────────────────────────────────────────
# Usage:
#   make sync        Sync publications from ORCID + Google Scholar, rebuild graph
#   make serve       Sync, then start the Jekyll development server
#   make build       Sync, then build the static site to _site/
#   make test        Run the test suite
#   make help        Show this message
#
# The Python venv at ./venv is created automatically on first run if it doesn't
# exist.  Activate it manually with `source venv/bin/activate` if you want to
# run scripts directly.
# ──────────────────────────────────────────────────────────────────────────────

PYTHON    := python3
VENV      := venv
PIP       := $(VENV)/bin/pip
PYTHON_V  := $(VENV)/bin/python

.PHONY: help sync serve build test venv

help:
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) \
	  | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-12s %s\n", $$1, $$2}'
	@echo ""
	@echo "  make sync   — fetch new publications and rebuild graph"
	@echo "  make serve  — sync + jekyll serve -l -H localhost"
	@echo "  make build  — sync + jekyll build"
	@echo "  make test   — run pytest suite"

venv: ## Create Python virtual environment and install dependencies
	$(PYTHON) -m venv $(VENV)
	$(PIP) install --quiet --upgrade pip
	$(PIP) install --quiet scholarly
	@echo "Virtual environment ready. Run: source venv/bin/activate"

sync: venv ## Sync publications from ORCID + Scholar, rebuild graph
	$(PYTHON_V) scripts/sync_publications.py
	$(PYTHON_V) scripts/build_graph.py

serve: sync ## Sync publications, then start Jekyll dev server
	bundle exec jekyll serve -l -H localhost

build: sync ## Sync publications, then build site to _site/
	bundle exec jekyll build

test: ## Run the test suite
	$(PYTHON) -m pytest tests/ -v
