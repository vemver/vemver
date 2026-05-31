import { supabase } from "../../supabase"

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

  const { data: produtos } = await supabase
    .from("produtos")
    .select("*")
    .eq("loja_id", loja.id)
    .order("id", { ascending: false })

  const instagramLimpo = loja.instagram?.replace("@", "")

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {loja.imagem_url && (
          <img
            src={loja.imagem_url}
            alt={loja.nome}
            className="h-[420px] w-full rounded-[2rem] object-cover shadow-2xl"
          />
        )}

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <span className="rounded-full bg-green-400/10 px-4 py-2 text-sm font-bold text-green-300">
            {loja.categoria}
          </span>

          <h1 className="mt-6 text-5xl md:text-7xl font-black">
            {loja.nome}
          </h1>

          {loja.descricao && (
            <p className="mt-6 text-xl leading-relaxed text-zinc-300">
              {loja.descricao}
            </p>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Cidade</p>
              <p className="mt-1 text-lg font-bold">
                📍 {loja.cidade}
              </p>
            </div>

            {loja.endereco && (
              <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
                <p className="text-sm text-zinc-500">Endereço</p>
                <p className="mt-1 text-lg font-bold">
                  📌 {loja.endereco}
                </p>
              </div>
            )}
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
                  className="rounded-3xl border border-white/10 bg-zinc-900 p-5"
                >
                  {produto.imagem_url && (
                    <img
                      src={produto.imagem_url}
                      alt={produto.nome}
                      className="h-48 w-full rounded-2xl object-cover"
                    />
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
                        `Olá! Vi no VemVer e tenho interesse em: ${produto.nome}`
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
      </div>
    </main>
  )
}