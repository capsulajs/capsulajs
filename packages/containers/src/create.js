const fs = require("fs");
const path = require("path");

const template = (src, pkg, version)=> `
function start(capsula){
    ${src}
};
capsula.register("${pkg}", "${version}", start);
`;

module.exports = function create(options) {
    const file = template(options.src, options.name, options.version);
    const mpath = path.join(options.basePath, options.name, options.version);
    fs.mkdirSync(mpath, { recursive: true });
    fs.writeFileSync(path.join(mpath, 'index.js'), file);
}
