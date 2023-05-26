`pojo2xml`
==========

Convert Javascript objects to XML strings.  Fast.

# Installation

## `npm`

	npm install pojo2xml

## `yarn`

	yarn add pojo2xml

# Usage

	var pojo2xml = require('pojo2xml');
	var xmlString = pojo2xml(yourJavascriptObjectHere);

# Not currently supported

* XML declaration (e.g. `<?xml version="1.0"?>`)
* an explicit root node - if the root JS object has more than one property, multiple root elements will be included in the XML
* CDATA
* XML attributes
