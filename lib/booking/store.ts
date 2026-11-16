import "server-only";

/**
 * The slot ledger — the one thing that makes a double booking impossible.
 *
 * Time is cut into 15-minute blocks and every booking claims each block it
 * covers. The claim is a single atomic operation: either every block is free
 * and all of them become this booking's, or none of them are touched. Two
 * people pressing "Book" on the same time in the same millisecond, on two
 * different servers, get one booking and one "that time was just taken".
 *
 * Blocks rather than whole slots so the guarantee survives a change of
 * schedule: if tours go from 60 minutes to 45 later, a new 10:45 booking
 * still collides with an old 10:00–11:00 one, because they share blocks.
 *
 * The ledger also holds one booking per phone number at a time, so a single
 * visitor (or a bot) cannot fill the calendar.
 *
 * Where it lives:
 *   - Redis over REST (Upstash, or Vercel's Redis / KV integration). Set
 *     `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`, or the
 *     `KV_REST_API_URL` + `KV_REST_API_TOKEN` pair Vercel injects. This is the
 *     production store: it is shared by every server instance.
 *   - In memory, only when `TOUR_BOOKING_STORE=memory` — safe on ONE
 *     long-running Node server and nowhere else (not on Vercel).
 *   - Otherwise, nothing. The ledger is OPTIONAL: without it, bookings rely
 *     on GHL alone and the read-back in `actions.ts` (step 5), which still
 *     never lets two overlap — it just can't stop two visitors in the same
 *     second from both being asked to pick again.
 */

export const BLOCK_MS = 15 * 60_000;

const PREFIX = process.env.TOUR_STORE_PREFIX || "westgate:tours";
const blockKey = (t: number) => `${PREFIX}:block:${t}`;
const phoneKey = (digits: string) => `${PREFIX}:phone:${digits}`;
const ipKey = (ip: string) => `${PREFIX}:ip:${ip}`;

export function blocksFor(start: number, end: number) {
  const first = Math.floor(start / BLOCK_MS) * BLOCK_MS;
  const out: number[] = [];
  for (let t = first; t < end; t += BLOCK_MS) out.push(t);
  return out;
}

export type ClaimResult =
  | { ok: true; repeat: boolean }
  | { ok: false; reason: "slot-taken" }
  | { ok: false; reason: "phone-has-booking"; existing: string };

export interface SlotStore {
  readonly kind: "redis" | "memory";
  /** Which of these block starts are held. */
  heldBlocks(blocks: number[]): Promise<Set<number>>;
  /** Atomically claim every block plus the phone number, or nothing. */
  claim(input: { blocks: number[]; phone: string; holder: string; ttlMs: number }): Promise<ClaimResult>;
  /** Give back what `holder` claimed — and only if it is still `holder`'s. */
  release(input: { blocks: number[]; phone: string; holder: string }): Promise<void>;
  /** Count one booking attempt from `ip`; returns attempts in the last day. */
  countAttempt(ip: string): Promise<number>;
}

/* ------------------------------------------------------------------ *
 * Redis (REST)
 * ------------------------------------------------------------------ */

/* KEYS[1] is the phone, KEYS[2..] the blocks. ARGV[1] the holder, ARGV[2]
   the ttl in ms. Redis runs a script start to finish with nothing in between,
   which is what makes check-then-set one step. */
const CLAIM_SCRIPT = `
local holder = ARGV[1]
local ttl = tonumber(ARGV[2])
local repeatClaim = true
local p = redis.call('GET', KEYS[1])
if p and p ~= holder then return {-1, p} end
if not p then repeatClaim = false end
for i = 2, #KEYS do
  local v = redis.call('GET', KEYS[i])
  if v and v ~= holder then return {-2, ''} end
  if not v then repeatClaim = false end
end
if repeatClaim then return {2, ''} end
for i = 1, #KEYS do redis.call('SET', KEYS[i], holder, 'PX', ttl) end
return {1, ''}
`;

const RELEASE_SCRIPT = `
for i = 1, #KEYS do
  if redis.call('GET', KEYS[i]) == ARGV[1] then redis.call('DEL', KEYS[i]) end
end
return 1
`;

const COUNT_SCRIPT = `
local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
return n
`;

class RedisStore implements SlotStore {
  readonly kind = "redis" as const;
  constructor(
    private url: string,
    private token: string,
  ) {}

