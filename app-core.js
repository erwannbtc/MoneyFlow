/**
 * Movo App - Core JavaScript
 * Essential functionality for immediate loading
 * Version: 2.0 - Performance Optimized
 */

// Critical app data and state
let appData = {
    transactions: [],
    assets: [],
    fireGoals: [],
    categories: ['bitcoin', 'alimentation', 'transport', 'logement', 'loisirs', 'santé', 'shopping', 'divers'],
    settings: { currentBalance: 0 }
};

let currentUser = null;
let supabase = null;

// Performance optimization: Debounced functions
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Critical DOM Ready Handler - Optimized
document.addEventListener('DOMContentLoaded', function () {
    // Performance marker
    performance.mark('app-init-start');
    
    // Initialize loading screen with performance optimization
    initializeLoadingScreen();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize critical data
    initializeAppData();
    
    // Initialize authentication
    initializeSupabase();
    
    // Performance marker
    performance.mark('app-init-end');
    performance.measure('app-initialization', 'app-init-start', 'app-init-end');
});

// Optimized Loading Screen
function initializeLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const appContainer = document.querySelector('.app-container');
    const loadingText = document.querySelector('.loading-text');
    
    if (!loadingText) return;
    
    // Create letters efficiently
    const text = loadingText.textContent;
    const fragment = document.createDocumentFragment();
    
    loadingText.textContent = '';
    
    for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = text[i];
        span.style.animationDelay = `${(i + 1) * 0.1}s`;
        fragment.appendChild(span);
    }
    
    loadingText.appendChild(fragment);
    loadingText.classList.add('letters-ready');
    
    // Optimized timing
    const loadingDuration = 1200; // Reduced from 1500ms
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        
        setTimeout(() => {
            appContainer.classList.add('loaded');
            loadingScreen.remove();
            
            // Load non-critical CSS asynchronously
            loadNonCriticalAssets();
        }, 600); // Reduced from 800ms
    }, loadingDuration);
}

// Lazy load non-critical assets
function loadNonCriticalAssets() {
    // Load extended CSS asynchronously
    const extendedCSS = document.createElement('link');
    extendedCSS.rel = 'stylesheet';
    extendedCSS.href = 'styles-extended.css';
    extendedCSS.media = 'print';
    extendedCSS.onload = function() {
        this.media = 'all';
    };
    document.head.appendChild(extendedCSS);
    
    // Preload JavaScript modules
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            loadSecondaryModules();
        });
    } else {
        setTimeout(loadSecondaryModules, 100);
    }
}

// Load secondary JavaScript modules
function loadSecondaryModules() {
    // This would load additional JS files for features like charts, analytics, etc.
    // For now, we'll keep essential functions inline
}

// Navigation optimization
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    // Use event delegation for better performance
    document.addEventListener('click', function(e) {
        if (e.target.closest('.nav-item')) {
            handleNavigationClick(e);
        }
    });
}

function handleNavigationClick(e) {
    const navItem = e.target.closest('.nav-item');
    if (!navItem) return;
    
    // Smooth scroll to top with optimized performance
    if (window.scrollTo) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Data initialization
function initializeAppData() {
    try {
        const savedData = localStorage.getItem('movoAppData');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            appData = { ...appData, ...parsed };
        }
    } catch (error) {
        console.warn('Failed to load saved data:', error);
    }
}

// Supabase initialization - Lazy loaded
function initializeSupabase() {
    // Only initialize when needed to improve initial load time
    if (typeof window.supabase !== 'undefined') {
        const SUPABASE_URL = 'https://alzriszvsobdysdrckbv.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsenJpc3p2c29iZHlzZHJja2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3NzE4NjMsImV4cCI6MjA0OTM0Nzg2M30.oQDQJFVfwlrWlqgKFPpxrKHsrFgcHF9m-wrO2TQXpMk';
        
        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            checkUserSession();
        } catch (error) {
            console.warn('Supabase initialization failed:', error);
        }
    }
}

// Check user session
async function checkUserSession() {
    if (!supabase) return;
    
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            currentUser = session.user;
            updateUIForAuthenticatedUser(session.user);
        }
    } catch (error) {
        console.error('Error checking session:', error);
    }
}

// UI update functions (lightweight versions)
function updateUIForAuthenticatedUser(user) {
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    
    if (userNameEl) userNameEl.textContent = user.user_metadata?.name || user.email;
    if (userEmailEl) userEmailEl.textContent = user.email;
    
    // Update auth buttons visibility
    toggleElementDisplay('authButtons', false);
    toggleElementDisplay('userActions', true);
}

function updateUIForUnauthenticatedUser() {
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    
    if (userNameEl) userNameEl.textContent = 'Utilisateur';
    if (userEmailEl) userEmailEl.textContent = 'Non connecté';
    
    // Update auth buttons visibility
    toggleElementDisplay('authButtons', true);
    toggleElementDisplay('userActions', false);
}

// Utility functions
function toggleElementDisplay(elementId, show) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = show ? 'block' : 'none';
    }
}

// Save data with debouncing
const saveData = debounce(() => {
    try {
        localStorage.setItem('movoAppData', JSON.stringify(appData));
        localStorage.setItem('lastSaved', new Date().toISOString());
    } catch (error) {
        console.error('Failed to save data:', error);
    }
}, 300);

// Page navigation - optimized
function showPage(pageId) {
    // Hide all pages efficiently
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        if (page.classList.contains('active')) {
            page.classList.remove('active');
        }
    });
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Update navigation state
        updateNavigationState(pageId);
        
        // Trigger page-specific initialization
        initializePage(pageId);
    }
}

function updateNavigationState(pageId) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    // Find and activate corresponding nav item
    const pageIndex = ['dashboard', 'transactions', 'bitcoin', 'portfolio', 'tools'].indexOf(pageId);
    if (pageIndex !== -1 && navItems[pageIndex]) {
        navItems[pageIndex].classList.add('active');
    }
}

function initializePage(pageId) {
    // Lazy load page-specific functionality
    switch (pageId) {
        case 'dashboard':
            if (typeof initializeDashboard === 'function') {
                initializeDashboard();
            }
            break;
        case 'bitcoin':
            if (typeof initializeBitcoin === 'function') {
                initializeBitcoin();
            }
            break;
        // Add other page initializations as needed
    }
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    // Could send to monitoring service in production
});

// Performance monitoring
if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
                console.log(`Performance: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
            }
        }
    });
    observer.observe({ entryTypes: ['measure'] });
}

// Export essential functions for other modules
window.MovoApp = {
    showPage,
    saveData,
    debounce,
    appData: () => appData,
    setAppData: (data) => { appData = { ...appData, ...data }; }
};