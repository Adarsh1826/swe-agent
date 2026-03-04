import ts from 'typescript';
import { ChunkTypes } from '../../types/rag-types/index.js';

function getFileImports(source: ts.SourceFile): string {
  const imports: string[] = [];
  source.forEachChild((node) => {
    if (ts.isImportDeclaration(node)) {
      imports.push(node.getText(source));
    }
  });
  return imports.join("\n");
}

export default function traversalInAst(
  node: ts.Node,
  filePath: string,
  chunk: ChunkTypes[],
  source: ts.SourceFile,
  fileImports?: string  
) {
  // Only calculate once (first call), then pass it down
  const imports = fileImports ?? getFileImports(source);

  node.forEachChild((child) => {
    if (ts.isFunctionDeclaration(child) || ts.isClassDeclaration(child)) {
      const { line: startLine } = source.getLineAndCharacterOfPosition(child.getStart());
      const { line: endLine } = source.getLineAndCharacterOfPosition(child.getEnd());

      chunk.push({
        file: filePath,
        name: child.name?.getText() ?? "anonymous",
        type: ts.isFunctionDeclaration(child) ? "function" : "class",
        code: child.getText(source),
        fileImports: imports,
        startLine,
        endLine,
      });
    }

    traversalInAst(child, filePath, chunk, source, imports); 
  });
}