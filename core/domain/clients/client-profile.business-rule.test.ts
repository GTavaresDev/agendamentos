import { describe, expect, it } from "vitest";
import {
  isClientProfileComplete,
  isValidClientBirthDate,
  isValidClientPhone,
  missingClientProfileFields,
} from "./client-profile.business-rule";

const NOW = new Date("2026-08-07T12:00:00Z");

describe("telefone do cadastro", () => {
  it("aceita fixo e celular, com ou sem máscara", () => {
    expect(isValidClientPhone("(11) 3333-4444")).toBe(true);
    expect(isValidClientPhone("11994279139")).toBe(true);
  });

  it("recusa vazio e incompleto — o Google nunca traz telefone", () => {
    expect(isValidClientPhone("")).toBe(false);
    expect(isValidClientPhone("   ")).toBe(false);
    expect(isValidClientPhone("11999")).toBe(false);
    expect(isValidClientPhone("(11)")).toBe(false);
  });
});

describe("data de nascimento do cadastro", () => {
  it("aceita data real no passado", () => {
    expect(isValidClientBirthDate("1995-01-15", NOW)).toBe(true);
    expect(isValidClientBirthDate("2026-08-07", NOW)).toBe(true);
  });

  it("recusa vazio e formato errado", () => {
    expect(isValidClientBirthDate("", NOW)).toBe(false);
    expect(isValidClientBirthDate("15/01/1995", NOW)).toBe(false);
    expect(isValidClientBirthDate("1995-1-5", NOW)).toBe(false);
  });

  it("recusa data que não existe no calendário", () => {
    expect(isValidClientBirthDate("1995-02-31", NOW)).toBe(false);
    expect(isValidClientBirthDate("1995-13-01", NOW)).toBe(false);
    expect(isValidClientBirthDate("1995-00-10", NOW)).toBe(false);
  });

  it("recusa data futura e ano implausível", () => {
    expect(isValidClientBirthDate("2026-08-08", NOW)).toBe(false);
    expect(isValidClientBirthDate("2030-01-01", NOW)).toBe(false);
    expect(isValidClientBirthDate("1899-12-31", NOW)).toBe(false);
  });
});

describe("completude do cadastro", () => {
  it("aponta exatamente o que falta numa conta vinda do Google", () => {
    // O provedor traz nome e e-mail; telefone e nascimento ficam vazios.
    expect(missingClientProfileFields({ phone: "", birthDate: "" }, NOW)).toEqual([
      "phone",
      "birthDate",
    ]);
  });

  it("aponta só o nascimento em quem se cadastrou por e-mail/senha", () => {
    expect(
      missingClientProfileFields({ phone: "11994279139", birthDate: "" }, NOW),
    ).toEqual(["birthDate"]);
  });

  it("considera completo quando os dois existem", () => {
    expect(
      isClientProfileComplete({ phone: "11994279139", birthDate: "1995-01-15" }, NOW),
    ).toBe(true);
  });
});
