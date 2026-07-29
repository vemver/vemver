"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

type TipoPessoa = "pf" | "pj";

type PerfilLojista = {
  user_id: string;
  tipo_pessoa: TipoPessoa;
  cpf_cnpj: string;
  nome_razao_social: string;
  telefone: string;
};

const VERSAO_DOCUMENTOS = "1.0";

const DOCUMENTOS_LOJISTA = [
  "termos_uso",
  "politica_privacidade",
  "termos_lojista",
] as const;

function somenteNumeros(valor: string) {
  return valor.replace(/\D/g, "");
}

function todosDigitosIguais(valor: string) {
  return /^(\d)\1+$/.test(valor);
}

function cpfValido(valor: string) {
  const cpf = somenteNumeros(valor);

  if (cpf.length !== 11 || todosDigitosIguais(cpf)) {
    return false;
  }

  let soma = 0;

  for (let indice = 0; indice < 9; indice += 1) {
    soma += Number(cpf[indice]) * (10 - indice);
  }

  let primeiroDigito = (soma * 10) % 11;

  if (primeiroDigito === 10) {
    primeiroDigito = 0;
  }

  if (primeiroDigito !== Number(cpf[9])) {
    return false;
  }

  soma = 0;

  for (let indice = 0; indice < 10; indice += 1) {
    soma += Number(cpf[indice]) * (11 - indice);
  }

  let segundoDigito = (soma * 10) % 11;

  if (segundoDigito === 10) {
    segundoDigito = 0;
  }

  return segundoDigito === Number(cpf[10]);
}

function calcularDigitoCnpj(base: string, pesos: number[]) {
  const soma = base
    .split("")
    .reduce(
      (total, digito, indice) => total + Number(digito) * pesos[indice],
      0,
    );

  const resto = soma % 11;

  return resto < 2 ? 0 : 11 - resto;
}

