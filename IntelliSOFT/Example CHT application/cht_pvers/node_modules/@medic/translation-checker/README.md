# translation-checker

Check translations from [.properties](https://en.wikipedia.org/wiki/.properties)
files with [Mustache](http://mustache.github.io/) placeholders markup
or [messageformat](https://messageformat.github.io/messageformat/) syntax.

## Getting started

Node 8.10+ required. Install with:

    $ npm install @medic/translation-checker

Here is how you can use it:

```js
const {
  checkTranslations,
  TranslationException
} = require('@medic/translation-checker');

const dir = `${somePath}/translations`;
let fileNames;
try {
  fileNames = await checkTranslations(dir);
  // Your files passed the validations!
  // fileNames = ['messages-en.properties', 'messages-es.properties', ...]
} catch (err) {
    if (err instanceof TranslationException) {
      // Oops, translation errors !!
      fileNames = err.fileNames;  // ['messages-en.properties', 'messages-es.properties', ...]
      if (!err.errors) {
        return log.error('Exception checking translations:', err.message);
      }
      for (const error of err.errors) {
        switch (error.error) {
          case 'cannot-access-dir':
            return log.warn('Could not find custom translations dir:', dir);
          case 'missed-placeholder':
          case 'wrong-placeholder':
            log.error(error.message);
            break;
          case 'empty-message':
            // less severe, lets log it with WARN severity instead of ERROR
            log.warn(error.message);
            break;
          default:  // 'wrong-messageformat', 'wrong-placeholder'
            // This are more severe errors
            log.error(error.message);
            break;
        }
      }
    } else {
      throw err;  // unexpected ;(
    }
}
```

Logs from the example above will look like:

```
WARN Empty message found for key 'report.pregnancy.u_lmp_date' in 'en' translation 
WARN Empty message found for key 'report.pregnancy.method_lmp' in 'en' translation 
ERROR Cannot compile 'es' translation with key 'Number in month' has placeholders that do not match any in the base translation provided 
ERROR Cannot compile 'es' translation n.month = '{MONTHS, plural one{1 mes} other{# meses}}' : Expected "," but "o" found.
```

## Error details

All the errors raised by `checkTranslations()` are instances of `TranslationException`. The exception
object has an `errors` array with one object for each error detected as following:

```javascript
{
  "lang": "en",                     // The language where the error was found
  "error": "wrong-messageformat",   // The error code
  "key": "n.month2",                // The translation key
  "message": "Cannot compile ..."   // A message with more details about the error
}
```

These are the `error` codes and what they mean:

 - **`cannot-access-dir`** - the directory passed doesn't exist or is not accessible
 - **`wrong-file-name`** - one of the translation files has a wrong name or has
   an unknown ISO 639 language code on it, eg. `messages-e$.properties`
 - **`missed-placeholder`** - a mustache placeholder eg. `{{firstName}}` was found
   in a translation, but main translations ('en' or 'ex') don't have
   placeholders for that translation at all
 - **`wrong-placeholder`** - a mustache placeholder eg. `{{firstName}}` was found
   in a translation that do not match any in the base translations ('en' or 'ex')
   placeholders
 - **`empty-message`** - empty message found in a translation

### Placeholders check

The mustache placeholder check works as following:

 - You need to call `checkTranslations(dir, options)` with
   `options.checkPlaceholders = true` (default).
 - `options.languages` needs to be unset (default) or set at least with
   one or both of the two codes considered "template" languages: 'en', 'ex'
 - 'ex' is not a real ISO language code, but if you have a
   `messages-ex.properties` file, you can place there placeholders
   that can be used for a specific key,
   eg. `hello = {{firstName}} {{lastName}} {{username}}`
 - 'en' language (`messages-en.properties`) is considered the "template"
   or base language, and any placeholder used in any other translation
   file other than 'en' or 'ex' needs to be present in one of these
   two templates. Eg. if you have in the 'en' translation the following
   translation `records.total = {{count}} records`, this is a valid 'es'
   translation: `records.total = {{count}} registros` but this not:
   `records.total = {{count}} registros de {{max}}`. You can use the
   `{{max}}` placeholder either adding it to the 'en' translation or
   adding an entry in the `messages-ex.properties` file like this:
   `records.total = {{max}}` (or `records.total = {{count}} {{max}}`)

Check the JSDoc of the source code to see more options.

### Messageformat check

"Messageformat" check are also performed by default, you can
disable it with `options.checkMessageformat = false`.

A common error is by mistake translate the messageformat
keywords when using online translator tools, eg. this
translation that is OK in English:

```properties
n.month = {MONTHS, plural, one{1 month} other{\# months}}
```

Wrong translated to Spanish:

```properties
n.month = {MONTHS, plural, uno{1 mes} otros{\# meses}}
```

Will raise an error with a the message:

```
Invalid key `uno` for argument `MONTHS`. Valid plural keys for this locale are `one`,
`other`, and explicit keys like `=0`
```

The right translations is:

```properties
n.month = {MONTHS, plural, one{1 mes} other{\# meses}}
```

### Empty message checks

Validations fail if a key is found like this:

```properties
n.month = 
```

But some times empty keys are acceptable because
the software that use the translations fallback
to the default language, so to disable empties
check set `options.checkEmpties` to `false`
(default is `true`).


## Publishing

    $ npm publish --access=public
