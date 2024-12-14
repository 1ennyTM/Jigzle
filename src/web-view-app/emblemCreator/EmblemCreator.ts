import * as PIXI from 'pixi.js';
import { Actions , Interpolations } from 'pixi-actions';
import drawSlider from './drawSlider';
import chirstmasTree from '../presets/ChristmasTree.json';
import { createShapes } from '../shapes/createShapes';

function lerp(a :number, b:number, t:number):number{
    return a + ((b-a) * t)
}

export class EmblemCreator {
    private readonly app: PIXI.Application;
 
    private currentShape: PIXI.Graphics| null;
    private stageHeight: number;
    private stageWidth: number;

    
    private PIECE_TOLERANCE = 0.02; // % of sceen height

    private SHAPE_SCALE_MIN = 0.1;
    private SHAPE_SCALE_MAX = 4;

    private FONT_SIZE: number = 16;
    private FONT_COLOR: number = 0xFFFFFF;
    private FONT_FAMILY: string = 'Arial';

    private CANVAS_DRAWER_RATIO: number = 0.2;
    private DRAWER_BACK_DIFF_RATIO:number = 0.05;
    private DRAWER_WIDTH: number;
    private DRAWER_HEIGHT: number;
    private DRAWERBACK_HEIGHT: number;
    private BUTTON_WIDTH: number;
    private BUTTON_HEIGHT: number;
    private BUTTON_SPACING = 10;

    constructor(app: PIXI.Application, assets){
        this.app = app;
        this.assets = assets;

        this.currentShape = null;
        
        this.stageHeight = this.app.screen.height;
        this.stageWidth = this.app.screen.width;

        this.DRAWER_WIDTH = this.stageWidth;
        this.DRAWER_HEIGHT = this.stageHeight*(this.CANVAS_DRAWER_RATIO- this.DRAWER_BACK_DIFF_RATIO);
        this.DRAWERBACK_HEIGHT = this.stageHeight*this.CANVAS_DRAWER_RATIO;
        this.BUTTON_WIDTH =  this.DRAWER_WIDTH/10;
        this.BUTTON_HEIGHT = this.BUTTON_WIDTH/2;

        this.calculateDimensions();
        //this.loadGameState();
        this.initialise();

                /* Add title
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
        */
    }

    private calculateDimensions():void {
        const width = this.app.screen.width;
        const baseWidth = 756;
        const scale = width / baseWidth;
    } 

    private loadGameState() {
        return chirstmasTree
    }

    private saveGameState(): void {
       //this.loadedData = chirstmasTree
    }

    private initialise(): void {
        const app = this.app;
        app.stage.eventMode = 'static';
        app.stage.hitArea = this.app.screen;

        app.ticker.add((tick) => {
            Actions.tick(tick.deltaTime/60)
        });

        const loadedData = this.loadGameState();

        const [canvasBackground, containerEmblem] = this.drawEmblemBackground(loadedData);
        this.toggleEmblemFilter(containerEmblem, true)

        const containerPieces = this.drawEmblem(loadedData, false);
        // setup event for each pieces and jumble up
        containerPieces.children.forEach(child => {
            child.eventMode = 'static';
            child.cursor = 'pointer';
            child.on('pointerdown', onDragStart);

            //jumble
            child.x = Math.random() * app.screen.width;
            child.y = Math.random() * app.screen.height;
        });

        let PIECE_TOLERANCE = this.PIECE_TOLERANCE;

        let dragTarget:PIXI.Graphics|null = null;
        let isDragging = false;
  
        app.stage.on('pointerup', onDragEnd);
        app.stage.on('pointerupoutside', onDragEnd);

        function onDragMove(event){
            if (dragTarget){
                // reduce transparency of other pieces
                if (!isDragging){
                    containerPieces.children.forEach(child => {
                        if (child != dragTarget){
                            child.alpha = 0.5
                        }
                    });
                    isDragging = true
                }
                dragTarget.parent.toLocal(event.global, null, dragTarget.position);
            };
        }

        function onDragStart(){
            // Store a reference to the data
            // * The reason for this is because of multitouch *
            // * We want to track the movement of this particular touch *
            dragTarget = this;
            app.stage.on('pointermove', onDragMove);
        };

        function onDragEnd(){
            if (dragTarget){
                isDragging = false;
                app.stage.off('pointermove', onDragMove);

                containerPieces.children.forEach(child => {
                    if (child != dragTarget){
                        child.alpha = 1
                    }
                });

                let pieceIndex = containerPieces.getChildIndex(dragTarget)
                let correspondingPiece = containerEmblem.getChildAt(pieceIndex)
                let distDiffX = Math.pow((dragTarget.x - correspondingPiece.x),2);
                let distDiffY = Math.pow((dragTarget.y - correspondingPiece.y),2);
                let distDif = Math.round(Math.sqrt(distDiffX+distDiffY))

                if (distDif <= app.screen.height*PIECE_TOLERANCE) {
                    dragTarget.position = correspondingPiece.position
                }
  
                dragTarget = null;
            }
        };

        const containerLayer = this.drawerLayers(); 
        this.toggleLayerFilter(containerLayer, true)

        const containerDrawer = this.drawDrawerContainer(containerEmblem, containerPieces);
        

        app.stage.addChild(canvasBackground);
        app.stage.addChild(containerEmblem);
        app.stage.addChild(containerPieces);
        this.app.stage.addChild(containerDrawer);
    }

