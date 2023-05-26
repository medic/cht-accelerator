class TranslationException extends Error {

  constructor(message, errors, fileNames) {
    super(message);
    this.errors = errors;
    this.name = this.constructor.name;
    this.fileNames = fileNames;
  }
}

module.exports = {
  TranslationException
};
