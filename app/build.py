import json,glob,os
A=os.path.dirname(os.path.abspath(__file__))+'/'
b=json.load(open(A+'../kerdesbank.json',encoding='utf-8'))
s=json.dumps(b,ensure_ascii=False).replace('</','<\\/')
t=open(A+'template.html',encoding='utf-8').read()
e=open(A+'explainers.js',encoding='utf-8').read().replace('</','<\\/')
L='\n'.join(open(f,encoding='utf-8').read() for f in sorted(glob.glob(A+'lessons/*.js'))).replace('</','<\\/')
t=t.replace('__EXPL__',e).replace('__LESSONS__',L)
open(A+'index.html','w',encoding='utf-8').write(t.replace('__BANK__',s))
print('ok',len(s),len(L))
