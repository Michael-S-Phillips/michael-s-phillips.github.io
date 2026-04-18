---
layout: archive
title: "CV"
permalink: /cv/
author_profile: false
---

<style>
/* ============================================================
   CV — Visual Design
   ============================================================ */

.cv-wrap {
  max-width: 860px;
  margin: 0 auto;
  padding: 2.5em 2em 5em;
  font-family: 'Jost', -apple-system, sans-serif;
  font-weight: 300;
}

/* Section structure */
.cv-section {
  margin-bottom: 4.5em;
}

.cv-section-label {
  font-family: 'Jost', sans-serif;
  font-size: 0.65em;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--mars-ochre, #e07b39);
  margin-bottom: 1.6em;
  display: flex;
  align-items: center;
  gap: 1em;
}

.cv-section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--global-border-color, #1e2330);
}

/* ============================================================
   Hero / tagline
   ============================================================ */

.cv-hero {
  margin-bottom: 4em;
  padding-bottom: 2.5em;
  border-bottom: 1px solid var(--global-border-color, #1e2330);
}

.cv-hero-title {
  font-family: 'Crimson Pro', Georgia, serif;
  font-weight: 300;
  font-size: 3em;
  letter-spacing: 0.03em;
  color: var(--parchment, #e4ddd4);
  line-height: 1.1;
  margin: 0 0 0.2em;
}

.cv-hero-subtitle {
  font-family: 'Jost', sans-serif;
  font-weight: 300;
  font-size: 0.88em;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--global-text-color-light, #6b7a96);
  margin: 0 0 1.5em;
}

.cv-hero-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75em;
  margin-top: 1.2em;
}

.cv-hero-link {
  font-size: 0.75em;
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--global-text-color-light, #6b7a96) !important;
  border: 1px solid var(--global-border-color, #1e2330);
  padding: 0.4em 0.9em;
  border-radius: 2px;
  text-decoration: none !important;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.cv-hero-link:hover {
  color: var(--mars-ochre, #e07b39) !important;
  border-color: var(--mars-ochre, #e07b39) !important;
}

/* ============================================================
   Position block
   ============================================================ */

.cv-position {
  display: flex;
  gap: 1.5em;
  align-items: flex-start;
}

.cv-position-year {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72em;
  color: var(--mars-ochre, #e07b39);
  white-space: nowrap;
  padding-top: 0.2em;
  min-width: 5em;
}

.cv-position-body h3 {
  font-family: 'Crimson Pro', Georgia, serif;
  font-weight: 400;
  font-size: 1.35em;
  color: var(--parchment, #e4ddd4);
  margin: 0 0 0.15em;
}

.cv-position-body p {
  font-size: 0.85em;
  color: var(--global-text-color-light, #6b7a96);
  margin: 0;
  line-height: 1.6;
}

/* ============================================================
   Education timeline
   ============================================================ */

.cv-timeline {
  position: relative;
  padding-left: 2em;
}

.cv-timeline::before {
  content: '';
  position: absolute;
  left: 0.35em;
  top: 0.5em;
  bottom: 0.5em;
  width: 1px;
  background: linear-gradient(
    to bottom,
    var(--mars-ochre, #e07b39),
    rgba(224, 123, 57, 0.15)
  );
}

.cv-timeline-item {
  position: relative;
  margin-bottom: 2.4em;
}

.cv-timeline-item::before {
  content: '';
  position: absolute;
  left: -1.66em;
  top: 0.45em;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--mars-ochre, #e07b39);
  box-shadow: 0 0 0 3px rgba(224, 123, 57, 0.15);
}

.cv-timeline-item:last-child {
  margin-bottom: 0;
}

.cv-timeline-item:last-child::before {
  background: transparent;
  border: 1px solid rgba(224, 123, 57, 0.4);
}

.cv-edu-degree {
  font-family: 'Crimson Pro', Georgia, serif;
  font-weight: 400;
  font-size: 1.25em;
  color: var(--parchment, #e4ddd4);
  margin: 0 0 0.1em;
  line-height: 1.3;
}

.cv-edu-institution {
  font-size: 0.85em;
  color: var(--global-text-color, #ccc5bc);
  margin: 0.15em 0 0.1em;
  line-height: 1.5;
}

.cv-edu-meta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7em;
  color: var(--global-text-color-light, #6b7a96);
  letter-spacing: 0.04em;
  margin: 0.2em 0 0;
}

.cv-edu-field {
  display: inline-block;
  font-size: 0.7em;
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--mars-ochre, #e07b39);
  background: rgba(224, 123, 57, 0.08);
  border: 1px solid rgba(224, 123, 57, 0.2);
  padding: 0.15em 0.55em;
  border-radius: 2px;
  margin-top: 0.4em;
}

/* ============================================================
   Publications
   ============================================================ */

.cv-pub-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cv-pub-item {
  display: grid;
  grid-template-columns: 2.2em 1fr;
  gap: 0 1em;
  margin-bottom: 2em;
  padding-bottom: 2em;
  border-bottom: 1px solid var(--global-border-color, #1e2330);
}

.cv-pub-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.cv-pub-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7em;
  color: rgba(224, 123, 57, 0.45);
  padding-top: 0.25em;
  text-align: right;
}

.cv-pub-title {
  font-family: 'Crimson Pro', Georgia, serif;
  font-weight: 400;
  font-size: 1.2em;
  line-height: 1.35;
  color: var(--parchment, #e4ddd4);
  margin: 0 0 0.35em;
}

.cv-pub-title a {
  color: inherit !important;
  text-decoration: none !important;
  border-bottom: 1px solid rgba(224, 123, 57, 0.3);
  transition: border-color 0.2s ease, color 0.2s ease;
}

.cv-pub-title a:hover {
  color: var(--mars-ochre, #e07b39) !important;
  border-bottom-color: var(--mars-ochre, #e07b39);
}

.cv-pub-authors {
  font-size: 0.82em;
  color: var(--global-text-color-light, #6b7a96);
  margin: 0 0 0.4em;
  line-height: 1.55;
}

.cv-pub-authors strong {
  color: var(--global-text-color, #ccc5bc);
  font-weight: 500;
}

.cv-pub-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5em;
  margin-top: 0.4em;
}

.cv-pub-journal {
  font-family: 'Jost', sans-serif;
  font-size: 0.7em;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--space-blue, #4a9bbe);
}

.cv-pub-year {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7em;
  color: var(--global-text-color-light, #6b7a96);
}

.cv-pub-doi {
  font-family: 'Jost', sans-serif;
  font-size: 0.7em;
  color: var(--global-text-color-light, #6b7a96) !important;
  letter-spacing: 0.03em;
  text-decoration: none !important;
  border-bottom: 1px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.cv-pub-doi:hover {
  color: var(--mars-ochre, #e07b39) !important;
  border-bottom-color: rgba(224, 123, 57, 0.4);
}

.cv-pub-dot {
  color: var(--global-border-color, #1e2330);
  font-size: 0.8em;
}

/* ============================================================
   Software
   ============================================================ */

.cv-software-item {
  display: flex;
  gap: 1.5em;
  align-items: flex-start;
  padding: 1.4em 1.6em;
  border: 1px solid var(--global-border-color, #1e2330);
  border-radius: 3px;
  margin-bottom: 1em;
  transition: border-color 0.25s ease, background 0.25s ease;
}

.cv-software-item:hover {
  border-color: rgba(224, 123, 57, 0.3);
  background: rgba(224, 123, 57, 0.03);
}

.cv-software-icon {
  font-size: 1.4em;
  color: rgba(224, 123, 57, 0.5);
  padding-top: 0.1em;
}

.cv-software-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.95em;
  color: var(--parchment, #e4ddd4);
  margin: 0 0 0.3em;
}

.cv-software-desc {
  font-size: 0.83em;
  color: var(--global-text-color-light, #6b7a96);
  margin: 0 0 0.5em;
  line-height: 1.6;
}

.cv-software-link {
  font-size: 0.72em;
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--mars-ochre, #e07b39) !important;
  text-decoration: none !important;
  border-bottom: 1px solid rgba(224, 123, 57, 0.35);
  transition: border-color 0.2s ease;
}

.cv-software-link:hover {
  border-bottom-color: var(--mars-ochre, #e07b39);
}

/* ============================================================
   Conference papers
   ============================================================ */

.cv-conf-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cv-conf-item {
  display: grid;
  grid-template-columns: 2.2em 1fr;
  gap: 0 1em;
  margin-bottom: 1.6em;
  padding-bottom: 1.6em;
  border-bottom: 1px solid var(--global-border-color, #1e2330);
}

.cv-conf-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.cv-conf-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7em;
  color: rgba(74, 155, 190, 0.45);
  padding-top: 0.2em;
  text-align: right;
}

.cv-conf-title {
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1.1em;
  font-weight: 400;
  color: var(--parchment, #e4ddd4);
  margin: 0 0 0.3em;
  line-height: 1.35;
}

.cv-conf-title a {
  color: inherit !important;
  text-decoration: none !important;
  border-bottom: 1px solid rgba(74, 155, 190, 0.3);
  transition: color 0.2s ease, border-color 0.2s ease;
}

.cv-conf-title a:hover {
  color: var(--space-blue, #4a9bbe) !important;
  border-bottom-color: var(--space-blue, #4a9bbe);
}

.cv-conf-meta {
  font-size: 0.78em;
  color: var(--global-text-color-light, #6b7a96);
  line-height: 1.55;
}

.cv-conf-venue {
  font-family: 'Jost', sans-serif;
  font-size: 0.7em;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--space-blue, #4a9bbe);
}

/* ============================================================
   Responsive
   ============================================================ */

@media (max-width: 600px) {
  .cv-wrap { padding: 1.5em 1.2em 4em; }
  .cv-hero-title { font-size: 2.1em; }
  .cv-pub-item, .cv-conf-item { grid-template-columns: 1.6em 1fr; }
  .cv-position { flex-direction: column; gap: 0.4em; }
}
</style>

<div class="cv-wrap">

  <!-- ─── Hero ─────────────────────────────────────────────── -->

  <div class="cv-hero">
    <div class="cv-hero-title">Michael S. Phillips</div>
    <div class="cv-hero-subtitle">Planetary Scientist · Mars Geology &amp; Astrobiology</div>
    <div class="cv-hero-links">
      <a class="cv-hero-link" href="https://orcid.org/0000-0001-8873-2238"><i class="ai ai-orcid" style="margin-right:0.4em"></i>ORCID</a>
      <a class="cv-hero-link" href="https://scholar.google.com/citations?user=PS_CX0AAAAAJ"><i class="ai ai-google-scholar" style="margin-right:0.4em"></i>Google Scholar</a>
      <a class="cv-hero-link" href="https://github.com/Michael-S-Phillips"><i class="fab fa-github" style="margin-right:0.4em"></i>GitHub</a>
    </div>
  </div>

  <!-- ─── Current Position ──────────────────────────────────── -->

  <div class="cv-section">
    <div class="cv-section-label">Position</div>
    <div class="cv-position">
      <div class="cv-position-year">2023 — now</div>
      <div class="cv-position-body">
        <h3>Research Scientist</h3>
        <p>Lunar and Planetary Laboratory · The University of Arizona · Tucson, AZ</p>
      </div>
    </div>
  </div>

  <!-- ─── Education ─────────────────────────────────────────── -->

  <div class="cv-section">
    <div class="cv-section-label">Education</div>
    <div class="cv-timeline">

      <div class="cv-timeline-item">
        <div class="cv-edu-degree">Postdoctoral Fellow</div>
        <div class="cv-edu-institution">Johns Hopkins University Applied Physics Laboratory · Laurel, MD</div>
        <div class="cv-edu-meta">2021 – 2023</div>
        <span class="cv-edu-field">Planetary Science</span>
      </div>

      <div class="cv-timeline-item">
        <div class="cv-edu-degree">Doctor of Philosophy</div>
        <div class="cv-edu-institution">The University of Tennessee, Knoxville · Knoxville, TN</div>
        <div class="cv-edu-meta">2015 – 2021</div>
        <span class="cv-edu-field">Geology</span>
      </div>

      <div class="cv-timeline-item">
        <div class="cv-edu-degree">Master of Science</div>
        <div class="cv-edu-institution">The University of Tennessee, Knoxville · Knoxville, TN</div>
        <div class="cv-edu-meta">2015 – 2019</div>
        <span class="cv-edu-field">Geology</span>
      </div>

      <div class="cv-timeline-item">
        <div class="cv-edu-degree">Bachelor of Science</div>
        <div class="cv-edu-institution">Marietta College · Marietta, OH</div>
        <div class="cv-edu-meta">2010 – 2014</div>
        <span class="cv-edu-field">Geology</span>
      </div>

    </div>
  </div>

  <!-- ─── Peer-Reviewed Publications ───────────────────────── -->

  <div class="cv-section">
    <div class="cv-section-label">Peer-Reviewed Publications</div>
    <ul class="cv-pub-list">

      <li class="cv-pub-item">
        <div class="cv-pub-num">5</div>
        <div>
          <div class="cv-pub-title">
            <a href="https://linkinghub.elsevier.com/retrieve/pii/S0019103523002890">A first look at CRISM hyperspectral mapping mosaicked data: Results from Mawrth Vallis</a>
          </div>
          <div class="cv-pub-authors"><strong>Phillips M</strong>, Murchie S, Seelos F, et al.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Icarus</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2024</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.1016/j.icarus.2023.115712">10.1016/j.icarus.2023.115712</a>
          </div>
        </div>
      </li>

      <li class="cv-pub-item">
        <div class="cv-pub-num">4</div>
        <div>
          <div class="cv-pub-title">
            <a href="https://www.nature.com/articles/s41550-022-01882-x">Orbit-to-ground framework to decode and predict biosignature patterns in terrestrial analogues</a>
          </div>
          <div class="cv-pub-authors">Warren-Rhodes K, Cabrol N, <strong>Phillips M</strong>, et al.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Nature Astronomy</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2023</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.1038/s41550-022-01882-x">10.1038/s41550-022-01882-x</a>
          </div>
        </div>
      </li>

      <li class="cv-pub-item">
        <div class="cv-pub-num">3</div>
        <div>
          <div class="cv-pub-title">
            <a href="https://pubmed.ncbi.nlm.nih.gov/36520604/">Planetary Mapping Using Deep Learning: A Method to Evaluate Feature Identification Confidence Applied to Habitats in Mars-Analog Terrain</a>
          </div>
          <div class="cv-pub-authors"><strong>Phillips MS</strong>, Moersch JE, Cabrol NA, et al.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Astrobiology</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2023</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.1089/ast.2022.0014">10.1089/ast.2022.0014</a>
          </div>
        </div>
      </li>

      <li class="cv-pub-item">
        <div class="cv-pub-num">2</div>
        <div>
          <div class="cv-pub-title">
            <a href="https://www.mdpi.com/2072-4292/15/2/314">Salt Constructs in Paleo-Lake Basins as High-Priority Astrobiology Targets</a>
          </div>
          <div class="cv-pub-authors"><strong>Phillips M</strong>, McInenly M, Hofmann M, et al.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Remote Sensing</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2023</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.3390/rs15020314">10.3390/rs15020314</a>
          </div>
        </div>
      </li>

      <li class="cv-pub-item">
        <div class="cv-pub-num">1</div>
        <div>
          <div class="cv-pub-title">
            <a href="https://pubs.geoscienceworld.org/geology/article/50/10/1182/615121/">Extensive and ancient feldspathic crust detected across north Hellas rim, Mars: Possible implications for primary crust formation</a>
          </div>
          <div class="cv-pub-authors"><strong>Phillips M</strong>, Viviano C, Moersch J, et al.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Geology</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2022</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.1130/G50341.1">10.1130/G50341.1</a>
          </div>
        </div>
      </li>

    </ul>
  </div>

  <!-- ─── Conference & Other Products ──────────────────────── -->

  <div class="cv-section">
    <div class="cv-section-label">Conference Papers &amp; Other Products</div>
    <ul class="cv-conf-list">

      <li class="cv-conf-item">
        <div class="cv-conf-num">5</div>
        <div>
          <div class="cv-conf-title">Spectral Cube Analysis Tool: A Python Program for Analyzing Multi- and Hyperspectral Images</div>
          <div class="cv-conf-meta">
            <span class="cv-conf-venue">LPSC 2024</span>
            &nbsp;·&nbsp; <em>Bibcode: 2024LPICo3040.2637P</em>
          </div>
        </div>
      </li>

      <li class="cv-conf-item">
        <div class="cv-conf-num">4</div>
        <div>
          <div class="cv-conf-title">HyPyRameter: A Python Toolbox to Calculate Hyperspectral Reflectance Parameters</div>
          <div class="cv-conf-meta">
            <span class="cv-conf-venue">LPSC 2023</span>
            &nbsp;·&nbsp; <em>with Moersch JE, Basu U, Hamilton CW &nbsp;·&nbsp; Bibcode: 2023LPICo2806.2245P</em>
          </div>
        </div>
      </li>

      <li class="cv-conf-item">
        <div class="cv-conf-num">3</div>
        <div>
          <div class="cv-conf-title">
            <a href="https://doi.org/10.5194/epsc2022-1200">What is that? Identification confidence of Mars analog habitats with Deep Learning</a>
          </div>
          <div class="cv-conf-meta">
            <span class="cv-conf-venue">EPSC 2022</span>
          </div>
        </div>
      </li>

      <li class="cv-conf-item">
        <div class="cv-conf-num">2</div>
        <div>
          <div class="cv-conf-title">
            <a href="https://linkinghub.elsevier.com/retrieve/pii/S0019103521000051">The lifecycle of hollows on Mercury: An evaluation of candidate volatile phases and a novel model of formation</a>
          </div>
          <div class="cv-conf-meta">
            <span class="cv-conf-venue">Icarus</span>
            &nbsp;·&nbsp; 2021 &nbsp;·&nbsp; with Moersch J, Viviano C, et al.
          </div>
        </div>
      </li>

      <li class="cv-conf-item">
        <div class="cv-conf-num">1</div>
        <div>
          <div class="cv-conf-title">
            <a href="https://pubmed.ncbi.nlm.nih.gov/31862591/">Temporal multispectral and 3D analysis of Cerro de Pasco, Peru</a>
          </div>
          <div class="cv-conf-meta">
            <span class="cv-conf-venue">Science of the Total Environment</span>
            &nbsp;·&nbsp; 2020 &nbsp;·&nbsp; Melton CA, Hughes DC, Page DL, <strong>Phillips MS</strong>
          </div>
        </div>
      </li>

    </ul>
  </div>

  <!-- ─── Software & Tools ──────────────────────────────────── -->

  <div class="cv-section">
    <div class="cv-section-label">Software &amp; Tools</div>

    <div class="cv-software-item">
      <div class="cv-software-icon"><i class="fab fa-github"></i></div>
      <div>
        <div class="cv-software-name">HyPyRameter</div>
        <div class="cv-software-desc">Python toolbox for calculating spectral parameters from hyperspectral reflectance data. Developed for analysis of CRISM and Mars analog datasets.</div>
        <a class="cv-software-link" href="https://github.com/Michael-S-Phillips/HyPyRameter">github.com/Michael-S-Phillips/HyPyRameter</a>
      </div>
    </div>

    <div class="cv-software-item">
      <div class="cv-software-icon"><i class="fab fa-github"></i></div>
      <div>
        <div class="cv-software-name">Spectral Cube Analysis Tool</div>
        <div class="cv-software-desc">Python program for analyzing multi- and hyperspectral image cubes. Presented at LPSC 2024.</div>
        <a class="cv-software-link" href="https://github.com/Michael-S-Phillips">github.com/Michael-S-Phillips</a>
      </div>
    </div>

  </div>

</div>
