import { Devvit } from '@devvit/public-api';
import Glyphs from '../data/glyphs.json';
import Settings from '../../settings.json';
export function PixelSymbol(props) {
    const { type, scale = 2, color = Settings.theme.primary } = props;
    const glyph = Glyphs[type];
    const height = glyph.height;
    const width = glyph.width;
    const scaledHeight = `${height * scale}px`;
    const scaledWidth = `${width * scale}px`;
    return (Devvit.createElement("image", { imageHeight: scaledHeight, imageWidth: scaledWidth, height: scaledHeight, width: scaledWidth, description: type, resizeMode: "fill", url: `data:image/svg+xml,
        <svg
          width="${width}"
          height="${height}"
          viewBox="0 0 ${width} ${height}"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="${glyph.path}"
            fill="${color}"
            fill-rule="evenodd"
            clip-rule="evenodd"
          />
        </svg>
      ` }));
}
//# sourceMappingURL=PixelSymbol.js.map