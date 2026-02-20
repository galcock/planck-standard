// ===================================
// PLANCK STANDARD - MAIN SCRIPT
// ===================================

let allArticles = [];
let currentCategory = 'all';
let currentArticle = null;

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', async () => {
    await loadArticles();
    initializeThemeToggle();
    initializeCategoryFilters();
    initializeMobileCategory();
    
    // Check for article in URL hash
    if (window.location.hash.startsWith('#article/')) {
        const slug = window.location.hash.replace('#article/', '');
        showArticle(slug);
    } else {
        renderAll();
    }
});

// Handle back/forward navigation
window.addEventListener('hashchange', () => {
    if (window.location.hash.startsWith('#article/')) {
        const slug = window.location.hash.replace('#article/', '');
        showArticle(slug);
    } else {
        hideArticle();
        renderAll();
    }
});

// ===================================
// LOAD ARTICLES
// ===================================

async function loadArticles() {
    try {
        const response = await fetch(`articles.json?t=${Date.now()}`);
        const data = await response.json();
        allArticles = data.articles.sort((a, b) => 
            new Date(b.publishedAt) - new Date(a.publishedAt)
        );
    } catch (error) {
        console.error('Failed to load articles:', error);
        allArticles = [];
    }
}

function renderAll() {
    renderBreakingTicker();
    renderHeroArticle();
    renderArticles();
    renderTrending();
}

// ===================================
// ARTICLE DETAIL VIEW
// ===================================

function showArticle(slug) {
    const article = allArticles.find(a => a.slug === slug || a.id === slug);
    if (!article) {
        window.location.hash = '';
        return;
    }
    
    currentArticle = article;
    document.body.classList.add('article-view');
    
    const mainContent = document.querySelector('.main-content');
    const articleView = document.createElement('div');
    articleView.className = 'article-detail';
    articleView.innerHTML = `
        <article class="article-full">
            <button class="back-btn" onclick="window.location.hash=''">
                ← Back to News
            </button>
            
            <header class="article-header">
                <span class="category-badge ${article.category}">${article.category}</span>
                <h1>${article.headline}</h1>
                <p class="article-subhead">${article.subheadline || ''}</p>
                <div class="article-meta-full">
                    <span>${formatDate(article.publishedAt)}</span>
                    <span>•</span>
                    <span>${Math.ceil((article.body?.length || 500) / 1000)} min read</span>
                    ${article.tags ? `<span>•</span><span class="tags">${article.tags.slice(0,3).join(', ')}</span>` : ''}
                </div>
            </header>
            
            <div class="article-hero-image">
                <img src="${article.imageUrl}" alt="${article.headline}" loading="eager">
            </div>
            
            <div class="article-body">
                ${formatArticleBody(article.body)}
            </div>
            
            <footer class="article-footer">
                <p class="source-credit">Source: <a href="${article.sourceUrl}" target="_blank" rel="noopener">${article.sourceName}</a></p>
            </footer>
        </article>
    `;
    
    // Hide main content, show article
    mainContent.style.display = 'none';
    mainContent.parentNode.insertBefore(articleView, mainContent.nextSibling);
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Update page title
    document.title = `${article.headline} | Planck Standard`;
}

function hideArticle() {
    document.body.classList.remove('article-view');
    const articleView = document.querySelector('.article-detail');
    if (articleView) articleView.remove();
    
    const mainContent = document.querySelector('.main-content');
    mainContent.style.display = 'block';
    
    document.title = 'Planck Standard | The Measure of What Matters';
}

function formatArticleBody(body) {
    if (!body) return '<p>Article content not available.</p>';
    
    // Split into paragraphs and wrap in <p> tags
    return body.split(/\n\n+/).map(p => `<p>${p.trim()}</p>`).join('');
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

function openArticle(slug) {
    window.location.hash = `article/${slug}`;
}

// ===================================
// THEME TOGGLE
// ===================================

function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    document.body.classList.toggle('light-mode', savedTheme === 'light');
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-mode');
            document.body.classList.toggle('dark-mode', !isLight);
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }
}

// ===================================
// CATEGORY FILTERS
// ===================================

function initializeCategoryFilters() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            currentCategory = link.dataset.category;
            document.getElementById('mobileCategory').value = currentCategory;
            renderArticles();
        });
    });
}

