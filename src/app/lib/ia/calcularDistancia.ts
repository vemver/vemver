export function calcularDistanciaKm(
  latitudeOrigem: number,
  longitudeOrigem: number,
  latitudeDestino: number,
  longitudeDestino: number
): number {
  const raioTerraKm = 6371

  const grausParaRadianos = (graus: number) =>
    (graus * Math.PI) / 180

  const diferencaLatitude = grausParaRadianos(
    latitudeDestino - latitudeOrigem
  )

  const diferencaLongitude = grausParaRadianos(
    longitudeDestino - longitudeOrigem
  )

  const latitudeOrigemRad =
    grausParaRadianos(latitudeOrigem)

  const latitudeDestinoRad =
    grausParaRadianos(latitudeDestino)

  const a =
    Math.sin(diferencaLatitude / 2) ** 2 +
    Math.cos(latitudeOrigemRad) *
      Math.cos(latitudeDestinoRad) *
      Math.sin(diferencaLongitude / 2) ** 2

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return raioTerraKm * c
}