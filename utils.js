function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

async function dynamicImport(modulePaths, exportNames) {
    for (const path of modulePaths) {
        try {
            const module = await import(path);
            return Object.fromEntries(exportNames.map(name => [name, module[name]]));
        } catch (error) {
            continue;
        }
    }
    throw new Error('Failed to import any of the provided modules');
}

function po_type_encode(type_str) {
    return Number.parseInt(type_str.slice(0, 5), 36);
}

export { $, $$, dynamicImport, po_type_encode };