const typescript = require("rollup-plugin-typescript");

module.exports = {
    input: "src/index.ts",
    external: ["vscode-languageserver-types", "escodegen", "esprima"],
    output: {
        file: "dist/amd/build.js",
        format: "amd",
        amd: {
            id: "charts-language-service"
        }
    },
    plugins: [
        typescript({
            module: "esnext",
            target: "es5"
        })
    ],
}