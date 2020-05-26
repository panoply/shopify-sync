"use strict";function e(e){return e&&"object"==typeof e&&"default"in e?e.default:e}var t=e(require("bluebird")),a=e(require("fancy-log")),r=e(require("chalk")),n=e(require("lodash/isNull")),i=e(require("lodash/first")),s=e(require("lodash/isUndefined")),o=e(require("lodash/isArray")),l=e(require("lodash/lastIndexOf")),d=e(require("lodash/drop")),c=require("path"),g=e(c),m=e(require("glob")),u=e(require("anymatch")),h=e(require("lodash/omit")),p=require("fs-extra"),y=e(require("lodash/has")),f=e(require("axios")),w=e(require("lodash/indexOf")),$=e(require("lodash/map")),b=e(require("lodash/find")),j=e(require("console-clear")),q=e(require("log-update")),k=e(require("boxen")),_=e(require("chokidar")),v=require("buffer");const E=e=>new Promise(t=>setTimeout(t,e)),S=async(e,t)=>{for(let a=0;a<e.length;a++)await t(e[a],a,e)},O=({api_key:e,password:t,domain:a})=>`https://${e}:${t}@${a}.myshopify.com`,x=(e,t="white",n=!1,i=("object"==typeof e?r[t]([(null==e?void 0:e.message)?e.message+"\n\n\t":"",(null==e?void 0:e.data)?JSON.stringify(e.data.asset?h(e.data.asset,"attachment"):e.data):""].join("")):e))=>n?console.log(i):a(i),F={};function I(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function B(e,t){var a=t.get(e);if(!a)throw new TypeError("attempted to get private field on non-instance");return a.get?a.get.call(e):a.value}let T=0,P=0,C=40,A=!1;class N{constructor(){R.set(this,{writable:!0,value:[]}),I(this,"process",async()=>{A=!0;do{let e=C-(P+T);e<=0&&(e=0);let a=e*e;a<=.9&&(a=.9);const r=500/a,n=B(this,R).shift();await t.delay(r),this.request(n)}while(B(this,R).length>0);A=!1}),I(this,"request",async({target:e,request:t,reject:a,resolve:r})=>{let n,i=null;T+=1;try{const a=Object.assign({},t,{url:`${O(e)}${t.url}`});i=await f(a)}catch(n){return"Too Many Requests"===n.statusText?(x("Exceeded Shopify API limit, will retry...","yellow"),B(this,R).unshift({target:e,request:t,resolve:r,reject:a})):a(this.handleErrors(t,n))}if(T-=1,await r(i.data),i.data.errors)return a(i.data.errors);n=i.headers["x-shopify-shop-api-call-limit"],n=n.split("/"),P=parseInt(n[0],10),C=parseInt(n[1],10)}),I(this,"handleErrors",(e,t)=>{let a="",r="";if(!y(t.response,"data"))return{data:t.stack,message:t.name};const n=t.response.data;return(null==n?void 0:n.errors)?n.errors.asset?(r=e.data.asset.key,a=n.errors.asset):(a=n.errors,e.data&&(r=e.data.asset?e.data.asset.key+" failed to upload":`${e.method.toUpperCase()} ${e.url}`)):(r="FAILED! "+t,a=t.statusText),{message:r,data:a}})}add(e,a){return new t((t,r)=>{B(this,R).push({target:e,request:a,resolve:t,reject:r}),A||this.process()})}}var R=new WeakMap;async function U(e,t){let a;return F[e.domain]?a=F[e.domain]:(a=new N,F[e.domain]=a),a.add(e,t)}const D=t.promisifyAll(require("fs"));async function J(){let e;try{const t=process.cwd();let a=g.join(t,".shopifysync.json");a||(a=g.join(t,".shopifysync")),e=await D.readFileAsync(a,"utf8")}catch(e){throw new Error("The '.shopifysync.json' configuration is missing!")}try{e=JSON.parse(e)}catch(e){throw new Error("Your '.shopifysync.json' file is corrupt. JSON failed to parse")}return e}const L=t.promisifyAll(require("inquirer"));async function W(e,t,a=null){const r=t.target||null;if(!o(e.targets))throw new Error("No targets defined in the '.shopifysync' file");if(r){if(!(a=b(e.targets,{target_name:r})))throw new Error(`Could not find target '${r}'`)}else{const t=$(e.targets,e=>`[${e.target_name}] - '${e.theme_name}' at ${e.domain}.myshopify.com`);if(e.targets.length>1){const r=await L.prompt([{type:"list",name:"target",message:"Select target",default:null,choices:t}]);a=e.targets[w(t,r.target)]}else 1===e.targets.length&&(a=i(e.targets))}const n=Buffer.from(`${a.api_key}:${a.password}`);return a.auth="Basic "+n.toString("base64"),a}function G(e,t={base:/[/\\]\./,count:0,files:null,log:null}){return e.ignore&&e.forceIgnore&&(t.count=e.ignore.length,t.log=e.ignore.join(r`\n\t {whiteBright - }`),e.ignore.push(t.base),t.files=e.ignore),{settings:e,ignored:t}}const M=r`
  {green.bold Shopify Sync} – {bold Commands}
  {gray ---------------------------------------------------------}

  {bold Commands:}
    sync watch [options] – {gray.italic Watch theme folder}
    sync upload [options] [filter] – {gray.italic Upload theme files}
    sync download [options] [filter] – {gray.italic Download theme files}

  {bold Options:}
    --target=[target name] – {gray.italic Explicitly select theme target}
    --filter=[filename] – {gray.italic Only transfer files matching specified filter}
`;async function z(e,t){let a,h;try{e._?(a=i(e._),e._=e._.slice(1),e.file=!1):(a=e.resource,e.file=!0),"watch"===a?h=await async function(e,t){const a=await J(),i=await W(a,e);e.file||Object.assign(e,a);const s=e.dir||"theme",o=new RegExp("^"+s),{settings:c,ignored:m}=G(e);_.watch(`./${s}/`,{ignored:n(m.files)?m.base:m.files,persistent:!0,ignoreInitial:!0,usePolling:!0,interval:100,binaryInterval:100,cwd:process.cwd()}).on("all",async(e,a)=>{try{const n=a.split(g.sep),m=d(n,l(n,s)+1).join(g.sep);if(a.match(/^\..*$/)||!a.match(o))return x(r`{red Issue in match "/^\..*$/" at: ${a}}"`);if(a.match(/[()]/))return x(r`{red Filename cannot contain parentheses at: "${a}"`);if(y(c,"ignore")&&c.ignore.length>0&&u(c.ignore,a))return x(r`{gray Ignoring} '{gray ${a}}'`);if("change"===e||"add"===e){const e=await p.readFile(a),n=e.toString("base64");await U(i,{method:"put",url:`/admin/themes/${i.theme_id}/assets.json`,data:{asset:{key:m.split(g.sep).join("/"),attachment:n}}}).then(n=>{x(r`{green Uploaded} '{green ${a}}'`),"function"==typeof t&&t.apply({file:g.parse(a),content:e})})}else"unlink"===e&&(await U(i,{method:"delete",url:`/admin/themes/${i.theme_id}/assets.json?asset[key]=${m.split(g.sep).join("/")}`}),x(r`{green Deleted} '{green ${a}}'`))}catch(e){const t=/(?:[{'%]{2}|\/).*?(?:[%'}]{2}|\/)|\(line\s[0-9]+\)/g;let a;if(e.stack)a=e.stack;else{const n=e.data.length>1?"Errors":"Error";a=r`{red.bold ${e.data.length}} {red ${n}} {dim in} {red ${e.message}}`,a+="\n\n",a+=e.data.map((e,a)=>r.bold(a+1)+" "+e.replace(t,e=>"("===e[0]?r.cyan.dim(e):"/"===e[0]?r.magenta(e):r.yellow(e)+".")).join("\n"),a+="\n"}x(a)}});let h=r`  Target: {green ${i.target_name}}\n`+r`   Store: {green https://${i.domain}.myshopify.com}\n`+r`Watching: {green ${s}/**/**}`;n(m.log)||(h+=r`\nIgnoring: {yellow ${m.count}} Files\n`,h+=r`\t {whiteBright -} {yellow ${m.log}}`),await x(r.whiteBright.bold("Shopify Sync\n")+k(h,{padding:0,borderColor:"gray",dimBorder:!0,borderStyle:{topLeft:" ",topRight:" ",bottomLeft:" ",bottomRight:" ",horizontal:"-",vertical:" "}}))}(e,t):"upload"===a?h=await async function(e,t){let a=0;const n=await J(),g=await W(n,e);e.file||Object.assign(e,n);const h=e.dir||"theme",y=new RegExp(`^${h}/${i(e._)}`),{settings:f}=G(e),w=i(f._)?y:null;let $=m.sync(h+"/**/*",{nodir:!0});w&&($=$.filter(e=>w.test(e))),(null==f?void 0:f.ignore.length)>0&&($=$.filter(e=>!u(f.ignore,e)));const b=$.map(e=>{const t=e.split(c.sep),a=d(t,l(t,h)+1).join(c.sep);return{key:a,name:c.basename(a),path:e}}),_=q.create(process.stdout),v=[];return j(!0),S(b,async e=>{await E(100);const n=await p.readFile(e.path);U(g,{method:"put",url:`/admin/themes/${g.theme_id}/assets.json`,data:{asset:{key:e.key,attachment:n.toString("base64")}}}).catch(e=>{v.push(0===v.length?r`{grey.dim ┌──} {redBright Failed} '{red ${e.message}}'`:r`{grey.dim ├──} {redBright Failed} '{red ${e.message}}'`,o(e.data)?e.data.map((t,a)=>e.data.length-1===a?r`{grey.dim │  └──} {dim ${t}}`:r`{grey.dim │  ├──} {dim ${t}}`).join("\n"):!s(e.data)&&r`{yellow.dim.italic ${e.data}}`)}),_(k([r`{magenta    Store}{dim :} {dim.underline ${g.primary_domain}}     `,r`{magenta     File}{dim :} {cyan ${c.basename(e.key)}}`,r`{magenta Progress}{dim :} {cyan ${a+=1}} of {cyan ${b.length}}`,r`{magenta   Output}{dim :} {dim ${h}/}{cyan ${c.dirname(e.key)}}`,r`{magenta   Errors}{dim :} {red ${v.length}}`].join("\n"),{padding:1,borderColor:"gray",dimBorder:!0,borderStyle:"round"}),v.length>0?"\n"+v.join("\n"):""),"function"==typeof t&&t.apply({file:c.parse(e.path),content:n})}).finally(()=>{x(r`Uploaded: {green ${a}} files.`),x(r`Problems: {red ${v.length}}`)})}(e,t):"download"===a?h=await async function(e,t){const a=await J(),n=await W(a,e);e.file||Object.assign(e,a);const l=process.cwd(),d=e.dir||"theme",g=i(e._)?d:null,{settings:m}=G(e),{assets:h}=await U(n,{method:"GET",url:`/admin/themes/${n.theme_id}/assets.json`});let y;g&&(y=h.filter(e=>g.test(e))),y=(null==m?void 0:m.ignore.length)>0?h.filter(({key:e})=>!u(m.ignore,e)):y||h,j(!0);let f=0;return S(y,async({key:e})=>{await E(100),U(n,{method:"GET",url:`/admin/themes/${n.theme_id}/assets.json`,params:{"asset[key]":e}}).then(async({asset:{attachment:a,value:i}})=>{const s=a?"base64":"utf8",o=a||i,g=v.Buffer.from(o,s),m=c.join(l,d,e||null);await p.mkdirp(c.join(l,d,c.dirname(e))),await p.writeFile(m,g),"function"==typeof t&&t.apply({file:c.parse(m),content:o}),q(k([r`{magenta    Store}{dim :} {dim.underline ${n.primary_domain}}     `,r`{magenta     File}{dim :} {cyan ${c.basename(e)}}`,r`{magenta Progress}{dim :} {cyan ${f+=1}} of {cyan ${y.length}}`,r`{magenta   Output}{dim :} {dim ${d}/}{cyan ${c.dirname(e)}}`].join("\n"),{padding:1,margin:1,borderColor:"gray",dimBorder:!0,borderStyle:"round"}))}).catch(e=>{problems.push(r`{red Failed} '{red ${e.message}}'`,o(e.data)?e.data.map(e=>r`{red >} {white.dim ${e}}`):!s(e.data)&&r`{yellow.dim.italic ${e.data}}`)})})}(e,t):process.stdout.write(M),h&&process.stdout.write(h)}catch(e){let t=null;e.stack&&(t=e.stack),x(n(t)?e:t,"red")}return h}global.Promise=t,module.exports=function(e="",t,n){return"object"==typeof e?z(e):e?t.target?z(Object.assign({},{resource:e},{target:"",concurrency:20,dir:"theme",files:[],forceIgnore:!1,ignore:[]},t),n):a(r`{red Error! Please define a {bold theme target}!}`):a(r`{red Error! The {bold resource} option is missing}!`)};
