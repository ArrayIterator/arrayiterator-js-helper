// import LanguageList from '../../Front/Languages';
import BrowserStorage from "./BrowserStorage";
import {
    is_function,
    is_object,
    isset,
    is_string,
    ucfirst,
    values,
    is_numeric,
    numberval,
    is_async_function,
    lower_trim
} from "./Helper";

const filterLang = (lang) => {
    if (!is_string(lang)) {
        return null;
    }
    lang = lower_trim(lang);
    if (lang.length < 2) {
        return null;
    }
    if (/[^a-z]/.test(lang)) {
        return null;
    }
    return lang;
}

let currentSelectedLanguage = filterLang(document.documentElement.lang || 'en') || 'en',
    languagesCollections = {
        'en': {
            name: 'English',
            direction: 'ltr',
            translations: {},
        },
    },
    hooks = {};

class Translation {
    constructor() {

        this.addHook = this.addHook.bind(this);
        this.removeHook = this.removeHook.bind(this);
        this.switch = this.switch.bind(this);
        this.has = this.has.bind(this);
        this.filter = this.filter.bind(this);
        this.remove = this.remove.bind(this);
        this.set = this.set.bind(this);
        this.add = this.add.bind(this);
        this.merge = this.merge.bind(this);
        this.get = this.get.bind(this);
        this.translations = this.translations.bind(this);
        this.translate = this.translate.bind(this);
        // this.plural = this.plural.bind(this);
        // for (let lang in LanguageList) {
        //     if (lang === 'en') {
        //         continue;
        //     }
        //     this.set(lang, LanguageList[lang]);
        // }
        // let lang = BrowserStorage.getItem('language') || navigator.language;
        // if (lang && lang.trim().length > 0) {
        //     let match = lang.match(/^[a-z]{2}/i);
        //     lang = match ? match[0] : null;
        // }
        // this.switch(lang);
    }

    addHook(action, callback) {
        if (!is_function(callback)) {
            return;
        }
        if (!isset(hooks[action])) {
            hooks[action] = [];
        }
        const fnString = callback.toLocaleString();
        for (let i = 0; i < hooks[action].length; i++) {
            if (hooks[action][i].toLocaleString() === fnString) {
                return;
            }
        }
        hooks[action].push(callback);
    }

    removeHook(action, callback) {
        if (!hooks[action]) {
            return;
        }
        if (!callback) {
            hooks[action] = [];
            return;
        }

        const index = hooks[action].indexOf(callback);
        if (index >= 0) {
            hooks[action].splice(index, 1);
        }
    }

    switch(lang) {
        lang = this.filter(lang);
        if (!lang || !languagesCollections[lang]) {
            return this;
        }

        currentSelectedLanguage = lang;
        document.documentElement.lang = lang;
        document.documentElement.dir = languagesCollections[lang].direction;
        BrowserStorage.setItem('language', lang);
        if (!hooks.switch) {
            return this;
        }

        hooks.switch.forEach(callback => {
            // check if callback is async
            if (is_async_function(callback)) {
                callback(lang, this).then(lang => lang).catch(e=>e);
            } else {
                callback(lang, this);
            }
        });
        return this;
    }

    has(lang) {
        lang = this.filter(lang);
        if (!lang) {
            return false;
        }
        return !!languagesCollections[lang];
    }

    filter(lang) {
        return filterLang(lang);
    }

    remove(lang) {
        lang = this.filter(lang);
        if (!lang || lang === 'en') {
            return;
        }
        delete languagesCollections[lang];
    }

