// ===================================
// PLANCK STANDARD - MAIN SCRIPT
// ===================================

let allArticles = [];
let originalArticles = []; // Keep original for reset
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
    
    if (window.location.hash.startsWith('#article/')) {
        const slug = window.location.hash.replace('#article/', '');
        showArticle(slug);
    } else {
        renderAll();
    }
});

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
        originalArticles = data.articles.sort((a, b) => 
            new Date(b.publishedAt) - new Date(a.publishedAt)
        );
        allArticles = [...originalArticles];
        console.log('Loaded', allArticles.length, 'articles');
        console.log('Categories:', [...new Set(allArticles.map(a => a.category))]);
    } catch (error) {
        console.error('Failed to load:', error);
        allArticles = [];
        originalArticles = [];
    }
}

function getFilteredArticles() {
    if (currentCategory === 'all') {
        return [...allArticles];
    }
    return allArticles.filter(a => a.category === currentCategory);
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
    const article = originalArticles.find(a => a.slug === slug || a.id === slug);
    if (!article) {
        window.location.hash = '';
        return;
    }
    
    currentArticle = article;
    document.body.classList.add('article-view');
    
    const mainContent = document.querySelector('.main-content');
    const existingView = document.querySelector('.article-detail');
    if (existingView) existingView.remove();
    
    const articleView = document.createElement('div');
    articleView.className = 'article-detail';
    articleView.innerHTML = `
        <article class="article-full">
            <button class="back-btn" onclick="window.location.hash=''">← Back to News</button>
            
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
                <img src="${article.imageUrl}" alt="${article.headline}">
            </div>
            
            <div class="article-body">
                ${formatArticleBody(article.body)}
            </div>
            
            <footer class="article-footer">
                <p class="source-credit">Source: <a href="${article.sourceUrl}" target="_blank">${article.sourceName}</a></p>
            </footer>
        </article>
    `;
    
    mainContent.style.display = 'none';
    mainContent.parentNode.insertBefore(articleView, mainContent.nextSibling);
    window.scrollTo(0, 0);
    document.title = `${article.headline} | Planck Standard`;
}

function hideArticle() {
    document.body.classList.remove('article-view');
    const articleView = document.querySelector('.article-detail');
    if (articleView) articleView.remove();
    document.querySelector('.main-content').style.display = 'block';
    document.title = 'Planck Standard | The Measure of What Matters';
    currentArticle = null;
}

function formatArticleBody(body) {
    if (!body) return '<p>Article content not available.</p>';
    return body.split(/\n\n+/).map(p => `<p>${p.trim()}</p>`).join('');
}

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', { 
        month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
    });
}

function openArticle(slug) {
    window.location.hash = `article/${slug}`;
}

// ===================================
// THEME TOGGLE
// ===================================

function initializeThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    const saved = localStorage.getItem('theme') || 'dark';
    document.body.classList.toggle('light-mode', saved === 'light');
    document.body.classList.toggle('dark-mode', saved === 'dark');
    
    toggle?.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-mode');
        document.body.classList.toggle('dark-mode', !isLight);
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
}

// ===================================
// CATEGORY FILTERS
// ===================================

function initializeCategoryFilters() {
    const navLinks = document.querySelectorAll('.nav-link[data-category]');
    console.log('Found nav links:', navLinks.length);
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const category = link.dataset.category;
            console.log('Category clicked:', category);
            
            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Update current category
            currentCategory = category;
            
            // Sync mobile dropdown
            const mobileSelect = document.getElementById('mobileCategory');
            if (mobileSelect) mobileSelect.value = category;
            
            // Re-render
            renderAll();
        });
    });
}

function initializeMobileCategory() {
    const select = document.getElementById('mobileCategory');
    if (!select) return;
    
    select.addEventListener('change', (e) => {
        currentCategory = e.target.value;
        console.log('Mobile category:', currentCategory);
        
        // Sync desktop nav
        document.querySelectorAll('.nav-link[data-category]').forEach(l => {
            l.classList.toggle('active', l.dataset.category === currentCategory);
        });
        
        renderAll();
    });
}

// ===================================
// RENDER FUNCTIONS
// ===================================

function renderBreakingTicker() {
    const ticker = document.querySelector('.ticker-text');
    const filtered = getFilteredArticles();
    if (ticker && filtered[0]) {
        ticker.textContent = filtered[0].headline;
    }
}

function renderHeroArticle() {
    const filtered = getFilteredArticles();
    const hero = filtered.find(a => a.importance >= 7) || filtered[0];
    if (!hero) {
        document.getElementById('heroArticle').innerHTML = '<p class="no-articles">No articles in this category.</p>';
        return;
    }
    
    const el = document.getElementById('heroArticle');
    el.innerHTML = `
        <div class="hero-image-container">
            <img src="${hero.imageUrl}" alt="${hero.headline}" class="hero-img">
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
    
    const filtered = getFilteredArticles();
    const articles = filtered.slice(1); // Skip hero
    
    if (articles.length === 0) {
        grid.innerHTML = '<p class="no-articles">No more articles in this category.</p>';
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
    
    const trending = [...originalArticles]
        .sort((a, b) => (b.importance || 5) - (a.importance || 5))
        .slice(0, 5);
    
    list.innerHTML = trending.map((a, i) => `
        <a href="#article/${a.slug || a.id}" class="trending-item">
            <span class="trending-rank">${i + 1}</span>
            <div class="trending-content">
                <h4>${a.headline}</h4>
                <span class="category-badge small ${a.category}">${a.category}</span>
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
        const results = originalArticles.filter(a => 
            a.headline.toLowerCase().includes(q.toLowerCase()) ||
            a.body?.toLowerCase().includes(q.toLowerCase())
        );
        if (results.length) {
            allArticles = results;
            currentCategory = 'all';
            renderAll();
        } else {
            alert('No results');
        }
    }
});

document.querySelector('.newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thanks for subscribing!');
    e.target.reset();
});

// Auto-refresh
setInterval(async () => {
    await loadArticles();
    if (!currentArticle) renderAll();
}, 5 * 60 * 1000);
