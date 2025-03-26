// ==UserScript==
// @name         n8n Workflow Enhancer
// @namespace    http://tampermonkey.net/
// @version      2.6
// @description  Erweiterte Workflow-Filterung in n8n: Farben, Icons, Zähler, Multi-Select mit STRG, mehrere Prefixe pro Filter, responsives Sidebar-Verhalten und korrektes Styling.
// @author       Kai + GPT
// @match        https://n8n.bckmnn.dev/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const PREFIX_CONFIG = {
    'Test': { icon: '🧪', color: '#3399ff', description: 'Für Experimente und Debugging', match: ['Test'] },
    'Sub-Workflow': { icon: '🧩', color: 'green', description: 'Nur von anderen Workflows aufgerufen', match: ['Sub-Workflow'] },
    'Scheduled-Workflow': { icon: '🗓️', color: 'orange', description: 'Zeitgesteuerte Workflows', match: ['Scheduled-Workflow'] },
    'Studium': { icon: '📚', color: '#9966cc', description: 'Lernskripte, Zusammenfassungen, AI', match: ['Studium'] },
    'Mail': { icon: '📬', color: '#cc3333', description: 'E-Mail Verarbeitung', match: ['Mail'] },
    'Ungruppiert': { icon: '📄', color: '#999999', description: 'Kein Prefix gesetzt', match: ['Ungruppiert'] },
    'Alle': { icon: '📂', color: null, description: 'Alle anzeigen', match: [] }
  };

  const INTERVAL = 2000;
  let activeFilters = new Set();

  const highlightWorkflows = () => {
    const headings = document.querySelectorAll('h2[data-test-id="workflow-card-name"]');
    const foundPrefixes = new Set();
    const counter = {};

    headings.forEach((heading) => {
      const name = heading.innerText?.trim();
      const match = name.match(/^\[(.*?)\]/);
      const prefix = match ? match[1] : 'Ungruppiert';
      foundPrefixes.add(prefix);

      const filterKeys = Object.entries(PREFIX_CONFIG).filter(([_, config]) => config.match.includes(prefix)).map(([k]) => k);
      filterKeys.forEach((k) => {
        counter[k] = (counter[k] || 0) + 1;
      });

      const card = heading.closest('.card[data-test-id="resources-list-item"]');
      if (!card) return;

      const mainColor = Object.entries(PREFIX_CONFIG).find(([_, c]) => c.match.includes(prefix))?.[1]?.color;
      if (mainColor) {
        card.style.borderLeft = `5px solid ${mainColor}`;
      }

      if (prefix === 'Sub-Workflow') {
        const toggle = card.querySelector('[data-test-id="workflow-activate-switch"]');
        if (toggle) toggle.style.display = 'none';

        const statusText = card.querySelector('[data-test-id="workflow-activator-status"]');
        if (statusText) statusText.style.display = 'none';
      }

      const badge = card.querySelector('[data-test-id="card-badge"]');
      if (badge?.innerText?.trim() === 'Personal') {
        badge.style.display = 'none';
      }

      if (activeFilters.size > 0) {
        const match = [...activeFilters].some(f => PREFIX_CONFIG[f]?.match.includes(prefix));
        card.style.display = match ? '' : 'none';
      } else {
        card.style.display = '';
      }
    });

    renderSidebarFilters(counter);
  };

  const renderSidebarFilters = (counter) => {
    const overviewItem = document.querySelector('[data-test-id="project-home-menu-item"]');
    const sidebar = overviewItem?.closest('ul');
    if (!sidebar) return;

    const overviewText = overviewItem.querySelector('li');
    if (overviewText) {
      overviewText.innerHTML = `<span class="sidebar-label"><span class="emoji">${PREFIX_CONFIG['Alle'].icon}</span> <span class="sidebar-text">Alle anzeigen</span></span>`;
      overviewText.setAttribute('style', 'border-radius: 6px !important; margin-bottom: 4px !important');
      if (activeFilters.size === 0) overviewText.classList.add('is-active');
      else overviewText.classList.remove('is-active');
    }

    overviewItem.onclick = (e) => {
      e.preventDefault();
      activeFilters.clear();
      highlightWorkflows();
    };

    const existing = document.getElementById('custom-workflow-filters');
    if (existing) existing.remove();

    const wrapper = document.createElement('ul');
    wrapper.id = 'custom-workflow-filters';
    wrapper.className = sidebar.className;
    wrapper.setAttribute('role', 'menubar');

    Object.entries(PREFIX_CONFIG).forEach(([key, config]) => {
      if (key === 'Alle') return;

      const li = document.createElement('li');
      li.className = 'el-menu-item';
      li.setAttribute('role', 'menuitem');
      li.tabIndex = -1;
      li.setAttribute('style', 'border-radius: 6px !important; margin-bottom: 4px !important');
      li.setAttribute('data-prefix', key);

      const count = counter[key] || 0;
      const title = config.description || 'Filter';
      const isActive = activeFilters.has(key);
      const icon = config.icon || '📁';

      li.innerHTML = `<span class="sidebar-label"><span class="emoji">${icon}</span> <span class="sidebar-text">${key} (${count})</span></span>`;
      li.title = title;

      if (isActive) li.classList.add('is-active');

      li.onclick = (e) => {
        e.preventDefault();
        const isMulti = e.ctrlKey || e.metaKey;
        if (!isMulti) activeFilters.clear();
        if (activeFilters.has(key)) {
          activeFilters.delete(key);
        } else {
          activeFilters.add(key);
        }
        highlightWorkflows();
      };

      wrapper.appendChild(li);
    });

    sidebar.insertBefore(wrapper, overviewItem.nextSibling);
  };

  const injectResponsiveSidebarStyle = () => {
    const style = document.createElement('style');
    style.textContent = `
      .el-menu--vertical:not(.el-menu--collapse) .sidebar-text {
        display: inline;
      }
      .el-menu--collapse .sidebar-text {
        display: none;
      }
      .el-menu--collapse .el-menu-item {
        width: 48px;
        height: 48px;
        padding: 0;
        text-align: center;
        font-size: 18px;
      }
      .el-menu--collapse .el-menu-item .sidebar-label {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
      }
      .el-menu--collapse .el-menu-item .sidebar-label .emoji {
        display: inline;
        font-size: 20px;
      }
    `;
    document.head.appendChild(style);
  };

  injectResponsiveSidebarStyle();
  setInterval(highlightWorkflows, INTERVAL);
})();
