interface WithTitulo {
  titulo: string;
}

export function deduplicateByTitle<TItem extends WithTitulo>(items: readonly TItem[]): TItem[] {
  return items.filter(
    (item, index, arr) => arr.findIndex((x) => x.titulo === item.titulo) === index,
  );
}
