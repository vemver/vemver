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
  if (a.patrocinado && !b.patrocinado) return -1
  if (!a.patrocinado && b.patrocinado) return 1

  if (a.premium && !b.premium) return -1
  if (!a.premium && b.premium) return 1

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
    (loja) => loja.premium === true
  );
  const lojasPatrocinadas = lojasFiltradas.filter(
  (loja) => loja.patrocinado === true
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

                  {produto.preco && (
                    <p className="mt-2 text-2xl font-black text-green-300">
                      R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
                    </p>
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

            <p className="mt-4 text-sm text-zinc-500">
              Vendido por:
            </p>

            <p className="font-black">
              {loja.nome}
            </p>

            <button
              onClick={() =>
                (window.location.href = `/loja/${loja.id}-${loja.nome
                  .toLowerCase()
                  .replaceAll(" ", "-")}`)
              }
             className={`mt-5 w-full rounded-2xl py-4 font-black ${
  loja?.patrocinado
    ? "bg-blue-500 text-white"
    : "bg-yellow-400 text-black"
}`}
            >
              Ver loja
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
{lojasPatrocinadas.length > 0 && (
  <section className="mx-auto max-w-7xl px-6 pb-16">
    <div className="mb-8">
      <h2 className="text-4xl font-black text-blue-400">
        🚀 Lojas Patrocinadas
      </h2>

      <p className="mt-2 text-zinc-400">
        Empresas que contrataram destaque máximo no VemVer.
      </p>
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      {lojasPatrocinadas.map((loja) => (
        <div
          key={`patrocinada-${loja.id}`}
          onClick={() => (window.location.href = criarSlugLoja(loja))}
          className="cursor-pointer rounded-3xl border-2 border-blue-500 bg-gradient-to-br from-blue-500/10 to-zinc-900 p-8 transition hover:scale-[1.02]"
        >
          {loja.imagem_url && (
            <img
              src={loja.imagem_url}
              alt={loja.nome}
              className="h-60 w-full rounded-2xl object-cover"
            />
          )}

          <span className="mt-6 inline-block rounded-full bg-blue-500 px-3 py-1 text-sm font-black text-white">
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
        </div>
      ))}
    </div>
  </section>
)}
      {lojasPremium.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="mb-8">
            <h2 className="text-4xl font-black text-yellow-400">
              ⭐ Lojas em Destaque
            </h2>

            <p className="mt-2 text-zinc-400">
              Empresas que escolheram aparecer com mais destaque no VemVer.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {lojasPremium.map((loja) => (
              <div
                key={`premium-${loja.id}`}
                onClick={() => (window.location.href = criarSlugLoja(loja))}
                className="cursor-pointer rounded-3xl border-2 border-yellow-400 bg-gradient-to-br from-yellow-500/10 to-zinc-900 p-8 shadow-2xl shadow-yellow-500/20 transition hover:scale-[1.02]"
              >
                {loja.imagem_url && (
                  <img
                    src={loja.imagem_url}
                    alt={loja.nome}
                    className="h-60 w-full rounded-2xl object-cover"
                  />
                )}

                <div className="mt-6 flex items-center gap-3">
                  <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-black text-black">
                    ⭐ PREMIUM
                  </span>
                </div>

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
                  <p className="mt-4 text-zinc-300">
                    {loja.descricao}
                  </p>
                )}

                {loja.whatsapp && (
                  <a
                    href={`https://wa.me/55${loja.whatsapp}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-6 block rounded-2xl bg-yellow-400 px-5 py-4 text-center font-black text-black"
                  >
                    Chamar agora
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black">
              Lojas próximas de você
            </h2>

            <p className="mt-2 text-zinc-400">
              As lojas com localização cadastrada aparecem primeiro por
              distância.
            </p>
          </div>

          <span className="rounded-full bg-green-400/15 px-4 py-2 text-sm text-green-300">
            {lojasFiltradas.length} lojas encontradas
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {lojasFiltradas.map((loja) => {
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
                className={`cursor-pointer rounded-3xl p-7 transition hover:scale-[1.02] ${
                  loja.premium
                    ? "border-2 border-yellow-400 bg-gradient-to-br from-yellow-500/10 to-zinc-900 shadow-2xl shadow-yellow-500/20"
                    : "border border-white/10 bg-zinc-900 hover:border-green-400/40 hover:shadow-2xl hover:shadow-green-500/10"
                }`}
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
{loja.patrocinado && (
  <span className="mt-3 inline-block rounded-full bg-blue-500 px-3 py-1 text-sm font-bold text-white">
    🚀 PATROCINADO
  </span>
)}
                {loja.premium && (
                  <span className="mt-3 inline-block rounded-full bg-yellow-400 px-3 py-1 text-sm font-bold text-black">
                    ⭐ PREMIUM
                  </span>
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