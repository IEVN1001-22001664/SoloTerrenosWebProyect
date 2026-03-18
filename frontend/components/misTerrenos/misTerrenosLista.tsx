import TerrenoCard from "./terrenoCard";
import EmptyMisTerrenos from "./emptyMisTerrenos";

interface Props {
  terrenos: any[];
}

export default function MisTerrenosLista({ terrenos }: Props) {
  if (!terrenos || terrenos.length === 0) {
    return <EmptyMisTerrenos />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {terrenos.map((terreno) => (
        <TerrenoCard key={terreno.id} terreno={terreno} />
      ))}
    </div>
  );
}