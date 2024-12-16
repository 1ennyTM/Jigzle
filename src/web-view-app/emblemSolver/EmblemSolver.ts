
//@ts-nocheck 
import * as PIXI from 'pixi.js';
import { sound } from '@pixi/sound';
import { Actions , Interpolations } from 'pixi-actions';
import drawSlider from './drawSlider';
import chirstmasTree from '../presets/ChristmasTree.json';
import { createShapes } from '../shapes/createShapes';

function lerp(a :number, b:number, t:number):number{
    return a + ((b-a) * t)
}

function formatDuration(durationInSeconds: number): string {
    const seconds = Math.floor(durationInSeconds % 60);
    const hours = Math.floor((durationInSeconds/3600) % 24);
    const minutes = Math.floor((durationInSeconds/60) % 60);
  
    let formattedDuration = [];
  
    if (hours > 0) {
      formattedDuration.push(`${hours}h`);
    }
  
    if (minutes > 0) {
      formattedDuration.push(`${minutes}m`);
    }
  
    if (seconds > 0 && formattedDuration.length < 2) {
      formattedDuration.push(`${seconds}s`);
    }
    return formattedDuration.join(' ');
}

function formatPuzzleText(count, totalPieces){
    let formattedText = [];
    if (count <10){
        formattedText.push(`0${count} /`);
    }
    else{
        formattedText.push(`${count} /`);
    }
    if (totalPieces < 10){
        formattedText.push(`0${totalPieces}`);
    }
    else{
        formattedText.push(`${totalPieces}`);
    }
    return formattedText.join(' ');; 
}

function overlappingArea(l1, r1, l2, r2){
    let x = 0
    let y = 1

    // Area of 1st Rectangle
    let area1 = Math.abs(l1[x] - r1[x]) * Math.abs(l1[y] - r1[y])

    // Area of 2nd Rectangle
    let area2 = Math.abs(l2[x] - r2[x]) * Math.abs(l2[y] - r2[y])

    // Length of intersecting part i.e 
    // start from max(l1[x], l2[x]) of 
    // x-coordinate and end at min(r1[x],
    // r2[x]) x-coordinate by subtracting 
    // start from end we get required 
    // lengths 
    let x_dist = (Math.min(r1[x], r2[x]) -
            Math.max(l1[x], l2[x]))

    let y_dist = (Math.min(r1[y], r2[y]) -
            Math.max(l1[y], l2[y]))
    let areaI = 0
    if (x_dist > 0 && y_dist > 0)
        areaI = x_dist * y_dist

    return (area1 + area2 - areaI)
}

function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
}
function clamp(num: number, lower: number, upper: number) {
    return Math.min(Math.max(num, lower), upper);
}

function isChildOf(parent, child):boolean{
    const children = parent.children
    for (let i = 0; i < children.length; i++){
        if (children[i] == child){
            return true;
    }}
    return false
}

let volume = 1;
let bgMusic
function playBgMusic(){
    function loopMusic(){
        bgMusic = sound.play('bgMusic1');
        bgMusic.volume = volume;
        bgMusic.on('progress', function(progress) {
            if (progress >0.96){
                bgMusic.stop;
                bgMusic.off('progress');
                loopMusic();
            }
        });
    }
    loopMusic();
}
function playBackSound(){
    const clip = sound.play('back');
    clip.volume = volume;
}

function playClickSound(){
    const tracks = ['click','click2'];
    let track = tracks[Math.floor(Math.random() * tracks.length)];
    let clip = sound.play(track);
    clip.volume = volume;
}

function playSuccessSound(success:boolean, count){
    let clip
    if(success){ 
        clip = sound.play('success');
    }else{
        clip = sound.play('fail');
    };
    clip.volume = volume;
}

function playPickSound(pick:boolean){
    let clip
    if(pick){ 
        clip =sound.play('pick');
    }else{
        clip =sound.play('unpick');
    };
    clip.volume = volume;
}

export class EmblemSolver {
    private readonly app: PIXI.Application;
 
    private currentShape: PIXI.Graphics| null;
    private stageHeight: number;
    private stageWidth: number;

    private PIECE_DIST_TOLERANCE = 0.02; // % of sceen height
    private PIECE_AREA_TOLERANCE = 0.95; // % of area must fit to original

    private SHAPE_SCALE_MIN = 0.1;
    private SHAPE_SCALE_MAX = 4;
    private SHAPE_ROT_ANGLE = 22.5; //degree

    private FONT_SIZE: number = 16;
    private FONT_COLOR: number = 0xFFFFFF;
    private FONT_FAMILY: string = 'Arial';

    private SHOVE_STRENGTH: number = 0.4;
    private PIECE_DRAWER_RATIO: number = 0.3;
    private CANVAS_DRAWER_RATIO: number = 0.2;
    private DRAWER_BACK_DIFF_RATIO:number = 0.05;
    private DRAWER_WIDTH: number;
    private DRAWER_HEIGHT: number;
    private DRAWERBACK_HEIGHT: number;
    private BUTTON_WIDTH: number;
    private BUTTON_HEIGHT: number;
    private BUTTON_SPACING = 10;

