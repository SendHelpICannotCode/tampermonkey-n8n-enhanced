// ==UserScript==
// @name         n8n Scrollbar Fix (Final)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Macht Scrollbar dezent & transparent, fügt Abstand zum Inhalt hinzu (für n8n Selfhosted)
// @author       Kai + GPT
// @match        https://n8n.bckmnn.dev/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const applyScrollbarStyle = () => {
    const style = document.createElement('style');
    style.textContent = `
      ::-webkit-scrollbar {
        width: 10px;
      }

      ::-webkit-scrollbar-track {
        background: transparent !important;
        margin-top: 4px;
        margin-bottom: 4px;
      }

      ::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 6px;
        border: 2px solid transparent;
        background-clip: padding-box;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: #555;
      }

      ._paginatedListWrapper_xnuum_166 {
        padding-right: 8px;
      }
    `;
    document.head.appendChild(style);
  };

  setTimeout(applyScrollbarStyle, 1000);
})();
