#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const create = require('@capsulajs/containers/src/create');

function pathToPackage(pkgPath) {
    return require(path.join(pkgPath, 'package.json'));
}

if( process.argv[2] == "create" ) {
    const pkg = pathToPackage(process.cwd());
    const options = {
        name: pkg.name,
        version: pkg.version,
        src: fs.readFileSync(path.join(process.cwd(), pkg.main)),
        basePath: "../../fixture1/packages"
    }
    create(options);
}