    private drawEmblemBackground(loadedData):Array<[PIXI.Graphics,PIXI.Container]>{
        let containerEmblem = this.drawEmblem(loadedData, true);
        let canvasBackground = containerEmblem.getChildAt(0);
        containerEmblem.removeChildAt(0);

        return [canvasBackground, containerEmblem]
    }

    private toggleEmblemFilter(container: PIXI.Container, turnOn: boolean):void{
        if (turnOn) {
            const filterBlur = new PIXI.BlurFilter({strength: 10});
            let colorMatrix = new PIXI.ColorMatrixFilter();
            let colorMatrix2 = new PIXI.ColorMatrixFilter();
            colorMatrix.blackAndWhite(true);
            colorMatrix2.contrast(0.3,true);
            container.filters = [colorMatrix, colorMatrix2, filterBlur];
            container.cacheAsTexture({antialias:true, resolution:0.9});
 
        } else {
            container.cacheAsTexture(false);
            container.filters = null;
        }
    }

    private toggleLayerFilter(container: PIXI.Container, turnOn: boolean):void{
        if (turnOn) {
 
        } else {

        }
    }

    private drawEmblem(data, includeBackground: boolean):PIXI.Container{
        const containerEmblem = new PIXI.Container();
        for (const [key, value] of Object.entries(data)){       
            const newShape = createShapes(
                this.stageWidth,
                value.props,
                value.scale,
                value.position,
                value.rotation,
            );

            if (key == "0" && !includeBackground){ continue }
            containerEmblem.addChild(newShape);
        }
        return containerEmblem
    }

