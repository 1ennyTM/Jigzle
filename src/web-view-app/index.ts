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



async function preload(){
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
        { alias: 'unload', src: '../../../assets/unload.svg' },
        { alias: 'lock', src: '../../../assets/lock.svg' },
        { alias: 'unlock', src: '../../../assets/unlock.svg' },
        { alias: 'sound_off', src: '../../../assets/sound_off.svg' },
        { alias: 'sound_low', src: '../../../assets/sound_low.svg' },
        { alias: 'sound_high', src: '../../../assets/sound_high.svg' },

        { alias: 'bgMusic1', src: '../../../assets/Audio/Lo-Fi Matte Brown Main.wav' },
        { alias: 'back', src: '../../../assets/Audio/Sweet Subtle Back.wav' },
        { alias: 'pick', src: '../../../assets/Audio/Sweet Click A.wav' },
        { alias: 'unpick', src: '../../../assets/Audio/Sweet Click B.wav' },
        { alias: 'click', src: '../../../assets/Audio/Sweet Hover A.wav' },
        { alias: 'click2', src: '../../../assets/Audio/Sweet Hover B.wav' },
        { alias: 'success', src: '../../../assets/Audio/Sweet Select A.wav' },
        { alias: 'fail', src: '../../../assets/Audio/Sweet Select B.wav' },
    ];
      
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
            game = new EmblemSolver(app);
        }
    });

    game = new EmblemSolver(app);

})();

