import  * as PIXI from 'pixi.js';

import { EmblemSolver } from './emblemSolver/EmblemSolver.js';

import type { Renderer } from 'pixi.js';

// Create a new application
const app = new PIXI.Application<Renderer<HTMLCanvasElement>>();
globalThis.__PIXI_APP__ = app;

const getGameWidth = (): number => {
    const width = window.innerWidth;
    if (width >= 756) return 756;
    if (width >= 400) return 400;
    if (width >= 343) return 343;
    return 288;
};

async function setup(){
    // Intialize the application.
    await app.init({
        width: getGameWidth(),
        height: getGameWidth(), //324
        background: '#FFFFFF',
        antialias: true,
    });

    // Then adding the application's canvas to the DOM body.
    console.log(app);
    console.log(app.canvas);
    document.body.appendChild(app.canvas);
};

// Create an array of asset data to load.
const assets = [
    { alias: 'background', src: '../../../assets/background.png' },
    { alias: 'align_arrow', src: '../../../assets/align_arrow.svg',},
    { alias: 'box_packed', src: '../../../assets/box_packed.svg'},
    { alias: 'box_unpacked', src: '../../../assets/box_unpacked.svg' },//, data: {parseAsGraphicsContext: true}
    { alias: 'chevron', src: '../../../assets/chevron.svg' },
    { alias: 'clock', src: '../../../assets/clock.svg' },
    { alias: 'layer', src: '../../../assets/layer.svg' },
    { alias: 'eye_off', src: '../../../assets/eye_off.svg' },
    { alias: 'eye_on', src: '../../../assets/eye_on.svg' },
    { alias: 'rotate', src: '../../../assets/arrow_rotate.svg' },
    { alias: 'puzzle', src: '../../../assets/puzzle.svg' },
];

async function preload(){
    // Load the assets defined above.
    await PIXI.Assets.load(assets);
};

(async() => {

    await setup();
    await preload();

    let game: EmblemSolver;
    window.addEventListener('resize', () => {
        const newWidth = getGameWidth();
        if (app.screen.width !== newWidth) {
            app.renderer.resize(newWidth, newWidth);
            app.stage.removeChildren();
            game = new EmblemSolver(app, assets);
        }
    });

    game = new EmblemSolver(app, assets);

})();

