import { Point } from "../Point";

export class CalculateDistanceBetweenPoints {
  private radiusOfEarthInKm = 6371e3;

  execute(p1: Point, p2: Point, unit: "km" | "m" = "km"): number {
    // * This method implements the Spherical Law of Cosines to calculate the distance between two points

    const deltaLatitude = this.toRadians(p2.latitude - p1.latitude);
    const deltaLongitude = this.toRadians(p2.longitude - p1.longitude);
    const a =
      Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
      Math.cos(this.toRadians(p1.latitude)) *
        Math.cos(this.toRadians(p2.latitude)) *
        Math.sin(deltaLongitude / 2) *
        Math.sin(deltaLongitude / 2);
    const distance =
      this.radiusOfEarthInKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return distance / (unit === "km" ? 1000 : 1);
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
