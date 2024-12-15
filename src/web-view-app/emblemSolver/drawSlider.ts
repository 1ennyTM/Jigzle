import * as PIXI from 'pixi.js';

function clamp(num: number, lower: number, upper: number) {
    return Math.min(Math.max(num, lower), upper);
}

export default function drawSlider(app: PIXI.Application, alpha: number, onDragCallback: Function ):PIXI.Container {
        // Make the slider
        const SLIDER_WIDTH = 320;
        const SLIDER_HEIGHT = 10;

        const slider = new PIXI.Graphics()
                    .filletRect(0, 0, SLIDER_WIDTH, SLIDER_HEIGHT, 5)
                    .fill({ color: 0x364F6B })

        // Draw the handle
        const handle = new PIXI.Graphics()
                    .circle(0, 0, 10)
                    .fill({ color: 0xFC5185})
                    .stroke({width: 4, color: 0x364F6B});

        handle.y = slider.height / 2;
        handle.x = slider.width * alpha;
    
        handle.eventMode = 'static';
        handle.cursor = 'pointer';

        handle.on('pointerdown', onDragStart)
            .on('pointerup', onDragEnd)
            .on('pointerupoutside', onDragEnd);

        // create an empty slider container
        const containerSlider = new PIXI.Container();
        containerSlider.pivot.set(SLIDER_WIDTH/2, SLIDER_HEIGHT/2)

        slider.addChild(handle);
        containerSlider.addChild(slider);
        //app.stage.addChild(containerSlider)

        // Listen to pointermove on stage once handle is pressed.
        function onDragStart(){
            //this.app.stage.eventMode = 'static';
            app.stage.addEventListener('pointermove', onDrag);
        }

        // Stop dragging feedback once the handle is released.
        function onDragEnd(){
            app.stage.removeEventListener('pointermove', onDrag);
        }

        // Update the handle's position & bunny's scale when the handle is moved.
        function onDrag(e)
        {
            // clamp handle distance
            handle.x = clamp(slider.toLocal(e.global).x, 0, SLIDER_WIDTH)
            
            // Normalize handle position between 0 and 1.
            const t = handle.x /SLIDER_WIDTH;

            onDragCallback(t)
        }
        
        return containerSlider
    }