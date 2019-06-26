const fs = require("fs");
const path = require("path");

const template = (src, pkg, version)=> `
//function start(capsula){
    WorkerGlobalScope.window = window;
    WorkerGlobalScope.document = document;
    WorkerGlobalScope.localStorage = localStorage;
    WorkerGlobalScope.location = location;
    WorkerGlobalScope.location.hostname = "localhost";
    WorkerGlobalScope.defaultView = defaultView;
    WorkerGlobalScope.Node = defaultView.Node;
    WorkerGlobalScope.Text = defaultView.Text;
    WorkerGlobalScope.Element = defaultView.Element;
    WorkerGlobalScope.SVGElement = defaultView.SVGElement;
    WorkerGlobalScope.Document = defaultView.Document;
    WorkerGlobalScope.Event = defaultView.Event;
    WorkerGlobalScope.MutationObserver = defaultView.MutationObserver;
    WorkerGlobalScope.addEventListener = addEventListener;
    WorkerGlobalScope.removeEventListener = removeEventListener;
    ${src}
//};
//capsula.register("${pkg}", "${version}", start);
`;

module.exports = function create(options) {
    const file = template(options.src, options.name, options.version);
    const mpath = path.join(options.basePath, options.name, options.version);
    fs.mkdirSync(mpath, { recursive: true });
    fs.writeFileSync(path.join(mpath, 'index.js'), file);
}
