import {upgradeElement} from '@ampproject/worker-dom/dist/index.mjs';

const lock = {};
function loadScript(url) {
    const uuid = Date.now() + '-' + Math.random();
    //const promise = new Promise((resolve, reject) => {
        const scriptTag = document.createElement('div');
        //scriptTag.onerror = () => reject(new Error(`failed ${url}`));
        //scriptTag.async = true;

        scriptTag.setAttribute('src', url + "#uuid=" + uuid);
        scriptTag.id = uuid;
        //scriptTag.onload = resolve;
        document.body.appendChild(scriptTag);
        return  upgradeElement(document.getElementById(uuid), 'worker.js');
    //});
    //return promise;
}

export function start(options){
    const url = `${options.baseUrl}/${options.name}/${options.version}/${options.main}`;
    lock[url] = lock[url] || Promise.resolve();
    lock[url].then(() => {
        lock[url] = loadScript(url).then(() => {
            options.cb.bind({});
            options.cb({ ...options.shared });
        });
    });
}
