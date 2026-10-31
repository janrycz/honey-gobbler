import sys
p = sys.argv[1]
s = open(p).read()
fn = open('buzz/buzzfn.js').read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:100]); s = s.replace(old, new)
def between(start, end, new):
    global s
    a = s.index(start); b = s.index(end, a); s = s[:a] + new + s[b:]
between('  // The queen\'s roar, rendered once', '  const seq = (notes', """  // The queen's buzz, rendered once into a buffer: a loud, deep wing buzz (two slightly detuned voices, a sub-octave,
  // a click on every wing stroke and some fuzz) that climbs as she charges in and drops as she flies past.
  let buzzBuf = null, lastBuzz = null;
  function prepBuzz() { if (ac && !buzzBuf) { const d = buildBuzz(ac.sampleRate); buzzBuf = ac.createBuffer(1, d.length, ac.sampleRate); buzzBuf.getChannelData(0).set(d); } }
""" + fn)
between('    roar: () => {', '    pour: n =>', """    buzz: () => { // the queen's buzz (see buildBuzz), pitched a little differently each time
      if (!ac || muted) return;
      prepBuzz();
      if (lastBuzz) { try { lastBuzz.g.gain.setTargetAtTime(0, ac.currentTime, 0.04); lastBuzz.s.stop(ac.currentTime + 0.2); } catch (e) {} }
      const src = ac.createBufferSource(), g = ac.createGain();
      src.buffer = buzzBuf; src.playbackRate.value = rnd(0.95, 1.05); g.gain.value = 0.8;
      src.connect(g).connect(ac.destination); src.start();
      lastBuzz = { s: src, g };
    },
""")
rep("A huge queen bee who roars and charges at the boss.", "A huge queen bee who buzzes in and charges at the boss.")
rep("  // In a boss fight: a warning line, a roar, then a charge through the boss, once per charge.\n  // Otherwise she sweeps across the screen: honey in her path flies into your spoon and fakes get smashed.\n",
    "  // A warning line, a loud buzz, then a charge through the boss, once per charge.\n")
rep("// 'tele': the warning line, then the roar", "// 'tele': the warning line, then the buzz")
rep("      sfx.roar();", "      sfx.buzz();")
rep("    setTimeout(prepRoar, 200);", "    setTimeout(prepBuzz, 200);")
assert 'roar' not in s.lower().replace('roaring', ''), [l for l in s.split('\n') if 'roar' in l.lower()][:5]
open(p, 'w').write(s)
print('ok')
