"use client";

import { useEffect, useState, type FormEvent } from "react";
import { calcularDivisoesDespesa } from "../utils/calcularDivisoesDespesa";
import type { DivisaoDespesa, Moeda, TipoRateio,} from "../hooks/useGrupos";

//Define a lista de integrantes e a função chamada quando salva despesa
type FormularioDespesaProps = {
  integrantes: string[];
  aoEnviar: (
    descricao: string,
    valorCentavos: number,
    pagador: string,
    moeda: Moeda,
    tipoRateio: TipoRateio,
    divisoes: DivisaoDespesa[],
  ) => void;
};

export default function FormularioDespesa({
  integrantes,
  aoEnviar,
}: FormularioDespesaProps) {
  //Estados dos campos que o usuário preenche
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [pagador, setPagador] = useState(integrantes[0] ?? "");
  const [participantesRateio, setParticipantesRateio] = useState(integrantes);
  const [tipoRateio, setTipoRateio] = useState<TipoRateio>("igual");
  const [valoresInformados, setValoresInformados] = useState<Record<string, string>>({});
  const [erroRateio, setErroRateio] = useState("");
  const [moeda, setMoeda] = useState<Moeda>("BRL");

  //Atualiza os participantes selecionados quando o grupo muda e se o pagador sair do grupo seleciona o primeiro integrante que sobrou
  useEffect(() => {
    setParticipantesRateio(integrantes);

    if (!integrantes.includes(pagador)) {
      setPagador(integrantes[0] ?? "");
    }
  }, [integrantes, pagador]);

  //Adiciona ou remove uma pessoa da divisão de despesa
  function alternarParticipante(nome: string) {
    setParticipantesRateio((atuais) =>
      atuais.includes(nome)
        ? atuais.filter((integrante) => integrante !== nome)
        : [...atuais, nome],
    );
    setErroRateio("");
  }

  //valida os dados, calcula partes e envia a despesa para o componente pai
  function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const descricaoFinal = descricao.trim();
    const valorNumerico = Number(valor.replace(",", "."));
    const valorCentavos = Math.round(valorNumerico * 100);

    //Impede de salvar uma despesa incompleta ou sem participantes no rateio
    if (
      !descricaoFinal ||
      !Number.isFinite(valorNumerico) ||
      valorCentavos <= 0 ||
      participantesRateio.length === 0
    ) {
      setErroRateio("Preencha os dados e selecione quem vai dividir a despesa.");
      return;
    }

    //Assoscia o valor digitado por cada pessoa ao nome dela
    const dadosParticipantes = participantesRateio.map((integrante) => ({
      integrante,
      valorInformado: valoresInformados[integrante] ?? "",
    }));

    //Usa a função para calcular a divisão escolhida
    const divisoes = calcularDivisoesDespesa(
      tipoRateio,
      valorCentavos,
      dadosParticipantes,
    );

    //A divisão retorna null se os valores não forem válidos
    if (divisoes === null) {
      setErroRateio(
        tipoRateio === "valor"
          ? "A soma dos valores fixos precisa ser igual ao total da despesa."
          : "A soma das porcentagens precisa ser exatamente 100% e os campos devem estar preenchidos.",
      );
      return;
    }

    aoEnviar(
      descricaoFinal,
      valorCentavos,
      pagador,
      moeda,
      tipoRateio,
      divisoes,
    );

    //Limpa os campos depois de salvar uma despesa
    setDescricao("");
    setValor("");
    setValoresInformados({});
    setErroRateio("");
  }

  //O rateio só pode ser inserido depois adicionar alguem no grupo
  if (integrantes.length === 0) {
    return <p>Adicione integrantes ao grupo antes de cadastrar despesas.</p>;
  }

  return (
    <form onSubmit={enviarFormulario}>
      <label htmlFor={`descricao-${integrantes[0]}`}>O que foi pago?</label>
      <input
        id={`descricao-${integrantes[0]}`}
        value={descricao}
        onChange={(event) => setDescricao(event.target.value)}
        placeholder="Ex.: Gasolina"
        required
      />

      <label htmlFor={`valor-${integrantes[0]}`}>Valor total em reais</label>
      <input
        id={`valor-${integrantes[0]}`}
        type="number"
        min="0.01"
        step="0.01"
        value={valor}
        onChange={(event) => setValor(event.target.value)}
        placeholder="Ex.: 125,20"
        required
      />

      <label htmlFor={`moeda-${integrantes[0]}`}>Moeda</label>
      <select
        id={`moeda-${integrantes[0]}`}
        value={moeda}
        onChange={(event) => setMoeda(event.target.value as Moeda)}
      >
        <option value="BRL">Real (BRL)</option>
        <option value="USD">Dólar (USD)</option>
        <option value="EUR">Euro (EUR)</option>
      </select>

      <label htmlFor={`pagador-${integrantes[0]}`}>Quem pagou?</label>
      <select
        id={`pagador-${integrantes[0]}`}
        value={pagador}
        onChange={(event) => setPagador(event.target.value)}
        required
      >
        {integrantes.map((integrante, indice) => (
          <option key={`${integrante}-${indice}`} value={integrante}>
            {integrante}
          </option>
        ))}
      </select>

      {/* Permite escolher quais integrantes participarão do rateio */}
      <fieldset>
        <legend>Quem vai dividir esta despesa?</legend>

        {integrantes.map((integrante, indice) => (
          <label key={`${integrante}-${indice}`}>
            <input
              type="checkbox"
              checked={participantesRateio.includes(integrante)}
              onChange={() => alternarParticipante(integrante)}
            />
            {integrante}
          </label>
        ))}
      </fieldset>

      <label htmlFor={`tipo-rateio-${integrantes[0]}`}>
        Como dividir o valor?
      </label>
      <select
        id={`tipo-rateio-${integrantes[0]}`}
        value={tipoRateio}
        onChange={(event) => {
          setTipoRateio(event.target.value as TipoRateio);
          setErroRateio("");
        }}
      >
        <option value="igual">Igualmente</option>
        <option value="valor">Por valores fixos</option>
        <option value="porcentagem">Por porcentagem</option>
      </select>
      
      {/* Mostra campos extras quando o rateio não é igualitário */}
      {tipoRateio !== "igual" && (
        <fieldset>
          <legend>
            {tipoRateio === "valor"
              ? "Quanto cada pessoa paga? (em reais)"
              : "Qual a porcentagem de cada pessoa?"}
          </legend>

          {participantesRateio.map((integrante, indice) => (
            <label key={`${integrante}-${indice}`}>
              {integrante}
              <input
                type="number"
                min="0"
                max={tipoRateio === "porcentagem" ? "100" : undefined}
                step="0.01"
                value={valoresInformados[integrante] ?? ""}
                onChange={(event) =>
                  setValoresInformados((atuais) => ({
                    ...atuais,
                    [integrante]: event.target.value,
                  }))
                }
                placeholder={tipoRateio === "valor" ? "Ex.: 25,00" : "Ex.: 50"}
                required
              />
            </label>
          ))}
        </fieldset>
      )}

      {erroRateio && <p role="alert">{erroRateio}</p>}

      <button type="submit" disabled={participantesRateio.length === 0}>
        Salvar despesa
      </button>
    </form>
  );
}