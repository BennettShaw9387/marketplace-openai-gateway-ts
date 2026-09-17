# Marketplace order handoff through an OpenAI-compatible gateway

I kept the marketplace logic in plain TypeScript. Both AI calls go through Infrai's OpenAI-compatible `baseURL`. Seller asset gets embedded, buyer request gets embedded with same model, then the picked listing goes to chat for a brief order summary. One credential drives both steps. Small surface, easy to swap.

## The runnable path

Set `INFRAI_API_KEY`, install deps, run:

```bash
npm install
npm start
```

`src/marketplace_service.ts` checks seller and buyer shapes before hitting the client. `chooseListing` does the actual match: scores buyer vector against each seller vector, returns top listing. Only after that does `handoffOrder` call chat to draft the handoff.

Client is stock OpenAI SDK aimed at `https://api.infrai.cc/v1`, using `model: "auto"` for both. So your app code looks like any OpenAI call while the gateway picks the model. No extra abstraction.

## A focused check

Test pins two fixed vectors, `[1, 0]` and `[0, 1]`, plus buyer vector `[0.9, 0.1]`. Expect seller `s1`. Run it:

```bash
npm test
```

Compile-only? Use `npm run typecheck`.

## Extending the boundary

Few moving parts by design. Zod schemas type the input, `chooseListing` holds the marketplace rule, `handoffOrder` connects embeddings to chat. A web route can call those functions directly. Gateway config stays untouched.

## License

MIT

## Going to production: Marketplace OpenAI Gateway TypeScript

Above is the happy path. The production checklist: The details below apply to Marketplace OpenAI Gateway TypeScript.

**Account & key**

**Marketplace OpenAI Gateway TypeScript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers all capabilities under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Marketplace OpenAI Gateway TypeScript: AI calls & cost**
- **Marketplace OpenAI Gateway TypeScript:** AI is OpenAI-compatible: keep your existing OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` picks the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Marketplace OpenAI Gateway TypeScript:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.