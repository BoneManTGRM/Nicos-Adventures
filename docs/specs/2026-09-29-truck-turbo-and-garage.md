# Truck driving and garage polish

Owner request: improve the truck game further after the published second-ramp power repair. Keep that repair and the existing unicorn artwork/game unchanged.

Deliverables: a free single-thumb turbo pedal with a bounded rechargeable meter; clear ramp/landing/damage feedback; replay without a modal covering the action; one-tap rebuild and retry with the same car and route; searchable bilingual parts with owned/affordable filters; visible existing reward projects; explicit separation of preview and fitted parts.

Scope: turbo extends only the current drive snapshot with optional bounded fields. Legacy snapshots initialize a full meter; depleted snapshots stay depleted after reload. No schema version change, new currency, parts, prices, reward formula, secret, hosted service or dependency. Normal gas uses the already-qualified climbing force. Turbo adds temporary pulling power and at most 15% extra motor speed limit, cannot drive with a missing motor/driven wheel, is ineffective while braking, and recharges only after release while moving with powered ground contact. It is not needed to clear ramp two.

Reward settlement stays in the existing sequence/paidThrough ledger. Practice and unowned preview retries cannot earn bolts, update distance records or grant parts. Component generation tokens reject stale callbacks after retry. Keyboard mappings, blur/visibility pause, reduced motion and phone safe areas remain explicit. Shared unicorn controls and art are untouched.

Local evidence: three new feature contracts failed on the original modules and passed after implementation (starter meter, turbo-only acceleration, depleted-meter persistence). Strict TypeScript model check passed. Local Chromium navigation was blocked by environment policy; no local browser success is claimed. Full GitHub acceptance and screenshot review must precede publication. Preserve all old second-ramp, crash, offline, ownership and unicorn checks.
