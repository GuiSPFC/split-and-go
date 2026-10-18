import CartaoGrupo from "./CartaoGrupo";
import type { Grupo, Moeda, TipoRateio, DivisaoDespesa } from "../hooks/useGrupos";

//Define a lista de grupos e as ações que serão passadas aos cartões
type ListaGruposProps = {
  grupos: Grupo[];
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
    aoRemoverDespesa: (idGrupo: number, idDespesa: number)=> void;
};

export default function ListaGrupos({
  grupos,
  aoAdicionarIntegrante,
  aoRemoverIntegrante,
  aoAdicionarDespesa,
  aoRemoverGrupo,
  aoRemoverDespesa,
}: ListaGruposProps) {
  if (grupos.length === 0) {
    return <p>Você ainda não tem grupos</p>;
  }

  return (
    <ul className="lista-grupos">
      {/* Percorre os grupos e cria um cartão para cada um */}
      {grupos.map((grupo) => (
        <CartaoGrupo
          key={grupo.id}
          grupo={grupo}
          aoAdicionarIntegrante={aoAdicionarIntegrante}
          aoRemoverIntegrante={aoRemoverIntegrante}
          aoAdicionarDespesa={aoAdicionarDespesa}
          aoRemoverGrupo={aoRemoverGrupo}
          aoRemoverDespesa={aoRemoverDespesa}
        />
      ))}
    </ul>
  );
}