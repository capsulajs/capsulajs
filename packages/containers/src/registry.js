//const runTimeMap = new WeakMap();
const capsulaMap = {};

export function register(name, version, start, alias) {
    const pkg = alias || name;
    capsulaMap[pkg] = capsulaMap[name] || {};
    if(capsulaMap[pkg][version]){
        console.error(`${pkg} already register with ${version}, you can't use different alias if you really need 2 instances`);
        return;
    }
    return capsulaMap[pkg][version] = start;
}

const search = {
    '': (a,b) => a === b || b === '',
    '^': (a,b) => a.split('.')[0] === b.split('.')[0] || b === ''
}
export function resolve(name, version, query) {
    if( !capsulaMap[name] ) {
        console.warn(`${name} not found`);
        return;
    }
    if( !search[query] ) {
        console.warn(`${query} not supported`);
        return;
    }
    return capsulaMap[name][version];
}
