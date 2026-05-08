/**
 * ppi n3xt — Blog API Client
 * Endpoint: https://socialflow-pro.pages.dev/api/blog
 */

const API_BASE = 'https://socialflow-pro.pages.dev/api/blog';

/** Fetch all posts */
async function fetchPosts() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/** Fetch single post by slug */
async function fetchPost(slug) {
  const res = await fetch(`${API_BASE}?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/** Format ISO date to German locale (e.g. "8. Mai 2026") */
function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/**
 * Convert simple markdown-ish content to HTML.
 * Handles: ## headings, ** bold **, *italic*, \n\n paragraphs,
 * - list items, > blockquotes, `code`, --- dividers.
 */
function renderPost(post) {
  if (!post || !post.content) return '<p>Kein Inhalt verfügbar.</p>';

  const lines = post.content.split('\n');
  const output = [];
  let inList = false;
  let inBlockquote = false;

  const closeList = () => { if (inList) { output.push('</ul>'); inList = false; } };
  const closeBlockquote = () => { if (inBlockquote) { output.push('</blockquote>'); inBlockquote = false; } };

  const inline = (text) =>
    text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Horizontal rule
    if (/^---+$/.test(trimmed)) {
      closeList(); closeBlockquote();
      output.push('<hr style="border:none;border-top:1px solid #E4E4E7;margin:32px 0;">');
      continue;
    }

    // H2
    if (trimmed.startsWith('## ')) {
      closeList(); closeBlockquote();
      const id = trimmed.slice(3).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      output.push(`<h2 id="${id}">${inline(trimmed.slice(3))}</h2>`);
      continue;
    }

    // H3
    if (trimmed.startsWith('### ')) {
      closeList(); closeBlockquote();
      output.push(`<h3>${inline(trimmed.slice(4))}</h3>`);
      continue;
    }

    // H1 (shouldn't appear often in body but handle it)
    if (trimmed.startsWith('# ')) {
      closeList(); closeBlockquote();
      output.push(`<h2>${inline(trimmed.slice(2))}</h2>`);
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      closeList();
      if (!inBlockquote) { output.push('<blockquote>'); inBlockquote = true; }
      output.push(`<p>${inline(trimmed.slice(2))}</p>`);
      continue;
    }

    // Unordered list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      closeBlockquote();
      if (!inList) { output.push('<ul>'); inList = true; }
      output.push(`<li>${inline(trimmed.slice(2))}</li>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(trimmed)) {
      closeBlockquote();
      if (!inList) { output.push('<ol>'); inList = true; }
      output.push(`<li>${inline(trimmed.replace(/^\d+\.\s/, ''))}</li>`);
      continue;
    }

    // Empty line → close open blocks
    if (!trimmed) {
      closeList(); closeBlockquote();
      continue;
    }

    // Default: paragraph
    closeList(); closeBlockquote();
    output.push(`<p>${inline(trimmed)}</p>`);
  }

  closeList(); closeBlockquote();
  return output.join('\n');
}

/** Build a skeleton card element */
function buildSkeletonCard() {
  return `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-line skeleton-line--sm" style="margin-bottom:16px;"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-line skeleton-line--lg"></div>
        <div class="skeleton skeleton-line skeleton-line--xl"></div>
        <div class="skeleton skeleton-line skeleton-line--md" style="margin-top:20px;"></div>
      </div>
    </div>`;
}

/** Build a blog card HTML string */
function buildBlogCard(post, basePath = '') {
  const href = `${basePath}blog/post.html?slug=${encodeURIComponent(post.slug)}`;
  const category = post.category || 'Allgemein';
  const tags = Array.isArray(post.tags) ? post.tags.slice(0, 2) : [];
  const tagsHtml = tags.map(t => `<span class="tag">${t}</span>`).join('');

  const icon = `
    <svg class="blog-card__img-placeholder" width="48" height="48" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 6h16M4 10h16M4 14h8M4 18h8"/>
    </svg>`;

  return `
    <a href="${href}" class="blog-card">
      <div class="blog-card__img">
        ${icon}
        <span class="blog-card__category">${category}</span>
      </div>
      <div class="blog-card__body">
        <div class="blog-card__meta">
          <span>${formatDate(post.publishedAt)}</span>
          ${post.author ? `<span class="blog-card__meta-sep">·</span><span>${post.author}</span>` : ''}
        </div>
        <div class="blog-card__title">${post.title || 'Untitled'}</div>
        <div class="blog-card__excerpt">${post.excerpt || ''}</div>
        <div class="blog-card__footer">
          <div class="blog-card__tags">${tagsHtml}</div>
          <span class="blog-card__link">
            Lesen
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        </div>
      </div>
    </a>`;
}

/** Collect all h2 headings from rendered HTML and build TOC entries */
function buildToc(html) {
  const toc = [];
  const re = /<h2 id="([^"]+)">([^<]+)<\/h2>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    toc.push({ id: m[1], text: m[2] });
  }
  return toc;
}

/** Get initials from a name for the avatar */
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}
