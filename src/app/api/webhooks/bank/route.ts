/**
 * POST /api/webhooks/bank
 *
 * Receives payment confirmation callbacks from the bank / payment gateway.
 * Verifies the webhook signature using BANK_WEBHOOK_SECRET before processing.
 *
 * SECURITY:
 * - Signature is verified using HMAC-SHA256 before any processing.
 * - transferContent in the webhook payload is matched against the transaction's
 *   stored username to confirm the correct player receives the top-up.
 * - Amount is verified against the transaction record — client cannot override.
 *
 * TODO:
 * 1. Set BANK_WEBHOOK_SECRET in .env to the secret provided by your gateway.
 * 2. Update the signature verification logic to match your provider's scheme
 *    (HMAC-SHA256 is the most common — adjust header name and algorithm as needed).
 * 3. Update the transaction lookup + status update logic to write to your database.
 * 4. Implement lookupTransaction() to fetch the stored transaction from your DB.
 */

import { NextRequest, NextResponse } from 'next/server';
import { BANK_WEBHOOK_SECRET } from '@/config/api';
import crypto from 'crypto';

interface WebhookPayload {
  transactionId: string;
  status: 'SUCCESS' | 'FAILED';
  amount: number;
  /** Transfer content / description sent by the payer — must match transaction username */
  transferContent?: string;
  completedAt: string;
  [key: string]: unknown; // provider-specific extra fields
}

/**
 * Stored transaction record (from your database).
 * TODO: Replace with actual DB lookup.
 */
interface StoredTransaction {
  transactionId: string;
  /** Minecraft username from session at the time of transaction creation */
  username: string;
  /** Expected transfer content = username */
  transferContent: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
}

/**
 * Verifies the HMAC-SHA256 signature sent by the payment gateway.
 * TODO: Adjust header name and algorithm to match your provider's spec.
 */
function verifySignature(rawBody: string, signature: string): boolean {
  if (!BANK_WEBHOOK_SECRET) {
    // If secret is not configured, skip verification (development only)
    console.warn('[webhook/bank] BANK_WEBHOOK_SECRET not set — skipping signature check');
    return true;
  }
  const expected = crypto
    .createHmac('sha256', BANK_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/**
 * Look up a stored transaction by ID.
 *
 * TODO: Replace this mock with a real database query, e.g.:
 *   const tx = await db.bankTransaction.findUnique({ where: { transactionId } });
 *
 * The stored transaction MUST contain the username from the original session
 * (set by /api/topup/bank at creation time — never from client input).
 */
async function lookupTransaction(transactionId: string): Promise<StoredTransaction | null> {
  // MOCK: In production, query your database here.
  // This mock always returns null — real implementation needed.
  console.log(`[webhook/bank] TODO: Look up transaction ${transactionId} in database`);
  return null;
}

/**
 * Credit the Minecraft player's in-game balance.
 *
 * TODO: Replace with real Minecraft economy API call, e.g.:
 *   await minecraftEconomy.addMoney(username, amount);
 */
async function creditMinecraftAccount(username: string, amount: number): Promise<boolean> {
  // MOCK: In production, call your Minecraft economy service here.
  console.log(`[webhook/bank] TODO: Credit ${amount}đ to Minecraft account: ${username}`);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // TODO: Update header name to match your provider (e.g. 'x-signature', 'x-hub-signature-256')
    const signature = req.headers.get('x-webhook-signature') || '';

    if (!verifySignature(rawBody, signature)) {
      console.warn('[webhook/bank] Invalid signature — possible forgery attempt');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload: WebhookPayload = JSON.parse(rawBody);

    if (!payload.transactionId || !payload.status) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // ── TRANSACTION VERIFICATION ──────────────────────────────────────────────
    // Look up the stored transaction to get the session username
    const storedTx = await lookupTransaction(payload.transactionId);

    if (storedTx) {
      // Verify transferContent matches the stored username
      // This prevents someone from sending a payment with another player's username
      if (
        payload.transferContent &&
        payload.transferContent.trim().toLowerCase() !== storedTx.transferContent.trim().toLowerCase()
      ) {
        console.warn(
          `[webhook/bank] transferContent mismatch: expected "${storedTx.transferContent}", got "${payload.transferContent}"`
        );
        return NextResponse.json({ error: 'Transfer content mismatch' }, { status: 400 });
      }

      // Verify amount matches
      if (payload.amount !== storedTx.amount) {
        console.warn(
          `[webhook/bank] Amount mismatch: expected ${storedTx.amount}, got ${payload.amount}`
        );
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
      }

      // ── CREDIT MINECRAFT ACCOUNT ────────────────────────────────────────────
      if (payload.status === 'SUCCESS') {
        // Username comes from the stored transaction (set from session at creation)
        // — never from the webhook payload or client input
        const credited = await creditMinecraftAccount(storedTx.username, storedTx.amount);

        if (!credited) {
          console.error(`[webhook/bank] Failed to credit account: ${storedTx.username}`);
          // Return 200 to prevent gateway retry, but log the failure for manual review
        }

        // TODO: Update transaction status in your database
        // await db.bankTransaction.update({
        //   where: { transactionId: payload.transactionId },
        //   data: { status: 'SUCCESS', completedAt: payload.completedAt },
        // });

        console.log(
          `[webhook/bank] SUCCESS: ${storedTx.amount}đ credited to ${storedTx.username} (tx: ${payload.transactionId})`
        );
      } else {
        // TODO: Mark transaction as FAILED in your database
        // await db.bankTransaction.update({
        //   where: { transactionId: payload.transactionId },
        //   data: { status: payload.status, completedAt: payload.completedAt },
        // });

        console.log(`[webhook/bank] Transaction ${payload.transactionId} → ${payload.status}`);
      }
    } else {
      // Transaction not found in DB — log for investigation
      // Still return 200 to prevent gateway retry spam
      console.warn(
        `[webhook/bank] Transaction not found: ${payload.transactionId} — DB lookup not yet implemented`
      );
    }

    // Always return 200 quickly so the gateway doesn't retry
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[/api/webhooks/bank]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
