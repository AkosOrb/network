# Hálózatok gyakorló

Böngészőben futó tanulóalkalmazás a „Számítógépes hálózatok” tárgyhoz, a [nw.koczka.com](https://nw.koczka.com/) jegyzete alapján: leckék OSI-rétegek szerint, interaktív animációk és kérdésbank (kvíz, kártyák, vizsgaszimuláció).

## Használat

Nyisd meg az `app/index.html` fájlt egy böngészőben. Egyetlen önálló fájl, szerver és telepítés nem kell; a haladás a böngésző localStorage-ában tárolódik.

## Animációk

Az animációk (`app/explainers.js`) hálózati színpadon mutatják a folyamatot:

- eszközikonok, a linkeken utazó, protokoll szerint színezett csomagok;
- kattintható idővonal a lépésekkel, lejátszás/szünet, újrajátszás, 0,5×–2× sebesség, billentyűk (← → szóköz R);
- **csomag-boncoló**: a csomag rétegenként (Ethernet, IP, TCP/UDP, alkalmazás) mezőnként kibontva, és bájtonként hex nézetben. Egy mezőre mutatva kigyúlnak a hozzá tartozó bájtok, a lépésben megváltozott mezők sárgák.

A bájtok valódi kódolással készülnek (hosszak, IP/TCP/UDP/ICMP ellenőrző összegek, Ethernet CRC-32). A jegyzetben nem szereplő MAC-címek és azonosítók példaértékek.

## Felépítés

| Fájl | Tartalom |
|---|---|
| `app/template.html` | felület, stílusok, kvízlogika |
| `app/explainers.js` | animációk, alhálózat-számoló, ACL- és routing-gyakorló |
| `app/lessons/*.js` | leckék szövege |
| `kerdesbank/*.json` | kérdések fejezetenként; `kerdesbank.json` az összefűzött változat |
| `osi_cimkezes.py` | a kérdések OSI-réteg szerinti címkézése |

Módosítás után az `index.html` újraépítése:

```
python3 app/build.py
```
