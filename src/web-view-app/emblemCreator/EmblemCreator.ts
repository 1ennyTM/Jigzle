import * as PIXI from 'pixi.js';
import { Actions , Interpolations } from 'pixi-actions';
import drawSlider from './drawSlider';

function lerp(a :number, b:number, t:number):number{
    return a + ((b-a) * t)
}

export class EmblemCreator {
    private readonly app: PIXI.Application;
    private readonly gameContainer: PIXI.Container;
    private readonly uiContainer: PIXI.Container;

    private layers: PIXI.Graphics[];
    private currentShape: PIXI.Graphics| null;
    private stageHeight: number;
    private stageWidth: number;

    private SHAPE_SIZE: number = 100;
    private SHAPE_SCALE_MIN = 0.1;
    private SHAPE_SCALE_MAX = 4;
    private BASE_LENGTH: number = 100;
    private DEFAULT_SHAPE_POSITION:Array<number> = [];

    private FONT_SIZE: number = 16;
    private FONT_COLOR: number = 0xFFFFFF;
    private FONT_FAMILY: string = 'Arial';

    private CANVAS_DRAWER_RATIO: number;
    private CANVAS_LENGTH: number;
    private DRAWER_BACK_DIFF_RATIO:number;
    private DRAWER_WIDTH: number;
    private DRAWER_HEIGHT: number;
    private DRAWERBACK_HEIGHT: number;

    constructor(app: PIXI.Application){
        this.app = app;
    
        this.gameContainer = new PIXI.Container();
        this.uiContainer = new PIXI.Container();

        this.app.stage.addChild(this.gameContainer)
        this.app.stage.addChild(this.uiContainer)

        this.layers = [];
        this.currentShape = null;
        this.stageHeight = this.app.screen.height;
        this.stageWidth = this.app.screen.width;

        this.DEFAULT_SHAPE_POSITION = [this.stageWidth/2, this.stageHeight/2];
        this.CANVAS_DRAWER_RATIO = 0.2;
        this.CANVAS_LENGTH =this.stageWidth * (1-this.CANVAS_DRAWER_RATIO);
        this.DRAWER_WIDTH = this.stageWidth;
        this.DRAWER_BACK_DIFF_RATIO = 0.05;
        this.DRAWER_HEIGHT = this.stageHeight*(this.CANVAS_DRAWER_RATIO- this.DRAWER_BACK_DIFF_RATIO);
        this.DRAWERBACK_HEIGHT = this.stageHeight*this.CANVAS_DRAWER_RATIO;

        this.calculateDimensions();
        this.loadGameState();
        this.addBackground()
        this.initialise();
    }

    private calculateDimensions():void {
        const width = this.app.screen.width;
        const baseWidth = 756;
        const scale = width / baseWidth;
    } 

    private loadGameState(): void {

    }

    private addBackground(): void{
        // Create a background sprite.
        const background = PIXI.Sprite.from('background2');
        // Center background sprite anchor.
        background.anchor.set(0.5);
        
          /**
         * If the preview is landscape, fill the width of the screen
         * and apply horizontal scale to the vertical scale for a uniform fit.
         */
        if (this.app.screen.width > this.app.screen.height)
        {
            background.width = this.app.screen.width * 1.2;
            background.scale.y = background.scale.x;
        }
        else
        {
            /**
             * If the preview is square or portrait, then fill the height of the screen instead
             * and apply the scaling to the horizontal scale accordingly.
             */
            background.height = this.app.screen.height * 1.2;
            background.scale.x = background.scale.y;
        }
    
        // Position the background sprite in the center of the stage.
        background.x = this.app.screen.width / 2;
        background.y = this.app.screen.height / 2;
    
        // Add the background to the stage.
        this.app.stage.addChild(background);
    }

