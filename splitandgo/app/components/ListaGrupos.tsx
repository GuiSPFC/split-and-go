import CartaoGrupo from "./CartaoGrupo";
import type { Grupo } from "../hooks/useGrupos";

type ListaGruposProps = {
  grupos: Grupo[];
  aoAdicionarIntegrante: (idGrupo: number, nome: string) => void;
  aoRemoverIntegrante: (idGrupo: number, indiceIntegrante: number) => void;
};

export default function ListaGrupos({
  grupos,
  aoAdicionarIntegrante,
  aoRemoverIntegrante,
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
        />
      ))}
    </ul>
  );
}