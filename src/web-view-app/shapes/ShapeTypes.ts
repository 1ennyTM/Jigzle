export interface IShapeProps{
    baseShape: BaseShape,

    radius?: number,
    radiusX?:number,
    radiusY?:number,
    innerRadius?: number,
    cornerRadius?: number,

    angle?: number,
    sides?: number,
    width?: number,
    height?: number,

    fillColor?: number,
    fillAlpha?: number,

    strokeColor?: number,
    strokeAlpha?: number,
    strokeWidth?: number,   
}

export interface IcreateStar{
    radius: number, sides: number, innerRadius?: number
}

export interface IcreateFilletRect{
    width: number, height: number, cornerRadius: number
}

export interface IcreatChamferRect{
    width: number, height: number, cornerRadius: number
}

export interface IcreateEllipse{
    radiusX: number, radiusY: number
}

export interface IcreateArc{
    radius: number, angle: number
}

export interface IcreateNPolygon{
    radius: number , sides: number, cornerRadius: number
}

export interface IcreateRightAngledTri{
    width: number, height: number
}

export enum DefaultShapes {
    Line = "Line",
    Star = "Star",
    Arc = "Star",
    CircleSemi = "CircleSemi",
    Circle = "Circle",
    Ellipse = "Ellipse",
    Rectangle = "Rectangle",
    RectChamfer = "RectChamfer",
    Square = "Square",
    Pentagon = "Pentagon",
    TriEquil = "TriEquil",
    TriRight = "TriRight",
};

export enum BaseShape{
    Star = "Star",
    Arc = "Arc",
    Ellipse = "Ellipse",
    RectFillet = "RectFillet",
    RectChamfer = "RectChamfer",
    Polygon = "Polygon",
    TriRightAngle = "TriRightAngle",
};
