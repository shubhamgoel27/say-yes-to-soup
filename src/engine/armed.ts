/**
 * Minigame cards that are armed but not on screen.
 *
 * A game's start flag goes up in conversation and stays up until its done
 * narration clears it, so an unfinished game is "armed" for as long as the
 * player leaves it. The how-to card offers it when a conversation ends. Two
 * ways that went wrong, both fixed here:
 *
 * - "Not yet" sticks: a declined card waits where it was declined, and comes
 *   back only after its own villager speaks again or the player presses
 *   Space in open air near that spot. "Step away" from a running panel is
 *   the same choice made later, and now waits the same way (it used to pop
 *   the card after the very next unrelated conversation).
 * - Travel wins. Sicily's scopa, stepped away from, swallowed Patane's "Up
 *   the gangway": the sailing narration played, the scopa card took the end
 *   of the conversation, and the player was left standing in Sicily having
 *   been told they had left. A journey taken in conversation now always
 *   runs, and every card still armed stays behind where it was armed.
 */
export type Spot = { map: string; at: [number, number]; npc: string | null };

/** How close counts as "back at the station" for the open-air re-offer. */
export const DECLINE_NEAR = 2;

export class ArmedCards {
  private declined = new Map<string, Spot>();

  /** `order` is every game's start flag, in the order cards are offered. */
  constructor(private order: readonly string[]) {}

  /** The card owed right now: armed, not on screen, not set aside. */
  pending(has: (flag: string) => boolean, isOpen: (flag: string) => boolean): string | null {
    return this.order.find((f) => has(f) && !isOpen(f) && !this.declined.has(f)) ?? null;
  }

  /** "Not yet", "Step away", or a journey away: the card waits at this spot. */
  setAside(flag: string, spot: Spot) {
    this.declined.set(flag, spot);
  }

  isSetAside(flag: string): boolean {
    return this.declined.has(flag);
  }

  /** Open air near where a card was set aside: that card, forgiven. */
  nearHere(map: string, x: number, y: number, has: (flag: string) => boolean): string | null {
    for (const [flag, d] of this.declined) {
      if (d.map !== map) continue;
      if (Math.abs(x - d.at[0]) + Math.abs(y - d.at[1]) > DECLINE_NEAR) continue;
      this.declined.delete(flag);
      if (has(flag)) return flag;
    }
    return null;
  }

  /** Talking to whoever offered a set-aside card lets it come back after. */
  forgiveBy(npc: string) {
    for (const [flag, d] of this.declined) if (d.npc === npc) this.declined.delete(flag);
  }

  /**
   * The player is leaving in conversation: every armed card not already set
   * aside stays behind here, so none can stand between the player and the
   * journey, or follow them into the next village. Returns those flags.
   */
  leaveBehind(has: (flag: string) => boolean, isOpen: (flag: string) => boolean, spot: Spot): string[] {
    const left: string[] = [];
    for (const f of this.order) {
      if (!has(f) || isOpen(f) || this.declined.has(f)) continue;
      this.declined.set(f, spot);
      left.push(f);
    }
    return left;
  }

  clear() {
    this.declined.clear();
  }
}

/**
 * What the end of a conversation does first. A journey always wins over an
 * armed card: the card can wait, a "the faraglioni slide past" cannot be
 * taken back.
 */
export function afterTalk(travelPending: boolean, card: string | null): 'travel' | 'card' | 'none' {
  if (travelPending) return 'travel';
  return card ? 'card' : 'none';
}