    set(lang, translations) {
        if (!translations || !is_object(translations)) {
            return this;
        }
        lang = this.filter(lang);
        if (!lang) {
            return this;
        }
        // check if lang already exists
        if (lang === 'en') {
            return this;
        }
        const name = translations.name || (
            ucfirst(lang)
        );
        const dir = translations.direction || 'ltr';
        const direction = lower_trim(dir) === 'rtl'
            ? 'rtl'
            : 'ltr';
        const transliteration = {};

        for (let key in translations.translations) {
            if (!is_string(key)) {
                continue;
            }
            let trans = translations.translations[key];
            // detect singular or plural
            if (is_string(trans)) {
                transliteration[key] = [trans];
                continue;
            }
            if (!is_object(trans)) {
                continue;
            }
            trans = values(trans);
            let singular = trans.shift();
            if (!is_string(singular)) {
                continue;
            }
            let plural = trans.shift();
            transliteration[key] = [singular];
            if (is_string(plural)) {
                transliteration[key].push(plural);
            }
        }

        languagesCollections[lang] = {
            name: name,
            direction: direction,
            translations: transliteration
        };
        if (hooks.set) {
            hooks.set.forEach(callback => {
                // check if callback is async
                if (is_async_function(callback)) {
                    callback(lang, languagesCollections[lang], this).then(lang => lang).catch(e => e);
                } else {
                    callback(lang, languagesCollections[lang], this);
                }
            });
        }
        return this;
    }
    add(lang, singular, plural) {
        lang = this.filter(lang);
        if (!lang) {
            return this;
        }
        if (!languagesCollections[lang]) {
            languagesCollections[lang] = {
                name: ucfirst(lang),
                direction: 'ltr',
                translations: {}
            };
        }
        if (!is_string(singular)) {
            return this;
        }
        if (!languagesCollections[lang].translations[singular]) {
            languagesCollections[lang].translations[singular] = [];
        }
        languagesCollections[lang].translations[singular] = [singular];
        if (is_string(plural)) {
            languagesCollections[lang].translations[singular].push(plural);
        }

        if (hooks.set) {
            hooks.add.forEach(callback => {
                // check if callback is async
                if (is_async_function(callback)) {
                    callback(lang, singular, plural, this).then(lang => lang).catch(e=>e);
                } else {
                    callback(lang, singular, plural, this);
                }
            });
        }

        return this;
    }

    merge(lang, translations, skipExisting = false) {
        lang = this.filter(lang);
        if (!lang || !is_object(translations)) {
            return this;
        }
        if (!languagesCollections[lang]) {
            languagesCollections[lang] = {
                name: ucfirst(lang),
                direction: 'ltr',
                translations: translations
            };
        }

        for (let key in translations) {
            if (!is_string(key)) {
                continue;
            }
            if (skipExisting && languagesCollections[lang].translations[key]) {
                continue;
            }
            let trans = translations[key];
            if (is_string(trans)) {
                languagesCollections[key] = [trans];
                continue;
            }
            if (!is_object(trans)) {
                continue;
            }
            trans = values(trans);
            let singular = trans.shift();
            if (is_string(singular)) {
                continue;
            }
            let plural = trans.shift();
            languagesCollections[lang].translations[key] = [singular];
            if (is_string(plural)) {
                languagesCollections[lang].translations[key].push(plural);
            }
        }
        if (hooks.merge) {
            hooks.merge.forEach(callback => {
                // check if callback is async
                if (is_async_function(callback)) {
                    callback(lang, translations, this).then(lang => lang).catch(e=>e);
                } else {
                    callback(lang, translations, this);
                }
            });
        }
        return this;
    }

    get(lang) {
        lang = this.filter(lang);
        if (!lang) {
            return null;
        }
        return this.languages[lang];
    }

    /**
     * @returns {string}
     */
    get currentLanguage() {
        return currentSelectedLanguage;
    }

    get languages() {
        return languagesCollections;
    }

    /**
     * @param {string} text
     * @param {?string} lang
     * @returns {string[]}
     */
    translations(text, lang = null) {
        if (!is_string(text)) {
            return [text];
        }
        lang = lang || currentSelectedLanguage;
        const translations = this.get(lang)?.translations[text];
        if (!translations || translations.length === 0) {
            return [text];
        }
        return translations;
    }

    /**
     * @param {string} text
     * @param {?string} lang
     * @returns {string}
     */
    translate(text, lang = null) {
        const translations = this.translations(text, lang);
        return translations.length > 0 ? translations[0] : text;
    }

    /**
     * @param {string} text
     * @param {string} plural
     * @param {number} count
     * @param {?string} lang
     * @returns {*}
     */
    plural(text, plural, count, lang = null) {
        const translations = this.translations(text, lang);
        if (!is_numeric(count)) {
            count = numberval(count);
        }
        return count === 1 || count
            ? translations[0]
            : (translations.length > 1
                ? translations[1]
                : (is_string(plural) ? plural : translations[0])
            );
    }
}

const Translations = new Translation();

export const setLanguage = Translations.switch;
export const addLanguage = Translations.add;
export const mergeLanguage = Translations.merge;
export const removeLanguage = Translations.remove;
export const hasLanguage = Translations.has;
export const getLanguage = Translations.get;
export const addHook = Translations.addHook;
export const removeHook = Translations.removeHook;
export const filterLanguage = Translations.filter;
export const languages = Translations.languages;
export const currentLanguage = () => currentSelectedLanguage;
export const translations = Translations.translations;
export const translate = Translations.translate;
export const pluralize = Translations.plural;
export const trans = Translations.translate;
export const plural = Translations.plural;
export const __ = Translations.translate;
export const _n = Translations.plural;

export default Translations;
