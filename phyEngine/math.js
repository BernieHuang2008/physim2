import { dynamicImport } from './../utils.js';

const mathSources = [
    'https://cdn.jsdelivr.net/npm/mathjs@15.0/+esm',
    'https://unpkg.com/mathjs@15.0/esm',
    'https://cdn.skypack.dev/mathjs@15.0'
];

const mathImports = await dynamicImport(mathSources, ['create', 'all']);
const { create, all } = mathImports;

const math = create(all);

export { math };