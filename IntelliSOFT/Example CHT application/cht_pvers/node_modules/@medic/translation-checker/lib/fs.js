const fs = require('fs');
const properties = require('properties');
const {TranslationException} = require('./errors');

const defaultOptions = {
  separators: '=',
  comments: ['#', ';'],
  path: true,
  strict: true
};

/**
 * Check whether the filesystem path can be accessed in read-only mode.
 */
function fsReadAccess(path) {
  return new Promise((resolve, reject) => {
    fs.access(path, fs.constants.R_OK, (err) => {
      if (err) {
        return reject(new TranslationException(err.message, [
          {
            error: 'cannot-access-dir',
            message: err.message,
            cause: err
          }
        ]));
      }
      resolve();
    });
  });
}

function fsReaddir(path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) {
        return reject(new TranslationException(err.message, [
          {
            error: 'cannot-access-file',
            message: err.message,
            cause: err
          }
        ]));
      }
      resolve(files);
    });
  });
}

function parseProperties(filePath, options = defaultOptions) {
  return new Promise((resolve, reject) => {
    properties.parse(filePath, options, (err, parsed) => {
      if (err) {
        return reject(new TranslationException(err.message, [
          {
            error: 'cannot-parse-file',
            message: err.message,
            cause: err
          }
        ]));
      }
      resolve(parsed);
    });
  });
}

module.exports = {
  fsReadAccess,
  fsReaddir,
  parseProperties
};
