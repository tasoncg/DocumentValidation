import { describe, it, expect } from "vitest";
import { suggestVariableName, toSnakeCase } from "@/lib/variable-suggest";

describe("suggestVariableName", () => {
  it("detects person name", () => {
    expect(suggestVariableName("Nguyễn Văn A")).toBe("ho_ten_nguoi_vi_pham");
    expect(suggestVariableName("Trần Thị Bích Hằng")).toBe("ho_ten_nguoi_vi_pham");
  });

  it("detects year", () => {
    expect(suggestVariableName("1990")).toBe("nam_sinh");
    expect(suggestVariableName("2025")).toBe("nam_sinh");
  });

  it("detects numeric date", () => {
    expect(suggestVariableName("25/04/2026")).toBe("ngay_vi_pham");
    expect(suggestVariableName("4-5-25")).toBe("ngay_vi_pham");
  });

  it("detects Vietnamese date phrase", () => {
    expect(suggestVariableName("ngày 25 tháng 4 năm 2026")).toBe("ngay_vi_pham");
  });

  it("detects address", () => {
    expect(suggestVariableName("Số 12 đường Lê Lợi, phường 1, Quận 3")).toBe("dia_chi");
  });

  it("detects vehicle plate", () => {
    expect(suggestVariableName("29A-12345")).toBe("bien_so_xe");
    expect(suggestVariableName("51F-67890")).toBe("bien_so_xe");
  });

  it("detects national ID", () => {
    expect(suggestVariableName("123456789")).toBe("so_cccd");
    expect(suggestVariableName("123456789012")).toBe("so_cccd");
  });

  it("detects violation phrase", () => {
    expect(suggestVariableName("Hành vi vượt đèn đỏ")).toBe("hanh_vi_vi_pham");
    expect(suggestVariableName("Lỗi không đội mũ bảo hiểm")).toBe("hanh_vi_vi_pham");
  });

  it("falls back to snake_case", () => {
    expect(suggestVariableName("Số biên bản")).toBe("so_bien_ban");
  });

  it("auto-suffixes on collision", () => {
    expect(suggestVariableName("Nguyễn Văn A", ["ho_ten_nguoi_vi_pham"])).toBe("ho_ten_nguoi_vi_pham_2");
    expect(
      suggestVariableName("Nguyễn Văn A", ["ho_ten_nguoi_vi_pham", "ho_ten_nguoi_vi_pham_2"])
    ).toBe("ho_ten_nguoi_vi_pham_3");
  });
});

describe("toSnakeCase", () => {
  it("strips diacritics", () => {
    expect(toSnakeCase("Hồ sơ")).toBe("ho_so");
  });
  it("handles đ/Đ", () => {
    expect(toSnakeCase("Đường phố")).toBe("duong_pho");
  });
  it("collapses non-alphanumeric", () => {
    expect(toSnakeCase("foo--bar  baz!!")).toBe("foo_bar_baz");
  });
  it("prefixes leading digit", () => {
    expect(toSnakeCase("123 abc")).toBe("v_123_abc");
  });
});
