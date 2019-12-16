import {hfs} from "@capsulajs/capsula-api";


export const files: { [key: string]: string } = {
    "./a.js": `import { b } from "./b";
import { c } from "./c";

const a = 1;
alert(\`abc are \${a}, \${b}, \${c}\`);
`,
    "./b.js": `export const b = 1
`,
    "./c.js": `import { b } from "./b";
export const c = 1 + b;
`
};
export const input: hfs.File[] = [
    {
        path: './a.js',
        content: files["./a.js"],
        required: true
    },
    {
        path: './b.js',
        content: files["./b.js"]
    },
    {
        path: './c.js',
        content: files["./c.js"]
    },
];
