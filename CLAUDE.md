# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal academic website built using the Academic Pages Jekyll template. The site showcases research publications, talks, teaching experience, and portfolio items for a planetary scientist specializing in Mars geology and astrobiology.

**Working Directory**: `michaelphillips.github.io/`

All development work should be done within the `michaelphillips.github.io` subdirectory.

## Technology Stack

- **Jekyll**: Static site generator (GitHub Pages compatible)
- **Ruby**: Jekyll runtime environment
- **Node.js**: JavaScript build tools for asset compilation
- **Markdown/Kramdown**: Content format
- **Liquid**: Templating language
- **SCSS/Sass**: Styling

## Development Commands

### Local Development

Start the Jekyll development server:
```bash
cd michaelphillips.github.io
bundle install  # First time only, or after Gemfile changes
jekyll serve -l -H localhost
# OR use: bundle exec jekyll serve -l -H localhost
```

The site will be available at `http://localhost:4000`. Changes are automatically rebuilt and refreshed.

### Docker-based Development

Alternative approach using Docker:
```bash
cd michaelphillips.github.io
chmod -R 777 .
docker compose up
```

### JavaScript Build

Build minified JavaScript assets:
```bash
cd michaelphillips.github.io
npm install  # First time only
npm run build:js
npm run watch:js  # Watch mode for development
```

### Content Generation

Generate markdown files from TSV data for publications and talks:
```bash
cd michaelphillips.github.io/markdown_generator
python publications.py  # Generate publication pages from TSV
python talks.py         # Generate talk pages from TSV
# Jupyter notebooks (.ipynb) available for same functionality
```

## Architecture and Structure

### Jekyll Collections

The site uses Jekyll collections for different content types:

- **`_publications/`**: Research papers and publications (output to `/publications/`)
- **`_talks/`**: Conference presentations and talks (output to `/talks/`)
- **`_teaching/`**: Teaching experience entries (output to `/teaching/`)
- **`_portfolio/`**: Portfolio items (output to `/portfolio/`)
- **`_posts/`**: Blog posts (standard Jekyll posts)

Each collection item is a markdown file with YAML frontmatter defining metadata.

### Site Configuration

**`_config.yml`**: Central configuration file controlling:
- Site metadata (title, description, URL)
- Author profile information
- Social media links and academic profile links
- Collection definitions and output settings
- Jekyll plugins and build settings
- Navigation and layout defaults

**Important**: Changes to `_config.yml` require restarting the Jekyll server.

### Key Directories

- **`_data/`**: Site-wide data files (navigation.yml, cv.json, ui-text.yml)
- **`_includes/`**: Reusable HTML/Liquid template fragments
- **`_layouts/`**: Page layout templates
- **`_pages/`**: Static pages (About, CV, etc.)
- **`_sass/`**: SCSS stylesheets
- **`assets/`**: Static assets (images, JavaScript, CSS)
- **`files/`**: Downloadable files (PDFs, etc.) accessible at `/files/`
- **`markdown_generator/`**: Python scripts/notebooks for bulk content generation

### Content Generation Workflow

Publications and talks can be managed in TSV files and bulk-converted to markdown:

1. Edit TSV files in `markdown_generator/` directory
2. Run Python scripts or Jupyter notebooks to generate markdown files
3. Generated files are placed in appropriate collection directories
4. Jekyll processes these into individual pages

This is useful for managing large numbers of publications from BibTeX or spreadsheet data.

## Site URL Configuration

The site is configured with:
- **Base URL**: `/michaelphillips.github.io`
- **Full URL**: `https://michael-s-phillips.github.io/michaelphillips.github.io`
- **Repository**: `michael-s-phillips/michaelphillips.github.io`

All internal links use the baseurl setting for GitHub Pages compatibility.

## Jekyll Plugins

The site uses these GitHub Pages-compatible plugins (defined in `_config.yml`):
- `jekyll-feed`: RSS feed generation
- `jekyll-sitemap`: Sitemap generation
- `jekyll-paginate`: Pagination support
- `jekyll-redirect-from`: URL redirection
- `jemoji`: Emoji support

## Markdown Processing

- **Engine**: Kramdown with GitHub Flavored Markdown (GFM) input
- **Syntax highlighting**: Rouge
- Files in collections use YAML frontmatter followed by markdown content
- Math support available via MathJax (if configured in layouts)

## Navigation

Navigation structure is defined in `_data/navigation.yml`. This controls the main site navigation menu.

## Deployment

The site is deployed via GitHub Pages. Pushing to the repository triggers automatic build and deployment. No manual build process is required for production deployment.
