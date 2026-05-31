"use client"

import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function LojistaPage() {
  const [nome, setNome] = useState("")
  const [categoria, setCategoria] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [cidade, setCidade] = useState("")
  const [descricao, setDescricao] = useState("")
  const [endereco, setEndereco] = useState("")
  const [instagram, setInstagram] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")

  const [imagem, setImagem] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [minhasLojas, setMinhasLojas] = useState<any[]>([])
  const [userId, setUserId] = useState("")
  const [lojaEditando, setLojaEditando] = useState<any | null>(null)

  const [produtos, setProdutos] = useState<any[]>([])
  const [produtoEditando, setProdutoEditando] = useState<any | null>(null)
  const [produtoNome, setProdutoNome] = useState("")
  const [produtoDescricao, setProdutoDescricao] = useState("")
  const [produtoPreco, setProdutoPreco] = useState("")
  const [produtoImagem, setProdutoImagem] = useState<File | null>(null)
  const [produtoLojaId, setProdutoLojaId] = useState("")
  const [uploadingProduto, setUploadingProduto] = useState(false)

  useEffect(() => {
    carregarUsuario()
  }, [])

  async function carregarUsuario() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = "/login"
      return
    }

    setUserId(user.id)
    carregarMinhasLojas(user.id)
    carregarProdutos(user.id)
  }

  async function carregarMinhasLojas(id: string) {
    const { data, error } = await supabase
      .from("lojas")
      .select("*")
      .eq("user_id", id)
      .order("id", { ascending: false })

    if (error) {
      console.log(error)
      return
    }

    setMinhasLojas(data || [])
  }

  async function carregarProdutos(id: string) {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("user_id", id)
      .order("id", { ascending: false })

    if (error) {
      console.log(error)
      return
    }

    setProdutos(data || [])
  }

  function limparFormulario() {
    setNome("")
    setCategoria("")
    setWhatsapp("")
    setCidade("")
    setDescricao("")
    setEndereco("")
    setInstagram("")
    setLatitude("")
    setLongitude("")
    setImagem(null)
    setLojaEditando(null)
  }

  function limparProduto() {
    setProdutoNome("")
    setProdutoDescricao("")
    setProdutoPreco("")
    setProdutoImagem(null)
    setProdutoLojaId("")
    setProdutoEditando(null)
  }

  function editarLoja(loja: any) {
    setLojaEditando(loja)
    setNome(loja.nome || "")
    setCategoria(loja.categoria || "")
    setWhatsapp(loja.whatsapp || "")
    setCidade(loja.cidade || "")
    setDescricao(loja.descricao || "")
    setEndereco(loja.endereco || "")
    setInstagram(loja.instagram || "")
    setLatitude(loja.latitude ? String(loja.latitude) : "")
    setLongitude(loja.longitude ? String(loja.longitude) : "")
    setImagem(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function editarProduto(produto: any) {
    setProdutoEditando(produto)
    setProdutoNome(produto.nome || "")
    setProdutoDescricao(produto.descricao || "")
    setProdutoPreco(produto.preco ? String(produto.preco) : "")
    setProdutoLojaId(produto.loja_id ? String(produto.loja_id) : "")
    setProdutoImagem(null)
    document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth" })
  }

  function usarMinhaLocalizacao() {
    if (!navigator.geolocation) {
      alert("Seu navegador não permite localização")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude))
        setLongitude(String(position.coords.longitude))
        alert("Localização capturada com sucesso!")
      },
      (error) => {
        console.log(error)
        alert("Não foi possível pegar sua localização")
      }
    )
  }

  async function excluirLoja(id: number) {
    const confirmar = confirm("Tem certeza que deseja excluir esta loja?")
    if (!confirmar) return

    const { error } = await supabase.from("lojas").delete().eq("id", id)

    if (error) {
      alert("Erro ao excluir loja")
      console.log(error)
      return
    }

    alert("Loja excluída com sucesso!")
    carregarMinhasLojas(userId)
  }

  async function excluirProduto(id: number) {
    const confirmar = confirm("Tem certeza que deseja excluir este produto?")
    if (!confirmar) return

    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)

    if (error) {
      alert("Erro ao excluir produto")
      console.log(error)
      return
    }

    alert("Produto excluído com sucesso!")
    carregarProdutos(userId)
  }

  async function enviarImagem() {
    if (!imagem) return ""

    setUploading(true)

    const nomeArquivo = `${Date.now()}-${imagem.name}`

    const { error: uploadError } = await supabase.storage
      .from("lojas")
      .upload(nomeArquivo, imagem)

    if (uploadError) {
      setUploading(false)
      alert("Erro ao enviar imagem")
      console.log(uploadError)
      return ""
    }

    const { data } = supabase.storage.from("lojas").getPublicUrl(nomeArquivo)

    setUploading(false)
    return data.publicUrl
  }

  async function enviarImagemProduto() {
    if (!produtoImagem) return ""

    setUploadingProduto(true)

    const nomeArquivo = `produtos/${Date.now()}-${produtoImagem.name}`

    const { error: uploadError } = await supabase.storage
      .from("lojas")
      .upload(nomeArquivo, produtoImagem)

    if (uploadError) {
      setUploadingProduto(false)
      alert("Erro ao enviar imagem do produto")
      console.log(uploadError)
      return ""
    }

    const { data } = supabase.storage.from("lojas").getPublicUrl(nomeArquivo)

    setUploadingProduto(false)
    return data.publicUrl
  }

  async function salvarLoja() {
    if (!userId) {
      alert("Faça login primeiro")
      return
    }

    const novaImagemUrl = await enviarImagem()
    if (imagem && !novaImagemUrl) return

    if (lojaEditando) {
      const { error } = await supabase
        .from("lojas")
        .update({
          nome,
          categoria,
          whatsapp,
          cidade,
          descricao,
          endereco,
          instagram,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          imagem_url: novaImagemUrl || lojaEditando.imagem_url,
        })
        .eq("id", lojaEditando.id)

      if (error) {
        alert("Erro ao atualizar loja")
        console.log(error)
        return
      }

      alert("Loja atualizada com sucesso!")
    } else {
      const { error } = await supabase.from("lojas").insert([
        {
          nome,
          categoria,
          whatsapp,
          cidade,
          descricao,
          endereco,
          instagram,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          premium: false,
          ativo: true,
          user_id: userId,
          imagem_url: novaImagemUrl,
        },
      ])

      if (error) {
        alert("Erro ao salvar loja")
        console.log(error)
        return
      }

      alert("Loja salva com sucesso!")
    }

    limparFormulario()
    carregarMinhasLojas(userId)
  }

  async function salvarProduto() {
    if (!userId) {
      alert("Faça login primeiro")
      return
    }

    if (!produtoLojaId) {
      alert("Escolha uma loja para este produto")
      return
    }

    if (!produtoNome) {
      alert("Digite o nome do produto")
      return
    }

    const novaImagemUrl = await enviarImagemProduto()
    if (produtoImagem && !novaImagemUrl) return

    const precoFormatado = produtoPreco
      ? Number(produtoPreco.replace(",", "."))
      : null

    if (produtoEditando) {
      const { error } = await supabase
        .from("produtos")
        .update({
          nome: produtoNome,
          descricao: produtoDescricao,
          preco: precoFormatado,
          loja_id: Number(produtoLojaId),
          imagem_url: novaImagemUrl || produtoEditando.imagem_url,
        })
        .eq("id", produtoEditando.id)
        .eq("user_id", userId)

      if (error) {
        alert("Erro ao atualizar produto")
        console.log(error)
        return
      }

      alert("Produto atualizado com sucesso!")
    } else {
      const { error } = await supabase.from("produtos").insert([
        {
          nome: produtoNome,
          descricao: produtoDescricao,
          preco: precoFormatado,
          loja_id: Number(produtoLojaId),
          user_id: userId,
          imagem_url: novaImagemUrl,
        },
      ])

      if (error) {
        alert("Erro ao salvar produto")
        console.log(error)
        return
      }

      alert("Produto salvo com sucesso!")
    }

    limparProduto()
    carregarProdutos(userId)
  }

  async function sair() {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-4xl md:text-6xl font-black">
            Painel do Lojista
          </h1>

          <button
            onClick={sair}
            className="rounded-2xl border border-white/20 px-5 py-3 font-bold"
          >
            Sair
          </button>
        </div>

        <p className="mt-6 text-zinc-400 text-lg">
          Cadastre sua empresa, gerencie suas lojas e adicione produtos no VemVer.
        </p>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 space-y-5">
          <h2 className="text-3xl font-black">
            {lojaEditando ? "Editar loja" : "Cadastrar loja"}
          </h2>

          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da loja" className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-6 py-5 text-white outline-none" />
          <input value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Categoria" className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-6 py-5 text-white outline-none" />
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição da loja" className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-6 py-5 text-white outline-none min-h-[140px]" />
          <input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Endereço" className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-6 py-5 text-white outline-none" />
          <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram" className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-6 py-5 text-white outline-none" />
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp" className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-6 py-5 text-white outline-none" />
          <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-6 py-5 text-white outline-none" />

          <button onClick={usarMinhaLocalizacao} className="w-full rounded-2xl border border-green-400/40 bg-green-400/10 px-6 py-5 font-bold text-green-300">
            Usar minha localização atual
          </button>

          <div className="grid gap-4 md:grid-cols-2">
            <input value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="Latitude" className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-6 py-5 text-white outline-none" />
            <input value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="Longitude" className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-6 py-5 text-white outline-none" />
          </div>

          <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) setImagem(e.target.files[0]) }} className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-6 py-5 text-white outline-none" />

          {imagem && <img src={URL.createObjectURL(imagem)} className="h-52 w-full rounded-2xl object-cover" />}

          <button onClick={salvarLoja} disabled={uploading} className="w-full rounded-2xl bg-green-400 py-5 text-black font-black text-lg disabled:opacity-50">
            {uploading ? "Enviando imagem..." : lojaEditando ? "Salvar alterações" : "Salvar loja"}
          </button>

          {lojaEditando && (
            <button onClick={limparFormulario} className="w-full rounded-2xl border border-white/20 py-5 font-black text-lg">
              Cancelar edição
            </button>
          )}
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-black">Minhas lojas</h2>

          <div className="mt-6 grid gap-4">
            {minhasLojas.map((loja) => (
              <div key={loja.id} className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
                {loja.imagem_url && <img src={loja.imagem_url} className="mb-5 h-48 w-full rounded-2xl object-cover" />}

                <h3 className="text-2xl font-black">{loja.nome}</h3>

                <p className="mt-2 text-zinc-400">
                  {loja.categoria} • {loja.cidade}
                </p>

                {loja.latitude && loja.longitude && (
                  <p className="mt-2 text-green-300 text-sm">
                    📍 Localização cadastrada
                  </p>
                )}

                <div className="mt-4 flex gap-3 flex-wrap">
                 <a
  href={`/loja/${loja.id}-${loja.nome
    .toLowerCase()
    .replaceAll(" ", "-")}`}
  className="inline-block rounded-2xl bg-green-400 px-5 py-3 font-bold text-black"
>
  Ver loja
</a>

                  <button onClick={() => editarLoja(loja)} className="rounded-2xl border border-white/20 px-5 py-3 font-bold">
                    Editar
                  </button>

                  <button onClick={() => excluirLoja(loja.id)} className="rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-3 font-bold text-red-300">
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="produtos" className="mt-16 rounded-3xl border border-green-400/20 bg-green-400/5 p-6">
          <h2 className="text-3xl font-black">
            {produtoEditando ? "Editar produto" : "Cadastrar produto"}
          </h2>

          <p className="mt-2 text-zinc-400">
            Adicione produtos ou serviços para aparecerem nas buscas do VemVer.
          </p>

          <div className="mt-8 space-y-5">
            <select value={produtoLojaId} onChange={(e) => setProdutoLojaId(e.target.value)} className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-6 py-5 text-white outline-none">
              <option value="">Escolha a loja</option>
              {minhasLojas.map((loja) => (
                <option key={loja.id} value={loja.id}>
                  {loja.nome}
                </option>
              ))}
            </select>

            <input value={produtoNome} onChange={(e) => setProdutoNome(e.target.value)} placeholder="Nome do produto ou serviço" className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-6 py-5 text-white outline-none" />

            <textarea value={produtoDescricao} onChange={(e) => setProdutoDescricao(e.target.value)} placeholder="Descrição do produto ou serviço" className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-6 py-5 text-white outline-none min-h-[120px]" />

            <input value={produtoPreco} onChange={(e) => setProdutoPreco(e.target.value)} placeholder="Preço. Ex: 29,90" className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-6 py-5 text-white outline-none" />

            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) setProdutoImagem(e.target.files[0]) }} className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-6 py-5 text-white outline-none" />

            {produtoImagem && <img src={URL.createObjectURL(produtoImagem)} className="h-52 w-full rounded-2xl object-cover" />}

            <button onClick={salvarProduto} disabled={uploadingProduto} className="w-full rounded-2xl bg-green-400 py-5 text-black font-black text-lg disabled:opacity-50">
              {uploadingProduto ? "Enviando imagem..." : produtoEditando ? "Salvar alterações do produto" : "Salvar produto"}
            </button>

            {produtoEditando && (
              <button onClick={limparProduto} className="w-full rounded-2xl border border-white/20 py-5 font-black text-lg">
                Cancelar edição do produto
              </button>
            )}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-black">Meus produtos</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {produtos.map((produto) => (
              <div key={produto.id} className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
                {produto.imagem_url && <img src={produto.imagem_url} className="mb-5 h-48 w-full rounded-2xl object-cover" />}

                <h3 className="text-2xl font-black">{produto.nome}</h3>

                {produto.preco && (
                  <p className="mt-2 text-green-300 text-xl font-black">
                    R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
                  </p>
                )}

                {produto.descricao && (
                  <p className="mt-2 text-zinc-400">
                    {produto.descricao}
                  </p>
                )}

                <div className="mt-4 flex gap-3 flex-wrap">
                  <button onClick={() => editarProduto(produto)} className="rounded-2xl border border-white/20 px-5 py-3 font-bold">
                    Editar
                  </button>

                  <button onClick={() => excluirProduto(produto.id)} className="rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-3 font-bold text-red-300">
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}