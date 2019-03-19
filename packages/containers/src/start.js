const lock = {};
function loadScript(url) {
    const promise = new Promise((resolve, reject) => {
        const scriptTag = document.createElement('script');
        scriptTag.onerror = () => reject(new Error(`failed ${url}`));
        scriptTag.onload = resolve;
        scriptTag.async = true;
        scriptTag.src = url + "#uuid=" + Date.now() + '-' + Math.random();
        document.head.appendChild(scriptTag);
    });
    return promise;
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
