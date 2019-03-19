interface CreateOptions {
  src: string;
}
interface Capsula {
  createCapsula(options:CreateOptions): string;
  fetchCapsula(url: string): void;
  startCapsula(): Promise<RED>
}