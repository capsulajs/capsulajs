import {HFS} from '../../src/HFS';
import {from} from "rxjs";
import {hfs} from '@capsulajs/capsula-api';
import {save, init, run} from "../utils";

init(__dirname);

describe("Feature HFS Create", () => {
    /**
     * Background:
     */
    const files: { [key: string]: string } = {
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
    ];
    const output: any = [];
    const fs = new HFS();
    /**
     * __________________________________End background________________________________________
     */

    beforeEach(() => {
        jest.resetModules();
        while (output.length) {
            output.pop();
        }
        ;
    });

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


        fs.create(from(input))
            .subscribe(
                (f: any) => output.push(f),
                (e) => {
                    throw e
                },
                () => {
                    save(output);
                    output.forEach((f: any) => f.source[0] === "./a.js" && run(f.path));
                }
            );

        (global as any).alert = (msg) => {
            expect(msg).toBe("abc are 1, 1, 2");
            done();
        };
    });


    test(`
            Scenario: Dynamic imports
                Given files ad.js, b.js and c.js
                When Calling create with stream "^-a-b-c-$"
                  | a | { path: "a.js", content: ad.js, required: true } |
                  | b | { path: "b.js", content: b.js } |
                  | c | { path: "c.js", content: c.js } |
                    And saving the output of create
                Then Running the outputted version of a.js it should alert "abc are 1, 1, 2"
    `, (done) => {
        expect.assertions(1);

        const input1: hfs.File[] = [ ...input ];
        input1[0] = {
            required: true,
            path: "./a.js",
            content: `import { b } from "./b";
const c = import("./c");

const a = 1;
c.then(({c}) => alert(\`abc are $\{a\}, $\{b\}, $\{c\}\`));
`
        };


        fs.create(from(input1))
            .subscribe(
                (f: any) => output.push(f),
                (e) => {
                    throw e
                },
                () => {
                    save(output);
                    output.forEach((f: any) => f.source[0] === "./a.js" && run(f.path));
                }
            );

        (global as any).alert = (msg) => {
            expect(msg).toBe("abc are 1, 1, 2");
            done();
        };
    });

    test(`
        Scenario: Source file import unknown file, error "dependency is not found" should be emit
            Given c.js
            When calling create with stream "^-c-$"
              | c | { path: "c.js", content: c.js, required: true } |
            Then create return a stream "!'dependency ./b.js is not found'"
    `, (done) => {
        expect.assertions(1);
        const localInput: hfs.File[] = [input[2]];

        fs.create(from(localInput))
            .subscribe(
                (f: any) => {
                },
                (e) => {
                    expect(e).toBe('dependency ./b.js is not found');
                    done();
                },
                () => {

                }
            );
    });
    /*test(`Scenario: File that isn't flag with required and not import form required file should not output
    Given c.js
    When calling create with stream "^-c-$"
      | c | { path: "b.js", content: b.js } |
    Then create return a stream "^-$"`, (done) => {
        throw "not implemented";
        expect.assertions(1);
        const input: hfs.File[] = [
            {
                path: './c.js',
                content: files["./c.js"]
            },
        ]

        fs.create(from(input))
            .subscribe(
                (f: any) => {
                    expect(true).toBe("observable shouldn't emit")
                },
                (e)=>{


                },
                ()=>{
                    expect(true).toBe(true);
                    done();
                }
            );
    });*/
    test(`
        Scenario: Deploying modified application on top of the old version, both version should work
            Given files a.js, b.js and c.js
                And Calling create with stream "^-a-b-c-$"
                  | a | { path: "a.js", content: a.js, required: true } |
                  | b | { path: "b.js", content: b.js } |
                  | c | { path: "c.js", content: c.js } |
                And saving the output of create
            When File a.js -> const a = 1 is changed to 2
                And running create and saving out put on top of previous output
            Then Running the outputted version of old a.js it should alert "abc are 1, 1, 2"
                And  Running the outputted version of new a.js it should alert "abc are 2, 1, 2"
    `, (done) => {
        expect.assertions(4);


        const input1: hfs.File[] = [ ...input ];
        const input2: hfs.File[] = [ ...input ];
        input2[0] = {
            path: './a.js',
            required: true,
            content: `import { b } from "./b";
import { c } from "./c";

const a = 2;
alert(\`abc are \${a}, \${b}, \${c}\`);`

        }
        const output1: any = [];
        const output2: any = [];

        fs.create(from(input1))
            .subscribe(
                (f: any) => output1.push(f),
                (e) => {
                    throw e
                },
                () => {
                    save(output1);

                }
            );

        fs.create(from(input2))
            .subscribe(
                (f: any) => output2.push(f),
                (e) => {
                    throw e
                },
                () => {
                    save(output2, false);


                    // check "b" is the same
                    const out1 = {};
                    output1.forEach(i => out1[i.path] = i.content);
                    output2.forEach(i => out1[i.path] && expect(i.content).toBe(i.content));

                    (global as any).alert = (msg) => {
                        expect(msg).toBe("abc are 1, 1, 2");
                        (global as any).alert = (msg) => {
                            expect(msg).toBe("abc are 2, 1, 2");
                            done();
                        };

                        output2.forEach((f: any) => f.source[0] === "./a.js" && run(f.path));
                    };

                    output1.forEach((f: any) => f.source[0] === "./a.js" && run(f.path));


                }
            );


    });

    test(`
        Scenario: Deploying 2 applications with common files, the common files should be the same
        Scenario: Deploying 2 applications to the same location both application should work
            # this cover this 2 scenarios
            Given files a.js, b.js and c.js
            When Calling create with stream "^-a-b-c-$"
              | a | { path: "a.js", content: a.js, required: true } |
              | b | { path: "b.js", content: b.js } |
              | c | { path: "c.js", content: c.js } |
                And saving the output of create
                And Calling create with stream "^-d-b-"
                  | d | { path: "d.js", content: "import {b} from './b'; alert(b);", required: true } |
                  | b | { path: "b.js", content: b.js } |
                And saving the output of create
            Then Running the outputted version of a.js it should alert "abc are 1, 1, 2"
                And Running the outputted version of d.js it should alert "1"
                And output for b.js should be the same for both create iterations
    `, (done) => {
        expect.assertions(3);

        const output1: any = [];
        const output2: any = [];

        fs.create(from(input))
            .subscribe(
                (f: any) => output1.push(f),
                (e) => {
                    throw e
                },
                () => {
                    save(output1);

                }
            );
        const input2: hfs.File[] = [
            {
                path: './d.js',
                content: `import {b} from './b'; alert(b);`
            },
            input[1]
        ]

        fs.create(from(input2))
            .subscribe(
                (f: any) => output2.push(f),
                (e) => {
                    throw e
                },
                () => {
                    save(output2, false);

                    // check "b" is the same
                    const out1 = {};
                    output1.forEach(i => out1[i.path] = i.content);
                    output2.forEach(i => out1[i.path] && expect(i.content).toBe(i.content));


                    (global as any).alert = (msg) => {
                        expect(msg).toBe("abc are 1, 1, 2");
                        (global as any).alert = (msg) => {
                            expect(msg).toBe(1);
                            done();
                        };

                        output2.forEach((f: any) => f.source[0] === "./d.js" && run(f.path));
                    };
                    output1.forEach((f: any) => f.source[0] === "./a.js" && run(f.path));
                }
            );
    });
});