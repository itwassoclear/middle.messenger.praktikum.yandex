import { expect } from "chai";
import { set } from "./helpers";

describe("Helpers functions", () => {
  describe("set", () => {
    let obj: Object, path: string, value: unknown;

    beforeEach(() => {
      obj = {};
      path = "a.b.c";
      value = 3;
    });

    it("should return passed object if it is not an object", () => {
      // arrange
      const obj = 3;

      // act
      const result = set(obj, "test.test", 3);

      // assert
      expect(result).to.eq(obj);
    });

    it("should return null if null is passed as first argument", () => {
      const obj = null;

      const result = set(obj, "test.test", 3);

      expect(result).to.eq(obj);
    });

    it("should throw an error if path is not a string", () => {
      const obj = {};
      const path = 3 as any;

      const fn = () => set(obj, path, 3);

      expect(fn).to.throw(Error);
    });

    it("should set new property to passed object with passed value", () => {
      const result = set(obj, path, value);

      expect((result as any).a.b.c).to.eq(value);
    });

    it("should not return new object", () => {
      const result = set(obj, path, value);

      expect(result).to.eq(obj);
    });
  });
});
