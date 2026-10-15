"use client";

import { useState } from "react";
import type { Grupo } from "../hooks/useGrupos";

type CartaoGrupoProps = {
    grupo: Grupo;
    aoAdicionarIntegrante: (idGrupo: number, nome: string) => void;
    aoRemoverIntegrante: (idGrupo: number, indiceIntegrante: number) => void;
};

export default function CartaoGrupo({
    grupo,
    aoAdicionarIntegrante,
    aoRemoverIntegrante,
}: CartaoGrupoProps){
    const [nomeIntegrante, setNomeIntegrante] = useState("");

    function enviarFormulario(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        aoAdicionarIntegrante(grupo.id, nomeIntegrante);
        setNomeIntegrante("");
    }

    return (
        <li>
            <h3>{grupo.nome}</h3>

            <h4>Integrantes</h4>

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
        </li>
    );
}