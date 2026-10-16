"use client";

import FormularioGrupo from "./components/FormularioGrupo";
import ListaGrupos from "./components/ListaGrupos";
import { useGrupos } from "./hooks/useGrupos";

export default function Home() {
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
    <main>
      <h1>Split&Go</h1>
      <p>Divida suas despesas com seu grupo !</p>

      <section>
        <h2>Seus grupos</h2>
        <ListaGrupos grupos={grupos}
        aoAdicionarIntegrante={adicionarIntegrante}
        aoRemoverIntegrante={removerIntegrante}
        aoAdicionarDespesa={adicionarDespesa}
        aoRemoverGrupo={removerGrupo}/>

        {!mostrarFormulario && (
          <button type="button" onClick={()=> setMostrarFormulario(true)}>Criar grupo</button>
        )}

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
  );
}