// i18n utilities for the physics simulation project
import englishTranslations from './english.js';
import chineseTranslations from './chinese.js';

// Available language translations
const translations = {
    'en': englishTranslations,
    'zh': chineseTranslations
};

// Current language (default to English)
let currentLanguage = 'en';

/**
 * Set the current language for translations
 * @param {string} lang - Language code ('en' or 'zh')
 */
export function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
    } else {
        console.warn(`Language '${lang}' not available, falling back to English`);
        currentLanguage = 'en';
    }
}

/**
 * Get the current language
 * @returns {string} Current language code
 */
export function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Get available languages
 * @returns {string[]} Array of available language codes
 */
export function getAvailableLanguages() {
    return Object.keys(translations);
}

/**
 * Translate a text key to the current language
 * @param {string} key - Translation key
 * @param {string} fallback - Fallback text if translation not found
 * @returns {string} Translated text or fallback
 */
export function t(key, fallback = null) {
    const currentTranslations = translations[currentLanguage];
    
    if (currentTranslations && currentTranslations[key]) {
        return currentTranslations[key];
    }
    
    // If not found in current language, try English as fallback
    if (currentLanguage !== 'en' && translations['en'] && translations['en'][key]) {
        return translations['en'][key];
    }
    
    // If still not found, return the fallback or the key itself
    return fallback || key;
}

/**
 * Translate a text key (alias for t function)
 * @param {string} key - Translation key
 * @param {string} fallback - Fallback text if translation not found
 * @returns {string} Translated text or fallback
 */
export function translate(key, fallback = null) {
    return t(key, fallback);
}

/**
 * Check if a translation key exists
 * @param {string} key - Translation key to check
 * @returns {boolean} True if key exists in current language or English
 */
export function hasTranslation(key) {
    const currentTranslations = translations[currentLanguage];
    return !!(currentTranslations && currentTranslations[key]) || 
           !!(translations['en'] && translations['en'][key]);
}

/**
 * Add translations for a specific language
 * @param {string} lang - Language code
 * @param {Object} newTranslations - Object with translation key-value pairs
 */
export function addTranslations(lang, newTranslations) {
    if (!translations[lang]) {
        translations[lang] = {};
    }
    Object.assign(translations[lang], newTranslations);
}

// Auto-detect browser language on load
function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang) {
        const langCode = browserLang.split('-')[0]; // Get 'en' from 'en-US'
        if (translations[langCode]) {
            setLanguage(langCode);
        }
    }
}

// Initialize with browser language detection
detectBrowserLanguage();

// Default export
export default {
    t,
    translate,
    setLanguage,
    getCurrentLanguage,
    getAvailableLanguages,
    hasTranslation,
    addTranslations
};