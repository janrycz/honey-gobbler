# Honey Gobbler source

- `honey-gobbler-v.html`: the whole game in one file (the Claude artifact). Open it with `#debug` for the test hooks.
- `build/shopify7.py`: turns it into the Shopify template and game script in `../shopify/` (run from a folder that has `honey-gobbler-v.html`, `shopify/` and `t5/shop/`).
- `build/toNN.py`: the patch scripts that made each change, in order.
- `tests/`: Playwright scripts (dodge bot, boss difficulty, endless, speed routes, leaderboard screens).
- `lbtest/`: Miniflare tests for the leaderboard Worker. They use a made-up test secret, never the real one.
