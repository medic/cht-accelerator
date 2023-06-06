# Install

	yarn add redact-basic-auth
	npm install redact-basic-auth

# Use

	const redact = require('redact-basic-auth');

	const url = 'http://username:password@example.com/some/path';

	const redactedUrl = redact(url);
