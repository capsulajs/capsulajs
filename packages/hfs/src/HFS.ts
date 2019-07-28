import { hfs } from '@capsulajs/capsula-api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/*
const link = (graph) => {
    for( file in graph ) {
        $link = importDep(file);
    }
    graph[file.source] =
}

const processor = (files = {}, graph = {}) => (file) => {
    const deps = scanDeps(file);
    const content = removeDeps(file.content);
    const path: calcHash(content);


    const newFile = {
        content,
        path
    }

    files.deps = [...deps, path];
    file.content = createLink(files.deps);

    addFiles([file, newFile]);
};
const addFiles = (files) => {
    files.forEach(addFile);
}
const add() = (file) => {
    files[file.path] = file;
    // resolve
    if( dep )
}
const addFile = (file) => {
    const res = add(file);
    if( res.status = "resolved" ) {
        rename(file, calcHash(res.deps.reduce((a:string,c:string) => a + c)));
    } else if( res.status = "cycle" ) {
        f
    }
}

/*
const compile = ({file, graph}) => {
    const content = removeDeps(file.content);
    const path: calcHash(content);
    graph[path] = graph[file.path];
    graph[file.path] = undefined;

    return {
        file: {
            content,
            path,
            source: file.path
        },
        graph: graph
    }
}



const buildGraph = (graph = {files:{}, deps:{}}) => (file) => {
    const deps = scanDeps(file);
    deps.forEach(d => graph.deps)
    graph.files[file.path] = ;

    return { file, graph }
};
*/


export class HFS implements hfs.HFS {
    public create(files: Observable<hfs.File>): Observable<hfs.HFSFile> {
        return files
            .pipe(
                map(i=>({...i, source: [i.path]} as hfs.HFSFile))
            );
    }
}