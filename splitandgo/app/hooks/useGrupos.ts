"use client";

import { useState } from "react";

export type Grupo = {
    id: number;
    nome: string;
    integrantes: string[];
};

export function useGrupos() {
    const [grupos, setGrupos] = useState<Grupo[]>([]);
    const [nomeGrupo, setNomeGrupo] = useState("");
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

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

    return {
        grupos,
        nomeGrupo,
        setNomeGrupo,
        mostrarFormulario,
        setMostrarFormulario,
        criarGrupo,
        adicionarIntegrante,
        removerIntegrante,
    };
}