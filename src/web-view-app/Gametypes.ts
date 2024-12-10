import * as PIXI from 'pixi.js';

export interface GameState {
  lives: number;
  bricks: BrickState[];
}

export interface BrickState {
  row: number;
  col: number;
  visible: boolean;
}

export interface Particle extends PIXI.Graphics {
  vx: number;
  vy: number;
  rotationSpeed: number;
}