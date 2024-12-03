import { Point } from "../../../src/application/geolocation/Point";
import { CalculateDistanceBetweenPoints } from "../../../src/application/geolocation/usecase/CalculateDistanceBetweenPoints";

describe("CalculateDistanceBetweenPoints", () => {
  let calculateDistanceBetweenPoints: CalculateDistanceBetweenPoints;

  beforeEach(() => {
    calculateDistanceBetweenPoints = new CalculateDistanceBetweenPoints();
  });

  it("should calculate the distance between two points", () => {
    // The distance between
    // [-22.9505541, -43.1822991] and [-22.9888419, -43.1923842] is:
    // 4.36 km or 2.71 miles
    let p1: Point = { latitude: -22.9505541, longitude: -43.1822991 };
    let p2: Point = { latitude: -22.9888419, longitude: -43.1923842 };
    let distance = calculateDistanceBetweenPoints.execute(p1, p2);
    expect(distance).toBeCloseTo(4.36, 0);

    // The distance between
    // [-22.9250377, -42.8144073] and [-22.3724600, -41.7871857] is:
    // 122.0 km or 75.8 miles

    p1 = { latitude: -22.9250377, longitude: -42.8144073 };
    p2 = { latitude: -22.37246, longitude: -41.7871857 };
    distance = calculateDistanceBetweenPoints.execute(p1, p2);
    expect(distance).toBeCloseTo(122.0, 0);
  });
});
