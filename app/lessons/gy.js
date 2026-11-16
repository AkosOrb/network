Object.assign(window.LESSONS=window.LESSONS||{},{
gy0:{src:['gy0-internet-szolgaltatasok.html'],lead:'A böngésző a legtöbbet használt hálózati program, és rengeteget tud rólunk. Mit tárol, mit árul el, és hogyan védekezzünk?',
sections:[
{h:'Böngészők és bővítmények',html:`<ul><li>Edge, Chrome, Firefox, Opera, Safari. Az első PC-s böngésző a Mosaic (1993).</li>
<li>Az ingyenes böngészők bevétele a keresőkből és az adatgyűjtésből (célzott hirdetések) jön. A szinkronizáció a profilozást minden eszközre kiterjeszti.</li>
<li>A <b>bővítmény</b> lehet rosszindulatú: olvasd el a párbeszédablakot, és rendszeresen töröld a feleslegeseket.</li>
<li>Frissítést csak a gyártó oldaláról vagy az OS frissítőjéből telepíts.</li></ul>`},
{h:'Mit árul el rólunk a böngésző?',html:`<ul><li><b>Címsor-kiegészítés, könyvjelzők</b>: kiderül, hol jártunk (pl. melyik bankot használjuk).</li>
<li><b>Jelszavak</b>: titkosított tárolóban, mesterjelszóval. Őrizetlen gépet zárolj! A böngésző szólhat a kiszivárgott jelszavakról (haveIBeenPwned).</li>
<li><b>Cookie</b>: bejelentkezés, beállítások, kosár. Átmásolva más gépen is működhet, akár bejelentkezett állapottal.</li>
<li><b>Szinkronizálás</b>: előzmények, jelszavak, fizetési adatok. Idegen gépen bejelentkezni súlyos kockázat.</li>
<li><b>Cache</b> és Letöltések mappa: a rendszergazda láthatja, mit töltöttünk le.</li></ul>`},
{h:'Privát mód, proxy, darknet',html:`<ul><li>A <b>privát mód</b> csak helyben nem ment. A munkahely, a szolgáltató és a DNS üzemeltetője továbbra is látja a forgalmat.</li>
<li>A <b>proxy</b> közös gyorsítótár, de üzemeltetője részletes statisztikát készíthet.</li>
<li>A <b>darknet</b> (.onion címek, Tor böngésző) a forgalmat több csomóponton át, titkosítva viszi. A használata a forgalomból kimutatható, ezért gyakran VPN-nel kombinálják.</li></ul>`},
{anim:'dns',why:'Miért látja a DNS üzemeltetője privát módban is, hova mentünk?'}
]},
gyios:{src:['gy1-cisco-startup.html','gy2-packet-tracer.html','gy3-cisco-basic-setup.html','gy4-hozzaferesek-jelszavak.html'],lead:'Az első Cisco-gyakorlatok: konzolos belépés, IOS-módok, alapbeállítás, mentés, jelszavak és SSH.',
sections:[
{h:'Konzol és Packet Tracer',html:`<ul><li>A hálózati eszköznek nincs monitora: az első beállítás a <b>konzol porton</b> megy, konzolkábellel (Ciscón kék) és terminálprogrammal (PuTTY, Tera Term).</li>
<li>Paraméterek: <b>9600 bit/s, 8 adatbit, nincs paritás, 1 stopbit, nincs flow control</b>. macOS-en: <code>screen /dev/tty.usbserial-… 9600</code>.</li>
<li>Az <b>IOS</b> boot közben a RAM-ba töltődik. A futó beállítás is a RAM-ban van, ezért menteni kell.</li>
<li>A konzolos jelszó a jelszó-visszaállítással megkerülhető, ezért az eszközt zárt rackben kell tartani.</li>
<li>A <b>Packet Tracer</b> virtuális labor: eszközök, kábelek (konzol, egyenes), Realtime és Simulation mód; a tesztfájlok a Completion sorban értékelnek.</li></ul>`},
{h:'IOS-módok',html:`<table class="lt"><thead><tr><th>Prompt</th><th>Mód</th><th>Belépés</th><th>Mire jó</th></tr></thead><tbody>
<tr><td><code>Switch&gt;</code></td><td>user</td><td>alapból</td><td>állapot, ping</td></tr>
<tr><td><code>Switch#</code></td><td>privilegizált</td><td><code>enable</code></td><td>show, mentés, <code>reload</code></td></tr>
<tr><td><code>Switch(config)#</code></td><td>globális konfig</td><td><code>configure terminal</code></td><td>beállítások</td></tr>
<tr><td><code>Switch(config-if)#</code></td><td>interfész</td><td><code>interface …</code></td><td>port beállítása</td></tr></tbody></table>
<p><code>exit</code> egy szinttel vissza, <code>end</code> rögtön a # módba. A parancsok rövidíthetők (<code>conf t</code>, <code>sh int br</code>), a Tab kiegészít.</p>`},
{h:'Alapbeállítás és ellenőrzés',html:`<pre class="out">Switch# configure terminal
Switch(config)# hostname S1
S1(config)# interface vlan1
S1(config-if)# ip address 192.168.1.1 255.255.255.0
S1(config-if)# no shutdown
S1(config-if)# end
S1# show ip interface brief
S1# show interface FastEthernet0/1</pre>
<ul><li>A <code>show ip interface brief</code> oszlopai: Interface, IP-Address, OK?, Method, <b>Status</b>, <b>Protocol</b>. Az „administratively down” azt jelenti, hogy ki van kapcsolva (<code>shutdown</code>).</li>
<li>Jelölés: <code>FastEthernet0/1</code> = 0. slot, 1. port; rövidítve <code>F0/1</code>.</li>
<li>Az első ping gyakran <i>Request timed out</i>: közben fut az ARP.</li></ul>`},
{h:'Mentés és konfigurációs fájlok',html:`<pre class="out">S1# copy running-config startup-config     (RAM → NVRAM)
S1# copy running-config tftp:              (biztonsági mentés)
S1# show running-config | section Vlan1
S1# show startup-config
S1# erase startup-config                   (gyári állapot reload után)
S1# reload</pre>
<p>Szűrők a <code>|</code> után: include, begin, exclude, section. Tárhely: <code>dir flash:</code> (IOS), <code>dir nvram:</code> (startup-config).</p>
<p class="tip">Elfelejtett jelszó: switchen Mode gomb + <code>rename flash:config.text flash:config.old</code>; routeren rommon, <code>confreg 0x2142</code>, majd vissza <code>0x2102</code>.</p>`},
{h:'Jelszavak',html:`<ul><li><b>enable password</b>: olvashatóan tárolódik. <b>enable secret</b>: hash-elve, és elsőbbséget élvez.</li>
<li><code>service password-encryption</code>: minden jelszót <b>type 7</b> formára alakít, ez gyengén titkosított, visszafejthető.</li>
<li>Ha nincs enable jelszó, Telnetről nem lehet # módba lépni („% No password set”).</li></ul>`},
{h:'Telnet helyett SSH',html:`<ul><li>A Telnet <b>nem titkosít</b>: a lehallgatott forgalomból kiolvasható a jelszó. Csak védett hálózatban.</li>
<li>Az SSH titkosított. A beállítás:</li></ul>
<pre class="out">username admin
ip domain-name uni-eszterhazy.hu
crypto key generate rsa
ip ssh version 2
line vty 0 15
 transport input ssh
 login</pre>
<p class="warn"><b>A jegyzetben eltér:</b> a példa 512 bites kulcsot generál; SSH v2-höz legalább 768, a gyakorlatban 2048 bit kell.</p>`},
{anim:'telnet',why:'A támadó szemével: ugyanaz a belépés Telnettel és SSH-val.'}
]},
gy5:{src:['gy5-vlans.html'],lead:'Egy switch, több elzárt hálózat: a VLAN-okkal portonként döntjük el, ki kivel beszélhet. A trunk viszi át a VLAN-okat a switchek között.',
sections:[
{h:'VLAN létrehozása és portok',html:`<pre class="out">S1(config)# vlan 10
S1(config-vlan)# name PUBLIC
S1(config)# vlan 20
S1(config-vlan)# name OFFICES
S1(config)# interface fa0/5
S1(config-if)# switchport mode access
S1(config-if)# switchport access vlan 20
S1# show vlan brief</pre>
<ul><li>A jegyzet példája: VLAN 10 (PUBLIC) fa0/1–2, VLAN 20 (OFFICES) fa0/5. Minden gép a 192.168.1.0/24-ben van.</li>
<li>Azonos VLAN-on belül megy a ping, a két VLAN között nem, hiába azonos az IP-hálózat.</li></ul>`},
{h:'Trunk',html:`<ul><li>Két switch között minden VLAN-hoz külön kábel pazarló. A <b>trunk</b> egy kábelen visz több VLAN-t, a keretekbe a VLAN-azonosító kerül (802.1Q).</li></ul>
<pre class="out">S1(config)# interface g0/1
S1(config-if)# switchport mode trunk</pre>
<p>A jegyzet példájában 192.168.1.10 eléri a .12-t (VLAN 10), a .11 a .13-at (VLAN 20), a két switchen át.</p>`},
{anim:'vlan',why:'Broadcast VLAN-on belül, címke a trunkon, és miért nem megy át a ping a VLAN-ok között.'},
{h:'Biztonság: parkoló VLAN',html:`<pre class="out">S1(config)# interface range fa0/2-24
S1(config-if-range)# switchport access vlan 100
S1(config-if-range)# shutdown</pre>
<p>A nem használt portok egy külön, <b>100-as PARK</b> VLAN-ba kerülnek, és le vannak kapcsolva, így egy bedugott idegen gép sem jut az éles hálózatba.</p>`}
]},
gy6:{src:['gy6-ip-utvalasztas.html'],lead:'Routereket kötünk össze: interfészcímek, átjáró a gépeken, statikus és alapértelmezett útvonalak, oda és vissza.',
sections:[
{h:'Egy router, két hálózat',html:`<pre class="out">Router(config)# no ip domain-lookup
Router(config)# hostname R1
R1(config)# interface g0/0
R1(config-if)# ip address 192.168.1.1 255.255.255.0
R1(config-if)# no shutdown
R1(config)# interface g0/1
R1(config-if)# ip address 192.168.2.1 255.255.255.0
R1(config-if)# no shutdown
R1# show ip interface brief
R1# show ip route</pre>
<ul><li>A routing táblában <b>C</b> = közvetlenül csatlakozó hálózat, <b>L</b> = a router saját címe (/32).</li>
<li>A PC-ken be kell állítani az <b>alapértelmezett átjárót</b> (192.168.1.1, illetve 192.168.2.1), különben a másik hálózatba nem jut ki a csomag.</li></ul>`},
{h:'Két router: statikus útvonal',html:`<p>R1: 192.168.100.1/24 és 10.0.0.1/24; R2: 192.168.200.1/24 és 10.0.0.2/24. A 10.0.0.0/24 köti össze őket.</p>
<pre class="out">R1(config)# ip route 192.168.200.0 255.255.255.0 10.0.0.2
R2(config)# ip route 192.168.100.0 255.255.255.0 10.0.0.1</pre>
<ul><li>Szintaxis: <code>ip route &lt;célhálózat&gt; &lt;maszk&gt; &lt;next-hop&gt;</code>. A táblában <b>S</b> jelű sor lesz belőle.</li>
<li>Útvonal nélkül a router „Destination host unreachable” üzenettel válaszol.</li></ul>`},
{h:'Alapértelmezett útvonal és visszaút',html:`<pre class="out">R1(config)# ip route 0.0.0.0 0.0.0.0 172.16.8.1
R2(config)# no ip route 192.168.100.0 255.255.255.0 10.0.0.1
R2(config)# ip route 0.0.0.0 0.0.0.0 10.0.0.1
ISP(config)# ip route 192.168.100.0 255.255.255.0 172.16.8.2
ISP(config)# ip route 192.168.200.0 255.255.255.0 172.16.8.2</pre>
<ul><li>A <code>0.0.0.0/0</code> minden címre illeszkedik: ami máshova nem illik, az erre megy (<b>S*</b>, „Gateway of last resort”).</li>
<li><b>Tanulság:</b> az útnak oda és vissza is működnie kell. Ha az ISP nem tudja, hol a belső hálózat, a válasz elvész.</li></ul>
<p class="warn"><b>A jegyzetben eltér:</b> a next-hop ott 172.168.8.1, helyesen 172.16.8.1.</p>`},
{anim:'routing',why:'A fenti R2 táblája: írj be célcímet, és nézd meg, melyik sor nyer.'},
{h:'Mit árul el a ping?',html:`<ul><li>Az első csomag gyakran elvész (<code>.!!!!</code>): közben az ARP kideríti a következő ugrás MAC-címét.</li>
<li>A <b>TTL</b>-ből a routerek száma: Windows 128-cal indít, ha 126 érkezik, 2 routeren ment át.</li></ul>`},
{anim:'trace',why:'A TTL csökkenése routerenként.'}
]},
gy7:{src:['gy7-ip-gyakorlatok.html'],lead:'A vizsga egyik biztos feladata: adott IP-cím és maszk mellett hálózati cím, broadcast, kiosztható tartomány, alhálózatok száma.',
sections:[
{h:'A módszer',html:`<ol class="steps">
<li>Írd fel a maszkot binárisan: <code>/n</code> = n darab 1-es bit elöl.</li>
<li><b>Hálózati cím</b> = IP <b>ÉS</b> maszk (bitenként).</li>
<li><b>Broadcast</b> = hálózati cím <b>VAGY</b> a maszk inverze (a host-bitek mind 1).</li>
<li>Kiosztható tartomány: hálózati cím + 1 … broadcast − 1. Az átjáró általában az első vagy az utolsó.</li>
<li>Hosztok száma: 2<sup>32−n</sup> − 2.</li>
<li>Alhálózatok száma egy nagyobb hálózatban: 2<sup>(új prefix − régi prefix)</sup>.</li></ol>
<p class="tip"><b>Gyors fejszámolás:</b> a „törött” byte-ban a blokkméret 256 − maszkbyte (pl. /26 → 256−192 = 64). A hálózati cím a cím alatti legnagyobb 64-gyel osztható szám.</p>`},
{h:'Kidolgozott példák a jegyzetből',html:`<table class="lt"><thead><tr><th>Cím</th><th>Hálózat</th><th>Broadcast</th><th>Tartomány</th><th>Alháló /24-ben</th></tr></thead><tbody>
<tr><td>192.100.65.142/25</td><td>192.100.65.128</td><td>192.100.65.255</td><td>.129 – .254</td><td>2</td></tr>
<tr><td>211.157.32.44/26</td><td>211.157.32.0</td><td>211.157.32.63</td><td>.1 – .62</td><td>4</td></tr>
<tr><td>208.31.180.89/30</td><td>208.31.180.88</td><td>208.31.180.91</td><td>.89 – .90 (2 gép)</td><td>64</td></tr></tbody></table>
<ul><li>Gyakori hiba: a broadcast nem „hálózati cím + 1”. A /30-ban csak 2 gép fér el (pont-pont routerkapcsolatokra).</li>
<li>Ellenőrzésre: <code>ipcalc</code>, vagy a lenti számoló.</li></ul>`},
{anim:'subnet',why:'Számoló bitenkénti nézettel, és végtelen gyakorló feladat azonnali ellenőrzéssel.'}
]},
gy9:{src:['gy9-dhcp.html','e5-dhcp.html'],lead:'A routert DHCP szerverré tesszük, majd egy másik hálózat gépeit is kiszolgáljuk relayen át.',
sections:[
{h:'Router mint DHCP szerver',html:`<pre class="out">R1(config)# ip dhcp excluded-address 192.168.100.1 192.168.100.10
R1(config)# ip dhcp pool LEFT
R1(dhcp-config)# network 192.168.100.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.100.1
R1# show ip dhcp binding</pre>
<ul><li>Az <b>excluded-address</b> tartományt nem osztja ki (szervereknek, hálózati eszközöknek). Ezért kapnak a kliensek .11-től címet.</li>
<li>A <code>show ip dhcp binding</code> megmutatja, melyik MAC-cím melyik IP-t kapta.</li></ul>`},
{anim:'dhcp',why:'A DORA folyamat és a DHCP elleni támadások.'},
{h:'DHCP relay',html:`<ul><li>R1 a szerver (pool LEFT a 192.168.100.0/24-nek, RIGHT a 192.168.200.0/24-nek). R2 mögött van a 192.168.200.0/24; a két router között 192.168.50.0/29.</li>
<li>Gond: a kliens <b>broadcastot</b> küld, és a router nem továbbítja a broadcastot másik hálózatba.</li>
<li>Megoldás: R2-n a <b>kliensek felé néző</b> interfészen:</li></ul>
<pre class="out">R2(config)# interface g0/0
R2(config-if)# ip helper-address 192.168.50.1</pre>
<p>R2 a kérést <b>unicastként</b> továbbítja a szervernek, és visszajuttatja a választ. A kliens <code>ipconfig /all</code> kimenetében a DHCP Server = 192.168.50.1, más hálózatban: ebből látszik, hogy relay segített.</p>`},
{anim:'relay',why:'A broadcast elakad, majd az ip helper-address átviszi.'}
]},
gy10:{src:['gy10-wifi.html'],lead:'Vezeték nélküli hálózat beállítása: titkosítás, azonosítás, és vállalati környezetben külső RADIUS szerver.',
sections:[
{h:'Biztonsági alapok',html:`<ul><li><b>Titkosítás</b>: a WEP elavult és feltörhető, a TKIP nem ajánlott, az <b>AES</b> ajánlott.</li>
<li><b>Azonosítás</b>: nyílt, WPA, WPA2, WPA2-<b>PSK</b> (Pre-Shared Key, közös jelszó) vagy vállalati, egyéni fiókos (WPA2 Enterprise).</li>
<li>A WPA2 ismert hibáját a <b>KRACK</b> támadás használja ki.</li></ul>
<p class="warn"><b>A jegyzetben eltér:</b> a PSK-t „PerSonal Key”-nek írja; a szokásos feloldás Pre-Shared Key.</p>`},
{h:'WiFi CSMA/CA-val',html:`<p>Rádión az ütközés nem érzékelhető, ezért a WiFi időablakokkal és <b>nyugtákkal</b> kerüli el (CSMA/CA).</p>`},
{anim:'csma',why:'Válts a CSMA/CA fülre.'},
{h:'Vállalati WiFi: RADIUS (AAA)',html:`<ul><li><b>AAA</b> = Authentication, Authorization, Accounting.</li>
<li>A jegyzet példája: AAA szerver 192.168.1.5, AP (WRT300N) 192.168.1.6, közös titok <code>titkosJelszo</code>, felhasználó <code>kiss.lajos</code> / <code>titok</code>.</li>
<li>Lépések: a szerveren AAA bekapcsolása, az AP felvétele kliensként a közös titokkal, felhasználók felvétele; az AP-n WPA2 a RADIUS szerver címével; a laptopon felhasználónév és jelszó.</li>
<li>Az AP maga nem ellenőriz, a szervertől kérdez. Kilépő dolgozónál elég a fiókját törölni.</li></ul>`},
{anim:'wifi',why:'A belépés útja a laptoptól a RADIUS szerverig és vissza.'}
]},
gy14:{src:['gy14-firewall.html'],lead:'Csomagszűrés Cisco routeren: hozzáférési listák (ACL) írása, interfészre tétele, ellenőrzése.',
sections:[
{h:'Típusok és sorszámok',html:`<ul><li><b>Normál (standard)</b> ACL: 1–99, csak egy címet vizsgál. <b>Kiterjesztett (extended)</b>: 100–199, forrás, cél, protokoll, port.</li>
<li>Nevesített lista: <code>ip access-list standard|extended NÉV</code>.</li>
<li>Két lépés: létrehozás, majd hozzárendelés az interfészhez <code>in</code> vagy <code>out</code> irányban.</li></ul>
<p class="warn"><b>A jegyzetben eltér:</b> ott a normál ACL a célt vizsgálja és 0–99 a sorszáma; a Cisco szerint a <b>forráscímet</b> vizsgálja, és <b>1–99</b>.</p>`},
{h:'Wildcard maszk',html:`<ul><li>A netmaszk inverze: 255.255.255.255 − maszk. Pl. 255.255.255.0 → <code>0.0.0.255</code>.</li>
<li>Egy gép: <code>host 192.168.10.11</code> (= 0.0.0.0). Bármi: <code>any</code> (= 0.0.0.0 255.255.255.255).</li></ul>`},
{h:'Parancsok',html:`<pre class="out">R1(config)# access-list 10 permit 192.168.10.0 0.0.0.255
R1(config)# ip access-list extended KIMENO
R1(config-ext-nacl)# permit tcp 192.168.100.0 0.0.0.255 host 192.168.200.5 eq www
R1(config-ext-nacl)# permit icmp host 192.168.100.12 host 192.168.200.5
R1(config-ext-nacl)# deny ip any any
R1(config)# interface g0/0/1
R1(config-if)# ip access-group KIMENO out
R1# show access-lists
R1(config)# ip access-list standard 10
R1(config-std-nacl)# no 20                 (csak a 20-as sor törlése)</pre>
<ul><li>A <code>show access-lists</code> sorszámokkal mutatja a sorokat (10, 20, …) és a találatokat.</li>
<li>Telnet/SSH korlátozása: a <code>line vty</code> alatt <code>access-class ADMIN-HOST in</code>.</li></ul>`},
{h:'Hogyan dönt a router?',html:`<ul><li>A sorokat <b>felülről lefelé</b> nézi, az <b>első illeszkedő</b> sor dönt, a többit nem vizsgálja.</li>
<li>A lista végén láthatatlan <b>implicit deny any</b> áll: ami semmire nem illik, eldobódik. Egy csak deny sorokból álló lista ezért mindent tilt.</li>
<li>Elhelyezés: a kiterjesztett listát a forráshoz közel, a normált a célhoz közel.</li></ul>
<p class="sub">Az első illeszkedés és az implicit deny a jegyzetben nincs kimondva, ez a Cisco működése; a jegyzet ezért zárja a listákat <code>deny any</code> sorral.</p>`},
{anim:'acl',why:'Szabálylisták és csomagok: próbáld ki, melyik sor dönt.'}
]},
gy15:{src:['gy15-nat.html'],lead:'NAT és PAT beállítása Cisco routeren, és a fordítási tábla értelmezése.',
sections:[
{h:'Belső és külső interfész',html:`<pre class="out">R1(config)# interface g0/0
R1(config-if)# ip address 192.168.1.1 255.255.255.0
R1(config-if)# ip nat inside
R1(config)# interface g0/1
R1(config-if)# ip address 193.225.32.1 255.255.255.0
R1(config-if)# ip nat outside</pre>
<p>Az <code>inside</code>/<code>outside</code> jelölés nélkül a NAT nem működik.</p>`},
{h:'Statikus NAT és PAT',html:`<pre class="out">! statikus: egy belső cím = egy külső cím
R1(config)# ip nat inside source static 192.168.1.11 193.225.32.11

! PAT: sok belső cím = a g0/1 egyetlen címe, portokkal
R1(config)# access-list 1 permit 192.168.1.0 0.0.0.255
R1(config)# ip nat inside source list 1 interface g0/1 overload

R1# show ip nat translations
R1# debug ip nat</pre>
<ul><li>Az ACL jelöli ki, mely belső címek fordíthatók. Az <b>overload</b> kulcsszó jelenti a PAT-ot.</li></ul>`},
{h:'A tábla olvasása',html:`<table class="lt"><thead><tr><th>Oszlop</th><th>Jelentés</th></tr></thead><tbody>
<tr><td>Inside local</td><td>a belső gép saját (privát) címe</td></tr>
<tr><td>Inside global</td><td>a belső gép címe kívülről nézve</td></tr>
<tr><td>Outside local / global</td><td>a külső gép címe (itt azonos)</td></tr></tbody></table>
<ul><li>Statikus NAT-nál egy <code>---</code> protokollú sor mutatja a fix párt.</li>
<li>PAT-nál minden sor a 193.225.32.1-et használja, csak a port más. <code>udp …:53</code> = DNS-kérés, <code>tcp …:80</code> = weboldal.</li></ul>`},
{anim:'nat',why:'Csomagonként: melyik mező íródik át, és mi kerül a táblába.'}
]}
});