    private drawLayerButtons(){
        // Container
        const containerLayer = new PIXI.Container();
    
        const DRAWERBACK_HEIGHT = this.DRAWERBACK_HEIGHT;
        const BUTTON_WIDTH =  this.BUTTON_WIDTH;
        const BUTTON_HEIGHT = this.BUTTON_HEIGHT;

        function createButton(x: number, y: number):PIXI.Graphics{
            const button =  new PIXI.Graphics()
            .filletRect(0, 0, BUTTON_WIDTH, BUTTON_HEIGHT,5)
            .fill({ color: 0x364F6B })
            .stroke({ color: 0xF5F5F5, width: 2, alignment: 0});
    
            button.position.set(x, y);
            button.eventMode = 'static';
            button.cursor = 'pointer';

            return button
        }
        function createButtonIcon(x: number, y: number, iconName: string, rotation: number):PIXI.Graphics{
            const icon = PIXI.Sprite.from(iconName);
            // line it up as this svg is not centered
            const bounds = icon.getLocalBounds();
            icon.pivot.set((bounds.x + bounds.width) / 2, (bounds.y + bounds.height) / 2);
            icon.scale.set(0.03);
            icon.eventMode = 'none';

            // Create a color matrix filter
            const filter = new PIXI.ColorMatrixFilter();
            filter.negative(true);
            icon.filters=[filter];

            icon.position.set(x, y);
            return icon
        }

        const boxButtonY = this.stageHeight - DRAWERBACK_HEIGHT - BUTTON_HEIGHT;
        const boxButtonX = this.BUTTON_SPACING;
        const zUpButton = createButton(boxButtonX, boxButtonY);

        const boxIconX = boxButtonX + (BUTTON_WIDTH/2);
        const boxIconY = boxButtonY + (BUTTON_HEIGHT/2);
        const zUpIcon = createButtonIcon(boxIconX, boxIconY, 'align_arrow', 0);

        zUpButton.on('pointerdown', ()=>{

        });

        containerLayer.addChild(zUpButton);
        containerLayer.addChild(zUpIcon);

        return containerLayer
    }

