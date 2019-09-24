import {hfs} from '@capsulajs/capsula-api';
import {Observable} from 'rxjs';
import {filter, map, switchMap, toArray} from 'rxjs/operators';
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
    links[mod].required = true;
    if (dynamic) {
        head += `const _${links[mod].root} = (obj) => new Promise(resolve => {import("./${links[mod].root}.js").then(mod => {resolve(mod.default(obj));})});\n`;
    } else {
        head += `import _${links[mod].root} from "./${links[mod].root}.js";\n`;
    }

    let dep = "";
    for (let d in links[mod].dep) {
        parseDep(links, d + ".js");
        dep = dep ?
            dep + ", " + `${links[mod].dep[d]}: __${links[d + ".js"].root}` :
            `${links[mod].dep[d]}: __${links[d + ".js"].root}`
    }
    for (let d in links[mod].dyDep) {
        parseDep(links, d + ".js", true);
        dep = dep ?
            dep + ", " + `${links[mod].dyDep[d]}: __${links[d + ".js"].root}` :
            `${links[mod].dyDep[d]}: __${links[d + ".js"].root}`
    }

    if (dynamic) {
        body += `const __${links[mod].root} = () => _${links[mod].root}({${dep}});\n`;
    } else {
        body += `const __${links[mod].root} = _${links[mod].root}({${dep}});\n`;
    }

    links[mod].processed = true

    return head + body;
}
const createLinksFile = (links, link) => {
    head = "";
    body = "";
    return parseDep(links, link);
}
// const path2indentifier = (path) => path.str
const processFiles = (files) =>
    files.pipe(
        map((i: any) => {
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


            return {
                org: i,
                content,
                info: stats.info,
                path: md5(content) + ".js", //md5sum.digest('hex'),
                link: {
                    root: md5(content),
                    dep: {...deps},
                    dyDep: {...dyDeps},
                }
            }
        }),
        toArray()
    );
const linkFiles = switchMap((files: any[]) =>
        Observable.create(obs => {
            const links = {};
            const source:any[] = [];
            files.forEach(i => {
                links[i.org.path] = {
                    ...i.link,
                    required: !!i.org.required,
                    file: i
                };
                source.push(i.org.path)
            });
            let content = "";
            const linksCopy = { ...links };
            for (let link in linksCopy) {
                if (linksCopy[link].required) {
                    const res = createLinksFile(links, link);
                    content += res ? res : "";
                }
            }
            // const content = createLinksFile(links);
            if( content ) {
                obs.next({
                    required: true,
                    source,
                    content,
                    path: md5(content) + ".js", //md5sum.digest('hex'),
                } as hfs.HFSFile);
            }
            for (let link in links) {
                obs.next({
                    content: links[link].file.content,
                    path: md5(links[link].file.content) + ".js", //md5sum.digest('hex'),
                    source: [links[link].file.org.path],
                    required: links[link].required,
                } as hfs.HFSFile);
            }

            obs.complete();
        })
);

export class HFS implements hfs.HFS {
    public create(files: Observable<hfs.File>): Observable<hfs.HFSFile> {

        return processFiles(files).pipe(
            linkFiles,
            // tap((i) => console.log(i)),
            filter(({required}) => required)
        );
    }
}