"use client";

//Define os dados e as funções recebidas da página principal
type FormularioGrupoProps = {
    nomeGrupo: string;
    aoAlterarNome: (nome: string) => void;
    aoEnviar: (event: React.FormEvent<HTMLFormElement>) => void;
    aoCancelar: () => void;
};

//Formulário controlado
export default function FormularioGrupo({
    nomeGrupo,
    aoAlterarNome,
    aoEnviar,
    aoCancelar,
}: FormularioGrupoProps){
    return (
        //a página principal recebeo envio e cria o grupo
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