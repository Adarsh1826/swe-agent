// import fs from 'fs/promises';
// import path from 'path';
// import ts from 'typescript';
// import traversalInAst from '../traversingtool/traverse.js';
// import { ChunkTypes } from '../../types/rag-types/index.js';

// // folders we don't want to traverse
// const IGNORE = new Set([
//   'node_modules',
//   '.git',
//   'dist',
//   'build'
// ]);

// // function to convert the file into ast 

// export async function parseFileToAST(dirPath: string,chunk:ChunkTypes[]): Promise<void> {
//   try {
//     const entries = await fs.readdir(dirPath);
    
//     for (const entry of entries) {

    
//       if (IGNORE.has(entry)) continue;

//       const fullPath = path.join(dirPath, entry);
//       const stat = await fs.stat(fullPath);

     
//       if (stat.isDirectory()) {
//         await parseFileToAST(fullPath,chunk);
//         continue;
//       }

     
//       if (
//         stat.isFile() &&
//         (entry.endsWith('.ts') || entry.endsWith('.js'))
//       ) {

//         const content = await fs.readFile(fullPath, 'utf-8');

//         // Create AST
//         const sourceFileAst = ts.createSourceFile(
//           fullPath,
//           content,
//           ts.ScriptTarget.Latest,
//           true,
//           entry.endsWith('.ts')
//             ? ts.ScriptKind.TS
//             : ts.ScriptKind.JS
//         );

       
//         traversalInAst(
//           sourceFileAst,
//           path.relative(process.cwd(), fullPath),
//           chunk,
//           sourceFileAst
//         );
        
//       }
      
//     }
    
//   } catch (err) {
//     console.error('Error reading directory:', err);
//   }
// }

import fs from 'fs/promises';
import path from 'path';
import ts from 'typescript';
import traversalInAst from '../traversingtool/traverse.js';
import { ChunkTypes } from '../../types/rag-types/index.js';

const IGNORE = new Set([
  'node_modules',
  '.git',
  'dist',
  'build'
]);

export async function parseFileToAST(dirPath: string, chunk: ChunkTypes[]): Promise<void> {
  try {
    const entries = await fs.readdir(dirPath);

    for (const entry of entries) {
      if (IGNORE.has(entry)) continue;

      const fullPath = path.join(dirPath, entry);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        await parseFileToAST(fullPath, chunk);
        continue;
      }

      // handle ts/js files
      if (stat.isFile() && (entry.endsWith('.ts') || entry.endsWith('.js'))) {
        const content = await fs.readFile(fullPath, 'utf-8');
        const sourceFileAst = ts.createSourceFile(
          fullPath,
          content,
          ts.ScriptTarget.Latest,
          true,
          entry.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.JS
        );
        traversalInAst(
          sourceFileAst,
          path.relative(process.cwd(), fullPath),
          chunk,
          sourceFileAst
        );
      }

      // handle html/css files
      if (stat.isFile() && (entry.endsWith('.html') || entry.endsWith('.css'))) {
        const content = await fs.readFile(fullPath, 'utf-8');
        chunk.push({
          file: path.relative(process.cwd(), fullPath),
          type: entry.endsWith('.html') ? 'html' : 'css',
          name: entry,
          code: content,
          startLine: 1,
          endLine: content.split('\n').length,
          fileImports: '',
        });
        console.log(`📄 Parsed ${entry}`);
      }
    }

  } catch (err) {
    console.error('Error reading directory:', err);
  }
}
