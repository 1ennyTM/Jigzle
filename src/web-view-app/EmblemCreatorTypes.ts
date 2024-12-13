export interface GameState {
  Layers: ShapeState[];
}

export interface ShapeState {
  shape: string;
  position: number;
  rotation: number;
  color: number;
  scale : number;
  fill: boolean; 
}

export interface Shapes {

}
