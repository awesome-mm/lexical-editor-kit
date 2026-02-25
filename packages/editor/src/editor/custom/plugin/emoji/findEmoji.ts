export type EmojiMatch = Readonly<{
  position: number;
  shortcode: string;
  unifiedID: string;
}>;

export default function findEmoji(text: string): EmojiMatch | null {
  const match = text.match(/:([a-z_]+):/);
  if (!match || match.index == null) return null;

  return {
    position: match.index,
    shortcode: match[0],
    unifiedID: "1f600", // 예시
  };
}
