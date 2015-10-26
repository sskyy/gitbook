var util = require('util');
var path = require('path');
var Q = require('q');
var _ = require('lodash');

var ReactDom = require('react-dom/server');
var React= require('react');
require('node-jsx').install({extension: '.jsx'})

var fs = require('../utils/fs');
var BaseGenerator = require('./website');
var links = require('../utils/links');
var i18n = require('../utils/i18n');

var pkg = require('../../package.json');

var Generator = function() {
    BaseGenerator.apply(this, arguments);
};

util.inherits(Generator, BaseGenerator);

// Prepare the generator


// Prepare all styles


// Prepare templates
Generator.prototype.prepareTemplates = function() {
    this.templates.page = this.book.plugins.template('site:page') || path.resolve(this.options.theme, 'templates/website/Page.jsx');
    this.templates.langs = this.book.plugins.template('site:langs') || path.resolve(this.options.theme, 'templates/website/Langs.jsx');
    this.templates.glossary = this.book.plugins.template('site:glossary') || path.resolve(this.options.theme, 'templates/website/Glossary.jsx');

    return Q();
};

// Prepare template engine`
Generator.prototype.prepareTemplateEngine = function() {
    var that = this;

    return Q()
    .then(function() {
        var language = that.book.config.normalizeLanguage();

        if (!i18n.hasLocale(language)) {
            that.book.log.warn.ln('Language "'+language+'" is not available as a layout locales (en, '+i18n.getLocales().join(', ')+')');
        }

    });
};

// Finis generation
Generator.prototype.finish = function() {
    return this.copyAssets()
    .then(this.copyCover)
    .then(this.writeGlossary)
    .then(this.writeLangsIndex);
};

// Convert an input file


// Write the index for langs


// Write glossary


// Convert a page into a normalized data set


// Generate a template
Generator.prototype._writeTemplate = function(tplAddr, options, output, interpolate) {
    var that = this;

    interpolate = interpolate || _.identity;
    return Q()
    .then(function() {
        var tpl = require(tplAddr)
        return ReactDom.renderToStaticMarkup(
            React.createElement( tpl, _.extend({
                gitbook: {
                    version: pkg.version
                },

                styles: that.styles,

                revision: that.revision,

                title: that.options.title,
                description: that.options.description,
                language: that.book.config.normalizeLanguage(),

                glossary: that.book.glossary,

                summary: that.book.summary,
                allNavigation: that.book.navigation,

                plugins: {
                    resources: that.book.plugins.resources(that.namespace)
                },
                pluginsConfig: JSON.stringify(that.options.pluginsConfig),
                htmlSnippet: _.partial(_.partialRight(that.book.plugins.html, that, options), that.namespace),

                options: that.options,

                basePath: '.',
                staticBase: path.join('.', 'gitbook'),

                helpers : {
                    contentLink : that.book.contentLink.bind(that.book)
                },

                '__': that.book.i18n.bind(that.book)
            }, options))
        );
    })
    .then(interpolate)
    .then(function(html) {
        return fs.writeFile(
            output,
            html
        );
    });
};

// Copy assets


module.exports = Generator;