function cnpjValido(valor: string) {
  const cnpj = somenteNumeros(valor);

  if (cnpj.length !== 14 || todosDigitosIguais(cnpj)) {
    return false;
  }

  const primeiroDigito = calcularDigitoCnpj(
    cnpj.slice(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  const segundoDigito = calcularDigitoCnpj(
    `${cnpj.slice(0, 12)}${primeiroDigito}`,
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return (
    primeiroDigito === Number(cnpj[12]) && segundoDigito === Number(cnpj[13])
  );
}

function formatarCpf(valor: string) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  return numeros
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

function formatarCnpj(valor: string) {
  const numeros = somenteNumeros(valor).slice(0, 14);

  return numeros
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
}

function formatarDocumento(valor: string, tipoPessoa: TipoPessoa) {
  return tipoPessoa === "pf" ? formatarCpf(valor) : formatarCnpj(valor);
}

function formatarTelefone(valor: string) {
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

export default function CompletarCadastroLojistaPage() {
  const [usuarioId, setUsuarioId] = useState("");
  const [email, setEmail] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>("pf");
  const [documento, setDocumento] = useState("");
  const [nomeRazaoSocial, setNomeRazaoSocial] = useState("");
  const [telefone, setTelefone] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [perfilExistente, setPerfilExistente] = useState(false);

  useEffect(() => {
    async function carregarCadastro() {
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

        const { data: aceites, error: aceitesError } = await supabase
          .from("aceites_legais")
          .select("documento")
          .eq("user_id", user.id)
          .eq("versao", VERSAO_DOCUMENTOS)
          .in("documento", [...DOCUMENTOS_LOJISTA]);

        if (aceitesError) {
          throw aceitesError;
        }

        const documentosAceitos = new Set(
          (aceites || []).map((aceite) => aceite.documento),
        );

        const aceitouTudo = DOCUMENTOS_LOJISTA.every((nomeDocumento) =>
          documentosAceitos.has(nomeDocumento),
        );

        if (!aceitouTudo) {
          window.location.replace("/aceitar-termos");
          return;
        }

        const { data, error: perfilError } = await supabase
          .from("perfis_lojistas")
          .select("user_id, tipo_pessoa, cpf_cnpj, nome_razao_social, telefone")
          .eq("user_id", user.id)
          .maybeSingle();

        if (perfilError) {
          throw perfilError;
        }

        const perfil = data as PerfilLojista | null;

        setUsuarioId(user.id);
        setEmail(user.email || "");

        if (perfil) {
          setPerfilExistente(true);
          setTipoPessoa(perfil.tipo_pessoa);
          setDocumento(formatarDocumento(perfil.cpf_cnpj, perfil.tipo_pessoa));
          setNomeRazaoSocial(perfil.nome_razao_social);
          setTelefone(formatarTelefone(perfil.telefone));
        }
      } catch (error: any) {
        alert(
          "Não foi possível carregar o cadastro: " +
            (error?.message || "erro desconhecido"),
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarCadastro();
  }, []);

  function alterarTipoPessoa(novoTipo: TipoPessoa) {
    if (salvando || novoTipo === tipoPessoa) return;

    setTipoPessoa(novoTipo);
    setDocumento("");
  }

  function validarFormulario() {
    const documentoNumerico = somenteNumeros(documento);
    const telefoneNumerico = somenteNumeros(telefone);

    if (tipoPessoa === "pf" && !cpfValido(documentoNumerico)) {
      alert("Digite um CPF válido.");
      return false;
    }

    if (tipoPessoa === "pj" && !cnpjValido(documentoNumerico)) {
      alert("Digite um CNPJ válido.");
      return false;
    }

    if (nomeRazaoSocial.trim().length < 3) {
      alert(
        tipoPessoa === "pf"
          ? "Digite seu nome completo."
          : "Digite a razão social da empresa.",
      );
      return false;
    }

    if (telefoneNumerico.length < 10 || telefoneNumerico.length > 13) {
      alert("Digite um telefone ou WhatsApp válido, com DDD.");
      return false;
    }

    return true;
  }

  async function salvarCadastro() {
    if (!validarFormulario() || !usuarioId) return;

    setSalvando(true);

    const cadastro: PerfilLojista = {
      user_id: usuarioId,
      tipo_pessoa: tipoPessoa,
      cpf_cnpj: somenteNumeros(documento),
      nome_razao_social: nomeRazaoSocial.trim(),
      telefone: somenteNumeros(telefone),
    };

    const { error } = await supabase.from("perfis_lojistas").upsert(cadastro, {
      onConflict: "user_id",
    });

    if (error) {
      setSalvando(false);

      if (
        error.code === "23505" ||
        error.message.toLowerCase().includes("unique")
      ) {
        alert(
          "Este CPF ou CNPJ já está vinculado a outra conta. Se você acredita que isso é um engano, entre em contato com o VemVer.",
        );
        return;
      }

      alert("Não foi possível salvar o cadastro: " + error.message);
      return;
    }

    alert(
      perfilExistente
        ? "Dados atualizados com sucesso!"
        : "Cadastro do lojista concluído com sucesso!",
    );

    window.location.replace("/lojista");
  }

  async function sair() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
        <div className="rounded-3xl border border-white/10 bg-zinc-900 px-8 py-6 text-center text-zinc-300">
          Carregando cadastro...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white">
      <section className="mx-auto w-full max-w-2xl rounded-[2rem] border border-white/10 bg-zinc-900 p-6 shadow-2xl sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-400/10 text-3xl">
              🪪
            </div>

            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
              Cadastro do lojista
            </p>

            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              {perfilExistente
                ? "Atualizar seus dados"
                : "Complete seu cadastro"}
            </h1>

            <p className="mt-3 max-w-xl leading-7 text-zinc-400">
              Informe os dados do responsável pelo negócio. Eles serão usados
              para identificação, segurança, atendimento e obrigações
              relacionadas aos serviços contratados.
            </p>
          </div>

          <button
            type="button"
            onClick={sair}
            className="shrink-0 rounded-xl border border-red-400/30 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-400/10"
          >
            Sair
          </button>
        </div>

        <div className="mt-7 rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="text-xs text-zinc-500">Conta conectada</p>
          <p className="mt-1 break-all font-bold text-zinc-200">{email}</p>
        </div>

        <div className="mt-7">
          <p className="mb-3 text-sm font-black">Tipo de cadastro</p>

          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-black p-2">
            <button
              type="button"
              disabled={salvando}
              onClick={() => alterarTipoPessoa("pf")}
              className={`rounded-xl px-4 py-4 font-black transition ${
                tipoPessoa === "pf"
                  ? "bg-orange-400 text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              👤 Pessoa física
            </button>

            <button
              type="button"
              disabled={salvando}
              onClick={() => alterarTipoPessoa("pj")}
              className={`rounded-xl px-4 py-4 font-black transition ${
                tipoPessoa === "pj"
                  ? "bg-orange-400 text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              🏢 Pessoa jurídica
            </button>
          </div>
        </div>

        <div className="mt-7 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-black">
              {tipoPessoa === "pf" ? "CPF" : "CNPJ"}
            </span>

            <input
              type="text"
              inputMode="numeric"
              value={documento}
              disabled={salvando}
              onChange={(evento) =>
                setDocumento(formatarDocumento(evento.target.value, tipoPessoa))
              }
              placeholder={
                tipoPessoa === "pf" ? "000.000.000-00" : "00.000.000/0000-00"
              }
              autoComplete="off"
              className="w-full rounded-2xl border border-white/10 bg-black p-4 outline-none transition placeholder:text-zinc-600 focus:border-orange-400/60 disabled:opacity-60"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-black">
              {tipoPessoa === "pf" ? "Nome completo" : "Razão social"}
            </span>

            <input
              type="text"
              value={nomeRazaoSocial}
              disabled={salvando}
              onChange={(evento) => setNomeRazaoSocial(evento.target.value)}
              placeholder={
                tipoPessoa === "pf" ? "Nome do responsável" : "Nome empresarial"
              }
              autoComplete="name"
              className="w-full rounded-2xl border border-white/10 bg-black p-4 outline-none transition placeholder:text-zinc-600 focus:border-orange-400/60 disabled:opacity-60"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-black">
              Telefone ou WhatsApp
            </span>

            <input
              type="tel"
              inputMode="tel"
              value={telefone}
              disabled={salvando}
              onChange={(evento) =>
                setTelefone(formatarTelefone(evento.target.value))
              }
              placeholder="(47) 99999-9999"
              autoComplete="tel"
              className="w-full rounded-2xl border border-white/10 bg-black p-4 outline-none transition placeholder:text-zinc-600 focus:border-orange-400/60 disabled:opacity-60"
            />
          </label>
        </div>

        <div className="mt-7 rounded-2xl border border-green-400/20 bg-green-400/10 p-4 text-sm leading-6 text-green-100">
          <p className="font-black">🔒 Proteção dos seus dados</p>

          <p className="mt-2">
            CPF/CNPJ e telefone não serão exibidos publicamente no anúncio da
            loja. O tratamento seguirá a{" "}
            <a
              href="/privacidade"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-green-300 underline"
            >
              Política de Privacidade
            </a>
            .
          </p>
        </div>

        <button
          type="button"
          onClick={salvarCadastro}
          disabled={salvando}
          className="mt-7 w-full rounded-2xl bg-orange-400 py-4 font-black text-black transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {salvando
            ? "Salvando..."
            : perfilExistente
              ? "Salvar alterações"
              : "Concluir cadastro"}
        </button>

        <p className="mt-5 text-center text-xs leading-5 text-zinc-500">
          Ao concluir, você confirma que os dados informados são verdadeiros e
          que está autorizado a representar o estabelecimento.
        </p>
      </section>
    </main>
  );
}