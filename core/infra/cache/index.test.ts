import { beforeEach, describe, expect, it, vi } from "vitest";
import { CacheKeys, CacheTTL, getCached, invalidate } from "./index";

const state = vi.hoisted(() => ({
  client: null as {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    del: ReturnType<typeof vi.fn>;
  } | null,
}));

vi.mock("./redis", () => ({
  get redis() {
    return state.client;
  },
  get isCacheEnabled() {
    return state.client !== null;
  },
}));

function fakeRedis() {
  return { get: vi.fn(), set: vi.fn(), del: vi.fn() };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  state.client = fakeRedis();
});

describe("getCached", () => {
  it("no miss, consulta o banco, grava com TTL e devolve o dado", async () => {
    state.client!.get.mockResolvedValue(null);
    const loader = vi.fn().mockResolvedValue([{ id: "c1" }]);

    const result = await getCached("clients:all", 300, loader);

    expect(result).toEqual([{ id: "c1" }]);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(state.client!.set).toHaveBeenCalledWith("clients:all", [{ id: "c1" }], {
      ex: 300,
    });
  });

  it("no hit, devolve o cache e NÃO consulta o banco", async () => {
    state.client!.get.mockResolvedValue([{ id: "c1" }]);
    const loader = vi.fn();

    const result = await getCached("clients:all", 300, loader);

    expect(result).toEqual([{ id: "c1" }]);
    expect(loader).not.toHaveBeenCalled();
    expect(state.client!.set).not.toHaveBeenCalled();
  });

  it("reidrata os campos DateTime, que voltam do JSON como string", async () => {
    state.client!.get.mockResolvedValue([
      { id: "c1", createdAt: "2026-08-16T10:00:00.000Z", birthDate: "1990-05-12" },
    ]);

    const [row] = await getCached<Array<Record<string, unknown>>>("clients:all", 300, vi.fn());

    expect(row.createdAt).toBeInstanceOf(Date);
    // birthDate é String no schema: não pode virar Date.
    expect(row.birthDate).toBe("1990-05-12");
  });

  it("com o Redis fora do ar na leitura, cai no banco em vez de falhar", async () => {
    state.client!.get.mockRejectedValue(new Error("ECONNREFUSED"));
    const loader = vi.fn().mockResolvedValue([{ id: "c1" }]);

    await expect(getCached("clients:all", 300, loader)).resolves.toEqual([{ id: "c1" }]);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("com o Redis fora do ar na gravação, ainda devolve o dado do banco", async () => {
    state.client!.get.mockResolvedValue(null);
    state.client!.set.mockRejectedValue(new Error("ECONNREFUSED"));
    const loader = vi.fn().mockResolvedValue([{ id: "c1" }]);

    await expect(getCached("clients:all", 300, loader)).resolves.toEqual([{ id: "c1" }]);
  });

  it("sem Redis configurado, é passagem direta para o banco", async () => {
    state.client = null;
    const loader = vi.fn().mockResolvedValue([{ id: "c1" }]);

    await expect(getCached("clients:all", 300, loader)).resolves.toEqual([{ id: "c1" }]);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("erro do banco continua subindo — cache não engole falha de leitura real", async () => {
    state.client!.get.mockResolvedValue(null);
    const loader = vi.fn().mockRejectedValue(new Error("banco fora"));

    await expect(getCached("clients:all", 300, loader)).rejects.toThrow("banco fora");
  });
});

describe("relatórios", () => {
  /** Os quatro valores do seletor em reports-dashboard.component.tsx. */
  const PERIODS = ["Este mês", "Últimos 3 meses", "Últimos 6 meses", "Este ano"];

  it("o TTL do relatório é exatamente 1200 s (20 min)", () => {
    expect(CacheTTL.reports).toBe(1200);
  });

  it("cada período gera uma chave distinta — dois relatórios nunca se sobrescrevem", () => {
    const keys = PERIODS.map((p) => CacheKeys.reports(p));

    expect(new Set(keys).size).toBe(PERIODS.length);
    expect(keys).toEqual([
      "reports:metrics:este-mes",
      "reports:metrics:ultimos-3-meses",
      "reports:metrics:ultimos-6-meses",
      "reports:metrics:este-ano",
    ]);
  });

  it("grava o relatório com TTL de 1200 s e serve o segundo acesso do cache", async () => {
    const key = CacheKeys.reports("Últimos 6 meses");
    const build = vi.fn().mockResolvedValue({ totalAppointments: 42 });

    // Primeiro acesso: miss, gera do Postgres e grava.
    state.client!.get.mockResolvedValue(null);
    await getCached(key, CacheTTL.reports, build);

    expect(build).toHaveBeenCalledTimes(1);
    expect(state.client!.set).toHaveBeenCalledWith(key, { totalAppointments: 42 }, { ex: 1200 });

    // Segundo acesso dentro dos 20 min: hit, sem tocar no banco.
    state.client!.get.mockResolvedValue({ totalAppointments: 42 });
    const second = await getCached(key, CacheTTL.reports, build);

    expect(second).toEqual({ totalAppointments: 42 });
    expect(build).toHaveBeenCalledTimes(1);
  });

  it("expirado (o Redis devolve null), o relatório é gerado de novo", async () => {
    const key = CacheKeys.reports("Este ano");
    const build = vi.fn().mockResolvedValue({ totalAppointments: 7 });
    state.client!.get.mockResolvedValue(null);

    await expect(getCached(key, CacheTTL.reports, build)).resolves.toEqual({
      totalAppointments: 7,
    });
    expect(build).toHaveBeenCalledTimes(1);
  });
});

describe("invalidate", () => {
  it("remove as chaves informadas", async () => {
    await invalidate("services:all", "services:active");

    expect(state.client!.del).toHaveBeenCalledWith("services:all", "services:active");
  });

  it("falha do Redis não derruba a escrita já confirmada no banco", async () => {
    state.client!.del.mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(invalidate("clients:all")).resolves.toBeUndefined();
  });

  it("sem Redis configurado, não faz nada", async () => {
    state.client = null;

    await expect(invalidate("clients:all")).resolves.toBeUndefined();
  });
});
