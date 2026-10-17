import type {
  DivisaoDespesa,
  TipoRateio,
} from "../hooks/useGrupos";

//Dados de cada pessoa selecionada para participar do rateio
type ParticipanteRateio = {
  integrante: string;
  valorInformado: string;
};

//Converte um valor digitado em reais para centavos e retorna null se o campo estiver vazio
function converterParaCentavos(valor: string): number | null {
  if (!valor.trim()) return null;

  const numero = Number(valor.replace(",", "."));

  if (!Number.isFinite(numero) || numero < 0) {
    return null;
  }

  return Math.round(numero * 100);
}

//Calcula quanto cada participante deve pagar e retorna null  se os dados não forem validos
export function calcularDivisoesDespesa(
  tipoRateio: TipoRateio,
  totalCentavos: number,
  participantes: ParticipanteRateio[],
): DivisaoDespesa[] | null {
  if (totalCentavos <= 0 || participantes.length === 0) {
    return null;
  }

  //divite o total igualmente e distribui os centavos que sobrarem
  if (tipoRateio === "igual") {
    const valorPorPessoa = Math.floor(
      totalCentavos / participantes.length,
    );
    let centavosRestantes = totalCentavos % participantes.length;

    //as primeiras pessoas recebem um centavo extra até a sobra acabar
    return participantes.map(({ integrante }) => {
      const centavoExtra = centavosRestantes > 0 ? 1 : 0;
      centavosRestantes -= centavoExtra;

      return {
        integrante,
        valorCentavos: valorPorPessoa + centavoExtra,
      };
    });
  }

  //Usa os valores fixos informados para cada pessoa
  if (tipoRateio === "valor") {
    const divisoes = participantes.map(({ integrante, valorInformado }) => {
      const valorCentavos = converterParaCentavos(valorInformado);

      return valorCentavos === null
        ? null
        : { integrante, valorCentavos };
    });

    //Retorna null se não for preenchido certo
    if (divisoes.some((divisao) => divisao === null)) {
      return null;
    }

    //A soma dos valores individuais tem que ser igual ao total da despesa
    const divisoesValidas = divisoes as DivisaoDespesa[];
    const soma = divisoesValidas.reduce(
      (total, divisao) => total + divisao.valorCentavos,
      0,
    );

    return soma === totalCentavos ? divisoesValidas : null;
  }

  //COnverte cada percentual para centésimos de porcentagem
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

  //Todos os percentuais precisam ser válidos
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

  //calcula a parte de cada pessoa em centavos e arredonda para baixo
  const valores = percentuaisValidos.map((percentual) =>
    Math.floor((totalCentavos * percentual) / 10000),
  );

  //distribui os centavos que sobram depois do arredondamento
  let centavosRestantes =
    totalCentavos -
    valores.reduce((total, valor) => total + valor, 0);

  for (let indice = 0; centavosRestantes > 0; indice++) {
    valores[indice] += 1;
    centavosRestantes -= 1;
  }

  //retorna cada integrante junto do valor calculado para ele
  return participantes.map(({ integrante }, indice) => ({
    integrante,
    valorCentavos: valores[indice],
  }));
}