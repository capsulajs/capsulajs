import { isModule } from '@babel/helper-module-transforms';
import normalizeAndLoadModuleMetadata from './normalize-and-load-metadata';
import rewriteLiveReferences from '@babel/helper-module-transforms/lib/rewrite-live-references';

export default (cb) => (babel) => ({
  visitor: {
    Program: {
      exit(path, state) {
        if (!isModule(path)) {
          return;
        }

        const {
          loose = true,
          exportName = 'exports',
          noInterop = true,
          lazy = true,
          // Defaulting to 'true' for now. May change before 7.x major.
        } = {};
        const meta = normalizeAndLoadModuleMetadata(path, exportName, {
          noInterop,
          loose,
          lazy,
          esNamespaceOnly: true,
        });
        rewriteLiveReferences(path, meta);
        cb(meta);
      },
    },
  },
});
