import CartaoGrupo from "./CartaoGrupo";
import type { Grupo, Moeda, TipoRateio, DivisaoDespesa } from "../hooks/useGrupos";

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
};

export default function ListaGrupos({
  grupos,
  aoAdicionarIntegrante,
  aoRemoverIntegrante,
  aoAdicionarDespesa,
  aoRemoverGrupo,
}: ListaGruposProps) {
  if (grupos.length === 0) {
    return <p>Você ainda não tem grupos</p>;
  }

  return (
    <ul>
      {grupos.map((grupo) => (
        <CartaoGrupo
          key={grupo.id}
          grupo={grupo}
          aoAdicionarIntegrante={aoAdicionarIntegrante}
          aoRemoverIntegrante={aoRemoverIntegrante}
          aoAdicionarDespesa={aoAdicionarDespesa}
          aoRemoverGrupo={aoRemoverGrupo}
        />
      ))}
    </ul>
  );
}