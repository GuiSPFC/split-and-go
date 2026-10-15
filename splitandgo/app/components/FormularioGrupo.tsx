"use client";

type FormularioGrupoProps = {
    nomeGrupo: string;
    aoAlterarNome: (nome: string) => void;
    aoEnviar: (event: React.FormEvent<HTMLFormElement>) => void;
    aoCancelar: () => void;
};

export default function FormularioGrupo({
    nomeGrupo,
    aoAlterarNome,
    aoEnviar,
    aoCancelar,
}: FormularioGrupoProps){
    return (
        <form onSubmit={aoEnviar}>
            <label htmlFor="nomeGrupo">Nome do grupo</label>
            <input
                id="nomeGrupo"
                value={nomeGrupo}
                onChange={(event)=> aoAlterarNome(event.target.value)}
                placeholder="Viagem para ...." required
            />

            <button type="submit">Salvar grupo</button>
            <button type="button" onClick={aoCancelar}>Cancelar</button>
        </form>
    );
}