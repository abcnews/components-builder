type MarkerPrefixes = Record<string, string>;
type DefaultMarkerNameFunction = (marker: string) => string;

interface DeletableType {
  deleted?: number;
}
