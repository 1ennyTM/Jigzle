import Glyphs from '../data/glyphs.json';
export type SupportedGlyphs = keyof typeof Glyphs;
interface PixelSymbolProps {
    type: SupportedGlyphs;
    scale?: number;
    color?: string;
}
export declare function PixelSymbol(props: PixelSymbolProps): JSX.Element;
export {};
