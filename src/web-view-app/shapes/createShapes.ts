// @ts-nocheck

import * as PIXI from 'pixi.js';

import DefaultShape from './DefaultShape.json';

import type * as ShapeTypes from './ShapeTypes.js';

const DEFAULT_LENGTH = 100;
const DEFAULT_FILL_COLOR = 0x000000;
const DEFAULT_FILL_ALPHA = 1;
const DEFAULT_STROKE_COLOR = 0x000000;
const DEFAULT_STROKE_ALPHA = 0;
const DEFAULT_STROKE_WIDTH = 2;

var BaseShapeMap = {
    Star: createStar,
    RectFillet: createFilletRect,
    RectChamfer: creatChamferRect,
    Ellipse: createEllipse,
    Arc: createArc,
    Polygon: createNPolygon,
    TriRightAngle: createRightAngledTri,
};

function createStar(props: ShapeTypes.IcreateStar): PIXI.Graphics {
    return new PIXI.Graphics().star(0, 0, props.sides, props.radius, props.innerRadius);
};

function createFilletRect(props: ShapeTypes.IcreateFilletRect): PIXI.Graphics {
    const rectangle = new PIXI.Graphics().filletRect(0, 0, props.width, props.height, props.cornerRadius);
    rectangle.pivot.set(DEFAULT_LENGTH, DEFAULT_LENGTH/2)
    return rectangle
};

function creatChamferRect(props: ShapeTypes.IcreatChamferRect): PIXI.Graphics {
    const rectangle = new PIXI.Graphics().chamferRect(0, 0, props.width, props.height, props.cornerRadius);
    rectangle.pivot.set(props.width, props.height/2)
    return rectangle
};

function createEllipse(props: ShapeTypes.IcreateEllipse): PIXI.Graphics {
    return new PIXI.Graphics().ellipse(0, 0, props.radiusX, props.radiusY);
};

function createArc(props: ShapeTypes.IcreateArc): PIXI.Graphics {
    const arc = new PIXI.Graphics().arc(0, 0, props.radius, 0, props.angle);
    arc.pivot.set(props.radius*2/3, props.radius*4/3)
    return arc
};

function createNPolygon(props: ShapeTypes.IcreateNPolygon): PIXI.Graphics {
    props.sides>=3 ? props.sides : 3;
    return new PIXI.Graphics().roundPoly(0, 0, props.radius, props.sides, props.cornerRadius);
};

function createRightAngledTri(props: ShapeTypes.IcreateRightAngledTri): PIXI.Graphics {
    const rightTri = new PIXI.Graphics().poly([0, 0, 0, props.width, props.width, props.height]);
    rightTri.pivot.set(props.width*2/3, props.width*4/3)
    return rightTri
};

export function getDefaultShapeProps(shapeName: ShapeTypes.DefaultShapes):ShapeTypes.IShapeProp{
    return DefaultShape[shapeName]
};

export function createShapes( 
    props: ShapeTypes.IShapeProps,
    scale: [x: number, y: number],
    position: [x: number, y: number],
    rotation?: number
): PIXI.Graphics
{
    const shape: PIXI.Graphics = BaseShapeMap[props.baseShape](props)

    shape.fill({
        color: props.fillColor ? props.fillColor : DEFAULT_FILL_COLOR,
        alpha: props.fillAlpha ? props.fillAlpha : DEFAULT_FILL_ALPHA,
    })
    shape.stroke({
        color: props.strokeColor ? props.strokeColor : DEFAULT_STROKE_COLOR,
        alpha: props.strokeAlpha ? props.strokeAlpha : DEFAULT_STROKE_ALPHA,
        width: props.strokeWidth ? props.strokeWidth : DEFAULT_STROKE_WIDTH,
        alignment:0.5, // fixed
    }); 

    shape.scale.set(scale[0], scale[1]);
    shape.position.set(position[0], position[1]);
    shape.rotation = rotation ? rotation : 0;

    return shape
};
