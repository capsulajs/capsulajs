import {HFS} from '../../src/HFS';
import {from} from "rxjs";
import { hfs } from '@capsulajs/capsula-api';

var fs = require('fs');
var npath = require('path');
var dir = './test/create/tmp';

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}
var deleteFolderRecursive = function(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function(file, index){
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
const save = (files:any) => {
    if (fs.existsSync(dir)) {
        deleteFolderRecursive(dir)
    }
    fs.mkdirSync(dir);
    files.forEach((f: any) => fs.writeFileSync(npath.join(dir, f.path), f.content));
}
const run = (path:string) => {
    try {
        import(path) as any;
    } catch (e) {
        console.error(e);
    }

}

describe("Feature HFS Create", () => {
    /**
     * Background:
     * __________________________________File For test________________________________________
     */
    const files: { [key: string]: string } = {};

    files["./a.js"] = `import { b } from "./b";
import { c } from "./c";

const a = 1;
alert(\`abc are \${a}, \${b}, \${c}\`);
`;
    files["./b.js"] = `export const b = 1;
`;

    files["./c.js"] = `import { b } from "./b";
export const c = 1 + b;
`;

    test(`
        Scenario: File that isn't flag with required should output if some file import it
        Scenario: Application made from 3 source files should work from the HFS output
            # this cover this 2 scenarios
            Given files a.js, b.js and c.js
            When Calling create with stream "^-a-b-c-$"
              | a | { path: "a.js", content: a.js, required: true } |
              | b | { path: "b.js", content: b.js } |
              | c | { path: "c.js", content: c.js } |
            And saving the output of create
            Then Running the outputted version of a.js it should alert "abc are 1, 1, 2"
    `, (done) => {
        expect.assertions(1);
        const input: hfs.File[] = [
            {
                path: './a.js',
                content: files["./a.js"]
            },
            {
                path: './b.js',
                content: files["./b.js"]
            },
            {
                path: './c.js',
                content: files["./c.js"]
            },
        ]
        const output: any = [];
        const fs = new HFS();
        fs.create(from(input))
            .subscribe(
                (f: any) => output.push(f),
                (e)=>{ throw e},
                ()=>{
                    save(output);
                    output.forEach((f:any) => f.source[0] === "./a.js" && run("./" + npath.join('./tmp', f.path)) );
                }
            );


        (global as any).alert = (msg) => {
            expect(msg).toBe("abc are 1, 1, 2");
            done();
        };
    });
});