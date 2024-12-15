// @ts-nocheck

import * as PIXI from 'pixi.js';

import DefaultShape from './DefaultShape.json';

import type * as ShapeTypes from './ShapeTypes.js';

const DEFAULT_LENGTH = 100;
const DEFAULT_FILL_COLOR = 0x000000;
const DEFAULT_FILL_ALPHA = 1;
const DEFAULT_STROKE_COLOR = 0x000000;
const DEFAULT_STROKE_ALPHA = 0;
const DEFAULT_STROKE_WIDTH = 100;

var BaseShapeMap = {
    Star: createStar,
    RectFillet: createFilletRect,
    RectChamfer: creatChamferRect,
    Ellipse: createEllipse,
    Arc: createArc,
    Polygon: createNPolygon,
    TriRight: createRightAngledTri,
};

function createStar(props: ShapeTypes.IcreateStar, canvasLength: number): PIXI.Graphics {
    let star = new PIXI.Graphics().star(0, 0, props.sides, props.radius*canvasLength, props.innerRadius*canvasLength);
        star.hitArea = new PIXI.Circle(0,0, props.radius*canvasLength);
    return star
};

function createFilletRect(props:ShapeTypes.IcreateFilletRect, canvasLength: number ): PIXI.Graphics {
    let width = props.width*canvasLength;
    let height = props.height*canvasLength;
    let rectangle = new PIXI.Graphics().filletRect(0, 0, width, height, props.cornerRadius);
        rectangle.pivot.set(width/2, height/2);
        rectangle.hitArea = new PIXI.Rectangle(0,0,width,height);
    return rectangle
};

function creatChamferRect(props: ShapeTypes.IcreatChamferRect, canvasLength: number): PIXI.Graphics {
    let width = props.width*canvasLength;
    let height = props.height*canvasLength;
    let rectangle = new PIXI.Graphics().chamferRect(0, 0, width, height, props.cornerRadius);
        rectangle.pivot.set(width/2, height/2);
        rectangle.hitArea = new PIXI.Rectangle(0,0,width,height);
    return rectangle
};

function createEllipse(props: ShapeTypes.IcreateEllipse, canvasLength: number): PIXI.Graphics {
    const halfwidth = props.radiusX*canvasLength
    const halfheight = props.radiusY*canvasLength
    let ellipse = new PIXI.Graphics().ellipse(0, 0, halfwidth, halfheight);
    ellipse.hitArea = new PIXI.Ellipse(0, 0, halfwidth, halfheight);
    return ellipse
};

function createArc(props: ShapeTypes.IcreateArc, canvasLength: number): PIXI.Graphics {
    let arc = new PIXI.Graphics().arc(0, 0, props.radius*canvasLength, 0, props.angle);
        arc.pivot.set(props.radius*2/3, props.radius*4/3);
    return arc
};

function createNPolygon(props: ShapeTypes.IcreateNPolygon, canvasLength: number): PIXI.Graphics {
    props.sides>=3 ? props.sides : 3;

    const radius = props.radius*canvasLength;
    let collision
    if (props.sides == 3){
        const cornerCoord = radius*Math.sin((30/180)*Math.PI);
        collision = new PIXI.Polygon([-radius,cornerCoord, 0, -radius, radius,cornerCoord])
  
    }else if(props.sides == 4){
        collision = new PIXI.Polygon([-radius,0, 0,-radius, radius,0, 0, radius])

    } else{
        collision = new PIXI.Circle(0,0, props.radius*canvasLength);
    }

    let polygon = new PIXI.Graphics().roundPoly(0, 0, radius, props.sides, props.cornerRadius);
        polygon.hitArea = collision
    return polygon
};

function createRightAngledTri(props: ShapeTypes.IcreateRightAngledTri, canvasLength: number): PIXI.Graphics {
    let rightTri = new PIXI.Graphics().poly([
        0, 0,
        0, props.width*canvasLength, 
        props.width*canvasLength, props.width*canvasLength
    ]);
    rightTri.pivot.set(props.width*canvasLength/3,((props.width*canvasLength)+(props.width*canvasLength))/3);
    rightTri.hitArea = new PIXI.Polygon([0, 0, 0, props.width*canvasLength, props.width*canvasLength, props.width*canvasLength]);

    return rightTri
};

export function getDefaultShapeProps(shapeName: ShapeTypes.DefaultShapes, canvasLength: number):ShapeTypes.IShapeProp{
    return DefaultShape[shapeName]
};

export function createShapes( 
    canvasLength: number,
    props: ShapeTypes.IShapeProps,
    scale: [x: number, y: number],
    position: [x: number, y: number],
    rotation?: number

): PIXI.Graphics
{
    let shape: PIXI.Graphics = BaseShapeMap[props.baseShape](props, canvasLength)
  
    shape.fill({
        color: props.fillColor ? props.fillColor : DEFAULT_FILL_COLOR,
        alpha: props.fillAlpha ? props.fillAlpha : DEFAULT_FILL_ALPHA
    });
    shape.stroke({
        color: props.strokeColor ? props.strokeColor : DEFAULT_STROKE_COLOR,
        alpha: props.strokeAlpha ? props.strokeAlpha : DEFAULT_STROKE_ALPHA,
        width: props.strokeWidth ? props.strokeWidth : DEFAULT_STROKE_WIDTH
    }); 

    shape.scale.set(scale[0], scale[1]);
    shape.position.set(
        position[0]*canvasLength, 
        position[1]*canvasLength
    );
    shape.rotation = rotation ? rotation : 0;

    return shape
};
