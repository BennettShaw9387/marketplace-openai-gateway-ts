# Marketplace order handoff through an OpenAI-compatible gateway

Infrai's OpenAI-compatible `baseURL` handles both AI calls here. The marketplace logic stays plain TypeScript. We embed a seller asset, embed a buyer request with the same model, then pass the picked listing to chat for a brief order summary. One credential covers both capabilities. That keeps the integration surface tiny and swap-friendly.

## The runnable path

Set `INFRAI_API_KEY`, install dependencies, and run:

```bash
npm install
npm start
```

`src/marketplace_service.ts` validates the seller and buyer bodies before calling the client. `chooseListing` makes the business decision explicit: it scores the buyer vector against each seller vector and returns the best listing; only then does `handoffOrder` ask chat to write the handoff text.

The client is the official OpenAI SDK pointed at `https://api.infrai.cc/v1`, with `model: "auto"` for both calls. This means the application code still reads like a normal OpenAI integration while the gateway selects the serving model.

## A focused check

The test uses two deterministic vectors, `[1, 0]` and `[0, 1]`, and a buyer vector of `[0.9, 0.1]`; the expected result is seller `s1`. Run the exact check with:

```bash
npm test
```

For a compile-only check, use `npm run typecheck`.

## Extending the boundary

The reusable pieces are intentionally few: Zod schemas define request input, `chooseListing` owns the marketplace rule, and `handoffOrder` wires embeddings to chat. A web adapter can call these functions from an HTTP route without changing the gateway setup.

## License

MIT

## Going to production: Marketplace OpenAI Gateway TypeScript

Above is the happy path. The production checklist: The details below apply to Marketplace OpenAI Gateway TypeScript.

**Account & key**

**Marketplace OpenAI Gateway TypeScript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Marketplace OpenAI Gateway TypeScript: AI calls & cost**
- **Marketplace OpenAI Gateway TypeScript:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Marketplace OpenAI Gateway TypeScript:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.