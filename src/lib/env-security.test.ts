import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guarda de segredos.
 *
 * AUTH_SECRET e AUTH_GOOGLE_SECRET só podem existir no servidor. Estes testes
 * falham se alguém marcar como client um arquivo que os lê, expuser via
 * NEXT_PUBLIC_, ou chumbar credencial no código.
 */
const ROOT = path.resolve(import.meta.dirname, "../..");
const SOURCE_DIRS = ["src", "core", "scripts", "prisma"];
const SERVER_ONLY_VARS = ["AUTH_SECRET", "AUTH_GOOGLE_SECRET", "AUTH_GOOGLE_ID"];

function sourceFiles(dir: string): string[] {
  const absolute = path.join(ROOT, dir);
  const out: string[] = [];

  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue;
    const full = path.join(absolute, entry.name);
    if (entry.isDirectory()) {
      out.push(...sourceFiles(path.join(dir, entry.name)));
    } else if (/\.(ts|tsx|mts)$/.test(entry.name)) {
      out.push(full);
    }
  }

  return out;
}

const files = SOURCE_DIRS.flatMap(sourceFiles)
  // este próprio arquivo contém os padrões que ele procura
  .filter((file) => file !== import.meta.filename)
  .map((file) => ({
    path: path.relative(ROOT, file),
    content: readFileSync(file, "utf8"),
  }));

describe("segredos do ambiente", () => {
  it("nenhum Client Component lê segredos do servidor", () => {
    const offenders = files
      .filter((file) => /^\s*["']use client["']/m.test(file.content))
      .filter((file) => SERVER_ONLY_VARS.some((name) => file.content.includes(name)))
      .map((file) => file.path);

    expect(offenders).toEqual([]);
  });

  it("nenhum segredo é exposto via NEXT_PUBLIC_", () => {
    const offenders = files
      .filter((file) => /NEXT_PUBLIC_[A-Z_]*AUTH/.test(file.content))
      .map((file) => file.path);

    expect(offenders).toEqual([]);
  });

  it("nenhuma credencial do Google chumbada no código", () => {
    const offenders = files
      .filter((file) =>
        /\.apps\.googleusercontent\.com|GOCSPX-/.test(file.content),
      )
      .map((file) => file.path);

    expect(offenders).toEqual([]);
  });

  it("segredos nunca são impressos em log", () => {
    const offenders = files
      .filter((file) =>
        /console\.[a-z]+\([^)]*process\.env\.(AUTH_SECRET|AUTH_GOOGLE)/.test(
          file.content,
        ),
      )
      .map((file) => file.path);

    expect(offenders).toEqual([]);
  });

  it(".env.example tem só placeholders", () => {
    const example = readFileSync(path.join(ROOT, ".env.example"), "utf8");
    const assignments = example
      .split("\n")
      .filter((line) => /^[A-Z0-9_]+=/.test(line));

    expect(assignments.length).toBeGreaterThan(0);
    for (const line of assignments) {
      expect(line.split("=")[1]).toBe("");
    }
    for (const name of ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET", "AUTH_SECRET"]) {
      expect(example).toContain(`${name}=`);
    }
  });

  it("arquivos .env locais continuam fora do Git", () => {
    const gitignore = readFileSync(path.join(ROOT, ".gitignore"), "utf8")
      .split("\n")
      .map((line) => line.trim());

    expect(gitignore).toContain(".env*");
    expect(gitignore).toContain("!.env.example");
  });
});
