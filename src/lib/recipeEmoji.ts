const EMOJI_RULES: [RegExp, string][] = [
  [/계란|달걀/, '🥚'],
  [/김치/, '🥬'],
  [/볶음밥|밥/, '🍚'],
  [/찌개|국|탕/, '🍲'],
  [/볶음/, '🍳'],
  [/샐러드|나물|채소|야채/, '🥗'],
  [/면|파스타|국수/, '🍜'],
  [/고기|불고기|제육/, '🥩'],
  [/두부/, '🧈'],
  [/빵|토스트/, '🍞'],
];

export function getRecipeEmoji(title: string): string {
  const rule = EMOJI_RULES.find(([pattern]) => pattern.test(title));
  return rule ? rule[1] : '🍽️';
}