    private initialise(): void {
        const startLocation = this.DEFAULT_SHAPE_POSITION
        const app = this.app;
        const baseLength = this.BASE_LENGTH; 

        app.ticker.add((tick) => Actions.tick(tick.deltaTime/60));

        this.currentShape = createNPolygon(startLocation, 0x000000, 5);

        // Enable the bunny to be interactive... this will allow it to respond to mouse and touch events
        this.currentShape.eventMode = 'static';
        // This button mode will mean the hand cursor appears when you roll over the bunny with your mouse
        this.currentShape.cursor = 'pointer';
        // Setup events for mouse + touch using the pointer events
        this.currentShape.on('pointerdown', onDragStart);

        function setupShape(shape: PIXI.Graphics, position: [], color: number){
            shape.fill({
                color: color,
                alpha: 1,
            });
            shape.stroke({
                color: 0x0000ff,
                width: 5,
                alpha: 1,
                alignment:1, // fixed
            });

            shape.position.set(position[0], position[1]);
            shape.scale.set(1);
            shape.rotation = 0;    
            // Add it to the stage
            app.stage.addChild(shape);
            return shape
        }

        function createNPolygon(position, color: number, sides: number){
            const polygon = new PIXI.Graphics().roundPoly(0, 0, baseLength, sides, 0);
            return setupShape(polygon, position, color)
        }

        let dragTarget:PIXI.Graphics|null = null;

        app.stage.eventMode = 'static';
        app.stage.hitArea = this.app.screen;
        app.stage.on('pointerup', onDragEnd);
        app.stage.on('pointerupoutside', onDragEnd);

        function onDragMove(event){
            if (dragTarget){
                dragTarget.parent.toLocal(event.global, null, dragTarget.position);
            }
        }

        function onDragStart(){
            // Store a reference to the data
            // * The reason for this is because of multitouch *
            // * We want to track the movement of this particular touch *
            dragTarget = this;
            app.stage.on('pointermove', onDragMove);
        }
    
        function onDragEnd()
        {
            if (dragTarget){
                app.stage.off('pointermove', onDragMove);
                dragTarget = null;
            }
        }

        const containerCanvas = this.drawEmblem()
        this.drawGameContainers(containerCanvas)

        // Add title
        const title = new PIXI.Text({
        text: 'This is a test!',
            style: {
                fill: '#272d37',
                fontFamily: 'Roboto',
                fontSize: 20,
                align: 'center',
            },
        });

        title.roundPixels = true;
        title.x = this.stageWidth / 2;
        title.y = 40;
        title.anchor.set(0.5, 0);
        this.app.stage.addChild(title);

    }

