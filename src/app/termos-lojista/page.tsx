import Link from "next/link"

/*
  DOCUMENTO EM DESENVOLVIMENTO

  Antes de publicar:
  1. Substitua os campos entre colchetes pelos dados reais.
  2. Confirme que as regras comerciais descritas estão implementadas.
  3. Confirme preços e limites diretamente no catálogo de planos.
  4. Faça revisão final com advogado especializado em contratos
     digitais, direito empresarial, consumidor e proteção de dados.
*/

const VERSAO_TERMOS_LOJISTA = "1.0"
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

function RegraPlano({
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

export default function TermosDoLojistaPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white sm:px-8">
      <article className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-zinc-900 p-6 shadow-2xl sm:p-10">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-sm font-bold text-orange-300 transition hover:text-orange-200"
            >
              ← Voltar para o VemVer
            </Link>

            <p className="mt-7 text-xs font-black uppercase tracking-[0.22em] text-orange-300">
              Condições comerciais
            </p>

            <h1 className="mt-3 text-4xl font-black sm:text-5xl">
              Termos do Lojista
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
              Estas condições regulam o cadastro de negócios,
              publicação de produtos e contratação de planos no
              VemVer.
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-400">
            <p>
              Versão:{" "}
              <strong className="text-white">
                {VERSAO_TERMOS_LOJISTA}
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

        <div className="mt-8 rounded-2xl border border-orange-400/20 bg-orange-400/10 p-5 text-sm leading-6 text-orange-100">
          Estes Termos complementam os{" "}
          <Link
            href="/termos"
            className="font-black underline"
          >
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link
            href="/privacidade"
            className="font-black underline"
          >
            Política de Privacidade
          </Link>
          . Ao cadastrar uma loja ou contratar um plano, o lojista
          declara que leu e concordou com os três documentos.
        </div>

        <div className="mt-10 space-y-10">
          <Secao
            numero="1"
            titulo="Partes e identificação"
          >
            <p>
              Estes Termos são celebrados entre o VemVer, plataforma
              administrada por{" "}
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
              , Joinville/SC, e a pessoa que cria a conta de lojista
              ou representa o estabelecimento cadastrado.
            </p>

            <p>
              O canal oficial para atendimento comercial e
              contratual é{" "}
              <a
                href="mailto:vemverapp@gmail.com"
                className="font-bold text-orange-300 underline"
              >
                vemverapp@gmail.com
              </a>
              .
            </p>
          </Secao>

          <Secao
            numero="2"
            titulo="Requisitos para ser lojista"
          >
            <p>
              A conta de lojista é destinada exclusivamente a pessoas
              com 18 anos ou mais e plenamente capazes de assumir
              obrigações contratuais.
            </p>

            <p>
              O responsável deverá atuar como pessoa física ou estar
              autorizado a representar a pessoa jurídica ou o
              estabelecimento cadastrado.
            </p>

            <p>
              O VemVer poderá solicitar CPF ou CNPJ, nome ou razão
              social, telefone, e-mail, informações do negócio e
              documentos necessários para confirmação cadastral,
              prevenção a fraudes ou cumprimento de obrigação legal.
            </p>

            <p>
              A simples informação de CPF ou CNPJ não significa que o
              estabelecimento foi formalmente auditado, certificado
              ou aprovado por autoridade pública.
            </p>
          </Secao>

          <Secao
            numero="3"
            titulo="Veracidade e atualização cadastral"
          >
            <p>
              O lojista deverá fornecer dados verdadeiros, completos,
              atualizados e compatíveis com sua atividade.
            </p>

            <p>
              Não é permitido utilizar documento de terceiro sem
              autorização, cadastrar estabelecimento inexistente,
              assumir identidade falsa ou criar múltiplas contas para
              contornar limites de plano.
            </p>

            <p>
              Alterações de titularidade, razão social, documento,
              contato ou representação deverão ser comunicadas e
              poderão exigir nova verificação.
            </p>
          </Secao>

          <Secao
            numero="4"
            titulo="Cadastro de lojas e unidades"
          >
            <p>
              Cada loja cadastrada deverá corresponder a negócio
              legítimo sobre o qual o usuário possua autorização de
              administração ou divulgação.
            </p>

            <p>
              O número de lojas permitido dependerá do plano vigente.
              Planos com múltiplas unidades poderão permitir que o
              mesmo responsável administre diferentes filiais,
              observados os limites exibidos no momento da
              contratação.
            </p>

            <p>
              Cada filial poderá exigir informações comerciais ou
              fiscais próprias. O VemVer poderá impedir cadastros
              duplicados ou solicitar comprovação adicional para
              proteger a identidade do estabelecimento.
            </p>
          </Secao>

          <Secao
            numero="5"
            titulo="Responsabilidade pelas informações publicadas"
          >
            <p>O lojista é responsável por manter corretos:</p>

            <ul className="list-disc space-y-2 pl-6">
              <li>nome, categoria, cidade e endereço comercial;</li>
              <li>telefone, WhatsApp e canais de atendimento;</li>
              <li>horários de funcionamento;</li>
              <li>descrições, imagens e marcas utilizadas;</li>
              <li>produtos, serviços, preços e condições de oferta;</li>
              <li>estoque, disponibilidade, entrega e retirada;</li>
              <li>
                garantias, restrições, riscos e informações exigidas
                pela legislação.
              </li>
            </ul>

            <p>
              Informações desatualizadas deverão ser corrigidas assim
              que identificadas. O VemVer poderá sinalizar, ocultar ou
              remover conteúdo enganoso, incompleto, duplicado ou
              incompatível com estes Termos.
            </p>
          </Secao>

          <Secao
            numero="6"
            titulo="Relação com os clientes"
          >
            <p>
              O lojista é responsável pelo atendimento, oferta,
              venda, emissão de documentos fiscais quando aplicável,
              entrega, troca, garantia, suporte e demais obrigações
              relacionadas aos próprios produtos ou serviços.
            </p>

            <p>
              Salvo quando expressamente informado, o VemVer atua como
              plataforma de divulgação e descoberta local e não é
              parte da compra realizada diretamente entre lojista e
              cliente.
            </p>

            <p>
              O lojista deverá respeitar a legislação aplicável ao
              consumidor, à publicidade, à atividade econômica, à
              propriedade intelectual e à proteção de dados.
            </p>
          </Secao>

          <Secao
            numero="7"
            titulo="Produtos e atividades proibidas"
          >
            <p>
              É proibida a divulgação de produtos, serviços ou
              atividades ilícitas, fraudulentas, perigosas ou
              proibidas pela legislação.
            </p>

            <p>Também não será permitido:</p>

            <ul className="list-disc space-y-2 pl-6">
              <li>publicar falsificações ou produtos de origem ilícita;</li>
              <li>
                utilizar imagens, marcas ou conteúdo sem autorização;
              </li>
              <li>fazer alegações enganosas sobre preço ou qualidade;</li>
              <li>
                promover discriminação, violência, fraude ou
                exploração;
              </li>
              <li>
                coletar dados de clientes sem finalidade legítima;
              </li>
              <li>
                manipular avaliações, resultados ou posicionamento;
              </li>
              <li>
                utilizar o VemVer para enviar spam ou mensagens
                abusivas.
              </li>
            </ul>

            <p>
              Produtos sujeitos a regras específicas somente poderão
              ser divulgados quando o lojista possuir todas as
              licenças e autorizações necessárias.
            </p>
          </Secao>

          <Secao
            numero="8"
            titulo="Planos e limites"
          >
            <p>
              O VemVer poderá oferecer plano gratuito e planos pagos
              com diferentes limites e benefícios. As condições
              atualizadas serão apresentadas na tela de contratação.
            </p>

            <p>Os planos poderão variar quanto a:</p>

            <ul className="list-disc space-y-2 pl-6">
              <li>quantidade de lojas;</li>
              <li>quantidade de produtos;</li>
              <li>quantidade de imagens por produto;</li>
              <li>uso de promoções e destaques;</li>
              <li>prioridade ou posição em determinados resultados;</li>
              <li>estatísticas e ferramentas de gestão;</li>
              <li>período mensal, trimestral ou anual.</li>
            </ul>

            <p>
              Antes de confirmar o pagamento, o lojista verá o nome
              do plano, período, preço total, valor mensal equivalente,
              limites, benefícios, data de ativação e vencimento.
            </p>

            <p>
              A contratação de destaque ou prioridade não garante
              número específico de visualizações, contatos, vendas ou
              faturamento.
            </p>
          </Secao>

          <Secao
            numero="9"
            titulo="Pagamentos"
          >
            <p>
              Os pagamentos poderão ser processados pelo Mercado Pago
              ou por outro provedor informado no momento da compra.
            </p>

            <p>
              A ativação ocorrerá somente após a confirmação válida do
              pagamento pelo provedor e pelo sistema do VemVer. A
              criação de uma preferência ou o status pendente não
              representa pagamento aprovado.
            </p>

            <p>
              O lojista deverá conferir plano, período, valor,
              eventual crédito, data de início e vencimento antes de
              concluir.
            </p>

            <p>
              Dados completos de cartão ou credenciais bancárias
              serão processados pelo provedor de pagamento e não
              deverão ser armazenados pelo VemVer.
            </p>
          </Secao>

          <Secao
            numero="10"
            titulo="Ausência de renovação automática"
          >
            <p>
              Na versão atual, os planos são adquiridos por pagamento
              avulso. O VemVer não realizará nova cobrança automática
              no término do período.
            </p>

            <p>
              Caso uma modalidade de renovação automática seja
              oferecida futuramente, ela dependerá de informação
              clara, autorização específica e possibilidade de
              cancelamento.
            </p>
          </Secao>

          <Secao
            numero="11"
            titulo="Renovação e mudança de período"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <RegraPlano titulo="Mesmo plano">
                <p>
                  A compra de novo período do mesmo plano antes do
                  vencimento preservará os dias existentes. O novo
                  período será acrescentado após o vencimento atual.
                </p>
              </RegraPlano>

              <RegraPlano titulo="Mensal para trimestral ou anual">
                <p>
                  O lojista pagará o valor integral do período
                  escolhido, e os novos meses serão adicionados ao
                  final do período já pago, sem perda de dias.
                </p>
              </RegraPlano>
            </div>

            <p>
              O vencimento calculado será exibido antes do
              redirecionamento para o pagamento e registrado na
              transação.
            </p>
          </Secao>

          <Secao
            numero="12"
            titulo="Upgrade para plano de maior valor"
          >
            <p>
              Quando o lojista mudar imediatamente para plano de
              maior valor de referência, o tempo não utilizado do
              plano vigente será convertido em crédito proporcional.
            </p>

            <div className="rounded-2xl border border-green-400/20 bg-green-400/10 p-5 text-green-100">
              <p className="font-black">
                Cálculo do crédito proporcional
              </p>

              <p className="mt-2 text-sm leading-6">
                Crédito = valor efetivamente pago pelo período atual ×
                proporção de tempo restante no momento da solicitação.
              </p>
            </div>

            <p>
              O crédito e o valor final serão calculados pelo servidor
              e apresentados antes do pagamento. O novo plano será
              ativado após a aprovação da diferença.
            </p>

            <p>
              Se o crédito for igual ou superior ao preço da opção
              escolhida, o VemVer poderá solicitar que o lojista
              selecione período compatível ou aguarde o vencimento
              atual. Não haverá saque de crédito ou conversão
              automática em dinheiro, salvo obrigação legal.
            </p>
          </Secao>

          <Secao
            numero="13"
            titulo="Downgrade ou mudança para plano de menor valor"
          >
            <p>
              A mudança para plano de menor valor não encerrará
              antecipadamente os benefícios já pagos. O plano atual
              permanecerá ativo até o vencimento e a mudança será
              programada para essa data.
            </p>

            <p>
              Enquanto a mudança estiver agendada, não haverá
              reembolso proporcional apenas pela solicitação de
              downgrade, preservados os direitos legalmente
              aplicáveis.
            </p>

            <p>
              Antes da efetivação, o sistema deverá informar quais
              recursos e limites serão reduzidos. O lojista será
              responsável por adequar lojas, produtos e imagens aos
              limites do novo plano.
            </p>
          </Secao>

          <Secao
            numero="14"
            titulo="Vencimento, avisos e cortesia"
          >
            <p>
              O VemVer poderá enviar avisos quando faltarem
              aproximadamente 7, 3 e 1 dia para o vencimento. A
              entrega depende de dados de contato válidos e do
              funcionamento dos provedores de comunicação.
            </p>

            <p>
              A ausência ou falha de aviso não altera a data de
              vencimento exibida no painel e registrada na
              contratação.
            </p>

            <p>
              Após o vencimento, o VemVer poderá conceder 3 dias de
              cortesia, mantendo temporariamente os benefícios para
              permitir a renovação.
            </p>

            <p>
              Encerrada a cortesia sem novo pagamento aprovado, a loja
              retornará automaticamente ao plano gratuito e ficará
              sujeita aos respectivos limites.
            </p>

            <p>
              A cortesia é um benefício comercial e poderá ser
              modificada para contratações futuras mediante
              informação prévia, sem redução de período já concedido.
            </p>
          </Secao>

          <Secao
            numero="15"
            titulo="Excesso de produtos ou unidades"
          >
            <p>
              Ao retornar a plano com limites menores, o VemVer poderá
              impedir novos cadastros e solicitar que o lojista
              escolha quais lojas, produtos ou imagens permanecerão
              ativos.
            </p>

            <p>
              Conteúdos acima do limite poderão ficar temporariamente
              ocultos, mas não deverão ser excluídos definitivamente
              sem aviso ou ação prevista no sistema, salvo conteúdo
              ilegal, risco de segurança ou obrigação legal.
            </p>
          </Secao>

          <Secao
            numero="16"
            titulo="Arrependimento, cancelamento e reembolso"
          >
            <p>
              Quando aplicável o direito de arrependimento previsto na
              legislação brasileira, ele poderá ser solicitado pelo
              canal de atendimento dentro do prazo legal.
            </p>

            <p>
              Cancelamentos e reembolsos serão avaliados conforme a
              legislação, o momento da solicitação, o status do
              pagamento e as condições apresentadas antes da
              contratação.
            </p>

            <p>
              Estes Termos não eliminam direitos que não possam ser
              afastados por contrato. Estornos aprovados poderão
              observar os prazos operacionais do meio de pagamento.
            </p>
          </Secao>

          <Secao
            numero="17"
            titulo="Inadimplência, estorno e contestação"
          >
            <p>
              Pagamentos recusados, cancelados, estornados ou objeto
              de contestação poderão impedir a ativação ou provocar a
              suspensão dos benefícios relacionados à transação.
            </p>

            <p>
              O VemVer poderá solicitar esclarecimentos ou documentos
              antes de reativar o plano quando houver indício de
              fraude, chargeback indevido ou inconsistência de
              pagamento.
            </p>
          </Secao>

          <Secao
            numero="18"
            titulo="Promoções, destaque e ordenação"
          >
            <p>
              Recursos de promoção ou destaque deverão respeitar as
              condições apresentadas no plano e a disponibilidade da
              plataforma.
            </p>

            <p>
              A ordenação poderá considerar correspondência com a
              busca, distância, categoria, qualidade cadastral,
              atividade da loja, segurança e prioridade prevista no
              plano.
            </p>

            <p>
              Conteúdo patrocinado ou beneficiado comercialmente
              deverá receber identificação clara quando necessário.
            </p>
          </Secao>

          <Secao
            numero="19"
            titulo="Avaliações e relacionamento com usuários"
          >
            <p>
              O lojista poderá responder ou contestar avaliações pelos
              recursos e canais disponibilizados, sempre de forma
              respeitosa e sem expor dados pessoais do cliente.
            </p>

            <p>
              Divergência de opinião ou avaliação negativa, por si só,
              não garante remoção. Conteúdo poderá ser analisado quando
              houver violação dos Termos, fraude, ameaça, informação
              pessoal indevida ou ordem legal.
            </p>
          </Secao>

          <Secao
            numero="20"
            titulo="Privacidade e dados de clientes"
          >
            <p>
              O lojista somente poderá utilizar dados recebidos por
              meio do VemVer para finalidades legítimas relacionadas
              ao atendimento solicitado.
            </p>

            <p>
              Não é permitido formar listas, vender dados, enviar
              publicidade sem fundamento adequado ou compartilhar
              informações de clientes de forma indevida.
            </p>

            <p>
              Quando o lojista decidir de forma independente como
              utilizar dados de seus próprios clientes, será
              responsável pelo cumprimento das obrigações aplicáveis
              a esse tratamento.
            </p>
          </Secao>

          <Secao
            numero="21"
            titulo="Propriedade intelectual"
          >
            <p>
              O lojista declara possuir direitos ou autorizações sobre
              marcas, fotografias, vídeos, descrições e materiais
              enviados.
            </p>

            <p>
              Ao publicar conteúdo, concede ao VemVer autorização não
              exclusiva, gratuita e limitada ao período necessário
              para armazenar, adaptar tecnicamente e exibir o material
              dentro da finalidade da plataforma.
            </p>

            <p>
              A marca, o software e a identidade visual do VemVer não
              poderão ser copiados ou utilizados sem autorização.
            </p>
          </Secao>

          <Secao
            numero="22"
            titulo="Moderação, suspensão e encerramento"
          >
            <p>
              O VemVer poderá restringir conteúdo, loja ou conta em
              caso de fraude, risco de segurança, pagamento
              inconsistente, ordem legal, atividade proibida ou
              violação destes Termos.
            </p>

            <p>
              Sempre que possível e adequado, o lojista será
              informado e poderá apresentar esclarecimentos.
              Situações urgentes poderão exigir medida imediata.
            </p>

            <p>
              O encerramento da conta não elimina obrigações pendentes
              nem impede a retenção de registros necessários ao
              cumprimento legal e exercício regular de direitos.
            </p>
          </Secao>

          <Secao
            numero="23"
            titulo="Disponibilidade da plataforma"
          >
            <p>
              O VemVer buscará manter o serviço disponível e seguro,
              mas poderá realizar atualizações, manutenções e
              interrupções temporárias.
            </p>

            <p>
              Não é garantido resultado comercial específico,
              posicionamento permanente, quantidade de acessos ou
              ausência total de indisponibilidade.
            </p>
          </Secao>

          <Secao
            numero="24"
            titulo="Alterações das condições"
          >
            <p>
              Regras, limites e preços poderão ser atualizados para
              futuras contratações. Mudanças relevantes serão
              informadas de forma adequada.
            </p>

            <p>
              Períodos já pagos preservarão as condições essenciais
              apresentadas no momento da contratação, salvo exigência
              legal, risco de segurança ou alteração mais favorável ao
              lojista.
            </p>

            <p>
              Quando necessário, uma nova versão destes Termos deverá
              ser aceita antes de nova contratação ou continuidade de
              funcionalidade afetada.
            </p>
          </Secao>

          <Secao
            numero="25"
            titulo="Registro eletrônico do aceite"
          >
            <p>
              O VemVer registrará o identificador do usuário, tipo de
              conta, versão do documento, data, horário e origem do
              aceite.
            </p>

            <p>
              No pagamento, também poderão ser registrados o plano,
              período, valor, crédito, vencimento e versão das
              condições comerciais apresentadas.
            </p>
          </Secao>

          <Secao
            numero="26"
            titulo="Legislação e solução de conflitos"
          >
            <p>
              Estes Termos serão interpretados de acordo com a
              legislação brasileira.
            </p>

            <p>
              As partes buscarão solucionar dúvidas inicialmente pelo
              atendimento. Quando a relação estiver sujeita à
              legislação de defesa do consumidor, será preservado o
              foro legalmente competente. Nas demais situações, fica
              indicado o foro de Joinville/SC, salvo regra obrigatória
              diferente.
            </p>
          </Secao>

          <Secao
            numero="27"
            titulo="Contato"
          >
            <p>
              Solicitações sobre cadastro, planos, pagamentos,
              cancelamentos ou estes Termos deverão ser enviadas para{" "}
              <a
                href="mailto:vemverapp@gmail.com"
                className="font-bold text-orange-300 underline"
              >
                vemverapp@gmail.com
              </a>
              .
            </p>
          </Secao>
        </div>

        <footer className="mt-12 border-t border-white/10 pt-8 text-sm leading-6 text-zinc-500">
          <p>
            Termos do Lojista VemVer — versão{" "}
            {VERSAO_TERMOS_LOJISTA}.
          </p>

          <p className="mt-2">
            Última atualização: {DATA_VIGENCIA}.
          </p>
        </footer>
      </article>
    </main>
  )
}