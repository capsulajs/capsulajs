import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { hfs } from '@capsulajs/capsula-api';
import md5 from 'md5';

let head = '';
let body = '';
const parseDep = (links, mod, dynamic = false) => {
  if (links[mod] === undefined) {
    throw new Error(`dependency ${mod} is not found`);
  }
  if (links[mod].processed) {
    return;
  }
  links[mod].required = true;
  if (dynamic) {
    head += `const _${links[mod].root} = (obj) => new Promise(resolve => {import("./${links[mod].root}.js").then(mod => {resolve(mod.default(obj));})});\n`;
  } else {
    head += `import _${links[mod].root} from "./${links[mod].root}.js";\n`;
  }

  let dep = '';
  for (const d in links[mod].dep) {
    parseDep(links, d + '.js');
    dep = dep
      ? dep + ', ' + `${links[mod].dep[d]}: __${links[d + '.js'].root}`
      : `${links[mod].dep[d]}: __${links[d + '.js'].root}`;
  }
  for (const d in links[mod].dyDep) {
    parseDep(links, d + '.js', true);
    dep = dep
      ? dep + ', ' + `${links[mod].dyDep[d]}: __${links[d + '.js'].root}`
      : `${links[mod].dyDep[d]}: __${links[d + '.js'].root}`;
  }

  if (dynamic) {
    body += `const __${links[mod].root} = () => _${links[mod].root}({${dep}});\n`;
  } else {
    body += `const __${links[mod].root} = _${links[mod].root}({${dep}});\n`;
  }

  links[mod].processed = true;

  return head + body;
};
const createLinksFile = (links, link) => {
  head = '';
  body = '';
  return parseDep(links, link);
};

const linkFiles = switchMap((files: any[]) =>
  Observable.create((obs) => {
    const links = {};
    const source: any[] = [];
    files.forEach((i) => {
      links[i.org.path] = {
        ...i.link,
        required: !!i.org.required,
        file: i,
      };
      source.push(i.org.path);
    });
    let content = '';
    const linksCopy = { ...links };
    for (const link in linksCopy) {
      if (linksCopy[link].required) {
        const res = createLinksFile(links, link);
        content += res ? res : '';
      }
    }
    // const content = createLinksFile(links);
    if (content) {
      obs.next({
        required: true,
        source,
        content,
        path: md5(content) + '.js', // md5sum.digest('hex'),
      } as hfs.HFSFile);
    }
    for (const link in links) {
      obs.next({
        content: links[link].file.content,
        path: md5(links[link].file.content) + '.js', // md5sum.digest('hex'),
        source: [links[link].file.org.path],
        required: links[link].required,
      } as hfs.HFSFile);
    }

    obs.complete();
  })
);

export { linkFiles };
