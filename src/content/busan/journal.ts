import type { JournalEntry } from '../schema';
import type { TaskDef } from '../../ui/journal';

/**
 * The Busan pages of Nani's journal. She was delighted here in 1974; the
 * entries are short because her mouth was usually full. Where a page is
 * blank, she was too busy eating to write.
 */

export const BUSAN_JOURNAL: JournalEntry[] = [
  // ---------------- words ----------------
  {
    id: 'words.jeong',
    tab: 'words',
    title: 'Jeong',
    script: '정',
    sub: 'The bond that accumulates: time, food, small acts. Unnamed until it is tested.',
    you: 'Cho would not define it, only point: the refilled plate, the extra fish, the kettle kept warm. What it weighs is now my homework.',
    rhyme: {
      with: 'customs.ayni',
      note: 'The mountain word was for work and this one is for time. I am starting to think they are all cousins.',
    },
  },
  {
    id: 'words.deom',
    tab: 'words',
    title: 'Deom',
    script: '덤',
    sub: 'The little extra dropped in the bag, unannounced. If you have to ask, it is not deom.',
    nani: 'The woman at the corner stall gave me one fish too many. I have been thinking about it all day.',
    you: 'Third visit, one extra fish, zero ceremony. Sun-hee tucked my second hand under the bag herself, so I would carry it right.',
    rhyme: {
      with: 'words.yapa',
      note: 'Three names now. Somebody is trying to tell me something.',
    },
  },
  {
    id: 'words.bapmeogeosseo',
    tab: 'words',
    title: 'Bap meogeosseo?',
    script: '밥 먹었어?',
    sub: 'Have you eaten? A hello, a worry, and a love letter in three words.',
    nani: 'Everyone greets me by asking if I have eaten. By the third day I answered honestly. By the fifth I was asking first.',
    you: 'Byeong-ok asked it with a bowl already moving toward me. The question and its answer arrived together.',
  },
  {
    id: 'words.jalmeok',
    tab: 'words',
    title: 'Jal meokkessumnida',
    script: '잘 먹겠습니다 / 잘 먹었습니다',
    sub: 'Before: I will eat well. After: jal meogeossumnida, I ate well. The meal wears brackets.',
    you: 'You say it to the cook and to the food, both. The pair turns eating into a room with a doorway in and a doorway out.',
  },
  {
    id: 'words.ajumma',
    tab: 'words',
    title: 'Ajumma',
    script: '아줌마',
    sub: 'A middle-aged woman; the engine of the market. Respectful when sincere, rude when careless.',
    you: 'Say it like you mean somebody who works, Sun-hee says, and then it is a good word. The lane runs on ajummas the way the sea runs on tides.',
  },

  // ---------------- dishes ----------------
  {
    id: 'dishes.hotteok',
    tab: 'dishes',
    title: 'Ssiat hotteok',
    script: '호떡',
    sub: 'Fried brown-sugar pancake, seeds in the fold. Busan style; Seoul sells it plain.',
    nani: 'A pancake with molten sugar inside. I burned my chin and paid to do it again.',
    you: 'I flipped my own. The burnt one went to the cook, by law: nothing wasted, nobody shamed.',
  },
  {
    id: 'dishes.eomuk',
    tab: 'dishes',
    title: 'Eomuk',
    script: '어묵',
    sub: 'Fish cake skewers standing in hot broth. The broth is free, from a shared kettle.',
    you: 'Warmth on the honor system. You sip standing up, and the harbor cold takes the morning off.',
  },
  {
    id: 'dishes.gukbap',
    tab: 'dishes',
    title: 'Dwaeji gukbap',
    script: '국밥',
    sub: 'Milky pork soup over rice. Busan in a bowl; the recipe has refugee years in it.',
    you: 'One humble order, and the table crowded itself with little plates. The soup fed me; the banchan told me where I was.',
  },
  {
    id: 'dishes.sikhye',
    tab: 'dishes',
    title: 'Sikhye',
    script: '식혜',
    sub: 'Sweet rice punch, cold, grains floating like slow snow.',
    you: 'It arrived unasked after the meal. Service, said Byeong-ok, which is all the explanation the extra ever gets around here.',
  },

  // ---------------- people ----------------
  {
    id: 'people.sunhee',
    tab: 'people',
    title: 'Sun-hee',
    sub: 'Third-generation stall. Weathered hands, terrifying arithmetic, sudden tenderness.',
    nani: 'The corner stall is a grandmother, a mother, and a small girl asleep on the ice crates. Three sizes of the same woman.',
    you: 'The stall was her grandmother’s, then her mother’s through the hard years. She says that in one sentence and sells you mackerel in the next.',
  },
  {
    id: 'people.cho',
    tab: 'people',
    title: 'Old Man Cho',
    sub: 'The tea house above the stairs. Speaks mostly in questions.',
    you: 'He asked me eleven questions and answered none of mine, and I left knowing more. I am still doing the arithmetic on that.',
  },
  {
    id: 'people.hotteokcouple',
    tab: 'people',
    title: 'Mi-ja and Dae-ho',
    sub: 'She flips, he stuffs. Thirty years; they never swap jobs.',
    you: 'Dae-ho swears the seeds are ancient tradition. Mi-ja says they are younger than the marriage. Both are right enough to stay married.',
  },

  // ---------------- customs ----------------
  {
    id: 'customs.banchan',
    tab: 'customs',
    title: 'Banchan',
    sub: 'The small free side dishes. The table fills by itself and refills without charge.',
    you: 'I ordered one thing and received a weather system. Abundance is the default here, not the reward.',
  },
  {
    id: 'customs.twohands',
    tab: 'customs',
    title: 'Two hands',
    sub: 'Give and receive with both hands, or one hand supported by the other.',
    you: 'Sun-hee tucked my spare hand under the bag herself, laughing. A thing given is heavier than a thing bought; carry it properly.',
  },
  {
    id: 'customs.dawnmarket',
    tab: 'customs',
    title: 'The dawn market',
    sub: 'Auctions from five, chanted numbers, crates of ice. Then a long, unhurried lunch.',
    nani: 'The market runs ppalli ppalli until nine, then sits down like it never heard of hurrying. I trust a place that can do both.',
    you: 'Sun-hee was here at five. The lane sleeps late because it can afford to: it has her.',
  },

  // ---------------- her ----------------
  {
    id: 'her.busan',
    tab: 'her',
    title: 'The last morning of the month',
    sub: 'Sun-hee, who was small then, and queued behind her at the post window.',
    you: 'Same window, same morning, money going home, every month she was here. I have read her Busan pages since I was a child and there is no post office in any of them.',
  },
  // The player's own thread (Chapter One's). Unlocked by 'her.you.busan'.
  {
    id: 'her.you.arithmetic',
    tab: 'her',
    title: 'The arithmetic',
    sub: 'Worked twice, on the back of nothing.',
    you: 'She asked whether my dates still work. I did the sum twice and got two answers, and neither of them was the reason I have not written to ask for more time.',
  },
];

