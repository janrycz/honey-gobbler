import sys
fn=sys.argv[1]
s=open(fn).read()
assert s.count('clearTimeout(lbSyncT); lbSyncT = setTimeout(lbSync, 8000); }')==1
s=s.replace('clearTimeout(lbSyncT); lbSyncT = setTimeout(lbSync, 8000); }','clearTimeout(lbSyncT); lbSyncT = setTimeout(lbSync, 3000); }')
open(fn,'w').write(s)
