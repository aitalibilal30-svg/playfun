// Physics, ground collision detection, and spatial boundaries for PLYHUB
import * as THREE from 'three';
import { IslandData } from './proceduralAssets';

export interface GroundCheckResult {
  onGround: boolean;
  groundY: number;
  islandIndex: number;
}

export class PhysicsEngine {
  private islands: IslandData[] = [];
  public readonly gravity = -26.0; // m/s^2
  public readonly voidThreshold = -18.0; // Y level to trigger respawn
  public readonly defaultSpawn = new THREE.Vector3(0, 1.3, 8);
  public lastCheckpoint = new THREE.Vector3(0, 1.3, 8);

  public setIslands(islands: IslandData[]) {
    this.islands = islands;
  }

  // Calculate terrain height under point (x, z)
  public getGroundHeightAt(x: number, z: number): GroundCheckResult {
    for (let i = 0; i < this.islands.length; i++) {
      const isl = this.islands[i];
      const dx = x - isl.center.x;
      const dz = z - isl.center.z;
      const distSq = dx * dx + dz * dz;
      const radiusSq = isl.radius * isl.radius;

      if (distSq <= radiusSq) {
        // Subtle dome taper towards island edge for natural feel
        const distRatio = Math.sqrt(distSq) / isl.radius;
        const domeHeight = Math.cos(distRatio * Math.PI * 0.5) * 0.4;
        const groundY = isl.center.y + 1.2 + domeHeight;
        return {
          onGround: true,
          groundY,
          islandIndex: i,
        };
      }
    }

    return {
      onGround: false,
      groundY: -999,
      islandIndex: -1,
    };
  }

  // Clamp horizontal movement if hitting natural barriers or boundaries
  public resolveHorizontalCollision(
    currentPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    _radius: number
  ): THREE.Vector3 {
    // Check if target position is still within bounds or falling off edge gracefully
    return targetPos;
  }

  public setCheckpoint(pos: THREE.Vector3) {
    this.lastCheckpoint.copy(pos);
  }
}