    private drawEmblem():PIXI.Container{
        const CANVAS_LENGTH = this.CANVAS_LENGTH;

        const containerCanvas = new PIXI.Container();
        // draw Canvas
        const canvas = new PIXI.Graphics()
        .filletRect(0, 0, CANVAS_LENGTH, CANVAS_LENGTH, 0)
        .fill({color: 0xffffff , alpha: 1})
        .stroke({ color: 0x364F6B, width: 1, alignment: 1});


        containerCanvas.addChild(canvas);
        containerCanvas.pivot.x = CANVAS_LENGTH/2;
        containerCanvas.position.set(this.stageWidth/2,0);

        this.app.stage.addChild(containerCanvas);
        return containerCanvas
    }
    private drawGameContainers(containerCanvas:PIXI.Container) {
        const DRAWER_BACK_DIFF_RATIO = this.DRAWER_BACK_DIFF_RATIO
        const CANVAS_DRAWER_RATIO = this.CANVAS_DRAWER_RATIO
        const DRAWER_WIDTH = this.DRAWER_WIDTH;
        const DRAWER_HEIGHT = this.DRAWER_HEIGHT;
        const DRAWERBACK_HEIGHT = this.DRAWERBACK_HEIGHT;
        const BUTTON_WIDTH =  DRAWER_WIDTH/8;
        const BUTTON_HEIGHT = BUTTON_WIDTH/3;

        // draw Canvas Container
        const containerDrawer = new PIXI.Container();
    
        // draw Drawer
        const drawerBack = new PIXI.Graphics()
            .filletRect(0, 0, DRAWER_WIDTH, DRAWERBACK_HEIGHT, 0)
            .fill({color: 0x364F6B , alpha: 1})
            .stroke({ color: 0xF5F5F5, width: 2, alignment: 0});

        drawerBack.position.set(0, this.stageHeight-DRAWERBACK_HEIGHT);

        const drawer = new PIXI.Graphics()
            .filletRect(0, 0, DRAWER_WIDTH, DRAWER_HEIGHT, 0)
            .fill({color: 0xF5F5F5, alpha: 1})
            .stroke({ color: 0x364F6B, width: 2, alignment: 0});

        drawer.position.set(0, this.stageHeight-DRAWER_HEIGHT);

        //create close and open drawer button
        const buttonCircleArrow = new PIXI.Graphics()
            .circle(0,0,(BUTTON_HEIGHT/2)-4)
            .stroke({ color: 0xFC5185, width: 3, alignment: 0})
            .moveTo(-BUTTON_HEIGHT/4,-BUTTON_HEIGHT/6)
            .lineTo(0,BUTTON_HEIGHT/6)
            .lineTo(BUTTON_HEIGHT/4,-BUTTON_HEIGHT/6)
            .stroke({ color: 0xF5F5F5, width: 3});
                    
        const buttonCircleArrowX = DRAWER_WIDTH*9.5/10;
        const buttonCircleArrowY = this.stageHeight-(this.stageHeight*0.175);
        buttonCircleArrow.position.set(buttonCircleArrowX, buttonCircleArrowY);

        let animRunning = false;
        let drawerToggle = true;
        function toggleDrawer():void{
            if (animRunning) return
            
            animRunning = true
            drawerToggle = !drawerToggle;

            if (drawerToggle) {
                Actions.sequence(
                    Actions.parallel(
                        Actions.moveTo(containerDrawer,0,0,0.5,Interpolations.fade),
                        Actions.scaleTo(containerCanvas,1,1,0.5,Interpolations.fade),
                        Actions.rotateTo( buttonCircleArrow, 0, 0.5, Interpolations.fade)
                    ),
                    Actions.runFunc(()=>{
                        animRunning = false;
                    })
                ).play()

            } else {
                const expansionRatio = (1-DRAWER_BACK_DIFF_RATIO)/(1 - CANVAS_DRAWER_RATIO);
            
                Actions.sequence(
                    Actions.parallel(
                        Actions.moveTo(containerDrawer,0,DRAWER_HEIGHT,0.5,Interpolations.fade),
                        Actions.scaleTo(containerCanvas,expansionRatio,expansionRatio,0.5,Interpolations.fade),
                        Actions.rotateTo( buttonCircleArrow, Math.PI, 0.5, Interpolations.fade)
                    ),
                    Actions.runFunc(()=>{
                        animRunning = false;
                    })
                ).play()
            }
        }

        buttonCircleArrow.eventMode = 'static';
        buttonCircleArrow.cursor = 'pointer';
        buttonCircleArrow.on('pointerdown',toggleDrawer);

        // create tab buttons
        const containerButtons = new PIXI.Container();
        const Buttons: Array<PIXI.Graphics> = [];
        const MapButtonCallback = [];
        let tabSelection = 0;
        const noOfButton = 4
 
        const buttonTabCover = new PIXI.Graphics()
            .filletRect(0, 0, BUTTON_WIDTH, BUTTON_HEIGHT,4)
            .fill({ color: 0xF5F5F5})

        function setButtonTabPosition(){
            const newTab = Buttons[tabSelection]
            buttonTabCover.position.set(
                newTab.position.x,
                newTab.position.y
            )
        }

        let buttonX;
        const buttonY = this.stageHeight - DRAWER_HEIGHT - BUTTON_HEIGHT
        for (let i = 0; i < noOfButton; i++) {

            const button =  new PIXI.Graphics()
                            .filletRect(0, 0, BUTTON_WIDTH, BUTTON_HEIGHT,5)
                            .fill({ color: 0x3FC1C9 })
                            .stroke({ color: 0x364F6B, width: 3, alignment: 0});
            Buttons.push(button);

            function changeTab():void{
                if (tabSelection == i) return
                tabSelection = i
                setButtonTabPosition()
                if (!drawerToggle){toggleDrawer()};
            }

            button.eventMode = 'static';
            button.cursor = 'pointer';
            button.on('pointerdown', changeTab);

            buttonX = (i*BUTTON_WIDTH)+((i+1)*7);
            button.position.set(buttonX, buttonY);

            containerButtons.addChild(button);
           
            button.position.x 
        }
        setButtonTabPosition()
        
        // create an  drawer container
        containerDrawer.addChild(drawerBack);
        containerDrawer.addChild(buttonCircleArrow);
        containerDrawer.addChild(containerButtons);
        containerDrawer.addChild(drawer);
        containerDrawer.addChild(buttonTabCover);

        /*
        const drawerOptions = this.drawerSizeRot();
        drawerOptions.position.set(DRAWER_WIDTH/2, this.stageHeight - DRAWER_HEIGHT);
        containerDrawer.addChild(drawerOptions)
        */

        this.app.stage.addChild(containerDrawer);
    }