    constructor(app: PIXI.Application){
        this.app = app;

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
    }

    private calculateDimensions():void {
        const width = this.app.screen.width;
        const baseWidth = 756;
        const scale = width / baseWidth;
    } 

    private loadGameState() {
        return chirstmasTree
    }


    private initialise(): void {
        // Setup app
        playBgMusic();

        let timer = 0;

        const app = this.app;
        app.stage.eventMode = 'static';
        app.stage.hitArea = this.app.screen;

        app.stage.on('pointerup', onDragEnd);
        app.stage.on('pointerupoutside', onDragEnd);

        //load game state
        const loadedData = this.loadGameState();
        let [canvasBackground, containerEmblem, totalPieces] = this.drawEmblemBackground(loadedData);

        totalPieces-- ;// remove emblem background from the count

        const [containerBanner, startBut, puzzleTxt, timerTxt] = this.drawScreenOverlay(totalPieces);

        app.stage.addChild(canvasBackground);
        app.stage.addChild(containerEmblem);
        //app.stage.addChild(containerBanner);

        //return
        
        const [containerPieces, _] = this.drawEmblem(loadedData, false);
        const rotAngle = (this.SHAPE_ROT_ANGLE/180)*Math.PI;

        // setup event for each pieces and jumble up
        
        let successfulPieces = [];
        containerPieces.children.forEach(child => {

            child.eventMode = 'static';
            child.cursor = 'pointer';
            child.on('pointerdown', onDragStart);

            //jumble location
            const newX = Math.random() * app.screen.width;
            const newY = Math.random() * app.screen.height;
            
            //jumble rotation
            const randomRot = (Math.random() * Math.PI * 2);
            //remove floating points and remainder
            const noOfRotation = Math.round((randomRot - (randomRot % rotAngle))/rotAngle);
            const newRot = child.rotation + (noOfRotation * rotAngle);

            //jumble animation
            Actions.sequence(
                Actions.delay(5),
                Actions.parallel(
                    Actions.moveTo(child,newX,newY,1,Interpolations.smooth),
                    Actions.rotateTo(child,newRot,1,Interpolations.smooth),
                ),
            ).play()
        });

        const [containerTimer, 
            puzzleText, timerText
        ] = this.drawHUD(totalPieces);

        const[containbotHUD,
            visButton, visIcon,
            containDraw, containDrawText, drawerBg,
            containBoxBut, boxButton, boxIcon,
            containRotRightBut, RotRightBut, rotRightIcon,
            containRotLeftBut, RotLeftBut, 
            containZUpBut, zUpBut, zUpIcon,
            containZDownBut, zDownBut, zDownIcon,
            containlayerDis, layerText
        ] = this.drawDrawerContainer(totalPieces);
  
        let dragTarget:PIXI.Graphics|null = null;
        let currentPiece: PIXI.Graphics|null = null;

        let isDragging = false;
        let PIECE_DIST_TOLERANCE = this.PIECE_DIST_TOLERANCE;
        let PIECE_AREA_TOLERANCE = this.PIECE_AREA_TOLERANCE;

        let volumeToggle = 3;
        function selectVolButIcon(){
            if (volumeToggle==1) {
                zDownIcon.texture = PIXI.Assets.get('sound_off');
            } else if(volumeToggle==2){
                zDownIcon.texture = PIXI.Assets.get('sound_low');
            } else{
                zDownIcon.texture = PIXI.Assets.get('sound_high');
            };
        }
        function turnOnVolumeButton(){
            selectVolButIcon();

            zDownBut.on('pointerdown',() =>{
                volumeToggle++;
                volumeToggle = volumeToggle%3;
                selectVolButIcon()
                if (volumeToggle==1) {
                    volume = 0;
                    bgMusic.pause;
                } else if(volumeToggle==2){
                    volume = 0.5;
                    bgMusic.resume;
                    bgMusic.volume = volume;
                } else{
                    volume = 1;
                    bgMusic.volume = volume;
                };
                
            });
        };
        turnOnVolumeButton();

        let islock = false;
        function turnOnLockButton(){
            zUpIcon.texture = islock ? PIXI.Assets.get('lock') : PIXI.Assets.get('unlock');

            zUpBut.on('pointerdown',() =>{
                islock = !islock;
                zUpIcon.texture = islock ? PIXI.Assets.get('lock') : PIXI.Assets.get('unlock');

                if (islock){
                    playClickSound();
                    for (let i = 0; i < successfulPieces.length; i++) {
                        successfulPieces[i].eventMode = 'none';
                        successfulPieces[i].cursor = 'default';
                        successfulPieces[i].off('pointerdown');
                    }                 
                }else{
                    playBackSound();
                    for (let i = 0; i < successfulPieces.length; i++) {
                        successfulPieces[i].eventMode = 'static';
                        successfulPieces[i].cursor = 'pointer';
                        successfulPieces[i].on('pointerdown', onDragStart);
                    };
                }
            })
        }
        turnOnLockButton();

        function onCompletion(){
            console.log("You Win")
        }

        function onSuccessfulPlacement(piece){
            if (!successfulPieces.includes(piece)){
                successfulPieces.push(piece);
                puzzleText.text = formatPuzzleText(successfulPieces.length,totalPieces);
                playSuccessSound(true);

                if (islock){
                    piece.eventMode = 'none';
                    piece.cursor = 'default';
                    piece.off('pointerdown');      
                }

                if(successfulPieces.length == totalPieces){onCompletion()};
            }
        }

        function onUnsuccessfulPlacement(piece){
            if (successfulPieces.includes(piece)){
                const index = successfulPieces.indexOf(piece);
                if (index > -1) { // only splice array when item is found
                    successfulPieces.splice(index, 1); // 2nd parameter means remove one item only
                }
                puzzleText.text = formatPuzzleText(successfulPieces.length,totalPieces);
                playSuccessSound(false);
            }
        }

        function onCheckPlacement(currentPiece:PIXI.Graphics){
            let pieceIndex = currentPiece.zIndex
            let correspondingPiece = containerEmblem.getChildAt(pieceIndex)

            let bounds1 = currentPiece.getBounds();
            let bounds2 = correspondingPiece.getBounds();

            //distance check
            let distDiffX = Math.pow((bounds1.x - bounds2.x),2);
            let distDiffY = Math.pow((bounds1.y - bounds2.y),2);
            let distDif = Math.round(Math.sqrt(distDiffX+distDiffY));

            if (distDif <= app.screen.height*PIECE_DIST_TOLERANCE) {
                bounds1 = currentPiece.getBounds();
                bounds2 = correspondingPiece.getBounds();
                const areaOverlap = overlappingArea(
                    [bounds1.x, bounds1.y - bounds1.height],
                    [bounds1.x + bounds1.width, bounds1.y],
                    [bounds2.x, bounds2.y - bounds2.height],
                    [bounds2.x + bounds2.width, bounds2.y],
                );

                //rotation check using area
                const area = bounds2.height * bounds2.width;
                const areaRatio = area/areaOverlap;

                if (areaRatio >= PIECE_AREA_TOLERANCE){
                    currentPiece.position = correspondingPiece.position;
                    onSuccessfulPlacement(currentPiece);
                }else{
                    onUnsuccessfulPlacement(currentPiece);
                }
            }else{
                onUnsuccessfulPlacement(currentPiece);
            }
        }

        const containHolding = new PIXI.Container();
        containDraw.addChild(containHolding)

        const DRAWERBACK_HEIGHT = this.DRAWERBACK_HEIGHT;
        const stageHeight = this.stageHeight;
        const minHeight = stageHeight - DRAWERBACK_HEIGHT;
        let shove = stageHeight*this.SHOVE_STRENGTH
        function shovePiece(piece):void{
            const x = clamp(randomNumber(piece.position.x-shove, piece.position.x+shove),0,stageHeight);
            const y = clamp(randomNumber(minHeight, minHeight-shove), 0, stageHeight-DRAWERBACK_HEIGHT)
            const t = randomNumber(0.5,1.5);
            Actions.moveTo(piece,x,y,t,Interpolations.fade).play()
        }

        let animRunning = false;
        let drawerToggle = false;
        let PIECE_DRAWER_RATIO = this.PIECE_DRAWER_RATIO;
        function toggleDrawer():void{
            if (animRunning) return
            animRunning = true

            onPieceDelection()
            
            boxIcon.texture = drawerToggle ? PIXI.Assets.get('box_packed') : PIXI.Assets.get('box_unpacked');

            drawerToggle = !drawerToggle;
            if (!drawerToggle) {
                playClickSound()
                Actions.sequence(
                    Actions.moveTo(containbotHUD,0,0,0.5,Interpolations.fade),
                    Actions.runFunc(()=>{animRunning = false;})
                ).play()
                drawerBg.alpha = 0.7;  
                //push pieces behind drawer up

                containerPieces.children.forEach(child => {
                    if (child.position.y >= minHeight && !successfulPieces.includes(child)){
                        shovePiece(child)
                    }
                });

                //activate unload button
                rotRightIcon.texture = PIXI.Assets.get('unload');
                containRotRightBut.alpha = 1;
                RotRightBut.cursor = 'pointer';
                let i = 0;
                RotRightBut.on('pointerdown',() =>{
                    playClickSound()
                    let dasd =  containHolding.children
                    dasd.forEach(child => {
                        containerPieces.reparentChild(child)
                        shovePiece(child)
                        let scaleUpX = child.scale.x/PIECE_DRAWER_RATIO;
                        let scaleUpY = child.scale.y/PIECE_DRAWER_RATIO;
                        Actions.scaleTo(child, scaleUpX,scaleUpY,0.5,Interpolations.linear).play();
                        i++
                    });
                    let dasae =  containHolding.children
                    console.log(dasd.length,dasae.length);
                    i=0;
                })
  

            } else {
                playBackSound()
                Actions.sequence(
                    Actions.moveTo(containbotHUD,0,DRAWERBACK_HEIGHT,0.5,Interpolations.fade),
                    Actions.runFunc(()=>{animRunning = false;})
                ).play()
                drawerBg.alpha = 0.9;

                //deactivate unload button
                containRotRightBut.alpha = 0;
                RotRightBut.cursor = 'default';
                RotRightBut.off('pointerdown');
                rotRightIcon.texture = PIXI.Assets.get('rotate');
            }
        }
        boxButton.on('pointerdown', toggleDrawer);

        // toggle Visibility
        let currentLayer = totalPieces-1;
        let visToggle = false
        visButton.on('pointerdown', ()=>{ 
            if (!drawerToggle){toggleDrawer()};

            visToggle = !visToggle;
            visIcon.texture = visToggle ? PIXI.Assets.get('eye_off') : PIXI.Assets.get('eye_on');
            
            if (visToggle){
                playClickSound()
                this.toggleEmblemFilter(containerEmblem, false);
                
                containerPieces.alpha = 0.1;

                onPieceDelection()

                containBoxBut.alpha = 0;
                boxButton.off('pointerdown');
                boxButton.cursor = 'default';

                containlayerDis.alpha = 1;

                zUpBut.off('pointerdown');
                zUpIcon.texture = PIXI.Assets.get('align_arrow');

                zDownBut.off('pointerdown');
                zDownIcon.texture = PIXI.Assets.get('align_arrow');
                zDownIcon.scale.y *= -1;

                let i = 0;
                containerEmblem.children.forEach(child => {
                    if (i > currentLayer){
                        child.alpha = 0;
                    }
                    i++
                });

                zUpBut.on('pointerdown',() =>{
                    if (currentLayer < totalPieces-1){
                        playClickSound()
                        currentLayer++
                        let currentPiece = containerEmblem.getChildAt(currentLayer)
                        currentPiece.alpha = 1

                        layerText.text = formatPuzzleText(currentLayer+1, totalPieces);
                    }
                })
                zDownBut.on('pointerdown', () =>{

                    if (currentLayer >= 0){
                        playClickSound()
                        let currentPiece = containerEmblem.getChildAt(currentLayer)
                        currentPiece.alpha = 0;
                        currentLayer--;
                        
                        layerText.text = formatPuzzleText(currentLayer+1, totalPieces);
                    }
                })

                layerText.text = formatPuzzleText(currentLayer+1, totalPieces);

            }else{
                playBackSound()
                this.toggleEmblemFilter(containerEmblem, true);
                containerPieces.alpha = 1;

                containBoxBut.alpha = 1;
                boxButton.on('pointerdown', toggleDrawer);
                boxButton.cursor = 'pointer';

                containlayerDis.alpha = 0;

                zUpBut.off('pointerdown');
                zDownBut.off('pointerdown');
                zDownIcon.scale.y *= -1;

                turnOnVolumeButton()
                turnOnLockButton()
      
                containerEmblem.children.forEach(child => {
                    child.alpha = 1;
                });
            }
        });

        function onDragMove(event){
            if (dragTarget == null){return}

            // reduce transparency of other pieces
            if (!isDragging){
                containerPieces.children.forEach(child => {
                    if (child != dragTarget){
                        child.alpha = 0.5;
                    }
                });
                isDragging = true;
            }
            dragTarget.parent.toLocal(event.global, null, dragTarget.position);

            if (!drawerToggle){onDrawDragMove()}
        }

        function onDragStart(){
            if (visToggle){return};
            playPickSound(true);

            // Store a reference to the data
            // * The reason for this is because of multitouch *
            // * We want to track the movement of this particular touch *
            dragTarget = this;
            if (!drawerToggle){
                onDrawDragStart()
            }else{
                onPieceDelection()
                onPieceSelection(dragTarget)
            }
            
            app.stage.on('pointermove', onDragMove);
        };
        
        function onDragEnd(){
            if (dragTarget == null){ return}
            
            isDragging = false;
            app.stage.off('pointermove', onDragMove);

            containerPieces.children.forEach(child => {
                if (child != dragTarget){
                    child.alpha = 1
                }
            });

            if (!drawerToggle){
                onDrawerDragEnd();
            }else{
                onCheckPlacement(dragTarget);
            }
            playPickSound(false);
            dragTarget = null;
        };

        let isChildOfHold, isChildOfPieces, newPiece = false;
        function onDrawDragStart(){
            currentPiece = null;

            drawerBg.alpha = 0.9;

            isChildOfHold = isChildOf(containHolding, dragTarget)
            isChildOfPieces = isChildOf(containerPieces, dragTarget)
            if (!isChildOfHold){
                containHolding.reparentChild(dragTarget)
                newPiece = true;
            } 
        };

        let dragScaleToggle = false;
        function onDrawDragMove(){
            let distDiffY = (dragTarget.y - drawerBg.y);
        
            if (newPiece){
                if (distDiffY >= 0 && !dragScaleToggle){
                    let scaleUpX = dragTarget.scale.x*PIECE_DRAWER_RATIO;
                    let scaleUpY = dragTarget.scale.y*PIECE_DRAWER_RATIO;
                    dragTarget.scale.set(scaleUpX, scaleUpY);
                    dragScaleToggle = true;
                }else if (distDiffY < 0 && dragScaleToggle){
                    let scaleDownX = dragTarget.scale.x/PIECE_DRAWER_RATIO;
                    let scaleDownY = dragTarget.scale.y/PIECE_DRAWER_RATIO;
                    dragTarget.scale.set(scaleDownX, scaleDownY);
                    dragScaleToggle = false;
                }
            }else{
                if (distDiffY >= 0 && dragScaleToggle){
                    let scaleUpX = dragTarget.scale.x*PIECE_DRAWER_RATIO;
                    let scaleUpY = dragTarget.scale.y*PIECE_DRAWER_RATIO;
                    dragTarget.scale.set(scaleUpX, scaleUpY);
                    dragScaleToggle = false;
                }else if (distDiffY < 0 && !dragScaleToggle){
                    let scaleDownX = dragTarget.scale.x/PIECE_DRAWER_RATIO;
                    let scaleDownY = dragTarget.scale.y/PIECE_DRAWER_RATIO;
                    dragTarget.scale.set(scaleDownX, scaleDownY);
                    dragScaleToggle = true;
                }
            }
        };

        function onDrawerDragEnd(){
            dragScaleToggle = false
            drawerBg.alpha = 0.7;

            let distDiffY = (dragTarget.y - drawerBg.y);
            if (distDiffY <= 0){
                containerPieces.reparentChild(dragTarget)

            };
            isChildOfHold = null;
            isChildOfPieces = null;
            newPiece = false; 
        };

        function onPieceSelection(currentPiece){
            currentPiece = currentPiece;
            containRotLeftBut.alpha = 1;
            containRotRightBut.alpha = 1;
    
            RotRightBut.cursor = 'pointer';
            RotLeftBut.cursor = 'pointer';

            RotRightBut.on('pointerdown',() =>{
                playClickSound()
                currentPiece.rotation += rotAngle
                onCheckPlacement(currentPiece)
            })
            RotLeftBut.on('pointerdown', () =>{
                playClickSound()
                currentPiece.rotation -= rotAngle
                onCheckPlacement(currentPiece)
            })

            containlayerDis.alpha = 1;
            layerText.text = formatPuzzleText(currentPiece.zIndex+1, totalPieces);
        };

        function onPieceDelection(){
            currentPiece = null;

            if(drawerToggle){
                containRotRightBut.alpha = 0;
                RotRightBut.off('pointerdown');
                RotRightBut.cursor = 'default';
            }

            containRotLeftBut.alpha = 0;
            RotLeftBut.off('pointerdown');
            RotLeftBut.cursor = 'default';

            containlayerDis.alpha = 0;
        };
   
        // Deselect
        canvasBackground.eventMode = 'static';
        canvasBackground.on('pointerdown',()=>{
            onPieceDelection()
        });

        containerEmblem.interactiveChildren = false;
        this.toggleEmblemFilter(containerEmblem, true);
        toggleDrawer()
        onPieceDelection();

        app.stage.addChild(containerPieces);
        app.stage.addChild(containbotHUD);
        app.stage.addChild(containerTimer);

        let dt = 0;
        app.ticker.add((tick) => {
            dt = tick.deltaTime/60;
            Actions.tick(dt);

            timer += dt;
            timerText.text = formatDuration(timer);
        });
    }

