const iso639 = require('iso-639-1');
const {TranslationException} = require('./errors');
const {fsReadAccess, fsReaddir} = require('./fs');

const FILE_MATCHER = /^messages-.*\.properties$/;

const LANG_MATCHER = /^messages-([_a-zA-Z]+[_a-zA-Z0-9-]+).properties$/;

const VALID_LANG_CODE_MATCHER = /^[_a-zA-Z]+[_a-zA-Z0-9-]+$/;


/**
 * Returns all the translation files found at `path`.
 * @param {string} path - path where the files are stored
 * @param {string[]} languages - if not empty filter these languages
 * @returns {Promise<string[]>} list of filenames
 */
async function translationFileNames(path, languages = []) {
  await fsReadAccess(path);
  let fileNames = (await fsReaddir(path)).filter(name => FILE_MATCHER.test(name));
  if (languages.length) {
    fileNames = fileNames.filter(name => languages.indexOf(fileLanguage(name)) >= 0);
  }
  const wrongFileNames = [];
  for (const fileName of fileNames) {
    const lang = fileLanguage(fileName);
    if (!iso639.getName(lang)
        && lang !== 'ex'      // 'ex' is not ISO code but can be used as a "template" lang
        && lang !== 'loz') {  // 'loz' is Lozi language, recognized but in version 2 of ISO 639
      wrongFileNames.push(fileName);
    }
  }
  if (wrongFileNames.length) {
    throw new TranslationException('Failed to validate file names', [
      {
        error: 'wrong-file-name',
        message: `The following file/s have wrong ISO 639 language code: ${wrongFileNames.join(', ')}`
      }
    ], fileNames);
  }
  return fileNames;
}

/**
 * Return the language code present in the filename.
 * @param fileName - translation file in the form of messages-xx.properties,
 *        where `xx` is the ISO language code, eg. 'en'
 * @returns {string|null} the language code or `null` if the name is
 *          not a valid translation filename
 */
function fileLanguage(fileName) {
  const [, lang] = LANG_MATCHER.exec(fileName) || [];
  return lang || null;
}

/**
 * Some code language may not be recognized by ISO 639-1, but
 * at least should pass this check
 * @param {string} code the language code, eg 'it'
 * @returns {boolean}
 */
function isLanguageCodeValid(code) {
  return VALID_LANG_CODE_MATCHER.test(code);
}

module.exports = {
  fileLanguage,
  isLanguageCodeValid,
  translationFileNames
};