    private drawerLayers():PIXI.Container {
        const BUTTON_HEIGHT = BUTTON_WIDTH/3;

        function createArrowButton():PIXI.Graphics{
            return new PIXI.Graphics()
                .circle(0,0,(BUTTON_HEIGHT/2)-4)
                .stroke({ color: 0xFC5185, width: 3, alignment: 0})
                .moveTo(-BUTTON_HEIGHT/4,-BUTTON_HEIGHT/6)
                .lineTo(0,BUTTON_HEIGHT/6)
                .lineTo(BUTTON_HEIGHT/4,-BUTTON_HEIGHT/6)
                .stroke({ color: 0xF5F5F5, width: 3});
        }
    }

    private drawerColor():PIXI.Container {
     
    }

    private drawerSizeRot():PIXI.Container {
        const containerDrawer = new PIXI.Container
        const padY = this.DRAWER_HEIGHT/4;
        //containerDrawer.addChild(this.sliderAlpha(0,40));
        containerDrawer.addChild(this.sliderRotation(0,padY-5));
        containerDrawer.addChild(this.sliderSizeX(0,padY*2));
        containerDrawer.addChild(this.sliderSizeY(0,padY*3+5));

        return containerDrawer
    }

    private sliderSizeX(positionX :  number, positionY:  number): PIXI.Container{
        const currentShape = this.currentShape; 
        const min = this.SHAPE_SCALE_MIN;
        const max = this.SHAPE_SCALE_MAX;

        function callbackOnDrag(t: number){
            currentShape.scale.x = lerp(min,max,t);
        }
        const alphaScale = currentShape.scale.x/(this.SHAPE_SCALE_MAX-this.SHAPE_SCALE_MIN);
        
        const containerDrawer = drawSlider(this.app, alphaScale, callbackOnDrag);
        containerDrawer.position.set(positionX, positionY);
        return containerDrawer
    }

    private sliderSizeY(positionX: number, positionY:  number): PIXI.Container{
        const currentShape = this.currentShape; 
        const min = this.SHAPE_SCALE_MIN;
        const max = this.SHAPE_SCALE_MAX;

        function callbackOnDrag(t: number){
            currentShape.scale.y = lerp(min,max,t);
        }
        const alphaScale = currentShape.scale.y/(this.SHAPE_SCALE_MAX-this.SHAPE_SCALE_MIN);

        const containerDrawer = drawSlider(this.app, alphaScale, callbackOnDrag);
        containerDrawer.position.set(positionX, positionY);
        return containerDrawer
    }

    private sliderRotation(positionX: number, positionY:  number): PIXI.Container{
        const currentShape = this.currentShape;

        function callbackOnDrag(t: number){
            currentShape.rotation = t * 2 * Math.PI;
        }
        const alphaRot = currentShape.rotation/(2*Math.PI);

        const containerDrawer = drawSlider(this.app, alphaRot, callbackOnDrag);
        containerDrawer.position.set(positionX, positionY);
        return containerDrawer
    }

    private sliderAlpha(positionX: number, positionY:  number): PIXI.Container{
        const currentShape = this.currentShape;

        function callbackOnDrag(t: number){
            currentShape.alpha = 1 - t;
        }
        const alpha = 1 - currentShape.alpha;

        const containerDrawer = drawSlider(this.app, alpha, callbackOnDrag);
        containerDrawer.position.set(positionX, positionY);

        return containerDrawer
    }
}