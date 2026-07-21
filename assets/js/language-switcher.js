/**
 * Language Switcher Module
 * Handles URL-based language switching between Chinese and English versions
 */

(function() {
    'use strict';

    // Language configuration
    const LANGUAGES = {
        zh: {
            code: 'zh',
            name: '中文',
            buttonText: 'EN',
            pages: {
                index: 'index.html',
                contact: 'contact.html',
                projects: {
                    'Bank Customer Churn Prediction': 'projects/Bank Customer Churn Prediction/Bank Customer Churn Prediction.html',
                    'e-commerce fraud detection': 'projects/e-commerce fraud detection/e-commerce fraud detection.html',
                    'lendingclub loan prediction': 'projects/lendingclub loan prediction/lendingclub loan prediction.html',
                    'youtube comment analysis': 'projects/youtube comment analysis/youtube comment analysis.html'
                }
            }
        },
        en: {
            code: 'en',
            name: 'English',
            buttonText: '中',
            pages: {
                index: 'index-en.html',
                contact: 'contact-en.html',
                projects: {
                    'Bank Customer Churn Prediction': 'projects/Bank Customer Churn Prediction/Bank Customer Churn Prediction-en.html',
                    'e-commerce fraud detection': 'projects/e-commerce fraud detection/e-commerce fraud detection-en.html',
                    'lendingclub loan prediction': 'projects/lendingclub loan prediction/lendingclub loan prediction-en.html',
                    'youtube comment analysis': 'projects/youtube comment analysis/youtube comment analysis-en.html'
                }
            }
        }
    };

    class LanguageSwitcher {
        constructor() {
            this.currentLang = this.detectCurrentLanguage();
            this.init();
        }

        /**
         * Initialize the language switcher
         */
        init() {
            // Set up language toggle button
            this.setupLanguageToggle();
            
            // Check for language preference in localStorage
            this.checkLanguagePreference();
            
            // Update all links to maintain language consistency
            this.updateAllLinks();
        }

        /**
         * Detect current language from URL
         * @returns {string} Current language code
         */
        detectCurrentLanguage() {
            const currentPath = window.location.pathname;
            const fileName = currentPath.split('/').pop();
            
            // Check if filename contains -en suffix
            if (fileName.includes('-en.html')) {
                return 'en';
            }
            
            return 'zh';
        }

        /**
         * Get the corresponding page URL for the target language
         * @param {string} targetLang - Target language code
         * @returns {string} URL for the target language page
         */
        getTargetPageUrl(targetLang) {
            const currentPath = window.location.pathname;
            const fileName = currentPath.split('/').pop();
            const pathPrefix = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
            
            // Handle index pages
            if (fileName === 'index.html' || fileName === 'index-en.html' || fileName === '') {
                return targetLang === 'en' ? 'index-en.html' : 'index.html';
            }
            
            // Handle contact pages
            if (fileName === 'contact.html' || fileName === 'contact-en.html') {
                return targetLang === 'en' ? 'contact-en.html' : 'contact.html';
            }
            
            // Handle project pages
            if (currentPath.includes('/projects/')) {
                const projectName = currentPath.split('/projects/')[1].split('/')[0];
                if (targetLang === 'en') {
                    // Switch to English version
                    if (fileName.includes('-en.html')) {
                        return currentPath; // Already English
                    }
                    return pathPrefix + fileName.replace('.html', '-en.html');
                } else {
                    // Switch to Chinese version
                    if (fileName.includes('-en.html')) {
                        return pathPrefix + fileName.replace('-en.html', '.html');
                    }
                    return currentPath; // Already Chinese
                }
            }
            
            // Default fallback
            return targetLang === 'en' ? 'index-en.html' : 'index.html';
        }

        /**
         * Set up the language toggle button
         */
        setupLanguageToggle() {
            const langToggle = document.getElementById('lang-toggle');
            if (!langToggle) return;
            
            // Update button text based on current language
            const buttonSpan = langToggle.querySelector('span');
            if (buttonSpan) {
                buttonSpan.textContent = LANGUAGES[this.currentLang].buttonText;
            }
            
            // Add click event listener
            langToggle.addEventListener('click', () => {
                this.toggleLanguage();
            });
        }

        /**
         * Toggle between languages
         */
        toggleLanguage() {
            const targetLang = this.currentLang === 'zh' ? 'en' : 'zh';
            
            // Save preference to localStorage
            localStorage.setItem('language', targetLang);
            
            // Get target page URL
            const targetUrl = this.getTargetPageUrl(targetLang);
            
            // Navigate to the target page
            window.location.href = targetUrl;
        }

        /**
         * Check for language preference in localStorage
         */
        checkLanguagePreference() {
            const savedLang = localStorage.getItem('language');
            
            // If no preference saved, save current language
            if (!savedLang) {
                localStorage.setItem('language', this.currentLang);
                return;
            }
            
            // If saved preference doesn't match current page language, redirect
            if (savedLang !== this.currentLang) {
                const targetUrl = this.getTargetPageUrl(savedLang);
                // Only redirect if we're not already on the correct page
                if (!window.location.pathname.endsWith(targetUrl)) {
                    window.location.href = targetUrl;
                }
            }
        }

        /**
         * Update all links on the page to maintain language consistency
         */
        updateAllLinks() {
            // Update navigation links
            this.updateNavigationLinks();
            
            // Update project links
            this.updateProjectLinks();
            
            // Update other internal links
            this.updateInternalLinks();
        }

        /**
         * Update navigation links
         */
        updateNavigationLinks() {
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (!href) return;
                
                // Handle hash links (same page navigation)
                if (href.startsWith('#')) {
                    if (this.currentLang === 'en') {
                        // Update to point to English index page
                        if (window.location.pathname.includes('contact')) {
                            link.setAttribute('href', 'index-en.html' + href);
                        }
                    } else {
                        // Update to point to Chinese index page
                        if (window.location.pathname.includes('contact')) {
                            link.setAttribute('href', 'index.html' + href);
                        }
                    }
                }
                
                // Handle index page links
                if (href.includes('index.html') || href.includes('index-en.html')) {
                    if (this.currentLang === 'en') {
                        link.setAttribute('href', href.replace('index.html', 'index-en.html'));
                    } else {
                        link.setAttribute('href', href.replace('index-en.html', 'index.html'));
                    }
                }
                
                // Handle contact page links
                if (href.includes('contact.html') || href.includes('contact-en.html')) {
                    if (this.currentLang === 'en') {
                        link.setAttribute('href', href.replace('contact.html', 'contact-en.html'));
                    } else {
                        link.setAttribute('href', href.replace('contact-en.html', 'contact.html'));
                    }
                }
            });
        }

        /**
         * Update project links
         */
        updateProjectLinks() {
            const projectLinks = document.querySelectorAll('a[href*="/projects/"]');
            projectLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (!href) return;
                
                if (this.currentLang === 'en') {
                    // Ensure project links point to English versions
                    if (!href.includes('-en.html')) {
                        link.setAttribute('href', href.replace('.html', '-en.html'));
                    }
                } else {
                    // Ensure project links point to Chinese versions
                    if (href.includes('-en.html')) {
                        link.setAttribute('href', href.replace('-en.html', '.html'));
                    }
                }
            });
        }

        /**
         * Update internal links (logo, buttons, etc.)
         */
        updateInternalLinks() {
            // Update logo link
            const logoLink = document.querySelector('.navbar-logo');
            if (logoLink) {
                const href = logoLink.getAttribute('href');
                if (href && (href.includes('index.html') || href.includes('index-en.html'))) {
                    if (this.currentLang === 'en') {
                        logoLink.setAttribute('href', 'index-en.html');
                    } else {
                        logoLink.setAttribute('href', 'index.html');
                    }
                }
            }
            
            // Update contact button on index page
            const contactBtn = document.querySelector('a[href*="contact"]');
            if (contactBtn) {
                const href = contactBtn.getAttribute('href');
                if (href && (href === 'contact.html' || href === 'contact-en.html')) {
                    if (this.currentLang === 'en') {
                        contactBtn.setAttribute('href', 'contact-en.html');
                    } else {
                        contactBtn.setAttribute('href', 'contact.html');
                    }
                }
            }
        }

        /**
         * Get current language
         * @returns {string} Current language code
         */
        getCurrentLanguage() {
            return this.currentLang;
        }
    }

    // Initialize language switcher when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.languageSwitcher = new LanguageSwitcher();
        });
    } else {
        window.languageSwitcher = new LanguageSwitcher();
    }
})();