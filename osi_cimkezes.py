"""OSI-réteg címke minden kérdéshez. 0 = átfogó (OSI-modell, eszközkezelés), 1..4 = réteg, 7 = 5–7 (alkalmazási rétegek, a jegyzet szerint az internet ezeket összevonja).
Futtatás: finalize.py után. A kerdesbank.json-t módosítja (osi mező)."""
import json,re,collections
P='/mnt/project-files/tanuloapp/kerdesbank.json'
d=json.load(open(P))
DEF={'e1':0,'e2':1,'e3':2,'e4':3,'e5':7,'e6':4,'e8':3,'e9':7,'gy0':7,'gyios':0,'gy5':2,'gy6':3,'gy7':3,'gy9':7,'gy10':2,'gy14':3,'gy15':3}
def txt(q):
    ans=q['o'][q['a']] if q['t']=='mc' else str(q.get('b',''))
    return ' '.join([q['q'],ans])
def tag(q):
    ch=q['ch'];t=txt(q);qq=q['q']
    if ch=='e1':
        if re.search(r'SSH|Remote Desktop|FTP|e-?mail|levelez|web\b',qq,re.I):return 7
        return 0
    if ch=='gyios':
        if re.search(r'Telnet|SSH|vty|transport input|crypto key|RSA|távol',t,re.I):return 7
        return 0
    if ch=='e2':return 1
    if ch=='gy10':
        if re.search(r'GHz|802\.11[a-z]*\b.*(sebess|Mbit|frekv)|frekvenc|hatótáv',t,re.I):return 1
        return 2
    if ch=='e4':
        if re.search(r'MAC-?cím|Ethernet.?cím|switch',qq,re.I) and not re.search(r'ARP',t):return 2
        return 3
    if ch=='e6':
        if re.search(r'ICMP|ping|traceroute|tracert|TTL|Echo',t,re.I):return 3
        return 4
    if ch=='gy14':
        if re.search(r'\beq\b|portszám|\bport\b|\btcp\b|\budp\b|www',t,re.I) and not re.search(r'vty',t):return 4
        return 3
    if ch in('e8','gy15'):
        if re.search(r'FTP|IPSec|streaming|telefon',qq,re.I):return 7
        return 3
    if ch=='e3' and re.search(r'protokoll|RFC|POP3',qq,re.I) and not re.search(r'Ethernet|MAC|keret',qq,re.I):return 0
    if ch in('e9','gy0','e5','gy9') and re.search(r'\bport\b|portszám',qq,re.I) and not re.search(r'DHCP',qq):return 4
    return DEF[ch]
for q in d['kerdesek']:q['osi']=tag(q)
d['meta']['osi_retegek']={'7':'5–7. Alkalmazási rétegek (viszony, megjelenítés, alkalmazás)','4':'4. Szállítási réteg','3':'3. Hálózati réteg','2':'2. Adatkapcsolati réteg','1':'1. Fizikai réteg','0':'Átfogó: OSI-modell és eszközkezelés'}
json.dump(d,open(P,'w'),ensure_ascii=False,indent=0)
c=collections.Counter(q['osi'] for q in d['kerdesek']);print(sorted(c.items()))
cc=collections.defaultdict(collections.Counter)
for q in d['kerdesek']:cc[q['ch']][q['osi']]+=1
for k,v in cc.items():print(k,dict(v))
