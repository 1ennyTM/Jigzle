import { Devvit } from '@devvit/public-api';
import Glyphs from '../data/glyphs.json';
import Settings from '../../settings.json';
export function PixelText(props) {
    const { children, scale = 2, color = Settings.theme.primary } = props;
    const line = children[0].split('');
    const gap = 1;
    const height = Glyphs['A'].height;
    let width = 0;
    let xOffset = 0;
    const characters = [];
    line.forEach((character) => {
        if (character === ' ') {
            xOffset += 6 + gap;
            return;
        }
        const glyph = Glyphs[character];
        if (!glyph) {
            return;
        }
        characters.push(`<path
      d="${glyph.path}"
      transform="translate(${xOffset} 0)"
      fill="${color}"
      fill-rule="evenodd"
      clip-rule="evenodd"
    />`);
        xOffset += glyph.width + gap;
        width = xOffset;
    });
    // Remove the trailing gap
    width -= gap;
    const scaledHeight = `${height * scale}px`;
    const scaledWidth = `${width * scale}px`;
    return (Devvit.createElement("image", { imageHeight: scaledHeight, imageWidth: scaledWidth, height: scaledHeight, width: scaledWidth, description: children[0], resizeMode: "fill", url: `data:image/svg+xml,
        <svg
          width="${width}"
          height="${height}"
          viewBox="0 0 ${width} ${height}"
          xmlns="http://www.w3.org/2000/svg"
        >
          ${characters.join('')}
        </svg>
      ` }));
}
//# sourceMappingURL=PixelText.js.map