    private drawEmblemBackground(loadedData):Array<[PIXI.Graphics,PIXI.Container, number]>{
        let [containerEmblem, totalPieces] = this.drawEmblem(loadedData, true);
        let canvasBackground = containerEmblem.getChildAt(0);
        containerEmblem.removeChildAt(0);

        return [canvasBackground, containerEmblem, totalPieces]
    }

    private toggleEmblemFilter(container: PIXI.Container, turnOn: boolean):void{
        if (turnOn) {
            const filterBlur = new PIXI.BlurFilter({strength: 10});
            let colorMatrix = new PIXI.ColorMatrixFilter();
            let colorMatrix2 = new PIXI.ColorMatrixFilter();
            colorMatrix.blackAndWhite(true);
            colorMatrix2.contrast(0.3,true);
            container.filters = [colorMatrix, colorMatrix2, filterBlur];
 
        } else {
            container.cacheAsTexture(false);
            container.filters = null;
        }
    }

    private drawEmblem(data, includeBackground: boolean):[PIXI.Container, number]{
        const containerEmblem = new PIXI.Container();
        let i=0;
        for (const [key, value] of Object.entries(data)){       
            const newShape = createShapes(
                this.stageWidth,
                value.props,
                value.scale,
                value.position,
                value.rotation,
            );
            newShape.zIndex = i;

            if (key == "0" && !includeBackground){ continue }
            containerEmblem.addChild(newShape);
            i++
        }
        return [containerEmblem, i]
    }

