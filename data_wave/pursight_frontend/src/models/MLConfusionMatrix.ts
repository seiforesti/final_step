// ML Confusion Matrix model
export interface MLConfusionMatrix {
  labels: string[]; // e.g. ["A", "B", "C"]
  matrix: number[][]; // rows: actual, cols: predicted
}
