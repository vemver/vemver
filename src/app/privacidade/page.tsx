import Link from "next/link"

/*
  DOCUMENTO EM DESENVOLVIMENTO

  Antes de publicar:
  1. Substitua os campos entre colchetes pelos dados reais.
  2. Confirme os fornecedores efetivamente utilizados pelo VemVer.
  3. Confirme que os controles descritos existem no sistema.
  4. Faça uma revisão final com profissional especializado em LGPD.
*/

const VERSAO_POLITICA = "1.0"
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

function ItemDados({
  titulo,
  children,
}: {
  titulo: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <h3 className="font-black text-white">
        {titulo}
      </h3>

      <div className="mt-2 text-sm leading-6 text-zinc-400">
        {children}
      </div>
    </div>
  )
}

export default function PoliticaDePrivacidadePage() {
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
              Privacidade e proteção de dados
            </p>

            <h1 className="mt-3 text-4xl font-black sm:text-5xl">
              Política de Privacidade
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
              Esta Política explica como o VemVer coleta, utiliza,
              compartilha, protege e elimina dados pessoais.
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-400">
            <p>
              Versão:{" "}
              <strong className="text-white">
                {VERSAO_POLITICA}
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
          Esta Política deve ser lida com os{" "}
          <Link
            href="/termos"
            className="font-black underline"
          >
            Termos de Uso
          </Link>
          . O VemVer coleta somente os dados necessários para as
          finalidades informadas e solicita consentimento separado
          quando essa for a base legal aplicável.
        </div>

        <div className="mt-10 space-y-10">
          <Secao
            numero="1"
            titulo="Controlador dos dados"
          >
            <p>
              Para as atividades descritas nesta Política, o
              responsável pelas decisões sobre o tratamento de dados
              pessoais é{" "}
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
              Solicitações sobre privacidade e proteção de dados
              poderão ser enviadas para{" "}
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
            titulo="A quem esta Política se aplica"
          >
            <p>
              Esta Política se aplica a visitantes, clientes,
              lojistas, responsáveis por estabelecimentos e demais
              pessoas que utilizem os sites, páginas, sistemas e
              recursos oficiais do VemVer.
            </p>

            <p>
              Sites, aplicativos e serviços de terceiros acessados por
              links do VemVer possuem políticas próprias. Antes de
              fornecer dados a terceiros, o usuário deverá consultar
              as respectivas condições.
            </p>
          </Secao>

          <Secao
            numero="3"
            titulo="Dados que poderão ser coletados"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <ItemDados titulo="Cadastro e autenticação">
                <p>
                  E-mail, tipo de conta, identificador do usuário,
                  registros de confirmação, recuperação de senha e
                  eventos de segurança. A senha é processada pelo
                  sistema de autenticação e não é exibida ao VemVer
                  em formato legível.
                </p>
              </ItemDados>

              <ItemDados titulo="Perfil do lojista">
                <p>
                  Nome ou razão social, CPF ou CNPJ, telefone,
                  vínculo com o estabelecimento e registros de aceite
                  contratual.
                </p>
              </ItemDados>

              <ItemDados titulo="Dados da loja">
                <p>
                  Nome, categoria, descrição, cidade, endereço ou
                  localização comercial, WhatsApp, imagens, produtos,
                  preços, promoções e demais informações publicadas
                  pelo lojista.
                </p>
              </ItemDados>

              <ItemDados titulo="Uso e preferências">
                <p>
                  Buscas, favoritos, avaliações, interações,
                  preferências, páginas acessadas e recursos
                  utilizados, conforme a disponibilidade dessas
                  funcionalidades.
                </p>
              </ItemDados>

              <ItemDados titulo="Localização">
                <p>
                  Quando autorizada no dispositivo, a localização
                  aproximada ou precisa poderá ser utilizada para
                  ordenar lojas por proximidade. A permissão pode ser
                  negada ou revogada nas configurações do navegador.
                </p>
              </ItemDados>

              <ItemDados titulo="Dados técnicos">
                <p>
                  Endereço IP, data e horário, navegador, dispositivo,
                  sistema operacional, identificadores técnicos,
                  registros de erro e eventos necessários à segurança
                  e funcionamento.
                </p>
              </ItemDados>

              <ItemDados titulo="Planos e pagamentos">
                <p>
                  Plano, período, valor, status, identificadores da
                  transação, vencimento, histórico e dados necessários
                  à conciliação. Os dados completos do cartão são
                  processados pelo provedor de pagamento e não devem
                  ser armazenados pelo VemVer.
                </p>
              </ItemDados>

              <ItemDados titulo="Atendimento">
                <p>
                  Conteúdo das solicitações, comunicações, arquivos
                  enviados e informações necessárias para responder,
                  corrigir problemas e registrar providências.
                </p>
              </ItemDados>
            </div>
          </Secao>

          <Secao
            numero="4"
            titulo="Como os dados são coletados"
          >
            <p>Os dados poderão ser obtidos:</p>

            <ul className="list-disc space-y-2 pl-6">
              <li>diretamente do usuário durante o cadastro;</li>
              <li>
                durante a criação e atualização de lojas e produtos;
              </li>
              <li>
                durante a contratação e administração de planos;
              </li>
              <li>
                automaticamente durante o uso da plataforma;
              </li>
              <li>
                mediante autorização do dispositivo, como no uso da
                geolocalização;
              </li>
              <li>
                por fornecedores responsáveis por autenticação,
                hospedagem, pagamento, segurança e comunicação;
              </li>
              <li>
                por fontes públicas legítimas, quando necessário à
                verificação de informações comerciais.
              </li>
            </ul>
          </Secao>

          <Secao
            numero="5"
            titulo="Finalidades do tratamento"
          >
            <p>Os dados poderão ser utilizados para:</p>

            <ul className="list-disc space-y-2 pl-6">
              <li>criar, autenticar e proteger contas;</li>
              <li>recuperar acesso e redefinir senhas;</li>
              <li>
                cadastrar e exibir lojas, produtos e informações
                comerciais;
              </li>
              <li>
                apresentar resultados de busca e ordenar lojas por
                localização ou relevância;
              </li>
              <li>
                disponibilizar favoritos, avaliações, recomendações e
                demais funcionalidades solicitadas;
              </li>
              <li>
                processar planos, pagamentos, vencimentos, avisos e
                períodos de cortesia;
              </li>
              <li>
                prestar atendimento e responder solicitações;
              </li>
              <li>
                prevenir fraude, abuso, acesso indevido e incidentes
                de segurança;
              </li>
              <li>
                cumprir obrigações legais, regulatórias, fiscais e
                ordens de autoridades;
              </li>
              <li>
                defender direitos em procedimentos administrativos,
                judiciais ou extrajudiciais;
              </li>
              <li>
                melhorar desempenho, estabilidade, acessibilidade e
                experiência da plataforma;
              </li>
              <li>
                enviar comunicações operacionais ou, quando
                autorizado, mensagens promocionais.
              </li>
            </ul>
          </Secao>

          <Secao
            numero="6"
            titulo="Bases legais"
          >
            <p>
              O tratamento será realizado com fundamento em uma ou
              mais bases previstas na legislação, conforme cada
              finalidade, incluindo:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                execução de contrato ou de procedimentos solicitados
                pelo usuário;
              </li>
              <li>cumprimento de obrigação legal ou regulatória;</li>
              <li>exercício regular de direitos;</li>
              <li>
                legítimo interesse, após avaliação de necessidade,
                proporcionalidade e impacto aos direitos do titular;
              </li>
              <li>prevenção à fraude e segurança do titular;</li>
              <li>
                consentimento livre, informado e destacado, quando
                essa for a base adequada.
              </li>
            </ul>

            <p>
              O aceite dos Termos de Uso não será tratado como
              autorização genérica para qualquer utilização de dados.
            </p>
          </Secao>

          <Secao
            numero="7"
            titulo="Dados públicos e dados privados"
          >
            <p>
              Informações destinadas à divulgação da loja, como nome,
              categoria, descrição, cidade, produtos, preços,
              imagens, telefone comercial e promoções, poderão ficar
              visíveis ao público.
            </p>

            <p>
              CPF, CNPJ cadastral, e-mail de autenticação, registros
              de pagamento, aceites legais e dados de segurança serão
              mantidos em áreas restritas, salvo obrigação legal,
              autorização válida ou necessidade de defesa de direitos.
            </p>

            <p>
              Antes de publicar conteúdo, o usuário deverá evitar
              incluir dados pessoais desnecessários de outras pessoas
              em descrições, imagens ou avaliações.
            </p>
          </Secao>

          <Secao
            numero="8"
            titulo="Compartilhamento com fornecedores"
          >
            <p>
              O VemVer poderá compartilhar somente os dados
              necessários com fornecedores que apoiam a operação da
              plataforma, como:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                Supabase, para banco de dados, autenticação e
                armazenamento;
              </li>
              <li>Vercel, para hospedagem e entrega da aplicação;</li>
              <li>
                Mercado Pago, para criação, processamento e
                confirmação de pagamentos;
              </li>
              <li>
                provedor de e-mail, para confirmações, recuperação de
                senha e comunicações;
              </li>
              <li>
                prestadores de segurança, suporte, monitoramento e
                análise, quando efetivamente contratados.
              </li>
            </ul>

            <p>
              Também poderá haver compartilhamento para cumprimento
              de obrigação legal, ordem de autoridade competente,
              prevenção de fraude ou exercício regular de direitos.
              O VemVer não vende listas de dados pessoais.
            </p>
          </Secao>

          <Secao
            numero="9"
            titulo="Transferência internacional"
          >
            <p>
              Alguns fornecedores de tecnologia poderão armazenar ou
              processar dados fora do Brasil. Nessas situações, o
              VemVer buscará utilizar fornecedores com medidas
              contratuais, técnicas e organizacionais adequadas e
              observar os mecanismos admitidos pela legislação.
            </p>
          </Secao>

          <Secao
            numero="10"
            titulo="Cookies e armazenamento local"
          >
            <p>
              A plataforma poderá utilizar cookies e tecnologias
              semelhantes necessários para manter sessões, proteger
              contas, lembrar preferências e garantir o funcionamento
              dos recursos solicitados.
            </p>

            <p>
              Cookies não essenciais, como os destinados a publicidade
              ou determinadas medições analíticas, somente serão
              utilizados após a implementação de informação e controle
              adequados, quando exigidos.
            </p>

            <p>
              O bloqueio de recursos essenciais pelo navegador poderá
              impedir o funcionamento correto de login e outras áreas
              autenticadas.
            </p>
          </Secao>

          <Secao
            numero="11"
            titulo="Localização do dispositivo"
          >
            <p>
              A geolocalização será solicitada pelo navegador e
              dependerá de autorização do usuário. Sua finalidade
              principal é calcular proximidade e ordenar resultados.
            </p>

            <p>
              O usuário poderá continuar usando os recursos públicos
              sem conceder localização, embora alguns resultados não
              sejam personalizados por distância.
            </p>

            <p>
              O VemVer não deverá manter histórico permanente de
              localização precisa de visitantes sem uma finalidade
              informada e base legal adequada.
            </p>
          </Secao>

          <Secao
            numero="12"
            titulo="Decisões automatizadas e ordenação"
          >
            <p>
              Resultados poderão ser organizados automaticamente com
              base em distância, correspondência com a busca,
              categoria, disponibilidade, qualidade das informações,
              regras de segurança e benefícios previstos em planos.
            </p>

            <p>
              Conteúdos patrocinados ou com prioridade comercial
              deverão ser identificados de forma clara. O usuário
              poderá solicitar informações sobre critérios que afetem
              significativamente seus interesses, quando aplicável.
            </p>
          </Secao>

          <Secao
            numero="13"
            titulo="Prazo de armazenamento"
          >
            <p>
              Os dados serão mantidos pelo tempo necessário para
              cumprir as finalidades informadas, manter a conta,
              executar contratos, prevenir fraudes e cumprir
              obrigações legais.
            </p>

            <p>
              Após o encerramento da conta, determinados registros de
              pagamento, aceite, segurança e relacionamento contratual
              poderão ser preservados pelos prazos legais aplicáveis
              ou enquanto necessários ao exercício regular de
              direitos.
            </p>

            <p>
              Encerrada a necessidade de tratamento, os dados serão
              eliminados, anonimizados ou conservados apenas nas
              hipóteses autorizadas pela legislação.
            </p>
          </Secao>

          <Secao
            numero="14"
            titulo="Direitos do titular"
          >
            <p>
              O titular poderá solicitar, conforme a legislação e a
              situação aplicável:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>confirmação da existência de tratamento;</li>
              <li>acesso aos dados;</li>
              <li>correção de dados incompletos ou desatualizados;</li>
              <li>
                anonimização, bloqueio ou eliminação de dados
                desnecessários ou tratados irregularmente;
              </li>
              <li>portabilidade, quando regulamentada e aplicável;</li>
              <li>informação sobre compartilhamentos;</li>
              <li>
                revogação do consentimento e informação sobre suas
                consequências;
              </li>
              <li>
                revisão de decisões exclusivamente automatizadas,
                quando aplicável;
              </li>
              <li>oposição a tratamento realizado irregularmente;</li>
              <li>exclusão da conta, observadas retenções legais.</li>
            </ul>

            <p>
              Para proteger o titular, o VemVer poderá solicitar
              informações adicionais para confirmar a identidade
              antes de atender determinados pedidos.
            </p>
          </Secao>

          <Secao
            numero="15"
            titulo="Segurança"
          >
            <p>
              O VemVer adotará medidas técnicas e administrativas
              proporcionais aos riscos, incluindo controle de acesso,
              políticas de banco de dados, autenticação, proteção de
              credenciais, registros de eventos, atualização de
              sistemas e restrição de dados privados.
            </p>

            <p>
              Nenhum sistema é completamente imune a incidentes. Caso
              ocorra evento de segurança com risco ou dano relevante,
              serão adotadas medidas de contenção, investigação,
              correção e comunicação exigidas pela legislação.
            </p>

            <p>
              O usuário também deve proteger sua senha, manter seus
              dispositivos seguros e comunicar qualquer suspeita de
              acesso indevido.
            </p>
          </Secao>

          <Secao
            numero="16"
            titulo="Crianças e adolescentes"
          >
            <p>
              As áreas públicas poderão ser consultadas sem criação de
              conta. Entretanto, contas de cliente e lojista serão
              destinadas exclusivamente a pessoas com 18 anos ou
              mais.
            </p>

            <p>
              Caso seja identificada conta criada em desacordo com
              essa regra, o VemVer poderá restringi-la e adotar medidas
              para eliminar ou regularizar os dados, preservadas as
              obrigações legais.
            </p>
          </Secao>

          <Secao
            numero="17"
            titulo="Comunicações e marketing"
          >
            <p>
              E-mails ou mensagens necessários ao funcionamento,
              segurança, recuperação de conta, pagamentos e alterações
              contratuais poderão ser enviados independentemente de
              autorização para publicidade.
            </p>

            <p>
              Mensagens promocionais por e-mail, SMS ou WhatsApp
              dependerão de autorização separada quando aplicável. O
              usuário poderá cancelar essas comunicações de forma
              facilitada.
            </p>
          </Secao>

          <Secao
            numero="18"
            titulo="Alterações desta Política"
          >
            <p>
              Esta Política poderá ser atualizada para refletir
              mudanças legais, operacionais ou tecnológicas. A versão
              e a data de vigência serão informadas nesta página.
            </p>

            <p>
              Mudanças relevantes serão comunicadas por meio adequado
              e, quando necessário, um novo aceite ou consentimento
              será solicitado.
            </p>
          </Secao>

          <Secao
            numero="19"
            titulo="Contato sobre privacidade"
          >
            <p>
              Solicitações relacionadas a dados pessoais deverão ser
              enviadas para{" "}
              <a
                href="mailto:vemverapp@gmail.com"
                className="font-bold text-green-300 underline"
              >
                vemverapp@gmail.com
              </a>
              , com informações suficientes para localizar a conta e
              compreender o pedido.
            </p>
          </Secao>
        </div>

        <footer className="mt-12 border-t border-white/10 pt-8 text-sm leading-6 text-zinc-500">
          <p>
            Política de Privacidade do VemVer — versão{" "}
            {VERSAO_POLITICA}.
          </p>

          <p className="mt-2">
            Última atualização: {DATA_VIGENCIA}.
          </p>
        </footer>
      </article>
    </main>
  )
}