    private drawScreenOverlay(totalPieces):Array<[
        PIXI.Container,
        PIXI.Graphics,
        PIXI.Text, PIXI.Text,
    ]>{
        const BUTTON_HEIGHT = this.BUTTON_HEIGHT;

         //Banner
        const bgWidth = this.stageWidth/3
        const bannerBg =  new PIXI.Graphics()
        .filletRect(0, 0, this.stageWidth, this.stageWidth*1/3, 0)
        .fill({ color: 0x364F6B, alpha: 0.5})
        .stroke({ color: 0xF5F5F5, width: 2, alignment: 0});

        const filterBlur = new PIXI.BlurFilter({strength: 5});
        bannerBg.filters = [filterBlur];
        bannerBg.cacheAsTexture(true);

        const startButton =  new PIXI.Graphics()
        .filletRect(0, 0, this.stageWidth/10, this.stageWidth/10, 0)
        .fill({ color: 0x364F6B, alpha: 0.5})
        .stroke({ color: 0xF5F5F5, width: 2, alignment: 0});

        const timerBgY = 0;
        const timerBgX = this.stageWidth/2 - bgWidth/2;
        bannerBg.position.set(timerBgX, timerBgY);
   
        const puzzleIconX = timerBgX + (bgWidth*13/20);
        const puzzleIcon = this.createButtonIcon(puzzleIconX, this.stageWidth/2, 'puzzle');
        
        //Add No of puzzle
        const puzzleText = new PIXI.Text({
            text: formatPuzzleText(0, totalPieces),
                style: {
                    fill: '#F5F5F5',
                    fontFamily: 'Arial',
                    fontSize: 20,
                    align: 'left',
                },
            });
  
        puzzleText.roundPixels = true;
        puzzleText.anchor.set(-0.3,0.5);
        const puzzleTextX = timerBgX + (bgWidth*13/20);
        puzzleText.position.set(puzzleTextX, this.stageWidth/2);

        const timerText = new PIXI.Text({
            text: "",
            style: {
                fill: '#F5F5F5',
                fontFamily: 'Arial',
                fontSize: 20,
                align: 'left',
            },
        });

        timerText.roundPixels = true;
        timerText.anchor.set(0,0.5);
        const timerTextX = timerBgX + (bgWidth*4/20);
        timerText.position.set(timerTextX, this.stageWidth/2);
               
        const containerBanner = new PIXI.Container();
        containerBanner.interactiveChildren = false
        containerBanner.addChild(
            bannerBg,
            startButton,
            puzzleIcon,
            puzzleText,
            timerText,
        );

        return [containerBanner, startButton, puzzleText, timerText]
    }

