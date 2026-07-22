"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const categorias = [
  "Restaurantes",
  "Mercados",
  "Moda",
  "Tecnologia",
  "Farmácias",
  "Veículos",
  "Beleza",
  "Serviços",
];

export default function Home() {
  const [lojas, setLojas] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [localizacaoStatus, setLocalizacaoStatus] = useState(
    "Localização ainda não ativada"
  );

  useEffect(() => {
    carregarDados();
    pegarLocalizacao();
  }, []);

  function pegarLocalizacao() {
    if (!navigator.geolocation) {
      setLocalizacaoStatus("Seu navegador não permite localização");
      return;
    }

    setLocalizacaoStatus("Solicitando localização...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocalizacaoStatus("Localização ativa");
      },
      () => setLocalizacaoStatus("Localização não autorizada")
    );
  }

  async function carregarDados() {
   const { data: lojasData, error: lojasError } = await supabase
  .from("lojas")
  .select("*")
  .eq("status", "aprovada");

    if (lojasError) {
      console.log(lojasError);
      return;
    }

    setLojas(lojasData || []);

    const { data: produtosData, error: produtosError } = await supabase
      .from("produtos")
      .select("*")
      .order("id", { ascending: false });

    if (produtosError) {
      console.log(produtosError);
      return;
    }

    setProdutos(produtosData || []);
  }

  function normalizar(texto: string) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function criarSlugLoja(loja: any) {
    return `/loja/${loja.id}-${loja.nome
      .toLowerCase()
      .replaceAll(" ", "-")}`;
  }
