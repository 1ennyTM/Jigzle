import  * as PIXI from 'pixi.js';

import { EmblemCreator } from './emblemCreator/EmblemCreator.js';

import type { Renderer } from 'pixi.js';

// Create a new application
const app = new PIXI.Application<Renderer<HTMLCanvasElement>>();

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
}

async function preload(){
    // Create an array of asset data to load.
    const assets = [
        { alias: 'background', src: 'https://pixijs.com/assets/tutorials/fish-pond/pond_background.jpg' },
        { alias: 'background2', src: '../../../assets/background.png' },
        { alias: 'fish1', src: 'https://pixijs.com/assets/tutorials/fish-pond/fish1.png' },
        { alias: 'fish2', src: 'https://pixijs.com/assets/tutorials/fish-pond/fish2.png' },
        { alias: 'fish3', src: 'https://pixijs.com/assets/tutorials/fish-pond/fish3.png' },
        { alias: 'fish4', src: 'https://pixijs.com/assets/tutorials/fish-pond/fish4.png' },
        { alias: 'fish5', src: 'https://pixijs.com/assets/tutorials/fish-pond/fish5.png' },
        { alias: 'overlay', src: 'https://pixijs.com/assets/tutorials/fish-pond/wave_overlay.png' },
        { alias: 'displacement', src: 'https://pixijs.com/assets/tutorials/fish-pond/displacement_map.png' },
    ];

    // Load the assets defined above.
    await PIXI.Assets.load(assets);
}

(async() => {

    await setup();
    await preload();

    let game: EmblemCreator;
    window.addEventListener('resize', () => {
        const newWidth = getGameWidth();
        if (app.screen.width !== newWidth) {
            app.renderer.resize(newWidth, newWidth);
            app.stage.removeChildren();
            game = new EmblemCreator(app);
        }
    });

    game = new EmblemCreator(app);

})();