function initializeMobileCategory() {
    const select = document.getElementById('mobileCategory');
    if (select) {
        select.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            document.querySelectorAll('.nav-link').forEach(l => {
                l.classList.toggle('active', l.dataset.category === currentCategory);
            });
            renderArticles();
        });
    }
}

// ===================================
// RENDER FUNCTIONS
// ===================================

function renderBreakingTicker() {
    const ticker = document.querySelector('.ticker-text');
    if (ticker && allArticles[0]) {
        ticker.textContent = allArticles[0].headline;
    }
}

function renderHeroArticle() {
    const hero = allArticles.find(a => a.importance >= 8) || allArticles[0];
    if (!hero) return;
    
    const el = document.getElementById('heroArticle');
    if (!el) return;
    
    el.innerHTML = `
        <div class="hero-image-container">
            <img src="${hero.imageUrl}" alt="${hero.headline}" class="hero-img" loading="eager">
            <div class="hero-overlay"></div>
        </div>
        <div class="hero-content">
            <span class="category-badge ${hero.category}">${hero.category}</span>
            <h2>${hero.headline}</h2>
            <p class="hero-excerpt">${hero.subheadline || ''}</p>
            <div class="article-meta">
                <span>${formatTimeAgo(hero.publishedAt)}</span>
                <span>•</span>
                <span>${Math.ceil((hero.body?.length || 500) / 1000)} min read</span>
            </div>
        </div>
    `;
    
    el.onclick = () => openArticle(hero.slug || hero.id);
    el.style.cursor = 'pointer';
}

function renderArticles() {
    const grid = document.getElementById('articlesGrid');
    if (!grid) return;
    
    let articles = allArticles.slice(1);
    if (currentCategory !== 'all') {
        articles = articles.filter(a => a.category === currentCategory);
    }
    
    if (articles.length === 0) {
        grid.innerHTML = '<p class="no-articles">No articles in this category.</p>';
        return;
    }
    
    grid.innerHTML = articles.map(article => `
        <article class="article-card" onclick="openArticle('${article.slug || article.id}')">
            <div class="article-image-container">
                <img src="${article.imageUrl}" alt="${article.headline}" class="article-img" loading="lazy">
            </div>
            <div class="article-content">
                <span class="category-badge ${article.category}">${article.category}</span>
                <h3>${article.headline}</h3>
                <p class="article-excerpt">${article.subheadline || ''}</p>
                <div class="article-meta">
                    <span>${formatTimeAgo(article.publishedAt)}</span>
                    <span>•</span>
                    <span>${Math.ceil((article.body?.length || 500) / 1000)} min</span>
                </div>
            </div>
        </article>
    `).join('');
}

function renderTrending() {
    const list = document.getElementById('trendingList');
    if (!list) return;
    
    const trending = [...allArticles]
        .sort((a, b) => (b.importance || 5) - (a.importance || 5))
        .slice(0, 5);
    
    list.innerHTML = trending.map((a, i) => `
        <a href="#article/${a.slug || a.id}" class="trending-item">
            <span class="trending-rank">${i + 1}</span>
            <div class="trending-content">
                <h4>${a.headline}</h4>
                <div class="trending-meta">
                    <span class="category-badge small ${a.category}">${a.category}</span>
                </div>
            </div>
        </a>
    `).join('');
}

function formatTimeAgo(timestamp) {
    const diffMs = Date.now() - new Date(timestamp);
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

// ===================================
// SEARCH & NEWSLETTER
// ===================================

document.querySelector('.search-btn')?.addEventListener('click', () => {
    const q = prompt('Search articles:');
    if (q?.trim()) {
        const results = allArticles.filter(a => 
            a.headline.toLowerCase().includes(q.toLowerCase()) ||
            a.body?.toLowerCase().includes(q.toLowerCase())
        );
        if (results.length) {
            allArticles = results;
            currentCategory = 'all';
            renderAll();
        } else {
            alert('No results found');
        }
    }
});

document.querySelector('.newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thanks for subscribing!');
    e.target.reset();
});

// Auto-refresh every 5 min
setInterval(async () => {
    await loadArticles();
    if (!currentArticle) renderAll();
}, 5 * 60 * 1000);
