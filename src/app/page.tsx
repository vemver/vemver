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

type ModoLocalizacao = "automatica" | "manual";

type MunicipioIBGE = {
  id: number;
  nome: string;
};

type LocalizacaoManualSalva = {
  modo: "manual";
  cidade: string;
  uf: string;
};

const CHAVE_LOCALIZACAO = "vemver_localizacao_preferida";

const estadosBrasileiros = [
  { uf: "AC", nome: "Acre" },
  { uf: "AL", nome: "Alagoas" },
  { uf: "AP", nome: "Amapá" },
  { uf: "AM", nome: "Amazonas" },
  { uf: "BA", nome: "Bahia" },
  { uf: "CE", nome: "Ceará" },
  { uf: "DF", nome: "Distrito Federal" },
  { uf: "ES", nome: "Espírito Santo" },
  { uf: "GO", nome: "Goiás" },
  { uf: "MA", nome: "Maranhão" },
  { uf: "MT", nome: "Mato Grosso" },
  { uf: "MS", nome: "Mato Grosso do Sul" },
  { uf: "MG", nome: "Minas Gerais" },
  { uf: "PA", nome: "Pará" },
  { uf: "PB", nome: "Paraíba" },
  { uf: "PR", nome: "Paraná" },
  { uf: "PE", nome: "Pernambuco" },
  { uf: "PI", nome: "Piauí" },
  { uf: "RJ", nome: "Rio de Janeiro" },
  { uf: "RN", nome: "Rio Grande do Norte" },
  { uf: "RS", nome: "Rio Grande do Sul" },
  { uf: "RO", nome: "Rondônia" },
  { uf: "RR", nome: "Roraima" },
  { uf: "SC", nome: "Santa Catarina" },
  { uf: "SP", nome: "São Paulo" },
  { uf: "SE", nome: "Sergipe" },
  { uf: "TO", nome: "Tocantins" },
];

