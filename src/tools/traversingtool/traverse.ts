import ts from 'typescript'
import { ChunkTypes } from '../../types/rag-types/index.js';

export default function traversalInAst(node: ts.Node, filePath: string,chunk:ChunkTypes[],source: ts.SourceFile,) {
  node.forEachChild((child) => {

    if (ts.isFunctionDeclaration(child) || ts.isClassDeclaration(child)) {
      //console.log("Found in", filePath, "->", child.name?.getText());
      chunk.push({
        file:filePath,
        name: child.name?.getText() ?? "anonymous",
        type: ts.isFunctionDeclaration(child) ? "function" : "class",
        code: child.getText(source)
      })
    }
    // recursive call again
    
    traversalInAst(child, filePath,chunk,source);
  });
}
