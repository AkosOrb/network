Object.assign(window.LESSONS=window.LESSONS||{},{
e1:{src:['e1-bevezetes.html'],lead:'Honnan jön az internet, és miért beszélünk rétegekről? Ez a fejezet adja a keretet minden későbbi témához.',
sections:[
{h:'Röviden az internet történetéről',html:`<ul>
<li>Az <b>ARPANET</b> az 1960-as években indult az USA-ban. A cél a hálózat rendelkezésre állásának javítása volt, ezért <b>redundáns</b> adatkapcsolatokra épülő digitális technológiát használt.</li>
<li>A <b>TCP/IP</b>-t az 1970-es évek közepén dolgozták ki. Ez teszi lehetővé a hálózatok összekapcsolását, ma az internet minden gépe ezt használja.</li>
<li>Mérföldkövek: e-mail 1965 óta, internetes nevek 1984-től, a web alapjait Tim Berners-Lee 1989-ben dolgozta ki.</li>
<li>Tipikus szolgáltatások: fájlátvitel (pl. <b>FTP</b>), távoli bejelentkezés (<b>SSH</b>, <b>Remote Desktop</b>).</li>
<li>A mindennapi élet hálózatfüggősége komoly <b>biztonsági kockázat</b>.</li></ul>`},
{h:'Az OSI modell',html:`<p>Az <b>OSI</b> (Open Systems Interconnection) modellt az ISO hozta létre. <b>Ajánlás</b>, nem kötelező. Célja a hálózat moduláris felépítése: a rétegek lecserélhetők, a különböző hálózatok összekapcsolhatók.</p>
<table class="lt"><thead><tr><th>#</th><th>Réteg</th><th>Fő feladat</th></tr></thead><tbody>
<tr><td>7</td><td>Alkalmazási</td><td>a felhasználó programjai (web, e-mail)</td></tr>
<tr><td>6</td><td>Megjelenítési</td><td>adatábrázolás</td></tr>
<tr><td>5</td><td>Viszony</td><td>kapcsolatok kezelése</td></tr>
<tr><td>4</td><td>Szállítási</td><td>darabolás csomagokra, egyes típusoknál nyugtázás</td></tr>
<tr><td>3</td><td>Hálózati</td><td>címzés, útválasztás, forgalomirányítás</td></tr>
<tr><td>2</td><td>Adatkapcsolati</td><td>keretek, MAC-címek, közeghozzáférés</td></tr>
<tr><td>1</td><td>Fizikai</td><td>a nyers bitfolyam továbbítása</td></tr></tbody></table>
<p class="tip"><b>Hasonlat a jegyzetből:</b> a termékszállítás (gyártó, raklap, nagykereskedés, futár). Mindenki csak a saját szintjével foglalkozik, a többit a szomszéd szintekre bízza.</p>
<p>Az internet <b>csak részben</b> követi az OSI modellt, egyes rétegeket összevontak.</p>`},
{anim:'osi',why:'Nézd meg, hogyan kap egy HTTP-kérés rétegenként új fejlécet, és mi változik a routeren.'}
]},
e2:{src:['e2-fizikai-reteg.html'],lead:'A fizikai réteg a biteket viszi át: elektromos jellel, rádióval vagy fénnyel. Itt dől el a kábel, a sebesség és a topológia.',
sections:[
{h:'Bitek a vezetéken',html:`<ul>
<li>Sebesség mértékegysége: <b>bit/s</b>. Mai vezetékes hálózatokon jellemzően 1 Gbit/s.</li>
<li><b>NRZ</b> kódolás: magas szint = 1, alacsony = 0. Egyszerű.</li>
<li><b>Manchester</b> kódolás (Ethernet): a jelváltás <b>iránya</b> a bit: lefutó = 0, felfutó = 1. Bonyolultabb, de segít a hibák kiszűrésében.</li>
<li>A fizikai réteg nem garantálja a hibátlan átvitelt, az ellenőrzés a felsőbb rétegek dolga is.</li></ul>`},
{h:'Átviteli módok',html:`<table class="lt"><thead><tr><th>Mód</th><th>Jelentés</th><th>Példa</th></tr></thead><tbody>
<tr><td>Szimplex</td><td>csak egy irány</td><td>rádióhallgatás</td></tr>
<tr><td>Félduplex</td><td>két irány, de felváltva</td><td>walkie-talkie</td></tr>
<tr><td>Duplex</td><td>két irány egyszerre</td><td>telefon</td></tr></tbody></table>
<p>Az <b>Auto Negotiation</b> révén a két eszköz megegyezik a sebességről és a duplex módról.</p>`},
{h:'Kábelek',html:`<ul>
<li><b>Koax</b>: árnyékolt, középen rézvezeték. Ma főleg kamerák, kábeltévé.</li>
<li><b>UTP</b>: 8 ér, 4 érpár, max. <b>100 m</b>. Cat3 10 Mbit/s, Cat5 100 Mbit/s, Cat5e 1 Gbit/s, Cat6 10 Gbit/s.</li>
<li><b>RJ45</b> bekötés: A és B sorrend (itthon a B terjedt el). Ha a két vég eltér, <b>cross</b> kábel lesz.</li>
<li>A <b>patch</b> kábel puha (aljzat–gép), a <b>fali</b> kábel merev (épületben). Felcserélésük szakmai hiba.</li>
<li><b>Optikai</b> kábel: fényt visz. Multimódusú max. 2 km, monomódusú nagy távolságra (tenger alatti kábelek). Csatlakozók: FC, LC, SC, ST.</li></ul>`},
{h:'Vezeték nélkül és egyéb módok',html:`<ul>
<li><b>Wi-Fi</b> (IEEE 802.11): 2,4 GHz nagyobb hatótáv, zavarérzékenyebb; 5 GHz gyorsabb, kisebb hatótáv; újabban 6 GHz.</li>
<li>802.11a (1999) 54 Mbit/s · 802.11n (2009) 600 Mbit/s · 802.11ac (2013) 3,46 Gbit/s · 802.11ax (2019) 9,6 Gbit/s.</li>
<li>Mobilhálózat (GPRS, EDGE, 3G–5G), <b>Bluetooth</b> (~10 m, 1. osztály ~100 m), <b>NFC</b> (néhány cm), <b>Powerline</b> (villanyhálózaton), <b>Zigbee</b> (okosotthon, alacsony fogyasztás).</li></ul>`},
{h:'Topológiák és méretek',html:`<ul>
<li><b>Busz</b>: egy gerinc, egy szakadás mindenkit megbénít, könnyen lehallgatható.</li>
<li><b>Csillag</b>: központi switch, a lehallgatás nehezebb. <b>Gyűrű</b>: egy szakadás megbénítja. <b>Fa</b>: csillagok fája. <b>Mesh</b>: redundáns, de drága. <b>Hibrid</b>: kevert.</li>
<li>A <b>logikai topológia</b> a csatlakozásokat és IP-címeket mutatja (pl. nyomtató en0, 192.168.1.3 → switch g0/3).</li>
<li>Méret szerint: LAN, MAN, WAN, SMAN (pl. Bluetooth), SOHO (kis iroda, otthon).</li></ul>`},
{h:'Kibervédelem',html:`<ul><li>A kábelezés fizikai támadása a <b>rendelkezésre állást</b> sérti.</li>
<li>Az elektromágneses kisugárzás lehallgatható (<b>Van Eck-phreaking</b>, 1985). Ellene: <b>TEMPEST</b> (NSA, ma NATO-szabvány).</li></ul>`},
{anim:'csma',why:'Duplex és félduplex különbsége a gyakorlatban: mi történik, ha egy közös csatornán ketten adnak egyszerre.'}
]},
e3:{src:['e3-adatkapcsolati-reteg.html'],lead:'Az adatkapcsolati réteg kereteket juttat el egy helyi hálózaton belül, MAC-címek alapján. Itt dolgozik a switch.',
sections:[
{h:'Csomagkapcsolás és CRC',html:`<ul>
<li>Több gép esetén egy hosszú adatfolyam lefoglalná a vonalat, ezért az adatot <b>csomagokra</b> (keretekre) bontják.</li>
<li>Minden keretben van feladó, címzett és ellenőrző rész. A <b>CRC</b>-t a feladó kiszámolja és a végére fűzi, a vevő újraszámolja: eltérés esetén a keret sérült, eldobja.</li>
<li>A <b>protokoll</b> egy kommunikáció szabályainak összessége. A szabványokat <b>RFC</b>-k írják le.</li></ul>`},
{h:'Ethernet és MAC-cím',html:`<ul>
<li>Ethernet = <b>IEEE 802.3</b> (802.3u: 100 Mbit/s, 802.3z: Gigabit, 802.1Q: VLAN, 802.11: Wi-Fi).</li>
<li>Keret mezői: <code>Preamble · Címzett · Feladó · VLAN ID · Típus/Hossz · Adat · CRC</code>. Az adatmező alapból max. 1500 byte.</li>
<li><b>MAC-cím</b>: 6 byte, pl. <code>cc:08:fa:87:c3:9a</code>, Ciscón <code>cc08.fa87.c39a</code>. Az első 3 byte a <b>gyártó</b>.</li>
<li>A gyári cím a <b>BIA</b>, de szoftveresen módosítható. Broadcast: <code>ff:ff:ff:ff:ff:ff</code>. Windowson: <code>ipconfig /all</code> → Physical Address.</li></ul>`},
{h:'Közeghozzáférés: CSMA/CD és CSMA/CA',html:`<ul>
<li><b>CSMA/CD</b> (vezetékes): küldés előtt belehallgat; ütközéskor mindkét adó leáll, és <b>véletlen idő</b> után újrapróbál.</li>
<li><b>CSMA/CA</b> (WiFi): elkerüli az ütközést időablakokkal és <b>nyugtával</b>; nyugta nélkül újraküld.</li>
<li>Switchelt, duplex hálózatban normál esetben <b>nincs ütközés</b>.</li></ul>`},
{anim:'csma',why:'Ütközés, véletlen várakozás és nyugtázás lépésenként.'},
{h:'Eszközök: repeater, hub, switch, híd',html:`<ul>
<li><b>Repeater</b>: analóg erősítő, a zajt is erősíti.</li>
<li><b>Hub</b>: minden keretet minden portra küld; promiscuous módban egy gépről lehallgatható a forgalom.</li>
<li><b>Switch</b>: saját OS-sel, a MAC-cím–port párokat a <b>CAM-táblában</b> tárolja (<code>show mac-address-table</code>). Ismeretlen címzettnél elárasztja a portokat.</li>
<li><b>Híd</b>: eltérő hálózatokat köt össze; az <b>access point</b> a WiFi hídja.</li></ul>`},
{anim:'cam',why:'Hogyan tanul a switch, és mi történik, ha a támadó megtölti a CAM-táblát.'},
{h:'VLAN',html:`<ul><li>A <b>VLAN</b> egy switchet logikailag több hálózatra oszt; a port VLAN-hoz rendelése beállítás kérdése. Alapértelmezett: VLAN 1.</li>
<li>A <b>trunk</b> port több VLAN forgalmát viszi, a VLAN-azonosító a keretben utazik (<b>802.1Q</b>).</li></ul>`},
{anim:'vlan',why:'Broadcast VLAN-on belül, címke a trunkon.'},
{h:'Kibervédelem és a CAM-támadás',html:`<ul>
<li>Lehallgató eszközök: <b>tcpdump</b>, <b>iptraf</b>, <b>Wireshark</b>. A 2. réteg támadásai nehezen védhetők ki.</li>
<li><b>CAM-túlterhelés</b>: hamis MAC-címekkel (<code>macof -n 5</code>) megtöltik a táblát, a switch <b>fail-open</b> módban hubként viselkedik.</li></ul>
<pre class="out">switchport port-security maximum 1
switchport port-security violation shutdown</pre>`}
]},
e4:{src:['e4-halozati-reteg.html'],lead:'A hálózati réteg IP-címekkel juttatja el a csomagot hálózatok között. Itt dolgozik a router, és itt kell számolni a maszkokkal.',
sections:[
{h:'Miért nem elég a MAC-cím?',html:`<ul>
<li>A MAC-cím nem utal a helyre (gyártó:egyedi_cím), régió szerint nem irányítható, és a switchek táblája véges.</li>
<li>A 2. réteg protokolljai csak azonos típusú hálózaton belül működnek.</li>
<li>A 3. réteg csomagja a 2. réteg keretének adatmezőjébe kerül: <b>beágyazás</b> (encapsulation), kibontás (decapsulation). Mint a borítékon a város–utca–házszám.</li></ul>`},
{anim:'osi',why:'A beágyazás lépésenként.'},
{h:'Az IPv4-cím és a csomag',html:`<ul>
<li>4 byte, byte-onként 0–255; elméletben 2³² = 4 294 967 296 cím. (Az IPv6 a címfogyás miatt jött.)</li>
<li>Protokoll mező: TCP = 6, UDP = 17, ICMP = 1.</li>
<li><b>TTL</b>: minden router eggyel csökkenti, 0-nál eldobják. Megakadályozza a végtelen keringést.</li>
<li><code>ipconfig</code>, <code>ping 127.0.0.1</code> (loopback). Két gép azonos IP-vel: mindkettő használhatatlan.</li></ul>`},
{anim:'trace',why:'A TTL a gyakorlatban: így dolgozik a traceroute.'},
{h:'Alhálózat, maszk, egy hálózatban vagyunk?',html:`<ul>
<li>A maszk binárisan balról egyesekkel kezdődik, utána csak nullák. <b>CIDR</b>: <code>/24</code> = 255.255.255.0.</li>
<li>Hálózati cím = <b>IP ÉS maszk</b> (bitenként). Ha két gépnél ez megegyezik, egy hálózatban vannak.</li>
<li>Példa: 192.168.10.11 és 192.168.20.11 /24-gyel külön hálózat, /16-tal egy (192.168.0.0).</li>
<li>A hálózati cím és a broadcast nem adható gépnek. 192.168.10.12/24 → broadcast 192.168.10.255, kiosztható 254 cím.</li></ul>
<table class="lt"><thead><tr><th>Osztály</th><th>Első byte</th><th>Megjegyzés</th></tr></thead><tbody>
<tr><td>A</td><td>1–127</td><td>nagy hálózatok</td></tr><tr><td>B</td><td>128–191</td><td></td></tr><tr><td>C</td><td>192–223</td><td>kis hálózatok</td></tr><tr><td>D</td><td>224–239</td><td>multicast</td></tr></tbody></table>
<p>Privát tartományok (RFC 1918): <code>10.0.0.0/8</code>, <code>172.16.0.0/12</code>, <code>192.168.0.0/16</code>; APIPA: <code>169.254.0.0/16</code>. Ezek az interneten nem routolhatók, a <b>NAT</b> segít ki.</p>
<p class="warn"><b>A jegyzetben eltér:</b> a privát B tartomány ott 172.16.0.0/16, az RFC szerint /12 (172.16–172.31).</p>`},
{anim:'subnet',why:'Számold ki bármely cím hálózati és broadcast címét, bitről bitre.'},
{h:'Átjáró és ARP',html:`<ul>
<li>Azonos alhálózaton a switch kézbesít, másik alhálózatba az <b>alapértelmezett átjáró</b> (router) felé megy a csomag, pl. 193.225.32.1.</li>
<li>Az átjáró MAC-címét az <b>ARP</b> deríti ki: broadcast kérés (<code>FF:FF:FF:FF:FF:FF</code>), unicast válasz.</li>
<li><code>arp -a</code> (tábla), <code>arp -s IP MAC</code> (statikus), <code>arp -d IP</code> (törlés). Típus: dynamic / static.</li>
<li>Hamis ARP-válaszokkal a forgalom átirányítható: <b>ARP poisoning</b>, MITM.</li></ul>`},
{anim:'arp',why:'ARP-kérés, válasz, majd a mérgezés és a közbeékelődés.'},
{h:'Routing tábla',html:`<ul>
<li>A router a célcím alapján keres egyező sort; a <code>0.0.0.0/0</code> (alapértelmezett útvonal) mindenre illeszkedik.</li>
<li>Ha nincs egyező sor és alapértelmezett sem, a csomagot eldobja.</li></ul>
<p class="warn"><b>A jegyzetben eltér:</b> ott „az első egyező sor” dönt; valójában a <b>leghosszabb egyező prefix</b>.</p>`},
{anim:'routing',why:'Írj be célcímet, és nézd meg, melyik sor nyer.'},
{h:'VPN és támadások',html:`<ul>
<li>A <b>VPN</b> titkosított alagút a kliens és a távoli hálózat között. Nem azonos a VLAN-nal. A célszerver a VPN-átjáró címét látja, és a VPN megkerülheti az intézményi tűzfalat.</li>
<li><b>IP spoofing</b>: hamis forráscím (DDoS-nál a válaszok az áldozatra zúdulnak).</li>
<li><b>MITM</b>: a támadó a felek közé áll. Legjobb védekezés: <b>titkosítás</b>.</li></ul>`}
]}
});
