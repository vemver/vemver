"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";

type TipoAtivacao = "imediata" | "agendada";

type PlanoCatalogo = {
  id: number;
  codigo: string;
  nome: string;
  periodo: "mensal" | "trimestral" | "anual";
  meses: number;
  preco: number;
  limite_lojas: number | null;
  ativo: boolean;
};

function formatarPreco(valor: number) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarPeriodo(periodo?: string | null) {
  const nomes: Record<string, string> = {
    mensal: "Mensal",
    trimestral: "Trimestral",
    anual: "Anual",
  };

  return nomes[String(periodo || "").toLowerCase()] || "Não informado";
}

function formatarData(valor?: string | null) {
  if (!valor) return "Não informado";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return "Data inválida";

  return data.toLocaleString("pt-BR");
}

function paraInputData(valor?: string | null) {
  let data = valor ? new Date(valor) : new Date(Date.now() + 86_400_000);

  if (Number.isNaN(data.getTime()) || data.getTime() <= Date.now() + 60_000) {
    data = new Date(Date.now() + 86_400_000);
  }

  const dataLocal = new Date(
    data.getTime() - data.getTimezoneOffset() * 60_000,
  );

  return dataLocal.toISOString().slice(0, 16);
}

export default function AdminPage() {
  const [carregando, setCarregando] = useState(true);
  const [lojas, setLojas] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
  const [planos, setPlanos] = useState<PlanoCatalogo[]>([]);

  const [lojaSelecionada, setLojaSelecionada] = useState<any | null>(null);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<
    any | null
  >(null);
  const [planoIdSelecionado, setPlanoIdSelecionado] = useState("");
  const [tipoAtivacao, setTipoAtivacao] = useState<TipoAtivacao>("imediata");
  const [ativacaoEm, setAtivacaoEm] = useState("");
  const [motivo, setMotivo] = useState("");
  const [processandoPlano, setProcessandoPlano] = useState(false);

  useEffect(() => {
    verificarAdmin();
  }, []);

  async function verificarAdmin() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      if (user.email?.trim().toLowerCase() !== "vemverapp@gmail.com") {
        alert("Acesso negado");
        window.location.href = "/";
        return;
      }

      await carregarDados();
    } catch (error) {
      console.error("Erro ao abrir o painel administrativo:", error);
      alert("Não foi possível abrir o painel administrativo.");
    } finally {
      setCarregando(false);
    }
  }

  async function carregarDados() {
    const [
      lojasResposta,
      produtosResposta,
      solicitacoesResposta,
      planosResposta,
    ] = await Promise.all([
      supabase.from("lojas").select("*").order("id", { ascending: false }),
      supabase.from("produtos").select("*").order("id", { ascending: false }),
      supabase
        .from("solicitacoes_planos")
        .select("*")
        .order("id", { ascending: false }),
      supabase
        .from("planos_catalogo")
        .select("id, codigo, nome, periodo, meses, preco, limite_lojas, ativo")
        .eq("ativo", true)
        .order("codigo", { ascending: true })
        .order("meses", { ascending: true }),
    ]);

    const primeiroErro =
      lojasResposta.error ||
      produtosResposta.error ||
      solicitacoesResposta.error ||
      planosResposta.error;

    if (primeiroErro) {
      console.error("Erro ao carregar o painel:", primeiroErro);
      alert("Alguns dados do painel não puderam ser carregados.");
    }

    setLojas(lojasResposta.data || []);
    setProdutos(produtosResposta.data || []);
    setSolicitacoes(solicitacoesResposta.data || []);
    setPlanos((planosResposta.data || []) as PlanoCatalogo[]);
  }

  async function sair() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function abrirGerenciamentoPlano(loja: any, solicitacao: any | null = null) {
    const codigoSolicitado = String(solicitacao?.plano_solicitado || "")
      .trim()
      .toLowerCase();

    const planoSugerido = planos.find(
      (plano) =>
        plano.codigo.trim().toLowerCase() === codigoSolicitado &&
        plano.periodo === "mensal",
    );

    setLojaSelecionada(loja);
    setSolicitacaoSelecionada(solicitacao);
    setPlanoIdSelecionado(planoSugerido ? String(planoSugerido.id) : "");
    setTipoAtivacao("imediata");
    setAtivacaoEm(paraInputData(loja.plano_vencimento));
    setMotivo("");
  }

  function abrirSolicitacaoPlano(solicitacao: any) {
    const loja = lojas.find(
      (item) => String(item.user_id) === String(solicitacao.user_id),
    );

    if (!loja) {
      alert("Não foi encontrada uma loja vinculada a esta solicitação.");
      return;
    }

    abrirGerenciamentoPlano(loja, solicitacao);
  }

  function fecharGerenciamentoPlano() {
    if (processandoPlano) return;

    setLojaSelecionada(null);
    setSolicitacaoSelecionada(null);
    setPlanoIdSelecionado("");
    setTipoAtivacao("imediata");
    setAtivacaoEm("");
    setMotivo("");
  }

  async function confirmarGerenciamentoPlano() {
    if (!lojaSelecionada) return;

    const planoId = Number(planoIdSelecionado);

    if (!Number.isInteger(planoId) || planoId <= 0) {
      alert("Selecione uma opção de plano.");
      return;
    }

    if (motivo.trim().length < 5) {
      alert("Informe um motivo com pelo menos 5 caracteres.");
      return;
    }

    let ativacaoIso: string | null = null;

    if (tipoAtivacao === "agendada") {
      const dataAgendada = new Date(ativacaoEm);

      if (
        Number.isNaN(dataAgendada.getTime()) ||
        dataAgendada.getTime() <= Date.now() + 60_000
      ) {
        alert("Escolha uma data futura válida para a ativação.");
        return;
      }

      ativacaoIso = dataAgendada.toISOString();
    }

    if (
      tipoAtivacao === "imediata" &&
      lojaSelecionada.plano_vencimento &&
      new Date(lojaSelecionada.plano_vencimento).getTime() > Date.now()
    ) {
      const confirmar = window.confirm(
        "A ativação imediata substituirá agora o plano vigente e os dias restantes não serão transferidos. Deseja continuar?",
      );

      if (!confirmar) return;
    }

    setProcessandoPlano(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Sua sessão expirou. Entre novamente no painel.");
      }

      const resposta = await fetch("/api/admin/planos/ativar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          loja_id: Number(lojaSelecionada.id),
          plano_id: planoId,
          tipo_ativacao: tipoAtivacao,
          ativacao_em: ativacaoIso,
          motivo: motivo.trim(),
        }),
      });

      const resultado = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(
          resultado?.error ||
            resultado?.detalhes ||
            "Não foi possível alterar a assinatura.",
        );
      }

      let avisoSolicitacao = "";

      if (solicitacaoSelecionada?.id) {
        const { error: solicitacaoError } = await supabase
          .from("solicitacoes_planos")
          .update({ status: "aprovada" })
          .eq("id", solicitacaoSelecionada.id);

        if (solicitacaoError) {
          console.error(
            "Plano ativado, mas a solicitação não foi encerrada:",
            solicitacaoError,
          );
          avisoSolicitacao =
            "\n\nA assinatura foi registrada, mas a solicitação permaneceu pendente.";
        }
      }

      const avisos = Array.isArray(resultado?.avisos)
        ? resultado.avisos.filter(Boolean)
        : [];

      const avisoAuxiliar = avisos.length
        ? `\n\nAvisos: ${avisos.join("; ")}`
        : "";

      alert(
        `${resultado?.mensagem || "Assinatura atualizada com sucesso."}${avisoSolicitacao}${avisoAuxiliar}`,
      );

      fecharGerenciamentoPlano();
      await carregarDados();
    } catch (error: any) {
      console.error("Erro ao gerenciar assinatura:", error);
      alert(error?.message || "Erro ao gerenciar assinatura.");
    } finally {
      setProcessandoPlano(false);
    }
  }

  async function alterarStatusLoja(loja: any, status: string) {
    const { error } = await supabase
      .from("lojas")
      .update({
        status,
        ativo: status === "aprovada",
      })
      .eq("id", loja.id);

    if (error) {
      alert("Erro ao alterar a situação da loja.");
      console.error(error);
      return;
    }

    await carregarDados();
  }

  async function alterarAtivo(loja: any) {
    const { error } = await supabase
      .from("lojas")
      .update({ ativo: loja.ativo === false })
      .eq("id", loja.id);

    if (error) {
      alert("Erro ao alterar a disponibilidade da loja.");
      console.error(error);
      return;
    }

    await carregarDados();
  }

  async function alterarProdutoAtivo(produto: any) {
    const { error } = await supabase
      .from("produtos")
      .update({ ativo: produto.ativo === false })
      .eq("id", produto.id);

    if (error) {
      alert("Erro ao alterar o produto.");
      console.error(error);
      return;
    }

    await carregarDados();
  }

  async function alterarProdutoDestaque(produto: any) {
    const { error } = await supabase
      .from("produtos")
      .update({ destaque: produto.destaque !== true })
      .eq("id", produto.id);

    if (error) {
      alert("Erro ao alterar o destaque do produto.");
      console.error(error);
      return;
    }

    await carregarDados();
  }

  async function excluirProduto(id: number) {
    const confirmar = confirm("Deseja realmente excluir este produto?");
    if (!confirmar) return;

    const { error } = await supabase.from("produtos").delete().eq("id", id);

    if (error) {
      alert("Erro ao excluir o produto.");
      console.error(error);
      return;
    }

    await carregarDados();
  }

  function nomeDaLoja(lojaId: number) {
    const loja = lojas.find((item) => Number(item.id) === Number(lojaId));
    return loja?.nome || "Loja não encontrada";
  }

  const planoSelecionado = planos.find(
    (plano) => plano.id === Number(planoIdSelecionado),
  );

  const solicitacoesPendentes = solicitacoes.filter(
    (solicitacao) => solicitacao.status === "pendente",
  );

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <h1 className="text-3xl font-black">Carregando painel...</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-5xl font-black">Painel Admin</h1>
            <p className="mt-3 text-zinc-400">Controle geral do VemVer</p>
          </div>

          <button
            onClick={sair}
            className="rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-3 font-bold text-red-300"
          >
            Sair do Admin
          </button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          <div className="rounded-3xl bg-zinc-900 p-6">
            <h2 className="text-4xl font-black">
              {lojas.filter((loja) => loja.status === "em_analise").length}
            </h2>
            <p className="text-zinc-400">Em análise</p>
          </div>

          <div className="rounded-3xl bg-zinc-900 p-6">
            <h2 className="text-4xl font-black">
              {lojas.filter((loja) => loja.status === "aprovada").length}
            </h2>
            <p className="text-zinc-400">Aprovadas</p>
          </div>

          <div className="rounded-3xl bg-zinc-900 p-6">
            <h2 className="text-4xl font-black">
              {lojas.filter((loja) => loja.status === "rejeitada").length}
            </h2>
            <p className="text-zinc-400">Rejeitadas</p>
          </div>

          <div className="rounded-3xl bg-zinc-900 p-6">
            <h2 className="text-4xl font-black">
              {
                lojas.filter((loja) => loja.assinatura_status === "ativa")
                  .length
              }
            </h2>
            <p className="text-zinc-400">Assinaturas ativas</p>
          </div>
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-black">Solicitações de plano</h2>
          <p className="mt-2 text-zinc-400">
            Abra a loja vinculada e conclua a ativação pela rotina
            administrativa.
          </p>

          <div className="mt-6 grid gap-4">
            {solicitacoesPendentes.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 text-zinc-400">
                Nenhuma solicitação pendente.
              </div>
            ) : (
              solicitacoesPendentes.map((solicitacao) => (
                <div
                  key={solicitacao.id}
                  className="rounded-3xl border border-blue-500/30 bg-blue-950/30 p-6"
                >
                  <p className="text-sm text-zinc-400">Solicitante</p>
                  <h3 className="break-all text-2xl font-black">
                    {solicitacao.email}
                  </h3>
                  <p className="mt-3 text-zinc-300">
                    Plano solicitado:{" "}
                    <strong>{solicitacao.plano_solicitado}</strong>
                  </p>

                  <button
                    onClick={() => abrirSolicitacaoPlano(solicitacao)}
                    className="mt-5 rounded-2xl bg-green-500 px-5 py-3 font-black text-white"
                  >
                    Analisar e ativar
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <h2 className="mt-14 text-3xl font-black">Lojas cadastradas</h2>

        <div className="mt-6 grid gap-4">
          {lojas.map((loja) => (
            <div
              key={loja.id}
              className={`rounded-3xl border p-6 ${
                loja.ativo === false
                  ? "border-red-500/30 bg-red-950/30"
                  : loja.assinatura_status === "ativa"
                    ? "border-yellow-400/60 bg-yellow-400/10"
                    : "border-white/10 bg-zinc-900"
              }`}
            >
              <div className="flex flex-wrap gap-2">
                {loja.assinatura_status === "ativa" && (
                  <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-black text-black">
                    ⭐ ASSINATURA ATIVA
                  </span>
                )}

                <span
                  className={`rounded-full px-3 py-1 text-sm font-black ${
                    loja.ativo === false
                      ? "bg-red-500 text-white"
                      : "bg-green-400 text-black"
                  }`}
                >
                  {loja.ativo === false ? "INATIVA" : "ATIVA"}
                </span>

                <span className="rounded-full bg-blue-500 px-3 py-1 text-sm font-black text-white">
                  STATUS: {loja.status || "sem_status"}
                </span>

                <span className="rounded-full bg-purple-500 px-3 py-1 text-sm font-black text-white">
                  PLANO: {loja.plano || "gratis"} / {loja.limite_lojas || 1}{" "}
                  loja(s)
                </span>
              </div>

              <h3 className="mt-4 text-2xl font-black">{loja.nome}</h3>
              <p className="mt-2 text-zinc-400">
                {loja.categoria} • {loja.cidade}
              </p>
              <p className="mt-1 text-xs text-zinc-500">ID: {loja.id}</p>
              <p className="mt-3 text-sm text-zinc-400">
                Período: <strong>{formatarPeriodo(loja.plano_periodo)}</strong>
                {" • "}
                Vencimento:{" "}
                <strong>{formatarData(loja.plano_vencimento)}</strong>
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => abrirGerenciamentoPlano(loja)}
                  className="rounded-2xl bg-purple-500 px-5 py-3 font-black text-white"
                >
                  Gerenciar assinatura
                </button>

                <button
                  onClick={() => alterarAtivo(loja)}
                  className="rounded-2xl bg-green-400 px-5 py-3 font-black text-black"
                >
                  {loja.ativo === false ? "Ativar Loja" : "Desativar Loja"}
                </button>

                <button
                  onClick={() => alterarStatusLoja(loja, "aprovada")}
                  className="rounded-2xl bg-green-500 px-5 py-3 font-black text-white"
                >
                  Aprovar
                </button>

                <button
                  onClick={() => alterarStatusLoja(loja, "rejeitada")}
                  className="rounded-2xl bg-red-500 px-5 py-3 font-black text-white"
                >
                  Rejeitar
                </button>

                <button
                  onClick={() => alterarStatusLoja(loja, "em_analise")}
                  className="rounded-2xl bg-yellow-500 px-5 py-3 font-black text-black"
                >
                  Em análise
                </button>

                <a
                  href={`/loja/${loja.id}-${loja.nome
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/20 px-5 py-3 font-bold"
                >
                  Ver loja
                </a>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-16 text-3xl font-black">Produtos cadastrados</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {produtos.map((produto) => (
            <div
              key={produto.id}
              className={`rounded-3xl border p-6 ${
                produto.ativo === false
                  ? "border-red-500/30 bg-red-950/30"
                  : produto.destaque
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-white/10 bg-zinc-900"
              }`}
            >
              {produto.imagem_url && (
                <img
                  src={produto.imagem_url}
                  alt={produto.nome}
                  className="mb-5 h-48 w-full rounded-2xl object-cover"
                />
              )}

              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-black ${
                    produto.ativo === false
                      ? "bg-red-500 text-white"
                      : "bg-green-400 text-black"
                  }`}
                >
                  {produto.ativo === false ? "INATIVO" : "ATIVO"}
                </span>

                {produto.destaque && (
                  <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-black text-black">
                    ⭐ DESTAQUE
                  </span>
                )}
              </div>

              <h3 className="mt-4 text-2xl font-black">{produto.nome}</h3>
              <p className="mt-2 text-zinc-400">{produto.descricao}</p>
              <p className="mt-2 text-sm text-zinc-500">
                Loja: {nomeDaLoja(produto.loja_id)}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => alterarProdutoAtivo(produto)}
                  className="rounded-2xl bg-green-400 px-5 py-3 font-black text-black"
                >
                  {produto.ativo === false
                    ? "Ativar Produto"
                    : "Desativar Produto"}
                </button>

                <button
                  onClick={() => alterarProdutoDestaque(produto)}
                  className="rounded-2xl bg-yellow-400 px-5 py-3 font-black text-black"
                >
                  {produto.destaque ? "Remover Destaque" : "Destacar Produto"}
                </button>

                <button
                  onClick={() => excluirProduto(produto.id)}
                  className="rounded-2xl bg-red-500 px-5 py-3 font-black text-white"
                >
                  Excluir Produto
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lojaSelecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-2xl md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-300">
                  Administração de assinatura
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  Gerenciar assinatura
                </h2>
                <p className="mt-2 text-zinc-400">{lojaSelecionada.nome}</p>
              </div>

              <button
                type="button"
                onClick={fecharGerenciamentoPlano}
                disabled={processandoPlano}
                className="rounded-xl border border-white/10 px-4 py-2 font-bold text-zinc-300 disabled:opacity-50"
              >
                Fechar
              </button>
            </div>

            {solicitacaoSelecionada && (
              <div className="mt-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-200">
                Solicitação vinculada: {solicitacaoSelecionada.plano_solicitado}
                {" — "}
                {solicitacaoSelecionada.email}
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-black/30 p-5">
                <p className="text-sm text-zinc-500">Plano atual</p>
                <p className="mt-1 text-xl font-black capitalize">
                  {lojaSelecionada.plano || "gratis"}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {formatarPeriodo(lojaSelecionada.plano_periodo)}
                </p>
              </div>

              <div className="rounded-2xl bg-black/30 p-5">
                <p className="text-sm text-zinc-500">Vencimento atual</p>
                <p className="mt-1 font-black">
                  {formatarData(lojaSelecionada.plano_vencimento)}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-bold text-zinc-300">
                Nova opção de plano
              </label>
              <select
                value={planoIdSelecionado}
                onChange={(event) => setPlanoIdSelecionado(event.target.value)}
                disabled={processandoPlano}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black p-4 text-white outline-none focus:border-purple-400 disabled:opacity-50"
              >
                <option value="">Selecione plano e período</option>
                {planos.map((plano) => (
                  <option key={plano.id} value={plano.id}>
                    {plano.nome} — {formatarPeriodo(plano.periodo)} —{" "}
                    {formatarPreco(plano.preco)}
                  </option>
                ))}
              </select>
            </div>

            {planoSelecionado && (
              <div className="mt-4 rounded-2xl border border-purple-400/20 bg-purple-400/10 p-4 text-sm text-purple-100">
                {planoSelecionado.meses} mês(es) de acesso • até{" "}
                {planoSelecionado.limite_lojas || 1} loja(s)
              </div>
            )}

            <div className="mt-6">
              <p className="text-sm font-bold text-zinc-300">
                Quando o plano deve começar?
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setTipoAtivacao("imediata")}
                  disabled={processandoPlano}
                  className={`rounded-2xl border p-4 text-left transition disabled:opacity-50 ${
                    tipoAtivacao === "imediata"
                      ? "border-green-400 bg-green-400/10"
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <span className="font-black">Ativação imediata</span>
                  <span className="mt-1 block text-sm text-zinc-400">
                    Substitui o plano atual agora.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoAtivacao("agendada")}
                  disabled={processandoPlano}
                  className={`rounded-2xl border p-4 text-left transition disabled:opacity-50 ${
                    tipoAtivacao === "agendada"
                      ? "border-blue-400 bg-blue-400/10"
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <span className="font-black">Ativação agendada</span>
                  <span className="mt-1 block text-sm text-zinc-400">
                    Preserva o plano atual até a data escolhida.
                  </span>
                </button>
              </div>
            </div>

            {tipoAtivacao === "agendada" && (
              <div className="mt-6">
                <label className="text-sm font-bold text-zinc-300">
                  Data e hora da ativação
                </label>
                <input
                  type="datetime-local"
                  value={ativacaoEm}
                  onChange={(event) => setAtivacaoEm(event.target.value)}
                  disabled={processandoPlano}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black p-4 text-white outline-none focus:border-blue-400 disabled:opacity-50"
                />
                <p className="mt-2 text-xs text-zinc-500">
                  Por padrão, usamos o vencimento atual quando ele ainda está no
                  futuro.
                </p>
              </div>
            )}

            <div className="mt-6">
              <label className="text-sm font-bold text-zinc-300">
                Motivo obrigatório
              </label>
              <textarea
                value={motivo}
                onChange={(event) => setMotivo(event.target.value)}
                maxLength={500}
                disabled={processandoPlano}
                placeholder="Ex.: cortesia comercial aprovada, pagamento externo confirmado ou correção administrativa."
                className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-black p-4 text-white outline-none focus:border-purple-400 disabled:opacity-50"
              />
              <p className="mt-2 text-right text-xs text-zinc-500">
                {motivo.length}/500
              </p>
            </div>

            <div
              className={`mt-6 rounded-2xl border p-4 text-sm ${
                tipoAtivacao === "imediata"
                  ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-100"
                  : "border-blue-500/30 bg-blue-500/10 text-blue-100"
              }`}
            >
              {tipoAtivacao === "imediata"
                ? "Atenção: o plano vigente será substituído imediatamente. Os dias restantes não serão transferidos."
                : "O plano atual continuará funcionando até a data escolhida. A ativação será executada pelo cron administrativo."}
            </div>

            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={fecharGerenciamentoPlano}
                disabled={processandoPlano}
                className="rounded-2xl border border-white/10 px-6 py-3 font-bold disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarGerenciamentoPlano}
                disabled={
                  processandoPlano ||
                  !planoIdSelecionado ||
                  motivo.trim().length < 5
                }
                className="rounded-2xl bg-green-500 px-6 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {processandoPlano
                  ? "Salvando..."
                  : tipoAtivacao === "imediata"
                    ? "Ativar plano agora"
                    : "Agendar ativação"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}