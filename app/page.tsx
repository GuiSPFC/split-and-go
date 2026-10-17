"use client";

import FormularioGrupo from "./components/FormularioGrupo";
import ListaGrupos from "./components/ListaGrupos";
import { useGrupos } from "./hooks/useGrupos";

export default function Home() {
  //Hook que concentra os dados dos grupos e suas ações
  const {
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
  } = useGrupos();

  return(
    <div className="pagina">
      <header className="cabecalho">
        <h1>Split&Go</h1>
        <p>Divida suas despesas de viagens com seu grupo!</p>
      </header>

      <main className="conteudo">
        <section className="secao-grupos">
          <h2>Seus grupos</h2>

          {/*Mostra os grupos e recebe as ações para gerenciar*/}
          <ListaGrupos
            grupos={grupos}
            aoAdicionarIntegrante={adicionarIntegrante}
            aoRemoverIntegrante={removerIntegrante}
            aoAdicionarDespesa={adicionarDespesa}
            aoRemoverGrupo={removerGrupo}
          />

          {/*Mostra o botão enquanto o formulario de criação está fechado*/}
          {!mostrarFormulario && (
            <button type="button" onClick={()=> setMostrarFormulario(true)}>Criar grupo</button>
          )}

          {/*Qunado abre, o formulario recebe os dados e ações da pagina*/}
          {mostrarFormulario && (
            <FormularioGrupo
              nomeGrupo={nomeGrupo}
              aoAlterarNome={setNomeGrupo}
              aoEnviar={criarGrupo}
              aoCancelar={()=> setMostrarFormulario(false)}
            />
          )}
        </section>
      </main>

      <footer className="rodape">
        <p>Split&Go - te ajudando a dividir despesas com facilidade.</p>
      </footer>
    </div>
  );
}