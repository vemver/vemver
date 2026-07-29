"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";

const VERSAO_DOCUMENTOS = "1.0";

const DOCUMENTOS_LOJISTA = [
  "termos_uso",
  "politica_privacidade",
  "termos_lojista",
] as const;

export default function LojistaPage() {
  const [carregando, setCarregando] = useState(true);
  const [email, setEmail] = useState("");
  const [lojas, setLojas] = useState<any[]>([]);

  useEffect(() => {
    carregarPainel();
  }, []);

  async function carregarPainel() {
    const {
      data: { user },
      error: usuarioError,
    } = await supabase.auth.getUser();

    if (usuarioError || !user) {
      window.location.replace("/login");
      return;
    }

    if (user.email?.trim().toLowerCase() === "vemverapp@gmail.com") {
      window.location.replace("/admin");
      return;
    }

    const tipoConta = user.user_metadata?.tipo_conta || "lojista";

    if (tipoConta === "cliente") {
      window.location.replace("/cliente");
      return;
    }

    const { data: aceites, error: aceitesError } = await supabase
      .from("aceites_legais")
      .select("documento")
      .eq("user_id", user.id)
      .eq("versao", VERSAO_DOCUMENTOS)
      .in("documento", [...DOCUMENTOS_LOJISTA]);

    if (aceitesError) {
      alert("Não foi possível verificar os documentos legais.");
      console.error(aceitesError);
      setCarregando(false);
      return;
    }

    const documentosAceitos = new Set(
      (aceites || []).map((aceite) => aceite.documento),
    );

    const aceitouTodosDocumentos = DOCUMENTOS_LOJISTA.every((documento) =>
      documentosAceitos.has(documento),
    );

    if (!aceitouTodosDocumentos) {
      window.location.replace("/aceitar-termos");
      return;
    }

    const { data: perfil, error: perfilError } = await supabase
      .from("perfis_lojistas")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (perfilError) {
      alert("Não foi possível verificar o cadastro do lojista.");
      console.error(perfilError);
      setCarregando(false);
      return;
    }

    if (!perfil) {
      window.location.replace("/lojista/completar-cadastro");
      return;
    }

    setEmail(user.email || "");

    const { data, error } = await supabase
      .from("lojas")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false });

    if (error) {
      alert("Erro ao carregar suas lojas");
      console.error(error);
      setCarregando(false);
      return;
    }

    setLojas(data || []);
    setCarregando(false);
  }

  async function solicitarPlano(plano: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Faça login novamente.");
      window.location.href = "/login";
      return;
    }

    const { error } = await supabase.from("solicitacoes_planos").insert([
      {
        user_id: user.id,
        email: user.email,
        plano_solicitado: plano,
        status: "pendente",
      },
    ]);

    if (error) {
      alert("Erro ao enviar solicitação");
      console.error(error);
      return;
    }

    alert(
      "Solicitação enviada com sucesso. Aguarde aprovação do administrador.",
    );
  }

  async function sair() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function criarSlugLoja(loja: any) {
    return `/loja/${loja.id}-${loja.nome.toLowerCase().replaceAll(" ", "-")}`;
  }

  const planoAtual = lojas[0]?.plano || "gratis";
  const limiteLojas = lojas[0]?.limite_lojas || 1;
  const lojasUsadas = lojas.length;
  const podeCriarLoja = lojasUsadas < limiteLojas;

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <h1 className="text-3xl font-black">Verificando seu cadastro...</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black md:text-6xl">
              Painel do Lojista
            </h1>

            <p className="mt-3 text-zinc-400">
              Gerencie suas lojas, produtos e oportunidades no VemVer.
            </p>

            <p className="mt-3 text-sm text-zinc-500">
              Logado como: <strong>{email}</strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/lojista/completar-cadastro"
              className="rounded-2xl border border-orange-400/40 bg-orange-400/10 px-5 py-3 font-bold text-orange-300 transition hover:bg-orange-400/20"
            >
              Meus dados
            </a>

            <button
              onClick={sair}
              className="rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-3 font-bold text-red-300"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-zinc-900 p-6">
            <h2 className="text-4xl font-black">{lojasUsadas}</h2>
            <p className="text-zinc-400">Lojas cadastradas</p>
          </div>

          <div className="rounded-3xl bg-zinc-900 p-6">
            <h2 className="text-4xl font-black">
              {lojasUsadas} / {limiteLojas}
            </h2>
            <p className="text-zinc-400">Limite usado</p>
          </div>

          <div className="rounded-3xl bg-zinc-900 p-6">
            <h2 className="text-4xl font-black">
              {lojas.reduce(
                (total, loja) => total + Number(loja.visualizacoes || 0),
                0,
              )}
            </h2>
            <p className="text-zinc-400">Visualizações</p>
          </div>

          <div className="min-w-0 overflow-hidden rounded-3xl bg-zinc-900 p-6">
            <h2 className="break-words text-xl font-black uppercase leading-tight sm:text-2xl">
              {planoAtual}
            </h2>
            <p className="text-zinc-400">Plano atual</p>
          </div>
        </div>

        <section className="mt-10 rounded-[2rem] border border-green-400/20 bg-gradient-to-br from-green-400/10 to-zinc-900 p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black">
                Comece ou continue vendendo
              </h2>

              <p className="mt-3 max-w-2xl text-zinc-400">
                Crie sua loja, organize seus produtos e acompanhe sua presença
                dentro do VemVer.
              </p>

              {!podeCriarLoja && (
                <p className="mt-4 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 font-bold text-yellow-300">
                  Seu plano atual permite {limiteLojas} loja(s). Para cadastrar
                  outra unidade, solicite o plano Multiunidade.
                </p>
              )}
            </div>

            {podeCriarLoja ? (
              <a
                href="/cadastrar-loja"
                className="rounded-2xl bg-green-400 px-6 py-4 font-black text-black"
              >
                + Nova loja
              </a>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => solicitarPlano("multiunidade")}
                  className="rounded-2xl bg-blue-500 px-6 py-4 font-black text-white"
                >
                  🚀 Multiunidade
                </button>

                <button
                  onClick={() => solicitarPlano("franquia")}
                  className="rounded-2xl bg-purple-600 px-6 py-4 font-black text-white"
                >
                  🏢 Franquia
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">Minhas lojas</h2>

              <p className="mt-2 text-zinc-400">
                Escolha uma loja para gerenciar produtos, dados e destaques.
              </p>
            </div>

            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-zinc-300">
              {lojas.length} loja(s)
            </span>
          </div>

          {lojas.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-900 p-8 text-center">
              <h3 className="text-2xl font-black">
                Você ainda não cadastrou nenhuma loja
              </h3>

              <p className="mt-3 text-zinc-400">
                Crie sua primeira loja para começar a aparecer no VemVer.
              </p>

              <a
                href="/cadastrar-loja"
                className="mt-6 inline-block rounded-2xl bg-green-400 px-6 py-4 font-black text-black"
              >
                Cadastrar minha primeira loja
              </a>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {lojas.map((loja) => (
                <div
                  key={loja.id}
                  className={`rounded-3xl border p-6 ${
                    loja.ativo === false
                      ? "border-red-500/30 bg-red-950/30"
                      : loja.premium
                        ? "border-yellow-400 bg-yellow-400/10"
                        : "border-white/10 bg-zinc-900"
                  }`}
                >
                  {loja.imagem_url && (
                    <img
                      src={loja.imagem_url}
                      alt={loja.nome}
                      className="mb-5 h-48 w-full rounded-2xl object-cover"
                    />
                  )}

                  <div className="flex flex-wrap gap-2">
                    {loja.premium && (
                      <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-black text-black">
                        ⭐ PREMIUM
                      </span>
                    )}

                    {loja.ativo === false ? (
                      <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-black text-white">
                        INATIVA
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-400 px-3 py-1 text-sm font-black text-black">
                        ATIVA
                      </span>
                    )}

                    {loja.status && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-zinc-300">
                        {loja.status}
                      </span>
                    )}

                    <span className="rounded-full bg-purple-500 px-3 py-1 text-sm font-black text-white">
                      {loja.plano || "gratis"} / {loja.limite_lojas || 1}
                    </span>
                  </div>

                  <h3 className="mt-5 text-3xl font-black">{loja.nome}</h3>

                  <p className="mt-2 text-zinc-400">
                    👁 {loja.visualizacoes || 0} visualizações
                  </p>

                  <p className="mt-2 text-zinc-400">
                    {loja.categoria} • {loja.cidade}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href={`/lojista/loja/${loja.id}`}
                      className="rounded-2xl bg-green-400 px-5 py-3 font-black text-black"
                    >
                      Gerenciar
                    </a>

                    <a
                      href={criarSlugLoja(loja)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-white/20 px-5 py-3 font-bold"
                    >
                      Ver loja pública
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}