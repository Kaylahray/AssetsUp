import { formatDate } from "./formatDate";

describe("formatDate", () => {
  describe("short format", () => {
    it("should format date as DD/MM/YYYY", () => {
      expect(formatDate("2025-10-01", "short")).toBe("01/10/2025");
      expect(formatDate(new Date("2025-12-25"), "short")).toBe("25/12/2025");
      expect(formatDate(new Date("2024-01-01"), "short")).toBe("01/01/2024");
    });

    it("should handle different date inputs", () => {
      expect(formatDate(1735689600000, "short")).toBe("01/01/2025"); // timestamp
      expect(formatDate("2025-06-15T10:30:00Z", "short")).toBe("15/06/2025");
    });

    it("should handle edge cases", () => {
      expect(formatDate("2025-02-29", "short")).toBe("01/03/2025"); // leap year edge case
      expect(formatDate("2024-02-29", "short")).toBe("29/02/2024"); // valid leap year
    });
  });

  describe("relative format", () => {
    beforeEach(() => {
      // Mock Date.now() to a fixed time for consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-01-15T12:00:00Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should format relative dates correctly", () => {
      // 1 day ago
      const oneDayAgo = new Date("2025-01-14T12:00:00Z");
      expect(formatDate(oneDayAgo, "relative")).toBe("1 day ago");

      // 2 days ago
      const twoDaysAgo = new Date("2025-01-13T12:00:00Z");
      expect(formatDate(twoDaysAgo, "relative")).toBe("2 days ago");

      // 1 hour ago
      const oneHourAgo = new Date("2025-01-15T11:00:00Z");
      expect(formatDate(oneHourAgo, "relative")).toBe("1 hour ago");

      // 30 minutes ago
      const thirtyMinutesAgo = new Date("2025-01-15T11:30:00Z");
      expect(formatDate(thirtyMinutesAgo, "relative")).toBe("30 minutes ago");

      // 1 minute ago
      const oneMinuteAgo = new Date("2025-01-15T11:59:00Z");
      expect(formatDate(oneMinuteAgo, "relative")).toBe("1 minute ago");
    });

    it("should format future dates correctly", () => {
      // 1 day from now
      const oneDayFromNow = new Date("2025-01-16T12:00:00Z");
      expect(formatDate(oneDayFromNow, "relative")).toBe("in 1 day");

      // 2 days from now
      const twoDaysFromNow = new Date("2025-01-17T12:00:00Z");
      expect(formatDate(twoDaysFromNow, "relative")).toBe("in 2 days");

      // 1 hour from now
      const oneHourFromNow = new Date("2025-01-15T13:00:00Z");
      expect(formatDate(oneHourFromNow, "relative")).toBe("in 1 hour");
    });

    it("should handle same time as 'now'", () => {
      const now = new Date("2025-01-15T12:00:00Z");
      expect(formatDate(now, "relative")).toBe("now");
    });

    it("should handle very recent times", () => {
      // 30 seconds ago
      const thirtySecondsAgo = new Date("2025-01-15T11:59:30Z");
      expect(formatDate(thirtySecondsAgo, "relative")).toBe("30 seconds ago");

      // 1 second ago
      const oneSecondAgo = new Date("2025-01-15T11:59:59Z");
      expect(formatDate(oneSecondAgo, "relative")).toBe("1 second ago");
    });

    it("should handle longer periods", () => {
      // 1 month ago
      const oneMonthAgo = new Date("2024-12-15T12:00:00Z");
      expect(formatDate(oneMonthAgo, "relative")).toBe("1 month ago");

      // 1 year ago
      const oneYearAgo = new Date("2024-01-15T12:00:00Z");
      expect(formatDate(oneYearAgo, "relative")).toBe("1 year ago");
    });
  });

  describe("error handling", () => {
    it("should throw error for invalid date", () => {
      expect(() => formatDate("invalid-date", "short")).toThrow("Invalid date provided");
      expect(() => formatDate("not-a-date", "relative")).toThrow("Invalid date provided");
      expect(() => formatDate(NaN, "short")).toThrow("Invalid date provided");
    });

    it("should throw error for unsupported format", () => {
      expect(() => formatDate("2025-01-01", "invalid" as any)).toThrow("Unsupported format: invalid");
    });
  });

  describe("acceptance criteria", () => {
    it("should meet the specific acceptance criteria", () => {
      // formatDate("2025-10-01", "short") → "01/10/2025"
      expect(formatDate("2025-10-01", "short")).toBe("01/10/2025");

      // formatDate(Date.now() - 86400000, "relative") → "1 day ago"
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-01-15T12:00:00Z"));
      
      const oneDayAgo = Date.now() - 86400000; // 86400000 ms = 1 day
      expect(formatDate(oneDayAgo, "relative")).toBe("1 day ago");
      
      jest.useRealTimers();
    });
  });
});
