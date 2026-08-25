/* ============================================================
   CSC 413 — guide viewer
   Fetches a Markdown guide and renders it with course styling.

   No dependencies and no CDN: a student on bad wifi still reads
   the setup guide. Supports the subset of Markdown the course
   guides actually use.
   ============================================================ */

(function () {
    'use strict';

    const params = new URLSearchParams(location.search);
    const target = document.getElementById('content');

    /* Two ways to name a document:
         ?g=git-workflow                     shorthand for guides/git-workflow.md
         ?d=assignments/m00-setup/handout    any Markdown file in the repo
       Both are restricted to relative paths under this site, and `..` is
       rejected, so the parameter cannot be used to fetch something else. */
    const short = params.get('g');
    const full = params.get('d');
    const path = short
        ? 'guides/' + short.replace(/[^\w-]/g, '') + '.md'
        : (full || 'guides/environment-setup')
            .replace(/[^\w\-./]/g, '')
            .replace(/\.\./g, '')
            .replace(/^\/+/, '')
            .replace(/\.md$/, '') + '.md';

    // Depth of the page below the site root, so links resolve from
    // subdirectories as well as from the top level.
    const name = path.replace(/^.*\//, '').replace(/\.md$/, '');

    fetch(path)
        .then(r => {
            if (!r.ok) throw new Error(r.status + ' ' + r.statusText);
            return r.text();
        })
        .then(md => {
            target.innerHTML = render(md);
            const h1 = target.querySelector('h1');
            if (h1) document.title = h1.textContent + ' · CSC 413';
            if (location.hash) {
                const el = document.getElementById(location.hash.slice(1));
                if (el) el.scrollIntoView();
            }
        })
        .catch(err => {
            const gh = 'https://github.com/goleador/CSC413/blob/main/' + esc(path);

            // The common case by far: someone opened this file straight off
            // disk. Browsers block fetch() on file:// for security, so the
            // page cannot read its own Markdown. Say so, rather than showing
            // a bare "Load failed" that looks like a broken site.
            if (location.protocol === 'file:') {
                target.innerHTML =
                    '<h1>Open this over HTTP</h1>' +
                    '<p>This page reads the guide with <code>fetch()</code>, which ' +
                    'browsers block for pages opened directly from disk ' +
                    '(<code>file://</code>). Nothing is broken — it just needs a ' +
                    'web server.</p>' +
                    '<p><strong>Read it online:</strong> ' +
                    '<a href="https://goleador.github.io/CSC413/guide.html?d=' +
                    esc(path.replace(/\.md$/, '')) + '">goleador.github.io/CSC413</a></p>' +
                    '<p><strong>Or serve this folder locally:</strong></p>' +
                    '<pre><code>cd /path/to/CSC413\npython3 -m http.server 8000</code></pre>' +
                    '<p>then open <code>http://localhost:8000/guide.html?d=' +
                    esc(path.replace(/\.md$/, '')) + '</code></p>' +
                    '<p>You can also read the plain Markdown on ' +
                    '<a href="' + gh + '">GitHub</a>.</p>';
                return;
            }

            target.innerHTML = '<p class="status error">Could not load this guide (' +
                esc(err.message) + ').</p><p class="status">' +
                'Read it on <a href="' + gh + '">GitHub</a> instead.</p>';
        });

    function esc(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function slug(s) {
        return s.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
    }

    /* Inline formatting. Code spans are pulled out first so their
       contents are never treated as markup, then restored at the end. */
    function inline(s) {
        const code = [];
        s = s.replace(/`([^`]+)`/g, function (_, c) {
            code.push('<code>' + esc(c) + '</code>');
            return '@@CODE' + (code.length - 1) + '@@';
        });

        s = esc(s);
        s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
        s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        s = s.replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g, '<a href="$1">$1</a>');
        s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/(^|\W)\*([^*\n]+)\*/g, '$1<em>$2</em>');
        s = s.replace(/&lt;kbd&gt;(.+?)&lt;\/kbd&gt;/g, '<kbd>$1</kbd>');
        s = s.replace(/&lt;(\/?(?:br|strong|em|sup|sub))&gt;/g, '<$1>');

        return s.replace(/@@CODE(\d+)@@/g, function (_, i) { return code[+i]; });
    }

    function render(md) {
        const lines = md.replace(/\r\n/g, '\n').split('\n');
        const out = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

            // fenced code
            if (/^```/.test(line)) {
                const lang = line.slice(3).trim();
                const buf = [];
                i++;
                while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
                i++;
                let code = esc(buf.join('\n'));
                // dim trailing comments in shell blocks so commands stand out
                if (/^(bash|sh|shell|console)?$/.test(lang)) {
                    code = code.replace(/(\s)(#[^\n]*)/g, '$1<span class="cmt">$2</span>');
                }
                out.push('<pre><code>' + code + '</code></pre>');
                continue;
            }

            // heading
            const h = line.match(/^(#{1,6})\s+(.*)$/);
            if (h) {
                const n = h[1].length;
                out.push('<h' + n + ' id="' + slug(h[2]) + '">' + inline(h[2]) + '</h' + n + '>');
                i++;
                continue;
            }

            // horizontal rule
            if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
                out.push('<hr>');
                i++;
                continue;
            }

            // table
            if (/^\s*\|/.test(line) && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) {
                const cells = function (r) {
                    return r.replace(/^\s*\|/, '').replace(/\|\s*$/, '')
                        .split('|').map(function (c) { return c.trim(); });
                };
                const head = cells(line);
                i += 2;
                const body = [];
                while (i < lines.length && /^\s*\|/.test(lines[i])) body.push(cells(lines[i++]));
                // A table written with an empty header row (| | |) is being used
                // as a layout grid, not a data table. Rendering a row of blank
                // purple cells above it looks like a mistake, so drop it.
                const hasHead = head.some(function (c) { return c !== ''; });
                out.push('<div class="table-wrap"><table' +
                    (hasHead ? '' : ' class="plain"') + '>' +
                    (hasHead ? '<thead><tr>' +
                        head.map(function (c) { return '<th>' + inline(c) + '</th>'; }).join('') +
                        '</tr></thead>' : '') +
                    '<tbody>' +
                    body.map(function (r) {
                        return '<tr>' + r.map(function (c) {
                            return '<td>' + inline(c) + '</td>';
                        }).join('') + '</tr>';
                    }).join('') +
                    '</tbody></table></div>');
                continue;
            }

            // blockquote
            if (/^>\s?/.test(line)) {
                const buf = [];
                while (i < lines.length && /^>\s?/.test(lines[i])) {
                    buf.push(lines[i++].replace(/^>\s?/, ''));
                }
                out.push('<blockquote>' + render(buf.join('\n')) + '</blockquote>');
                continue;
            }

            // list (ordered or unordered), one level deep
            if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
                const ordered = /^\s*\d+\./.test(line);
                const items = [];
                while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
                    let text = lines[i++].replace(/^\s*([-*+]|\d+\.)\s+/, '');
                    // continuation lines belonging to the same item
                    while (i < lines.length && /^\s{2,}\S/.test(lines[i]) &&
                           !/^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
                        text += ' ' + lines[i++].trim();
                    }
                    items.push('<li>' + inline(text) + '</li>');
                }
                out.push((ordered ? '<ol>' : '<ul>') + items.join('') + (ordered ? '</ol>' : '</ul>'));
                continue;
            }

            // blank
            if (!line.trim()) { i++; continue; }

            // paragraph
            const buf = [];
            while (i < lines.length && lines[i].trim() &&
                   !/^(#{1,6}\s|```|>|\s*([-*+]|\d+\.)\s|\s*\|)/.test(lines[i]) &&
                   !/^(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i])) {
                buf.push(lines[i++]);
            }
            if (buf.length) out.push('<p>' + inline(buf.join(' ')) + '</p>');
        }

        return out.join('\n');
    }
})();
