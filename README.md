# Honey Gobbler

Fan arcade game for Ryczkowski Honey (janhoney.com/pages/game).

`shopify/` holds the two files the Shopify theme uses:
- `page.honey-gobbler.liquid` goes in `templates/`
- `honey-gobbler-viii.js` goes in `assets/`

The template names the build it expects and shows a red bar if the script doesn't match.

`shopify/blocks/` and `shopify/templates/` hold the waitlist page's theme files:
- `waitlist-form.liquid`: the waitlist signup form
- `patreon-callout.liquid`: the Patreon call-out under the form (icons built into its stylesheet)
- `page.contact.json`: the waitlist page template that places both
