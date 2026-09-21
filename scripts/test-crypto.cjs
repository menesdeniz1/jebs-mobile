// Isolated runtime-boundary checks; actual AES implementation, mocked native APIs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { randomBytes } = require('node:crypto');
const ts = require('typescript');
function load({ web = false, unavailable = false, stored } = {}) {
  const store = new Map(stored ? [['@gendarme_aes_gcm_key_v2', stored]] : []);
  let writes = 0;
  const native = {
    getItemAsync: async k => { if (unavailable) throw Error('Unavailable'); return store.get(k) ?? null; },
    setItemAsync: async (k,v) => { if (unavailable) throw Error('Unavailable'); writes++; store.set(k,v); },
  };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname,'../lib/crypto.ts'),'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} };
  const req = id => id === 'expo-secure-store' ? native : id === 'expo-crypto' ?
    { getRandomBytesAsync: async n => new Uint8Array(randomBytes(n)) } :
    id === 'react-native' ? { Platform: { OS: web ? 'web' : 'android' } } : require(id);
  vm.runInNewContext('(function(require,module,exports){'+code+'\n})', { Uint8Array, TextEncoder, TextDecoder })(req,mod,mod.exports);
  return { api: mod.exports, store, writes: () => writes };
}
(async () => {
  const x=load(); const text='Türkçe: İı şğ — synthetic only';
  const [a,b]=await Promise.all([x.api.encrypt(text),x.api.encrypt(text)]);
  assert.notEqual(a,b); assert.equal(x.writes(),1); assert.equal(await x.api.decrypt(a),text);
  assert.ok(x.api.isEncrypted(a)); assert.equal(x.api.isEncrypted('abcd'),false);
  const tampered=a.slice(0,-2)+(a.endsWith('00')?'01':'00');
  await assert.rejects(x.api.decrypt(tampered));
  await assert.rejects(x.api.decrypt('abcd'));
  await assert.rejects(load({web:true}).api.encrypt(text));
  await assert.rejects(load({unavailable:true}).api.encrypt(text));
  await assert.rejects(load({stored:'broken'}).api.encrypt(text));
  const restarted=load({stored:x.store.get('@gendarme_aes_gcm_key_v2')});
  assert.equal(await restarted.api.decrypt(a),text);
  console.log('10 storage-security assertions passed (native APIs mocked; actual AES-GCM).');
})().catch(e=>{console.error(e);process.exitCode=1;});
