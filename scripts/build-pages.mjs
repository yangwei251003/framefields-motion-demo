import fs from'node:fs/promises';import path from'node:path';import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await fs.cp(path.join(root,'site'),path.join(root,'_site'),{recursive:true});
