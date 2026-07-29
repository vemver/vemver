import Link from "next/link"

/*
  DOCUMENTO EM DESENVOLVIMENTO

  Antes de publicar:
  1. Substitua os campos entre colchetes pelos dados reais.
  2. Confirme que as regras de planos descritas aqui já estão implementadas.
  3. Faça uma revisão final com advogado especializado em contratos digitais,
     direito do consumidor e proteção de dados.
*/

const VERSAO_TERMOS = "1.0"
const DATA_VIGENCIA = "27 de julho de 2026"

function Secao({
  numero,
  titulo,
  children,
}: {
  numero: string
  titulo: string
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-white/10 pt-8">
      <h2 className="text-2xl font-black text-white">
        {numero}. {titulo}
      </h2>

      <div className="mt-4 space-y-4 leading-7 text-zinc-300">
        {children}
      </div>
    </section>
  )
}

export default function TermosDeUsoPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white sm:px-8">
      <article className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-zinc-900 p-6 shadow-2xl sm:p-10">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-sm font-bold text-green-300 transition hover:text-green-200"
            >
              ← Voltar para o VemVer
            </Link>

            <p className="mt-7 text-xs font-black uppercase tracking-[0.22em] text-green-300">
              Documento legal
            </p>

            <h1 className="mt-3 text-4xl font-black sm:text-5xl">
              Termos de Uso do VemVer
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
              Estes Termos estabelecem as regras para navegação,
              criação de conta e utilização dos recursos disponibilizados
              pelo VemVer.
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-400">
            <p>
              Versão:{" "}
              <strong className="text-white">
                {VERSAO_TERMOS}
              </strong>
            </p>

            <p className="mt-1">
              Vigência:{" "}
              <strong className="text-white">
                {DATA_VIGENCIA}
              </strong>
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-green-400/20 bg-green-400/10 p-5 text-sm leading-6 text-green-100">
          Ao criar uma conta, o usuário declara que leu e concordou
          com estes Termos e com a{" "}
          <Link
            href="/privacidade"
            className="font-black underline"
          >
            Política de Privacidade
          </Link>
          . Lojistas também deverão aceitar os{" "}
          <Link
            href="/termos-lojista"
            className="font-black underline"
          >
            Termos do Lojista
          </Link>
          .
        </div>

        <div className="mt-10 space-y-10">
          <Secao
            numero="1"
            titulo="Identificação do VemVer"
          >
            <p>
              O VemVer é uma plataforma digital de descoberta de
              lojas, serviços e produtos locais, administrada por{" "}
              <strong className="text-white">
                [NOME COMPLETO DO RESPONSÁVEL]
              </strong>
              , inscrito no CPF sob o número{" "}
              <strong className="text-white">
                [CPF DO RESPONSÁVEL]
              </strong>
              , com endereço em{" "}
              <strong className="text-white">
                [ENDEREÇO COMPLETO DO RESPONSÁVEL]
              </strong>
              , Joinville/SC.
            </p>

            <p>
              O canal eletrônico para atendimento, solicitações e
              comunicações é{" "}
              <a
                href="mailto:vemverapp@gmail.com"
                className="font-bold text-green-300 underline"
              >
                vemverapp@gmail.com
              </a>
              .
            </p>
          </Secao>

          <Secao
            numero="2"
            titulo="Finalidade da plataforma"
          >
            <p>
              O VemVer facilita a localização de estabelecimentos,
              serviços e produtos, permitindo que lojistas divulguem
              seus negócios e que visitantes encontrem opções em sua
              cidade.
            </p>

            <p>
              Salvo quando expressamente informado, o VemVer não é o
              vendedor dos produtos anunciados, não define preços,
              não administra estoque e não participa da contratação
              realizada diretamente entre cliente e lojista.
            </p>

            <p>
              Cada lojista permanece responsável pela veracidade de
              suas informações, qualidade dos produtos ou serviços,
              preços, ofertas, disponibilidade, entrega, garantias,
              atendimento e cumprimento da legislação aplicável ao
              próprio negócio.
            </p>
          </Secao>

          <Secao
            numero="3"
            titulo="Idade mínima e capacidade"
          >
            <p>
              A navegação pelas áreas públicas do VemVer é permitida
              independentemente da criação de conta.
            </p>

            <p>
              A criação de conta de cliente ou lojista é permitida
              somente para pessoas com 18 anos ou mais e plenamente
              capazes de praticar os atos da vida civil.
            </p>

            <p>
              Pessoas menores de 18 anos poderão consultar o conteúdo
              público, mas não deverão criar conta, publicar
              avaliações, cadastrar lojas ou contratar planos.
            </p>
          </Secao>

          <Secao
            numero="4"
            titulo="Cadastro e segurança da conta"
          >
            <p>
              O usuário deverá fornecer informações verdadeiras,
              completas e atualizadas. Não é permitido criar conta em
              nome de outra pessoa, utilizar identidade falsa ou
              fornecer documento sem autorização.
            </p>

            <p>
              O acesso é pessoal e protegido por senha. O usuário deve
              utilizar senha segura, mantê-la em sigilo e comunicar
              imediatamente qualquer suspeita de acesso não
              autorizado.
            </p>

            <p>
              O VemVer poderá disponibilizar recuperação de senha por
              e-mail ou por outros meios de segurança previamente
              confirmados. Nunca solicitaremos o envio da senha
              completa por e-mail, WhatsApp ou atendimento.
            </p>

            <p>
              Cada usuário é responsável pelas atividades realizadas
              em sua conta até a comunicação de possível uso
              indevido, observadas as responsabilidades legais do
              VemVer.
            </p>
          </Secao>

          <Secao
            numero="5"
            titulo="Contas de cliente"
          >
            <p>
              Clientes poderão utilizar os recursos disponibilizados
              para seu tipo de conta, como salvar favoritos, publicar
              avaliações e receber recomendações, conforme a
              disponibilidade de cada funcionalidade.
            </p>

            <p>
              Avaliações deverão refletir experiências reais, ser
              respeitosas e não poderão conter ameaças, discriminação,
              dados pessoais de terceiros, propaganda indevida,
              conteúdo ilícito ou acusações sabidamente falsas.
            </p>

            <p>
              O VemVer poderá moderar, ocultar ou remover conteúdo que
              viole estes Termos, sem impedir que o autor exerça seus
              direitos pelos canais apropriados.
            </p>
          </Secao>

          <Secao
            numero="6"
            titulo="Contas de lojista"
          >
            <p>
              O lojista deverá aceitar os Termos específicos do
              Lojista, fornecer CPF ou CNPJ válido e declarar possuir
              autorização para representar e divulgar o
              estabelecimento cadastrado.
            </p>

            <p>
              Informações fiscais e cadastrais do responsável serão
              armazenadas em área privada e não serão exibidas
              publicamente, exceto quando houver obrigação legal ou
              autorização válida.
            </p>

            <p>
              As regras de cadastro de lojas, produtos, imagens,
              ofertas, planos, pagamentos e limites estão descritas
              nos Termos do Lojista.
            </p>
          </Secao>

          <Secao
            numero="7"
            titulo="Planos e pagamentos"
          >
            <p>
              Alguns recursos destinados a lojistas dependem da
              contratação de plano pago. Antes da confirmação, serão
              apresentados o plano, período, preço, data de ativação,
              eventual crédito proporcional e novo vencimento.
            </p>

            <p>
              Na versão atual, os pagamentos são avulsos e não existe
              renovação automática. Uma futura renovação automática
              somente poderá ser ativada mediante informação clara e
              autorização específica do contratante.
            </p>

            <p>
              A compra de outro período do mesmo plano preservará o
              tempo vigente e acrescentará o novo período após o
              vencimento atual.
            </p>

            <p>
              Na mudança imediata para plano de maior valor, o saldo
              proporcional do período vigente será considerado como
              crédito, conforme o cálculo exibido antes do pagamento.
              Mudanças para plano de menor valor serão programadas
              para o encerramento do período já pago.
            </p>

            <p>
              Pagamentos poderão ser processados por empresa
              especializada, como o Mercado Pago, sujeitando-se
              também aos termos e políticas do respectivo
              processador.
            </p>
          </Secao>

          <Secao
            numero="8"
            titulo="Direito de arrependimento, cancelamento e reembolso"
          >
            <p>
              Solicitações de cancelamento, arrependimento ou
              reembolso serão analisadas conforme a legislação
              aplicável, as características da contratação e as
              condições apresentadas antes do pagamento.
            </p>

            <p>
              Quando aplicável o direito de arrependimento previsto
              na legislação brasileira, o usuário poderá exercê-lo
              pelo canal de atendimento dentro do prazo legal. Estes
              Termos não afastam direitos que não possam ser
              renunciados pelo consumidor.
            </p>
          </Secao>

          <Secao
            numero="9"
            titulo="Condutas proibidas"
          >
            <p>É proibido utilizar o VemVer para:</p>

            <ul className="list-disc space-y-2 pl-6">
              <li>praticar fraude ou qualquer atividade ilícita;</li>
              <li>
                divulgar produto ou serviço proibido pela legislação;
              </li>
              <li>
                inserir vírus, códigos maliciosos ou tentar acessar
                áreas restritas;
              </li>
              <li>
                coletar dados de outros usuários sem fundamento
                legítimo;
              </li>
              <li>
                copiar, explorar ou automatizar o conteúdo da
                plataforma sem autorização;
              </li>
              <li>
                assediar, ameaçar, discriminar ou prejudicar outras
                pessoas;
              </li>
              <li>
                manipular avaliações, buscas, destaques ou resultados;
              </li>
              <li>
                utilizar várias contas para contornar limites de
                planos, suspensões ou medidas de segurança.
              </li>
            </ul>
          </Secao>

          <Secao
            numero="10"
            titulo="Conteúdo e propriedade intelectual"
          >
            <p>
              A marca VemVer, identidade visual, textos próprios,
              estrutura, software e demais elementos da plataforma
              são protegidos pela legislação aplicável e não poderão
              ser utilizados sem autorização.
            </p>

            <p>
              O usuário permanece titular ou responsável pelo
              conteúdo que enviar. Ao publicá-lo, concede ao VemVer
              autorização não exclusiva, gratuita e limitada ao
              período necessário para armazenar, adaptar tecnicamente
              e exibir esse conteúdo dentro da finalidade da
              plataforma.
            </p>

            <p>
              O usuário declara possuir os direitos ou autorizações
              necessários sobre imagens, marcas, descrições e demais
              materiais publicados.
            </p>
          </Secao>

          <Secao
            numero="11"
            titulo="Privacidade e proteção de dados"
          >
            <p>
              O tratamento de dados pessoais observará a legislação
              aplicável e a Política de Privacidade do VemVer, que
              explica os dados coletados, finalidades, fornecedores,
              prazos de armazenamento, medidas de segurança e
              direitos dos titulares.
            </p>

            <p>
              O aceite destes Termos não representa autorização
              genérica para qualquer utilização de dados. Quando uma
              atividade depender de consentimento específico, ele
              será solicitado de forma separada e destacada.
            </p>
          </Secao>

          <Secao
            numero="12"
            titulo="Disponibilidade e alterações técnicas"
          >
            <p>
              O VemVer buscará manter a plataforma disponível e
              segura, mas poderá realizar manutenções, atualizações,
              correções ou interrupções temporárias.
            </p>

            <p>
              Funcionalidades poderão ser modificadas para melhoria,
              segurança, cumprimento legal ou evolução do serviço,
              preservando os direitos já adquiridos e informando
              alterações relevantes quando necessário.
            </p>
          </Secao>

          <Secao
            numero="13"
            titulo="Suspensão e encerramento"
          >
            <p>
              O VemVer poderá limitar, suspender ou encerrar contas
              em caso de fraude, risco de segurança, ordem legal,
              violação destes Termos ou uso que cause prejuízo à
              plataforma ou a terceiros.
            </p>

            <p>
              Sempre que possível e juridicamente adequado, o usuário
              será informado e poderá apresentar esclarecimentos pelo
              canal de atendimento.
            </p>

            <p>
              O usuário poderá solicitar o encerramento da conta,
              observados os prazos de retenção necessários ao
              cumprimento de obrigações legais, prevenção a fraudes e
              exercício regular de direitos.
            </p>
          </Secao>

          <Secao
            numero="14"
            titulo="Comunicações"
          >
            <p>
              Comunicações operacionais, de segurança, pagamento,
              alteração contratual ou recuperação de conta poderão
              ser enviadas pelos dados de contato cadastrados.
            </p>

            <p>
              Mensagens publicitárias dependerão de autorização
              separada quando exigida e poderão ser canceladas pelo
              usuário de forma facilitada.
            </p>
          </Secao>

          <Secao
            numero="15"
            titulo="Atualizações destes Termos"
          >
            <p>
              Estes Termos poderão ser atualizados. Alterações
              relevantes serão comunicadas por meio adequado e uma
              nova concordância poderá ser solicitada.
            </p>

            <p>
              O sistema registrará a versão aceita, a data, o tipo de
              usuário e a origem do aceite para preservar a
              transparência da relação.
            </p>
          </Secao>

          <Secao
            numero="16"
            titulo="Legislação e solução de conflitos"
          >
            <p>
              Estes Termos serão interpretados de acordo com a
              legislação brasileira.
            </p>

            <p>
              As partes buscarão solucionar eventuais dúvidas ou
              conflitos inicialmente pelo canal de atendimento. Nos
              casos sujeitos à legislação de defesa do consumidor,
              será preservado o foro legalmente competente. Nas
              demais relações, fica indicado o foro de Joinville/SC,
              salvo regra legal obrigatória diferente.
            </p>
          </Secao>

          <Secao
            numero="17"
            titulo="Contato"
          >
            <p>
              Dúvidas, solicitações e comunicações relacionadas a
              estes Termos poderão ser enviadas para{" "}
              <a
                href="mailto:vemverapp@gmail.com"
                className="font-bold text-green-300 underline"
              >
                vemverapp@gmail.com
              </a>
              .
            </p>
          </Secao>
        </div>

        <footer className="mt-12 border-t border-white/10 pt-8 text-sm leading-6 text-zinc-500">
          <p>
            Termos de Uso do VemVer — versão {VERSAO_TERMOS}.
          </p>

          <p className="mt-2">
            Última atualização: {DATA_VIGENCIA}.
          </p>
        </footer>
      </article>
    </main>
  )
}