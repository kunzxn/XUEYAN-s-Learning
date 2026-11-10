import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const compiled=ts.transpileModule(fs.readFileSync(new URL('../lib/account-study-draft.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
function setup(data=new Map(),blocked=false){const context={exports:{},localStorage:{getItem:k=>{if(blocked)throw Error();return data.get(k)??null;},setItem:(k,v)=>{if(blocked)throw Error();data.set(k,v);}}};vm.runInNewContext(compiled,context);return context.exports;}
const event='10000000-0000-0000-0000-000000000001';
const draft={version:1,ids:[12,34],index:1,events:[event],flipped:true,pending:{id:'20000000-0000-0000-0000-000000000002',rating:2,durationMs:200},page:3};
test('resume includes queue, current side, page, saved events and stable pending retry',()=>{const map=new Map();const a=setup(map);assert.equal(a.writeStudyDraft(a.studyDraftKey('alice','learn-2'),draft),true);const b=setup(map);assert.equal(JSON.stringify(b.readStudyDraft(b.studyDraftKey('alice','learn-2')).draft),JSON.stringify(draft));assert.equal(b.readStudyDraft(b.studyDraftKey('bob','learn-2')).draft,null);assert.equal(b.readStudyDraft(b.studyDraftKey('alice','review')).draft,null);});
test('corrupted JSON, old schema, impossible index and duplicate event IDs are rejected',()=>{const a=setup(new Map([['bad','{']]));assert.equal(a.readStudyDraft('bad').draft,null);for(const change of [{version:0},{index:9},{events:[event,event]},{ids:[0]},{pending:{id:event,rating:9,durationMs:0}}])assert.equal(a.validateStudyDraft({...draft,...change}),null);});
test('storage failure never claims successful draft save',()=>{const a=setup(new Map(),true);assert.equal(a.writeStudyDraft('x',draft),false);assert.equal(a.readStudyDraft('x').draft,null);});
