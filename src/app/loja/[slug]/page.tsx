import { supabase } from "../../supabase"
import FavoritarLoja from "./FavoritarLoja"
import AvaliarLoja from "./AvaliarLoja"
export default async function LojaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const partesSlug = slug.split("-")
  const possivelId = Number(partesSlug[0])

  let loja = null
  let error = null

  if (!isNaN(possivelId)) {
    const resultado = await supabase
      .from("lojas")
      .select("*")
      .eq("id", possivelId)
      .single()

    loja = resultado.data
    error = resultado.error
  } else {
    const nomeFormatado = slug
      .replaceAll("-", " ")
      .trim()
      .toLowerCase()

    const resultado = await supabase
      .from("lojas")
      .select("*")

    error = resultado.error

    loja = resultado.data?.find(
      (l) =>
        l.nome &&
        l.nome.toLowerCase().trim() === nomeFormatado
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        Erro ao buscar loja
      </main>
    )
  }

  if (!loja) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        Loja não encontrada
      </main>
    )
  }

  if (loja.ativo === false) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        Esta loja está temporariamente indisponível.
      </main>
    )
  }
await supabase
  .from("lojas")
  .update({
    visualizacoes: Number(loja.visualizacoes || 0) + 1,
  })
  .eq("id", loja.id)
  const { data: produtos } = await supabase
    .from("produtos")
    .select("*")
    .eq("loja_id", loja.id)
    .eq("ativo", true)
    .order("destaque", { ascending: false })
    .order("id", { ascending: false })

  const { data: avaliacoes } = await supabase
    .from("avaliacoes")
    .select("*")
    .eq("loja_id", loja.id)
    .eq("aprovado", true)
    .order("id", { ascending: false })

  const totalAvaliacoes = avaliacoes?.length || 0

  const mediaAvaliacoes =
    totalAvaliacoes > 0
      ? (
          avaliacoes!.reduce(
            (total, item) => total + Number(item.nota || 0),
            0
          ) / totalAvaliacoes
        ).toFixed(1)
      : "0.0"

  const instagramLimpo = loja.instagram?.replace("@", "")

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {loja.imagem_url ? (
          <img
            src={loja.imagem_url}
            alt={loja.nome}
            className="h-[420px] w-full rounded-[2rem] object-cover shadow-2xl"
          />
        ) : (
          <div className="flex h-[320px] w-full items-center justify-center rounded-[2rem] border border-white/10 bg-zinc-900 text-zinc-500">
            Loja sem imagem cadastrada
          </div>
        )}

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <div className="flex flex-wrap gap-3">
            {loja.categoria && (
              <span className="rounded-full bg-green-400/10 px-4 py-2 text-sm font-bold text-green-300">
                {loja.categoria}
              </span>
            )}

            {loja.premium && (
              <span className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-black text-black">
                ⭐ PREMIUM
              </span>
            )}

            {totalAvaliacoes > 0 && (
              <span className="rounded-full bg-yellow-400/10 px-4 py-2 text-sm font-black text-yellow-300">
                ⭐ {mediaAvaliacoes} ({totalAvaliacoes} avaliações)
              </span>
            )}
          </div>

          <h1 className="mt-6 text-5xl md:text-7xl font-black">
            {loja.nome}
          </h1>

          {loja.descricao && (
            <p className="mt-6 text-xl leading-relaxed text-zinc-300">
              {loja.descricao}
            </p>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {loja.cidade && (
              <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
                <p className="text-sm text-zinc-500">Cidade</p>
                <p className="mt-1 text-lg font-bold">
                  📍 {loja.cidade}
                </p>
              </div>
            )}

            {loja.endereco && (
              <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
                <p className="text-sm text-zinc-500">Endereço</p>
                <p className="mt-1 text-lg font-bold">
                  📌 {loja.endereco}
                </p>
              </div>
            )}

            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Avaliações</p>
              <p className="mt-1 text-lg font-bold text-yellow-300">
                ⭐ {mediaAvaliacoes} / 5
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {totalAvaliacoes} avaliação(ões)
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            {loja.whatsapp && (
              <a
                href={`https://wa.me/55${loja.whatsapp}`}
                target="_blank"
                className="rounded-2xl bg-green-400 px-8 py-4 font-black text-black"
              >
                Chamar no WhatsApp
              </a>
            )}

            {loja.instagram && (
              <a
                href={`https://instagram.com/${instagramLimpo}`}
                target="_blank"
                className="rounded-2xl border border-pink-500/40 bg-pink-500/10 px-8 py-4 font-black text-pink-300"
              >
                Instagram
              </a>
            )}

            {loja.endereco && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  loja.endereco + " " + loja.cidade
                )}`}
                target="_blank"
                className="rounded-2xl border border-green-400/30 bg-green-400/10 px-8 py-4 font-black text-green-300"
              >
                Como chegar
              </a>
            )}
<FavoritarLoja lojaId={loja.id} />
            <a
              href="#avaliacoes"
              className="rounded-2xl border border-yellow-400/40 bg-yellow-400/10 px-8 py-4 font-black text-yellow-300"
            >
              Avaliações
            </a>

            <a
              href="/"
              className="rounded-2xl border border-white/20 px-8 py-4 font-bold"
            >
              Voltar
            </a>
          </div>
        </div>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl font-black">
                Produtos e serviços
              </h2>

              <p className="mt-2 text-zinc-400">
                Veja o que esta loja oferece no VemVer.
              </p>
            </div>

            <span className="rounded-full bg-green-400/10 px-4 py-2 text-sm font-bold text-green-300">
              {produtos?.length || 0} itens
            </span>
          </div>

          {produtos && produtos.length > 0 ? (
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {produtos.map((produto) => (
                <div
                  key={produto.id}
                  className={`rounded-3xl border p-5 transition hover:scale-[1.02] ${
                    produto.destaque === true
                      ? "border-2 border-yellow-400 bg-yellow-400/10 shadow-2xl shadow-yellow-500/20"
                      : "border-white/10 bg-zinc-900 hover:border-green-400/40"
                  }`}
                >
                  {produto.imagem_url ? (
                    <img
                      src={produto.imagem_url}
                      alt={produto.nome}
                      className="h-48 w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center rounded-2xl bg-black/40 text-zinc-500">
                      Sem imagem
                    </div>
                  )}

                  {produto.destaque === true && (
                    <span className="mt-4 inline-block rounded-full bg-yellow-400 px-3 py-1 text-sm font-black text-black">
                      ⭐ DESTAQUE
                    </span>
                  )}

                  <h3 className="mt-5 text-2xl font-black">
                    {produto.nome}
                  </h3>

                  {produto.preco && (
                    <p className="mt-2 text-2xl font-black text-green-300">
                      R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
                    </p>
                  )}

                  {produto.descricao && (
                    <p className="mt-3 text-zinc-400">
                      {produto.descricao}
                    </p>
                  )}

                  {loja.whatsapp && (
                    <a
                     href={`https://wa.me/55${loja.whatsapp}?text=${encodeURIComponent(
  `Olá! Vi o produto ${produto.nome} no VemVer e gostaria de mais informações.${produto.preco ? ` Valor anunciado: R$ ${Number(produto.preco).toFixed(2).replace(".", ",")}` : ""}`
)}`}
                      target="_blank"
                      className="mt-5 block rounded-2xl bg-green-400 px-5 py-4 text-center font-black text-black"
                    >
                      Tenho interesse
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 text-zinc-400">
              Esta loja ainda não cadastrou produtos ou serviços.
            </div>
          )}
        </section>

        <section id="avaliacoes" className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl font-black">
                Avaliações da loja
              </h2>

              <p className="mt-2 text-zinc-400">
                Veja o que os clientes estão falando.
              </p>
            </div>

            <span className="rounded-full bg-yellow-400/10 px-4 py-2 text-sm font-black text-yellow-300">
              ⭐ {mediaAvaliacoes}
            </span>
          </div>

          {avaliacoes && avaliacoes.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {avaliacoes.map((avaliacao) => (
                <div
                  key={avaliacao.id}
                  className="rounded-3xl border border-white/10 bg-zinc-900 p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-black">
                      {avaliacao.nome_cliente || "Cliente"}
                    </h3>

                    <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-black text-black">
                      ⭐ {avaliacao.nota}
                    </span>
                  </div>

                  {avaliacao.comentario && (
                    <p className="mt-4 text-zinc-300">
                      {avaliacao.comentario}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 text-zinc-400">
              Esta loja ainda não possui avaliações.
            </div>
          )}
          <AvaliarLoja lojaId={loja.id} />
        </section>
      </div>
    </main>
  )
}