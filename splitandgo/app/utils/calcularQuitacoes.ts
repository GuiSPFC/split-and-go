import type { Grupo, Moeda } from "../hooks/useGrupos";

export type SaldoIntegrante = {
  integrante: string;
  moeda: Moeda;
  saldoCentavos: number;
};

export type Quitacao = {
  devedor: string;
  credor: string;
  moeda: Moeda;
  valorCentavos: number;
};

export function calcularSaldos(grupo: Grupo): SaldoIntegrante[] {
  const moedas = [...new Set(grupo.despesas.map((despesa) => despesa.moeda))];
  const resultado: SaldoIntegrante[] = [];

  moedas.forEach((moeda) => {
    const saldos = new Map<string, number>();

    grupo.integrantes.forEach((integrante) => {
      saldos.set(integrante, 0);
    });

    grupo.despesas
      .filter((despesa) => despesa.moeda === moeda)
      .forEach((despesa) => {
        const saldoPagador = saldos.get(despesa.pagador) ?? 0;
        saldos.set(
          despesa.pagador,
          saldoPagador + despesa.valorCentavos,
        );

        despesa.divisoes.forEach((divisao) => {
          const saldoIntegrante = saldos.get(divisao.integrante) ?? 0;
          saldos.set(
            divisao.integrante,
            saldoIntegrante - divisao.valorCentavos,
          );
        });
      });

    saldos.forEach((saldoCentavos, integrante) => {
      resultado.push({ integrante, moeda, saldoCentavos });
    });
  });

  return resultado;
}

function calcularQuitacoesDaMoeda(
  saldosDaMoeda: SaldoIntegrante[],
  moeda: Moeda,
): Quitacao[] {
  const saldos = saldosDaMoeda
    .filter((saldo) => saldo.saldoCentavos !== 0)
    .map((saldo) => ({ ...saldo }));

  function buscarMenosPagamentos(): Quitacao[] | null {
    const indiceAtual = saldos.findIndex(
      (saldo) => saldo.saldoCentavos !== 0,
    );

    if (indiceAtual === -1) return [];

    const saldoAtual = saldos[indiceAtual].saldoCentavos;
    const combinacoesTentadas = new Set<number>();
    let melhorPlano: Quitacao[] | null = null;

    for (
      let indiceOutro = indiceAtual + 1;
      indiceOutro < saldos.length;
      indiceOutro++
    ) {
      const saldoOutro = saldos[indiceOutro].saldoCentavos;
      const sinaisOpostos =
        (saldoAtual < 0 && saldoOutro > 0) ||
        (saldoAtual > 0 && saldoOutro < 0);

      if (!sinaisOpostos || combinacoesTentadas.has(saldoOutro)) {
        continue;
      }

      combinacoesTentadas.add(saldoOutro);

      const valorCentavos = Math.min(
        Math.abs(saldoAtual),
        Math.abs(saldoOutro),
      );

      const quitacao: Quitacao =
        saldoAtual < 0
          ? {
              devedor: saldos[indiceAtual].integrante,
              credor: saldos[indiceOutro].integrante,
              moeda,
              valorCentavos,
            }
          : {
              devedor: saldos[indiceOutro].integrante,
              credor: saldos[indiceAtual].integrante,
              moeda,
              valorCentavos,
            };

      const saldoAnteriorAtual = saldos[indiceAtual].saldoCentavos;
      const saldoAnteriorOutro = saldos[indiceOutro].saldoCentavos;

      if (saldoAtual < 0) {
        saldos[indiceAtual].saldoCentavos += valorCentavos;
        saldos[indiceOutro].saldoCentavos -= valorCentavos;
      } else {
        saldos[indiceAtual].saldoCentavos -= valorCentavos;
        saldos[indiceOutro].saldoCentavos += valorCentavos;
      }

      const restante = buscarMenosPagamentos();

      saldos[indiceAtual].saldoCentavos = saldoAnteriorAtual;
      saldos[indiceOutro].saldoCentavos = saldoAnteriorOutro;

      if (restante !== null) {
        const planoAtual = [quitacao, ...restante];

        if (melhorPlano === null || planoAtual.length < melhorPlano.length) {
          melhorPlano = planoAtual;
        }
      }

      if (saldoAtual + saldoOutro === 0) {
        break;
      }
    }

    return melhorPlano;
  }

  return buscarMenosPagamentos() ?? [];
}

export function calcularQuitacoes(grupo: Grupo): Quitacao[] {
  const saldos = calcularSaldos(grupo);
  const moedas = [...new Set(saldos.map((saldo) => saldo.moeda))];

  return moedas.flatMap((moeda) =>
    calcularQuitacoesDaMoeda(
      saldos.filter((saldo) => saldo.moeda === moeda),
      moeda,
    ),
  );
}