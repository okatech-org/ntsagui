
import { translations } from './src/locales/translations.ts';

const languages = Object.keys(translations);
const baseLang = 'fr'; // Assuming French is the source of truth
const baseKeys = getKeys(translations[baseLang]);

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

const missingKeys = {};

languages.forEach(lang => {
  if (lang === baseLang) return;
  const langKeys = getKeys(translations[lang]);
  const missing = baseKeys.filter(key => !langKeys.includes(key));
  if (missing.length > 0) {
    missingKeys[lang] = missing;
  }
});

console.log(JSON.stringify(missingKeys, null, 2));
