export class KeyBuilder {
  private paths: string[] = [];

  static user = (id: number | string) => {
    const instance = new KeyBuilder();
    return instance.user(id);
  };

  user = (id: number | string) => {
    this.paths.push(`users/${id}`);
    return this;
  };

  value = () => {
    return this.paths.join("/");
  };
}