export default function Home() {
  const [lojas, setLojas] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [localizacaoStatus, setLocalizacaoStatus] = useState(
    "Localização ainda não ativada",
  );
  const [modoLocalizacao, setModoLocalizacao] =
    useState<ModoLocalizacao>("automatica");
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  const [ufSelecionada, setUfSelecionada] = useState("");
  const [seletorLocalizacaoAberto, setSeletorLocalizacaoAberto] =
    useState(false);
  const [ufTemporaria, setUfTemporaria] = useState("");
  const [cidadeTemporaria, setCidadeTemporaria] = useState("");
  const [municipios, setMunicipios] = useState<MunicipioIBGE[]>([]);
  const [carregandoMunicipios, setCarregandoMunicipios] = useState(false);
  const [carregandoLocalizacao, setCarregandoLocalizacao] = useState(false);
  const [erroLocalizacao, setErroLocalizacao] = useState("");

  useEffect(() => {
    carregarDados();

    const localizacaoSalva = localStorage.getItem(CHAVE_LOCALIZACAO);

    if (localizacaoSalva) {
      try {
        const preferencia = JSON.parse(
          localizacaoSalva,
        ) as LocalizacaoManualSalva;

        if (
          preferencia.modo === "manual" &&
          preferencia.cidade &&
          preferencia.uf
        ) {
          setModoLocalizacao("manual");
          setCidadeSelecionada(preferencia.cidade);
          setUfSelecionada(preferencia.uf);
          setUfTemporaria(preferencia.uf);
          setCidadeTemporaria(preferencia.cidade);
          setLocalizacaoStatus(`${preferencia.cidade} - ${preferencia.uf}`);
          return;
        }
      } catch {
        localStorage.removeItem(CHAVE_LOCALIZACAO);
      }
    }

    pegarLocalizacao();
  }, []);

  useEffect(() => {
    if (!ufTemporaria) {
      setMunicipios([]);
      return;
    }

    carregarMunicipios(ufTemporaria);
  }, [ufTemporaria]);

  function pegarLocalizacao() {
    if (!navigator.geolocation) {
      setLocalizacaoStatus("Seu navegador não permite localização");
      setErroLocalizacao(
        "Não foi possível usar o GPS. Escolha uma cidade manualmente.",
      );
      return;
    }

    setModoLocalizacao("automatica");
    setCarregandoLocalizacao(true);
    setErroLocalizacao("");
    setLocalizacaoStatus("Solicitando localização...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitudeAtual = position.coords.latitude;
        const longitudeAtual = position.coords.longitude;

        setLatitude(latitudeAtual);
        setLongitude(longitudeAtual);

        try {
          const resposta = await fetch(
            "https://api.bigdatacloud.net/data/reverse-geocode-client" +
              `?latitude=${latitudeAtual}` +
              `&longitude=${longitudeAtual}` +
              "&localityLanguage=pt",
          );

          if (!resposta.ok) {
            throw new Error("Não foi possível identificar a cidade.");
          }

          const local = await resposta.json();
          const cidade = String(local.city || local.locality || "").trim();
          const codigoEstado = String(local.principalSubdivisionCode || "");
          const uf = codigoEstado.includes("-")
            ? codigoEstado.split("-").pop() || ""
            : codigoEstado;

          if (!cidade) {
            throw new Error("Cidade não identificada.");
          }

          setCidadeSelecionada(cidade);
          setUfSelecionada(uf.toUpperCase());
          setUfTemporaria(uf.toUpperCase());
          setCidadeTemporaria(cidade);
          setLocalizacaoStatus(uf ? `${cidade} - ${uf.toUpperCase()}` : cidade);
          localStorage.removeItem(CHAVE_LOCALIZACAO);
        } catch (error) {
          console.error("Erro ao identificar a cidade:", error);
          setLocalizacaoStatus("Localização ativa");
          setErroLocalizacao(
            "O GPS foi ativado, mas a cidade não pôde ser identificada. Você ainda pode escolher uma cidade.",
          );
        } finally {
          setCarregandoLocalizacao(false);
          setSeletorLocalizacaoAberto(false);
        }
      },
      () => {
        setCarregandoLocalizacao(false);
        setLocalizacaoStatus("Escolha sua cidade");
        setErroLocalizacao(
          "A localização não foi autorizada. Escolha uma cidade manualmente.",
        );
        setSeletorLocalizacaoAberto(true);
      },
      {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 300000,
      },
    );
  }

  async function carregarMunicipios(uf: string) {
    setCarregandoMunicipios(true);
    setErroLocalizacao("");

    try {
      const resposta = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`,
      );

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar as cidades.");
      }

      const dados = (await resposta.json()) as MunicipioIBGE[];
      setMunicipios(dados);
    } catch (error) {
      console.error("Erro ao carregar municípios:", error);
      setMunicipios([]);
      setErroLocalizacao(
        "Não foi possível carregar as cidades. Tente novamente.",
      );
    } finally {
      setCarregandoMunicipios(false);
    }
  }

  function abrirSeletorLocalizacao() {
    setUfTemporaria(ufSelecionada);
    setCidadeTemporaria(cidadeSelecionada);
    setErroLocalizacao("");
    setSeletorLocalizacaoAberto(true);
  }

  function salvarLocalizacaoManual() {
    if (!ufTemporaria || !cidadeTemporaria) {
      setErroLocalizacao("Selecione o estado e a cidade.");
      return;
    }

    const preferencia: LocalizacaoManualSalva = {
      modo: "manual",
      cidade: cidadeTemporaria,
      uf: ufTemporaria,
    };

    setModoLocalizacao("manual");
    setCidadeSelecionada(cidadeTemporaria);
    setUfSelecionada(ufTemporaria);
    setLatitude(null);
    setLongitude(null);
    setLocalizacaoStatus(`${cidadeTemporaria} - ${ufTemporaria}`);
    localStorage.setItem(CHAVE_LOCALIZACAO, JSON.stringify(preferencia));
    setSeletorLocalizacaoAberto(false);
    setErroLocalizacao("");
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
    return `/loja/${loja.id}-${loja.nome.toLowerCase().replaceAll(" ", "-")}`;
  }
  function criarSlugProduto(produto: any) {
    const nome = String(produto.nome || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return `/produto/${produto.id}-${nome}`;
  }
  function calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
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

  function lojaPertenceARegiao(loja: any) {
    if (!cidadeSelecionada) return true;

    const mesmaCidade =
      normalizar(String(loja.cidade || "").trim()) ===
      normalizar(cidadeSelecionada.trim());

    if (!mesmaCidade) return false;

    const ufDaLoja = String(loja.uf || loja.estado_sigla || "")
      .trim()
      .toUpperCase();

    /*
      Compatibilidade com as lojas antigas: enquanto a coluna "uf"
      ainda não estiver preenchida, a cidade continua sendo suficiente.
    */
    if (!ufSelecionada || !ufDaLoja) return true;

    return ufDaLoja === ufSelecionada.toUpperCase();
  }

  const lojasDaRegiao = lojas.filter(lojaPertenceARegiao);

  const lojasFiltradas = lojasDaRegiao
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
      const scoreA = Number(a.score || 0);
      const scoreB = Number(b.score || 0);

      if (scoreA !== scoreB) {
        return scoreB - scoreA;
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
            Number(a.longitude),
          ) -
          calcularDistancia(
            latitude,
            longitude,
            Number(b.latitude),
            Number(b.longitude),
          )
        );
      }

      return 0;
    });

  const lojasPremium = lojasFiltradas.filter(
    (loja) => loja.premium === true && loja.patrocinado !== true,
  );
  const lojasPatrocinadas = lojasFiltradas.filter(
    (loja) => loja.patrocinado === true,
  );
  const lojasComuns = lojasFiltradas.filter(
    (loja) => loja.patrocinado !== true && loja.premium !== true,
  );
  const produtosDestaque = produtos
    .filter((produto) => {
      if (produto.ativo !== true || produto.destaque !== true) return false;

      const lojaDoProduto = lojasDaRegiao.find(
        (loja) => Number(loja.id) === Number(produto.loja_id),
      );

      return Boolean(
        lojaDoProduto &&
          lojaDoProduto.ativo !== false &&
          lojaDoProduto.status === "aprovada",
      );
    })
    .sort((a, b) => {
      const lojaA = lojasDaRegiao.find(
        (l) => Number(l.id) === Number(a.loja_id),
      );

      const lojaB = lojasDaRegiao.find(
        (l) => Number(l.id) === Number(b.loja_id),
      );

      if (lojaA?.patrocinado && !lojaB?.patrocinado) return -1;
      if (!lojaA?.patrocinado && lojaB?.patrocinado) return 1;

      if (lojaA?.premium && !lojaB?.premium) return -1;
      if (!lojaA?.premium && lojaB?.premium) return 1;

      return 0;
    })
    .slice(0, 6);
  const produtosHome = produtos
    .filter((produto) => {
      if (produto.ativo === false) return false;

      const lojaDoProduto = lojasDaRegiao.find(
        (loja) => Number(loja.id) === Number(produto.loja_id),
      );

      if (!lojaDoProduto) return false;
      if (lojaDoProduto.ativo === false) return false;
      if (lojaDoProduto.status !== "aprovada") return false;

      return true;
    })
    .sort((a, b) => {
      const lojaA = lojasDaRegiao.find(
        (loja) => Number(loja.id) === Number(a.loja_id),
      );

      const lojaB = lojasDaRegiao.find(
        (loja) => Number(loja.id) === Number(b.loja_id),
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

    const lojaDoProduto = lojasDaRegiao.find(
      (loja) => Number(loja.id) === Number(produto.loja_id),
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
              type="button"
              onClick={abrirSeletorLocalizacao}
              className="max-w-[170px] rounded-2xl border border-green-400/25 bg-green-400/10 px-4 py-3 text-left transition hover:border-green-400/60"
              title="Alterar localização"
            >
              <span className="block truncate text-xs font-black text-green-300">
                📍 {cidadeSelecionada || "Escolher cidade"}
              </span>

              <span className="hidden text-[10px] text-zinc-400 sm:block">
                {modoLocalizacao === "manual"
                  ? "Local escolhido"
                  : "Localização automática"}
              </span>
            </button>

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

        <button
          type="button"
          onClick={abrirSeletorLocalizacao}
          className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-green-400/20 bg-green-400/10 px-5 py-4 text-green-300 transition hover:border-green-400/60 hover:bg-green-400/15"
        >
          <span>📍</span>

          <span className="text-left">
            <strong className="block">{localizacaoStatus}</strong>
            <small className="text-green-200/70">
              Toque para usar outro local
            </small>
          </span>

          <span aria-hidden="true">⌄</span>
        </button>

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
        <h2 className="mb-5 text-2xl font-bold">O que você procura hoje?</h2>

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

      {cidadeSelecionada && lojasFiltradas.length === 0 && !busca && (
        <section className="mx-auto mt-10 max-w-4xl px-6">
          <div className="rounded-[2rem] border border-green-400/20 bg-green-400/5 p-8 text-center">
            <span className="text-4xl">📍</span>

            <h2 className="mt-4 text-2xl font-black">
              O VemVer ainda está chegando em {cidadeSelecionada}
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
              Ainda não encontramos lojas aprovadas nessa cidade. Você pode
              escolher outra região agora ou voltar mais tarde para conferir as
              novidades.
            </p>

            <button
              type="button"
              onClick={abrirSeletorLocalizacao}
              className="mt-6 rounded-2xl bg-green-400 px-6 py-4 font-black text-black"
            >
              Escolher outra cidade
            </button>
          </div>
        </section>
      )}

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
                onClick={() => (window.location.href = criarSlugLoja(loja))}
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

                <h3 className="mt-4 text-3xl font-black">{loja.nome}</h3>

                <p className="mt-2 text-zinc-400">{loja.categoria}</p>

                <p className="mt-1 text-zinc-500">📍 {loja.cidade}</p>

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
                onClick={() => (window.location.href = criarSlugLoja(loja))}
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

                <h3 className="mt-4 text-2xl font-black">{loja.nome}</h3>

                <p className="mt-2 text-zinc-400">{loja.categoria}</p>

                <p className="mt-1 text-zinc-500">📍 {loja.cidade}</p>

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
              const lojaDoProduto = lojasDaRegiao.find(
                (loja) => Number(loja.id) === Number(produto.loja_id),
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

                  <h3 className="mt-5 text-2xl font-black">{produto.nome}</h3>

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
                        R${" "}
                        {Number(produto.preco_promocional)
                          .toFixed(2)
                          .replace(".", ",")}
                      </p>

                      <p className="text-sm font-bold text-green-400">
                        Economize R${" "}
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
                    <p className="mt-2 text-zinc-400">{produto.descricao}</p>
                  )}

                  <p className="mt-4 text-sm text-zinc-500">Vendido por:</p>

                  <p className="text-lg font-black">{lojaDoProduto.nome}</p>

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
                          `Olá! Vi no VemVer e tenho interesse em: ${produto.nome}`,
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
              const lojaDoProduto = lojasDaRegiao.find(
                (loja) => Number(loja.id) === Number(produto.loja_id),
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

                      {!lojaDoProduto.patrocinado && lojaDoProduto.premium && (
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
                          R${" "}
                          {Number(produto.preco).toFixed(2).replace(".", ",")}
                        </p>

                        <p className="text-2xl font-black text-green-300">
                          R${" "}
                          {Number(produto.preco_promocional)
                            .toFixed(2)
                            .replace(".", ",")}
                        </p>

                        <p className="text-sm font-bold text-green-400">
                          Economize R${" "}
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
                          R${" "}
                          {Number(produto.preco).toFixed(2).replace(".", ",")}
                        </p>
                      )
                    )}

                    {produto.descricao && (
                      <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                        {produto.descricao}
                      </p>
                    )}

                    <div className="mt-4 border-t border-white/10 pt-4">
                      <p className="text-sm text-zinc-500">Vendido por</p>

                      <p className="font-black">{lojaDoProduto.nome}</p>

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
                            `Olá! Vi no VemVer e tenho interesse em: ${produto.nome}`,
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
              const loja = lojasDaRegiao.find(
                (l) => Number(l.id) === Number(produto.loja_id),
              );

              if (!loja) return null;

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

                  <h3 className="mt-4 text-2xl font-black">{produto.nome}</h3>

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
                        R${" "}
                        {Number(produto.preco_promocional)
                          .toFixed(2)
                          .replace(".", ",")}
                      </p>

                      <p className="text-sm font-bold text-green-400">
                        Economize R${" "}
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
                    <p className="mt-3 text-zinc-400">{produto.descricao}</p>
                  )}

                  <p className="mt-4 text-sm text-zinc-500">Vendido por:</p>

                  <p className="font-black">{loja.nome}</p>

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
              );
            })}
          </div>
        </section>
      )}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-8 text-3xl font-black">Categorias populares</h2>

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
              Conheça outros negócios da sua cidade, ordenados pelo ranking e
              pela distância.
            </p>
          </div>

          <span className="rounded-full bg-green-400/15 px-4 py-2 text-sm text-green-300">
            {lojasComuns.length} lojas encontradas
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {lojasComuns.map((loja) => {
            const distancia =
              latitude && longitude && loja.latitude && loja.longitude
                ? calcularDistancia(
                    latitude,
                    longitude,
                    Number(loja.latitude),
                    Number(loja.longitude),
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

                <h3 className="mt-6 text-2xl font-black">{loja.nome}</h3>

                <p className="mt-2 text-zinc-400">
                  Categoria: {loja.categoria}
                </p>

                <p className="mt-1 text-zinc-500">📍 {loja.cidade}</p>

                {distancia !== null && (
                  <p className="mt-1 text-sm font-bold text-green-300">
                    🚀 {distancia.toFixed(1)} km de você
                  </p>
                )}

                {loja.descricao && (
                  <p className="mt-2 text-zinc-400">{loja.descricao}</p>
                )}

                {loja.endereco && (
                  <p className="mt-1 text-zinc-500">📌 {loja.endereco}</p>
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
          <h2 className="text-4xl font-black">Plano lojista premium</h2>

          <p className="mt-4 max-w-2xl text-zinc-300">
            Entre grátis, teste o VemVer e depois destaque sua loja para
            aparecer mais, vender mais e sair na frente da concorrência.
          </p>
        </div>
      </section>

      {seletorLocalizacaoAberto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-localizacao"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-white/10 bg-zinc-900 p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-green-300">
                  Sua região no VemVer
                </p>

                <h2
                  id="titulo-localizacao"
                  className="mt-2 text-3xl font-black"
                >
                  Onde você quer pesquisar?
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Use sua posição atual ou escolha qualquer cidade do Brasil.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSeletorLocalizacaoAberto(false)}
                className="rounded-xl border border-white/10 px-3 py-2 font-black text-zinc-300"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <button
              type="button"
              onClick={pegarLocalizacao}
              disabled={carregandoLocalizacao}
              className="mt-7 w-full rounded-2xl border border-green-400/30 bg-green-400/10 p-5 text-left transition hover:border-green-400/60 disabled:cursor-wait disabled:opacity-60"
            >
              <strong className="block text-lg text-green-300">
                {carregandoLocalizacao
                  ? "Localizando..."
                  : "◎ Usar minha localização atual"}
              </strong>

              <span className="mt-1 block text-sm text-zinc-400">
                O aparelho solicitará sua permissão para identificar a cidade.
              </span>
            </button>

            <div className="my-6 flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-600">
              <div className="h-px flex-1 bg-white/10" />
              ou escolha manualmente
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <label className="block text-sm font-black text-zinc-300">
              Estado
            </label>

            <select
              value={ufTemporaria}
              onChange={(event) => {
                setUfTemporaria(event.target.value);
                setCidadeTemporaria("");
              }}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black p-4 text-white outline-none focus:border-green-400/60"
            >
              <option value="">Selecione o estado</option>

              {estadosBrasileiros.map((estado) => (
                <option key={estado.uf} value={estado.uf}>
                  {estado.nome} ({estado.uf})
                </option>
              ))}
            </select>

            <label className="mt-5 block text-sm font-black text-zinc-300">
              Cidade
            </label>

            <select
              value={cidadeTemporaria}
              onChange={(event) => setCidadeTemporaria(event.target.value)}
              disabled={!ufTemporaria || carregandoMunicipios}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black p-4 text-white outline-none focus:border-green-400/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {carregandoMunicipios
                  ? "Carregando cidades..."
                  : ufTemporaria
                    ? "Selecione a cidade"
                    : "Escolha primeiro o estado"}
              </option>

              {municipios.map((municipio) => (
                <option key={municipio.id} value={municipio.nome}>
                  {municipio.nome}
                </option>
              ))}
            </select>

            {erroLocalizacao && (
              <div className="mt-5 rounded-2xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-200">
                {erroLocalizacao}
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-5 text-zinc-400">
              🔒 O VemVer usa a localização somente para mostrar resultados da
              região. A escolha manual fica salva neste aparelho; as coordenadas
              precisas do GPS não são guardadas.
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSeletorLocalizacaoAberto(false)}
                className="rounded-2xl border border-white/10 px-6 py-4 font-black"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={salvarLocalizacaoManual}
                disabled={!ufTemporaria || !cidadeTemporaria}
                className="rounded-2xl bg-green-400 px-6 py-4 font-black text-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                Ver resultados desta cidade
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}