    private drawDrawerContainer(containerEmblem, containerPieces):PIXI.Container {
        const DRAWERBACK_HEIGHT = this.DRAWERBACK_HEIGHT;
        const BUTTON_WIDTH =  this.BUTTON_WIDTH;
        const BUTTON_HEIGHT = this.BUTTON_HEIGHT;
   
        // draw Canvas Container
        const containerDrawer = new PIXI.Container();

        const drawerBack = new PIXI.Graphics()
        .filletRect(0, 0, this.DRAWER_WIDTH, DRAWERBACK_HEIGHT, 5)
        .fill({color: 0x364F6B , alpha: 1})
        .stroke({ color: 0xF5F5F5, width: 2, alignment: 0});

        drawerBack.position.set(0, this.stageHeight-DRAWERBACK_HEIGHT);

        function createButton(x: number, y: number):PIXI.Graphics{
            const button =  new PIXI.Graphics()
            .filletRect(0, 0, BUTTON_WIDTH, BUTTON_HEIGHT,5)
            .fill({ color: 0x364F6B })
            .stroke({ color: 0xF5F5F5, width: 2, alignment: 0});
    
            button.position.set(x, y);
            button.eventMode = 'static';
            button.cursor = 'pointer';

            return button
        }

        function createButtonIcon(x: number, y: number, iconName: string):PIXI.Graphics{
            const icon = PIXI.Sprite.from(iconName);
            // line it up as this svg is not centered
            const bounds = icon.getLocalBounds();
            icon.pivot.set((bounds.x + bounds.width) / 2, (bounds.y + bounds.height) / 2);
            icon.scale.set(0.03);
            icon.eventMode = 'none';

            // Create a color matrix filter
            const filter = new PIXI.ColorMatrixFilter();
            filter.negative(true);
            icon.filters=[filter];

            icon.position.set(x, y);
            return icon
        }

        const boxButtonY = this.stageHeight - DRAWERBACK_HEIGHT - BUTTON_HEIGHT;
        const boxButtonX = this.BUTTON_SPACING;
        const boxButton = createButton(boxButtonX, boxButtonY);

        const boxIconX = boxButtonX + (BUTTON_WIDTH/2);
        const boxIconY = boxButtonY + (BUTTON_HEIGHT/2);
        const boxIcon = createButtonIcon(boxIconX, boxIconY, 'box_unpacked');
   
        const visButtonX = (this.BUTTON_SPACING *2) + BUTTON_WIDTH
        const visButton = createButton(visButtonX, boxButtonY);

        const visIconX = visButtonX + (BUTTON_WIDTH/2);
        const visIcon = createButtonIcon(visIconX, boxIconY, 'eye_off');

        let animRunning = false;
        let drawerToggle = true;
        function toggleDrawer():void{
            if (animRunning) return
            
            animRunning = true
            drawerToggle = !drawerToggle;

            boxIcon.texture = drawerToggle ? PIXI.Assets.get('box_unpacked') : PIXI.Assets.get('box_packed');

            if (drawerToggle) {
                Actions.sequence(
                    Actions.parallel(
                        Actions.moveTo(containerDrawer,0,0,0.5,Interpolations.fade),
                    ),
                    Actions.runFunc(()=>{
                        animRunning = false;
                    })
                ).play()

            } else {
                Actions.sequence(
                    Actions.parallel(
                        Actions.moveTo(containerDrawer,0,DRAWERBACK_HEIGHT,0.5,Interpolations.fade),
                    ),
                    Actions.runFunc(()=>{
                        animRunning = false;
                    })
                ).play()
            }
        }
        
        boxButton.on('pointerdown', toggleDrawer);

        // toggle Visibility
        let visToggle = false
        visButton.on('pointerdown', ()=>{ 
            if (animRunning) return
            visToggle = !visToggle;
            visIcon.texture = visToggle ? PIXI.Assets.get('eye_off') : PIXI.Assets.get('eye_on');

            if (visToggle){
                this.toggleEmblemFilter(containerEmblem, false);
                containerPieces.alpha = 0;

            }else{
                this.toggleEmblemFilter(containerEmblem, true);
                containerPieces.alpha = 1;
            }
        });

        containerDrawer.addChild(boxButton);
        containerDrawer.addChild(visButton);
        containerDrawer.addChild(drawerBack);
        containerDrawer.addChild(boxIcon);
        containerDrawer.addChild(visIcon)

        toggleDrawer()

        return containerDrawer
    }






    
    private drawGameContainers2() {
        const DRAWER_WIDTH = this.DRAWER_WIDTH;
        const DRAWER_HEIGHT = this.DRAWER_HEIGHT;
        const DRAWERBACK_HEIGHT = this.DRAWERBACK_HEIGHT;
        const BUTTON_WIDTH =  this.BUTTON_WIDTH;
        const BUTTON_HEIGHT = this.BUTTON_HEIGHT;

        // draw Canvas Container
        const containerDrawer = new PIXI.Container();
    
        // draw Drawer
        const drawerBack = new PIXI.Graphics()
            .filletRect(0, 0, DRAWER_WIDTH, DRAWERBACK_HEIGHT, 5)
            .fill({color: 0x364F6B , alpha: 1})
            .stroke({ color: 0xF5F5F5, width: 2, alignment: 0});

        drawerBack.position.set(0, this.stageHeight-DRAWERBACK_HEIGHT);

        const drawerBackbutton =  new PIXI.Graphics()
            .filletRect(0, 0, BUTTON_WIDTH, BUTTON_HEIGHT,5)
            .fill({ color: 0x364F6B })
            .stroke({ color: 0xF5F5F5, width: 2, alignment: 0});
        const drawerBackX = this.stageWidth - BUTTON_WIDTH - 7;
        const drawerBackY = this.stageHeight - DRAWERBACK_HEIGHT - BUTTON_HEIGHT;
        drawerBackbutton.position.set(drawerBackX, drawerBackY );

        //create close and open drawer button
        const buttonCircleArrow = new PIXI.Graphics()
            .circle(0,0,(BUTTON_HEIGHT/2)-6)
            .stroke({ color: 0xFC5185, width: 3, alignment: 0})
            .moveTo(-BUTTON_HEIGHT/6,-BUTTON_HEIGHT/6)
            .lineTo(0,BUTTON_HEIGHT/8)
            .lineTo(BUTTON_HEIGHT/6,-BUTTON_HEIGHT/6)
            .stroke({ color: 0xFC5185, width: 3});
                    
        const buttonCircleArrowX = drawerBackX + (BUTTON_WIDTH/2);;
        const buttonCircleArrowY = drawerBackY + (BUTTON_HEIGHT/2);
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
                        Actions.rotateTo( buttonCircleArrow, 0, 0.5, Interpolations.fade)
                    ),
                    Actions.runFunc(()=>{
                        animRunning = false;
                    })
                ).play()

            } else {
                Actions.sequence(
                    Actions.parallel(
                        Actions.moveTo(containerDrawer,0,DRAWERBACK_HEIGHT,0.5,Interpolations.fade),
                        Actions.rotateTo( buttonCircleArrow, Math.PI, 0.5, Interpolations.fade)
                    ),
                    Actions.runFunc(()=>{
                        animRunning = false;
                    })
                ).play()
            }
        }
        toggleDrawer()

        drawerBackbutton.eventMode = 'static';
        drawerBackbutton.cursor = 'pointer';
        drawerBackbutton.on('pointerdown',toggleDrawer);

        containerDrawer.addChild(drawerBackbutton);
        containerDrawer.addChild(drawerBack);
        containerDrawer.addChild(buttonCircleArrow);

        const drawer = new PIXI.Graphics()
            .filletRect(0, 0, DRAWER_WIDTH, DRAWER_HEIGHT, 0)
            .fill({color: 0xF5F5F5, alpha: 1})
            .stroke({ color: 0x364F6B, width: 2, alignment: 0});

        drawer.position.set(0, this.stageHeight-DRAWER_HEIGHT);

        // create tab buttons
        const containerButtons = new PIXI.Container();
        const Buttons: Array<PIXI.Graphics> = [];
        const MapButtonCallback = [];
        let tabSelection = 0;
        const noOfButton = 4
 
        const buttonTabCover = new PIXI.Graphics()
            .filletRect(0, 0, BUTTON_WIDTH, BUTTON_HEIGHT,5)
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
                            .stroke({ color: 0x364F6B, width: 2, alignment: 0});
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

        containerDrawer.addChild(containerButtons);
        containerDrawer.addChild(drawer);
        containerDrawer.addChild(buttonTabCover);

        /*
        const drawerOptions = this.drawerSizeRot();
        drawerOptions.position.set(DRAWER_WIDTH/2, this.stageHeight - DRAWER_HEIGHT);
        containerDrawer.addChild(drawerOptions)
        */
        this.drawerLayers()

        this.app.stage.addChild(containerDrawer);
    }

    private drawerLayers():PIXI.Container {
        const BUTTON_HEIGHT = this.BUTTON_WIDTH/3;

        function createArrowButton():PIXI.Graphics{
            return new PIXI.Graphics()
                .circle(0,0,(BUTTON_HEIGHT/2)-4)
                .stroke({ color: 0xFC5185, width: 3, alignment: 0})
                .moveTo(-BUTTON_HEIGHT/4,-BUTTON_HEIGHT/6)
                .lineTo(0,BUTTON_HEIGHT/6)
                .lineTo(BUTTON_HEIGHT/4,-BUTTON_HEIGHT/6)
                .stroke({ color: 0xF5F5F5, width: 3});
        }

    /* / Create window frame
    let frame = new PIXI.Graphics({
        x:320 - 104,
        y:180 - 104
      })
      .rect(0, 0, 208, 208)
      .fill(0x666666)
      .stroke({ color: 0xffffff, width: 4, alignment: 0 })
      
      this.app.stage.addChild(frame);
      
      // Create a graphics object to define our mask
      let mask = new PIXI.Graphics()
      // Add the rectangular area to show
       .rect(0,0,200,200)
       .fill(0xffffff);
      
      // Add container that will hold our masked content
      let maskContainer = new PIXI.Container();
      // Set the mask to use our graphics object from above
      maskContainer.mask = mask;
      // Add the mask as a child, so that the mask is positioned relative to its parent
      maskContainer.addChild(mask);
      // Offset by the window's frame width
      maskContainer.position.set(4,4);
      // And add the container to the window!
      frame.addChild(maskContainer);
      
      // Create contents for the masked container
      let text = new PIXI.Text({
        text:'This text will scroll up and be masked, so you can see how masking works.  Lorem ipsum and all that.\n\n' +
        'You can put anything in the container and it will be masked!',
        style:{
          fontSize: 24,
          fill: 0x1010ff,
          wordWrap: true,
          wordWrapWidth: 180
        },
        x:10
      });
      
      maskContainer.addChild(text);
        */
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