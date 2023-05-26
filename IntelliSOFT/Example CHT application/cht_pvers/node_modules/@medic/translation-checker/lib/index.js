const {TranslationException} = require('./errors');
const {parseProperties} = require('./fs');
const {fileLanguage, isLanguageCodeValid, translationFileNames} = require('./parse-name');
const path = require('path');
const MessageFormat = require('messageformat');

const MUSTACHE_MATCHER = /\\?{\\?{[\s\w.#^/'|]+\\?}\\?}/g;
const MUSTACHE_REPLACER_MATCHER = /[{}\\\s#^/]*/g;
const OR_OPERATOR_MATCHER = /\s*\|\|\s*/;
const CONSTANT_MATCHER = /^'.*'$/;

const ENGLISH_TRANSLATIONS = 'messages-en.properties';
const EXTRA_PLACEHOLDERS = 'messages-ex.properties';

// Similar to Array.flatMap() from ES10 that is not present in Node 8
const flatMap = (arr, func) => [].concat.apply([], arr.map(func));


/**
 * Check all the languages translations, optionally using `baseTranslations`
 * as template translations when placeholders are used.
 *
 * @param {string} dir - directory where the translation files with name messages-XX.properties are stored
 * @param {string[]} languages - the lowercase ISO 639-1 code languages to be checked. Do not
 *        set to check all the languages found at `dir`
 * @param {boolean} [checkPlaceholders=true] - whether to check missed placeholders or not
 * @param {boolean} [checkMessageformat=true] - whether to check wrong Messageformat or not
 * @param {boolean} [checkEmpties=true] - whether to check empty messages or not
 *
 * @returns {Promise<string[]>} resolved promise with the list of translation files processed if there
 *        are no errors, or a rejected one with a `TranslationException` error.
 *
 *        The exception has an attribute "errors" that is an array with the validations failed, and
 *        the following fields:
 *
 *            {
 *              message: "Error trying to compile translations",
 *              fileNames: [
 *                "messages-en.properties",
 *                "messages-es.properties",
 *                "messages-hi.properties",
 *                "messages-it.properties"
 *              ],
 *              errors: [
 *                {error: "missed-placeholder",  lang: "es", key: "n.month", message: "key not found in..."},
 *                {error: "wrong-placeholder",   lang: "hi", key: "user.greeting", message: "placeholders not..."},
 *                {error: "wrong-messageformat", lang: "hi", key: "u.count", message: "Expect...", cause: Error(...)},
 *                ...
 *              ]
 *            }
 */
async function checkTranslations(
  dir,
  {
    checkPlaceholders=true,
    checkMessageformat=true,
    checkEmpties=true,
    languages=[]
  }={}
) {
  const errors = [];
  const fileNames = await translationFileNames(dir, languages);
  let englishTranslations = {};
  let extraTranslations = {};
  let templatePlaceholders = null;
  if (checkPlaceholders) {
    if (fileNames.indexOf(ENGLISH_TRANSLATIONS) >= 0) {
      englishTranslations = await parseProperties(path.join(dir, ENGLISH_TRANSLATIONS));
    }
    if (fileNames.indexOf(EXTRA_PLACEHOLDERS) >= 0) {
      extraTranslations = await parseProperties(path.join(dir, EXTRA_PLACEHOLDERS));
    }
    templatePlaceholders = extractPlaceholdersFromTranslations(englishTranslations, extraTranslations);
  }
  for (const fileName of fileNames) {
    let translations = null;
    if (checkPlaceholders && fileName === ENGLISH_TRANSLATIONS) {         // Do not process again 'en'
      translations = englishTranslations;
    } else if (checkPlaceholders && fileName !== EXTRA_PLACEHOLDERS) {    // Do not process again 'ex'
      translations = await parseProperties(path.join(dir, fileName));
    }
    if (translations) {
      errors.push(
        ...checkFileTranslations(
          translations, fileName, templatePlaceholders,
          checkMessageformat, checkEmpties
        )
      );
    }
  }
  if (errors.length) {
    throw new TranslationException(
      'Error trying to compile translations', errors, fileNames);
  }
  return fileNames;
}

function checkFileTranslations(
  translations,
  fileName,
  templatePlaceholders,
  checkMessageformat,
  checkEmpties
) {
  const errors = [];
  const lang = fileLanguage(fileName);
  let mf = null;
  if (checkMessageformat) {
    try {
      mf = new MessageFormat(lang);
    } catch (e) {
      // unknown language, won't check messageformat
    }
  }
  const placeholders = extractPlaceholdersFromTranslations(translations);
  for (const [msgKey, msgSrc] of Object.entries(translations)) {
    if (!msgSrc) {
      if (checkEmpties) {
        errors.push(parserEmptyMessage(lang, msgKey));
      }
    } else if (typeof msgSrc === 'string') {
      if (msgSrc.match(MUSTACHE_MATCHER) !== null) {
        if (templatePlaceholders) {
          const msgPlaceholders = placeholders[msgKey];
          if (msgPlaceholders) {
            const templatePlaceholder = templatePlaceholders[msgKey];
            if (!templatePlaceholder) {
              errors.push(parserMissedPlaceholder(lang, msgKey));
            } else {
              const foundAllPlaceholders = isSuperset(templatePlaceholder, msgPlaceholders);
              if (!foundAllPlaceholders) {
                errors.push(parserWrongPlaceholder(lang, msgKey));
              }
            }
          }
        }
      } else if (mf) {
        try {
          mf.compile(msgSrc);
        } catch (e) {
          errors.push(parserWrongMessageFormat(lang, msgKey, msgSrc, e));
        }
      }
    }
  }
  return errors;
}

function extractPlaceholdersFromTranslations(translations, extraPlaceholders = {}) {
  // Extract from github.com/medic/cht-core/blob/master/scripts/poe/lib/utils.js
  const result = {};
  for (const [msgKey, msgSrc] of Object.entries(translations)) {
    let msgPlaceholders = [];
    if (typeof msgSrc === 'string') {
      msgPlaceholders = extractPlaceholdersKeysFromMsg(msgSrc);
    }
    if (typeof extraPlaceholders[msgKey] === 'string') {
      msgPlaceholders =
        msgPlaceholders.concat(extractPlaceholdersKeysFromMsg(extraPlaceholders[msgKey]));
    }
    if (msgPlaceholders.length) {
      result[msgKey] = new Set(msgPlaceholders);
    } else if (extraPlaceholders[msgKey]) {
      result[msgKey] = extraPlaceholders[msgKey];
    }
  }
  return result;
}


/**
 * Return all the placeholders variable names from the message passed,
 * cleaning up spaces, operators like ^ || #..., and constant like 'none'.
 * @param {string} message
 * @returns {string[]}
 */
function extractPlaceholdersKeysFromMsg(message) {
  // 'This is {{var1}} and this is {{ ^var2 }}' => [ '{{var1}}', '{{ ^var2 }}' ]
  let placeholders = message.match(MUSTACHE_MATCHER) || [];
  // ... => [ 'var1', 'var2' ]
  placeholders = placeholders.map(s=>s.replace(MUSTACHE_REPLACER_MATCHER, ''));
  // If [ "a || 'b'", 'c', ... => [ 'a', "'b'", 'd', ...
  placeholders = flatMap(placeholders, s=>s.split(OR_OPERATOR_MATCHER));
  // Remove constants [ 'a', "'b'", 'c', ... => [ 'a', 'c', ...
  return placeholders.filter(s=>!CONSTANT_MATCHER.test(s));
}

/**
 * Return `true` if `set` is a superset of `subset`.
 *
 * @param {Set} set
 * @param {Set} subset
 * @returns {boolean}
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#Implementing_basic_set_operations
 */
function isSuperset(set, subset) {
  for (const elem of subset) {
    if (!set.has(elem)) {
      return false;
    }
  }
  return true;
}

function parserEmptyMessage(lang, msgKey) {
  return {
    lang: lang,
    error: 'empty-message',
    key: msgKey,
    message: `Empty message found for key '${msgKey}' in '${lang}' translation`
  };
}

function parserMissedPlaceholder(lang, msgKey) {
  return {
    lang: lang,
    error: 'missed-placeholder',
    key: msgKey,
    message: `Cannot compile '${lang}' translation with key '${msgKey}' has placeholders, `
             + 'but base translations does not have placeholders'
  };
}

function parserWrongPlaceholder(lang, msgKey) {
  return {
    lang: lang,
    error: 'wrong-placeholder',
    key: msgKey,
    message: `Cannot compile '${lang}' translation with key '${msgKey}' has placeholders `
           + 'that do not match any in the base translation provided'
  };
}

function parserWrongMessageFormat(lang, msgKey, msgSrc, e) {
  return {
    lang: lang,
    error: 'wrong-messageformat',
    key: msgKey,
    message: `Cannot compile '${lang}' translation ${msgKey} = '${msgSrc}' : ${e.message}`
  };
}

module.exports = {
  checkTranslations,
  fileLanguage,
  isLanguageCodeValid,
  TranslationException
};