    private drawHUD(totalPieces:number):Array<[PIXI.Container, PIXI.Text, PIXI.Text]>{
        const BUTTON_HEIGHT = this.BUTTON_HEIGHT;

         //timerBg
        const bgWidth = this.stageWidth/3
        const timerBg =  new PIXI.Graphics()
        .filletRect(0, 0, bgWidth, BUTTON_HEIGHT,5)
        .fill({ color: 0x364F6B, alpha: 0.5})
        .stroke({ color: 0xF5F5F5, width: 2, alignment: 0});

        const filterBlur = new PIXI.BlurFilter({strength: 5});
        timerBg.filters = [filterBlur];
        timerBg.cacheAsTexture(true);

        const timerBgY = 0;
        const timerBgX = this.stageWidth/2 - bgWidth/2;
        timerBg.position.set(timerBgX, timerBgY);
   
        const clockIconX = timerBgX + (bgWidth*2/20);
        const clockIconY = timerBgY + (BUTTON_HEIGHT/2);
        const clockIcon = this.createButtonIcon(clockIconX, clockIconY, 'clock');

        const puzzleIconX = timerBgX + (bgWidth*13/20);
        const puzzleIcon = this.createButtonIcon(puzzleIconX, clockIconY, 'puzzle');
        
        //Add No of puzzle
        const puzzleText = new PIXI.Text({
            text: formatPuzzleText(0,totalPieces),
                style: {
                    fill: '#F5F5F5',
                    fontFamily: 'Arial',
                    fontSize: 20,
                    align: 'left',
                },
            });
  
        puzzleText.roundPixels = true;
        puzzleText.anchor.set(-0.3,0.5);
        const puzzleTextX = timerBgX + (bgWidth*13/20);
        puzzleText.position.set(puzzleTextX, clockIconY);

        const timerText = new PIXI.Text({
            text: "",
            style: {
                fill: '#F5F5F5',
                fontFamily: 'Arial',
                fontSize: 20,
                align: 'left',
            },
        });

        timerText.roundPixels = true;
        timerText.anchor.set(0,0.5);
        const timerTextX = timerBgX + (bgWidth*4/20);
        timerText.position.set(timerTextX, clockIconY);
               
        const containerTimer = new PIXI.Container();
        containerTimer.interactiveChildren = false
        containerTimer.addChild(
            timerBg,
            clockIcon,
            puzzleIcon,
            puzzleText,
            timerText,
        );

        return [containerTimer, puzzleText, timerText]
    }

