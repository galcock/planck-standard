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
// LOAD ARTICLES
// ===================================

async function loadArticles() {
    try {
        const response = await fetch('articles.json');
        const data = await response.json();
        allArticles = data.articles.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
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
    
    themeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-mode');
        document.body.classList.toggle('dark-mode', !isLight);
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
}

// ===================================
// CATEGORY FILTERS
// ===================================

function initializeCategoryFilters() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Update category and re-render
            currentCategory = link.dataset.category;
            renderArticles();
        });
    });
}

// ===================================
// BREAKING NEWS TICKER
// ===================================

function initializeBreakingTicker() {
    const breakingArticle = allArticles.find(a => a.category === 'breaking');
    if (breakingArticle) {
        const tickerText = document.querySelector('.ticker-text');
        tickerText.textContent = breakingArticle.headline;
    }
}

// ===================================
// RENDER HERO ARTICLE
// ===================================

function renderHeroArticle() {
    const heroArticle = allArticles.find(a => a.featured) || allArticles[0];
    if (!heroArticle) return;
    
    const heroElement = document.getElementById('heroArticle');
    const categoryGradient = getCategoryGradient(heroArticle.category);
    
    heroElement.innerHTML = `
        <div class="hero-image" style="background: ${categoryGradient}">
        </div>
        <div class="hero-content">
            <span class="category-badge ${heroArticle.category}">${heroArticle.category}</span>
            <h2>${heroArticle.headline}</h2>
            <p class="hero-excerpt">${heroArticle.excerpt}</p>
            <div class="article-meta">
                <span>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    ${heroArticle.author}
                </span>
                <span>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ${formatTimeAgo(heroArticle.timestamp)}
                </span>
                <span>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    ${heroArticle.readTime} min read
                </span>
            </div>
        </div>
    `;
    
    heroElement.classList.add('fade-in');
}

// ===================================
// RENDER ARTICLES GRID
// ===================================

function renderArticles() {
    const articlesGrid = document.getElementById('articlesGrid');
    
    // Filter articles
    let articles = currentCategory === 'all' 
        ? allArticles.filter(a => !a.featured)
        : allArticles.filter(a => a.category === currentCategory && !a.featured);
    
    // Render articles
    articlesGrid.innerHTML = articles.map(article => {
        const categoryGradient = getCategoryGradient(article.category);
        
        return `
            <article class="article-card fade-in">
                <div class="article-image" style="background: ${categoryGradient}"></div>
                <div class="article-content">
                    <span class="category-badge ${article.category}">${article.category}</span>
                    <h3>${article.headline}</h3>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <div class="article-meta">
                        <span>${formatTimeAgo(article.timestamp)}</span>
                        <span>•</span>
                        <span>${article.readTime} min read</span>
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
    const trending = allArticles.filter(a => a.trending).slice(0, 5);
    
    trendingList.innerHTML = trending.map((article, index) => `
        <a href="#" class="trending-item">
            <h4>${index + 1}. ${article.headline}</h4>
            <div class="trending-meta">
                <span class="category-badge ${article.category}">${article.category}</span>
                <span>${formatTimeAgo(article.timestamp)}</span>
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
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getCategoryGradient(category) {
    const gradients = {
        physics: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(59, 130, 246, 0.4))',
        science: 'linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.4))',
        tech: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(37, 99, 235, 0.4))',
        business: 'linear-gradient(135deg, rgba(245, 158, 11, 0.4), rgba(217, 119, 6, 0.4))',
        markets: 'linear-gradient(135deg, rgba(5, 150, 105, 0.4), rgba(4, 120, 87, 0.4))',
        breaking: 'linear-gradient(135deg, rgba(239, 68, 68, 0.4), rgba(220, 38, 38, 0.4))'
    };
    
    return gradients[category] || gradients.tech;
}

// ===================================
// SEARCH FUNCTIONALITY
// ===================================

document.querySelector('.search-btn').addEventListener('click', () => {
    const query = prompt('Search articles:');
    if (query) {
        const results = allArticles.filter(a => 
            a.headline.toLowerCase().includes(query.toLowerCase()) ||
            a.excerpt.toLowerCase().includes(query.toLowerCase())
        );
        
        if (results.length > 0) {
            alert(`Found ${results.length} article(s) matching "${query}"`);
            // In production, this would navigate to a search results page
        } else {
            alert(`No articles found matching "${query}"`);
        }
    }
});

// ===================================
// NEWSLETTER FORM
// ===================================

document.querySelector('.newsletter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    alert(`Thank you for subscribing! We'll send updates to ${email}`);
    e.target.reset();
});

// ===================================
// SMOOTH SCROLL & PARALLAX
// ===================================

let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            
            // Subtle parallax effect on hero
            const heroImage = document.querySelector('.hero-image');
            if (heroImage) {
                heroImage.style.transform = `translateY(${scrolled * 0.3}px)`;
            }
            
            ticking = false;
        });
        
        ticking = true;
    }
});

// ===================================
// PERFORMANCE - LAZY LOADING
// ===================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const article = entry.target;
                article.classList.add('fade-in');
                observer.unobserve(article);
            }
        });
    });
    
    // Observe all article cards
    document.querySelectorAll('.article-card').forEach(card => {
        imageObserver.observe(card);
    });
}
