import sys
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:100]); s = s.replace(old, new)

# achievement progress bars clashed with the header's .bar class
rep(".ach .bar, .achtotal .bar { height: 6px;", ".ach .prog, .achtotal .prog { height: 6px;")
rep(".ach .bar i, .achtotal .bar i {", ".ach .prog i, .achtotal .prog i {")
rep(".achtotal .bar { height: 10px; }", ".achtotal .prog { height: 10px; }")
rep('<div class="achtotal"><span id="achCount"></span> unlocked<div class="bar"><i id="achTotal"></i></div></div>', '<div class="achtotal"><span id="achCount"></span> unlocked<div class="prog"><i id="achTotal"></i></div></div>')
rep('<div class="bar"><i style="width:${(p * 100).toFixed(1)}%"></i></div>', '<div class="prog"><i style="width:${(p * 100).toFixed(1)}%"></i></div>')
# in the shed the pop-up sits at the bottom so it doesn't cover Grandad
rep(".toast.hide { opacity: 0; transform: translate(-50%, -10px); }", ".toast.hide { opacity: 0; transform: translate(-50%, -10px); }\n.toast.low { top: auto; bottom: 14px; }")
rep("    toastBusy = true; el.innerHTML = h; el.classList.remove('hide');", "    toastBusy = true; el.innerHTML = h; el.classList.toggle('low', state === 'shed'); el.classList.remove('hide');")
# Colonex stands lower during the Looksmaxxer's stream so the chat doesn't cover him
rep("  function allyPos() { return W < 560 ? { x: 36, y: H * 0.64 } : { x: 60, y: H * 0.5 }; }", "  function allyPos() { return W < 560 ? { x: 36, y: H * 0.64 } : { x: 60, y: H * (chat ? 0.66 : 0.5) }; }")
# a reaction comes from different people
rep("    for (let i = 0; i < n; i++) { const [u, c] = pick(CHAT_USERS); chatPush(u, c, text); }",
    "    const who = CHAT_USERS.slice().sort(() => Math.random() - .5);\n    for (let i = 0; i < n; i++) chatPush(who[i][0], who[i][1], text);")
# test switch: freeze the game loop so screenshots catch an exact frame
rep("  let invincible = false, bot = false; // test switches, only reachable with #debug", "  let invincible = false, bot = false, frozen = false; // test switches, only reachable with #debug")
rep("    if (state === 'play') update(dt);\n", "    if (state === 'play' && !frozen) update(dt);\n")
rep("      inv(on) { invincible = on; },\n", "      inv(on) { invincible = on; },\n      freeze(on) { frozen = on; },\n")
open(p, 'w').write(s)
print('to5d ok')
