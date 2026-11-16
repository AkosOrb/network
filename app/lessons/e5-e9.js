Object.assign(window.LESSONS=window.LESSONS||{},{
e5:{src:['e5-dhcp.html'],lead:'A DHCP osztja ki automatikusan a gépek hálózati beállításait. Kényelmes, de sebezhető: kiéheztethető, és csaló szerver is beállhat.',
sections:[
{h:'Mit oszt ki, és hogyan?',html:`<ul>
<li>Szerepek: <b>DHCP szerver</b> és <b>DHCP kliens</b>.</li>
<li>Kiosztott adatok: IP-cím és maszk (ezek kötelezők), alapértelmezett átjáró, DNS-szerver, kapcsolatspecifikus utótag.</li>
<li>A négy lépés, <b>DORA</b>: DISCOVER (0.0.0.0 → 255.255.255.255, broadcast) · OFFER · REQUEST · ACK.</li>
<li>Az ACK után a kliens ARP-pal ellenőrzi, hogy nem használja-e más a címet.</li>
<li>Statikus címet kapnak a szerverek, gyakran a nyomtatók, AP-k, kamerák. Példa-kiosztás 192.168.22.0/24-re: 1–10 szerverek, 11–20 hálózati eszközök, 51–127 munkaállomások.</li></ul>`},
{anim:'dhcp',why:'A DORA folyamat, majd a két támadás és a DHCP snooping.'},
{h:'Kliens oldal és bérleti idő',html:`<pre class="out">C:\\> ipconfig /all          (Windows: beállítások)
$ ip address list           (Linux: lekérdezés)
$ dhclient -r               (cím visszaadása)
$ dhclient -v               (új cím kérése, részletesen)</pre>
<ul><li>A címet <b>bérleti időre</b> (lease) kapja; lejárat előtt meg kell újítani. Oka: a mobil eszközök szó nélkül távozhatnak.</li>
<li>Jellemző lease: SOHO routeren egy nap–egy hét, étteremben, repülőtéren akár egy óra.</li></ul>`},
{h:'Ha nincs DHCP szerver: APIPA',html:`<ul><li>A kliens a <code>169.254.0.0/16</code> tartományból választ magának címet (APIPA / ad-hoc), ARP-pal ellenőrzi, hogy szabad-e.</li>
<li>Ha egy gépen <b>169.254.x.x</b> címet látsz, a DHCP-kérés <b>sikertelen</b> volt.</li>
<li><b>Fix (statikus) DHCP</b>: MAC–IP összerendelés, pl. <code>28:F0:76:1F:ED:72</code> mindig 192.168.10.20-at kap.</li></ul>`},
{h:'Hátrányok és támadások',html:`<ul>
<li>Hátrányok: a broadcast mindenkit terhel; a naplók rövid ideig élnek, pedig hatósági ügyekben kellene a MAC–IP pár.</li>
<li><b>DHCP starving</b> (kiéheztetés): hamis MAC-címekkel tömeges DISCOVER, a pool kimerül. Eszközök: Yersinia, Hyenae, Dhcpstarv, Gobbler, DHCPig. Védekezés: port-security, statikus kiosztás, <code>ip dhcp snooping limit rate</code>.</li>
<li><b>Csaló DHCP szerver</b>: a kliensek átjáróját vagy DNS-ét a támadóra állítja → <b>MITM</b> vagy csaló oldal.</li></ul>
<pre class="out">Switch(config)# ip dhcp snooping
Switch(config)# interface g0/1
Switch(config-if)# ip dhcp snooping trust</pre>
<p>A nem megbízható portokon a switch eldobja az OFFER és ACK üzeneteket. Ilyet csak elszeparált tesztkörnyezetben szabad kipróbálni.</p>`}
]},
e6:{src:['e6-szallitasi-reteg.html'],lead:'A szállítási réteg viszi el az adatot a megfelelő alkalmazáshoz (port), és dönti el, mennyire megbízható az átvitel: TCP vagy UDP.',
sections:[
{h:'Portok',html:`<ul><li>A port 2 byte-os szám: 0–65535. A TCP és UDP csomagban <b>forrás- és célport</b> is van.</li>
<li>Gyakori portok: 80 http, 443 https, 25 smtp, 143 imap, 993 imaps. Unixon az összerendelés: <code>/etc/services</code>.</li></ul>`},
{h:'TCP: megbízható, összeköttetés-alapú',html:`<ul>
<li>A feladó csomagokra bont, <b>sorszámot</b> és <b>ellenőrző összeget</b> ír beléjük.</li>
<li>Sérült csomag (eltérő összeg) vagy határidőn belül meg nem érkezett csomag esetén a vevő <b>újraküldést</b> kér.</li>
<li>A csomagok útvonala változhat, ezért eltérő sorrendben, sőt duplán is megérkezhetnek; a vevő sorszám szerint rendez.</li>
<li>IP-protokollszáma <b>6</b>. (A kapcsolat felépítésével és bontásával a jegyzet nem foglalkozik.)</li></ul>`},
{h:'UDP: gyors, összeköttetés-mentes',html:`<ul><li>Nincs kapcsolatfelépítés, a csomagokat <b>nem számozza</b>, az elveszetteket nem pótolja.</li>
<li>A hibás csomagot (eltérő ellenőrző összeg) egyszerűen eldobja. IP-protokollszáma <b>17</b>.</li>
<li>Jó oda, ahol a gyorsaság fontosabb, vagy egy kis kérdés-válasz az egész: DNS, DHCP, hang/videó.</li></ul>`},
{anim:'tcp',why:'Ugyanaz a hibás átvitel TCP-vel és UDP-vel.'},
{h:'ICMP, ping, traceroute',html:`<ul><li>Az ICMP hibákat és eseményeket jelez, nem hasznos adatot visz. A ping <b>Echo Request</b>, a válasz <b>Echo Reply</b>.</li>
<li>Kézbesíthetetlen csomagnál az utolsó működő eszköz ICMP hibaüzenetet küld (pl. <i>Destination net unreachable</i>). Az ICMP üzenetek kézbesítése sem garantált.</li>
<li>A <b>traceroute</b> a TTL-t 1-től növeli; ahol 0-ra fogy, az a router válaszol, így kirajzolódik az útvonal.</li></ul>
<p class="warn"><b>A jegyzetben eltér:</b> az ICMP-t itt, a szállítási rétegnél tárgyalja, a szakirodalom a hálózati réteghez sorolja.</p>`},
{anim:'trace',why:'TTL=1, 2, 3… lépésenként.'}
]},
e8:{src:['e7-firewalls.html','e8-nat.html'],lead:'A belső és a külső hálózat határán az átjáró dönt: átengedi-e a csomagot (tűzfal), és milyen címmel küldi tovább (NAT, PAT).',
sections:[
{h:'Tűzfalak (7. fejezet)',html:`<ul><li>A belső hálózat és az internet közti minden csomag áthalad az átjárón; az ott futó szoftver eldöntheti, átengedi-e. Ez a <b>tűzfal</b>.</li>
<li>A jegyzet további témái csak címszavak: port filter, alkalmazás-tűzfal, proxy, DMZ, port forward, tűzfalak kijátszása. A gyakorlati rész a Gy15 (ACL) fejezetben van.</li></ul>`},
{anim:'acl',why:'Csomagszűrés a gyakorlatban: első illeszkedés és implicit deny.'},
{h:'Miért kell címfordítás?',html:`<ul><li>Kevés az IPv4-cím, ezért a belső hálózatok <b>privát</b> címeket kapnak: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.</li>
<li>Ezeket az internetes routerek nem továbbítják, a válasz nem találna vissza. A router ezért <b>kicseréli</b> a címet.</li></ul>
<p class="warn"><b>A jegyzetben eltér:</b> a privát B tartomány ott /16, helyesen /12.</p>`},
{h:'NAT',html:`<ul><li>A router publikus címeket „kölcsönöz” a belső gépeknek. Példa: tartomány 193.225.32.0/28, router 193.225.32.1, kölcsönözhető 193.225.32.2.</li>
<li>Kifelé: 192.168.1.11:40001 → a forráscím 193.225.32.2-re cserélődik. Visszafelé a cél a tábla alapján visszaíródik 192.168.1.11-re.</li>
<li>NAT-tábla mezői: <b>inside local, inside global, outside local, outside global</b>.</li>
<li>Kívülről kezdeményezett kapcsolathoz nincs bejegyzés → a router eldobja. Ez egy kis védelem.</li></ul>`},
{h:'PAT',html:`<ul><li>Egyetlen külső cím, a kapcsolatokat a <b>portszám</b> különbözteti meg. Ha a 40001-es forrásport foglalt, a router szabadot választ (pl. 62126), és ezt jegyzi fel.</li>
<li>Tipikusan SOHO routereken.</li>
<li>Előnyök: címtakarékos, részleges védelem, a belső gépeket nem kell átállítani, ha a publikus tartomány változik.</li>
<li>Hátrányok: erőforrásigény, késleltetés (stream, IP-telefon), gond az IPSec-kel és a passzív FTP-vel.</li></ul>`},
{anim:'nat',why:'A címcsere és a NAT/PAT tábla lépésenként.'}
]},
e9:{src:['e9-alkalmazasi-reteg.html'],lead:'Az alkalmazási réteg a felhasználó szolgáltatásait adja: névfeloldás, e-mail, web, tanúsítványok, proxy, VPN, forgalomelemzés.',
sections:[
{h:'DNS: nevekből címek',html:`<ul><li>Névfeloldás (név → IP) és címfeloldás (IP → név). A szolgáltatás és a protokoll neve is DNS.</li>
<li>Sorrend: saját <b>cache</b> → <b>hosts</b> fájl → beállított névszerver → (gyökér → TLD → SLD).</li>
<li><b>Authoritative</b> válasz: a szerver maga tárolja a rekordot. A válaszok TTL-ig cache-elődnek.</li>
<li>A DNS-szervert a kliensen IP-címmel kell megadni. Hierarchia: TLD (.hu, .gov), SLD (uni-nke.hu). A domain évente megújítandó.</li></ul>
<pre class="out">nslookup www.uni-nke.hu      (Windows)
host www.uni-nke.hu          (Unix; részletesebben: dig)
ipconfig /flushdns           (cache törlése)</pre>
<p>A <b>hosts</b> fájl módosítása (Windows: <code>\\windows\\system32\\drivers\\etc\\hosts</code>, Unix: <code>/etc/hosts</code>) csaló oldalra irányíthat.</p>`},
{anim:'dns',why:'A teljes feloldás lépésenként, és két támadás.'},
{h:'WhoIs és protokollok',html:`<ul><li>A <b>WhoIs</b> megmutatja egy IP-tartomány vagy domain tulajdonosát; incidenskezelésnél ezzel találjuk meg a kapcsolattartót.</li>
<li><b>SMTP</b>: levélküldés · <b>POP3</b>: letöltés · <b>IMAP</b>: postafiók a szerveren · <b>HTTP</b>: web. Az <b>S</b> végződés (HTTPS, SMTPS) titkosított változatot jelent.</li></ul>`},
{h:'Tanúsítványok',html:`<ul><li>Azt igazolják, hogy valóban a kívánt oldalon vagyunk. Nyilvános–titkos kulcspáron alapulnak, egy hitelesítő szervezet (CA) írja alá őket.</li>
<li>A böngésző figyelmeztet, ha idegen az aláírás, nem egyezik a név, vagy lejárt.</li>
<li>Magyar kiadók, akiket a böngészők ismernek: Netlock, Microsec. A Let's Encrypt ingyenes, titkosít, de a <b>tulajdonost nem igazolja</b>.</li>
<li>Vigyázat a megtévesztő nevekre: egy hiányzó betűs domainnek is lehet hibátlan tanúsítványa.</li></ul>`},
{h:'Proxy, VPN, forgalomelemzés',html:`<ul><li><b>Proxy</b>: gyorsítótár (sávszélesség), naplózás (GDPR-kérdés), szűrés név/IP szerint. A böngésző privát módja nem inkognitó: a szolgáltató és a DNS továbbra is lát.</li>
<li><b>VPN</b>: a távoli gép a belső hálózat részeként működik; lehet alkalmazásszintű vagy IP-szintű (IPsec). BYOD-eszközökkel a kártevő is bejuthat.</li>
<li>Elemzés: <b>tcpdump</b>, <b>Wireshark</b>. <b>IDS</b> jelez, <b>IPS</b> blokkol, <b>SIEM</b> (pl. Wazuh) sok eszközt figyel egyszerre, sérülékenységvizsgáló: Nessus, Nexpose.</li></ul>`}
]}
});
