/** @type {import('typedoc').TypeDocOptions} */
// eslint-disable-next-line no-undef
module.exports = {
    commentStyle: "all",
    darkHighlightTheme: "material-theme-darker",
    emit: 'both',
    entryPointStrategy: "expand",
    entryPoints: ['index'].map(v => `src/${v}.ts`),
    excludeExternals: true,
    gaID: 'G-8Z61QGB1L9',
    hideGenerator: true,
    includeVersion: true,
    json: 'docs/doc.json',
    lightHighlightTheme: "material-theme-ocean",
    name: "If you see this, it hasn't been changed",
    navigationLinks: { GitHub: "https://github.com/therealbenpai/BotClient" },
    out: 'docs',
    plugin: ["typedoc-plugin-rename-defaults", "typedoc-plugin-extras", "typedoc-plugin-mdn-links"],
    pretty: false,
    readme: "README.md",
    searchInComments: true,
    sort: ["static-first", "kind", "enum-value-ascending"],
}

