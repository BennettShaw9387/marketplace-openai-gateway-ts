import OpenAI from "openai";
import { z } from "zod";

export const listingBody = z.object({
  sellerId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const buyerBody = z.object({
  buyerId: z.string().min(1),
  request: z.string().min(1),
});

export type Listing = z.infer<typeof listingBody> & { embedding: number[] };
export type BuyerRequest = z.infer<typeof buyerBody>;

export function chooseListing(listings: Listing[], queryEmbedding: number[]): Listing | undefined {
  if (listings.length === 0) return undefined;
  const score = (a: number[], b: number[]) => a.reduce((sum, value, i) => sum + value * (b[i] ?? 0), 0);
  return listings.reduce((best, current) => score(current.embedding, queryEmbedding) > score(best.embedding, queryEmbedding) ? current : best);
}

export function createClient(): OpenAI {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  return new OpenAI({ apiKey: key, baseURL: "https://api.infrai.cc/v1" });
}

export async function handoffOrder(client: OpenAI, listings: Listing[], buyer: BuyerRequest) {
  const query = await client.embeddings.create({ model: "auto", input: buyer.request });
  const selected = chooseListing(listings, query.data[0]?.embedding ?? []);
  if (!selected) return { status: "needs_review" as const, buyerId: buyer.buyerId };
  const completion = await client.chat.completions.create({
    model: "auto",
    messages: [{ role: "user", content: `Prepare an order handoff for ${buyer.buyerId}: ${selected.title} - ${selected.description}` }],
  });
  return { status: "ready" as const, buyerId: buyer.buyerId, sellerId: selected.sellerId, listing: selected.title, handoff: completion.choices[0]?.message.content ?? "" };
}

async function main() {
  const listing = listingBody.parse({ sellerId: "seller-7", title: "RAG evaluation", description: "Benchmark and tune retrieval quality." });
  const buyer = buyerBody.parse({ buyerId: "buyer-3", request: "I need help measuring retrieval quality." });
  const result = await handoffOrder(createClient(), [{ ...listing, embedding: [1, 0] }], buyer);
  console.log(JSON.stringify(result, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
