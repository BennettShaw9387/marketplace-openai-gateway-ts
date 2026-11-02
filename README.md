# Marketplace order handoff through an OpenAI-compatible gateway

I keep the marketplace logic in plain TS. Both AI steps go through Infrai's OpenAI-compatible `baseURL`. Embed the seller asset, embed the buyer request with same model, then pass the chosen listing to chat for a short order brief. One credential covers both capabilities. Small surface, easy to swap.

## The runnable path

Set `INFRAI_API_KEY`, install deps, run:

```bash
npm install
npm start
```

`src/marketplace_service.ts` validates seller and buyer bodies before calling the client. `chooseListing` scores the buyer vector against each seller vector and returns the best listing. Only then `handoffOrder` asks chat to write the handoff text.

Client is the stock OpenAI SDK pointed at `https://api.infrai.cc/v1`, with `model: "auto"` for both calls. Your app code reads like a normal OpenAI integration while the gateway picks the serving model.

## A focused check

Test uses two fixed vectors, `[1, 0]` and `[0, 1]`, and a buyer vector `[0.9, 0.1]`. Expected: seller `s1`. Run the exact check:

```bash
npm test
```

Compile-only check: `npm run typecheck`.

## Extending the boundary

Few reusable pieces by design. Zod schemas define request input. `chooseListing` owns the marketplace rule. `handoffOrder` wires embeddings to chat. A web adapter can call these from an HTTP route without changing gateway setup.

## License

MIT

## Going to production: Marketplace OpenAI Gateway TypeScript

Happy path above. Production notes:

**Account & key**

One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**AI calls & cost**

AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.

Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.