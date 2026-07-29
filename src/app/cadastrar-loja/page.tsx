"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";

const VERSAO_DOCUMENTOS = "1.0";
const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024;

const DOCUMENTOS_LOJISTA = [
  "termos_uso",
  "politica_privacidade",
  "termos_lojista",
] as const;

export default function CadastrarLoja() {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cidade, setCidade] = useState("");
  const [endereco, setEndereco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    verificarAcesso();
  }, []);

  useEffect(() => {
    return () => {
      if (imagemPreview) {
        URL.revokeObjectURL(imagemPreview);
      }
    };
  }, [imagemPreview]);

  async function obterDestinoPendente(userId: string) {
    const { data: aceites, error: aceitesError } = await supabase
      .from("aceites_legais")
      .select("documento")
      .eq("user_id", userId)
      .eq("versao", VERSAO_DOCUMENTOS)
      .in("documento", [...DOCUMENTOS_LOJISTA]);

    if (aceitesError) {
      throw aceitesError;
    }

    const documentosAceitos = new Set(
      (aceites || []).map((aceite) => aceite.documento),
    );

    const aceitouTodosDocumentos = DOCUMENTOS_LOJISTA.every((documento) =>
      documentosAceitos.has(documento),
    );

    if (!aceitouTodosDocumentos) {
      return "/aceitar-termos";
    }

    const { data: perfil, error: perfilError } = await supabase
      .from("perfis_lojistas")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (perfilError) {
      throw perfilError;
    }

    if (!perfil) {
      return "/lojista/completar-cadastro";
    }

    return null;
  }

  async function verificarAcesso() {
    try {
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

      const destinoPendente = await obterDestinoPendente(user.id);

      if (destinoPendente) {
        window.location.replace(destinoPendente);
        return;
      }

      setAutorizado(true);
    } catch (error) {
      console.error(error);
      alert("Não foi possível verificar seu cadastro. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  function somenteNumeros(valor: string) {
    return valor.replace(/\D/g, "");
  }

  function formatarWhatsapp(valor: string) {
    const numeros = somenteNumeros(valor).slice(0, 13);

    if (numeros.length > 11) {
      const codigoPais = numeros.slice(0, numeros.length - 11);
      const telefone = numeros.slice(-11);

      return `+${codigoPais} (${telefone.slice(
        0,
        2,
      )}) ${telefone.slice(2, 7)}-${telefone.slice(7)}`;
    }

    if (numeros.length <= 10) {
      return numeros
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }

    return numeros
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }

  function validarFormulario() {
    const telefoneNumerico = somenteNumeros(whatsapp);

    if (nome.trim().length < 2) {
      alert("Digite o nome da loja.");
      return false;
    }

    if (categoria.trim().length < 2) {
      alert("Digite a categoria da loja.");
      return false;
    }

    if (telefoneNumerico.length < 10 || telefoneNumerico.length > 13) {
      alert("Digite um número de WhatsApp válido, com DDD.");
      return false;
    }

    if (cidade.trim().length < 2) {
      alert("Digite a cidade da loja.");
      return false;
    }

    if (endereco.trim().length < 5) {
      alert("Digite o endereço completo da loja.");
      return false;
    }

    if (descricao.trim().length < 10) {
      alert("A descrição precisa ter pelo menos 10 caracteres.");
      return false;
    }

    if (imagem && !imagem.type.startsWith("image/")) {
      alert("Escolha um arquivo de imagem válido.");
      return false;
    }

    if (imagem && imagem.size > TAMANHO_MAXIMO_IMAGEM) {
      alert("A imagem deve possuir no máximo 5 MB.");
      return false;
    }

    return true;
  }

  function selecionarImagem(arquivo: File | undefined) {
    if (!arquivo) {
      setImagem(null);
      setImagemPreview("");
      return;
    }

    if (!arquivo.type.startsWith("image/")) {
      alert("Escolha um arquivo de imagem válido.");
      return;
    }

    if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) {
      alert("A imagem deve possuir no máximo 5 MB.");
      return;
    }

    setImagem(arquivo);
    setImagemPreview(URL.createObjectURL(arquivo));
  }

  async function cadastrarLoja() {
    if (!validarFormulario() || salvando) return;

    setSalvando(true);

    const {
      data: { user },
      error: usuarioError,
    } = await supabase.auth.getUser();

    if (usuarioError || !user) {
      alert("Faça login para cadastrar sua loja.");
      window.location.replace("/login");
      return;
    }

    const tipoConta = user.user_metadata?.tipo_conta || "lojista";

    if (tipoConta === "cliente") {
      alert("Uma conta de cliente não pode cadastrar lojas.");
      window.location.replace("/cliente");
      return;
    }

    try {
      const destinoPendente = await obterDestinoPendente(user.id);

      if (destinoPendente) {
        alert(
          destinoPendente === "/aceitar-termos"
            ? "Aceite os documentos legais antes de cadastrar uma loja."
            : "Complete seus dados de CPF/CNPJ antes de cadastrar uma loja.",
        );
        window.location.replace(destinoPendente);
        return;
      }
    } catch (error) {
      console.error(error);
      alert("Não foi possível verificar seu cadastro. Tente novamente.");
      setSalvando(false);
      return;
    }

    const { data: lojasDoUsuario, error: lojasError } = await supabase
      .from("lojas")
      .select("id, plano, limite_lojas")
      .eq("user_id", user.id);

    if (lojasError) {
      console.error(lojasError);
      alert("Não foi possível verificar o limite de lojas do seu plano.");
      setSalvando(false);
      return;
    }

    const planoAtual = lojasDoUsuario?.[0]?.plano || "gratis";
    const limiteLojas = lojasDoUsuario?.[0]?.limite_lojas || 1;
    const totalLojas = lojasDoUsuario?.length || 0;

    if (totalLojas >= limiteLojas) {
      alert(
        `Seu plano atual (${planoAtual}) permite ${limiteLojas} loja(s). Para cadastrar outra unidade, solicite um plano Multiunidade.`,
      );
      window.location.replace("/lojista");
      return;
    }

    let imagemUrl = "";

    if (imagem) {
      const extensaoOriginal = imagem.name.split(".").pop() || "jpg";
      const extensao = extensaoOriginal.toLowerCase().replace(/[^a-z0-9]/g, "");
      const identificador = Math.random().toString(36).slice(2, 10);
      const nomeArquivo = `${user.id}/${Date.now()}-${identificador}.${
        extensao || "jpg"
      }`;

      const { error: uploadError } = await supabase.storage
        .from("lojas")
        .upload(nomeArquivo, imagem, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        alert("Erro ao enviar imagem");
        console.error(uploadError);
        setSalvando(false);
        return;
      }

      const { data } = supabase.storage.from("lojas").getPublicUrl(nomeArquivo);

      imagemUrl = data.publicUrl;
    }

    const { error } = await supabase.from("lojas").insert([
      {
        nome: nome.trim(),
        categoria: categoria.trim(),
        whatsapp: somenteNumeros(whatsapp),
        cidade: cidade.trim(),
        endereco: endereco.trim(),
        descricao: descricao.trim(),
        imagem_url: imagemUrl,
        premium: false,
        ativo: false,
        status: "em_analise",
        user_id: user.id,
      },
    ]);

    setSalvando(false);

    if (error) {
      alert("Erro ao cadastrar");
      console.error(error);
      return;
    }

    alert(
      "Loja enviada para análise! Após aprovação do administrador ela aparecerá no VemVer.",
    );

    window.location.replace("/lojista");
  }

  if (carregando || !autorizado) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
        <div className="rounded-3xl border border-white/10 bg-zinc-900 px-8 py-6 text-center">
          <h1 className="text-2xl font-black">Verificando seu cadastro...</h1>

          <p className="mt-2 text-sm text-zinc-400">Aguarde um instante.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <a href="/lojista" className="text-sm font-bold text-green-300">
          ← Voltar para o painel
        </a>

        <h1 className="mt-6 text-4xl font-black">Cadastrar Loja</h1>

        <p className="mt-2 text-zinc-400">Coloque sua loja no VemVer</p>

        <div className="mt-6 rounded-2xl border border-orange-400/20 bg-orange-400/10 p-4 text-sm leading-6 text-orange-100">
          O responsável por esta conta já possui os documentos legais e o
          CPF/CNPJ cadastrados.
        </div>

        <div className="mt-8 space-y-4">
          <input
            value={nome}
            disabled={salvando}
            onChange={(evento) => setNome(evento.target.value)}
            placeholder="Nome da loja"
            autoComplete="organization"
            className="w-full rounded-2xl bg-zinc-800 p-4 outline-none focus:ring-2 focus:ring-green-400/40 disabled:opacity-60"
          />

          <input
            value={categoria}
            disabled={salvando}
            onChange={(evento) => setCategoria(evento.target.value)}
            placeholder="Categoria"
            className="w-full rounded-2xl bg-zinc-800 p-4 outline-none focus:ring-2 focus:ring-green-400/40 disabled:opacity-60"
          />

          <input
            type="tel"
            inputMode="tel"
            value={whatsapp}
            disabled={salvando}
            onChange={(evento) =>
              setWhatsapp(formatarWhatsapp(evento.target.value))
            }
            placeholder="WhatsApp com DDD"
            autoComplete="tel"
            className="w-full rounded-2xl bg-zinc-800 p-4 outline-none focus:ring-2 focus:ring-green-400/40 disabled:opacity-60"
          />

          <input
            value={cidade}
            disabled={salvando}
            onChange={(evento) => setCidade(evento.target.value)}
            placeholder="Cidade"
            autoComplete="address-level2"
            className="w-full rounded-2xl bg-zinc-800 p-4 outline-none focus:ring-2 focus:ring-green-400/40 disabled:opacity-60"
          />

          <input
            value={endereco}
            disabled={salvando}
            onChange={(evento) => setEndereco(evento.target.value)}
            placeholder="Endereço completo"
            autoComplete="street-address"
            className="w-full rounded-2xl bg-zinc-800 p-4 outline-none focus:ring-2 focus:ring-green-400/40 disabled:opacity-60"
          />

          <label className="block rounded-2xl bg-zinc-800 p-4">
            <span className="mb-3 block text-sm font-bold text-zinc-300">
              Imagem principal da loja — máximo 5 MB
            </span>

            <input
              type="file"
              accept="image/*"
              disabled={salvando}
              onChange={(evento) => selecionarImagem(evento.target.files?.[0])}
              className="w-full outline-none disabled:opacity-60"
            />
          </label>

          {imagemPreview && (
            <img
              src={imagemPreview}
              alt="Prévia da imagem da loja"
              className="mt-4 h-52 w-full rounded-2xl object-cover"
            />
          )}

          <textarea
            value={descricao}
            disabled={salvando}
            onChange={(evento) => setDescricao(evento.target.value)}
            placeholder="Descrição da loja — mínimo de 10 caracteres"
            rows={5}
            className="w-full resize-y rounded-2xl bg-zinc-800 p-4 outline-none focus:ring-2 focus:ring-green-400/40 disabled:opacity-60"
          />

          <button
            type="button"
            onClick={cadastrarLoja}
            disabled={salvando}
            className="w-full rounded-2xl bg-green-400 py-4 font-bold text-black transition hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {salvando ? "Enviando..." : "Cadastrar loja"}
          </button>
        </div>
      </div>
    </main>
  );
}