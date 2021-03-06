export const chars = {
  numerals: "๐ ๑ ๒ ๓ ๔ ๕ ๖ ๗ ๘ ๙ 0 1 2 3 4 5 6 7 8 9",
  letters: "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z a b c d e f g h i j k l m n o p q r s t u v w x y z",
  lines: "┐ ┌ ┘ └ ┼ ├ ┤ ┴ ┬ │ ─ ╎ ╌ ╵╷╴╶ ┓ ┏ ┛ ┗ ╋ ┣ ┫ ┻ ┳ ┃ ━ ╏ ╍ ╹╻╸╺ ╗ ╔ ╝ ╚ ╬ ╠ ╣ ╩ ╦ ║ ═ ╕ ╒ ╛ ╘ ╪ ╞ ╡ ╧ ╤ ╖ ╓ ╜ ╙ ╫ ╟ ╢ ╨ ╥ ┑ ┍ ┙ ┕ ┿ ┝ ┥ ┷ ┯ ┒ ┎ ┚ ┖ ╂ ┠ ┨ ┸ ┰ ╮ ╭ ╯ ╰ ╇ ╈ ╉ ╊ ╃ ╄ ╅ ╆ ┽ ┾ ╀ ╁ ┡ ┢ ┩ ┪ ┞ ┟ ┦ ┧ ┲ ┱ ┹ ┺ ┮ ┭ ┵ ┶ ╼ ╾ ╽ ╿ ╱ ╲ ╳",
  blocks: "█ ▛ ▜ ▟ ▙ ▄ ▀ ▐ ▌ ▞ ▚ ▖▗ ▘▝ █ ▇ ▆ ▅ ▄ ▃ ▂ ▁ ▔ █ ▉ ▊ ▋ ▌ ▍ ▎ ▏ ▕ █ ▓ ▒ ░",
  symbols: ". , ; : ¿ ? ¡ ! @ # % ‰ & * ' \" € £ $ ¥ ¢ ¤ ¦ ¶ § © ® ™ ° º ª ¹ ² ³ ¼ ½ ¾ · + - × ÷ ± = ≠ < > √ ∞ ∫ ≈ ~ ¬ ≤ ≥ [ ] ( ) { } | \ / ⁄ ﬁ ﬂ Æ Œ æ œ ß Ø ø Ə ə ^ ¨ \` Ω ∂ ∆ π ∏ ◊ ∑ μ ‘ ’ ‚ “ ” „ « » ‹ › † ‡ • − – _ ¯ … ■ □ ▢ ▣ ▪ ▫ ▬ ▭ ▮ ▯ ◆ ◇ ○ ◎ ◉ ● ◐ ◑ ◒ ◓ ◕ ◖ ◗ ◙ ◚ ◛ ◜ ◝ ◞ ◟ ◠ ◡ ◧ ◨ ◩ ◪ ◫ ◰ ◱ ◲ ◳ ◴ ◵ ◶ ◷ ◢ ◣ ◤ ◥",
}

export default class Char {

  selectChar(char) {
    window.dispatchEvent(new CustomEvent('selectchar', { detail: char }));
  }
}

export const charsList = Object.keys( chars ).reduce((acc,curr) => Object.assign(acc, ({[curr]: chars[curr].trim().split(" ") })), {})