  private async cmd<T>(command: (string | number)[]): Promise<T> {
    const res = await fetch(this.url, {
      method: "POST",
      headers: { authorization: `Bearer ${this.token}`, "content-type": "application/json" },
      body: JSON.stringify(command),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const body = (await res.json().catch(() => ({}))) as { result?: T; error?: string };
    if (!res.ok || body.error) {
      throw new Error(`redis ${command[0]} failed: ${res.status} ${body.error ?? ""}`);
    }
    return body.result as T;
  }

  async heldBlocks(blocks: number[]) {
    if (blocks.length === 0) return new Set<number>();
    const values = await this.cmd<(string | null)[]>(["MGET", ...blocks.map(blockKey)]);
    return new Set(blocks.filter((_, i) => values[i] != null));
  }

  async claim({ blocks, phone, holder, ttlMs }: Parameters<SlotStore["claim"]>[0]) {
    const keys = [phoneKey(phone), ...blocks.map(blockKey)];
    const [code, existing] = await this.cmd<[number, string]>([
      "EVAL",
      CLAIM_SCRIPT,
      keys.length,
      ...keys,
      holder,
      Math.max(60_000, Math.round(ttlMs)),
    ]);
    if (code === 1) return { ok: true, repeat: false } as const;
    if (code === 2) return { ok: true, repeat: true } as const;
    if (code === -1) return { ok: false, reason: "phone-has-booking", existing } as const;
    return { ok: false, reason: "slot-taken" } as const;
  }

  async release({ blocks, phone, holder }: Parameters<SlotStore["release"]>[0]) {
    const keys = [phoneKey(phone), ...blocks.map(blockKey)];
    await this.cmd(["EVAL", RELEASE_SCRIPT, keys.length, ...keys, holder]);
  }

  async countAttempt(ip: string) {
    return this.cmd<number>(["EVAL", COUNT_SCRIPT, 1, ipKey(ip), 86_400_000]);
  }
}

/* ------------------------------------------------------------------ *
 * Memory — one process only
 * ------------------------------------------------------------------ */

class MemoryStore implements SlotStore {
  readonly kind = "memory" as const;
  private data = new Map<string, { value: string; expires: number }>();

  private get(key: string) {
    const hit = this.data.get(key);
    if (!hit) return null;
    if (hit.expires <= Date.now()) {
      this.data.delete(key);
      return null;
    }
    return hit.value;
  }

  async heldBlocks(blocks: number[]) {
    return new Set(blocks.filter((b) => this.get(blockKey(b)) != null));
  }

  /* No `await` between the check and the set: JavaScript runs this whole
     body before any other request's code, which is this store's atomicity. */
  async claim({ blocks, phone, holder, ttlMs }: Parameters<SlotStore["claim"]>[0]) {
    const keys = [phoneKey(phone), ...blocks.map(blockKey)];
    const p = this.get(keys[0]);
    if (p && p !== holder) return { ok: false, reason: "phone-has-booking", existing: p } as const;
    let repeat = p === holder;
    for (const k of keys.slice(1)) {
      const v = this.get(k);
      if (v && v !== holder) return { ok: false, reason: "slot-taken" } as const;
      if (!v) repeat = false;
    }
    if (repeat) return { ok: true, repeat: true } as const;
    const expires = Date.now() + Math.max(60_000, ttlMs);
    for (const k of keys) this.data.set(k, { value: holder, expires });
    return { ok: true, repeat: false } as const;
  }

  async release({ blocks, phone, holder }: Parameters<SlotStore["release"]>[0]) {
    for (const k of [phoneKey(phone), ...blocks.map(blockKey)]) {
      if (this.get(k) === holder) this.data.delete(k);
    }
  }

  async countAttempt(ip: string) {
    const k = ipKey(ip);
    const n = Number(this.get(k) ?? 0) + 1;
    const prev = this.data.get(k);
    this.data.set(k, { value: String(n), expires: prev?.expires ?? Date.now() + 86_400_000 });
    return n;
  }
}

/* Survives hot reloads in development, where modules are re-evaluated. */
const globalStore = globalThis as unknown as { __tourMemoryStore?: MemoryStore };

/** The configured ledger, or null to run on GHL alone. */
export function getSlotStore(): SlotStore | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) return new RedisStore(url.replace(/\/+$/, ""), token);

  if (process.env.TOUR_BOOKING_STORE !== "memory") return null;
  return (globalStore.__tourMemoryStore ??= new MemoryStore());
}
