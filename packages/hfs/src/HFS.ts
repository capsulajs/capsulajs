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
                        plugins: [hfsBabel(stats)],
                        parserOpts: {
                            sourceType: 'module'
                        }
                    });
                    const code = transform ? transform.code : "";
                    const content = tmpl(args(stats.info), code);


                    const deps = {};
                    (stats.info as any).source.forEach((i, k) =>
                        deps[k] = (i as any).name
                    );

                    links[i.path] = {
                        root: md5(content),
                        dep: {...deps}
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
                let head = "";
                let body = "";
                const parseDep = (mod) => {
                    if (links[mod] === undefined) throw `dependency ${mod} is not found`;
                    if (links[mod].processed) return;
                    let dep = "";
                    for (let d in links[mod].dep) {
                        parseDep(d + ".js");

                        dep = dep ?
                            dep + ", " + `${links[mod].dep[d]}: __${links[d + ".js"].root}` :
                            `${links[mod].dep[d]}: __${links[d + ".js"].root}`
                    }
                    body += `const __${links[mod].root} = _${links[mod].root}({${dep}});\n`;
                    links[mod].processed = true
                }
                for (let link in links) {
                    head += `import _${links[link].root} from "./${links[link].root}.js";\n`;
                    parseDep(link);
                }
                obs.next({
                    content: head + body,
                    path: md5(head + body) + ".js", //md5sum.digest('hex'),
                    source: paths
                } as hfs.HFSFile);
                obs.complete();
            })
        ) as any as Observable<hfs.HFSFile>;
    }
}