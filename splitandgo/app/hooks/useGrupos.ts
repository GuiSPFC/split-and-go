"use client";

import { useState, useEffect } from "react";
export type TipoRateio = "igual" | "valor" | "porcentagem";
export type Moeda = "BRL" | "USD" | "EUR";

export type DivisaoDespesa = {
    integrante: string;
    valorCentavos: number;
};

export type Despesa = {
    id: number;
    descricao: string;
    valorCentavos: number;
    pagador: string;
    moeda: Moeda;
    tipoRateio: TipoRateio;
    divisoes: DivisaoDespesa[];
};

export type Grupo = {
    id: number;
    nome: string;
    integrantes: string[];
    despesas: Despesa [];
};

export function useGrupos() {
    const [grupos, setGrupos] = useState<Grupo[]>([]);
    const [nomeGrupo, setNomeGrupo] = useState("");
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [carregouGrupos, setCarregouGrupos] = useState(false);
    
    useEffect(() => {
    try {
        const dadosSalvos = localStorage.getItem("splitandgo-grupos");

        if (dadosSalvos) {
        const gruposSalvos = JSON.parse(dadosSalvos) as Grupo[];

        if (Array.isArray(gruposSalvos)) {
            setGrupos(gruposSalvos);
        }
        }
    } catch {
        console.error("Não foi possível carregar os grupos salvos.");
    } finally {
        setCarregouGrupos(true);
    }
    }, []);

    useEffect(() => {
    if (!carregouGrupos) return;

    localStorage.setItem("splitandgo-grupos", JSON.stringify(grupos));
    }, [grupos, carregouGrupos]);

    function criarGrupo(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const nome = nomeGrupo.trim();

        if(!nome) return;

        setGrupos((gruposAtuais)=>[
            ...gruposAtuais,
            {
                id: Date.now(),
                nome,
                integrantes: [],
                despesas: [],
            },
        ]);

        setNomeGrupo("");
        setMostrarFormulario(false);
    }

    function adicionarIntegrante(idGrupo: number, nomeIntegrante: string) {
        const nome = nomeIntegrante.trim();
        if (!nome) return;

        setGrupos((gruposAtuais)=> gruposAtuais.map((grupo)=>grupo.id === idGrupo
            ? {...grupo, integrantes: [...grupo.integrantes,nome],} : grupo,
        ),
      );
    }

    function removerIntegrante(idGrupo: number, indiceIntegrante: number) {
        setGrupos ((gruposAtuais)=>
            gruposAtuais.map((grupo)=>
                grupo.id === idGrupo ? { ...grupo, integrantes: grupo.integrantes.filter(
                    (_, indice) => indice !== indiceIntegrante,
                ),} : grupo,),
        );
    }

    function removerGrupo (idGrupo: number) {
        setGrupos((gruposAtuais)=>
            gruposAtuais.filter((grupo)=> grupo.id !== idGrupo),);
    }

    function adicionarDespesa(
    idGrupo: number,
    descricao: string,
    valorCentavos: number,
    pagador: string,
    moeda: Moeda,
    tipoRateio: TipoRateio,
    divisoes: DivisaoDespesa[],
    ) {
    const descricaoFinal = descricao.trim();

    if (!descricaoFinal || valorCentavos <= 0 || divisoes.length === 0) {
        return;
    }

    setGrupos((gruposAtuais) =>
        gruposAtuais.map((grupo) => {
        if (grupo.id !== idGrupo || !grupo.integrantes.includes(pagador)) {
            return grupo;
        }

        const integrantesDivididos = divisoes.map(
            (divisao) => divisao.integrante,
        );
        const divisaoSemRepeticoes =
            new Set(integrantesDivididos).size === divisoes.length;
        const divisaoValida = divisoes.every(
            (divisao) =>
            grupo.integrantes.includes(divisao.integrante) &&
            Number.isInteger(divisao.valorCentavos) &&
            divisao.valorCentavos >= 0,
        );
        const somaDivisoes = divisoes.reduce(
            (total, divisao) => total + divisao.valorCentavos,
            0,
        );

        if (
            !divisaoSemRepeticoes ||
            !divisaoValida ||
            somaDivisoes !== valorCentavos
        ) {
            return grupo;
        }

        const novaDespesa: Despesa = {
            id: Date.now(),
            descricao: descricaoFinal,
            valorCentavos,
            pagador,
            moeda,
            tipoRateio,
            divisoes,
        };

        return {
            ...grupo,
            despesas: [...grupo.despesas, novaDespesa],
        };
        }),
    );
    }

    return {
        grupos,
        nomeGrupo,
        setNomeGrupo,
        mostrarFormulario,
        setMostrarFormulario,
        criarGrupo,
        adicionarIntegrante,
        removerIntegrante,
        adicionarDespesa,
        removerGrupo,
    };
}