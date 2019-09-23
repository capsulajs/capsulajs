let fs = require('fs');
let npath = require('path');

let dir = npath.join(__dirname, "./tmp");

export const init = (path) => {
    dir = npath.join(path, "./tmp");
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}


const deleteFolderRecursive = function(path) {
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
export const save = (files:any, clean = true) => {
    if (fs.existsSync(dir) && clean) {
        deleteFolderRecursive(dir)
    }
    !fs.existsSync(dir) && fs.mkdirSync(dir);
    files.forEach((f: any) => fs.writeFileSync(npath.join(dir, f.path), f.content));
}
export const run = (path:string) => {
    try {
        import(npath.join(dir,path)) as any;
    } catch (e) {
        console.error(e);
    }
}