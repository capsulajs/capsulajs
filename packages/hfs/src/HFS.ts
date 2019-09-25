import { hfs } from '@capsulajs/capsula-api';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { processFiles } from './proccessFiles';
import { linkFiles } from './linkFiles';

export class HFS implements hfs.HFS {
  public create(files: Observable<hfs.File>): Observable<hfs.HFSFile> {
    return processFiles(files).pipe(
      linkFiles,
      // tap((i) => console.log(i)),
      filter(({ required }) => required)
    );
  }
}
