import  * as PIXI from 'pixi.js';

import { EmblemCreator } from './EmblemCreator.js';

import type { Renderer } from 'pixi.js';

const getGameWidth = (): number => {
    const width = window.innerWidth;
    if (width >= 756) return 756;
    if (width >= 400) return 400;
    if (width >= 343) return 343;
    return 288;
};

(async() => {
    // Create a new application
    const app = new PIXI.Application<Renderer<HTMLCanvasElement>>();

    // Initialize the application
    await app.init({
        width: getGameWidth(),
        height: getGameWidth(), //324
        background: '#1099bb',
        antialias: true,
    });

    // Append the application canvas to the document body
    console.log(app);
    console.log(app.canvas);
    document.body.appendChild(app.canvas);

    let game: BrickBreaker;
    window.addEventListener('resize', () => {
        const newWidth = getGameWidth();
        if (app.screen.width !== newWidth) {
            app.renderer.resize(newWidth, newWidth);
            app.stage.removeChildren();
            game = new BrickBreaker(app);
        }
    });

    game = new BrickBreaker(app);

})();


