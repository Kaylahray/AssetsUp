import { generateSlug } from "./generateSlug";


describe("generateSlug", () => {
  it("should convert a title into a slug", () => {
    expect(generateSlug("Company Assets 2025!")).toBe("company-assets-2025");
  });

  it("should handle accented characters", () => {
    expect(generateSlug("Café Niño Año")).toBe("cafe-nino-ano");
  });

  it("should remove special characters", () => {
    expect(generateSlug("Hola@# mundo!")).toBe("hola-mundo");
  });
});
