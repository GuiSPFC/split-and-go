import type { Grupo, Moeda } from "../hooks/useGrupos";

//Saldo positivo a pessoa tem que receber, negativo a pagar
export type SaldoIntegrante = {
  integrante: string;
  moeda: Moeda;
  saldoCentavos: number;
};

//Represente uma transferência para quitar uma divida
export type Quitacao = {
  devedor: string;
  credor: string;
  moeda: Moeda;
  valorCentavos: number;
};

//Calcula o saldo de cada integrantem matendo cada moeda separada
export function calcularSaldos(grupo: Grupo): SaldoIntegrante[] {
  const moedas = [...new Set(grupo.despesas.map((despesa) => despesa.moeda))];
  const resultado: SaldoIntegrante[] = [];

  //começa com saldo zero para cada integrante nesta moeda
  moedas.forEach((moeda) => {
    const saldos = new Map<string, number>();

    grupo.integrantes.forEach((integrante) => {
      saldos.set(integrante, 0);
    });

    //o pagador recebe credito pelo valor total que adiantou
    grupo.despesas
      .filter((despesa) => despesa.moeda === moeda)
      .forEach((despesa) => {
        const saldoPagador = saldos.get(despesa.pagador) ?? 0;
        saldos.set(
          despesa.pagador,
          saldoPagador + despesa.valorCentavos,
        );

        //cada participante tem descontada a propria parte da despesa
        despesa.divisoes.forEach((divisao) => {
          const saldoIntegrante = saldos.get(divisao.integrante) ?? 0;
          saldos.set(
            divisao.integrante,
            saldoIntegrante - divisao.valorCentavos,
          );
        });
      });
    
    //transforma o map em uma lista de saldos
    saldos.forEach((saldoCentavos, integrante) => {
      resultado.push({ integrante, moeda, saldoCentavos });
    });
  });

  return resultado;
}

//encontra o plano com menos pagamentos para uma unica moeda
function calcularQuitacoesDaMoeda(
  saldosDaMoeda: SaldoIntegrante[],
  moeda: Moeda,
): Quitacao[] {
  //usa uma copia para nao modificar o saldos originais
  const saldos = saldosDaMoeda
    .filter((saldo) => saldo.saldoCentavos !== 0)
    .map((saldo) => ({ ...saldo }));

    //escolhe o primeiro saldo que ainda nao foi quitado
  function buscarMenosPagamentos(): Quitacao[] | null {
    const indiceAtual = saldos.findIndex(
      (saldo) => saldo.saldoCentavos !== 0,
    );

    //se todos estão zerados o plano esta completo
    if (indiceAtual === -1) return [];

    const saldoAtual = saldos[indiceAtual].saldoCentavos;
    const combinacoesTentadas = new Set<number>();
    let melhorPlano: Quitacao[] | null = null;

    //procura outra pessoa com saldo de sinal contrario
    for (
      let indiceOutro = indiceAtual + 1;
      indiceOutro < saldos.length;
      indiceOutro++
    ) {
      const saldoOutro = saldos[indiceOutro].saldoCentavos;
      const sinaisOpostos =
        (saldoAtual < 0 && saldoOutro > 0) ||
        (saldoAtual > 0 && saldoOutro < 0);

        //ignora quem esta do mesmo lado da divida e combinações repetidas
      if (!sinaisOpostos || combinacoesTentadas.has(saldoOutro)) {
        continue;
      }

      combinacoesTentadas.add(saldoOutro);

      //a transferencia quita o menor dos dois saldos em aberto
      const valorCentavos = Math.min(
        Math.abs(saldoAtual),
        Math.abs(saldoOutro),
      );

      //o saldo negativo paga para quem tem saldo positivo
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
      
      //Guarda os valores atuais para restaura-los depois da tentativa
      const saldoAnteriorAtual = saldos[indiceAtual].saldoCentavos;
      const saldoAnteriorOutro = saldos[indiceOutro].saldoCentavos;
      
      //simula transferência e atualiza os dois saldos
      if (saldoAtual < 0) {
        saldos[indiceAtual].saldoCentavos += valorCentavos;
        saldos[indiceOutro].saldoCentavos -= valorCentavos;
      } else {
        saldos[indiceAtual].saldoCentavos -= valorCentavos;
        saldos[indiceOutro].saldoCentavos += valorCentavos;
      }
      
      //procura recursivamente o restante dos pagamentos
      const restante = buscarMenosPagamentos();

      //restaura os valores para testar outra combinação
      saldos[indiceAtual].saldoCentavos = saldoAnteriorAtual;
      saldos[indiceOutro].saldoCentavos = saldoAnteriorOutro;

      if (restante !== null) {
        const planoAtual = [quitacao, ...restante];

        //Guarda a combinação que usa menos transferências
        if (melhorPlano === null || planoAtual.length < melhorPlano.length) {
          melhorPlano = planoAtual;
        }
      }

      //se os dois saldos se anulam, não precisa testar outras combinações
      if (saldoAtual + saldoOutro === 0) {
        break;
      }
    }

    return melhorPlano;
  }

  return buscarMenosPagamentos() ?? [];
}

//calcula as quitações separadamente para cada moeda
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