import type {
  DivisaoDespesa,
  TipoRateio,
} from "../hooks/useGrupos";

type ParticipanteRateio = {
  integrante: string;
  valorInformado: string;
};

function converterParaCentavos(valor: string): number | null {
  if (!valor.trim()) return null;

  const numero = Number(valor.replace(",", "."));

  if (!Number.isFinite(numero) || numero < 0) {
    return null;
  }

  return Math.round(numero * 100);
}

export function calcularDivisoesDespesa(
  tipoRateio: TipoRateio,
  totalCentavos: number,
  participantes: ParticipanteRateio[],
): DivisaoDespesa[] | null {
  if (totalCentavos <= 0 || participantes.length === 0) {
    return null;
  }

  if (tipoRateio === "igual") {
    const valorPorPessoa = Math.floor(
      totalCentavos / participantes.length,
    );
    let centavosRestantes = totalCentavos % participantes.length;

    return participantes.map(({ integrante }) => {
      const centavoExtra = centavosRestantes > 0 ? 1 : 0;
      centavosRestantes -= centavoExtra;

      return {
        integrante,
        valorCentavos: valorPorPessoa + centavoExtra,
      };
    });
  }

  if (tipoRateio === "valor") {
    const divisoes = participantes.map(({ integrante, valorInformado }) => {
      const valorCentavos = converterParaCentavos(valorInformado);

      return valorCentavos === null
        ? null
        : { integrante, valorCentavos };
    });

    if (divisoes.some((divisao) => divisao === null)) {
      return null;
    }

    const divisoesValidas = divisoes as DivisaoDespesa[];
    const soma = divisoesValidas.reduce(
      (total, divisao) => total + divisao.valorCentavos,
      0,
    );

    return soma === totalCentavos ? divisoesValidas : null;
  }

  const percentuaisEmCentésimos = participantes.map(
    ({ valorInformado }) => {
      if (!valorInformado.trim()) return null;

      const percentual = Number(valorInformado.replace(",", "."));

      if (!Number.isFinite(percentual) || percentual < 0 || percentual > 100) {
        return null;
      }

      return Math.round(percentual * 100);
    },
  );

  if (percentuaisEmCentésimos.some((valor) => valor === null)) {
    return null;
  }

  const percentuaisValidos = percentuaisEmCentésimos as number[];
  const somaPercentuais = percentuaisValidos.reduce(
    (total, percentual) => total + percentual,
    0,
  );

  // 100% representado em centésimos de porcentagem.
  if (somaPercentuais !== 10000) {
    return null;
  }

  const valores = percentuaisValidos.map((percentual) =>
    Math.floor((totalCentavos * percentual) / 10000),
  );

  let centavosRestantes =
    totalCentavos -
    valores.reduce((total, valor) => total + valor, 0);

  for (let indice = 0; centavosRestantes > 0; indice++) {
    valores[indice] += 1;
    centavosRestantes -= 1;
  }

  return participantes.map(({ integrante }, indice) => ({
    integrante,
    valorCentavos: valores[indice],
  }));
}