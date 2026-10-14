import { SPONSORS_BAKED } from "@/lib/baked-assets.generated";

/**
 * Franja de sponsors para las imágenes de compartir (fixture, posiciones…).
 *
 * En la imagen los sponsors van SIEMPRE en 2 filas (en la web las filas 1/2 se
 * respetan; acá se reparten por cantidad para que ninguna se corte). El orden es
 * el mismo: primero fila 1 (por su orden), después fila 2.
 */
export function BloqueSponsors() {
  const ordenados = SPONSORS_BAKED.filter((sp) => sp.dataUri).sort(
    (a, b) => a.fila - b.fila || a.orden - b.orden
  );
  const corte = Math.floor(ordenados.length / 2);
  const filas = [ordenados.slice(0, corte), ordenados.slice(corte)];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: 24,
      }}
    >
      <div style={{ width: 760, height: 2, background: "rgba(0,0,0,0.1)" }} />
      {filas.map((grupo, gi) =>
        grupo.length === 0 ? null : (
          <div
            key={gi}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: gi === 0 ? 30 : 26,
            }}
          >
            {grupo.map((sp, si) => {
              // Los logos verticales (YAKY) quedan chicos con el mismo alto
              // que los apaisados; se les da más alto para emparejarlos.
              const vertical = /yaky/i.test(sp.nombre);
              const base = grupo.length <= 3 ? 78 : 62;
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={si}
                  src={sp.dataUri as string}
                  height={vertical ? Math.round(base * 1.5) : base}
                  style={{
                    objectFit: "contain",
                    maxWidth: grupo.length <= 3 ? 320 : 240,
                    margin: grupo.length <= 3 ? "0 26px" : "0 18px",
                  }}
                  alt={sp.nombre}
                />
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
