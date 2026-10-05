// ==UserScript==
// @name         Torn Help Desk
// @namespace    https://github.com/St4ticDesign/HelpDesk
// @version      0.1.10
// @description  Anchored Torn Help Desk UI for Tampermonkey and Torn PDA.
// @author       St4TIC
// @match        https://www.torn.com/profiles.php*
// @match        https://www.torn.com/profiles.php?*
// @match        https://www.torn.com/profiles.php#*
// @match        https://www.torn.com/*
// @connect      raw.githubusercontent.com
// @grant        GM_xmlhttpRequest
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const ROOT_ID = 'st4tic-helpdesk';
    const RAW = 'https://raw.githubusercontent.com/St4ticDesign/HelpDesk/main/sources/';
    const SOURCE_FILES = [
        'catalogue-001.json',
        'links-002.json',
        'links-003.json',
        'links-004.json',
        'wiki-links.json'
    ];

    function requestJSON(url) {
        return new Promise((resolve, reject) => {
            if (typeof GM_xmlhttpRequest === 'function') {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url,
                    timeout: 12000,
                    onload: r => {
                        if (r.status < 200 || r.status >= 300) return reject(new Error('HTTP ' + r.status));
                        try { resolve(JSON.parse(r.responseText)); }
                        catch (e) { reject(e); }
                    },
                    onerror: () => reject(new Error('Network error')),
                    ontimeout: () => reject(new Error('Request timed out'))
                });
                return;
            }

            fetch(url, { cache: 'no-store' })
                .then(r => {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.json();
                })
                .then(resolve)
                .catch(reject);
        });
    }

    async function loadSources() {
        const payloads = await Promise.all(SOURCE_FILES.map(f => requestJSON(RAW + f)));
        const map = new Map();

        for (const data of payloads) {
            if (Array.isArray(data.sources)) {
                for (const source of data.sources) {
                    if (!source || !source.url) continue;
                    map.set(source.url, source);
                }
            }

            if (Array.isArray(data.links)) {
                for (const url of data.links) {
                    if (!url || map.has(url)) continue;
                    map.set(url, { url });
                }
            }
        }

        return [...map.values()];
    }

    function makeUI() {
        if (document.getElementById(ROOT_ID)) return;

        const profile = document.querySelector('.user-profile');
        if (!profile) return;

        const notes = profile.querySelector('#profileNotes');
        if (!notes || !notes.parentNode) return;

        const root = document.createElement('section');
        root.id = ROOT_ID;
        root.innerHTML = `
            <div class="hd-head">
                <span>HELP DESK</span>
                <div class="hd-head-right">
                    <button class="hd-collapse" id="hd-collapse" type="button" aria-label="Collapse Help Desk" aria-expanded="true">▲</button>
                </div>
            </div>
            <div class="hd-body">
                <form id="hd-form" autocomplete="off">
                    <label for="hd-question">What do you need help with?</label>
                    <div class="hd-search-row">
                        <input id="hd-question" type="search" inputmode="search"
                               placeholder="Ask a Torn question…" maxlength="220"
                               aria-label="Ask a Torn question">
                        <button id="hd-search" type="submit">SEARCH</button>
                    </div>
                </form>
                <div id="hd-results" class="hd-results" aria-live="polite">
                    <span class="hd-muted">Enter a question to search Torn Help Desk.</span>
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.id = ROOT_ID + '-style';
        style.textContent = `
            #${ROOT_ID}{
                width:100%;
                box-sizing:border-box;
                margin:0 0 22px;
                position:relative;
                top:12px;
                border-radius:5px;
                overflow:hidden;
                background:#333;
                border:1px solid #444;
                color:#eee;
                font-family:Arial,sans-serif;
            }
            #${ROOT_ID} *{box-sizing:border-box}
            #${ROOT_ID} .hd-head{
                min-height:38px;
                padding:9px 12px;
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:10px;
                background:linear-gradient(#444,#333);
                border-bottom:1px solid #222;
                font-size:13px;
                font-weight:700;
                letter-spacing:.4px;
            }
            #${ROOT_ID} .hd-head-right{
                display:flex;
                align-items:center;
                gap:9px;
            }
            #${ROOT_ID} .hd-source{
                color:#999;
                font-size:11px;
                font-weight:400;
                letter-spacing:0;
                white-space:nowrap;
            }
            #${ROOT_ID} .hd-source.ready{color:#7fbf6a}
            #${ROOT_ID} .hd-source.error{color:#d87868}
            #${ROOT_ID} .hd-collapse{
                min-width:28px;
                width:28px;
                height:24px;
                min-height:24px;
                padding:0;
                border:0;
                background:transparent;
                color:#aaa;
                font-size:11px;
                line-height:24px;
                cursor:pointer;
            }
            #${ROOT_ID} .hd-collapse:hover{background:transparent;color:#eee}
            #${ROOT_ID}.collapsed .hd-body{display:none}
            #${ROOT_ID} .hd-body{padding:12px}
            #${ROOT_ID} label{
                display:block;
                margin:0 0 7px;
                color:#eee;
                font-size:12px;
                font-weight:700;
            }
            #${ROOT_ID} .hd-search-row{
                display:flex;
                width:100%;
                gap:8px;
                align-items:stretch;
            }
            #${ROOT_ID} input{
                flex:1 1 auto;
                min-width:0;
                height:38px;
                padding:0 11px;
                border:1px solid #555;
                border-radius:4px;
                outline:none;
                background:#222;
                color:#eee;
                font-size:14px;
            }
            #${ROOT_ID} input:focus{
                border-color:#777;
                box-shadow:0 0 0 1px #777;
            }
            #${ROOT_ID} button{
                flex:0 0 auto;
                min-width:92px;
                min-height:38px;
                padding:0 14px;
                border:1px solid #555;
                border-radius:4px;
                background:linear-gradient(#444,#333);
                color:#eee;
                font-size:12px;
                font-weight:700;
                cursor:pointer;
                touch-action:manipulation;
            }
            #${ROOT_ID} button:hover{background:#444}
            #${ROOT_ID} button:active{transform:translateY(1px)}
            #${ROOT_ID} .hd-results{
                min-height:38px;
                margin-top:10px;
                padding:10px;
                border:1px solid #444;
                border-radius:4px;
                background:#2b2b2b;
                font-size:12px;
                line-height:1.45;
                overflow-wrap:anywhere;
            }
            #${ROOT_ID} .hd-muted{color:#aaa}
            @media (max-width:600px){
                #${ROOT_ID}{border-radius:4px}
                #${ROOT_ID} .hd-head{padding:9px 10px}
                #${ROOT_ID} .hd-body{padding:10px}
                #${ROOT_ID} .hd-search-row{flex-direction:column}
                #${ROOT_ID} button{width:100%;min-height:42px}
                #${ROOT_ID} input{width:100%;height:42px;font-size:16px}
            }
        `;

        document.head.appendChild(style);
        notes.parentNode.insertBefore(root, notes);

        const form = root.querySelector('#hd-form');
        const input = root.querySelector('#hd-question');
        const results = root.querySelector('#hd-results');
        const collapse = root.querySelector('#hd-collapse');

        collapse.addEventListener('click', () => {
            const collapsed = root.classList.toggle('collapsed');
            collapse.textContent = collapsed ? '▼' : '▲';
            collapse.setAttribute('aria-expanded', String(!collapsed));
            collapse.setAttribute('aria-label', collapsed ? 'Expand Help Desk' : 'Collapse Help Desk');
        });

        form.addEventListener('submit', e => {
            e.preventDefault();
            const q = input.value.trim();
            if (!q) {
                results.innerHTML = '<span class="hd-muted">Enter a question to search Torn Help Desk.</span>';
                input.focus();
                return;
            }

            results.innerHTML = '<span class="hd-muted">Search engine connection is the next build phase.</span>';
        });

        loadSources()
            .then(sources => {
                window.__TORN_HELP_DESK_SOURCES__ = sources;

            })
            .catch(() => {

            });
    }

    function boot() {
        makeUI();
        if (document.getElementById(ROOT_ID)) return;

        const observer = new MutationObserver(() => {
            makeUI();
        });

        observer.observe(document.body, { childList:true, subtree:true });

        // Torn is an SPA in places, and PDA can mount the profile later.
        // Keep a lightweight route-aware retry alive instead of giving up after 20s.
        let lastHref = location.href;
        setInterval(() => {
            if (location.href !== lastHref) {
                lastHref = location.href;
            }
            if (/\/profiles\.php/i.test(location.pathname)) makeUI();
        }, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once:true });
    } else {
        boot();
    }
})();