import { expect, it, vi } from 'vitest';
import { acquireNarration, cancelNarration } from './speechCoordinator';
it('cancels the previous owner and stale release cannot cancel the new owner',()=>{
 const a=vi.fn(),b=vi.fn();const releaseA=acquireNarration(a);acquireNarration(b);
 expect(a).toHaveBeenCalledTimes(1);releaseA();cancelNarration();expect(b).toHaveBeenCalledTimes(1);
 cancelNarration();expect(b).toHaveBeenCalledTimes(1);
});
