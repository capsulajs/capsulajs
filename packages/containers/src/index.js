import { start } from './start';
import { register, resolve } from './registry';

window['capsula'] = {
    register,
    start: ({name, version, shared}) => {
            start({
                name,
                version,
                baseUrl: '../packages',
                main: 'index.js',
                // cb: () => resolve(name, version, "")(shared)
            });
    }
}