/** Loose threads in Mulmang-gol, written like directions from a friend. */
export const BUSAN_TASKS: TaskDef[] = [
  {
    when: { has: ['c5.met.cook'], not: ['c5.sticks.why'] },
    text: 'Byeong-ok moved your chopsticks without a word. Ask her why; she corrects warmly, but only if you ask.',
  },
  {
    when: { has: ['c5.sticks.why'], not: ['c5.sikhye'] },
    text: 'Eat at Byeong-ok’s counter again. There is a saying to learn before the meal and its twin to say after.',
  },
  {
    when: { has: ['c5.met.sunhee', 'c5.met.cook'], not: ['c5.sunhee2'] },
    text: 'Go back to Sun-hee’s stall. A face turns into a person around the second visit, and hers is the stall under the red awning.',
  },
  {
    when: { has: ['c5.sunhee2'], not: ['c5.met.mija'] },
    text: 'Follow the frying-sugar smell to the hotteok cart on the lane’s south side. The couple behind the griddle are half the neighborhood.',
  },
  {
    when: { has: ['c5.sunhee2', 'c5.met.mija'], not: ['c5.deom'] },
    text: 'One more visit to Sun-hee should make it a habit. Habits have privileges at a Korean market too.',
  },
  {
    when: { has: ['c5.met.mija'], not: ['c5.hotteok.done'] },
    text: 'Mi-ja’s spatula is waiting. Press when the edge goes gold; the griddle will tell you, and the burnt ones feed the cook.',
  },
  {
    when: { has: ['c5.deom'], not: ['riddle.cho'] },
    text: 'Carry the extra fish and the question it raised up the stairs to the tea house. The old man there trades in questions.',
  },
  {
    when: { has: ['c5.deom', 'riddle.cho', 'c5.hotteok.done'], not: ['c5.complete'] },
    text: 'The lane knows you now. Mr. Gong at the ferry window, down by the quay, arranges berths for the vouched-for. He will want it done ppalli ppalli.',
  },
  {
    when: { has: ['c5.met.hana5'], not: ['c5.hana.quizzed'] },
    text: 'Hana is on the quay until the evening boat, armed with one examination question about Shionoura. Sit the exam before six.',
  },
  {
    when: { has: ['c5.arrived'], not: ['c5.met.sunhee'] },
    text: 'The market lane is waking above the quay: awnings, basins, steam. Start where the red awning is; the woman under it runs the morning.',
  },
  {
    when: { has: ['c5.arrived'], not: ['letter.read.c5.pilar'] },
    text: 'A postal window the size of a biscuit tin sits by the ferry office. Mail crosses oceans faster than you do; ask.',
  },
  {
    when: { has: ['c5.complete'] },
    text: 'The Malabar Star loads at dusk for Kochi. Until then Mulmang-gol is yours: broth on the honor system, tea upstairs, goodbyes to make.',
  },
  {
    when: { has: ['c5.arrived'], not: ['c5.complete'] },
    text: 'One warm lane between the hillside and the harbor: fish stalls, a griddle, a tea house up the stairs. Meet it slowly; it moves fast.',
  },
];
