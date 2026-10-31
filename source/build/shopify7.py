# Two files for Shopify: the page template (layout and styles) and the game script as a theme asset.
s = open('honey-gobbler-v.html').read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:80]); s = s.replace(old, new)
rep('<meta name="claude:viewport-fit-sides" content="cover">\n', '')
rep('</style>\n\n<div class="app">', '</style>\n{% endraw %}\n</head>\n<body>\n{% raw %}\n<div class="app">')
rep(' target="_blank" rel="noopener"', '', 4)
rep('https://www.janhoney.com/pages/contact', '/pages/contact', 3)
rep('href="https://www.janhoney.com/"', 'href="/"')
a = s.index("  if (location.hash === '#debug') {"); b = s.index("  window.claude?.hot?.snapshot", a)
s = s[:a] + s[b:]
a = s.index('<script>'); b = s.rindex('</script>') + len('</script>')
js = s[a + len('<script>'):b - len('</script>')].strip('\n') + '\n'
import re
build = re.search(r'<title>(.*?)</title>', s).group(1)              # e.g. Honey Gobbler VI
slug = build.lower().replace(' ', '-')                                # honey-gobbler-vi
jsname = slug + '.js'
# The leaderboard: who's logged in, signed with the secret kept in a shop metafield (the Worker has the same secret).
lb = """{%- liquid
  assign hg_api = shop.metafields.gobbler.lb_api.value
  assign hg_secret = shop.metafields.gobbler.lb_secret.value
  assign hg_token = nil
  if customer and hg_secret != blank
    assign hg_ts = 'now' | date: '%s'
    assign hg_msg = customer.id | append: '.' | append: hg_ts
    assign hg_sig = hg_msg | hmac_sha256: hg_secret
    assign hg_token = hg_msg | append: '.' | append: hg_sig
  endif
  assign hg_ret = request.path | url_encode
  assign hg_login = '/customer_authentication/login?return_to=' | append: hg_ret
-%}
<script>window.HG_LB = {% if hg_api != blank %}{ api: {{ hg_api | json }}, token: {{ hg_token | json }}, email: {{ customer.email | json }}, first: {{ customer.first_name | json }}, last: {{ customer.last_name | json }}, login: {{ hg_login | json }} }{% else %}null{% endif %};</script>
"""
tpl = s[:a] + "{% endraw %}\n" + lb + "<script src=\"{{ '" + jsname + "' | asset_url }}\" defer></script>\n{% raw %}" + s[b:]
head = '''{% layout none %}
{% comment %} @@BUILDLINE@@ {% endcomment %}
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>html,body{margin:0}[hidden]{display:none!important}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);box-sizing:border-box}</style>
{% raw %}
'''
tpl = head + tpl + '\n{% endraw %}\n</body>\n</html>\n'
assert '__hg' not in tpl + js and tpl.count('{% raw %}') == tpl.count('{% endraw %}') == 3
import hashlib
tag = build + ' (' + hashlib.sha1(js.encode()).hexdigest()[:6] + ')'
js = js + "window.HG_BUILD = '" + tag + "';\n"
check = '''<script>
window.addEventListener('load', function () { // shows a red bar if this template and the game script come from different builds
  if (window.HG_BUILD === 'TAG') return;
  var d = document.createElement('div');
  d.textContent = 'Wrong game script. This template is TAG and needs the asset JSNAME, but the page loaded ' + (window.HG_BUILD ? window.HG_BUILD : 'an older script or none') + '. Paste the new JSNAME into Assets.';
  d.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:99999;background:#c8102e;color:#fff;font:600 15px/1.4 system-ui,sans-serif;padding:10px 14px;text-align:center';
  document.body.appendChild(d);
});
</script>
'''.replace('TAG', tag).replace('JSNAME', jsname)
tpl = tpl.replace(" defer></script>\n{% raw %}", " defer></script>\n" + check + "{% raw %}", 1)
assert check in tpl
tpl = tpl.replace('@@BUILDLINE@@', tag + ': this template loads the asset ' + jsname)
import os, glob
for f in glob.glob('shopify/*.js'): os.remove(f)
open('shopify/page.honey-gobbler.liquid', 'w').write(tpl)
open('shopify/' + jsname, 'w').write(js)
t = re.sub(r'\{% comment %\}.*?\{% endcomment %\}\n', '', tpl.replace('{% layout none %}\n', '').replace(lb, '')).replace('{% raw %}', '').replace('{% endraw %}', '').replace("{{ '" + jsname + "' | asset_url }}", jsname)
open('t5/shop/index.html', 'w').write(t); open('t5/shop/' + jsname, 'w').write(js)
print(tag, jsname, 'template bytes', len(tpl.encode()), 'script bytes', len(js.encode()))
