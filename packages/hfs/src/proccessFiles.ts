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

const transform = (file) => {
  let info;

  const res = transformSync(file.content, {
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

  return { ...res, info };
};
const template = (file) => {
  const code = file ? file.code : '';
  return tmpl(destructuringString(file.info), code);
};
const getDependencies = (file) => {
  const ret = {
    static: {},
    dynamic: {},
  };
  const deps = file.info.source || [];

  deps.forEach((v, k) => {
    if ((v as any).dynamic) {
      ret.dynamic[k] = (v as any).name;
    } else {
      ret.static[k] = (v as any).name;
    }
  });

  return ret;
};
const processFiles = (files) =>
  files.pipe(
    map((i: any) => {
      const res = transform(i);
      const content = template(res);
      const dependencies = getDependencies(res);

      return {
        org: i,
        content,
        path: md5(content) + '.js', // md5sum.digest('hex'),
        link: {
          deps: dependencies,
          root: md5(content),
        },
      };
    }),
    toArray()
  );

export { processFiles };
