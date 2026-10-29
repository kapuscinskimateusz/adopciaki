import { describe, expect, it } from "vitest";
import {
  buildCatalogHref,
  escapeLikePattern,
  formatAge,
  parseCatalogParams,
} from "./catalog-query";

describe("parseCatalogParams", () => {
  it("returns defaults for empty params", () => {
    expect(parseCatalogParams({})).toEqual({ sort: "newest", page: 1 });
  });

  it("parses valid values and takes the first of repeated params", () => {
    const params = parseCatalogParams({
      species: ["cat", "dog"],
      size: "small",
      q: "  Pe ",
      sort: "name",
      page: "3",
    });
    expect(params).toMatchObject({
      species: "cat",
      size: "small",
      q: "Pe",
      sort: "name",
      page: 3,
    });
  });

  it("ignores invalid values", () => {
    const params = parseCatalogParams({
      species: "dragon",
      sex: "x",
      sort: "random",
      page: "-4",
      q: "",
    });
    expect(params).toEqual({ sort: "newest", page: 1 });
  });

  it("rejects the adopted status filter", () => {
    expect(parseCatalogParams({ status: "adopted" }).status).toBeUndefined();
  });
});

describe("buildCatalogHref", () => {
  it("omits defaults", () => {
    expect(buildCatalogHref({ sort: "newest", page: 1 })).toBe("/animals");
  });

  it("resets the page when filters change", () => {
    const href = buildCatalogHref(
      { sort: "name", page: 4, species: "dog" },
      { size: "large" },
    );
    expect(href).toBe("/animals?species=dog&size=large&sort=name");
  });

  it("keeps an explicit page", () => {
    expect(buildCatalogHref({ sort: "newest", page: 1 }, { page: 2 })).toBe(
      "/animals?page=2",
    );
  });

  it("encodes the search query", () => {
    expect(buildCatalogHref({ sort: "newest", page: 1, q: "a&b c" })).toBe(
      "/animals?q=a%26b+c",
    );
  });
});

describe("escapeLikePattern", () => {
  it("escapes wildcard characters", () => {
    expect(escapeLikePattern("50%_a\\b")).toBe("50\\%\\_a\\\\b");
  });
});

describe("formatAge", () => {
  it.each([
    [null, "Wiek nieznany"],
    [8, "8 mies."],
    [12, "1 rok"],
    [24, "2 lata"],
    [60, "5 lat"],
    [15 * 12, "15 lat"],
    [22 * 12, "22 lata"],
    [27, "2 lata 3 mies."],
  ])("formats %s months", (months, expected) => {
    expect(formatAge(months)).toBe(expected);
  });
});