function criarSlugProduto(produto: any) {
  const nome = String(produto.nome || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return `/produto/${produto.id}-${nome}`
}
  function calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  const lojasFiltradas = lojas
    .filter((loja) => {
      if (loja.ativo === false) return false;

      const buscaNormalizada = normalizar(busca);

      if (!buscaNormalizada) return true;

      return (
        normalizar(loja.nome || "").includes(buscaNormalizada) ||
        normalizar(loja.categoria || "").includes(buscaNormalizada) ||
        normalizar(loja.cidade || "").includes(buscaNormalizada) ||
        normalizar(loja.descricao || "").includes(buscaNormalizada)
      );
    })
   .sort((a, b) => {
  const scoreA = Number(a.score || 0)
  const scoreB = Number(b.score || 0)

  if (scoreA !== scoreB) {
    return scoreB - scoreA
  }

      if (
        latitude &&
        longitude &&
        a.latitude &&
        a.longitude &&
        b.latitude &&
        b.longitude
      ) {
        return (
          calcularDistancia(
            latitude,
            longitude,
            Number(a.latitude),
            Number(a.longitude)
          ) -
          calcularDistancia(
            latitude,
            longitude,
            Number(b.latitude),
            Number(b.longitude)
          )
        );
      }

      return 0;
    });

  const lojasPremium = lojasFiltradas.filter(
  (loja) =>
    loja.premium === true &&
    loja.patrocinado !== true
);
  const lojasPatrocinadas = lojasFiltradas.filter(
  (loja) => loja.patrocinado === true
);
const lojasComuns = lojasFiltradas.filter(
  (loja) =>
    loja.patrocinado !== true &&
    loja.premium !== true
);
const produtosDestaque = produtos
  .filter(
    (produto) =>
      produto.ativo === true &&
      produto.destaque === true
  )
  .sort((a, b) => {
    const lojaA = lojas.find(
      (l) => Number(l.id) === Number(a.loja_id)
    )

    const lojaB = lojas.find(
      (l) => Number(l.id) === Number(b.loja_id)
    )

    if (lojaA?.patrocinado && !lojaB?.patrocinado) return -1
    if (!lojaA?.patrocinado && lojaB?.patrocinado) return 1

    if (lojaA?.premium && !lojaB?.premium) return -1
    if (!lojaA?.premium && lojaB?.premium) return 1

    return 0
  })
  .slice(0, 6)
const produtosHome = produtos
  .filter((produto) => {
    if (produto.ativo === false) return false;

    const lojaDoProduto = lojas.find(
      (loja) => Number(loja.id) === Number(produto.loja_id)
    );

    if (!lojaDoProduto) return false;
    if (lojaDoProduto.ativo === false) return false;
    if (lojaDoProduto.status !== "aprovada") return false;

    return true;
  })
  .sort((a, b) => {
    const lojaA = lojas.find(
      (loja) => Number(loja.id) === Number(a.loja_id)
    );

    const lojaB = lojas.find(
      (loja) => Number(loja.id) === Number(b.loja_id)
    );

    if (lojaA?.patrocinado && !lojaB?.patrocinado) return -1;
    if (!lojaA?.patrocinado && lojaB?.patrocinado) return 1;

    if (lojaA?.premium && !lojaB?.premium) return -1;
    if (!lojaA?.premium && lojaB?.premium) return 1;

    return Number(b.id) - Number(a.id);
  })
  .slice(0, 12);
  const produtosFiltrados = produtos.filter((produto) => {
    const buscaNormalizada = normalizar(busca);

    if (!buscaNormalizada) return false;

    const lojaDoProduto = lojas.find(
      (loja) => Number(loja.id) === Number(produto.loja_id)
    );

    if (!lojaDoProduto || lojaDoProduto.ativo === false) return false;

    return (
      normalizar(produto.nome || "").includes(buscaNormalizada) ||
      normalizar(produto.descricao || "").includes(buscaNormalizada) ||
      normalizar(lojaDoProduto?.nome || "").includes(buscaNormalizada) ||
      normalizar(lojaDoProduto?.categoria || "").includes(buscaNormalizada) ||
      normalizar(lojaDoProduto?.cidade || "").includes(buscaNormalizada)
    );
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 px-6 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between py-5">
          <div
            onClick={() => (window.location.href = "/")}
            className="cursor-pointer"
          >
            <h1 className="text-3xl font-black tracking-tight">
              <span className="text-white">Vem</span>
              <span className="text-green-400">Ver</span>
            </h1>

            <p className="text-xs text-zinc-500">
              Descubra o que existe perto de você
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                document
                  .getElementById("busca")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="hidden rounded-2xl border border-white/10 px-5 py-3 font-bold transition hover:border-green-400/40 md:block"
            >
              Buscar
            </button>

            <button
              onClick={() => (window.location.href = "/login")}
              className="rounded-2xl bg-green-400 px-5 py-3 font-bold text-black"
            >
              Área lojista
            </button>
          </div>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-6 py-24 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#22c55e33,transparent_45%)]" />

        <span className="mb-6 inline-block rounded-full border border-green-400/30 bg-green-400/10 px-5 py-2 text-sm font-bold text-green-300">
          🚀 O guia inteligente da sua cidade
        </span>

        <h1 className="text-5xl font-black leading-tight md:text-7xl">
          Descubra lojas incríveis <br />
          <span className="bg-gradient-to-r from-green-300 to-emerald-500 bg-clip-text text-transparent">
            perto de você
          </span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-lg text-zinc-300">
          Encontre lojas, promoções, produtos e oportunidades locais com uma
          experiência moderna, rápida e feita para celular.
        </p>

        <div className="mt-6 inline-block rounded-2xl border border-green-400/20 bg-green-400/10 px-5 py-4 text-green-300">
          📍 {localizacaoStatus}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => alert("App em breve disponível!")}
            className="rounded-2xl bg-green-400 px-8 py-4 font-bold text-black"
          >
            Baixar App
          </button>

          <button
            onClick={() => (window.location.href = "/login")}
            className="rounded-2xl border border-white/20 px-8 py-4 font-bold"
          >
            Quero vender mais
          </button>
        </div>
      </section>

      <section
        id="busca"
        className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/10 p-6"
      >
        <h2 className="mb-5 text-2xl font-bold">
          O que você procura hoje?
        </h2>

        <div className="flex flex-col gap-4 md:flex-row">
          <input
            className="flex-1 rounded-2xl border border-white/10 bg-black px-6 py-4 outline-none"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar iPhone, coxinha, açaí, assistência..."
          />

          <button className="rounded-2xl bg-green-400 px-8 py-4 font-bold text-black">
            Buscar
          </button>

          <button
            onClick={() => setBusca("")}
            className="rounded-2xl border border-white/20 px-8 py-4 font-bold text-white"
          >
            Limpar
          </button>
        </div>
      </section>
      {!busca && lojasPatrocinadas.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pt-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-blue-500/15 px-4 py-2 text-sm font-black text-blue-300">
                PUBLICIDADE
              </span>

              <h2 className="mt-4 text-4xl font-black text-blue-400">
                🚀 Em destaque
              </h2>

              <p className="mt-2 text-zinc-400">
                Empresas patrocinadas que estão em evidência no VemVer.
              </p>
            </div>

            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
              {lojasPatrocinadas.length} patrocinada(s)
            </span>
          </div>

          <div className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-6">
            {lojasPatrocinadas.map((loja) => (
              <article
                key={`carrossel-patrocinada-${loja.id}`}
                onClick={() =>
                  (window.location.href = criarSlugLoja(loja))
                }
                className="min-w-[85%] cursor-pointer snap-start overflow-hidden rounded-[2rem] border-2 border-blue-500 bg-gradient-to-br from-blue-500/15 to-zinc-950 p-5 shadow-xl shadow-blue-500/20 transition hover:-translate-y-1 sm:min-w-[420px]"
              >
                {loja.imagem_url ? (
                  <img
                    src={loja.imagem_url}
                    alt={loja.nome}
                    className="h-60 w-full rounded-3xl object-cover"
                  />
                ) : (
                  <div className="flex h-60 w-full items-center justify-center rounded-3xl bg-zinc-900 text-zinc-500">
                    Loja sem imagem
                  </div>
                )}

                <span className="mt-5 inline-block rounded-full bg-blue-500 px-4 py-2 text-sm font-black text-white">
                  🚀 PATROCINADO
                </span>

                <h3 className="mt-4 text-3xl font-black">
                  {loja.nome}
                </h3>

                <p className="mt-2 text-zinc-400">
                  {loja.categoria}
                </p>

                <p className="mt-1 text-zinc-500">
                  📍 {loja.cidade}
                </p>

                {loja.descricao && (
                  <p className="mt-4 line-clamp-2 text-zinc-300">
                    {loja.descricao}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = criarSlugLoja(loja);
                    }}
                    className="rounded-2xl bg-blue-500 px-6 py-4 font-black text-white"
                  >
                    Ver loja
                  </button>

                  {loja.whatsapp && (
                    <a
                      href={`https://wa.me/55${loja.whatsapp}`}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-2xl border border-white/20 px-6 py-4 font-bold"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {!busca && lojasPremium.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pt-14">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl font-black text-yellow-400">
                ⭐ Lojas Premium
              </h2>

              <p className="mt-2 text-zinc-400">
                Empresas bem posicionadas no ranking inteligente do VemVer.
              </p>
            </div>

            <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-bold text-yellow-300">
              {lojasPremium.length} premium
            </span>
          </div>

          <div className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-6">
            {lojasPremium.map((loja) => (
              <article
                key={`carrossel-premium-${loja.id}`}
                onClick={() =>
                  (window.location.href = criarSlugLoja(loja))
                }
                className="min-w-[82%] cursor-pointer snap-start overflow-hidden rounded-[2rem] border-2 border-yellow-400 bg-gradient-to-br from-yellow-400/10 to-zinc-950 p-5 shadow-xl shadow-yellow-500/15 transition hover:-translate-y-1 sm:min-w-[380px]"
              >
                {loja.imagem_url ? (
                  <img
                    src={loja.imagem_url}
                    alt={loja.nome}
                    className="h-52 w-full rounded-3xl object-cover"
                  />
                ) : (
                  <div className="flex h-52 w-full items-center justify-center rounded-3xl bg-zinc-900 text-zinc-500">
                    Loja sem imagem
                  </div>
                )}

                <span className="mt-5 inline-block rounded-full bg-yellow-400 px-4 py-2 text-sm font-black text-black">
                  ⭐ PREMIUM
                </span>

                <h3 className="mt-4 text-2xl font-black">
                  {loja.nome}
                </h3>

                <p className="mt-2 text-zinc-400">
                  {loja.categoria}
                </p>

                <p className="mt-1 text-zinc-500">
                  📍 {loja.cidade}
                </p>

                {loja.descricao && (
                  <p className="mt-4 line-clamp-2 text-zinc-300">
                    {loja.descricao}
                  </p>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = criarSlugLoja(loja);
                  }}
                  className="mt-5 w-full rounded-2xl bg-yellow-400 px-5 py-4 font-black text-black"
                >
                  Conhecer a loja
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
      {busca && produtosFiltrados.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pt-14">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">
                Produtos e serviços encontrados
              </h2>

              <p className="mt-2 text-zinc-400">
                Itens encontrados nas lojas cadastradas no VemVer.
              </p>
            </div>

            <span className="rounded-full bg-green-400/15 px-4 py-2 text-sm text-green-300">
              {produtosFiltrados.length} itens
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {produtosFiltrados.map((produto) => {
              const lojaDoProduto = lojas.find(
                (loja) => Number(loja.id) === Number(produto.loja_id)
              );

              if (!lojaDoProduto || lojaDoProduto.ativo === false) return null;

              return (
                <div
                  key={produto.id}
                  className="rounded-3xl border border-green-400/20 bg-zinc-900 p-6 transition hover:scale-[1.02] hover:border-green-400/50"
                >
                  {produto.imagem_url && (
                    <img
                      src={produto.imagem_url}
                      alt={produto.nome}
                      className="h-52 w-full rounded-2xl object-cover"
                    />
                  )}

                  <h3 className="mt-5 text-2xl font-black">
                    {produto.nome}
                  </h3>

                  {produto.promocao &&
produto.preco_promocional &&
Number(produto.preco_promocional) > 0 ? (
  <>
    <span className="inline-block rounded-full bg-red-500 px-2 py-1 text-xs font-black text-white">
      🔥 PROMOÇÃO
    </span>

    <p className="mt-2 text-sm text-zinc-500 line-through">
      R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
    </p>

    <p className="text-2xl font-black text-green-300">
      R$ {Number(produto.preco_promocional)
        .toFixed(2)
        .replace(".", ",")}
    </p>

    <p className="text-sm font-bold text-green-400">
      Economize R$
      {" "}
      {(
        Number(produto.preco) -
        Number(produto.preco_promocional)
      )
        .toFixed(2)
        .replace(".", ",")}
    </p>
  </>
) : (
  produto.preco && (
    <p className="mt-2 text-2xl font-black text-green-300">
      R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
    </p>
  )
)}

                  {produto.descricao && (
                    <p className="mt-2 text-zinc-400">
                      {produto.descricao}
                    </p>
                  )}

                  <p className="mt-4 text-sm text-zinc-500">
                    Vendido por:
                  </p>

                  <p className="text-lg font-black">
                    {lojaDoProduto.nome}
                  </p>

                  <p className="mt-1 text-zinc-500">
                    📍 {lojaDoProduto.cidade}
                  </p>

                  <div className="mt-5 flex flex-col gap-3">
                    <button
                      onClick={() =>
                        (window.location.href = criarSlugLoja(lojaDoProduto))
                      }
                      className="rounded-2xl border border-white/10 px-5 py-4 font-bold"
                    >
                      Ver loja
                    </button>

                    {lojaDoProduto.whatsapp && (
                      <a
                        href={`https://wa.me/55${lojaDoProduto.whatsapp}?text=${encodeURIComponent(
                          `Olá! Vi no VemVer e tenho interesse em: ${produto.nome}`
                        )}`}
                        target="_blank"
                        className="rounded-2xl bg-green-400 px-5 py-4 text-center font-black text-black"
                      >
                        Tenho interesse
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
      {produtosHome.length > 0 && !busca && (
  <section className="mx-auto max-w-7xl px-6 py-16">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-4xl font-black">
          Produtos e serviços para você
        </h2>

        <p className="mt-2 text-zinc-400">
          Descubra novidades oferecidas pelas lojas da sua cidade.
        </p>
      </div>

      <span className="rounded-full bg-green-400/15 px-4 py-2 text-sm font-bold text-green-300">
        {produtosHome.length} opções
      </span>
    </div>

    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {produtosHome.map((produto) => {
        const lojaDoProduto = lojas.find(
          (loja) => Number(loja.id) === Number(produto.loja_id)
        );

        if (!lojaDoProduto) return null;

        return (
          <div
            key={`home-produto-${produto.id}`}
            className={`overflow-hidden rounded-3xl border bg-zinc-900 transition hover:-translate-y-1 ${
              lojaDoProduto.patrocinado
                ? "border-blue-500 shadow-lg shadow-blue-500/20"
                : lojaDoProduto.premium
                ? "border-yellow-400/70 shadow-lg shadow-yellow-500/10"
                : "border-white/10 hover:border-green-400/40"
            }`}
          >
            {produto.imagem_url ? (
              <img
                src={produto.imagem_url}
                alt={produto.nome}
                className="h-52 w-full object-cover"
              />
            ) : (
              <div className="flex h-52 items-center justify-center bg-zinc-800 text-zinc-500">
                Sem imagem
              </div>
            )}

            <div className="p-5">
              <div className="flex flex-wrap gap-2">
                {lojaDoProduto.patrocinado && (
                  <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-black text-white">
                    🚀 PATROCINADO
                  </span>
                )}

                {!lojaDoProduto.patrocinado &&
                  lojaDoProduto.premium && (
                    <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                      ⭐ PREMIUM
                    </span>
                  )}
              </div>

              <h3 className="mt-4 line-clamp-2 text-xl font-black">
                {produto.nome}
              </h3>

              {produto.promocao &&
produto.preco_promocional &&
Number(produto.preco_promocional) > 0 ? (
  <>
    <span className="inline-block rounded-full bg-red-500 px-2 py-1 text-xs font-black text-white">
      🔥 PROMOÇÃO
    </span>

    <p className="mt-2 text-sm text-zinc-500 line-through">
      R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
    </p>

    <p className="text-2xl font-black text-green-300">
      R$ {Number(produto.preco_promocional)
        .toFixed(2)
        .replace(".", ",")}
    </p>

    <p className="text-sm font-bold text-green-400">
      Economize R$
      {" "}
      {(
        Number(produto.preco) -
        Number(produto.preco_promocional)
      )
        .toFixed(2)
        .replace(".", ",")}
    </p>
  </>
) : (
  produto.preco && (
    <p className="mt-2 text-2xl font-black text-green-300">
      R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
    </p>
  )
)}

              {produto.descricao && (
                <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                  {produto.descricao}
                </p>
              )}

              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-sm text-zinc-500">
                  Vendido por
                </p>

                <p className="font-black">
                  {lojaDoProduto.nome}
                </p>

                <p className="text-sm text-zinc-500">
                  📍 {lojaDoProduto.cidade}
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                <button
  type="button"
  onClick={() =>
    (window.location.href = criarSlugProduto(produto))
  }
  className="rounded-2xl bg-green-400 px-5 py-4 font-black text-black"
>
  Ver produto
</button>

<button
  type="button"
  onClick={() =>
    (window.location.href = criarSlugLoja(lojaDoProduto))
  }
  className="rounded-2xl border border-white/10 px-5 py-4 font-bold"
>
  Ver loja
</button>

                {lojaDoProduto.whatsapp && (
                  <a
                    href={`https://wa.me/55${
                      lojaDoProduto.whatsapp
                    }?text=${encodeURIComponent(
                      `Olá! Vi no VemVer e tenho interesse em: ${produto.nome}`
                    )}`}
                    target="_blank"
                    className="rounded-2xl bg-green-400 px-4 py-3 text-center font-black text-black"
                  >
                    Tenho interesse
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </section>
)}
{produtosDestaque.length > 0 && (
  <section className="mx-auto max-w-7xl px-6 pb-16">
    <div className="mb-8">
      <h2 className="text-4xl font-black text-yellow-400">
        ⭐ Produtos em Destaque
      </h2>

      <p className="mt-2 text-zinc-400">
        Produtos patrocinados e em evidência no VemVer.
      </p>
    </div>

    <div className="grid gap-6 md:grid-cols-3">
      {produtosDestaque.map((produto) => {
        const loja = lojas.find(
          (l) => Number(l.id) === Number(produto.loja_id)
        )

        if (!loja) return null

        return (
          <div
            key={produto.id}
className={`rounded-3xl border-2 ${
  loja?.patrocinado
    ? "border-blue-500 shadow-lg shadow-blue-500/30"
    : "border-yellow-400 shadow-lg shadow-yellow-400/30"
} bg-gradient-to-br from-zinc-900 to-zinc-950 p-4`}
>
            {produto.imagem_url && (
              <img
                src={produto.imagem_url}
                alt={produto.nome}
                className="h-52 w-full rounded-2xl object-cover"
              />
            )}

            {loja?.patrocinado ? (
  <span className="mt-4 inline-block rounded-full bg-blue-500 px-3 py-1 text-sm font-black text-white">
    🚀 PATROCINADO
  </span>
) : (
  <span className="mt-4 inline-block rounded-full bg-yellow-400 px-3 py-1 text-sm font-black text-black">
    ⭐ DESTAQUE
  </span>
)}

            <h3 className="mt-4 text-2xl font-black">
              {produto.nome}
            </h3>

            {produto.promocao &&
produto.preco_promocional &&
Number(produto.preco_promocional) > 0 ? (
  <>
    <span className="inline-block rounded-full bg-red-500 px-2 py-1 text-xs font-black text-white">
      🔥 PROMOÇÃO
    </span>

    <p className="mt-2 text-sm text-zinc-500 line-through">
      R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
    </p>

    <p className="text-2xl font-black text-green-300">
      R$ {Number(produto.preco_promocional)
        .toFixed(2)
        .replace(".", ",")}
    </p>

    <p className="text-sm font-bold text-green-400">
      Economize R$
      {" "}
      {(
        Number(produto.preco) -
        Number(produto.preco_promocional)
      )
        .toFixed(2)
        .replace(".", ",")}
    </p>
  </>
) : (
  produto.preco && (
    <p className="mt-2 text-2xl font-black text-green-300">
      R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
    </p>
  )
)}

            {produto.descricao && (
              <p className="mt-3 text-zinc-400">
                {produto.descricao}
              </p>
            )}

            <p className="mt-4 text-sm text-zinc-500">
              Vendido por:
            </p>

            <p className="font-black">
              {loja.nome}
            </p>

<button
  onClick={() =>
    (window.location.href = criarSlugProduto(produto))
  }
  className={`mt-5 w-full rounded-2xl py-4 font-black ${
    loja?.patrocinado
      ? "bg-blue-500 text-white"
      : "bg-yellow-400 text-black"
  }`}
>
  Ver produto
</button>
          </div>
        )
      })}
    </div>
  </section>
)}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-8 text-3xl font-black">
          Categorias populares
        </h2>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {categorias.map((item) => (
            <button
              key={item}
              onClick={() => setBusca(item)}
              className="rounded-3xl border border-white/10 bg-zinc-900 p-7 text-center transition hover:scale-[1.02] hover:border-green-400/40"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

   

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
          <h2 className="text-3xl font-black">
  Outras lojas próximas de você
</h2>

           <p className="mt-2 text-zinc-400">
  Conheça outros negócios da sua cidade, ordenados pelo ranking e pela distância.
</p>
          </div>

          <span className="rounded-full bg-green-400/15 px-4 py-2 text-sm text-green-300">
            {lojasComuns.length} lojas encontradas
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
         {lojasComuns.map((loja) => {
            const distancia =
              latitude &&
              longitude &&
              loja.latitude &&
              loja.longitude
                ? calcularDistancia(
                    latitude,
                    longitude,
                    Number(loja.latitude),
                    Number(loja.longitude)
                  )
                : null;

            return (
              <div
                key={loja.id || loja.nome}
                onClick={() => (window.location.href = criarSlugLoja(loja))}
              className="cursor-pointer rounded-3xl border border-white/10 bg-zinc-900 p-7 transition hover:scale-[1.02] hover:border-green-400/40 hover:shadow-2xl hover:shadow-green-500/10"
              >
                {loja.imagem_url && (
                  <img
                    src={loja.imagem_url}
                    alt={loja.nome}
                    className="h-52 w-full rounded-2xl object-cover"
                  />
                )}

                <h3 className="mt-6 text-2xl font-black">
                  {loja.nome}
                </h3>

                <p className="mt-2 text-zinc-400">
                  Categoria: {loja.categoria}
                </p>

                <p className="mt-1 text-zinc-500">
                  📍 {loja.cidade}
                </p>

                {distancia !== null && (
                  <p className="mt-1 text-sm font-bold text-green-300">
                    🚀 {distancia.toFixed(1)} km de você
                  </p>
                )}

                {loja.descricao && (
                  <p className="mt-2 text-zinc-400">
                    {loja.descricao}
                  </p>
                )}

                {loja.endereco && (
                  <p className="mt-1 text-zinc-500">
                    📌 {loja.endereco}
                  </p>
                )}

                {loja.whatsapp && (
                  <a
                    href={`https://wa.me/55${loja.whatsapp}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-6 block w-full rounded-2xl bg-green-400 px-6 py-4 text-center font-bold text-black"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2rem] border border-green-400/30 bg-green-400/10 p-8 md:p-12">
          <h2 className="text-4xl font-black">
            Plano lojista premium
          </h2>

          <p className="mt-4 max-w-2xl text-zinc-300">
            Entre grátis, teste o VemVer e depois destaque sua loja para
            aparecer mais, vender mais e sair na frente da concorrência.
          </p>
        </div>
      </section>
    </main>
  );
}