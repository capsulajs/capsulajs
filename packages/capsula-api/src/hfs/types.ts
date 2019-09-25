/**
 * @interface File resenting file from a file system
 */
export interface File {
  /**
   * @param path path from file system
   * The path itself is meaningless for `create` as it's not reading the files from FS
   * But the path will used in order to resolve the dependencies, so it must be correlate to all the files
   * Also correlate to your import statements
   */
  path: string;
  /*
   *  @param content the content of the file
   */
  content: string;
  /*
   * @param required if the flag is set it will include the the file.
   * The default behavior is to include file only when some file try to import it
   */
  required?: boolean;
}
/**
 * @interface HFSFile resenting file in HFS file system
 *
 * @param source array with all the original file paths
 * You may have 2 or more files with the same content in different paths, those will resolve as 1 file
 */
export interface HFSFile extends File {
  source: string[];
}

interface Observable<T> {
  subscribe(observer?: any): any;
  /** @deprecated Use an observer instead of a complete callback */
  subscribe(next: null | undefined, error: null | undefined, complete: () => void): any;
  /** @deprecated Use an observer instead of an error callback */
  subscribe(next: null | undefined, error: (error: any) => void, complete?: () => void): any;
  /** @deprecated Use an observer instead of a complete callback */
  subscribe(next: (value: T) => void, error: null | undefined, complete: () => void): any;
  subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): any;
}

/**
 * @interface HFS
 */
export interface HFS {
  /**
   * @method create get files process them to HFS and output them as an abservable
   * possibles errors:
   * `dependency ${path} is not found` in case file you tried to import a file that you didn't pass to create
   */
  create(files: Observable<File>): Observable<HFSFile>;
}
