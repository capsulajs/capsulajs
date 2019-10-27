import { map, toArray } from 'rxjs/operators';
import { transformSync } from '@babel/core';
import babelRemoveImportsGetMeta from './babelRemoveImportsGetMeta';
import md5 from 'md5';

const tmpl = (arg, code) => `export default (obj) => {
    ${arg !== '{}' ? 'const ' + arg + ' = obj;' : ''}
    let exports = {};
${code}
    return exports;
}
`;
const destructuringString = (info) => {
  let ret = '';
  info.source.forEach((i) => (ret = ret ? ret + ', ' + i.name : i.name));
  return '{' + ret + '}';
};

const processFiles = (files) =>
  files.pipe(
    map((i: any) => {
      let info;

      const transform = transformSync(i.content, {
        code: true,
        configFile: false,
        plugins: [
          '@babel/plugin-syntax-dynamic-import',
          babelRemoveImportsGetMeta((meta) => {
            info = meta;
          }),
        ],
        parserOpts: {
          sourceType: 'module',
        },
      });
      const code = transform ? transform.code : '';
      const content = tmpl(destructuringString(info), code);
      const deps = {};
      const dyDeps = {};
      (info as any).source.forEach((v, k) => {
        if ((v as any).dynamic) {
          dyDeps[k] = (v as any).name;
        } else {
          deps[k] = (v as any).name;
        }
      });
      return {
        org: i,
        content,
        info,
        path: md5(content) + '.js', // md5sum.digest('hex'),
        link: {
          root: md5(content),
          dep: { ...deps },
          dyDep: { ...dyDeps },
        },
      };
    }),
    toArray()
  );

export { processFiles };
