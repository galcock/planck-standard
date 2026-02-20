// ===================================
// PLANCK STANDARD - MAIN SCRIPT
// ===================================

let allArticles = [];
let currentCategory = 'all';

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', async () => {
    await loadArticles();
    initializeThemeToggle();
    initializeCategoryFilters();
    initializeMobileCategory();
    renderAll();
});

// ===================================
// LOAD ARTICLES FROM JSON
// ===================================

async function loadArticles() {
    try {
        const response = await fetch(`articles.json?t=${Date.now()}`);
        const data = await response.json();
        allArticles = data.articles.sort((a, b) => 
            new Date(b.publishedAt) - new Date(a.publishedAt)
        );
        console.log(`Loaded ${allArticles.length} articles`);
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
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            currentCategory = link.dataset.category;
            
            // Sync mobile dropdown
            const mobileSelect = document.getElementById('mobileCategory');
            if (mobileSelect) mobileSelect.value = currentCategory;
            
            renderArticles();
        });
    });
}

function initializeMobileCategory() {
    const mobileSelect = document.getElementById('mobileCategory');
    if (mobileSelect) {
        mobileSelect.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            
            // Sync desktop nav
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(l => {
                l.classList.toggle('active', l.dataset.category === currentCategory);
            });
            
            renderArticles();
        });
    }
}

// ===================================
// BREAKING NEWS TICKER
// ===================================

function renderBreakingTicker() {
    const tickerText = document.querySelector('.ticker-text');
    if (!tickerText) return;
    
    const latestArticle = allArticles[0];
    if (latestArticle) {
        tickerText.textContent = latestArticle.headline;
    }
}

// ===================================
// RENDER HERO ARTICLE
// ===================================

function renderHeroArticle() {
    const heroArticle = allArticles.find(a => a.importance >= 8) || allArticles[0];
    if (!heroArticle) return;
    
    const heroElement = document.getElementById('heroArticle');
    if (!heroElement) return;
    
    const excerpt = heroArticle.subheadline || heroArticle.body?.slice(0, 200) + '...';
    const readTime = Math.ceil((heroArticle.body?.length || 500) / 1000);
    const imageUrl = heroArticle.imageUrl || `https://source.unsplash.com/1200x630/?${heroArticle.category}`;
    
    heroElement.innerHTML = `
        <div class="hero-image-container">
            <img src="${imageUrl}" alt="${heroArticle.headline}" class="hero-img" loading="eager" 
                 onerror="this.src='https://source.unsplash.com/1200x630/?${heroArticle.category}'">
            <div class="hero-overlay"></div>
        </div>
        <div class="hero-content">
            <span class="category-badge ${heroArticle.category}">${heroArticle.category}</span>
            <h2>${heroArticle.headline}</h2>
            <p class="hero-excerpt">${excerpt}</p>
            <div class="article-meta">
                <span>${formatTimeAgo(heroArticle.publishedAt)}</span>
                <span>•</span>
                <span>${readTime} min read</span>
                <span>•</span>
                <span class="source-name">${heroArticle.sourceName}</span>
            </div>
        </div>
    `;
    
    heroElement.style.cursor = 'pointer';
    heroElement.onclick = () => window.open(heroArticle.sourceUrl, '_blank');
    heroElement.classList.add('fade-in');
}

// ===================================
// RENDER ARTICLES GRID
// ===================================

function renderArticles() {
    const articlesGrid = document.getElementById('articlesGrid');
    if (!articlesGrid) return;
    
    let articles = allArticles.slice(1);
    if (currentCategory !== 'all') {
        articles = articles.filter(a => a.category === currentCategory);
    }
    
    if (articles.length === 0) {
        articlesGrid.innerHTML = `<p class="no-articles">No articles in this category yet.</p>`;
        return;
    }
    
    articlesGrid.innerHTML = articles.map(article => {
        const excerpt = article.subheadline || article.body?.slice(0, 120) + '...';
        const readTime = Math.ceil((article.body?.length || 500) / 1000);
        const imageUrl = article.imageUrl || `https://source.unsplash.com/600x400/?${article.category}`;
        
        return `
            <article class="article-card" onclick="window.open('${article.sourceUrl}', '_blank')">
                <div class="article-image-container">
                    <img src="${imageUrl}" alt="${article.headline}" class="article-img" loading="lazy"
                         onerror="this.src='https://source.unsplash.com/600x400/?${article.category}'">
                </div>
                <div class="article-content">
                    <span class="category-badge ${article.category}">${article.category}</span>
                    <h3>${article.headline}</h3>
                    <p class="article-excerpt">${excerpt}</p>
                    <div class="article-meta">
                        <span>${formatTimeAgo(article.publishedAt)}</span>
                        <span>•</span>
                        <span>${readTime} min</span>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

// ===================================
// RENDER TRENDING
// ===================================

function renderTrending() {
    const trendingList = document.getElementById('trendingList');
    if (!trendingList) return;
    
    const trending = [...allArticles]
        .sort((a, b) => (b.importance || 5) - (a.importance || 5))
        .slice(0, 5);
    
    trendingList.innerHTML = trending.map((article, index) => `
        <a href="${article.sourceUrl}" target="_blank" class="trending-item">
            <span class="trending-rank">${index + 1}</span>
            <div class="trending-content">
                <h4>${article.headline}</h4>
                <div class="trending-meta">
                    <span class="category-badge small ${article.category}">${article.category}</span>
                    <span>${formatTimeAgo(article.publishedAt)}</span>
                </div>
            </div>
        </a>
    `).join('');
}

// ===================================
// UTILITIES
// ===================================

function formatTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ===================================
// SEARCH
// ===================================

const searchBtn = document.querySelector('.search-btn');
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const query = prompt('Search articles:');
        if (query && query.trim()) {
            const results = allArticles.filter(a => 
                a.headline.toLowerCase().includes(query.toLowerCase()) ||
                (a.body && a.body.toLowerCase().includes(query.toLowerCase()))
            );
            
            if (results.length > 0) {
                allArticles = results;
                currentCategory = 'all';
                renderAll();
            } else {
                alert(`No articles found for "${query}"`);
            }
        }
    });
}

// ===================================
// NEWSLETTER
// ===================================

const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        alert(`Subscribed: ${email}`);
        e.target.reset();
    });
}

// ===================================
// AUTO-REFRESH (every 5 minutes)
// ===================================

setInterval(async () => {
    await loadArticles();
    renderAll();
}, 5 * 60 * 1000);