    private createButtonIcon(x: number, y: number, iconName: string):PIXI.Graphics{
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

    private drawDrawerContainer(totalPieces:number):Array<[
        PIXI.Container, 
        PIXI.Graphics, PIXI.Graphics,
        PIXI.Container, PIXI.Container, PIXI.Graphics,
        PIXI.Container, PIXI.Graphics, PIXI.Graphics,
        PIXI.Container, PIXI.Graphics, PIXI.Graphics,
        PIXI.Container, PIXI.Graphics, 
        PIXI.Container, PIXI.Graphics, PIXI.Graphics,
        PIXI.Container, PIXI.Graphics, PIXI.Graphics,
        PIXI.Container, PIXI.Text
        ]>{
        const DRAWERBACK_HEIGHT = this.DRAWERBACK_HEIGHT;
        const BUTTON_WIDTH =  this.BUTTON_WIDTH;
        const BUTTON_HEIGHT = this.BUTTON_HEIGHT;
   
        // bottom HUD Container
        const containbotHUD = new PIXI.Container();

        // drawer
        const drawerBack = new PIXI.Graphics()
        .filletRect(0, 0, this.DRAWER_WIDTH, DRAWERBACK_HEIGHT, 5)
        .fill({color: 0x364F6B , alpha: 1})
        .stroke({ color: 0xF5F5F5, width: 2, alignment: 0});
        const drawerBackY = this.stageHeight-DRAWERBACK_HEIGHT
        drawerBack.position.set(0, drawerBackY);

        // z-layer text
        const drawerInner = new PIXI.Graphics()
        .filletRect(0, 0, this.DRAWER_WIDTH*3/4, DRAWERBACK_HEIGHT*3/4, 5)
        .stroke({ color: 0xF5F5F5, width: 2, alignment: 0});
        const drawerInnerX = this.DRAWER_WIDTH/2 - this.DRAWER_WIDTH*3/8;
        const drawerInnerY = this.stageHeight - DRAWERBACK_HEIGHT*7/8
        drawerInner.position.set(drawerInnerX, drawerInnerY);

        const drawerText = new PIXI.Text({
            text:'This is a box, you can store your puzzle pieces here!',
                style: {
                    fill: '#F5F5F5',
                    fontFamily: 'Arial',
                    fontSize: 20,
                    align: 'center',
                },
            });
    
        drawerText.roundPixels = true;
        drawerText.anchor.set(0.5,0.5);
        const drawerTextY = this.stageHeight- (DRAWERBACK_HEIGHT/2)
        const drawerTextX = this.DRAWER_WIDTH/2;
        drawerText.position.set(drawerTextX, drawerTextY);

        const containerDrawerText = new PIXI.Container();
        containerDrawerText.addChild(drawerText,drawerInner)

        const containerDrawer = new PIXI.Container();
        containerDrawer.addChild(
            drawerBack,
            containerDrawerText
        );

        function createButton(x: number, y: number):PIXI.Graphics{
            const button =  new PIXI.Graphics()
            .filletRect(0, 0, BUTTON_WIDTH, BUTTON_HEIGHT,5)
            .fill({ color: 0x364F6B })
            .stroke({ color: 0xF5F5F5, width: 2, alignment: 0});
    
            button.position.set(x, y-1);
            button.eventMode = 'static';
            button.cursor = 'pointer';

            return button
        }

        //Box Button
        const boxButtonY = this.stageHeight - DRAWERBACK_HEIGHT - BUTTON_HEIGHT;
        const boxButtonX = this.stageWidth - BUTTON_WIDTH - this.BUTTON_SPACING;
        const boxButton = createButton(boxButtonX, boxButtonY);

        const boxIconX = boxButtonX + (BUTTON_WIDTH/2);
        const boxIconY = boxButtonY + (BUTTON_HEIGHT/2);
        const boxIcon = this.createButtonIcon(boxIconX, boxIconY, 'box_unpacked');

        const containerBoxBut = new PIXI.Container();
        containerBoxBut.addChild(boxButton, boxIcon);

        // rotate right button
        const rotateRightButtonX = boxButtonX - BUTTON_WIDTH - this.BUTTON_SPACING;
        const rotateRightButton = createButton(rotateRightButtonX, boxButtonY);

        const rotateRightIconX = rotateRightButtonX + (BUTTON_WIDTH/2);
        const rotateRightIcon = this.createButtonIcon(rotateRightIconX, boxIconY, 'rotate');

        const containerRotRightBut = new PIXI.Container();
        containerRotRightBut.addChild(rotateRightButton, rotateRightIcon)

        // rotate left button
        const rotateLeftButtonX = rotateRightButtonX - BUTTON_WIDTH - this.BUTTON_SPACING;
        const rotateLeftButton = createButton(rotateLeftButtonX, boxButtonY);
    
        const rotateLeftIconX = rotateLeftButtonX + (BUTTON_WIDTH/2);
        const rotateLeftIcon = this.createButtonIcon(rotateLeftIconX, boxIconY, 'rotate');
        rotateLeftIcon.scale.y *= -1;
        rotateLeftIcon.rotation = Math.PI;

        const containerRotLeftBut = new PIXI.Container();
        containerRotLeftBut.addChild(rotateLeftButton, rotateLeftIcon);

        //Visibility Button
        const visButtonX = this.BUTTON_SPACING;
        const visButton = createButton(visButtonX, boxButtonY);

        const visIconX = visButtonX + (BUTTON_WIDTH/2);
        const visIcon = this.createButtonIcon(visIconX, boxIconY, 'eye_off');

        const containerVisBut = new PIXI.Container();
        containerVisBut.addChild(visButton, visIcon);

        // Layer Button
        // z-Up button
        const zUpButtonX = (this.BUTTON_SPACING *2) + BUTTON_WIDTH;
        const zUpButton = createButton(zUpButtonX, boxButtonY);
      
        const zUpIconX = zUpButtonX + (BUTTON_WIDTH/2);
        const zUpIcon = this.createButtonIcon(zUpIconX, boxIconY, 'align_arrow');

        const containerzUpBut = new PIXI.Container();
        containerzUpBut.addChild(zUpButton, zUpIcon);

        // z-Down button
        const zDownButtonX = (this.BUTTON_SPACING *3) + (BUTTON_WIDTH*2);
        const zDownButton = createButton(zDownButtonX, boxButtonY);

        const zDownIconX = zDownButtonX + (BUTTON_WIDTH/2);
        const zDownIcon = this.createButtonIcon(zDownIconX, boxIconY, 'align_arrow');

        const containerzDownBut = new PIXI.Container();
        containerzDownBut.addChild(zDownButton, zDownIcon);

        // z-layer Bg
        const zBackground = new PIXI.Graphics()
        .filletRect(0, 0, BUTTON_WIDTH*2, BUTTON_HEIGHT,5)
        .fill({ color: 0x364F6B, alpha: 0.5})
        .stroke({ color: 0xF5F5F5, width: 2, alignment: 0});

        const zBgX = (this.stageWidth/2) - (BUTTON_WIDTH)
        zBackground.position.set(zBgX, boxButtonY);

        const filterBlur = new PIXI.BlurFilter({strength: 5});
        zBackground.filters = [filterBlur];

        // z-layer Icon
        const layerIconX = zBgX + (BUTTON_WIDTH*2)*1/4;
        const layerIcon = this.createButtonIcon(layerIconX, boxIconY, 'layer');

        // z-layer text
        const layerText = new PIXI.Text({
            text: formatPuzzleText(0, totalPieces),
                style: {
                    fill: '#F5F5F5',
                    fontFamily: 'Arial',
                    fontSize: 20,
                    align: 'left',
                },
            });
  
        layerText.roundPixels = true;
        layerText.anchor.set(-0.3,0.5);
        const layerTextX = zBgX + (BUTTON_WIDTH*2)*1/4;
        layerText.position.set(layerTextX, boxIconY);
        
        const containerlayerDisplay = new PIXI.Container();
        containerlayerDisplay.addChild(zBackground, layerText, layerIcon);
        containerlayerDisplay.interactiveChildren = false

        containbotHUD.addChild(
            containerBoxBut,
            containerVisBut,
            containerRotLeftBut,
            containerRotRightBut,
            containerzUpBut, 
            containerzDownBut,
            containerlayerDisplay,
            containerDrawer,
        );

        return [containbotHUD, 
            visButton, visIcon,
            containerDrawer, containerDrawerText, drawerBack,
            containerBoxBut, boxButton, boxIcon,
            containerRotRightBut, rotateRightButton, rotateRightIcon,
            containerRotLeftBut, rotateLeftButton, 
            containerzUpBut, zUpButton, zUpIcon,
            containerzDownBut, zDownButton, zDownIcon,
            containerlayerDisplay, layerText
        ]
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