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
    initializeBreakingTicker();
    renderHeroArticle();
    renderArticles();
    renderTrending();
});

// ===================================
// LOAD ARTICLES FROM JSON
// ===================================

async function loadArticles() {
    try {
        // Add cache-busting for fresh data
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
            renderArticles();
        });
    });
}

// ===================================
// BREAKING NEWS TICKER
// ===================================

function initializeBreakingTicker() {
    const breakingArticle = allArticles.find(a => a.breaking);
    const tickerText = document.querySelector('.ticker-text');
    if (breakingArticle && tickerText) {
        tickerText.textContent = breakingArticle.headline;
    } else if (tickerText && allArticles.length > 0) {
        tickerText.textContent = allArticles[0].headline;
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
    
    const imageStyle = heroArticle.imageUrl 
        ? `background-image: url('${heroArticle.imageUrl}'); background-size: cover; background-position: center;`
        : `background: ${getCategoryGradient(heroArticle.category)}`;
    
    const excerpt = heroArticle.subheadline || heroArticle.body?.slice(0, 200) + '...';
    const readTime = Math.ceil((heroArticle.body?.length || 500) / 1000);
    
    heroElement.innerHTML = `
        <div class="hero-image" style="${imageStyle}"></div>
        <div class="hero-content">
            <span class="category-badge ${heroArticle.category}">${heroArticle.category}</span>
            <h2>${heroArticle.headline}</h2>
            <p class="hero-excerpt">${excerpt}</p>
            <div class="article-meta">
                <span>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ${formatTimeAgo(heroArticle.publishedAt)}
                </span>
                <span>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    ${readTime} min read
                </span>
                <span class="source-badge">${heroArticle.sourceName}</span>
            </div>
        </div>
    `;
    
    // Click to open source
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
    
    // Filter articles (skip the hero)
    let articles = allArticles.slice(1);
    if (currentCategory !== 'all') {
        articles = articles.filter(a => a.category === currentCategory);
    }
    
    articlesGrid.innerHTML = articles.map(article => {
        const imageStyle = article.imageUrl 
            ? `background-image: url('${article.imageUrl}'); background-size: cover; background-position: center;`
            : `background: ${getCategoryGradient(article.category)}`;
        
        const excerpt = article.subheadline || article.body?.slice(0, 150) + '...';
        const readTime = Math.ceil((article.body?.length || 500) / 1000);
        
        return `
            <article class="article-card fade-in" onclick="window.open('${article.sourceUrl}', '_blank')">
                <div class="article-image" style="${imageStyle}"></div>
                <div class="article-content">
                    <span class="category-badge ${article.category}">${article.category}</span>
                    <h3>${article.headline}</h3>
                    <p class="article-excerpt">${excerpt}</p>
                    <div class="article-meta">
                        <span>${formatTimeAgo(article.publishedAt)}</span>
                        <span>•</span>
                        <span>${readTime} min read</span>
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
    
    // Use top articles by importance
    const trending = [...allArticles]
        .sort((a, b) => (b.importance || 5) - (a.importance || 5))
        .slice(0, 5);
    
    trendingList.innerHTML = trending.map((article, index) => `
        <a href="${article.sourceUrl}" target="_blank" class="trending-item">
            <h4>${index + 1}. ${article.headline}</h4>
            <div class="trending-meta">
                <span class="category-badge ${article.category}">${article.category}</span>
                <span>${formatTimeAgo(article.publishedAt)}</span>
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

function getCategoryGradient(category) {
    const gradients = {
        physics: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(59, 130, 246, 0.8))',
        science: 'linear-gradient(135deg, rgba(16, 185, 129, 0.8), rgba(5, 150, 105, 0.8))',
        tech: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.8))',
        business: 'linear-gradient(135deg, rgba(245, 158, 11, 0.8), rgba(217, 119, 6, 0.8))',
        markets: 'linear-gradient(135deg, rgba(5, 150, 105, 0.8), rgba(4, 120, 87, 0.8))',
        breaking: 'linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.8))'
    };
    return gradients[category] || gradients.tech;
}

// ===================================
// SEARCH FUNCTIONALITY
// ===================================

const searchBtn = document.querySelector('.search-btn');
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const query = prompt('Search articles:');
        if (query) {
            const results = allArticles.filter(a => 
                a.headline.toLowerCase().includes(query.toLowerCase()) ||
                (a.body && a.body.toLowerCase().includes(query.toLowerCase()))
            );
            
            if (results.length > 0) {
                currentCategory = 'all';
                allArticles = results;
                renderArticles();
                alert(`Found ${results.length} article(s)`);
            } else {
                alert(`No articles found matching "${query}"`);
            }
        }
    });
}

// ===================================
// NEWSLETTER FORM
// ===================================

const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        alert(`Thank you for subscribing! We'll send updates to ${email}`);
        e.target.reset();
    });
}

// ===================================
// AUTO-REFRESH (every 5 minutes)
// ===================================

setInterval(async () => {
    await loadArticles();
    renderHeroArticle();
    renderArticles();
    renderTrending();
    initializeBreakingTicker();
}, 5 * 60 * 1000);
