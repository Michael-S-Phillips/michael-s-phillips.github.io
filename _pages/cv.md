---
layout: archive
title: "Curriculum Vitae"
permalink: /cv/
author_profile: false
banner:
  image: /assets/images/banners/field-pajonales-salar.jpg
  eyebrow: "Michael S. Phillips"
  subtitle: "Research Scientist · Lunar & Planetary Laboratory · The University of Arizona"
  position: "center 42%"
  caption: "Salar de Pajonales, Chile · 2018"
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

  <div class="cv-hero cv-hero--links">
    <div class="cv-hero-links">
      <a class="cv-hero-link" href="https://orcid.org/0000-0001-8873-2238"><i class="ai ai-orcid" style="margin-right:0.4em"></i>ORCID</a>
      <a class="cv-hero-link" href="https://scholar.google.com/citations?user=1DCuzasAAAAJ&hl=en"><i class="ai ai-google-scholar" style="margin-right:0.4em"></i>Google Scholar</a>
      <a class="cv-hero-link" href="https://github.com/Michael-S-Phillips"><i class="fab fa-github" style="margin-right:0.4em"></i>GitHub</a>
      <a class="cv-hero-link" href="mailto:phillipsm@arizona.edu"><i class="fas fa-envelope" style="margin-right:0.4em"></i>Email</a>
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
  <!-- Generated from verified _publications/ entries (pubtype journal|chapter). -->

  <div class="cv-section">
    <div class="cv-section-label">Peer-Reviewed Publications (18)</div>
    <ul class="cv-pub-list">

      <li class="cv-pub-item">
        <div class="cv-pub-num">18</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.1029/2026JE009705">Visible to Near-Infrared Properties of Felsic Rocks: Plagioclase Detection Limits and Applications to Mars Orbital Spectra</a></div>
          <div class="cv-pub-authors">Vannier, H., Horgan, B.H.N., <strong>Phillips, M.S.</strong>, Eddy, M., Greenberger, R., & Udry, A.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Journal of Geophysical Research: Planets</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2026</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">131(9), e2026JE009705</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.1029/2026JE009705">10.1029/2026JE009705</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">17</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.1038/s43247-026-03617-6">Proposed identification criteria of the Martian lower crust and mantle excavated by the Isidis impact</a></div>
          <div class="cv-pub-authors">Trowbridge, A.J., Horgan, B., Weiss, B.P., & <strong>Phillips, M.S.</strong></div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Communications Earth &amp; Environment</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2026</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">7(1), 714</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.1038/s43247-026-03617-6">10.1038/s43247-026-03617-6</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">16</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.1029/2025JH000827">A Domain-Specific Vision Foundation Model for Mars: Self-Supervised Learning for Planetary-Scale Science Discovery</a></div>
          <div class="cv-pub-authors">Fang, J., Luo, W., Huang, Q., Zhang, L., <strong>Phillips, M.S.</strong>, Seethi, V.D.R., & Giannakis, I.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Journal of Geophysical Research: Machine Learning and Computation</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2026</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">3, e2025JH000827</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.1029/2025JH000827">10.1029/2025JH000827</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">15</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.1029/2025GL118112">Mercury's Hollows: A Potential Signature of Sulfur Exosphere-Subsurface Transport</a></div>
          <div class="cv-pub-authors">Verkercke, S., Leblanc, F., Chaufray, J.-Y., <strong>Phillips, M.S.</strong>, Munaretto, G., Caminiti, E., & Morrissey, L.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Geophysical Research Letters</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2025</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">52(24), e2025GL118112</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.1029/2025GL118112">10.1029/2025GL118112</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">14</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.1038/s43247-025-03004-7">Widespread ancient anorthosites in the lower crust of Mars</a></div>
          <div class="cv-pub-authors"><strong>Phillips, M.S.</strong>, Viviano, C.E., Rogers, A.D., Larson, L., Tornabene, L., Trowbridge, A., Moersch, J.E., & McSween Jr, H.Y.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Communications Earth &amp; Environment</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2025</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">6, 1026</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.1038/s43247-025-03004-7">10.1038/s43247-025-03004-7</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">13</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.3389/fspas.2025.1565830">A novel theoretical approach to predict the interannual variability of sulfur in Mercury’s exosphere and subsurface</a></div>
          <div class="cv-pub-authors">Verkercke, S., Chaufray, J.Y., Leblanc, F., Georgiou, A., <strong>Phillips, M.S.</strong>, Munaretto, G., Lewis, J., Ricketts, A., & Morrissey, L.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Frontiers in Astronomy and Space Sciences</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2025</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">12, 1565830</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.3389/fspas.2025.1565830">10.3389/fspas.2025.1565830</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">12</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.3847/PSJ/ad81f8">HyPyRameter: A Python Toolbox to Calculate Spectral Parameters from Hyperspectral Reflectance Data</a></div>
          <div class="cv-pub-authors"><strong>Phillips, M.S.</strong>, Tai Udovicic, C., Moersch, J.E., Basu, U., & Hamilton, C.W.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">The Planetary Science Journal</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2024</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">5(11), 258</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.3847/PSJ/ad81f8">10.3847/PSJ/ad81f8</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">11</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.3847/PSJ/ad55f4">Comparing Rover and Helicopter Planetary Mission Architectures in a Mars Analog Setting in Iceland</a></div>
          <div class="cv-pub-authors">Gwizd, S., Stack, K.M., Francis, R., Calef, F., Carr, B.B., Langley, C., Graff, J., Kristinsson, Þ.H., …, <strong>Phillips, M.S.</strong>, et al.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">The Planetary Science Journal</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2024</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">5(8), 172</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.3847/PSJ/ad55f4">10.3847/PSJ/ad55f4</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">10</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.1016/j.icarus.2023.115712">A first look at CRISM hyperspectral mapping mosaicked data: Results from Mawrth Vallis</a></div>
          <div class="cv-pub-authors"><strong>Phillips, M.S.</strong>, Murchie, S.L., Seelos, F.P., Hancock, K.M., Selby, C., Poffenbarger, R.T., Stephens, D.C., & Kawamura, M.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Icarus</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2024</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">419, 115712</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.1016/j.icarus.2023.115712">10.1016/j.icarus.2023.115712</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">9</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.1002/esp.5692">Gypsum-lined degassing holes in tumuli</a></div>
          <div class="cv-pub-authors">Hofmann, M.H., Hinman, N.W., <strong>Phillips, M.S.</strong>, McInenly, M., Chong-Diaz, G., Warren-Rhodes, K., & Cabrol, N.A.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Earth Surface Processes and Landforms</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2023</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">48(15), 3220-3236</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.1002/esp.5692">10.1002/esp.5692</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">8</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.1038/s41550-022-01882-x">Orbit-to-ground framework to decode and predict biosignature patterns in terrestrial analogues</a></div>
          <div class="cv-pub-authors">Warren-Rhodes, K., Cabrol, N.A., <strong>Phillips, M.S.</strong>, Tebes-Cayo, C., Kalaitzis, F., Ayma, D., Demergasso, C., Chong-Diaz, G., et al.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Nature Astronomy</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2023</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">7, 406-422</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.1038/s41550-022-01882-x">10.1038/s41550-022-01882-x</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">7</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.3390/rs15020314">Salt Constructs in Paleo-Lake Basins as High-Priority Astrobiology Targets</a></div>
          <div class="cv-pub-authors"><strong>Phillips, M.S.</strong>, McInenly, M., Hofmann, M.H., Hinman, N.W., Warren-Rhodes, K., Rivera-Valentín, E.G., & Cabrol, N.A.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Remote Sensing</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2023</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">15(2), 314</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.3390/rs15020314">10.3390/rs15020314</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">6</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.1089/ast.2022.0014">Planetary Mapping Using Deep Learning: A Method to Evaluate Feature Identification Confidence Applied to Habitats in Mars-Analog Terrain</a></div>
          <div class="cv-pub-authors"><strong>Phillips, M.S.</strong>, Moersch, J.E., Cabrol, N.A., Candela, A., Wettergreen, D., Warren-Rhodes, K., Hinman, N.W., & SETI Institute NAI Team</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Astrobiology</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2023</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">23(1), 76-93</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.1089/ast.2022.0014">10.1089/ast.2022.0014</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">5</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.1130/G50341.1">Extensive and ancient feldspathic crust detected across north Hellas rim, Mars: Possible implications for primary crust formation</a></div>
          <div class="cv-pub-authors"><strong>Phillips, M.S.</strong>, Viviano, C.E., Moersch, J.E., Rogers, A.D., McSween, H.Y., & Seelos, F.P.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Geology</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2022</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">50(10), 1182-1186</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.1130/G50341.1">10.1130/G50341.1</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">4</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.3389/fspas.2021.797591">Surface Morphologies in a Mars-Analog Ca-Sulfate Salar, High Andes, Northern Chile</a></div>
          <div class="cv-pub-authors">Hinman, N.W., Hofmann, M.H., Warren-Rhodes, K., <strong>Phillips, M.S.</strong>, Noffke, N., Cabrol, N.A., Chong Diaz, G., Demergasso, C., et al.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Frontiers in Astronomy and Space Sciences</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2022</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">8, 797591</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.3389/fspas.2021.797591">10.3389/fspas.2021.797591</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">3</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.1007/978-3-030-98415-1_9">Insights of Extreme Desert Ecology to the Habitats and Habitability of Mars</a></div>
          <div class="cv-pub-authors">Warren-Rhodes, K., <strong>Phillips, M.S.</strong>, Davila, A., & McKay, C.P.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Microbiology of Hot Deserts (Ecological Studies, vol. 244), Springer Cham</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2022</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">Ecological Studies 244</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.1007/978-3-030-98415-1_9">10.1007/978-3-030-98415-1_9</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">2</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.1016/j.icarus.2021.114306">The lifecycle of hollows on Mercury: An evaluation of candidate volatile phases and a novel model of formation</a></div>
          <div class="cv-pub-authors"><strong>Phillips, M.S.</strong>, Moersch, J.E., Viviano, C.E., & Emery, J.P.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Icarus</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2021</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">359, 114306</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.1016/j.icarus.2021.114306">10.1016/j.icarus.2021.114306</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">1</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.1016/j.scitotenv.2019.135640">Temporal multispectral and 3D analysis of Cerro de Pasco, Peru</a></div>
          <div class="cv-pub-authors">Melton, C.A., Hughes, D.C., Page, D.L., & <strong>Phillips, M.S.</strong></div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Science of the Total Environment</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2020</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">706, 135640</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.1016/j.scitotenv.2019.135640">10.1016/j.scitotenv.2019.135640</a>
          </div>
        </div>
      </li>

    </ul>
  </div>

  <!-- ─── Other Products ──────────────────────────────────── -->

  <div class="cv-section">
    <div class="cv-section-label">Theses, Reports, Preprints, Software &amp; Data</div>
    <ul class="cv-pub-list">

      <li class="cv-pub-item">
        <div class="cv-pub-num">7</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.48550/arXiv.2604.06245">CraterBench-R: Instance-Level Crater Retrieval for Planetary Scale</a></div>
          <div class="cv-pub-authors">Fang, J., Zhang, L., <strong>Phillips, M.S.</strong>, & Luo, W.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">arXiv:2604.06245; accepted at EarthVision 2026 Workshop, CVPR 2026 (CVPRW)</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2026</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.48550/arXiv.2604.06245">10.48550/arXiv.2604.06245</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">6</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.5287/ora-vyqqmdonx">SaganMC: A molecular complexity dataset with mass spectra</a></div>
          <div class="cv-pub-authors">Baydin, A.G., Bell, A., Gebhard, T., Gong, J., Hastings, J., Fricke, M., <strong>Phillips, M.S.</strong>, Warren-Rhodes, K., et al.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">University of Oxford Research Archive (ORA) dataset; also on Hugging Face (oxai4science/sagan-mc, DOI 10.57967/hf/5637)</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2025</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.5287/ora-vyqqmdonx">10.5287/ora-vyqqmdonx</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">5</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.5281/zenodo.10801542">Michael-S-Phillips/HyPyRameter: HyPyRameter v0.2.0</a></div>
          <div class="cv-pub-authors"><strong>Phillips, M.S.</strong> & Tai Udovicic, C.J.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Zenodo</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2024</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.5281/zenodo.10801542">10.5281/zenodo.10801542</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">4</div>
        <div>
          <div class="cv-pub-title"><a href="https://gbaydin.github.io/assets/pdf/bell-2022-molecules.pdf">Signatures of Life: Learning Features of Prebiotic and Biotic Molecules</a></div>
          <div class="cv-pub-authors">Bell, A.C., Gebhard, T.D., Gong, J., Hastings, J.J.A., Baydin, A.G., Fricke, G.M., <strong>Phillips, M.S.</strong>, Warren-Rhodes, K., et al.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">NASA Frontier Development Lab (FDL) 2022 Astrobiology technical report</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2022</span>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">3</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.3847/25c2cfeb.85a374e2">Planetary Geologic Mapping</a></div>
          <div class="cv-pub-authors">Mouginis-Mark, P., Burr, D., Byrne, P., Coles, K., Crown, D.A., Patthoff, A., <strong>Phillips, M.S.</strong>, Prockter, L., et al.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Bulletin of the American Astronomical Society</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2021</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">53(4), 408</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.3847/25c2cfeb.85a374e2">10.3847/25c2cfeb.85a374e2</a>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">2</div>
        <div>
          <div class="cv-pub-title"><a href="https://trace.tennessee.edu/utk_graddiss/6520/">Planetary processes active and ancient: Hollowing on Mercury, ancient crust formation on Mars, and identifying Mars-analog habitats</a></div>
          <div class="cv-pub-authors"><strong>Phillips, M.S.</strong></div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">PhD Dissertation, University of Tennessee, Knoxville (advisor J.E. Moersch)</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2021</span>
          </div>
        </div>
      </li>
      <li class="cv-pub-item">
        <div class="cv-pub-num">1</div>
        <div>
          <div class="cv-pub-title"><a href="https://doi.org/10.3847/25c2cfeb.0eed7a57">Addressing Strategic Knowledge Gaps in the Search for Biosignatures on Mars</a></div>
          <div class="cv-pub-authors">Cabrol, N., Bishop, J., Cady, S.L., Demergasso, C., Hinman, N., Hoffman, M., Kanik, I., Moersch, J., …, <strong>Phillips, M.S.</strong>, et al.</div>
          <div class="cv-pub-meta">
            <span class="cv-pub-journal">Bulletin of the American Astronomical Society</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">2021</span>
            <span class="cv-pub-dot">·</span>
            <span class="cv-pub-year">53(4), 223</span>
            <span class="cv-pub-dot">·</span>
            <a class="cv-pub-doi" href="https://doi.org/10.3847/25c2cfeb.0eed7a57">10.3847/25c2cfeb.0eed7a57</a>
          </div>
        </div>
      </li>

    </ul>
    <p style="font-size:0.85em;color:var(--global-text-color-light,#8b98b2);margin-top:1.6em;line-height:1.6">Plus 46 conference abstracts and presentations (19 as first author): see the <a href="/publications/" style="color:var(--mars-ochre,#e07b39)">Publications page</a> for the full list.</p>
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
        <div class="cv-software-name">Varda</div>
        <div class="cv-software-desc">Visualization and Analysis of Raster Data: open-source Python application for multi- and hyperspectral image analysis (160+ formats, linked dual-image views, ROI tools, interactive spectral plots). Successor to the Spectral Cube Analysis Tool (LPSC 2024); funded by NASA HPOSS.</div>
        <a class="cv-software-link" href="https://github.com/Michael-S-Phillips/Varda">github.com/Michael-S-Phillips/Varda</a>
      </div>
    </div>

  </div>

  <!-- ─── Mentoring & Advising ──────────────────────────────── -->

  <div class="cv-section">
    <div class="cv-section-label">Mentoring &amp; Advising</div>

    <div class="cv-position">
      <div class="cv-position-year">Undergrad</div>
      <div class="cv-position-body">
        <h3>NASA PDART — HiRISE DTM Undergraduate Researchers</h3>
        <p>University of Arizona · 2025–present · Choe Billet, Alexander Burchuladze, Patricio Santos, Luke Meyer, Lenny Druelle</p>
      </div>
    </div>

    <div class="cv-position" style="margin-top:1.6em">
      <div class="cv-position-year">Undergrad</div>
      <div class="cv-position-body">
        <h3>TIMESTEP Program</h3>
        <p>University of Arizona · Jessie Larson</p>
      </div>
    </div>

    <div class="cv-position" style="margin-top:1.6em">
      <div class="cv-position-year">High School</div>
      <div class="cv-position-body">
        <h3>Vail Internship Program (VIP)</h3>
        <p>High School Research Intern · Lily Becker</p>
      </div>
    </div>

    <div class="cv-position" style="margin-top:1.6em">
      <div class="cv-position-year">Ph.D.</div>
      <div class="cv-position-body">
        <h3>Doctoral Committees</h3>
        <p>University of Tennessee, Knoxville · Udit Basu, Andrew Foerder</p>
      </div>
    </div>

    <div class="cv-position" style="margin-top:2.6em">
      <div class="cv-position-year">Former</div>
      <div class="cv-position-body">
        <h3>NASA HPOSS — Varda (Spectral Cube Analysis Tool)</h3>
        <p>University of Arizona · 2024–2026 · Jesse Oved, Emma Elliot, Hamad Ayaz</p>
      </div>
    </div>

    <div class="cv-position" style="margin-top:1.6em">
      <div class="cv-position-year">Former</div>
      <div class="cv-position-body">
        <h3>NASA MDAP — Student Researcher</h3>
        <p>Mars Data Analysis Program · Linae Larson</p>
      </div>
    </div>

    <p style="font-size:0.8em;color:var(--global-text-color-light,#6b7a96);margin-top:1.8em;line-height:1.6">See the <a href="/mentorship/" style="color:var(--mars-ochre,#e07b39)">Mentorship page</a> for details.</p>

  </div>

</div>
