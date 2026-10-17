"use client";

import { useState, useEffect } from "react";

//Opções de divisão e moedas 
export type TipoRateio = "igual" | "valor" | "porcentagem";
export type Moeda = "BRL" | "USD" | "EUR";

//parte da despesa atribuida a um integrante
export type DivisaoDespesa = {
    integrante: string;
    valorCentavos: number;
};

//dados que formam uma despesa
export type Despesa = {
    id: number;
    descricao: string;
    valorCentavos: number;
    pagador: string;
    moeda: Moeda;
    tipoRateio: TipoRateio;
    divisoes: DivisaoDespesa[];
};

//dados que formam um grupo
export type Grupo = {
    id: number;
    nome: string;
    integrantes: string[];
    despesas: Despesa [];
};

export function useGrupos() {
    //Estados usados pela página e pelos formulários
    const [grupos, setGrupos] = useState<Grupo[]>([]);
    const [nomeGrupo, setNomeGrupo] = useState("");
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [carregouGrupos, setCarregouGrupos] = useState(false);
    
    //Carrega os grupos salvos no navegador
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

    //Salva os grupos sempre que a lista muda e espera o carregamento para não sobrescrever os dados
    useEffect(() => {
    if (!carregouGrupos) return;

    localStorage.setItem("splitandgo-grupos", JSON.stringify(grupos));
    }, [grupos, carregouGrupos]);

    //Cria um grupo
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

    //adiciona um integrante no grupo
    function adicionarIntegrante(idGrupo: number, nomeIntegrante: string) {
        const nome = nomeIntegrante.trim();
        if (!nome) return;

        setGrupos((gruposAtuais)=> gruposAtuais.map((grupo)=>grupo.id === idGrupo
            ? {...grupo, integrantes: [...grupo.integrantes,nome],} : grupo,
        ),
      );
    }

    //Remove um integrante
    function removerIntegrante(idGrupo: number, indiceIntegrante: number) {
        setGrupos ((gruposAtuais)=>
            gruposAtuais.map((grupo)=>
                grupo.id === idGrupo ? { ...grupo, integrantes: grupo.integrantes.filter(
                    (_, indice) => indice !== indiceIntegrante,
                ),} : grupo,),
        );
    }

    //Remove o grupo
    function removerGrupo (idGrupo: number) {
        setGrupos((gruposAtuais)=>
            gruposAtuais.filter((grupo)=> grupo.id !== idGrupo),);
    }

    //Valida os dados e adiciona uma despesa no grupo
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

    //só altera o grupo escolhido e verifica se o pagador pertence a ele
    setGrupos((gruposAtuais) =>
        gruposAtuais.map((grupo) => {
        if (grupo.id !== idGrupo || !grupo.integrantes.includes(pagador)) {
            return grupo;
        }

        const integrantesDivididos = divisoes.map(
            (divisao) => divisao.integrante,
        );

        //Cada integrante só pode aparecer uma vez na divisão das despesas
        const divisaoSemRepeticoes =
            new Set(integrantesDivididos).size === divisoes.length;

        //Verifica se todos fazem parte do grupo
        const divisaoValida = divisoes.every(
            (divisao) =>
            grupo.integrantes.includes(divisao.integrante) &&
            Number.isInteger(divisao.valorCentavos) &&
            divisao.valorCentavos >= 0,
        );

        //Confere se a soma das partes é igual ao total da despesa
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

        //Retorna uma cópia do grupo com a nova despesa
        return {
            ...grupo,
            despesas: [...grupo.despesas, novaDespesa],
        };
        }),
    );
    }

    //Disponibiliza os dados e as ações para a pagina e os componentes
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