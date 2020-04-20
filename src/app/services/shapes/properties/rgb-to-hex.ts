const hexDigits = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
];

export class RgbToHex {
  static execute(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return "#" + this.hex(rgb[1]) + this.hex(rgb[2]) + this.hex(rgb[3]);
  }

  static hex(x) {
    return isNaN(x) ? "00" : hexDigits[(x - (x % 16)) / 16] + hexDigits[x % 16];
  }
}
