import {hfs} from '@capsulajs/capsula-api';
import {Observable, concat} from 'rxjs';
import {map} from 'rxjs/operators';
import md5 from 'md5';

import {transformSync} from "@babel/core";
import {hfsBabel} from "./hfsBabel";

const tmpl = (args, code) => `export default (obj) => {
    ${args !== "{}" ? "const " + args + " = obj;" : ""}
    let exports = {};
${code}
    return exports;
} 
`;
const args = (info) => {
    let ret = "";
    info.source.forEach(i =>
        ret = ret ? ret + ", " + i.name : i.name
    )
    return "{" + ret + "}";
};
let head = "";
let body = "";
const parseDep = (links, mod, dynamic = false) => {
    if (links[mod] === undefined) throw `dependency ${mod} is not found`;
    if (links[mod].processed) return;
    if( dynamic ) {
        head += `const _${links[mod].root} = (obj) => new Promise(resolve => {import("./${links[mod].root}.js").then(mod => {resolve(mod.default(obj));})});\n`;
    } else {
        head += `import _${links[mod].root} from "./${links[mod].root}.js";\n`;
    }

    let dep = "";
    for (let d in links[mod].dep) {
        parseDep(links,d + ".js");
        dep = dep ?
            dep + ", " + `${links[mod].dep[d]}: __${links[d + ".js"].root}` :
            `${links[mod].dep[d]}: __${links[d + ".js"].root}`
    }
    for (let d in links[mod].dyDep){
        parseDep(links,d + ".js", true);
        dep = dep ?
            dep + ", " + `${links[mod].dyDep[d]}: __${links[d + ".js"].root}` :
            `${links[mod].dyDep[d]}: __${links[d + ".js"].root}`
    }

    if( dynamic ) {
        body += `const __${links[mod].root} = () => _${links[mod].root}({${dep}});\n`;
    } else {
        body += `const __${links[mod].root} = _${links[mod].root}({${dep}});\n`;
    }

    links[mod].processed = true

    return head + body;
}
const createLinksFile = (links) => {
    for (let link in links) {
        if( links[link].required ) {
            return parseDep(links, link);
        }
    }
}
// const path2indentifier = (path) => path.str
export class HFS implements hfs.HFS {
    public create(files: Observable<hfs.File>): Observable<hfs.HFSFile> {
        const links = {};
        const paths: string[] = [];

        return concat(
            files.pipe(
                map(i => {
                    //const md5sum = crypto.createHash('md5');
                    const stats = {info: {}};
                    const transform = transformSync(i.content, {
                        code: true,
                        configFile: false,
                        plugins: ["@babel/plugin-syntax-dynamic-import", hfsBabel(stats)],
                        parserOpts: {
                            sourceType: 'module'
                        }
                    });
                    const code = transform ? transform.code : "";
                    const content = tmpl(args(stats.info), code);


                    const deps = {};
                    const dyDeps = {};
                    (stats.info as any).source.forEach((i, k) => {
                        if ((i as any).dynamic) {
                            dyDeps[k] = (i as any).name;
                        } else {
                            deps[k] = (i as any).name;
                        }
                    });

                    links[i.path] = {
                        required: !!i.required,
                        root: md5(content),
                        dep: {...deps},
                        dyDep: {...dyDeps},
                    }

                    paths.push(i.path)

                    return {
                        content,
                        info: stats.info,
                        path: md5(content) + ".js", //md5sum.digest('hex'),
                        source: []
                    } as hfs.HFSFile
                })
            ),
            Observable.create(obs => {
                const content = createLinksFile(links);
                obs.next({
                    content,
                    path: md5(content) + ".js", //md5sum.digest('hex'),
                    source: paths
                } as hfs.HFSFile);
                obs.complete();
            })
        ) as any as Observable<hfs.HFSFile>;
    }
}