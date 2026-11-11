import pathlib
d=pathlib.Path(__file__).parent; pub=d.parent/'public'
pub.mkdir(parents=True,exist_ok=True)
js=(d/'app.js').read_text(); base=(d/'base.css').read_text()
HEAD='''<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#F4F6EF"><title>Dieta da Joice</title>
<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="icons/apple-touch-icon.png"><link rel="icon" href="icons/icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="Dieta"><meta name="format-detection" content="telephone=no">
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">'''
REDIR='''<script>try{var q=location.search,sa=navigator.standalone||matchMedia('(display-mode: standalone)').matches;if(q.indexOf('celular')>=0)localStorage.setItem('prefMobile','1');if(q.indexOf('web')>=0)localStorage.removeItem('prefMobile');if(!sa&&innerWidth>=1000&&!localStorage.getItem('prefMobile'))location.replace('web.html');}catch(e){}</script>'''
REDIR_WEB='''<script>try{var q=location.search;if(q.indexOf('web')>=0)localStorage.setItem('prefWeb','1');var w=Math.min(innerWidth||9999,(screen&&screen.width)||9999);if(w<900&&!localStorage.getItem('prefWeb'))location.replace('./'+(q.indexOf('celular')>=0?'?celular=1':''));}catch(e){}</script>'''
for mode,name in (('desktop','web.html'),('mobile','index.html')):
    css=base+(d/f'{mode}.css').read_text()
    extra=REDIR if mode=='mobile' else REDIR_WEB
    html=f'''<!doctype html><html lang="pt-BR"><head>{HEAD}{extra}<style>{css}</style></head><body><div id="app"></div><script>window.APP_MODE="{mode}";</script><script>{js}</script></body></html>'''
    (pub/name).write_text(html)
print('ok')
