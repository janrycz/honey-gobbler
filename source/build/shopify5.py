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
head = '''{% layout none %}
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>html,body{margin:0}[hidden]{display:none!important}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);box-sizing:border-box}</style>
{% raw %}
'''
s = head + s + '\n{% endraw %}\n</body>\n</html>\n'
assert '__hg' not in s and 'janhoney.com/' not in s.replace('janhoney.com</a>', '')
open('page.honey-gobbler.liquid', 'w').write(s)
t = s.replace('{% layout none %}\n', '').replace('{% raw %}\n', '').replace('{% endraw %}\n', '')
import os; os.makedirs('t5/shop', exist_ok=True)
open('t5/shop/index.html', 'w').write(t)
print('liquid bytes', len(s), 'raw blocks', s.count('{% raw %}'), s.count('{% endraw %}'))

# Shopify caps Liquid files at 256 KB: strip indentation and whole-line comments from the script and styles
a = s.index('<script>') + len('<script>'); b = s.rindex('</script>')
js = '\n'.join(l.strip() for l in s[a:b].split('\n') if l.strip() and not l.strip().startswith('//'))
s = s[:a] + '\n' + js + '\n' + s[b:]
a = s.index('<style>\n/*'); b = s.index('</style>', a)
css = '\n'.join(l.strip() for l in s[a:b].split('\n') if l.strip())
s = s[:a] + css + '\n' + s[b:]
open('page.honey-gobbler.liquid', 'w').write(s)
t = s.replace('{% layout none %}\n', '').replace('{% raw %}\n', '').replace('{% endraw %}\n', '')
open('t5/shop/index.html', 'w').write(t)
open('build/shop-check.js', 'w').write(t[t.index('<script>') + 8: t.rindex('</script>')])
print('minified liquid bytes', len(s.encode()))
