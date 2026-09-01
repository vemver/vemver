export type ProdutoEncontradoBusca = {
  id: number
  nome: string | null
  descricao: string | null
  categoria: string | null
  marca: string | null
  preco: number | null
  preco_promocional: number | null
  imagem_url: string | null
  promocao: boolean | null
  relevanciaTexto: number
}

export type ResultadoLojaBusca = {
  id: number
  nome: string | null
  categoria: string | null
  cidade: string | null
  uf: string | null
  descricao: string | null
  imagem_url: string | null
  whatsapp: string | null
  latitude: number | null
  longitude: number | null
  premium: boolean | null
  patrocinado: boolean | null
  score: number | null

  relevanciaLoja: number
  relevanciaProdutos: number
  relevanciaTotal: number

  distanciaKm: number | null

  produtosEncontrados: ProdutoEncontradoBusca[]
}