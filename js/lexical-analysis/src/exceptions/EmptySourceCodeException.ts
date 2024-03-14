export default class EmptySourceCodeException extends Error {
  public constructor() {
    super("Empty source code");
  }
}
