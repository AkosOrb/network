(function(){
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SITE='https://nw.koczka.com/';
const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- IP segédfüggvények ---------- */
function ip2n(s){const p=String(s).trim().split('.');if(p.length!==4)return null;let n=0;for(const x of p){if(!/^\d{1,3}$/.test(x)||+x>255)return null;n=n*256+ +x}return n>>>0}
function n2ip(n){n>>>=0;return [n>>>24,(n>>>16)&255,(n>>>8)&255,n&255].join('.')}
function pmask(p){return p===0?0:(0xFFFFFFFF<<(32-p))>>>0}
function mask2p(m){let p=0;let n=m>>>0;while(n&0x80000000){p++;n=(n<<1)>>>0}return n===0?p:null}
function bin(n){const b=(n>>>0).toString(2).padStart(32,'0');return b.match(/.{8}/g).join('.')}
function parseCidr(s){
  s=String(s).trim();let m=s.match(/^(\S+)\s*\/\s*(\d{1,2})$/);
  if(m){const ip=ip2n(m[1]),p=+m[2];if(ip===null||p>32)return null;return {ip,p}}
  m=s.match(/^(\S+)\s+(\S+)$/);
  if(m){const ip=ip2n(m[1]),mk=ip2n(m[2]);if(ip===null||mk===null)return null;const p=mask2p(mk);if(p===null)return null;return {ip,p}}
  return null;
}
function calc(ip,p){const m=pmask(p),net=(ip&m)>>>0,bc=(net|(~m>>>0))>>>0;return {m,net,bc,first:p>=31?net:net+1,last:p>=31?bc:bc-1,hosts:p>=31?(p===31?2:1):Math.pow(2,32-p)-2,wild:(~m)>>>0}}
function cls(ip){const a=ip>>>24;return a<128?'A':a<192?'B':a<224?'C':a<240?'D (multicast)':'E'}
function privat(ip){const t=[['10.0.0.0',8],['172.16.0.0',12],['192.168.0.0',16]];for(const [n,p] of t){if(((ip&pmask(p))>>>0)===ip2n(n))return `privát (${n}/${p})`}
  if(((ip&pmask(16))>>>0)===ip2n('169.254.0.0'))return 'APIPA / ad-hoc (169.254.0.0/16)';if((ip>>>24)===127)return 'loopback (127.0.0.0/8)';return 'publikus'}

/* ---------- Alhálózat-számoló ---------- */
function subnet(root){
  root.innerHTML=`<div class="panel">
    <h2>IP-alhálózat számoló</h2>
    <p class="sub" style="margin:0">Írj be egy címet prefixszel (pl. <code>192.100.65.142/25</code>) vagy maszkkal (<code>10.1.6.44 255.255.255.128</code>). A bináris sorokon látszik a bitenkénti ÉS művelet.</p>
    <div class="row"><label for="sn-in" class="sub">Cím</label><input id="sn-in" class="txt" value="192.100.65.142/25" spellcheck="false">
    <label for="sn-p" class="sub">Prefix</label><input id="sn-p" type="range" min="0" max="32" value="25"><b id="sn-pv" class="mono">/25</b></div>
    <div id="sn-out"></div>
  </div>
  <div class="panel">
    <h2>Gyakorló feladat</h2>
    <div id="sn-task"></div>
  </div>`;
  const inp=root.querySelector('#sn-in'),rng=root.querySelector('#sn-p'),pv=root.querySelector('#sn-pv'),out=root.querySelector('#sn-out');
  function render(){
    const r=parseCidr(inp.value);
    if(!r){out.innerHTML='<div class="feedback no">Érvénytelen cím. Példa: 192.168.1.10/24 vagy 192.168.1.10 255.255.255.0</div>';return}
    rng.value=r.p;pv.textContent='/'+r.p;
    const c=calc(r.ip,r.p);
    const hb=b=>{const s=bin(b);let i=0;return s.split('').map(ch=>{if(ch==='.')return '<span class="dot">.</span>';const h=i++>=r.p;return `<span class="${h?'hb':'nb'}">${ch}</span>`}).join('')};
    out.innerHTML=`<div class="binwrap"><table class="bin"><tbody>
      <tr><th>IP-cím</th><td class="mono">${hb(r.ip)}</td><td class="mono">${n2ip(r.ip)}</td></tr>
      <tr><th>Maszk</th><td class="mono">${hb(c.m)}</td><td class="mono">${n2ip(c.m)}</td></tr>
      <tr class="sum"><th>ÉS → hálózat</th><td class="mono">${hb(c.net)}</td><td class="mono">${n2ip(c.net)}</td></tr>
      <tr class="sum"><th>Broadcast</th><td class="mono">${hb(c.bc)}</td><td class="mono">${n2ip(c.bc)}</td></tr>
    </tbody></table></div>
    <div class="legend sub"><span class="nb">hálózati bit</span> <span class="hb">hosztbit</span> · broadcast = a hosztbitek mind 1-esek</div>
    <div class="kv">
      <div><span>Hálózati cím</span><b class="mono">${n2ip(c.net)}/${r.p}</b></div>
      <div><span>Broadcast</span><b class="mono">${n2ip(c.bc)}</b></div>
      <div><span>Használható tartomány</span><b class="mono">${r.p>=31?'– (pont-pont / host)':n2ip(c.first)+' – '+n2ip(c.last)}</b></div>
      <div><span>Hosztok száma</span><b class="mono">${r.p>=31?'–':'2^'+(32-r.p)+' − 2 = '+c.hosts}</b></div>
      <div><span>Wildcard (ACL-hez)</span><b class="mono">${n2ip(c.wild)}</b></div>
      <div><span>Osztály / típus</span><b>${cls(r.ip)} · ${privat(r.ip)}</b></div>
      ${r.p>24&&r.p<=30?`<div><span>/24 felosztása</span><b>${Math.pow(2,r.p-24)} db /${r.p}-es alhálózat, egyenként ${Math.pow(2,32-r.p)} cím</b></div>`:''}
    </div>`;
  }
  inp.oninput=render;
  rng.oninput=()=>{const r=parseCidr(inp.value);const ip=r?n2ip(r.ip):inp.value.split(/[\s/]/)[0];inp.value=ip+'/'+rng.value;render()};
  render();
  const task=root.querySelector('#sn-task');
  function newTask(){
    const p=[8,16,20,22,23,24,25,26,27,28,29,30][Math.floor(Math.random()*12)];
    const firsts=[10,172,192,193,211,36,208];const a=firsts[Math.floor(Math.random()*firsts.length)];
    const ip=((a<<24)|(Math.floor(Math.random()*256)<<16)|(Math.floor(Math.random()*256)<<8)|(1+Math.floor(Math.random()*254)))>>>0;
    const c=calc(ip,p);
    const f=[['net','Hálózati cím',n2ip(c.net)],['bc','Broadcast cím',n2ip(c.bc)],['first','Első használható',n2ip(c.first)],['last','Utolsó használható',n2ip(c.last)],['hosts','Hosztok száma',String(c.hosts)]];
    task.innerHTML=`<div class="q">Számold ki: <b class="mono">${n2ip(ip)}/${p}</b> <span class="sub">(maszk: ${n2ip(c.m)})</span></div>
      <div class="grid2">${f.map(([k,l])=>`<label class="fld" for="t-${k}"><span>${l}</span><input class="txt mono" id="t-${k}" spellcheck="false" autocomplete="off"></label>`).join('')}</div>
      <div class="row"><button class="primary" id="t-check" type="button">Ellenőrzés</button><button id="t-show" type="button">Megoldás</button><button id="t-new" type="button">Új feladat</button></div>
      <div id="t-fb"></div>`;
    const check=show=>{let good=0;f.forEach(([k,l,v])=>{const el=task.querySelector('#t-'+k);if(show)el.value=v;const ok=el.value.trim()===v;el.classList.toggle('ok',ok);el.classList.toggle('no',!ok&&el.value.trim()!=='');if(ok)good++});
      task.querySelector('#t-fb').innerHTML=show?(()=>{const ix=p%8===0?p/8-1:Math.floor(p/8),oc=(c.m>>>(24-8*ix))&255;return `<div class="feedback">Tipp: a ${ix+1}. oktett az „érdekes”, ott a maszk ${oc}, a blokkméret 256 − ${oc} = ${256-oc}. A hálózati cím ebben az oktettben a blokkméret többszöröse, a többi hosztbit 0.</div>`})():`<div class="feedback ${good===f.length?'ok':'no'}">${good} / ${f.length} helyes${good===f.length?'. Szép munka!':'. A pirossal jelölteket nézd át, vagy írd be fent a címet a számolóba.'}</div>`};
    task.querySelector('#t-check').onclick=()=>check(false);
    task.querySelector('#t-show').onclick=()=>check(true);
    task.querySelector('#t-new').onclick=newTask;
  }
  newTask();
}

/* ---------- Lépésenkénti diagram-lejátszó ---------- */
/* ---------- Csomagépítő: valódi bájtok, mezőnként ---------- */
const hx=b=>b.toString(16).padStart(2,'0').toUpperCase();
const u16=n=>[(n>>8)&255,n&255], u32=n=>[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255];
const ipb=s=>String(s).split('.').map(Number);
const macb=s=>String(s).replace(/[^0-9a-f]/gi,'').match(/../g).map(x=>parseInt(x,16));
const strb=s=>Array.from(new TextEncoder().encode(s));
const h16=n=>'0x'+n.toString(16).padStart(4,'0').toUpperCase();
function F(n,v,b,o){return Object.assign({n,v,b},o||{})}
function csum(bytes){let s=0;for(let k=0;k<bytes.length;k+=2)s+=(bytes[k]<<8)+(bytes[k+1]||0);while(s>>16)s=(s&0xffff)+(s>>16);return (~s)&0xffff}
const CRC=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(b){let c=0xFFFFFFFF;for(const x of b)c=CRC[(c^x)&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
const flat=L=>L.flatMap(l=>l.fields.flatMap(f=>f.b));
const ETN={0x0800:'IPv4',0x0806:'ARP',0x8100:'802.1Q'};
const IPP={1:'ICMP',6:'TCP',17:'UDP'};
const ch=(o,k)=>!!(o.chg&&(o.chg===true||o.chg.includes(k)));
const LY={
 eth(dst,src,type,o={}){const f=[F('Cél MAC',dst,macb(dst),{chg:ch(o,'dst'),note:/^ff/i.test(dst)?'broadcast: mindenki megkapja':''}),F('Forrás MAC',src,macb(src),{chg:ch(o,'src')})];
  if(o.vlan!=null)f.push(F('TPID',h16(0x8100)+' (802.1Q címke)',u16(0x8100),{chg:true}),F('PCP / DEI / VLAN ID','VLAN '+o.vlan,u16(o.vlan&4095),{chg:true,note:'a trunkon ebből tudja a másik switch a VLAN-t'}));
  f.push(F('EtherType',h16(type)+' ('+(ETN[type]||'?')+')',u16(type)));
  return {id:'eth',name:o.vlan!=null?'Ethernet II + 802.1Q':'Ethernet II',short:'ETH',osi:2,fields:f}},
 arp(op,sha,spa,tha,tpa,o={}){return {id:'arp',name:'ARP',short:'ARP',osi:3,fields:[F('Hardvertípus','1 (Ethernet)',u16(1)),F('Protokolltípus',h16(0x0800)+' (IPv4)',u16(0x0800)),F('HW-cím hossza','6',[6]),F('Protokollcím hossza','4',[4]),
  F('Művelet',op===1?'1 (kérés)':'2 (válasz)',u16(op),{chg:ch(o,'op')}),F('Küldő MAC',sha,macb(sha),{chg:ch(o,'sha'),note:o.shaNote||''}),F('Küldő IP',spa,ipb(spa),{chg:ch(o,'spa')}),F('Cél MAC',tha,macb(tha),{note:op===1?'még ismeretlen, ezért csupa nulla':''}),F('Cél IP',tpa,ipb(tpa),{chg:ch(o,'tpa')})]}},
 ip(src,dst,proto,o={}){const ttl=o.ttl??64,id=o.id??0x1c46;return {id:'ip',name:'IPv4',short:'IP',osi:3,ip:{src,dst,proto},fields:[F('Verzió + fejléchossz','4 / 20 bájt',[0x45]),F('ToS / DSCP','0',[0]),F('Teljes hossz','',[0,0],{k:'len'}),F('Azonosító',h16(id),u16(id)),F('Flags + fragment offset',o.df===false?'0':'DF (ne darabold)',u16(o.df===false?0:0x4000)),
  F('TTL',String(ttl),[ttl],{chg:ch(o,'ttl'),note:o.ttlNote||'routerenként 1-gyel csökken'}),F('Protokoll',proto+' ('+(IPP[proto]||'?')+')',[proto]),F('Fejléc-ellenőrző összeg','',[0,0],{k:'sum',chg:!!o.chg,note:o.chg?'a módosítás miatt újraszámolva':''}),F('Forrás IP',src,ipb(src),{chg:ch(o,'src')}),F('Cél IP',dst,ipb(dst),{chg:ch(o,'dst')})],
  fix(L,rest){const len=20+rest.length;L.fields[2].b=u16(len);L.fields[2].v=len+' bájt';L.fields[7].b=[0,0];const s=csum(L.fields.flatMap(f=>f.b));L.fields[7].b=u16(s);L.fields[7].v=h16(s)}}},
 udp(sp,dp,o={}){return {id:'udp',name:'UDP',short:'UDP',osi:4,fields:[F('Forrásport',String(sp)+(PN[sp]?' ('+PN[sp]+')':''),u16(sp),{chg:ch(o,'sp')}),F('Célport',String(dp)+(PN[dp]?' ('+PN[dp]+')':''),u16(dp),{chg:ch(o,'dp')}),F('Hossz','',[0,0]),F('Ellenőrző összeg','',[0,0])],
  fix(L,rest,ip){const len=8+rest.length;L.fields[2].b=u16(len);L.fields[2].v=len+' bájt';if(!ip){L.fields[3].v='0x0000 (nincs számolva)';return}
   const ph=[...ipb(ip.src),...ipb(ip.dst),0,17,...u16(len)];const s=csum([...ph,...L.fields.flatMap(f=>f.b),...rest])||0xffff;L.fields[3].b=u16(s);L.fields[3].v=h16(s)}}},
 tcp(sp,dp,o={}){const fl=o.flags||'ACK',FB={FIN:1,SYN:2,RST:4,PSH:8,ACK:16};const fb=fl.split(/[ ,|]+/).reduce((a,x)=>a|(FB[x]||0),0);
  return {id:'tcp',name:'TCP',short:'TCP',osi:4,fields:[F('Forrásport',String(sp)+(PN[sp]?' ('+PN[sp]+')':''),u16(sp),{chg:ch(o,'sp')}),F('Célport',String(dp)+(PN[dp]?' ('+PN[dp]+')':''),u16(dp),{chg:ch(o,'dp')}),F('Sorszám (seq)',String(o.seq??1),u32(o.seq??1)),F('Nyugta (ack)',String(o.ack??0),u32(o.ack??0)),
   F('Fejléchossz + jelzőbitek','20 bájt · '+fl,[0x50,fb]),F('Ablakméret',String(o.win??64240),u16(o.win??64240)),F('Ellenőrző összeg','',[0,0],{chg:!!o.chg}),F('Sürgős mutató','0',[0,0])],
  fix(L,rest,ip){if(!ip)return;const len=20+rest.length;const ph=[...ipb(ip.src),...ipb(ip.dst),0,6,...u16(len)];L.fields[6].b=[0,0];const s=csum([...ph,...L.fields.flatMap(f=>f.b),...rest]);L.fields[6].b=u16(s);L.fields[6].v=h16(s)}}},
 icmp(type,code,o={}){const T={0:'Echo Reply (ping-válasz)',3:'Destination Unreachable',8:'Echo Request (ping)',11:'Time Exceeded (TTL lejárt)'};const echo=type===0||type===8;
  return {id:'icmp',name:'ICMP',short:'ICMP',osi:3,fields:[F('Típus',type+' · '+T[type],[type],{chg:true}),F('Kód',String(code)+(type===3&&code===0?' (net unreachable)':type===11?' (TTL lejárt útközben)':''),[code]),F('Ellenőrző összeg','',[0,0]),
   ...(echo?[F('Azonosító',h16(o.id??1),u16(o.id??1)),F('Sorszám',String(o.seq??1),u16(o.seq??1))]:[F('Nem használt','0',[0,0,0,0])])],
  fix(L,rest){L.fields[2].b=[0,0];const s=csum([...L.fields.flatMap(f=>f.b),...rest]);L.fields[2].b=u16(s);L.fields[2].v=h16(s)}}},
 dhcp(t,o={}){const MT={1:'DISCOVER',2:'OFFER',3:'REQUEST',5:'ACK'};const rep=t===2||t===5;const xid=o.xid??0x3903F326;const z='0.0.0.0';
  const opt=[F('Opció 53: üzenettípus',t+' (DHCP'+MT[t]+')',[53,1,t],{chg:true})];
  if(o.req)opt.push(F('Opció 50: kért IP',o.req,[50,4,...ipb(o.req)]));
  if(o.sid)opt.push(F('Opció 54: szerver azonosító',o.sid,[54,4,...ipb(o.sid)],{chg:ch(o,'sid')}));
  if(rep){opt.push(F('Opció 51: bérleti idő',(o.lease??86400)+' s',[51,4,...u32(o.lease??86400)]),F('Opció 1: alhálózati maszk',o.mask||'255.255.255.0',[1,4,...ipb(o.mask||'255.255.255.0')]));
   if(o.gw)opt.push(F('Opció 3: átjáró',o.gw,[3,4,...ipb(o.gw)],{chg:ch(o,'gw'),note:o.gwNote||''}));if(o.dns)opt.push(F('Opció 6: DNS-szerver',o.dns,[6,4,...ipb(o.dns)],{chg:ch(o,'dns')}))}
  opt.push(F('Opció 255: vége','',[255]));
  return {id:'dhcp',name:'DHCP (BOOTP)',short:'DHCP',osi:7,fields:[F('Művelet',rep?'2 (BOOTREPLY)':'1 (BOOTREQUEST)',[rep?2:1]),F('HW-típus / hossz','Ethernet / 6',[1,6]),F('Ugrások (hops)',String(o.hops??0),[o.hops??0],{chg:ch(o,'hops')}),F('Tranzakció-azonosító (xid)','0x'+xid.toString(16).toUpperCase(),u32(xid),{note:'ebből tudja a kliens, melyik válasz az övé'}),F('Másodpercek','0',[0,0]),F('Jelzők','0x8000 (broadcast válasz kell)',u16(0x8000)),
   F('ciaddr (kliens IP)',z,[0,0,0,0]),F('yiaddr (neked adott IP)',o.yi||z,ipb(o.yi||z),{chg:!!o.yi}),F('siaddr (következő szerver)',z,[0,0,0,0]),F('giaddr (relay címe)',o.gi||z,ipb(o.gi||z),{chg:ch(o,'gi'),note:o.gi?'a relay ide írja, melyik hálózatból jött a kérés':''}),
   F('chaddr (kliens MAC)',o.mac,[...macb(o.mac),...Array(10).fill(0)],{chg:ch(o,'mac'),note:o.macNote||''}),F('sname + file','192 nulla bájt',Array(192).fill(0),{fold:true}),F('Magic cookie','63 82 53 63 (DHCP)',[0x63,0x82,0x53,0x63]),...opt]}},
 dns(o){const ql=n=>[...n.split('.').flatMap(p=>[p.length,...strb(p)]),0];const resp=!!o.resp;const fl=resp?(o.aa?0x8580:0x8180):0x0100;
  const f=[F('Azonosító',h16(o.id??0x1a2b),u16(o.id??0x1a2b),{note:'a válasz ugyanezzel jön vissza'}),F('Jelzők',h16(fl)+(resp?' (válasz'+(o.aa?', hiteles':'')+')':' (kérdés, rekurzió kérve)'),u16(fl),{chg:resp}),
   F('Kérdések száma','1',u16(1)),F('Válaszok száma',String((o.an||[]).length),u16((o.an||[]).length)),F('Hiteles szerverek száma',String((o.ns||[]).length),u16((o.ns||[]).length)),F('Kiegészítő rekordok','0',u16(0)),
   F('Kérdezett név',o.q,ql(o.q),{note:'címkénként: hossz + betűk'}),F('Típus / osztály','A / IN',[0,1,0,1])];
  const rr=(r,lab)=>{const d=r.t==='A'?ipb(r.d):ql(r.d);return F(lab,r.n+' '+r.t+' '+r.d+' (TTL '+r.ttl+' s)',[...ql(r.n),0,r.t==='A'?1:2,0,1,...u32(r.ttl),...u16(d.length),...d],{chg:true,note:r.note||''})};
  (o.an||[]).forEach(r=>f.push(rr(r,'Válasz')));(o.ns||[]).forEach(r=>f.push(rr(r,'Hiteles szerver (NS)')));
  return {id:'dns',name:'DNS',short:'DNS',osi:7,fields:f}},
 radius(code,o={}){const C={1:'Access-Request',2:'Access-Accept',3:'Access-Reject'};const auth=[0x9c,0x3e,0x51,0x07,0xa2,0x6d,0x18,0xf4,0x3b,0xe0,0x55,0x81,0x2c,0x7f,0xd9,0x46];
  const at=[];if(o.user){at.push(F('Attribútum 1: User-Name',o.user,[1,2+o.user.length,...strb(o.user)]));at.push(F('Attribútum 2: User-Password','titkosítva (közös titok + MD5)',[2,18,0x51,0xe2,0x08,0x9b,0x77,0xc4,0x2f,0xa0,0x13,0x6e,0xd5,0x39,0x81,0x0b,0xfe,0x64],{note:'a közös titok nélkül nem fejthető vissza'}))}
  return {id:'radius',name:'RADIUS',short:'RADIUS',osi:7,fields:[F('Kód',code+' ('+C[code]+')',[code],{chg:true}),F('Azonosító',String(o.id??42),[o.id??42]),F('Hossz','',[0,0]),F('Hitelesítő (authenticator)','16 bájt',auth,{fold:true}),...at],
  fix(L){const n=L.fields.reduce((a,f)=>a+f.b.length,0);L.fields[2].b=u16(n);L.fields[2].v=n+' bájt'}}},
 data(name,text,o={}){return {id:'data',name,short:o.short||name,osi:o.osi??7,fields:[F(o.label||'Tartalom',o.show||JSON.stringify(text).slice(1,-1),strb(text),{chg:!!o.chg,note:o.note||'',txt:true})]}},
 raw(name,bytes,o={}){return {id:'raw',name,short:o.short||name,osi:o.osi??7,fields:[F(o.label||'Tartalom',o.show||'',bytes,{chg:!!o.chg,note:o.note||''})]}},
 fcs(){return {id:'fcs',name:'Ethernet FCS',short:'FCS',osi:2,trailer:true,fields:[F('CRC-32','',[0,0,0,0],{note:'a vevő újraszámolja; ha eltér, eldobja a keretet'})],fix(L,rest,ip,all){const c=crc32(all);L.fields[0].b=[c&255,(c>>>8)&255,(c>>>16)&255,(c>>>24)&255];L.fields[0].v='0x'+c.toString(16).toUpperCase().padStart(8,'0')}}}
};
const PN={20:'ftp-data',21:'ftp',22:'ssh',23:'telnet',53:'dns',67:'bootps',68:'bootpc',80:'http',443:'https',1812:'radius'};
function pk(...layers){
  const L=layers.map(l=>JSON.parse(JSON.stringify(l,(k,v)=>k==='fix'?undefined:v))).map((c,k)=>Object.assign(c,{fix:layers[k].fix}));
  const body=L.filter(l=>!l.trailer);let ip=null;
  for(let k=body.length-1;k>=0;k--){const l=body[k];const rest=flat(body.slice(k+1));if(l.id==='ip')ip=l.ip;}
  ip=null;for(let k=0;k<body.length;k++){if(body[k].id==='ip')ip=body[k].ip}
  // hátulról előre: a hosszak és összegek a mögöttük lévő bájtokon múlnak
  for(let k=body.length-1;k>=0;k--){const l=body[k];if(l.fix){const ipx=body.slice(0,k).reverse().find(x=>x.id==='ip');l.fix(l,flat(body.slice(k+1)),ipx?ipx.ip:null)}}
  L.filter(l=>l.trailer).forEach(l=>l.fix&&l.fix(l,[],null,flat(body)));
  return L;
}

/* ---------- Ikonok ---------- */
const ICONS={
 pc:'<rect x="-11" y="-9" width="22" height="15" rx="2"/><path d="M-4 10h8M0 6v4"/>',
 laptop:'<rect x="-9" y="-9" width="18" height="12" rx="1.5"/><path d="M-13 7h26l-2 3h-22z"/>',
 server:'<rect x="-9" y="-11" width="18" height="9" rx="1.5"/><rect x="-9" y="1" width="18" height="9" rx="1.5"/><path d="M-5-6.5h.1M-5 5.5h.1M1-6.5h4M1 5.5h4"/>',
 router:'<circle r="11"/><path d="M-6-3l4 0-1.5-2M-6-3l1.5 2M6 3l-4 0 1.5 2M6 3l-1.5-2M-3 6l0-4 2 1.5M-3 6l-2-1.5M3-6l0 4-2-1.5M3-6l2 1.5"/>',
 switch:'<rect x="-12" y="-8" width="24" height="16" rx="2.5"/><path d="M-7-2.5h12l-2.5-2.5M7 2.5h-12l2.5 2.5"/>',
 hub:'<rect x="-12" y="-7" width="24" height="14" rx="2.5"/><path d="M-7 0h.1M-2.5 0h.1M2 0h.1M6.5 0h.1"/>',
 ap:'<circle cy="6" r="2"/><path d="M-6 1a8.5 8.5 0 0 1 12 0M-10-3a14 14 0 0 1 20 0"/><path d="M0 8v4"/>',
 cloud:'<path d="M-9 7h17a6 6 0 0 0 0-12 8 8 0 0 0-15-1 5.5 5.5 0 0 0-2 13z"/>',
 evil:'<path d="M-10 10c0-7 4-11 10-11s10 4 10 11"/><path d="M-8 -1c-1-9 3-12 8-12s9 3 8 12"/><path d="M-4-4h2.5M1.5-4h2.5"/>'
};
function iconOf(n){if(n.icon)return n.icon;if(n.kind==='evil')return 'evil';const l=n.label.toLowerCase(),s=(n.sub||'').toLowerCase();
 if(/^r\d|router|relay|átjáró/.test(l))return 'router';if(/hub/.test(l))return 'hub';if(/\bap\b|wrt|hozzáférési/.test(l))return 'ap';
 if(/switch|^s\d|^sw/.test(l))return 'switch';if(/szerver|dns|gyökér|tld|\.hu|www|aaa|vevő/.test(l)||/szerver/.test(s))return 'server';
 if(/hálózat|internet|lan/.test(l))return 'cloud';if(/laptop/.test(l))return 'laptop';return 'pc'}
const LAYC={1:'l1',2:'l2',3:'l3',4:'l4',7:'l7'};

/* ---------- Lejátszó (Protocol Explorer stílus) ---------- */
function player(root,sc){
  let steps,nodes,links,i=0,speed=1,playing=false,raf=null,hold=null,sel=null,userSel=false;
  const SP=[0.5,1,1.5,2];
  root.innerHTML=`<div class="panel pexp">
    <h2>${esc(sc.title)}</h2>
    <p class="sub" style="max-width:70ch;margin-top:6px">${sc.intro}</p>
    <div class="pex">
      ${sc.tabs?`<div class="pex-tabs" role="tablist" aria-label="Forgatókönyvek">${sc.tabs.map((t,ix)=>`<button type="button" role="tab" class="pex-tab" data-ix="${ix}">${esc(t.label)}</button>`).join('')}</div>`:''}
      <div class="pex-stage"><svg id="pl-svg" viewBox="0 -16 680 ${(sc.h||300)+40}" role="img" aria-label="${esc(sc.title)} ábra"></svg><div class="pex-now" id="pl-now" aria-hidden="true"></div></div>
      <div class="pex-tl" id="pl-tl" aria-label="Lépések"></div>
      <div class="pex-ctl">
        <button type="button" class="pex-b" id="pl-reset" title="Elölről" aria-label="Elölről"><svg viewBox="0 0 24 24"><path d="M6 5v14M19 5l-9 7 9 7z"/></svg></button>
        <button type="button" class="pex-b" id="pl-prev" title="Előző lépés (←)" aria-label="Előző lépés"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
        <button type="button" class="pex-b pex-play" id="pl-play" title="Lejátszás / szünet (szóköz)" aria-label="Lejátszás"><svg viewBox="0 0 24 24"><path class="ip" d="M8 5l11 7-11 7z"/><path class="ipa" d="M8 5v14M16 5v14"/></svg></button>
        <button type="button" class="pex-b" id="pl-next" title="Következő lépés (→)" aria-label="Következő lépés"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
        <button type="button" class="pex-b" id="pl-again" title="A lépés újrajátszása (R)" aria-label="A lépés újrajátszása"><svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/></svg></button>
        <span class="pex-cnt" id="pl-cnt"></span>
        <span class="spacer"></span>
        <span class="pex-spd" role="group" aria-label="Sebesség">${SP.map(v=>`<button type="button" data-v="${v}" class="${v===1?'on':''}">${String(v).replace('.',',')}×</button>`).join('')}</span>
      </div>
      <div class="pex-body">
        <div class="pex-story"><div class="pex-head"><span id="pl-tag"></span></div><div id="pl-text" class="steptext" aria-live="polite"></div><div id="pl-tables" class="tables"></div></div>
        <aside class="pex-insp" id="pl-insp" aria-label="Csomag-boncoló"></aside>
      </div>
    </div>
    <div class="hint">Billentyűk: ← → lépés, szóköz lejátszás, R újrajátszás. Vidd az egeret egy mezőre: a hex nézetben kigyúlnak a bájtjai.</div>
    <div class="src">Forrás: ${sc.src.map(s=>`<a href="${SITE+s}" target="_blank" rel="noopener">${s.replace('.html','')}</a>`).join(', ')}. A bájtok valódi kódolással készültek; a jegyzetben nem szereplő MAC-címek és azonosítók példaértékek.</div>
  </div>`;
  const $=s=>root.querySelector(s),svg=$('#pl-svg'),pb=$('#pl-play');
  const nodeById=id=>nodes.find(n=>n.id===id);
  const msgsOf=s=>s.msg?[].concat(s.msg):[];
  function topOf(p){const b=p.filter(l=>!l.trailer);return b[b.length-1]}
  function runs(m){
    const targets=m.to==='*'?nodes.filter(n=>n.id!==m.from&&n.kind!=='sw'&&!(m.except||[]).includes(n.id)&&!(m.via||[]).includes(n.id)).map(n=>n.id):[m.to];
    return targets.map(t=>{const p=m.via?[m.from,...m.via,t]:[m.from,t];let d='';const pts=[];
      for(let k=0;k<p.length-1;k++){const A=nodeById(p[k]),B=nodeById(p[k+1]);if(!A||!B)continue;const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy)||1,o=7*(m.side||1),ox=-dy/L*o,oy=dx/L*o,r0=k===0?30:0,r1=k===p.length-2?34:0;
        pts.push([A.x+dx*r0/L+ox,A.y+dy*r0/L+oy],[B.x-dx*r1/L+ox,B.y-dy*r1/L+oy])}
      pts.forEach((q,k)=>{d+=(k?'L':'M')+q[0].toFixed(1)+','+q[1].toFixed(1)});return {d,to:t}})
  }
  function stat(s){
    const hl=new Set(s.hl||[]),bad=new Set(s.bad||[]),off=new Set(s.off||[]);
    let h=`<defs><pattern id="pxg" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" class="gd"/></pattern>
      <marker id="pxa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="ah"/></marker>
      <marker id="pxab" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="ah bad"/></marker>
      <marker id="pxao" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="ah ok"/></marker></defs>
      <rect x="-40" y="-40" width="760" height="${(sc.h||300)+120}" fill="url(#pxg)"/>`;
    (links||[]).forEach(([a,b,lab])=>{const A=nodeById(a),B=nodeById(b);if(!A||!B)return;h+=`<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="lk"/>`;if(lab)h+=`<text x="${(A.x+B.x)/2}" y="${(A.y+B.y)/2-8}" text-anchor="middle" class="lkl">${esc(lab)}</text>`});
    h+='<g id="pl-trails"></g>';
    nodes.forEach(n=>{const c=['nd',n.kind||'',hl.has(n.id)?'hl':'',bad.has(n.id)?'bad':'',off.has(n.id)?'off':''].join(' ');
      h+=`<g class="${c}" data-id="${n.id}" transform="translate(${n.x},${n.y})"><rect class="halo" x="-30" y="-30" width="60" height="52" rx="16"/><rect class="tile" x="-24" y="-26" width="48" height="44" rx="13"/><g class="ic" transform="translate(0,-4)">${ICONS[iconOf(n)]}</g>
        <text y="34" text-anchor="middle" class="nl">${esc(n.label)}</text><text y="48" text-anchor="middle" class="ns">${esc((s.sub&&s.sub[n.id])||n.sub||'')}</text></g>`});
    h+='<g id="pl-labels"></g><g id="pl-pk"></g>';
    svg.innerHTML=h;
  }
  const NS='http://www.w3.org/2000/svg';
  function mk(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);parent&&parent.appendChild(e);return e}
  function cancel(){if(raf){cancelAnimationFrame(raf);raf=null}if(hold){clearTimeout(hold);hold=null}}
  function label(m){if(!m.label)return;const g=$('#pl-labels');const A=nodeById(m.from),B=nodeById(m.to==='*'?m.from:m.to)||A;
    const lx=m.at?m.at[0]:(A.x+B.x)/2,ly=m.at?m.at[1]:(A.y+B.y)/2-16;const w=Math.min(330,Math.max(54,m.label.length*6.3+18));
    const e=mk('g',{class:'ml '+(m.cls||'')},g);mk('rect',{x:lx-w/2,y:ly-11,width:w,height:21,rx:10.5},e);const t=mk('text',{x:lx,y:ly+3.5,'text-anchor':'middle'},e);t.textContent=m.label;
    requestAnimationFrame(()=>e.classList.add('in'))}
  function chipText(m){if(m.pk)return topOf(m.pk).short;return m.p||sc.proto||'•'}
  function ping(id){const g=svg.querySelector(`.nd[data-id="${id}"]`);if(!g)return;g.classList.remove('ping');void g.getBBox();g.classList.add('ping')}
  function animate(s,onDone){
    const ms=msgsOf(s);const trails=$('#pl-trails'),pkg=$('#pl-pk');const now=$('#pl-now');now.textContent='';
    if(!ms.length){onDone();return}
    const plan=ms.map(m=>{const rs=runs(m).map(r=>{const p=mk('path',{d:r.d,class:'tr '+(m.cls||'')},trails);p.dataset.mk=`url(#${m.cls==='evil'?'pxab':m.cls==='ok'?'pxao':'pxa'})`;const L=p.getTotalLength()||1;p.style.strokeDasharray=L;p.style.strokeDashoffset=L;return {p,L,to:r.to}});
      return {m,rs,dur:Math.max(650,Math.max(...rs.map(r=>r.L))/0.26)}});
    if(reduce){plan.forEach(({m,rs})=>{rs.forEach(r=>{r.p.style.strokeDashoffset=0;r.p.setAttribute('marker-end',r.p.dataset.mk)});label(m)});follow(ms.length-1,true);onDone();return}
    let k=0,t0=null;
    const startMsg=()=>{const {m,rs}=plan[k];label(m);follow(k);const A=nodeById(m.from);now.innerHTML=`<b>${esc(chipText(m))}</b> ${esc(A?A.label:'')} → ${esc(m.to==='*'?'mindenki (broadcast)':(nodeById(m.to)||{}).label||'')}`;
      plan[k].chips=rs.map(()=>{const g=mk('g',{class:'chip '+(m.cls||'')+' '+(m.pk?LAYC[topOf(m.pk).osi]||'':'')},pkg);const tx=chipText(m);const w=Math.max(30,tx.length*7.4+16);mk('rect',{x:-w/2,y:-10,width:w,height:20,rx:6},g);const t=mk('text',{y:4,'text-anchor':'middle'},g);t.textContent=tx;return g});ping(m.from)};
    startMsg();
    const tick=ts=>{if(t0===null)t0=ts;const P=plan[k];const q=Math.min(1,(ts-t0)*speed/P.dur);const e=q<.5?2*q*q:1-Math.pow(-2*q+2,2)/2;
      P.rs.forEach((r,j)=>{r.p.style.strokeDashoffset=r.L*(1-e);const pt=r.p.getPointAtLength(r.L*e);P.chips[j].setAttribute('transform',`translate(${pt.x.toFixed(1)},${pt.y.toFixed(1)})`)});
      if(q>=1){P.rs.forEach(r=>{ping(r.to);r.p.setAttribute('marker-end',r.p.dataset.mk)});P.chips.forEach(c=>c.classList.add('land'));const old=P.chips;setTimeout(()=>old.forEach(c=>c.remove()),450);
        k++;if(k>=plan.length){raf=null;onDone();return}t0=null;hold=setTimeout(()=>{hold=null;startMsg();raf=requestAnimationFrame(tick)},260/speed);return}
      raf=requestAnimationFrame(tick)};
    raf=requestAnimationFrame(tick);
  }
  /* --- csomag-boncoló --- */
  function packetsOf(s){const out=[];msgsOf(s).forEach((m,ix)=>{if(m.pk)out.push({ix,m,p:m.pk,lab:m.label||topOf(m.pk).name})});if(s.pk)out.push({ix:-1,p:s.pk,lab:s.pkLabel||'A csomag ebben az állapotban'});return out}
  function follow(ix,force){if(userSel&&!force)return;const P=packetsOf(steps[i]);const f=P.findIndex(x=>x.ix===ix);if(f>=0){sel=f;insp()}}
  function insp(){
    const box=$('#pl-insp');const s=steps[i];const P=packetsOf(s);
    if(!P.length){const ms=msgsOf(s);box.innerHTML=`<div class="pi-h"><b>Csomag-boncoló</b></div><div class="pi-empty">${ms.length?ms.map(m=>`<div class="pi-sum"><span class="dotc ${m.cls||''}"></span><span>${esc((nodeById(m.from)||{}).label||'')} → ${esc(m.to==='*'?'mindenki':(nodeById(m.to)||{}).label||'')}</span><b>${esc(m.label||'')}</b></div>`).join('')+'<p>Ennél a lépésnél a folyamat a lényeg, nem a bájtok: kövesd a színpadot és a táblákat.</p>':'<p>Ebben a lépésben nem utazik csomag. Olvasd el a magyarázatot, majd lépj tovább.</p>'}</div>`;return}
    if(sel==null||sel>=P.length)sel=0;const cur=P[sel].p;
    let off=0;const fl=[];cur.forEach((l,li)=>l.fields.forEach((f,fi)=>{fl.push({l,li,f,fi,o:off});off+=f.b.length}));
    const tot=off;
    const head=`<div class="pi-h"><b>Csomag-boncoló</b><span>${tot} bájt</span></div>`+(P.length>1?`<div class="pi-sel">${P.map((x,k)=>`<button type="button" data-k="${k}" class="${k===sel?'on':''} ${x.m&&x.m.cls||''}">${esc(x.lab.length>34?x.lab.slice(0,33)+'…':x.lab)}</button>`).join('')}</div>`:'');
    const stack=`<div class="pi-stack">${cur.map((l,li)=>{const n=l.fields.reduce((a,f)=>a+f.b.length,0);const any=l.fields.some(f=>f.chg);
      return `<details class="pi-l ${LAYC[l.osi]||''}" ${li>=cur.length-2||any||cur.length<=3?'open':''}><summary><span class="pi-osi">L${l.osi===7?'5–7':l.osi}</span><b>${esc(l.name)}</b><span class="pi-n">${n} bájt</span>${any?'<span class="pi-new">változott</span>':''}</summary>
        <table class="pi-f">${l.fields.map((f,fi)=>`<tr data-f="${li}.${fi}" tabindex="0" class="${f.chg?'chg':''}"><th>${esc(f.n)}</th><td class="v">${esc(f.v)}${f.note?`<span class="nt">${esc(f.note)}</span>`:''}</td><td class="hx">${f.fold?esc(f.b.slice(0,2).map(hx).join(' ')+' … ('+f.b.length+' bájt)'):esc(f.b.length>8?f.b.slice(0,8).map(hx).join(' ')+' …':f.b.map(hx).join(' '))}</td></tr>`).join('')}</table></details>`}).join('')}</div>`;
    let hex='<div class="pi-hex" aria-label="Hex nézet">';let col=0;
    fl.forEach(({l,li,f,fi})=>{const c=LAYC[l.osi]||'';if(f.fold){hex+=`<span class="hb fold ${c}" data-f="${li}.${fi}" title="${esc(f.n)}">${f.b.length}×${hx(f.b[0])}</span>`;col+=4;return}
      f.b.forEach(b=>{hex+=`<span class="hb ${c} ${f.chg?'chg':''}" data-f="${li}.${fi}" title="${esc(l.name+' · '+f.n)}">${hx(b)}</span>`;col++})});
    hex+='</div>';
    box.innerHTML=head+stack+`<div class="pi-hh">Bájtok a vezetéken (hexadecimális)</div>`+hex;
    box.querySelectorAll('.pi-sel button').forEach(b=>b.onclick=()=>{userSel=true;sel=+b.dataset.k;insp()});
    const lit=(k,on)=>box.querySelectorAll(`[data-f="${k}"]`).forEach(e=>e.classList.toggle('lit',on));
    box.querySelectorAll('[data-f]').forEach(e=>{const k=e.dataset.f;e.onmouseenter=()=>lit(k,true);e.onmouseleave=()=>lit(k,false);e.onfocus=()=>lit(k,true);e.onblur=()=>lit(k,false)});
  }
  function tl(){const t=$('#pl-tl');t.innerHTML=steps.map((s,k)=>`<button type="button" data-k="${k}" class="${k===i?'on':k<i?'done':''} ${s.tagCls||''}" aria-current="${k===i?'step':'false'}"><i>${k+1}</i><span>${esc(s.tag||(k===0?'Kiinduló helyzet':'Lépés'))}</span></button>`).join('');
    t.querySelectorAll('button').forEach(b=>b.onclick=()=>go(+b.dataset.k,false));const on=t.querySelector('.on');if(on&&on.scrollIntoView){const L=on.offsetLeft-t.clientWidth/2+on.clientWidth/2;t.scrollTo({left:L,behavior:reduce?'auto':'smooth'})}}
  function draw(){
    cancel();const s=steps[i];userSel=false;sel=null;stat(s);tl();
    $('#pl-cnt').textContent=`${i+1} / ${steps.length}`;
    $('#pl-tag').innerHTML=s.tag?`<span class="pill ${s.tagCls||''}">${esc(s.tag)}</span>`:'';
    $('#pl-text').innerHTML=s.text;
    $('#pl-tables').innerHTML=(s.tables||[]).map(t=>`<div class="tblwrap"><div class="tt">${esc(t.title)}</div><table class="st"><thead><tr>${t.head.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${t.rows.length?t.rows.map(r=>`<tr class="${r.cls||''}">${(r.c||r).map(x=>`<td class="mono">${esc(x)}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${t.head.length}" class="sub">(üres)</td></tr>`}</tbody></table></div>`).join('');
    $('#pl-prev').disabled=i===0;$('#pl-next').disabled=i===steps.length-1;
    insp();
    animate(s,()=>{if(!playing)return;if(i>=steps.length-1){setPlay(false);return}const txt=(s.text||'').replace(/<[^>]+>/g,'').length;hold=setTimeout(()=>{hold=null;if(playing&&document.body.contains(root)){i++;draw()}},Math.min(9000,1600+txt*28)/speed)});
  }
  function setPlay(on){playing=on;pb.classList.toggle('on',on);pb.setAttribute('aria-label',on?'Szünet':'Lejátszás')}
  function go(k,keep){setPlay(!!keep&&playing);if(k<0||k>=steps.length)return;i=k;draw()}
  pb.onclick=()=>{if(playing){setPlay(false);cancel();return}setPlay(true);if(i>=steps.length-1)i=0;draw()};
  $('#pl-prev').onclick=()=>go(i-1);$('#pl-next').onclick=()=>go(i+1);$('#pl-reset').onclick=()=>go(0);$('#pl-again').onclick=()=>{const p=playing;draw();setPlay(p)};
  root.querySelectorAll('.pex-spd button').forEach(b=>b.onclick=()=>{speed=+b.dataset.v;root.querySelectorAll('.pex-spd button').forEach(x=>x.classList.toggle('on',x===b))});
  if(sc.tabs){const tb=root.querySelectorAll('.pex-tab');const pick=ix=>{setPlay(false);const T=sc.tabs[ix];steps=T.steps;nodes=T.nodes||sc.nodes;links=T.links||sc.links;i=0;tb.forEach((b,j)=>{b.classList.toggle('on',j===ix);b.setAttribute('aria-selected',j===ix)});draw()};tb.forEach(b=>b.onclick=()=>pick(+b.dataset.ix));pick(0)}
  else{steps=sc.steps;nodes=sc.nodes;links=sc.links;draw()}
  EX.key=e=>{if(!document.body.contains(root))return;if(e.key==='ArrowRight')$('#pl-next').click();else if(e.key==='ArrowLeft')$('#pl-prev').click();else if(e.key==='r'||e.key==='R')$('#pl-again').click();else if(e.key===' '&&e.target.tagName!=='BUTTON'){e.preventDefault();pb.click()}};
}

/* ---------- Forgatókönyvek ---------- */
const MAC={A:'00:14:22:11:0A:F2',R:'00:1B:44:7A:9C:AA',T:'AA:BB:CC:66:66:66',B:'F4:5C:89:12:34:56'};
const arpSc={title:'ARP és ARP-hamisítás',src:['e4-halozati-reteg.html'],
 intro:'Az IP-csomagot Ethernet-keretbe kell tenni, ehhez a következő ugrás MAC-címe kell. Ezt az ARP deríti ki. A példában „A” gép az internetre küld, ezért az átjáró (193.225.32.1) MAC-címét keresi.',
 nodes:[{id:'A',label:'A gép',sub:'193.225.32.10',x:110,y:70},{id:'SW',label:'Switch',sub:'',x:340,y:150,kind:'sw',w:96},{id:'R',label:'Átjáró (router)',sub:'193.225.32.1',x:570,y:70,w:130},{id:'B',label:'B gép',sub:'193.225.32.20',x:110,y:240},{id:'T',label:'Támadó',sub:'193.225.32.66',x:570,y:240,kind:'evil'}],
 links:[['A','SW'],['R','SW'],['B','SW'],['T','SW']],
 steps:(()=>{const tA=rows=>({title:'A gép ARP-táblája (arp -a)',head:['Internet Address','Physical Address','Type'],rows});
  const ok=[['193.225.32.1',MAC.R,'dynamic']],pois=[{c:['193.225.32.1',MAC.T,'dynamic'],cls:'badrow'}];
  return [
  {text:'„A” gép csomagot küldene egy internetes szervernek. Kiszámolja a saját és a cél hálózati címét (IP ÉS maszk): eltérnek, tehát az <b>alapértelmezett átjárónak</b> kell küldenie. Ehhez kell az átjáró MAC-címe, de az ARP-táblája még üres.',hl:['A'],tables:[tA([])]},
  {tag:'ARP-kérés',msg:{from:'A',to:'*',via:['SW'],label:'Ki a 193.225.32.1? (cél: FF:FF:FF:FF:FF:FF)',at:[340,230-5]},text:'ARP-kérés <b>broadcastként</b> (cél MAC: FF:FF:FF:FF:FF:FF). A switch minden portra továbbítja, így mindenki megkapja, de csak a keresett IP-cím gazdája válaszol.',hl:['A'],tables:[tA([])]},
  {tag:'ARP-válasz',msg:{from:'R',to:'A',via:['SW'],label:'193.225.32.1 = '+MAC.R,at:[340,40]},text:'Az átjáró <b>unicastban</b> válaszol a saját MAC-címével. „A” felveszi a táblájába <code>dynamic</code> típusú bejegyzésként.',hl:['R'],tables:[tA(ok)]},
  {tag:'Normál forgalom',msg:{from:'A',to:'R',via:['SW'],label:'keret → '+MAC.R,at:[340,40]},text:'Most már működik a küldés: az Ethernet-keret célja az átjáró MAC-címe, az IP-csomag célja továbbra is a távoli szerver.',tables:[tA(ok)]},
  {tag:'Támadás',tagCls:'bad',msg:{from:'T',to:'A',via:['SW'],label:'Hamis ARP-válasz: 193.225.32.1 = '+MAC.T,cls:'evil',at:[300,205]},text:'A támadó <b>kéretlen, hamis ARP-válaszokat</b> küld: azt állítja, hogy az átjáró IP-címe az ő MAC-címéhez tartozik. Az ARP nem ellenőrzi a válasz hitelességét, ezért „A” elhiszi.',bad:['T'],tables:[tA(pois)]},
  {tag:'Mérgezett ARP-tábla',tagCls:'bad',text:'„A” táblájában az átjáró IP-címéhez most a támadó MAC-címe tartozik. Ezt hívják <b>ARP-mérgezésnek</b> (ARP poisoning). Ugyanezt a támadó az átjáróval is megteheti, „A” IP-címével.',hl:['A'],bad:['T'],tables:[tA(pois)]},
  {tag:'Közbeékelődés (MITM)',tagCls:'bad',msg:[{from:'A',to:'T',via:['SW'],label:'A forgalma a támadóhoz megy',cls:'evil',at:[240,205]},{from:'T',to:'R',via:['SW'],label:'továbbítja',cls:'evil',side:-1,at:[520,160]}],text:'„A” minden kimenő keretét a támadónak címzi. A támadó lehallgatja vagy módosítja, majd továbbítja a valódi átjárónak, így „A” semmit sem vesz észre. Ez a <b>Man-in-the-Middle</b> támadás.',bad:['T'],tables:[tA(pois)]},
  {tag:'Védekezés',tagCls:'good',text:'<b>Statikus ARP-bejegyzés</b> a fontos címekre: <code>arp -s 193.225.32.1 00-1B-44-7A-9C-AA</code>. Ezt a hamis válasz nem írja felül. A jegyzet szerint a legbiztosabb a <b>forgalom titkosítása</b> (HTTPS, SSH, VPN): a támadó így is látja a csomagokat, de elolvasni nem tudja őket. <span class="sub">(Jegyzeten túl: a menedzselt switchek Dynamic ARP Inspection funkciója kiszűri a hamis ARP-válaszokat.)</span>',hl:['A'],tables:[tA([{c:['193.225.32.1',MAC.R,'static'],cls:'goodrow'}])]}
 ]})()};

const camSc={title:'Switch CAM-tábla és túlterheléses támadás',src:['e3-adatkapcsolati-reteg.html'],
 intro:'A switch megtanulja, melyik MAC-cím melyik portján van, és csak oda továbbít. Ez véd a passzív lehallgatás ellen, amíg a CAM-tábla meg nem telik.',
 nodes:[{id:'SW',label:'Switch S1',sub:'CAM: 0/4 hely',x:340,y:150,kind:'sw',w:130},{id:'P0',label:'PC0',sub:'0001.96ae.9289',x:110,y:60,w:130},{id:'P1',label:'PC1',sub:'0001.c9c4.2053',x:570,y:60,w:130},{id:'P2',label:'PC2',sub:'000a.4128.5543',x:110,y:245,w:130},{id:'T',label:'Támadó',sub:'macof',x:570,y:245,kind:'evil',w:130}],
 links:[['P0','SW','Fa0/1'],['P1','SW','Fa0/2'],['P2','SW','Fa0/3'],['T','SW','Fa0/4']],
 steps:(()=>{const t=(rows,full)=>({title:'show mac-address-table'+(full?' (TELE)':''),head:['Vlan','Mac Address','Type','Ports'],rows});
  const r0={c:['1','0001.96ae.9289','DYNAMIC','Fa0/1']},r1={c:['1','0001.c9c4.2053','DYNAMIC','Fa0/2']};
  const fake=['3ee6.fe7d.5146','6ae2.7f2e.2433','e48d.0976.a694'].map(m=>({c:['1',m,'DYNAMIC','Fa0/4'],cls:'badrow'}));
  return [
  {text:'Bekapcsolás után a CAM-tábla üres. A példában 4 helyes táblát mutatunk, a valóságban több ezer vagy százezer bejegyzésnyi a hely.',tables:[t([])]},
  {tag:'Tanulás + elárasztás',msg:{from:'P0',to:'*',via:['SW'],label:'PC0 → PC1 keret',except:[],at:[340,215]},sub:{SW:'CAM: 1/4 hely'},text:'PC0 keretet küld PC1-nek. A switch <b>megtanulja</b> a feladó MAC-címét (PC0 → Fa0/1). A címzettet még nem ismeri, ezért a keretet a beérkezési port kivételével <b>minden portra kiküldi</b> (flooding).',hl:['P0'],tables:[t([r0])]},
  {tag:'Tanulás',msg:{from:'P1',to:'P0',via:['SW'],label:'PC1 válasza',at:[340,40]},sub:{SW:'CAM: 2/4 hely'},text:'PC1 válaszol. A switch felveszi PC1 címét is (Fa0/2), PC0 címét pedig már ismeri, ezért csak az Fa0/1-re küldi.',hl:['P1'],tables:[t([r0,r1])]},
  {tag:'Kapcsolás',msg:{from:'P0',to:'P1',via:['SW'],label:'csak Fa0/2-re',at:[340,40]},sub:{SW:'CAM: 2/4 hely'},text:'Innentől PC0 és PC1 forgalma <b>csak a két érintett porton</b> megy. A támadó (Fa0/4) nem látja, a passzív lehallgatás itt nem működik.',tables:[t([r0,r1])]},
  {tag:'Támadás',tagCls:'bad',msg:{from:'T',to:'SW',label:'több ezer keret, véletlen forrás-MAC',cls:'evil',at:[470,215]},sub:{SW:'CAM: 4/4 hely, TELE'},text:'A támadó a <code>macof</code> (vagy <code>hyenae</code>) programmal másodpercenként rengeteg keretet küld, mindegyiket más, hamis forrás-MAC-címmel. A switch mindet megtanulja, a tábla <b>megtelik</b>, és a valódi bejegyzések lejárat után sem férnek vissza.',bad:['T','SW'],tables:[t([r0,...fake],true)]},
  {tag:'Fail-open: hubként működik',tagCls:'bad',msg:{from:'P2',to:'*',via:['SW'],label:'PC2 → PC1: minden portra',at:[340,215]},sub:{SW:'CAM: TELE'},text:'PC2 címe már nem fér be, és a kiszorult PC1 sincs a táblában. Minden ismeretlen címzettű keretet elárasztással küld ki a switch, vagyis <b>hubként működik</b>. A támadó promiscuous módban (Wireshark, tcpdump) látja a mások forgalmát.',bad:['T'],tables:[t([...fake,{c:['1','b2c1.8d0e.77f3','DYNAMIC','Fa0/4'],cls:'badrow'}],true)]},
  {tag:'Védekezés: port-security',tagCls:'good',sub:{SW:'Fa0/4: err-disabled'},off:['T'],text:'Menedzselt switchen portonként korlátozható a MAC-címek száma. Az első hamis cím után a port leáll:<pre class="out">interface fa0/4\n switchport mode access\n switchport port-security\n switchport port-security maximum 1\n switchport port-security mac-address 000A.4128.5543\n switchport port-security violation shutdown</pre>Ugyanez véd a DHCP-kiéheztetés ellen is. A fizikai hozzáférést is korlátozni kell (zárt rack), mert a MAC-cím szoftveresen átírható.',tables:[t([r0,r1,{c:['1','000a.4128.5543','STATIC','Fa0/3'],cls:'goodrow'}])]}
 ]})()};

const dhcpNodes=[{id:'C',label:'Új kliens',sub:'0.0.0.0',x:100,y:70},{id:'SW',label:'Switch',sub:'',x:340,y:150,kind:'sw',w:96},{id:'S',label:'DHCP szerver',sub:'192.168.50.1 (router)',x:580,y:70,w:150},{id:'T',label:'Támadó',sub:'Yersinia',x:580,y:240,kind:'evil',w:130},{id:'D',label:'Másik kliens',sub:'192.168.50.50',x:100,y:240}];
const dhcpSc={title:'DHCP: címkérés, kiéheztetés, csaló szerver',src:['e5-dhcp.html','gy9-dhcp.html'],
 intro:'Válassz forgatókönyvet. A pool a példában csak 4 címből áll (192.168.50.50–53), hogy látható legyen a kimerülés.',nodes:dhcpNodes,links:[['C','SW'],['S','SW'],['T','SW'],['D','SW']],
 tabs:(()=>{const pool=rows=>({title:'show ip dhcp binding (a szerveren)',head:['IP address','Hardware address','Type'],rows});
  const d0={c:['192.168.50.50','0001.4359.3BCA','Automatic']};
  const fk=['de:ad:01','de:ad:02','de:ad:03'].map((m,ix)=>({c:['192.168.50.'+(51+ix),m.replace(/:/g,'')+'.0000','Automatic'],cls:'badrow'}));
  return [
  {label:'Normál címkérés (DORA)',steps:[
   {text:'A kliens most kapcsolódott a hálózathoz, még nincs IP-címe. A DHCP négy lépésben ad neki címet: Discover, Offer, Request, Ack (DORA).',hl:['C'],tables:[pool([d0])]},
   {tag:'1. DHCPDISCOVER',msg:{from:'C',to:'*',via:['SW'],label:'0.0.0.0 → 255.255.255.255',at:[340,230]},text:'Broadcast a 2. és a 3. rétegben is: forrás <code>0.0.0.0</code>, cél <code>255.255.255.255</code>. Minden DHCP szerver megkapja.',hl:['C'],tables:[pool([d0])]},
   {tag:'2. DHCPOFFER',msg:{from:'S',to:'C',via:['SW'],label:'Ajánlat: 192.168.50.51 /24, átjáró .1, DNS .5',at:[340,40]},text:'A szerver ajánlatot küld: legalább IP-cím és maszk, valamint opcionálisan alapértelmezett átjáró, DNS-szerver és tartomány-utótag.',hl:['S'],tables:[pool([d0])]},
   {tag:'3. DHCPREQUEST',msg:{from:'C',to:'*',via:['SW'],label:'Az 192.168.50.1 ajánlatát kérem',at:[340,230]},text:'A kliens ismét broadcastban jelzi, melyik ajánlatot fogadja el. Így a többi szerver is megtudja, hogy az ő ajánlatuk felszabadulhat.',hl:['C'],tables:[pool([d0])]},
   {tag:'4. DHCPACK',msg:{from:'S',to:'C',via:['SW'],label:'Nyugta, bérlet: 1 nap',at:[340,40]},sub:{C:'192.168.50.51'},text:'A szerver nyugtáz és bejegyzi a bérletet. A kliens ARP-pal ellenőrzi, hogy a cím nem foglalt-e, majd használni kezdi. A bérlet lejárta előtt megújítja.',hl:['C','S'],tables:[pool([d0,{c:['192.168.50.51','0060.70BD.6739','Automatic'],cls:'goodrow'}])]}
  ]},
  {label:'Kiéheztetés (starving)',steps:[
   {text:'A pool négy címéből egy foglalt. A támadó célja, hogy a többit elfogyassza.',tables:[pool([d0])]},
   {tag:'Támadás',tagCls:'bad',msg:{from:'T',to:'S',via:['SW'],label:'DISCOVER ×1000, mind más hamis MAC',cls:'evil',at:[470,215]},text:'A támadó (pl. <code>yersinia -I</code>, DHCPig, Hyenae) rengeteg DHCPDISCOVER-t küld, mindegyiket más hamis MAC-címmel. A szerver mindegyiknek ajánl és lefoglal egy címet, a támadó a válaszokat figyelmen kívül hagyja.',bad:['T'],tables:[pool([d0,...fk])]},
   {tag:'A pool kimerült',tagCls:'bad',msg:{from:'C',to:'*',via:['SW'],label:'DHCPDISCOVER',at:[340,230]},sub:{C:'169.254.125.60'},text:'Az új kliens nem kap ajánlatot, ezért <b>APIPA</b> címet választ a 169.254.0.0/16 tartományból. Csak a hasonló helyzetű gépekkel tud kommunikálni, internetet nem ér el. A támadás leállítása után is percekig, napokig tart a hatás, amíg a hamis bérletek le nem járnak.',bad:['T'],tables:[pool([d0,...fk])]},
   {tag:'Védekezés',tagCls:'good',off:['T'],text:'Portonkénti MAC-korlát (<code>switchport port-security maximum 1</code>), a DHCP-kérések számának korlátozása (<code>ip dhcp snooping limit rate 10</code>), MAC–IP statikus összerendelés és a dinamikus kiosztás tiltása, vagy statikus címek.',tables:[pool([d0])]}
  ]},
  {label:'Csaló szerver + snooping',steps:[
   {text:'A támadó saját DHCP szervert indít, gyakran a valódi szerver kiéheztetése után, hogy csak ő tudjon válaszolni.',bad:['T']},
   {tag:'DISCOVER',msg:{from:'C',to:'*',via:['SW'],label:'DHCPDISCOVER (broadcast)',at:[340,230]},text:'A kliens broadcastja a támadóhoz is eljut.',hl:['C']},
   {tag:'Csaló OFFER',tagCls:'bad',msg:{from:'T',to:'C',via:['SW'],label:'átjáró = támadó, DNS = támadó',cls:'evil',at:[300,205]},sub:{C:'átjáró: a támadó'},text:'A támadó gyorsabban válaszol, és <b>saját magát</b> adja meg átjárónak és DNS-szervernek. Így a kliens teljes forgalma rajta megy át (MITM), a DNS-sel pedig csaló oldalra irányíthatja a felhasználót.',bad:['T']},
   {tag:'Védekezés: DHCP snooping',tagCls:'good',msg:{from:'T',to:'SW',label:'OFFER eldobva (untrusted port)',cls:'evil',at:[470,215]},off:['T'],sub:{SW:'snooping: be'},text:'A switchen a DHCP snooping csak a <b>trusted</b> porton enged át szerverválaszt (OFFER, ACK). A többi porton csak kliens kérés mehet:<pre class="out">ip dhcp snooping\ninterface g0/1      ! a valódi szerver felé\n ip dhcp snooping trust</pre>',hl:['S']},
   {tag:'Helyes válasz',tagCls:'good',msg:{from:'S',to:'C',via:['SW'],label:'OFFER a trusted portról',at:[340,40]},off:['T'],sub:{C:'192.168.50.51'},text:'Csak a legitim szerver ajánlata jut el a klienshez.',hl:['S','C']}
  ]}]})()};

const natNodes=[{id:'PC',label:'PC',sub:'192.168.1.11',x:90,y:150,w:120},{id:'R',label:'Router',sub:'be: 192.168.1.1 · ki: 193.225.32.1',x:340,y:150,w:210,kind:'sw'},{id:'W',label:'Webszerver',sub:'142.251.208.142',x:590,y:150,w:140}];
function natTabs(){
  const pk=(s,d,cls)=>({title:'A csomag fejléce',head:['Forrás IP:port','Cél IP:port'],rows:[{c:[s,d],cls:cls||''}]});
  const nt=rows=>({title:'NAT tábla',head:['Belső helyi','Belső globális','Külső helyi','Külső globális'],rows});
  const pt=rows=>({title:'PAT tábla',head:['Belső cím:port','PAT port (külső)','Cél'],rows});
  const nrow={c:['192.168.1.11','193.225.32.2','193.225.32.1','142.251.208.142'],cls:'goodrow'};
  const prow={c:['192.168.1.11:40001','193.225.32.1:62126','142.251.208.142:80'],cls:'goodrow'};
  return [
  {label:'NAT (címkölcsönzés)',steps:[
   {msg:{from:'PC',to:'R',label:'kérés',at:[215,120]},text:'A PC a 142.251.208.142 webszervert kéri. Másik hálózatban van, ezért az átjárónak (192.168.1.1) küldi. Forrásport: egy szabad véletlen port (40001), célport: 80.',hl:['PC'],tables:[pk('192.168.1.11:40001','142.251.208.142:80'),nt([])]},
   {tag:'Forráscím csere',msg:{from:'R',to:'W',label:'kifelé',at:[465,120]},text:'Privát forráscímmel az internetes routerek eldobnák a csomagot. A router a kölcsönözhető publikus tartományából (193.225.32.0/28) kiválaszt egy szabad címet, <b>193.225.32.2</b>-t, és ezzel írja felül a forráscímet. Bejegyzi a NAT táblába.',hl:['R'],tables:[pk('193.225.32.2:40001','142.251.208.142:80','badrow'),nt([nrow])]},
   {tag:'Válasz',msg:{from:'W',to:'R',label:'válasz',at:[465,120]},text:'A webszerver a 193.225.32.2:40001 címre válaszol. A válasz a routerhez érkezik.',hl:['W'],tables:[pk('142.251.208.142:28212','193.225.32.2:40001'),nt([nrow])]},
   {tag:'Visszafordítás',msg:{from:'R',to:'PC',label:'befelé',at:[215,120]},text:'A router a NAT táblában megkeresi a bejegyzést, a célcímet visszaírja <b>192.168.1.11</b>-re, és a belső interfészen továbbítja.',hl:['R','PC'],tables:[pk('142.251.208.142:28212','192.168.1.11:40001','badrow'),nt([nrow])]},
   {tag:'Védő hatás',tagCls:'good',msg:{from:'W',to:'R',label:'kívülről kezdeményezett',cls:'evil',at:[465,120]},text:'Egy kívülről kezdeményezett új kapcsolathoz nincs NAT-bejegyzés, ezért a router eldobja. Ez részleges védelem, tűzfalat nem helyettesít.',tables:[nt([nrow])]}
  ]},
  {label:'PAT (overload)',steps:[
   {msg:{from:'PC',to:'R',label:'kérés',at:[215,120]},text:'Ugyanaz a kérés, de a routernek csak <b>egy</b> publikus címe van: a saját külső címe.',hl:['PC'],tables:[pk('192.168.1.11:40001','142.251.208.142:80'),pt([])]},
   {tag:'Cím- és portcsere',msg:{from:'R',to:'W',label:'kifelé',at:[465,120]},text:'A forráscím a router címe (193.225.32.1) lesz. A 40001-es port már foglalt egy másik belső gép miatt, ezért a router szabad portot választ (<b>62126</b>), és felírja a PAT táblába.',hl:['R'],tables:[pk('193.225.32.1:62126','142.251.208.142:80','badrow'),pt([{c:['192.168.1.23:40001','193.225.32.1:40001','8.8.8.8:53']},prow])]},
   {tag:'Válasz',msg:{from:'W',to:'R',label:'válasz',at:[465,120]},text:'A szerver a 193.225.32.1:62126-ra válaszol.',hl:['W'],tables:[pk('142.251.208.142:28212','193.225.32.1:62126'),pt([prow])]},
   {tag:'Visszafordítás porttal',msg:{from:'R',to:'PC',label:'befelé',at:[215,120]},text:'A router a <b>62126-os PAT-port</b> alapján találja meg a belső gépet, visszaírja a célt 192.168.1.11:40001-re. Cisco-n: <code>ip nat inside source list 1 interface g0/1 overload</code>.',hl:['R','PC'],tables:[pk('142.251.208.142:28212','192.168.1.11:40001','badrow'),pt([prow])]}
  ]}]}
const natSc={title:'NAT és PAT lépésenként',src:['e8-nat.html','gy15-nat.html'],intro:'A jegyzet példája: a belső 192.168.1.0/24 hálózat egy webszervert ér el. A sárga sor a csomagban éppen megváltozott mezőt jelöli.',nodes:natNodes,links:[['PC','R'],['R','W']],h:260,tabs:natTabs()};

/* ---------- ACL gyakorló ---------- */
const PROTO={tcp:1,udp:1,icmp:1,ip:1};
const PORTN={www:80,http:80,ftp:21,telnet:23,smtp:25,domain:53,https:443,ssh:22};
function parseAddr(tok,k){ // returns [ip,wild,next]
  if(tok[k]==='any')return [0,0xFFFFFFFF,k+1];
  if(tok[k]==='host'){const ip=ip2n(tok[k+1]);if(ip===null)throw 'hibás host cím: '+tok[k+1];return [ip,0,k+2]}
  const ip=ip2n(tok[k]);if(ip===null)throw 'hibás cím: '+(tok[k]||'(hiányzik)');
  const w=ip2n(tok[k+1]);if(w===null)return [ip,0,k+1];return [ip,w,k+2];
}
function parsePort(tok,k){if(tok[k]==='eq'){const v=tok[k+1];const n=/^\d+$/.test(v)?+v:PORTN[v];if(n===undefined)throw 'ismeretlen port: '+v;return [n,k+2]}return [null,k]}
function parseAcl(text){
  const rules=[];let type=null;
  text.split('\n').forEach((raw,ln)=>{
    let l=raw.replace(/!.*/,'').trim().toLowerCase();if(!l)return;
    let m=l.match(/^ip access-list (standard|extended) (\S+)$/);if(m){type=m[1];return}
    m=l.match(/^access-list (\d+) (.*)$/);let body;
    if(m){const num=+m[1];type=(num>=1&&num<=99)?'standard':(num>=100&&num<=199)?'extended':null;if(!type)throw `${ln+1}. sor: a számozott lista száma 1–99 (standard) vagy 100–199 (extended) lehet`;body=m[2]}
    else body=l.replace(/^\d+\s+/,'');
    if(body.startsWith('remark'))return;
    const tok=body.split(/\s+/);const act=tok[0];if(act!=='permit'&&act!=='deny')throw `${ln+1}. sor: permit vagy deny kell az elejére`;
    if(!type)throw `${ln+1}. sor: előbb add meg a lista típusát (access-list N … vagy ip access-list standard|extended NÉV)`;
    try{
      if(type==='standard'){const [ip,w]=parseAddr(tok,1);rules.push({raw:raw.trim(),act,type,src:[ip,w]})}
      else{const pr=tok[1];if(!PROTO[pr])throw 'protokoll: ip, tcp, udp vagy icmp';let k=2;const s=parseAddr(tok,k);k=s[2];const sp=parsePort(tok,k);k=sp[1];const d=parseAddr(tok,k);k=d[2];const dp=parsePort(tok,k);
        rules.push({raw:raw.trim(),act,type,pr,src:[s[0],s[1]],sp:sp[0],dst:[d[0],d[1]],dp:dp[0]})}
    }catch(e){throw `${ln+1}. sor: ${e}`}
  });
  return rules;
}
const matchA=(a,[ip,w])=>((a|w)>>>0)===((ip|w)>>>0);
function evalAcl(rules,p){for(let k=0;k<rules.length;k++){const r=rules[k];let ok;
  if(r.type==='standard')ok=matchA(p.src,r.src);
  else ok=(r.pr==='ip'||r.pr===p.pr)&&matchA(p.src,r.src)&&matchA(p.dst,r.dst)&&(r.dp===null||(p.pr!=='icmp'&&r.dp===p.dp))&&(r.sp===null||r.sp===p.sp);
  if(ok)return {k,act:r.act}}return {k:-1,act:'deny'}}
const ACL_PRESETS=[
 {name:'Kiterjesztett: KIMENO (Gy15 feladat)',acl:`ip access-list extended KIMENO
 permit tcp 192.168.100.0 0.0.0.255 host 192.168.200.5 eq www
 permit tcp host 192.168.100.12 host 192.168.200.5 eq 21
 permit icmp host 192.168.100.12 host 192.168.200.5
 permit icmp host 192.168.100.11 host 192.168.200.11`,
  pk:[['192.168.100.11','192.168.200.5','tcp',80],['192.168.100.11','192.168.200.5','tcp',21],['192.168.100.12','192.168.200.5','tcp',21],['192.168.100.12','192.168.200.5','icmp',null],['192.168.100.11','192.168.200.5','icmp',null],['192.168.100.11','192.168.200.11','icmp',null],['192.168.100.12','192.168.200.11','icmp',null],['192.168.100.13','192.168.200.5','tcp',80],['192.168.100.12','192.168.200.11','tcp',80],['192.168.100.11','192.168.200.5','udp',53]]},
 {name:'Standard: 10-es lista',acl:`access-list 10 deny host 192.168.10.5
access-list 10 permit 192.168.10.0 0.0.0.255
access-list 10 deny any`,
  pk:[['192.168.10.5','192.168.200.11','tcp',80],['192.168.10.6','192.168.200.11','tcp',80],['192.168.10.200','10.0.0.1','icmp',null],['192.168.11.5','192.168.200.11','tcp',80],['10.1.1.1','192.168.200.5','udp',53]]},
 {name:'Sorrend-csapda',acl:`access-list 20 permit 192.168.10.0 0.0.0.255
access-list 20 deny host 192.168.10.5`,
  pk:[['192.168.10.5','192.168.200.5','tcp',80],['192.168.10.77','192.168.200.5','tcp',80],['172.16.0.9','192.168.200.5','tcp',80]]}
];
function acl(root){
  root.innerHTML=`<div class="panel"><h2>ACL-gyakorló</h2>
   <p class="sub" style="margin:0;max-width:70ch">A router felülről lefelé nézi a szabályokat, és az <b>első illeszkedő</b> dönt. Ha egyik sem illeszkedik, a lista végén lévő láthatatlan <code>deny any</code> eldobja a csomagot. A standard lista csak a forráscímet nézi, a kiterjesztett a protokollt, a forrás- és célcímet és a portot is.</p>
   <div class="row"><label for="ac-pre" class="sub">Példa</label><select id="ac-pre">${ACL_PRESETS.map((p,ix)=>`<option value="${ix}">${esc(p.name)}</option>`).join('')}</select></div>
   <label for="ac-txt" class="sub">Hozzáférési lista (szerkeszthető, Cisco szintaxis)</label>
   <textarea id="ac-txt" class="mono code" rows="6" spellcheck="false"></textarea>
   <div id="ac-err"></div>
   <h3>Tippelj: átengedi vagy eldobja?</h3>
   <div id="ac-quiz"></div>
   <h3>Saját csomag tesztelése</h3>
   <div class="grid4">
    <label class="fld" for="ac-s"><span>Forrás IP</span><input id="ac-s" class="txt mono" value="192.168.100.11"></label>
    <label class="fld" for="ac-d"><span>Cél IP</span><input id="ac-d" class="txt mono" value="192.168.200.5"></label>
    <label class="fld" for="ac-p"><span>Protokoll</span><select id="ac-p"><option>tcp</option><option>udp</option><option>icmp</option></select></label>
    <label class="fld" for="ac-port"><span>Célport</span><input id="ac-port" class="txt mono" value="80"></label>
   </div>
   <div class="row"><button class="primary" id="ac-go" type="button">Kiértékelés</button></div>
   <div id="ac-res"></div>
   <div class="src">Forrás: <a href="${SITE}gy14-firewall.html" target="_blank" rel="noopener">gy14-firewall</a>. Wildcard: 255.255.255.255 − maszk; host = 0.0.0.0, any = minden cím.</div></div>`;
  const ta=root.querySelector('#ac-txt'),pre=root.querySelector('#ac-pre');
  let rules=[],qi=0,score=0,pks=[];
  const show=(res)=>`<table class="st acl"><tbody>${rules.map((r,k)=>`<tr class="${k===res.k?(r.act==='permit'?'goodrow':'badrow'):''}"><td class="mono">${esc(r.raw)}</td></tr>`).join('')}<tr class="${res.k===-1?'badrow':''}"><td class="mono sub">(implicit) deny any</td></tr></tbody></table>`;
  function parse(){try{rules=parseAcl(ta.value);root.querySelector('#ac-err').innerHTML='';return true}catch(e){root.querySelector('#ac-err').innerHTML=`<div class="feedback no">${esc(e)}</div>`;return false}}
  const pktTxt=p=>`${p[0]} → ${p[1]} · ${p[2].toUpperCase()}${p[3]?' / port '+p[3]:''}`;
  const toP=p=>({src:ip2n(p[0]),dst:ip2n(p[1]),pr:p[2],dp:p[3],sp:null});
  function quiz(){
    const q=root.querySelector('#ac-quiz');
    if(!parse()){q.innerHTML='';return}
    if(qi>=pks.length){q.innerHTML=`<div class="feedback ok">Kész: ${score} / ${pks.length} helyes tipp.</div><div class="row"><button type="button" id="ac-again">Újra</button></div>`;q.querySelector('#ac-again').onclick=()=>{qi=0;score=0;quiz()};return}
    const p=pks[qi];
    q.innerHTML=`<div class="qhead"><span>${qi+1} / ${pks.length}</span><span>jó: ${score}</span></div><div class="q mono">${esc(pktTxt(p))}</div>
      <div class="row"><button type="button" id="ac-perm">Átengedi (permit)</button><button type="button" id="ac-deny">Eldobja (deny)</button></div><div id="ac-qfb"></div>`;
    const ans=g=>{const r=evalAcl(rules,toP(p));const ok=g===r.act;if(ok)score++;q.querySelector('#ac-perm').disabled=q.querySelector('#ac-deny').disabled=true;
      q.querySelector('#ac-qfb').innerHTML=`<div class="feedback ${ok?'ok':'no'}"><b>${ok?'Helyes':'Nem jó'}: ${r.act==='permit'?'átengedi':'eldobja'}.</b> ${r.k===-1?'Egyik szabály sem illeszkedett, ezért az implicit deny any dönt.':`Az első illeszkedő szabály a(z) ${r.k+1}. sor.`}</div>${show(r)}<div class="row"><button class="primary" type="button" id="ac-nx">Következő</button></div>`;
      q.querySelector('#ac-nx').onclick=()=>{qi++;quiz()};q.querySelector('#ac-nx').focus()};
    q.querySelector('#ac-perm').onclick=()=>ans('permit');q.querySelector('#ac-deny').onclick=()=>ans('deny');
  }
  function load(){const p=ACL_PRESETS[+pre.value];ta.value=p.acl;pks=p.pk;qi=0;score=0;quiz();root.querySelector('#ac-res').innerHTML=''}
  pre.onchange=load;ta.oninput=()=>{qi=0;score=0;quiz()};
  root.querySelector('#ac-go').onclick=()=>{if(!parse())return;const s=ip2n(root.querySelector('#ac-s').value),d=ip2n(root.querySelector('#ac-d').value),pr=root.querySelector('#ac-p').value,pt=root.querySelector('#ac-port').value.trim();
    if(s===null||d===null){root.querySelector('#ac-res').innerHTML='<div class="feedback no">Adj meg érvényes forrás- és cél IP-címet.</div>';return}
    const r=evalAcl(rules,{src:s,dst:d,pr,dp:pr==='icmp'?null:(PORTN[pt]||+pt||null),sp:null});
    root.querySelector('#ac-res').innerHTML=`<div class="feedback ${r.act==='permit'?'ok':'no'}"><b>${r.act==='permit'?'Átengedi':'Eldobja'}.</b> ${r.k===-1?'Implicit deny any.':`Döntő szabály: ${r.k+1}. sor.`}</div>${show(r)}`};
  load();
}

/* ---------- Routing tábla kereső ---------- */
const RT_PRESETS=[
 {name:'R2 (Gy7, statikus útvonallal)',out:`R2#show ip route
Gateway of last resort is not set
    10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C       10.0.0.0/24 is directly connected, GigabitEthernet0/1
L       10.0.0.2/32 is directly connected, GigabitEthernet0/1
S    192.168.100.0/24 [1/0] via 10.0.0.1
    192.168.200.0/24 is variably subnetted, 2 subnets, 2 masks
C       192.168.200.0/24 is directly connected, GigabitEthernet0/0
L       192.168.200.1/32 is directly connected, GigabitEthernet0/0`,tries:['192.168.100.25','192.168.200.12','10.0.0.1','8.8.8.8','192.168.200.1']},
 {name:'R1 (Gy7, alapértelmezett útvonallal)',out:`R1#show ip route
Gateway of last resort is 172.16.8.1 to network 0.0.0.0
    10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C       10.0.0.0/24 is directly connected, GigabitEthernet0/1
L       10.0.0.1/32 is directly connected, GigabitEthernet0/1
    172.16.0.0/16 is variably subnetted, 2 subnets, 2 masks
C       172.16.8.0/24 is directly connected, GigabitEthernet0/2
L       172.16.8.2/32 is directly connected, GigabitEthernet0/2
    192.168.100.0/24 is variably subnetted, 2 subnets, 2 masks
C       192.168.100.0/24 is directly connected, GigabitEthernet0/0
L       192.168.100.1/32 is directly connected, GigabitEthernet0/0
S    192.168.200.0/24 [1/0] via 10.0.0.2
S*   0.0.0.0/0 [1/0] via 172.16.8.1`,tries:['192.168.200.40','8.8.8.8','172.16.8.1','192.168.100.11','10.0.0.2']},
 {name:'Leghosszabb egyezés (kitalált példa)',out:`R3#show ip route
Gateway of last resort is 203.0.113.1 to network 0.0.0.0
S    10.0.0.0/8 [1/0] via 192.168.1.2
S    10.1.0.0/16 [1/0] via 192.168.1.3
S    10.1.5.0/24 [1/0] via 192.168.1.4
C       192.168.1.0/24 is directly connected, GigabitEthernet0/0
S*   0.0.0.0/0 [1/0] via 203.0.113.1`,tries:['10.1.5.9','10.1.9.9','10.200.0.1','11.0.0.1']}
];
function parseRoutes(out){return out.split('\n').map((l,ix)=>{const m=l.match(/^(\S\*?)\s+(\d+\.\d+\.\d+\.\d+)\/(\d+)\s+(.*)$/);if(!m||!/^[CLSOD]\*?$/.test(m[1]))return null;
  const via=(m[4].match(/via (\S+)/)||[])[1],ifc=(m[4].match(/connected, (\S+)/)||[])[1];return {ix,code:m[1],net:ip2n(m[2]),p:+m[3],txt:m[2]+'/'+m[3],via,ifc}}).filter(Boolean)}
function routing(root){
  root.innerHTML=`<div class="panel"><h2>Routing tábla: merre megy a csomag?</h2>
   <p class="sub" style="margin:0;max-width:70ch">Írj be egy cél IP-címet. A router minden illeszkedő bejegyzés közül a <b>leghosszabb prefixűt</b> választja (a legpontosabbat), a 0.0.0.0/0 alapértelmezett útvonal csak akkor jön, ha semmi más nem illeszkedik.</p>
   <div class="row"><label for="rt-pre" class="sub">Router</label><select id="rt-pre">${RT_PRESETS.map((p,ix)=>`<option value="${ix}">${esc(p.name)}</option>`).join('')}</select></div>
   <div class="rtout" id="rt-out"></div>
   <div class="row"><label for="rt-ip" class="sub">Cél IP</label><input id="rt-ip" class="txt mono" value=""><span id="rt-tries" class="row"></span></div>
   <div id="rt-res" aria-live="polite"></div>
   <div class="feedback">Kódok: <b>C</b> közvetlenül csatlakozó hálózat, <b>L</b> a router saját címe (/32), <b>S</b> statikus útvonal, <b>S*</b> statikus alapértelmezett útvonal. <code>[1/0]</code> = adminisztratív távolság / metrika.</div>
   <div class="megj"><b>A jegyzetben eltér:</b> az e4 fejezet szerint a router felülről lefelé az első egyező sort választja. Valójában a leghosszabb illeszkedő prefix dönt; a jegyzet példájában ez ugyanazt az eredményt adja.</div>
   <div class="src">Forrás: <a href="${SITE}gy6-ip-utvalasztas.html" target="_blank" rel="noopener">gy6-ip-utvalasztas</a>, <a href="${SITE}e4-halozati-reteg.html" target="_blank" rel="noopener">e4-halozati-reteg</a></div></div>`;
  const pre=root.querySelector('#rt-pre'),inp=root.querySelector('#rt-ip');
  function run(){
    const P=RT_PRESETS[+pre.value],lines=P.out.split('\n'),routes=parseRoutes(P.out),ip=ip2n(inp.value);
    let best=null;const cands=[];
    if(ip!==null)routes.forEach(r=>{if(((ip&pmask(r.p))>>>0)===r.net){cands.push(r);if(!best||r.p>best.p)best=r}});
    root.querySelector('#rt-out').innerHTML=`<pre class="out">${lines.map((l,ix)=>{const r=routes.find(x=>x.ix===ix);const c=best&&r===best?'win':(r&&cands.includes(r)?'cand':'');return `<span class="ln ${c}">${esc(l)}</span>`}).join('\n')}</pre>`;
    const res=root.querySelector('#rt-res');
    if(!inp.value.trim()){res.innerHTML='';return}
    if(ip===null){res.innerHTML='<div class="feedback no">Érvénytelen IP-cím.</div>';return}
    if(!best){res.innerHTML=`<div class="feedback no"><b>Eldobja.</b> Egyik bejegyzés sem illeszkedik, és nincs alapértelmezett útvonal („Gateway of last resort is not set”). A feladó ICMP „Destination host unreachable” üzenetet kaphat.</div>`;return}
    const why=cands.length>1?` Illeszkedik még: ${cands.filter(c=>c!==best).map(c=>c.txt).join(', ')}, de a /${best.p} a leghosszabb.`:'';
    const act=best.code==='L'?'A csomag a <b>routernek magának</b> szól (saját interfészcím).':best.via?`Továbbítja a <b>${best.via}</b> következő ugrás felé.`:`Közvetlenül kiküldi a <b>${best.ifc}</b> interfészen (ARP-pal a cél MAC-címét kérdezi).`;
    res.innerHTML=`<div class="feedback ok"><b>${best.code} ${best.txt}</b>: ${act}${why}</div>`;
  }
  function load(){const P=RT_PRESETS[+pre.value];inp.value=P.tries[0];root.querySelector('#rt-tries').innerHTML=P.tries.map(t=>`<button type="button" class="chip mono" data-ip="${t}">${t}</button>`).join('');root.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{inp.value=b.dataset.ip;run()});run()}
  pre.onchange=load;inp.oninput=run;load();
}

/* ---------- Új animációk (traceroute, TCP/UDP, DNS, VLAN, DHCP relay, CSMA, WiFi+RADIUS, Telnet/SSH) ---------- */
const pre=s=>`<pre class="out">${s}</pre>`;

/* Traceroute – e6 */
const trNodes=[{id:'PC',label:'PC',sub:'192.168.1.10',x:62,y:150,w:104},{id:'R1',label:'R1',sub:'192.168.1.1',x:196,y:150,w:104,kind:'sw'},{id:'R2',label:'R2',sub:'10.0.0.2',x:330,y:150,w:104,kind:'sw'},{id:'R3',label:'R3',sub:'10.0.1.2',x:464,y:150,w:104,kind:'sw'},{id:'W',label:'www.uni-nke.hu',sub:'193.224.76.68',x:608,y:150,w:130}];
const trT=rows=>({title:'C:\\> tracert www.uni-nke.hu',head:['Ugrás','Válaszoló','Üzenet'],rows});
const r1=['1','192.168.1.1','ICMP: TTL lejárt'],r2=['2','10.0.0.2','ICMP: TTL lejárt'],r3=['3','10.0.1.2','ICMP: TTL lejárt'];
const traceSc={title:'Traceroute: a TTL trükkje',src:['e6-szallitasi-reteg.html','e4-halozati-reteg.html'],h:260,
 intro:'A traceroute (Windowson tracert) „különböző TTL értékű ping csomagokon alapul”. Minden router eggyel csökkenti a TTL-t, és amelyiknél 0-ra fogy, az eldobja a csomagot és ICMP üzenetben szól a feladónak.',
 nodes:trNodes,links:[['PC','R1'],['R1','R2'],['R2','R3'],['R3','W']],
 tabs:[{label:'Sikeres útvonal',steps:[
  {text:'Az IP-fejléc <b>TTL</b> mezője védi a hálózatot a végtelen körbe-küldéstől: routerenként eggyel csökken, 0-nál a csomagot eldobják. A traceroute ezt használja ki: a TTL-t 1-től növeli.',tables:[trT([])]},
  {tag:'TTL = 1',msg:[{from:'PC',to:'R1',label:'Echo Request, TTL=1',at:[130,105]},{from:'R1',to:'PC',label:'TTL lejárt',side:-1,cls:'evil',at:[130,200]}],text:'Az első csomag TTL-je 1. R1 csökkenti, 0 lesz, ezért eldobja, és <b>ICMP „TTL lejárt”</b> üzenetet küld vissza. Ebből tudjuk R1 címét.',hl:['R1'],tables:[trT([r1])]},
  {tag:'TTL = 2',msg:[{from:'PC',to:'R2',via:['R1'],label:'TTL=2 → 1 → 0',at:[196,105]},{from:'R2',to:'PC',via:['R1'],label:'TTL lejárt',side:-1,cls:'evil',at:[196,200]}],text:'TTL=2: R1 1-re csökkenti, R2 nullázza, így most <b>R2</b> válaszol.',hl:['R2'],tables:[trT([r1,r2])]},
  {tag:'TTL = 3',msg:[{from:'PC',to:'R3',via:['R1','R2'],label:'TTL=3 → 2 → 1 → 0',at:[263,105]},{from:'R3',to:'PC',via:['R2','R1'],label:'TTL lejárt',side:-1,cls:'evil',at:[263,200]}],text:'TTL=3: a harmadik router, <b>R3</b> címe jelenik meg.',hl:['R3'],tables:[trT([r1,r2,r3])]},
  {tag:'TTL = 4: célba ért',tagCls:'good',msg:[{from:'PC',to:'W',via:['R1','R2','R3'],label:'TTL=4',at:[330,105]},{from:'W',to:'PC',via:['R3','R2','R1'],label:'Echo Reply',side:-1,cls:'ok',at:[330,200]}],text:'A TTL=4 csomag eléri a célt, amely már <b>Echo Reply</b>-jal (ping-válasszal) felel. Itt a traceroute leáll: megvan a teljes útvonal.',hl:['W'],tables:[trT([r1,r2,r3,['4','193.224.76.68','Echo Reply']])]},
  {tag:'Fejben számolás',text:'A TTL-ből a ping válaszánál is kiszámolható a routerek száma: ha egy csomag 64-es TTL-lel indul és 61-gyel érkezik, <b>3 routeren</b> haladt át. Windows jellemzően 128-cal, Linux 64-gyel indít.'}]},
 {label:'Elérhetetlen cél',steps:[
  {text:'A jegyzet példájában az NKE webszervere felé a kimenet csak az egyetem központi routeréig látszik.',tables:[trT([r1,r2])]},
  {tag:'Hiba',tagCls:'bad',msg:[{from:'PC',to:'R3',via:['R1','R2'],label:'TTL=3',at:[263,105]},{from:'R3',to:'PC',via:['R2','R1'],label:'Destination net unreachable',side:-1,cls:'evil',at:[263,200]}],off:['W'],bad:['R3'],text:'R3 nem tudja továbbítani a csomagot (nincs útvonala, vagy tűzfal tiltja), ezért az utolsó működő eszköz <b>ICMP hibaüzenetet</b> küld: <code>Destination net unreachable</code>. Az ICMP üzenetek kézbesítése sem garantált, ezért gyakran csak <code>*</code> (időtúllépés) látszik.',tables:[trT([r1,r2,{c:['3','10.0.1.2','Destination net unreachable'],cls:'badrow'}])]}]}
 ]};

/* TCP vs UDP – e6 */
const tcNodes=[{id:'F',label:'Feladó (böngésző)',sub:'forrásport 51000',x:100,y:150,w:160},{id:'N',label:'Hálózat',sub:'routerek',x:340,y:150,kind:'sw',w:110},{id:'V',label:'Vevő',sub:'webszerver, port 80',x:580,y:150,w:150}];
const buf=(rows,t)=>({title:t||'Vevő puffere',head:['Sorszám','Ellenőrző összeg','Állapot'],rows});
const tcpSc={title:'TCP és UDP: mi történik a hibás csomaggal?',src:['e6-szallitasi-reteg.html'],h:250,
 intro:'A jegyzet példája: négy csomag indul, a 2. késik, a 3. megsérül útközben. A TCP ezt kijavítja, az UDP nem. (A kapcsolat felépítésével és bontásával a jegyzet sem foglalkozik.)',
 nodes:tcNodes,links:[['F','N'],['N','V']],
 tabs:[{label:'TCP (megbízható)',steps:[
  {text:'A TCP a küldendő adatot csomagokra bontja, <b>sorszámmal</b> és <b>ellenőrző összeggel</b> látja el őket. A cél a 80-as port (http), a forrásport a böngésző véletlen portja.',hl:['F'],tables:[buf([])]},
  {tag:'1. csomag',msg:{from:'F',to:'V',via:['N'],label:'#1  összeg: 42765',at:[340,95]},text:'Az 1. csomag sértetlenül megérkezik: a vevő újraszámolja az összeget, egyezik.',tables:[buf([['1','42765 = 42765','rendben']])]},
  {tag:'2. csomag késik',tagCls:'bad',msg:{from:'F',to:'N',label:'#2 (más útvonalon, lassan)',cls:'evil',at:[220,95]},text:'A 2. csomag más útvonalra kerül és késik. A csomagok útvonala változhat, ezért a sorrend sem garantált.',bad:['N'],tables:[buf([['1','42765 = 42765','rendben'],{c:['2','–','hiányzik'],cls:'badrow'}])]},
  {tag:'3. csomag sérült',tagCls:'bad',msg:[{from:'F',to:'V',via:['N'],label:'#3  összeg: 18200',at:[340,95]},{from:'V',to:'F',via:['N'],label:'kérem újra: #3',side:-1,cls:'evil',at:[340,205]}],text:'A 3. csomag megérkezik, de a számolt összeg eltér a csomagban lévőtől: útközben <b>megsérült</b>. A vevő <b>újraküldést kér</b>.',tables:[buf([['1','42765 = 42765','rendben'],{c:['2','–','hiányzik'],cls:'badrow'},{c:['3','18200 ≠ 18207','sérült'],cls:'badrow'}])]},
  {tag:'Időtúllépés',tagCls:'bad',msg:[{from:'F',to:'V',via:['N'],label:'#4',at:[340,95]},{from:'V',to:'F',via:['N'],label:'kérem újra: #2',side:-1,cls:'evil',at:[340,205]}],text:'A 4. megjön. A 2. adott időn belül sem érkezett meg, ezért a vevő <b>elveszettnek tekinti</b>, és azt is újrakéri.',tables:[buf([['1','42765 = 42765','rendben'],{c:['2','–','elveszett'],cls:'badrow'},{c:['3','18200 ≠ 18207','sérült'],cls:'badrow'},['4','30511 = 30511','rendben']])]},
  {tag:'Újraküldés',tagCls:'good',msg:{from:'F',to:'V',via:['N'],label:'#2 és #3 újra',cls:'ok',at:[340,95]},text:'A feladó újraküldi a 2. és 3. csomagot, most hibátlanul érkeznek.',tables:[buf([['1','42765 = 42765','rendben'],{c:['2','51022 = 51022','rendben (újra)'],cls:'goodrow'},{c:['3','18207 = 18207','rendben (újra)'],cls:'goodrow'},['4','30511 = 30511','rendben']])]},
  {tag:'Duplikátum',msg:{from:'N',to:'V',label:'a késett eredeti #2',at:[460,95]},text:'Végül a késve haladó eredeti 2. csomag is befut, így a vevő <b>kétszer kapja meg</b>. A sorszám alapján felismeri és eldobja a másodpéldányt.',tables:[buf([['1','','rendben'],['2','','rendben'],{c:['2','','duplikátum, eldobva'],cls:'badrow'},['3','','rendben'],['4','','rendben']])]},
  {tag:'Kész',tagCls:'good',text:'A vevő a csomagokat <b>sorszám szerint sorba rakja</b>, és hiánytalanul adja át a 80-as porton figyelő webszervernek. Ezért használja a TCP-t a web, a levelezés és a fájlátvitel.',hl:['V']}]},
 {label:'UDP (gyors, de nem pótol)',steps:[
  {text:'Az UDP összeköttetés-mentes: nincs kapcsolatfelépítés, a csomagokat <b>nem számozza</b>, és az elveszetteket nem pótolja. Ellenőrző összege van.',hl:['F'],tables:[buf([],'Amit az alkalmazás megkap')]},
  {tag:'1. csomag',msg:{from:'F',to:'V',via:['N'],label:'datagram (összeg: 42765)',at:[340,95]},text:'Az első datagram megérkezik, továbbadja az alkalmazásnak.',tables:[buf([['–','42765 = 42765','átadva']],'Amit az alkalmazás megkap')]},
  {tag:'Sérült csomag',tagCls:'bad',msg:{from:'F',to:'V',via:['N'],label:'datagram (sérült)',cls:'evil',at:[340,95]},text:'Egy sérült datagram érkezik: az összeg eltér, ezért a vevő <b>egyszerűen eldobja</b>. Újraküldést nem kér.',tables:[buf([['–','42765 = 42765','átadva'],{c:['–','18200 ≠ 18207','eldobva'],cls:'badrow'}],'Amit az alkalmazás megkap')]},
  {tag:'Késve, más sorrendben',msg:{from:'N',to:'V',label:'késett datagram',at:[460,95]},text:'A késett datagram később, rossz helyen érkezik. Az UDP nem rendezi sorba: az alkalmazásnak kell megoldania, vagy elfogadnia a hiányt.',tables:[buf([['–','','átadva'],{c:['–','','eldobva'],cls:'badrow'},['–','','átadva'],['–','','átadva (később)']],'Amit az alkalmazás megkap')]},
  {tag:'Mire jó?',tagCls:'good',text:'Ahol a gyorsaság fontosabb a teljességnél, vagy egyetlen kis kérdés-válasz a forgalom: <b>DNS</b>, DHCP, hang- és videóátvitel. IP-protokollszáma <code>17</code> (a TCP-é <code>6</code>).'}]}
 ]};

/* DNS – e9 */
const dnNodes=[{id:'PC',label:'Munkaállomás',sub:'cache + hosts',x:80,y:150,w:140},{id:'L',label:'Helyi DNS',sub:'névszerver',x:270,y:150,w:130,kind:'sw'},{id:'G',label:'Gyökér (.)',sub:'root szerver',x:600,y:50,w:140},{id:'H',label:'.hu TLD',sub:'névszerver',x:600,y:150,w:140},{id:'U',label:'uni-nke.hu',sub:'a domain szervere',x:600,y:250,w:140},{id:'T',label:'Támadó',sub:'hamis válaszok',x:270,y:265,w:130,kind:'evil'}];
const dnC=rows=>({title:'Munkaállomás DNS-cache',head:['Név','IP-cím','TTL'],rows});
const dnsSc={title:'DNS-névfeloldás lépésenként',src:['e9-alkalmazasi-reteg.html'],h:310,
 intro:'A jegyzet példája: a böngésző a www.uni-nke.hu oldalt nyitná meg, ehhez kell az IP-cím. A sorrend: cache, hosts fájl, majd a névszerverek.',
 nodes:dnNodes,links:[['PC','L'],['L','G'],['L','H'],['L','U']],
 tabs:[{label:'Normál feloldás',nodes:dnNodes.filter(n=>n.id!=='T'),steps:[
  {text:'A munkaállomásnak szüksége van a <code>www.uni-nke.hu</code> névhez tartozó IP-címre. Előbb a saját <b>cache</b>-ében keres: üres.',hl:['PC'],tables:[dnC([])]},
  {tag:'hosts fájl',text:'Utána a helyi <b>hosts</b> fájlt nézi (Windowson <code>\\windows\\system32\\drivers\\etc\\hosts</code>, Unixon <code>/etc/hosts</code>). Ha ott megvan a név, névszerver nem is kell. Most nincs benne.',hl:['PC'],tables:[{title:'hosts',head:['IP-cím','Név'],rows:[['127.0.0.1','localhost']]}]},
  {tag:'Kérdés a helyi szervernek',msg:{from:'PC',to:'L',label:'www.uni-nke.hu = ?',at:[175,112]},text:'A gép a beállított névszerverhez fordul. Ha az ismeri a választ, rögtön felel; ha nem, továbbkérdez.',hl:['L']},
  {tag:'Gyökér',msg:[{from:'L',to:'G',label:'www.uni-nke.hu = ?',at:[380,62]},{from:'G',to:'L',label:'→ .hu szerver',side:-1,at:[470,118]}],text:'A helyi szerver egy <b>gyökér-névszerverhez</b> fordul. Az nem tudja a címet, de megadja a <code>.hu</code> TLD-ért felelős szerver címét.',hl:['G']},
  {tag:'TLD',msg:[{from:'L',to:'H',label:'www.uni-nke.hu = ?',at:[432,128]},{from:'H',to:'L',label:'→ uni-nke.hu szerver',side:-1,at:[432,176]}],text:'A <code>.hu</code> szerver megadja annak a szervernek a címét, amely az <code>uni-nke.hu</code> alá tartozó nevek adatait tárolja.',hl:['H']},
  {tag:'Hiteles válasz',tagCls:'good',msg:[{from:'L',to:'U',label:'www.uni-nke.hu = ?',at:[470,172]},{from:'U',to:'L',label:'193.224.76.68',side:-1,cls:'ok',at:[400,232]}],text:'Ez a szerver felel a domain adataiért, ezért <b>hiteles (authoritative)</b> választ ad.',hl:['U']},
  {tag:'Cache-be',tagCls:'good',msg:{from:'L',to:'PC',label:'193.224.76.68',cls:'ok',at:[175,112]},text:'A helyi szerver visszaadja a címet. Az operációs rendszer eltárolja a <b>cache</b>-ben (a válasznak is van <b>TTL</b>-je, addig érvényes), és átadja a böngészőnek. Legközelebb nem kell kérdezni.',hl:['PC'],tables:[dnC([{c:['www.uni-nke.hu','193.224.76.68','pl. 3600 s'],cls:'goodrow'}])]}]},
 {label:'Támadás: hosts és hamis válasz',links:[['PC','L'],['L','G'],['L','H'],['L','U'],['T','PC']],steps:[
  {tag:'hosts módosítás',tagCls:'bad',bad:['PC'],text:'A hosts fájl <b>megelőzi</b> a DNS-t. Ha egy kártevő ezt írja bele, a bank neve hamis IP-címre mutat, a böngésző pedig gyanútlanul oda csatlakozik:',tables:[{title:'hosts (módosított)',head:['IP-cím','Név'],rows:[['127.0.0.1','localhost'],{c:['11.11.11.11','www.cib.hu'],cls:'badrow'}]}]},
  {tag:'Hamisított válasz',tagCls:'bad',msg:[{from:'PC',to:'L',label:'www.cib.hu = ?',at:[175,112]},{from:'T',to:'PC',label:'hamis válasz: 11.11.11.11',cls:'evil',side:-1,at:[110,250]}],bad:['T'],text:'A DNS-válaszok viszonylag könnyen <b>hamisíthatók</b>: ha a támadó előbb válaszol, mint a valódi szerver, a gép az ő címét teszi a cache-be.',tables:[dnC([{c:['www.cib.hu','11.11.11.11','…'],cls:'badrow'}])]},
  {tag:'Elgépelt név',tagCls:'bad',text:'Gyakori trükk a hasonló név is: <code>.qov.hu</code> a <code>.gov.hu</code> helyett, vagy egy hiányzó betű a domainben. A tanúsítvány attól még lehet hibátlan, mert a csaló a saját domainjére kérte.'},
  {tag:'Védekezés',tagCls:'good',text:'Figyeljük a címsort és a tanúsítványt, ne futtassunk ismeretlen programot (a hosts módosításához rendszergazdai jog kell), és használjunk megbízható DNS-szervert.'}]}
 ]};

/* VLAN + trunk – gy5 */
const vlNodes=[{id:'S1',label:'S1',sub:'switch',x:205,y:150,kind:'sw',w:96},{id:'S2',label:'S2',sub:'switch',x:475,y:150,kind:'sw',w:96},
 {id:'A',label:'PC .10',sub:'VLAN 10 · fa0/1',x:80,y:60,w:130},{id:'B',label:'PC .11',sub:'VLAN 20 · fa0/2',x:80,y:245,w:130},{id:'C',label:'PC .12',sub:'VLAN 10 · fa0/1',x:600,y:60,w:130},{id:'D',label:'PC .13',sub:'VLAN 20 · fa0/2',x:600,y:245,w:130}];
const vb=(r)=>({title:'S1# show vlan brief',head:['VLAN','Name','Status','Ports'],rows:r||[['1','default','active','fa0/3 … fa0/24'],['10','PUBLIC','active','fa0/1'],['20','OFFICES','active','fa0/2']]});
const vlanSc={title:'VLAN-ok és trunk',src:['gy5-vlans.html','e3-adatkapcsolati-reteg.html'],h:300,
 intro:'A jegyzet trunkos példája: két switch, mindkettőn egy-egy gép a 10-es és a 20-as VLAN-ban. Mind a négy gép a 192.168.1.0/24 hálózatban van, mégsem érik el egymást szabadon.',
 nodes:vlNodes,links:[['A','S1','fa0/1'],['B','S1','fa0/2'],['S1','S2','g0/1 trunk'],['C','S2','fa0/1'],['D','S2','fa0/2']],
 steps:[
  {text:'A VLAN egy switchet (vagy több switchet) <b>logikailag több, egymástól elzárt hálózatra</b> oszt. A portokat parancssorból soroljuk be: <code>switchport access vlan 10</code>.',tables:[vb()]},
  {tag:'Broadcast VLAN-on belül',msg:{from:'A',to:'*',via:['S1','S2'],except:['B','D'],label:'ARP: ki a 192.168.1.12?',at:[340,95]},hl:['A','C'],off:['B','D'],text:'.10 pingelné .12-t, ezért ARP-broadcastot küld. Ez <b>csak a VLAN 10 portjaira</b> jut el: S1 a trunkon átküldi S2-nek, S2 pedig csak a VLAN 10-es portjára. A 20-as VLAN gépei nem is látják.'},
  {tag:'A trunk címkéje',msg:{from:'S1',to:'S2',label:'keret + VLAN ID: 10',at:[340,120]},hl:['S1','S2'],text:'A trunkon a switch a keretbe beírja a <b>VLAN ID</b>-t (802.1Q). Az Ethernet-keretnek külön mezője van erre. S2 ebből tudja, melyik VLAN portjaira adhatja ki. Az access portra a címke nélküli keret megy.'},
  {tag:'Ping működik',tagCls:'good',msg:[{from:'A',to:'C',via:['S1','S2'],label:'ping .12',at:[340,95],cls:'ok'},{from:'D',to:'B',via:['S2','S1'],label:'ping .11 (VLAN 20)',side:-1,cls:'ok',at:[340,205]}],text:'Így a 192.168.1.10 kommunikál a .12-vel, a .11 pedig a .13-mal, ugyanazon az egy trunk kábelen.'},
  {tag:'VLAN-ok között nem',tagCls:'bad',msg:{from:'A',to:'S1',label:'ping .11 → nem jut át',cls:'evil',at:[300,85]},bad:['A'],off:['B'],text:'.10 és .11 ugyanazon a switchen van, sőt azonos IP-hálózatban, mégsem érik el egymást: <b>különböző VLAN-ban</b> vannak. A switch a VLAN 10 keretét nem adja ki a VLAN 20 portjára. (Átjárást csak egy router adhatna.)'},
  {tag:'Miért trunk?',text:'Trunk nélkül minden VLAN-hoz külön kábel kellene a két switch között, ami sok portot foglal. A trunk több VLAN forgalmát viszi, „mint ha azok egyfajta alagutat képeznének”.'+pre('S1(config)# interface g0/1\nS1(config-if)# switchport mode trunk')},
  {tag:'Biztonság: parkoló VLAN',tagCls:'good',text:'A nem használt portokat a jegyzet egy külön, <b>100-as PARK</b> VLAN-ba teszi és lekapcsolja, hogy egy idegen bedugott gép se kerüljön éles VLAN-ba:'+pre('S1(config)# interface range fa0/3-24\nS1(config-if-range)# switchport access vlan 100\nS1(config-if-range)# shutdown'),tables:[vb([['10','PUBLIC','active','fa0/1'],['20','OFFICES','active','fa0/2'],{c:['100','PARK','active','fa0/3 … fa0/24 (shutdown)'],cls:'goodrow'}])]}
 ]};

/* DHCP relay – gy9 */
const rlNodes=[{id:'K',label:'Kliens',sub:'0.0.0.0 → ?',x:80,y:245,w:120},{id:'R2',label:'R2 (relay)',sub:'g0/0 192.168.200.1',x:185,y:110,kind:'sw',w:150},{id:'R1',label:'R1 (DHCP szerver)',sub:'g0/1 192.168.50.1',x:560,y:110,kind:'sw',w:170},{id:'L',label:'Bal LAN',sub:'192.168.100.0/24',x:600,y:245,w:140}];
const bind=rows=>({title:'R1# show ip dhcp binding',head:['IP address','Client-ID / HW address','Type'],rows});
const relaySc={title:'DHCP relay (ip helper-address)',src:['gy9-dhcp.html'],h:290,
 intro:'A jegyzet topológiája: R1 a központi DHCP szerver (pool LEFT és RIGHT), R2 mögött van a 192.168.200.0/24 hálózat. A kettőt a 192.168.50.0/29 köti össze.',
 nodes:rlNodes,links:[['K','R2'],['R2','R1','192.168.50.0/29'],['R1','L']],
 steps:[
  {text:'Az új kliensnek még nincs címe, és nem tudja, hol a DHCP szerver. Ezért <b>broadcastot</b> küld (0.0.0.0 → 255.255.255.255).',hl:['K'],tables:[bind([])]},
  {tag:'Relay nélkül',tagCls:'bad',msg:{from:'K',to:'R2',label:'DHCPDISCOVER (broadcast)',cls:'evil',at:[230,205]},bad:['R2'],text:'A router <b>nem továbbítja a broadcastot</b> más hálózatba. R2 eldobja a kérést, a kliens nem kap címet, és végül 169.254.x.x (APIPA) címet ad magának.'},
  {tag:'ip helper-address',tagCls:'good',text:'Megoldás: R2-n a <b>kliensek felé néző</b> interfészre (g0/0) beállítjuk a DHCP szerver címét:'+pre('R2(config)# interface g0/0\nR2(config-if)# ip helper-address 192.168.50.1'),hl:['R2']},
  {tag:'Továbbítás unicastként',msg:[{from:'K',to:'R2',label:'DISCOVER (broadcast)',at:[230,205]},{from:'R2',to:'R1',label:'DISCOVER → 192.168.50.1 (unicast)',at:[352,62]}],hl:['R2'],text:'R2 a g0/0-n érkező DHCP-kérést <b>unicastként</b> továbbítja a 192.168.50.1 szervernek. A csomagba beírja annak az interfésznek a címét, ahol a kérés érkezett (192.168.200.1). Ebből tudja R1, hogy a RIGHT poolból kell adnia. <span class="sub">(Ez a mező jegyzeten túli részlet.)</span>'},
  {tag:'Ajánlat vissza',msg:[{from:'R1',to:'R2',label:'OFFER: 192.168.200.11',side:-1,at:[352,152]},{from:'R2',to:'K',label:'OFFER',side:-1,at:[200,205]}],hl:['R1'],text:'R1 a RIGHT poolból ajánl címet; R2 visszajuttatja a kliensnek. A REQUEST és az ACK ugyanígy, a relayen át halad (DORA).'},
  {tag:'Kész',tagCls:'good',sub:{K:'192.168.200.11'},msg:{from:'R1',to:'K',via:['R2'],label:'ACK',cls:'ok',side:-1,at:[352,152]},hl:['K'],text:'A kliens megkapta a címét. Az <code>ipconfig /all</code> kimenetében a <b>DHCP Server</b> sora 192.168.50.1, vagyis más hálózatban van, mint a kliens: ebből látszik, hogy relay segített.',tables:[bind([{c:['192.168.200.11','0060.4799.1a2b','Automatic'],cls:'goodrow'}]),{title:'C:\\> ipconfig /all (részlet)',head:['Mező','Érték'],rows:[['IPv4 Address','192.168.200.11'],['Default Gateway','192.168.200.1'],{c:['DHCP Server','192.168.50.1'],cls:'goodrow'}]}]}
 ]};

/* CSMA/CD és CSMA/CA – e3 */
const csNodes=[{id:'A',label:'A gép',sub:'állomás',x:100,y:60,w:140},{id:'B',label:'B gép',sub:'állomás',x:100,y:240,w:140},{id:'H',label:'Hub',sub:'közös csatorna',x:340,y:150,kind:'sw',w:140},{id:'C',label:'C gép',sub:'állomás',x:580,y:60,w:140},{id:'D',label:'D gép',sub:'állomás',x:580,y:240,w:140}];
const csmaSc={title:'Ütközések: CSMA/CD és CSMA/CA',src:['e3-adatkapcsolati-reteg.html'],h:300,
 intro:'Régi, hubos (vagy közös kábeles) hálózatban egyszerre csak egy gép adhat. Ha ketten adnak, az elektromos jelek „összeadódnak”, és mindkét csomag megsérül.',
 nodes:csNodes,links:[['A','H'],['B','H'],['C','H'],['D','H']],
 tabs:[{label:'CSMA/CD (vezetékes)',steps:[
  {tag:'Carrier Sense',text:'Küldés előtt az interfész <b>belehallgat</b> a csatornába: foglalt-e éppen? A csatorna szabad.',hl:['A']},
  {tag:'Adás',msg:{from:'A',to:'*',via:['H'],label:'A → C keret',at:[340,230]},text:'A elküldi a keretet. A hub nem tudja, melyik porton van a címzett, ezért a bejövő kivételével <b>minden portra</b> továbbítja.',hl:['A']},
  {tag:'Ütközés',tagCls:'bad',msg:[{from:'B',to:'H',label:'B ad',cls:'evil',at:[200,230]},{from:'D',to:'H',label:'D ad',cls:'evil',at:[480,230]}],bad:['H'],text:'B és D egyszerre érzékelte szabadnak a csatornát, és egyszerre kezdett adni. A jelek összeadódnak: <b>mindkét keret megsérül</b>.'},
  {tag:'Collision Detection',tagCls:'bad',hl:['B','D'],sub:{B:'vár 2 időegységet',D:'vár 5 időegységet'},text:'Az ütközést <b>mindkét adó érzékeli</b>, abbahagyják, és <b>véletlenszerű ideig</b> várnak. A véletlen azért kell, hogy ne ütközzenek újra pontosan ugyanúgy.'},
  {tag:'Újrapróbálás',tagCls:'good',msg:{from:'B',to:'*',via:['H'],label:'B keret (sikeres)',cls:'ok',at:[340,230]},sub:{D:'foglalt, vár'},text:'B várakozása rövidebb volt, ő ad először. D közben belehallgat, foglaltnak érzékeli a csatornát, és kivárja a végét.'},
  {tag:'Ma már',text:'A mai switchelt, <b>full duplex</b> hálózatokban normál esetben <b>nincs ütközés</b>: minden gépnek saját, kétirányú vonala van a switchig. Ezért a CSMA/CD szerepe ma már csekély.'}]},
 {label:'CSMA/CA (WiFi)',steps:[
  {text:'Rádión az adó nem tudja érzékelni az ütközést, ezért a WiFi <b>elkerüli</b> azt (Collision Avoidance). Itt a középső elem a hozzáférési pont.',sub:{H:'hozzáférési pont'}},
  {tag:'Időablak',msg:{from:'A',to:'H',label:'adás az időablak elején',at:[265,70]},sub:{H:'hozzáférési pont'},text:'Küldeni csak egy <b>időablak elején</b> lehet, és csak annak hosszáig tart.',hl:['A']},
  {tag:'Nyugta',tagCls:'good',msg:{from:'H',to:'A',label:'ACK (nyugta)',side:-1,cls:'ok',at:[220,140]},sub:{H:'hozzáférési pont'},text:'A vevő minden csomag után <b>nyugtát</b> küld.'},
  {tag:'Nincs nyugta',tagCls:'bad',msg:{from:'B',to:'H',label:'csomag elveszett',cls:'evil',at:[220,230]},sub:{H:'hozzáférési pont'},bad:['B'],text:'Ha a nyugta nem érkezik meg, a feladó a csomagot <b>elveszettnek</b> tekinti, és újra elküldi.'}]}
 ]};

/* WiFi + RADIUS – gy10 */
const wfNodes=[{id:'L',label:'Laptop',sub:'kiss.lajos',x:75,y:150,w:120},{id:'AP',label:'WRT300N (AP)',sub:'192.168.1.6',x:300,y:150,w:140,kind:'sw'},{id:'S',label:'AAA szerver',sub:'RADIUS · 192.168.1.5',x:580,y:150,w:170},{id:'T',label:'Idegen',sub:'nincs fiókja',x:75,y:265,w:120,kind:'evil'}];
const usr=r=>({title:'AAA szerver – User Setup',head:['Username','Password'],rows:r});
const wifiSc={title:'Vállalati WiFi: WPA2 + RADIUS (AAA)',src:['gy10-wifi.html'],h:300,
 intro:'Otthon egy közös jelszó (PSK) elég. Cégnél mindenki saját felhasználónevet és jelszót kap, amit egy külső AAA (RADIUS) szerver ellenőriz. A jegyzet Packet Tracer példája alapján.',
 nodes:wfNodes,links:[['L','AP','rádió'],['AP','S','kábel'],['T','AP']],
 steps:[
  {text:'<b>AAA</b> = Authentication (azonosítás), Authorization (jogosultság), Accounting (naplózás). A szerveren bekapcsoljuk az AAA szolgáltatást, és felvesszük a felhasználókat.',hl:['S'],off:['T'],tables:[usr([['kiss.lajos','titok'],['nagy.eva','••••••']])]},
  {tag:'AP mint kliens',text:'A szerver Network Configuration fülén az AP-t <b>kliensként</b> regisztráljuk egy közös titokkal (<code>titkosJelszo</code>), amit az AP-n is megadunk. Így csak ez az AP kérdezhet a szervertől.',hl:['AP','S'],off:['T'],tables:[{title:'AAA szerver – Network Configuration',head:['Client Name','Client IP','Secret','Server Type'],rows:[['AP','192.168.1.6','titkosJelszo','Radius']]}]},
  {tag:'AP beállítás',text:'Az AP-n a Wireless részen <b>WPA2</b> (vállalati mód) kell, helyi jelszó helyett a RADIUS szerver IP-jével és a közös titokkal.',hl:['AP'],off:['T'],tables:[{title:'WRT300N – Wireless Security',head:['Mező','Érték'],rows:[['Security Mode','WPA2 Enterprise'],['RADIUS Server','192.168.1.5'],['Shared Secret','titkosJelszo'],['Encryption','AES']]}]},
  {tag:'Csatlakozás',msg:{from:'L',to:'AP',label:'kiss.lajos / titok',at:[188,100]},off:['T'],hl:['L'],text:'A laptopon WPA2-t választunk, és megadjuk a felhasználónevet és a jelszót.'},
  {tag:'Ellenőrzés',msg:[{from:'AP',to:'S',label:'jó ez a kiss.lajos / titok?',at:[440,100]},{from:'S',to:'AP',label:'Access-Accept',side:-1,cls:'ok',at:[440,200]}],off:['T'],hl:['S'],text:'Az AP <b>maga nem ellenőriz</b>: továbbadja a kérést az AAA szervernek, a közös titokkal védve. A szerver megnézi az adatbázisában: rendben.'},
  {tag:'Bent van',tagCls:'good',msg:{from:'AP',to:'L',label:'csatlakozva (titkosított)',side:-1,cls:'ok',at:[188,200]},off:['T'],hl:['L'],text:'A laptop felcsatlakozik (Packet Tracerben szaggatott vonal jelzi). Ha a dolgozó kilép a cégtől, elég a fiókját törölni, nem kell mindenkinek új WiFi-jelszó.'},
  {tag:'Idegen próbálkozik',tagCls:'bad',msg:[{from:'T',to:'AP',label:'hacker / 123456',cls:'evil',at:[250,265]},{from:'S',to:'AP',label:'Access-Reject',side:-1,cls:'evil',at:[440,200]}],bad:['T'],text:'Ismeretlen fiókkal a szerver elutasítja a kérést, az AP nem engedi be. <span class="sub">(Biztonsági összefoglaló: a WEP elavult, a TKIP nem ajánlott, AES ajánlott.)</span>'}
 ]};

/* Telnet vs SSH – gy4 */
const tsNodes=[{id:'PC',label:'Rendszergazda',sub:'192.168.1.10',x:95,y:110,w:140},{id:'N',label:'Hálózat',sub:'',x:340,y:110,kind:'sw',w:110},{id:'SW',label:'sw-1',sub:'192.168.1.1',x:585,y:110,w:120},{id:'T',label:'Támadó',sub:'Wireshark',x:340,y:250,kind:'evil',w:130}];
const cap=rows=>({title:'A támadó által elkapott forgalom',head:['Irány','Tartalom'],rows});
const telnetSc={title:'Telnet vagy SSH? Lehallgatás élőben',src:['gy4-hozzaferesek-jelszavak.html'],h:300,
 intro:'A Telnet „nem használ titkosítást”, ezért a forgalom lehallgatásával „könnyen megismerhető” a belépéskor begépelt jelszó. Az SSH ugyanezt titkosítva teszi.',
 nodes:tsNodes,links:[['PC','N'],['N','SW'],['N','T','tükrözött / lehallgatott']],
 tabs:[{label:'Telnet',steps:[
  {text:'A rendszergazda Telnettel lép be a switchre (TCP 23-as port).',hl:['PC'],tables:[cap([])]},
  {tag:'Jelszó kérés',msg:[{from:'SW',to:'PC',via:['N'],label:'Password:',side:-1,at:[470,140]}],text:'A switch jelszót kér.',tables:[cap([['sw-1 → PC','User Access Verification  Password:']])]},
  {tag:'Lehallgatva',tagCls:'bad',msg:[{from:'PC',to:'SW',via:['N'],label:'jelszó: cisco',at:[340,60]},{from:'N',to:'T',label:'c i s c o',cls:'evil',at:[260,195]}],bad:['T'],text:'A jelszó <b>olvasható szövegként</b> megy át a hálózaton. Aki látja a forgalmat, betűről betűre kiolvassa.',tables:[cap([['sw-1 → PC','Password:'],{c:['PC → sw-1','c i s c o ⏎'],cls:'badrow'}])]},
  {tag:'Minden látszik',tagCls:'bad',msg:[{from:'PC',to:'SW',via:['N'],label:'enable / show running-config',at:[340,60]},{from:'N',to:'T',label:'teljes konfiguráció',cls:'evil',at:[260,195]}],bad:['T'],text:'A teljes munkamenet is: a kiadott parancsok, az enable jelszó, a konfiguráció. Ezért a Telnet csak védett hálózatban ajánlott.',tables:[cap([{c:['PC → sw-1','c i s c o'],cls:'badrow'},{c:['PC → sw-1','enable / class'],cls:'badrow'},{c:['sw-1 → PC','hostname sw-1 … enable secret 5 …'],cls:'badrow'}])]}]},
 {label:'SSH',steps:[
  {text:'Az SSH-hoz a switchen kulcspár kell. A jegyzet parancsai:'+pre('sw-1(config)# username admin\nsw-1(config)# ip domain-name uni-eszterhazy.hu\nsw-1(config)# crypto key generate rsa   (2048 bit!)\nsw-1(config)# ip ssh version 2\nsw-1(config)# line vty 0 15\nsw-1(config-line)# transport input ssh\nsw-1(config-line)# login'),hl:['SW'],tables:[cap([])]},
  {tag:'Kulcscsere',msg:[{from:'PC',to:'SW',via:['N'],label:'SSH-kapcsolat, kulcscsere (TCP 22)',at:[340,60]},{from:'N',to:'T',label:'?',cls:'evil',at:[260,195]}],text:'A felek a nyilvános kulcs segítségével titkosított csatornát építenek fel, mielőtt bármi érzékeny adat elindulna.',tables:[cap([['PC ↔ sw-1','SSH-2.0 kulcscsere']])]},
  {tag:'Titkosítva',tagCls:'good',msg:[{from:'PC',to:'SW',via:['N'],label:'jelszó (titkosítva)',cls:'ok',at:[340,60]},{from:'N',to:'T',label:'8f3a…c1e9',cls:'evil',at:[260,195]}],text:'A támadó most is látja a csomagokat, de a tartalmuk <b>olvashatatlan</b>.',tables:[cap([['PC ↔ sw-1','SSH-2.0 kulcscsere'],{c:['PC → sw-1','8f3a 77d0 19be … c1e9'],cls:'goodrow'}])]},
  {tag:'Csak SSH',tagCls:'good',text:'A <code>transport input ssh</code> a vty vonalakon <b>letiltja a Telnetet</b>, így véletlenül sem lehet titkosítatlanul belépni. A 512 bites alapkulcs kevés: SSH v2-höz legalább 768, a gyakorlatban 2048 bit ajánlott.'}]}
 ]};

/* ---------- Valódi csomagok a forgatókönyvekhez ---------- */
function att(sc,tab,step,pks){const S=sc.tabs?sc.tabs[tab].steps:sc.steps;const st=S[step];if(!st)return;if(pks&&!Array.isArray(pks)){st.pk=pks.p;st.pkLabel=pks.lab;return}const ms=st.msg?[].concat(st.msg):[];pks.forEach((p,k)=>{if(p&&ms[k])ms[k].pk=p})}
(function(){
const BC='FF:FF:FF:FF:FF:FF',Z='00:00:00:00:00:00',GW='193.225.32.1',AIP='193.225.32.10',SRV='142.251.208.142';
/* ARP */
const ping=(dm,sm,o)=>pk(LY.eth(dm,sm,0x0800,o||{}),LY.ip(AIP,SRV,1,{ttl:128}),LY.icmp(8,0,{id:1,seq:7}),LY.data('Ping adat','abcdefghijklmnopqrstuvwabcdefghi',{short:'ICMP',osi:3,show:'32 bájt (abcdefghijklmnopqrstuvw…)',label:'Adat'}),LY.fcs());
att(arpSc,0,1,[pk(LY.eth(BC,MAC.A,0x0806),LY.arp(1,MAC.A,AIP,Z,GW,{chg:['op','tpa']}),LY.fcs())]);
att(arpSc,0,2,[pk(LY.eth(MAC.A,MAC.R,0x0806),LY.arp(2,MAC.R,GW,MAC.A,AIP,{chg:['op','sha']}),LY.fcs())]);
att(arpSc,0,3,[ping(MAC.R,MAC.A)]);
att(arpSc,0,4,[pk(LY.eth(MAC.A,MAC.T,0x0806),LY.arp(2,MAC.T,GW,MAC.A,AIP,{chg:['sha','spa'],shaNote:'HAMIS: ez a támadó MAC-címe, nem az átjáróé'}),LY.fcs())]);
att(arpSc,0,6,[ping(MAC.T,MAC.A,{chg:['dst']}),ping(MAC.R,MAC.T,{chg:['src']})]);
/* CAM */
const fr=(d,s,o)=>pk(LY.eth(d,s,0x0800,o||{}),LY.raw('Adat (IP-csomag)',Array(24).fill(0).map((_,k)=>(k*37+11)&255),{osi:3,short:'ETH',show:'a switch ebbe bele sem néz'}),LY.fcs());
const P0='0001.96ae.9289',P1='0001.c9c4.2053',P2='000a.4128.5543';
att(camSc,0,1,[fr(P1,P0,{chg:['src']})]);att(camSc,0,2,[fr(P0,P1,{chg:['src']})]);att(camSc,0,3,[fr(P1,P0)]);
att(camSc,0,4,[fr('6ae2.7f2e.2433','3ee6.fe7d.5146',{chg:['src','dst']})]);att(camSc,0,5,[fr(P1,P2)]);
/* DHCP */
const CM='0060.70BD.6739',SM='00D0.BA8E.1A01',TM='AA:BB:CC:66:66:66',S1='192.168.50.1',TIP='192.168.50.66';
const disc=(mac,o)=>pk(LY.eth(BC,mac,0x0800,o||{}),LY.ip('0.0.0.0','255.255.255.255',17,{ttl:128,df:false}),LY.udp(68,67),LY.dhcp(1,Object.assign({mac},o||{})),LY.fcs());
const rep=(t,srcm,srcip,o)=>pk(LY.eth(BC,srcm,0x0800),LY.ip(srcip,'255.255.255.255',17,{ttl:255,df:false}),LY.udp(67,68),LY.dhcp(t,Object.assign({mac:CM,yi:'192.168.50.51',sid:S1,gw:S1,dns:'192.168.50.5'},o||{})),LY.fcs());
att(dhcpSc,0,1,[disc(CM)]);
att(dhcpSc,0,2,[rep(2,SM,S1)]);
att(dhcpSc,0,3,[pk(LY.eth(BC,CM,0x0800),LY.ip('0.0.0.0','255.255.255.255',17,{ttl:128,df:false}),LY.udp(68,67),LY.dhcp(3,{mac:CM,req:'192.168.50.51',sid:S1}),LY.fcs())]);
att(dhcpSc,0,4,[rep(5,SM,S1)]);
att(dhcpSc,1,1,[disc('DE:AD:01:00:00:00',{chg:['mac','src'],macNote:'hamis, minden kérésben más'})]);
att(dhcpSc,1,2,[disc(CM)]);
att(dhcpSc,2,1,[disc(CM)]);
const rogue=rep(2,TM,TIP,{sid:TIP,gw:TIP,dns:TIP,chg:['sid','gw','dns'],gwNote:'a támadó saját magát adja meg'});
att(dhcpSc,2,2,[rogue]);att(dhcpSc,2,3,[rogue]);att(dhcpSc,2,4,[rep(2,SM,S1)]);
/* NAT / PAT */
const seg=(s,sp,d,dp,o)=>pk(LY.ip(s,d,6,{ttl:o&&o.ttl||64,chg:o&&o.ip}),LY.tcp(sp,dp,{flags:o&&o.fl||'SYN',seq:o&&o.seq||1000,ack:o&&o.ack||0,chg:o&&o.tcp}),...(o&&o.http?[LY.data('HTTP','GET / HTTP/1.1\r\nHost: 142.251.208.142\r\n\r\n',{short:'HTTP'})]:[]));
const tW='142.251.208.142',HI='192.168.1.11';
att(natSc,0,0,[seg(HI,40001,tW,80)]);
att(natSc,0,1,[seg('193.225.32.2',40001,tW,80,{ip:['src'],ttl:63})]);
att(natSc,0,2,[seg(tW,28212,'193.225.32.2',40001,{fl:'SYN ACK',seq:5000,ack:1001})]);
att(natSc,0,3,[seg(tW,28212,HI,40001,{fl:'SYN ACK',seq:5000,ack:1001,ip:['dst'],ttl:63})]);
att(natSc,0,4,[seg(tW,28212,'193.225.32.2',3389,{seq:7777})]);
att(natSc,1,0,[seg(HI,40001,tW,80)]);
att(natSc,1,1,[seg('193.225.32.1',62126,tW,80,{ip:['src'],tcp:['sp'],ttl:63})]);
att(natSc,1,2,[seg(tW,28212,'193.225.32.1',62126,{fl:'SYN ACK',seq:5000,ack:1001})]);
att(natSc,1,3,[seg(tW,28212,HI,40001,{fl:'SYN ACK',seq:5000,ack:1001,ip:['dst'],tcp:['dp'],ttl:63})]);
/* Traceroute */
const PCI='192.168.1.10',WI='193.224.76.68';
const echo=(ttl,seq)=>pk(LY.ip(PCI,WI,1,{ttl,chg:['ttl'],ttlNote:'a traceroute ezt állítja 1, 2, 3… értékre'}),LY.icmp(8,0,{id:1,seq}),LY.data('Adat','\0'.repeat(32),{osi:3,short:'ICMP',show:'32 nulla bájt',label:'Adat'}));
const exc=(from,ttl,seq,type)=>{const orig=flat(echo(ttl,seq)).slice(0,28);return pk(LY.ip(from,PCI,1,{ttl:255-(type===0?0:0)}),LY.icmp(type??11,type===3?0:0),LY.raw('Az eldobott csomag eleje',orig,{osi:3,short:'ICMP',show:'eredeti IP-fejléc + 8 bájt',note:'ebből tudja a feladó, melyik kérésére jött a válasz'}))};
att(traceSc,0,1,[echo(1,1),exc('192.168.1.1',1,1)]);
att(traceSc,0,2,[echo(2,2),exc('10.0.0.2',2,2)]);
att(traceSc,0,3,[echo(3,3),exc('10.0.1.2',3,3)]);
att(traceSc,0,4,[echo(4,4),pk(LY.ip(WI,PCI,1,{ttl:61,ttlNote:'64-ről indult, 3 router csökkentette'}),LY.icmp(0,0,{id:1,seq:4}),LY.data('Adat','\0'.repeat(32),{osi:3,short:'ICMP',show:'32 nulla bájt (visszhang)',label:'Adat'}))]);
att(traceSc,1,1,[echo(3,3),exc('10.0.1.2',3,3,3)]);
/* DNS */
const LD='192.168.1.5';
const q=(name,o)=>LY.dns(Object.assign({q:name,id:0x1a2b},o||{}));
att(dnsSc,0,2,[pk(LY.ip(PCI,LD,17,{ttl:128}),LY.udp(51702,53),q('www.uni-nke.hu'))]);
att(dnsSc,0,3,[pk(LY.udp(40117,53),q('www.uni-nke.hu',{id:0x77e1})),pk(LY.udp(53,40117),q('www.uni-nke.hu',{id:0x77e1,resp:true,ns:[{n:'hu',t:'NS',d:'a.hu',ttl:172800,note:'„nem tudom, kérdezd a .hu szerverét”'}]}))]);
att(dnsSc,0,4,[pk(LY.udp(40118,53),q('www.uni-nke.hu',{id:0x77e2})),pk(LY.udp(53,40118),q('www.uni-nke.hu',{id:0x77e2,resp:true,ns:[{n:'uni-nke.hu',t:'NS',d:'ns.uni-nke.hu',ttl:86400}]}))]);
att(dnsSc,0,5,[pk(LY.udp(40119,53),q('www.uni-nke.hu',{id:0x77e3})),pk(LY.udp(53,40119),q('www.uni-nke.hu',{id:0x77e3,resp:true,aa:true,an:[{n:'www.uni-nke.hu',t:'A',d:WI,ttl:3600}]}))]);
att(dnsSc,0,6,[pk(LY.ip(LD,PCI,17,{ttl:64}),LY.udp(53,51702),q('www.uni-nke.hu',{resp:true,an:[{n:'www.uni-nke.hu',t:'A',d:WI,ttl:3600}]}))]);
att(dnsSc,1,1,[pk(LY.ip(PCI,LD,17,{ttl:128}),LY.udp(51800,53),q('www.cib.hu',{id:0x4c4c})),pk(LY.ip(LD,PCI,17,{ttl:64,chg:['src'],}),LY.udp(53,51800),q('www.cib.hu',{id:0x4c4c,resp:true,an:[{n:'www.cib.hu',t:'A',d:'11.11.11.11',ttl:86400,note:'HAMIS cím; a forrás IP is hamisított'}]}))]);
/* VLAN */
const VA='00:0C:29:10:00:0A',VC='00:0C:29:10:00:0C',VB='00:0C:29:20:00:0B',VD='00:0C:29:20:00:0D';
const varp=v=>pk(LY.eth(BC,VA,0x0806,v!=null?{vlan:v}:{}),LY.arp(1,VA,'192.168.1.10',Z,'192.168.1.12'),LY.fcs());
att(vlanSc,0,1,[varp()]);att(vlanSc,0,2,[varp(10)]);
const vp=(dm,sm,s,d,v)=>pk(LY.eth(dm,sm,0x0800,v!=null?{vlan:v}:{}),LY.ip(s,d,1,{ttl:128}),LY.icmp(8,0,{id:1,seq:1}),LY.fcs());
att(vlanSc,0,3,[vp(VC,VA,'192.168.1.10','192.168.1.12'),vp(VB,VD,'192.168.1.13','192.168.1.11')]);
/* DHCP relay */
const KM='0060.4799.1A2B';
const rdisc=pk(LY.eth(BC,KM,0x0800),LY.ip('0.0.0.0','255.255.255.255',17,{ttl:128,df:false}),LY.udp(68,67),LY.dhcp(1,{mac:KM}),LY.fcs());
att(relaySc,0,1,[rdisc]);
att(relaySc,0,3,[rdisc,pk(LY.ip('192.168.50.2','192.168.50.1',17,{ttl:255,chg:['src','dst'],ttlNote:'unicast, routolható'}),LY.udp(67,67,{chg:['sp']}),LY.dhcp(1,{mac:KM,gi:'192.168.200.1',hops:1,chg:['gi','hops']}))]);
att(relaySc,0,4,[pk(LY.ip('192.168.50.1','192.168.200.1',17,{ttl:255}),LY.udp(67,67),LY.dhcp(2,{mac:KM,yi:'192.168.200.11',gi:'192.168.200.1',sid:'192.168.50.1',gw:'192.168.200.1',mask:'255.255.255.0'})),
  pk(LY.eth(BC,'00E0.F7A1.2201',0x0800),LY.ip('192.168.200.1','255.255.255.255',17,{ttl:255,df:false}),LY.udp(67,68),LY.dhcp(2,{mac:KM,yi:'192.168.200.11',gi:'192.168.200.1',sid:'192.168.50.1',gw:'192.168.200.1'}),LY.fcs())]);
att(relaySc,0,5,[pk(LY.ip('192.168.50.1','192.168.200.1',17,{ttl:255}),LY.udp(67,67),LY.dhcp(5,{mac:KM,yi:'192.168.200.11',gi:'192.168.200.1',sid:'192.168.50.1',gw:'192.168.200.1'}))]);
/* CSMA/CD */
const CA='00:1A:2B:00:00:0A',CC='00:1A:2B:00:00:0C',CBm='00:1A:2B:00:00:0B';
const cf=(d,s)=>pk(LY.eth(d,s,0x0800),LY.raw('Adat (IP-csomag)',Array(20).fill(0).map((_,k)=>(k*53+7)&255),{osi:3,short:'ETH',show:'a hub bitenként ismétli, bele sem néz'}),LY.fcs());
att(csmaSc,0,1,[cf(CC,CA)]);att(csmaSc,0,4,[cf(CC,CBm)]);
/* WiFi + RADIUS */
const rq=pk(LY.ip('192.168.1.6','192.168.1.5',17,{ttl:64}),LY.udp(50321,1812),LY.radius(1,{id:42,user:'kiss.lajos'}));
att(wifiSc,0,4,[rq,pk(LY.ip('192.168.1.5','192.168.1.6',17,{ttl:128}),LY.udp(1812,50321),LY.radius(2,{id:42}))]);
att(wifiSc,0,6,[null,pk(LY.ip('192.168.1.5','192.168.1.6',17,{ttl:128}),LY.udp(1812,50322),LY.radius(3,{id:43}))]);
/* Telnet / SSH */
const SWI='192.168.1.1';
const tn=(s,sp,d,dp,txt,o)=>pk(LY.ip(s,d,6,{ttl:o&&o.ttl||255}),LY.tcp(sp,dp,{flags:'PSH ACK',seq:o&&o.seq||3001,ack:o&&o.ack||7001}),LY.data(o&&o.name||'Telnet',txt,Object.assign({short:o&&o.short||'TELNET',chg:true},o||{})));
att(telnetSc,0,1,[tn(SWI,23,PCI,49512,'\r\nUser Access Verification\r\n\r\nPassword: ',{ttl:255})]);
const pw=tn(PCI,49512,SWI,23,'cisco\r\n',{ttl:128,note:'olvasható szöveg; a valóságban betűnként külön szegmensekben megy'});
att(telnetSc,0,2,[pw,pw]);
const en=tn(PCI,49512,SWI,23,'enable\r\nclass\r\nshow running-config\r\n',{ttl:128,seq:3008});
att(telnetSc,0,3,[en,en]);
const ban=pk(LY.ip(PCI,SWI,6,{ttl:128}),LY.tcp(49620,22,{flags:'PSH ACK',seq:1,ack:1}),LY.data('SSH','SSH-2.0-PuTTY_Release_0.81\r\n',{short:'SSH',note:'csak a verziószám olvasható, utána kulcscsere jön'}));
att(telnetSc,1,1,[ban,ban]);
const enc=pk(LY.ip(PCI,SWI,6,{ttl:128}),LY.tcp(49620,22,{flags:'PSH ACK',seq:1290,ack:2210}),LY.raw('SSH (titkosított csomag)',[0x8f,0x3a,0x77,0xd0,0x19,0xbe,0x52,0x04,0xc9,0xe1,0x6b,0x33,0xa8,0x0f,0x7d,0x95,0x2e,0x61,0xb4,0xd8,0x47,0xfa,0x10,0x8c,0x39,0xe7,0x5a,0xc1,0xe9,0x03,0x6f,0xbb],{short:'SSH',chg:true,show:'olvashatatlan bájtok',note:'a jelszó benne van, de a kulcs nélkül nem fejthető meg'}));
att(telnetSc,1,2,[enc,enc]);
})();

/* ---------- OSI-beágyazás: ugyanaz a lejátszó, a csomag rétegenként épül ---------- */
const osiSc=(()=>{
 const PCm='00:14:22:11:0A:F2',GWm='00:1B:44:7A:9C:AA',R2m='00:1B:44:7A:9C:AB',NHm='00:25:9C:3E:11:01';
 const http=o=>LY.data('HTTP-kérés','GET / HTTP/1.1\r\nHost: www.example.com\r\n\r\n',Object.assign({short:'HTTP',show:'GET / HTTP/1.1 · Host: www.example.com'},o||{}));
 const tcp=o=>LY.tcp(40001,80,Object.assign({flags:'PSH ACK',seq:1001,ack:5001},o||{}));
 const ip=o=>LY.ip('192.168.1.11','142.251.208.142',6,Object.assign({ttl:64},o||{}));
 const n=[{id:'PC',label:'Küldő gép',sub:'192.168.1.11',x:90,y:80,w:130},{id:'R',label:'Router',sub:'átjáró',x:340,y:80,w:120,kind:'sw'},{id:'W',label:'Webszerver',sub:'142.251.208.142',x:590,y:80,w:150}];
 return {title:'OSI-beágyazás lépésenként',src:['e1-bevezetes.html','e4-halozati-reteg.html','e6-szallitasi-reteg.html'],h:150,
  intro:'Egy weboldal-kérés útja lefelé a küldő gép rétegein, majd egy routeren át. Minden réteg a saját vezérlőadatait (fejlécét) teszi a kapott adat elé. A jobb oldali boncolóban rétegenként és bájtonként látod a csomagot. A PDU-neveket (szegmens, csomag, keret) a jegyzet nem használja, ezek a szakirodalom szokásos elnevezései.',
  nodes:n,links:[['PC','R'],['R','W']],steps:[
  {tag:'7. Alkalmazási',hl:['PC'],pk:pk(http({chg:true})),pkLabel:'adat',text:'A böngésző HTTP-kérést állít össze: <code>GET / HTTP/1.1, Host: www.example.com</code>. Ez az <b>adat</b>. A boncolóban látszik, hogy ez csak olvasható szöveg, minden betű egy bájt.'},
  {tag:'6. Megjelenítési',hl:['PC'],pk:pk(http()),pkLabel:'adat',text:'Karakterkódolás, tömörítés, titkosítás (HTTPS-nél itt titkosodna). Új fejléc nem kerül rá a TCP/IP gyakorlatban, mert az internet ezeket a rétegeket összevonja.'},
  {tag:'5. Viszony',hl:['PC'],pk:pk(http()),pkLabel:'adat',text:'A kapcsolat kiépítése, fenntartása, lebontása. A TCP/IP-ben ez is az alkalmazás és a TCP feladata, ezért itt sem jön új fejléc.'},
  {tag:'4. Szállítási',hl:['PC'],pk:pk(tcp({chg:true}),http()),pkLabel:'szegmens',text:'A TCP darabol, sorszámoz, ellenőrző összeget számol, és megadja a <b>portokat</b>: a célport (80) választja ki a szerveren a webszerver-alkalmazást. Az eredmény a <b>szegmens</b>: 20 bájt fejléc + az adat.'},
  {tag:'3. Hálózati',hl:['PC'],pk:pk(ip({chg:true}),tcp(),http()),pkLabel:'csomag',text:'Az IP-fejléc a végponti címeket tartalmazza. A <b>Protocol=6</b> jelzi, hogy TCP van benne (UDP: 17, ICMP: 1). A TTL routerenként csökken. Az eredmény a <b>csomag</b>.'},
  {tag:'2. Adatkapcsolati',hl:['PC'],pk:pk(LY.eth(GWm,PCm,0x0800,{chg:true}),ip(),tcp(),http(),LY.fcs()),pkLabel:'keret',text:'A cél más hálózatban van, ezért a keret célja az <b>átjáró MAC-címe</b> (ARP-pal kiderítve), nem a szerveré. A végére ellenőrző összeg (FCS, CRC-32) kerül. Az eredmény a <b>keret</b>.'},
  {tag:'1. Fizikai',msg:{from:'PC',to:'R',label:'bitek a kábelen: 0000 0000 0001 1011 0100 0100 …',at:[215,45],pk:pk(LY.eth(GWm,PCm,0x0800),ip(),tcp(),http(),LY.fcs())},text:'A keret bitjei elektromos, fény- vagy rádiójelként mennek át a kábelen vagy a levegőn. A hex nézet minden cellája 8 bitet jelent.'},
  {tag:'Router: le a keretet',hl:['R'],pk:pk(ip(),tcp(),http()),pkLabel:'a router ezt látja',text:'A router fogadja a keretet, ellenőrzi az FCS-t, majd <b>leveszi az Ethernet-fejlécet</b> (2. réteg). A TCP-be és az adatba nem néz bele.'},
  {tag:'Router: TTL − 1',hl:['R'],pk:pk(ip({ttl:63,chg:['ttl']}),tcp(),http()),pkLabel:'IP-fejléc módosítva',text:'Megnézi az IP-célcímet, a routing táblában kiválasztja a kimenő interfészt, és <b>eggyel csökkenti a TTL-t</b> (64 → 63). Ha 0 lenne, eldobná. A TTL változása miatt a fejléc-ellenőrző összeget is újra kell számolni.'},
  {tag:'Router: új keret',hl:['R','W'],msg:{from:'R',to:'W',label:'új keret, ugyanaz az IP-csomag',at:[465,45],pk:pk(LY.eth(NHm,R2m,0x0800,{chg:true}),ip({ttl:63}),tcp(),http(),LY.fcs())},text:'<b>Új Ethernet-fejlécet</b> tesz rá: forrás a saját kimenő MAC-címe, cél a következő ugrás MAC-címe. Az IP-címek közben változatlanok (NAT nélkül). Hasonlítsd össze a boncolóban az előző kerettel.'}
 ]}})();

const MORE=[
 {id:'trace',title:'Traceroute és TTL',desc:'TTL=1, 2, 3…: így derül ki az útvonal minden routere',run:r=>player(r,traceSc)},
 {id:'tcp',title:'TCP és UDP',desc:'Sorszám, ellenőrző összeg, újraküldés; mit tesz ugyanezzel az UDP',run:r=>player(r,tcpSc)},
 {id:'dns',title:'DNS-névfeloldás',desc:'Cache, hosts, gyökér, .hu, hiteles válasz; hosts-támadás',run:r=>player(r,dnsSc)},
 {id:'vlan',title:'VLAN és trunk',desc:'Broadcast VLAN-on belül, VLAN ID a trunkon, parkoló VLAN',run:r=>player(r,vlanSc)},
 {id:'relay',title:'DHCP relay',desc:'ip helper-address: broadcast helyett unicast a szerverhez',run:r=>player(r,relaySc)},
 {id:'csma',title:'Ütközések: CSMA/CD, CSMA/CA',desc:'Hub, ütközés, véletlen várakozás; WiFi nyugtával',run:r=>player(r,csmaSc)},
 {id:'wifi',title:'WiFi + RADIUS',desc:'WPA2 vállalati mód: az AP az AAA szervertől kérdez',run:r=>player(r,wifiSc)},
 {id:'telnet',title:'Telnet vagy SSH',desc:'A támadó szemével: olvasható jelszó vs titkosított forgalom',run:r=>player(r,telnetSc)}
];

/* ---------- Regiszter ---------- */
const EX=window.EXPL={key:null,list:[
 {id:'subnet',title:'IP-alhálózat számoló',desc:'Bináris ÉS, hálózat, broadcast, tartomány + gyakorló feladatok',run:subnet},
 {id:'osi',title:'OSI-beágyazás lépésenként',desc:'Egy HTTP-kérés fejlécei rétegenként, és mi változik a routeren',run:r=>player(r,osiSc)},
 {id:'arp',title:'ARP és ARP-hamisítás',desc:'Kérés–válasz, mérgezett ARP-tábla, közbeékelődés, védekezés',run:r=>player(r,arpSc)},
 {id:'cam',title:'CAM-tábla túlterhelés',desc:'Tanulás, elárasztás, macof, port-security',run:r=>player(r,camSc)},
 {id:'dhcp',title:'DHCP és támadásai',desc:'DORA, kiéheztetés, csaló szerver, DHCP snooping',run:r=>player(r,dhcpSc)},
 {id:'nat',title:'NAT és PAT lépésenként',desc:'Címcsere, NAT/PAT tábla, visszafordítás',run:r=>player(r,natSc)},
 {id:'acl',title:'ACL-gyakorló',desc:'Első illeszkedés, implicit deny, saját szabályok tesztelése',run:acl},
 {id:'routing',title:'Routing tábla kereső',desc:'show ip route: melyik sor dönt egy adott célcímnél?',run:routing},
 ...MORE
],open(id,root){EX.key=null;const x=EX.list.find(e=>e.id===id);if(x){x.run(root);window.scrollTo(0,0)}}};
document.addEventListener('keydown',e=>{if(!EX.key)return;const t=e.target.tagName;if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT')return;EX.key(e)});
})();
