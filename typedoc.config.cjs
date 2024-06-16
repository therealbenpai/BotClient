/* This is obviously copied from another project without any edits, please fix
/** @type {import('typedoc').TypeDocOptions} *\/
module.exports = {
    cname: 'docs.sparty18.com',
    commentStyle: "all",
    customCss: "config/docs.css",
    darkHighlightTheme: "material-theme-darker",
    emit: 'both',
    entryPointStrategy: "expand",
    entryPoints: ['index', 'objects', 'collection',
        ['swords', 'guns', 'explosives', 'bows']
            .map(v => `weapons/${v}/collection`),
        ['axe', 'hoe', 'pickaxe', 'shovel']
            .map(v => `tools/${v}/collection`),
        ['blocks', 'enchantments', 'effects', 'entities']
            .map(v => `${v}/collection`)
    ].flat(1).map(v => `src/${v}.ts`),
    excludeExternals: true,
    gaID: 'G-8Z61QGB1L9',
    hideGenerator: true,
    includeVersion: true,
    json: 'docs/doc.json',
    lightHighlightTheme: "material-theme-ocean",
    name: "Benpai's TypeScript Game",
    navigationLinks: { GitHub: "https://github.com/therealbenpai/JS-Game" },
    out: 'docs',
    plugin: ["typedoc-plugin-rename-defaults", "typedoc-plugin-extras", "typedoc-plugin-mdn-links", "./plugins/docs/dist/index.cjs"],
    pretty: false,
    readme: "README.md",
    searchInComments: true,
    sitemapBaseUrl: 'https://docs.sparty18.com/',
    sort: ["static-first", "kind", "enum-value-ascending"],
    theme: "my-theme",
}
 */
