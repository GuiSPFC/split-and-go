"use client";

import { useState } from "react";
import { Grupo, DivisaoDespesa, TipoRateio, Moeda } from "../hooks/useGrupos";
import FormularioDespesa from "./FormularioDespesa";
import { calcularQuitacoes, calcularSaldos } from "../utils/calcularQuitacoes";


//Define os dados e ações que o cartão recebe do componente pai
type CartaoGrupoProps = {
    grupo: Grupo;
    aoAdicionarIntegrante: (idGrupo: number, nome: string) => void;
    aoRemoverIntegrante: (idGrupo: number, indiceIntegrante: number) => void;
    aoAdicionarDespesa: (
        idGrupo: number,
        descricao: string,
        valorCentavos: number,
        pagador: string,
        moeda: Moeda,
        tipoRateio: TipoRateio,
        divisoes: DivisaoDespesa[],) => void;
    aoRemoverGrupo: (idGrupo: number) => void;
};

//Converte centavos para o formato de dinheiro da moeda escolhida
function formatarDinheiro(valorCentavos: number, moeda: Moeda) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moeda,
  }).format(valorCentavos / 100);
}
export default function CartaoGrupo({
    grupo,
    aoAdicionarIntegrante,
    aoRemoverIntegrante,
    aoAdicionarDespesa,
    aoRemoverGrupo,
}: CartaoGrupoProps){
    //Guarda o texto digitado no campo de integrante e calcula os saldos e as transferencias para o grupo
    const [nomeIntegrante, setNomeIntegrante] = useState("");
    const saldos = calcularSaldos(grupo);
    const quitacoes = calcularQuitacoes(grupo);

    //envia o novo integrante e limpa o campo após o envio
    function enviarFormulario(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        aoAdicionarIntegrante(grupo.id, nomeIntegrante);
        setNomeIntegrante("");
    }

    return (
        <li>
            <h3>{grupo.nome}</h3>

            <h4>Integrantes</h4>

            {/* Mostra uma mensagem quando o grupo ainda esta sem integrantes */}
            {grupo.integrantes.length === 0 ? (
            <p>Este grupo ainda não tem integrantes</p>
            ) : (
            <ul>
                {grupo.integrantes.map((integrante, indice) => (
                <li key={`${integrante}-${indice}`}>
                    {integrante}{" "}

                    <button
                    type="button"
                    onClick={() => aoRemoverIntegrante(grupo.id, indice)}
                    aria-label={`Remover ${integrante}`}>Remover</button>

                </li>
                ))}
            </ul>
            )}
            <form onSubmit={enviarFormulario}>
                <label htmlFor={`integrante-${grupo.id}`}>Nome do Integrante</label>
                <input id={`integrante-${grupo.id}`} value={nomeIntegrante}
                onChange={(event)=> setNomeIntegrante(event.target.value)}
                placeholder="Ex.: Matheus" required
                />

                <button type="submit">Adicionar Integrante</button>
            </form>

            <section>
                <h4>Despesas</h4>

                {/* Lista as despesas ou informa que ainda não tem nenhuma */}
                {grupo.despesas.length === 0 ? (
                    <p>Este grupo ainda não tem despesas</p>
                ): (
                    <ul>
                        {grupo.despesas.map((despesa)=> (
                            <li key={despesa.id}>
                                <strong>{despesa.descricao}</strong>
                                {" - "}
                                {formatarDinheiro(despesa.valorCentavos, despesa.moeda)}
                                <p>Pago por: {despesa.pagador}</p>
                                <p>{despesa.tipoRateio === "igual"
                                    ? "Divisão igualitaria:"
                                    : despesa.tipoRateio === "valor"
                                        ? "Divisão por valores fixos:"
                                        : "Divisão por porcentagem:"}</p>
                                <ul>
                                    {despesa.divisoes.map((divisao)=>(
                                        <li key={divisao.integrante}>
                                            {divisao.integrante}:{""}
                                            {formatarDinheiro(divisao.valorCentavos, despesa.moeda)}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                )}
                {/* O formulario envia os dados da despesa junto com o ID do grupo */}
                <FormularioDespesa
                    integrantes={grupo.integrantes}
                    aoEnviar={(descricao, valorCentavos, pagador,moeda, tipoRateio, divisoes) => 
                        aoAdicionarDespesa(
                            grupo.id,
                            descricao,
                            valorCentavos,
                            pagador,
                            moeda,
                            tipoRateio,
                            divisoes,
                        )
                    }
                />
            </section>

            <section>
                <h4>Saldos</h4>
                
                {/* Exibe quanto cada integrante deve ou tem a receber por moeda*/}
                {saldos.map((saldo)=> {
                    const valor = formatarDinheiro(
                        Math.abs(saldo.saldoCentavos), saldo.moeda,
                    );

                    return (
                        <p key={`${saldo.integrante}-${saldo.moeda}`}>
                            <strong>{saldo.integrante}:</strong>{" "}
                            {saldo.saldoCentavos > 0 ? `tem ${valor} a receber`: saldo.saldoCentavos < 0 ? `deve ${valor}` : "Está quite"}
                        </p>
                    )
                })}
            </section>

            <section>
                <h4>Plano de quitação</h4>

                {/* Mostra as transferencias necessarias para quitar as dívidas */}
                {quitacoes.length === 0 ? (
                    <p>Não há pagamentos pendentes</p>
                ): (
                    <ul>
                        {quitacoes.map((quitacao, indice)=>(
                            <li key={`${quitacao.devedor}-${quitacao.credor}-${quitacao.moeda}-${indice}`}>
                                {quitacao.devedor} paga{" "}
                                {formatarDinheiro(quitacao.valorCentavos, quitacao.moeda)} para {" "}
                                {quitacao.credor}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

                {/* Pede confirmação antes de apagar o grupo*/}
                <button className="botao-remover-grupo"
                type="button"
                onClick={()=>{
                    const confirmou = window.confirm(
                        `Remover o grupo"${grupo.nome}" e todas as despesas dele?`,
                    );
                    if (confirmou) {
                        aoRemoverGrupo(grupo.id);
                    }
                }}>Remover Grupo</button>
        </li>
    );
}