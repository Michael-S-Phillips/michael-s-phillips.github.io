---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
---

My research spans Mars geology, astrobiology, hyperspectral remote sensing, and the application of artificial intelligence to planetary exploration. I have published peer-reviewed articles in leading planetary science journals, developed open-source software tools for the community, and presented findings at major conferences.

For citation metrics and full publication list, see my [Google Scholar](https://scholar.google.com/citations?user=1DCuzasAAAAJ&hl=en) profile.

---

## Featured Publications

{% assign featured_papers = "2023-04-01-orbit-to-ground-biosignature-framework-2023,2022-10-01-feldspathic-crust-hellas-geology-2022,2021-09-01-mercury-hollows-lifecycle-2021,2023-02-01-salt-constructs-astrobiology-targets-2023,2025-06-01-ancient-anorthosites-mars-2025" | split: "," %}

{% for paper_id in featured_papers %}
  {% for post in site.publications %}
    {% assign post_filename = post.path | split: "/" | last | remove: ".md" %}
    {% if post_filename == paper_id %}
      {% include archive-single.html %}
    {% endif %}
  {% endfor %}
{% endfor %}

---

## Peer-Reviewed Journal Articles

{% assign journal_venues = "Nature Astronomy,Geology,The Planetary Science Journal,Icarus,Frontiers in Astronomy and Space Sciences,Earth Surface Processes and Landforms,Science of the Total Environment,Remote Sensing,Bulletin of the American Astronomical Society" | split: "," %}

{% for post in site.publications reversed %}
  {% if journal_venues contains post.venue %}
    {% include archive-single.html %}
  {% endif %}
{% endfor %}

---

## Preprints & In Review

{% for post in site.publications reversed %}
  {% if post.venue contains "Preprint" or post.venue contains "In Review" or post.venue contains "Research Square" %}
    {% include archive-single.html %}
  {% endif %}
{% endfor %}

---

## Conference Proceedings & Abstracts

{% assign conf_keywords = "Lunar and Planetary Science,AbSciCon,Copernicus,AGU,LPI,AAS,ARPHA,European Planetary Science,Differentiation" | split: "," %}

{% for post in site.publications reversed %}
  {% assign is_conf = false %}
  {% for keyword in conf_keywords %}
    {% if post.venue contains keyword %}
      {% assign is_conf = true %}
    {% endif %}
  {% endfor %}
  {% unless journal_venues contains post.venue %}
    {% unless post.venue contains "Preprint" or post.venue contains "Research Square" %}
      {% if is_conf %}
        {% include archive-single.html %}
      {% endif %}
    {% endunless %}
  {% endunless %}
{% endfor %}