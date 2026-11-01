import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
function files(dir) { return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? files(path.join(dir,e.name)) : [path.join(dir,e.name)]); }
const routes = files(path.join(root,"app")).filter(f=>f.endsWith("page.tsx")).map(f=>"/"+path.relative(path.join(root,"app"),path.dirname(f)).replaceAll("\\","/")).map(r=>r.replace(/\/$/,"")||"/").sort();
const controls=[]; const problems=[];
for(const file of files(path.join(root,"components")).filter(f=>f.endsWith(".tsx"))) {
  const source=fs.readFileSync(file,"utf8"); const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  function visit(node) {
    if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)) {
      const tag=node.tagName.getText(ast);
      if(["Link","a","ActionLink","Button","button","UnavailableAction","form","summary"].includes(tag)) {
        const attrs=Object.fromEntries(node.attributes.properties.filter(ts.isJsxAttribute).map(a=>[a.name.getText(ast),a.initializer?.getText(ast)??"true"]));
        let owner=node.parent; while(owner && !ts.isFunctionDeclaration(owner)) owner=owner.parent;
        const line=ast.getLineAndCharacterOfPosition(node.getStart()).line+1;
        const type=tag==="UnavailableAction"?"dialog: unavailable":tag==="summary"?"toggle disclosure":tag==="form"||attrs.type==='"submit"'?"submit form":attrs.type==='"reset"'?"reset form":attrs.href?(attrs.href.startsWith('"#')?"anchor":"navigate"):attrs.onClick?.includes("setTab")||attrs.onClick?.includes("setFilter")||attrs.onClick?.includes("setSelected")?"change tab/filter":attrs.onClick?.match(/set\w+\(true\)/)?"open dialog":"action";
        const item={file:path.relative(root,file).replaceAll("\\","/"),component:owner?.name?.text??"inline",line,tag,type,target:attrs.href??attrs.reason??attrs.onSubmit??attrs.onClick??"native/forwarded props",label:(ts.isJsxElement(node.parent)?node.parent.children.map(c=>c.getText(ast)).join(""):attrs['aria-label']??"").replace(/\s+/g," ").slice(0,160)};
        controls.push(item);
        if(['""','"#"',"{''}"].includes(attrs.href)) problems.push({...item,problem:"empty/placeholder href"});
        if(["Button","button"].includes(tag)&&!attrs.onClick&&!attrs.disabled&&!['"submit"','"reset"'].includes(attrs.type)&&!node.attributes.properties.some(ts.isJsxSpreadAttribute)) problems.push({...item,problem:"no handler/type"});
        if(tag==="button"&&!attrs.type) problems.push({...item,problem:"native button missing explicit type"});
      }
    }
    ts.forEachChild(node,visit);
  }
  visit(ast);
}
const out=path.resolve(root,"../docs/ui-validation");fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,"navigation-inventory.json"),JSON.stringify({routes,controls,problems},null,2));
console.log(`${routes.length} route templates; ${controls.length} control declarations; ${problems.length} static problems. Inventory: docs/ui-validation/navigation-inventory.json`);
if(problems.length){console.log(JSON.stringify(problems,null,2));process.exitCode=1;}
