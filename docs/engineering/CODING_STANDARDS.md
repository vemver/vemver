# VemVer — Padrões Oficiais de Código

## Documento

**Projeto:** VemVer
**Documento:** Padrões Oficiais de Desenvolvimento
**Versão:** 1.0.0
**Status:** Ativo
**Última atualização:** 17/08/2026

---

# 1. Objetivo

Este documento define os padrões de desenvolvimento do VemVer.

Seu objetivo é estabelecer regras para:

- TypeScript;
- React;
- Next.js;
- organização de arquivos;
- nomenclatura;
- componentes;
- APIs;
- validações;
- banco de dados;
- migrations;
- segurança;
- tratamento de erros;
- comentários;
- dependências;
- testes;
- revisão de código;
- prevenção de nova dívida técnica.

A finalidade não é criar burocracia.

A finalidade é permitir que o projeto continue compreensível e sustentável conforme crescer.

---

# 2. Princípio Central

Todo código novo deverá buscar ser:

```text
CORRETO

SIMPLES

LEGÍVEL

SEGURO

TESTÁVEL

RASTREÁVEL

MANUTENÍVEL
```

---

# 3. Clareza Acima de Inteligência Aparente

Preferir código simples e compreensível.

Evitar soluções excessivamente engenhosas que dificultem manutenção.

Exemplo:

```text
CÓDIGO QUE TODOS ENTENDEM
```

é preferível a:

```text
CÓDIGO CURTO MAS DIFÍCIL DE ENTENDER
```

---

# 4. Código é Comunicação

Código não existe apenas para o computador.

Ele também comunica intenção para:

- nós mesmos no futuro;
- outros desenvolvedores;
- revisores;
- novos integrantes da equipe.

---

# 5. Stack Atual

A aplicação utiliza atualmente:

```text
Next.js 16
React 19
TypeScript 5
Tailwind CSS 4
Supabase JS
OpenAI
Mercado Pago
Vercel
```

Novas implementações devem respeitar a arquitetura real do projeto.

---

# 6. Estrutura Principal

A aplicação utiliza:

```text
src/app/
```

como base principal do App Router.

Estrutura conceitual atual:

```text
src/app/
├── api/
├── lib/
├── admin/
├── cliente/
├── lojista/
├── loja/
├── produto/
└── demais rotas
```

---

# 7. Não Reorganizar Apenas por Aparência

A estrutura atual não deve ser reorganizada em massa apenas porque outra organização parece mais bonita.

Refactor precisa resolver problema real.

Exemplos:

- duplicação;
- dificuldade de manutenção;
- acoplamento;
- segurança;
- escalabilidade;
- clareza.

---

# 8. Mudanças Incrementais

Preferir:

```text
PEQUENA MUDANÇA
   ↓
TESTE
   ↓
CONFIRMAÇÃO
   ↓
PR
```

em vez de:

```text
REFATORAR METADE DO PROJETO
   ↓
DESCOBRIR DEPOIS O QUE QUEBROU
```

---

# 9. TypeScript

Todo código TypeScript novo deve utilizar tipos claros.

Evitar depender desnecessariamente de:

```ts
any
```

---

# 10. Uso de `any`

`any` pode eliminar parte importante da proteção do TypeScript.

Evitar:

```ts
function salvar(dados: any) {
}
```

Preferir:

```ts
type DadosLoja = {
  nome: string
  cidade: string
}

function salvar(dados: DadosLoja) {
}
```

---

# 11. Quando `any` for Inevitável

Se uma integração externa realmente exigir algo sem tipagem adequada:

- limitar o `any` ao menor trecho possível;
- converter para tipo conhecido rapidamente;
- documentar o motivo quando não for óbvio.

---

# 12. `unknown`

Para valores externos desconhecidos, preferir considerar:

```ts
unknown
```

antes de validá-los.

Isso obriga o código a confirmar o tipo antes de utilizar.

---

# 13. Tipos de Entrada Externa

Nunca assumir que um request HTTP respeita TypeScript.

Exemplo:

```ts
type Body = {
  mensagem: string
}
```

não impede alguém de enviar:

```json
{
  "mensagem": 123
}
```

Por isso:

> tipos de compile-time não substituem validação runtime.

---

# 14. Tipos Compartilhados

Quando um mesmo tipo for utilizado em vários pontos de uma mesma funcionalidade, considerar centralizá-lo.

Evitar duplicar estruturas grandes manualmente em diversos arquivos.

---

# 15. Não Abstrair Cedo Demais

Não criar biblioteca genérica apenas porque dois trechos possuem três linhas parecidas.

Abstração deve reduzir complexidade.

Não aumentá-la.

---

# 16. Tipos de Domínio

Tipos relacionados ao domínio devem usar nomes claros.

Exemplo:

```ts
type IntencaoBusca = {
  termoBusca: string
  categoria: string | null
  delivery: boolean | null
  abertoAgora: boolean | null
  pertoDeMim: boolean | null
  preco: "baixo" | "medio" | "alto" | null
}
```

Esse tipo comunica melhor que estruturas genéricas.

---

# 17. Nomes de Variáveis

Variáveis devem representar o que armazenam.

Preferir:

```ts
lojasEncontradas
distanciaKm
usuarioAutenticado
planoAtual
```

Evitar:

```ts
x
data2
coisa
tmp
abc
```

salvo em contextos matemáticos ou loops muito simples.

---

# 18. Nomes Booleanos

Valores booleanos devem parecer perguntas.

Preferir:

```ts
estaAtivo
possuiPermissao
podeEditar
foiAprovado
temCoordenadas
```

Quando o schema já utiliza nomes existentes como:

```text
ativo
premium
patrocinado
```

respeitar o contrato existente.

---

# 19. Nomes de Funções

Funções devem indicar ação.

Exemplos:

```ts
buscarLojas()
calcularDistancia()
entenderIntencao()
moderarTexto()
registrarHistorico()
```

---

# 20. Uma Função, Uma Responsabilidade Principal

Evitar funções responsáveis simultaneamente por:

```text
validar request

buscar banco

processar pagamento

mandar e-mail

alterar plano

renderizar resposta
```

Quando a complexidade justificar, separar responsabilidades.

---

# 21. Funções Pequenas

Funções menores são desejáveis quando melhoram clareza.

Porém:

> não quebrar uma função em dez microfunções apenas por regra estética.

A separação precisa tornar o fluxo mais fácil de entender.

---

# 22. Retorno Antecipado

Quando ajudar a reduzir aninhamento, utilizar retorno antecipado.

Preferir:

```ts
if (!usuario) {
  return respostaNaoAutorizada()
}

if (!podeEditar) {
  return respostaProibida()
}

executarAcao()
```

em vez de múltiplos níveis de `if`.

---

# 23. Evitar Aninhamento Excessivo

Código profundamente aninhado dificulta leitura.

Exemplo a evitar:

```text
if
 └─ if
     └─ if
         └─ if
             └─ lógica
```

---

# 24. Constantes

Valores importantes devem possuir nomes claros.

Exemplo atual:

```ts
const LIMITE_BODY_BYTES = 8_000
```

Preferir isso a espalhar:

```ts
8000
```

por vários pontos do código.

---

# 25. Magic Numbers

Evitar números sem contexto.

Exemplo:

```ts
if (mensagem.length > 300)
```

pode ser aceitável em código muito simples, mas quando o valor representa regra importante, preferir:

```ts
const LIMITE_MENSAGEM = 300
```

---

# 26. Strings de Estado

Estados importantes devem ser tratados cuidadosamente.

Exemplo:

```text
aprovada
em_analise
premium
patrocinado
```

Evitar digitações diferentes em vários arquivos quando puderem causar inconsistência.

---

# 27. Idioma

O projeto utiliza português em grande parte do domínio.

Manter consistência.

Não criar mistura desnecessária como:

```text
buscarStoreData
salvarUserLoja
```

---

# 28. Termos Técnicos

Termos técnicos consolidados podem permanecer em inglês.

Exemplos:

```text
webhook
endpoint
request
response
deploy
build
commit
branch
```

Não é necessário traduzir artificialmente.

---

# 29. Arquivos React

Componentes React devem utilizar extensão:

```text
.tsx
```

quando houver JSX.

Arquivos sem JSX devem preferir:

```text
.ts
```

---

# 30. Componentes

Componentes devem possuir nomes claros em PascalCase.

Exemplo:

```text
FavoritarLoja.tsx
GaleriaProduto.tsx
CardLoja.tsx
```

---

# 31. Componentes Não Devem Concentrar Tudo

Evitar componentes gigantes contendo:

- acesso a banco;
- regras complexas;
- dezenas de estados;
- múltiplos formulários;
- layout inteiro;
- integrações.

Quando necessário, separar por responsabilidade.

---

# 32. Mas Não Fragmentar Demais

Evitar criar um componente novo para cada:

```text
<div>
```

ou:

```text
<span>
```

A divisão deve trazer benefício de:

- reutilização;
- legibilidade;
- isolamento;
- responsabilidade.

---

# 33. Server e Client Components

No App Router, utilizar Client Components somente quando necessário.

Direção:

```text
SERVER POR PADRÃO
```

e:

```text
"use client"
```

quando a funcionalidade realmente exigir recursos do navegador ou estado interativo.

---

# 34. Quando Usar Client Component

Exemplos:

- `useState`;
- `useEffect`;
- eventos de clique;
- APIs do navegador;
- geolocalização;
- interação dinâmica local.

---

# 35. Não Colocar `"use client"` por Reflexo

Marcar toda uma árvore como client-side sem necessidade aumenta:

- JavaScript enviado;
- acoplamento;
- custo de hidratação.

---

# 36. Estado

Estado React deve existir quando representa algo que realmente muda na interface.

Evitar armazenar em estado valores que podem ser derivados diretamente de outros estados ou props.

---

# 37. `useEffect`

Não utilizar `useEffect` como solução universal.

Antes de criar um efeito, perguntar:

> isso realmente é um efeito colateral?

---

# 38. Dependências de `useEffect`

Dependências devem refletir o que o efeito utiliza.

Não remover dependências apenas para silenciar warnings sem compreender a consequência.

---

# 39. Fetch

Chamadas devem ser realizadas na camada adequada.

Não mover automaticamente toda consulta para o navegador.

Considerar:

- segurança;
- segredo;
- cache;
- autenticação;
- performance.

---

# 40. Backend para Secrets

Qualquer operação que utilize:

```text
OPENAI_API_KEY

SUPABASE_SERVICE_ROLE_KEY

CRON_SECRET

credenciais privadas do Mercado Pago
```

deve permanecer server-side.

---

# 41. APIs

As APIs estão localizadas em:

```text
src/app/api/
```

usando Route Handlers.

---

# 42. Nome de Route Handler

O arquivo padrão é:

```text
route.ts
```

Exemplo:

```text
src/app/api/moderar-texto/route.ts
```

---

# 43. Métodos HTTP

Exportar somente os métodos necessários.

Exemplo:

```ts
export async function POST() {
}
```

Não criar GET, POST, PUT e DELETE sem necessidade.

---

# 44. Ordem de Processamento de API

Quando aplicável:

```text
1. método

2. Content-Type

3. tamanho

4. parsing

5. validação dos campos

6. autenticação

7. autorização

8. regra de negócio

9. banco / serviço externo

10. resposta
```

---

# 45. Validação antes de Operação Cara

Seguir o padrão já consolidado nas APIs de IA:

```text
VALIDAR PRIMEIRO
      ↓
CHAMAR SERVIÇO DEPOIS
```

---

# 46. Content-Type

Rotas JSON devem validar:

```text
application/json
```

quando necessário.

---

# 47. Limites de Body

Endpoints públicos devem considerar limite de tamanho.

Não aceitar payload arbitrariamente grande por padrão.

---

# 48. Limites de Texto

Campos textuais públicos devem possuir limites coerentes.

Exemplos atuais:

```text
busca:
300 caracteres

moderação:
2.000 caracteres
```

---

# 49. Parsing

JSON malformado deve produzir erro de entrada.

Não deve cair como:

```text
500
```

---

# 50. Status HTTP

Utilizar status coerentes.

Exemplos:

```text
200
sucesso

400
entrada inválida

401
não autenticado

403
sem autorização

404
não encontrado

413
body grande demais

415
Content-Type incompatível

429
rate limit

500
erro interno
```

---

# 51. Mensagens de Erro

O cliente precisa de mensagens úteis, mas não de detalhes internos.

Nunca enviar deliberadamente:

- stack;
- query;
- token;
- secret;
- caminho interno;
- erro bruto do provedor.

---

# 52. Logs de Erro

Detalhes técnicos podem ser registrados server-side.

Exemplo:

```ts
console.error("Erro ao atualizar score:", erro)
```

desde que o objeto não contenha credenciais ou informações sensíveis indevidas.

---

# 53. `catch`

Evitar:

```ts
catch {
  return sucesso
}
```

Erro não deve ser escondido como sucesso.

---

# 54. Erro Externo

Integrações externas podem falhar.

Tratar explicitamente quando necessário.

Exemplos:

- OpenAI;
- Supabase;
- Mercado Pago.

---

# 55. Segurança

Código novo deve assumir que:

```text
CLIENTE É NÃO CONFIÁVEL
```

---

# 56. IDs

IDs recebidos de requests precisam ser tratados como manipuláveis.

Nunca concluir:

```text
recebi loja_id
→ usuário pode editar
```

---

# 57. Autorização

Operações sensíveis precisam validar:

```text
USUÁRIO
   ↓
POSSUI DIREITO?
```

---

# 58. `user_id`

Não confiar cegamente em `user_id` vindo do body.

Quando possível, derivar identidade da sessão autenticada.

---

# 59. Mass Assignment

Não enviar objeto do cliente diretamente para atualização completa do banco.

Evitar:

```ts
supabase
  .from("lojas")
  .update(body)
```

quando `body` puder conter campos proibidos.

---

# 60. Campos Permitidos

Preferir:

```ts
const dadosPermitidos = {
  nome,
  descricao,
  whatsapp,
}
```

em vez de atualizar tudo que o cliente enviou.

---

# 61. Campos Sensíveis

Campos como:

```text
premium
patrocinado
score
status
user_id
plano
```

não devem ser livremente controláveis pelo lojista.

---

# 62. Banco

O Supabase/PostgreSQL é a fonte persistente principal.

Mudanças de schema devem seguir:

```text
supabase/migrations/
```

---

# 63. Migrations

Nova alteração:

```text
NOVA MIGRATION
```

Não editar migration histórica aplicada.

---

# 64. SQL

SQL deve ser legível.

Preferir formatação clara.

Exemplo:

```sql
select
  id,
  nome,
  cidade
from public.lojas
where ativo = true
  and status = 'aprovada';
```

---

# 65. Evitar `SELECT *`

Quando uma API precisa de poucos campos, selecionar explicitamente o necessário.

Isso reduz:

- tráfego;
- exposição;
- acoplamento.

---

# 66. RPCs

RPC deve ser utilizada quando fizer sentido para:

- lógica de banco;
- consulta especializada;
- operação controlada.

Não transformar toda função simples em RPC.

---

# 67. RPC Privilegiada

Funções privilegiadas devem possuir permissões mínimas.

O frontend não deve chamar diretamente RPC reservada ao servidor.

---

# 68. Service Role

Uso de:

```text
SUPABASE_SERVICE_ROLE_KEY
```

deve permanecer restrito ao backend.

---

# 69. `security definer`

Qualquer função futura usando:

```text
security definer
```

precisa de revisão de segurança específica.

---

# 70. `search_path`

Funções SQL sensíveis devem considerar `search_path` controlado e referências explícitas quando apropriado.

---

# 71. Banco e `NULL`

Não transformar ausência de dado em resposta falsa automaticamente.

Exemplo:

```text
delivery = NULL
```

pode significar:

```text
desconhecido
```

e não:

```text
não faz delivery
```

---

# 72. Integridade

Quando possível, o banco deve ajudar a impedir estados inválidos.

Possíveis ferramentas:

- constraints;
- foreign keys;
- tipos;
- defaults adequados;
- RLS.

---

# 73. Constraints

Adicionar constraints somente depois de verificar se os dados existentes são compatíveis.

---

# 74. Migrations Destrutivas

Antes de:

```text
DROP COLUMN
DROP TABLE
ALTER TYPE
```

avaliar:

- dados;
- dependências;
- rollback;
- código em produção.

---

# 75. OpenAI

A IA deve ser tratada como integração externa.

---

# 76. IA não Controla Regras

OpenAI pode:

- interpretar;
- classificar;
- moderar.

OpenAI não decide:

- autorização;
- pagamento;
- score final;
- propriedade;
- plano;
- status de loja.

---

# 77. Structured Output

Quando a aplicação espera estrutura previsível da IA, preferir saídas estruturadas em vez de parsing frágil de texto livre.

---

# 78. Prompt

Prompts de produção devem possuir finalidade clara.

Evitar prompts gigantes com regras não relacionadas.

---

# 79. Não Inserir Segredos em Prompt

Nunca enviar:

- service role;
- tokens;
- senhas;
- secrets administrativos;

para modelos de IA.

---

# 80. Dados Enviados à IA

Enviar apenas o necessário.

Privacidade deve ser considerada antes de incluir informações de usuários em prompts.

---

# 81. Busca Inteligente

A arquitetura atual segue:

```text
mensagem
   ↓
entenderIntencao()
   ↓
buscarLojas()
```

Manter separação entre:

```text
INTERPRETAR
```

e:

```text
BUSCAR / RANQUEAR
```

---

# 82. Ranking

Relevância textual deve permanecer separada conceitualmente de score comercial.

Não duplicar bônus de:

```text
premium
patrocinado
```

se já estiverem representados no score.

---

# 83. Distância

Distância desconhecida deve permanecer:

```text
null
```

e não ser transformada em:

```text
0
```

---

# 84. Busca sem Acentos

A normalização deve preservar o valor original armazenado.

A busca pode comparar:

```text
acai
```

com:

```text
açaí
```

sem mudar a informação real.

---

# 85. Normalização

Funções de normalização devem ser previsíveis.

Exemplo:

- lowercase;
- remoção de acentos para comparação;
- trim;
- limpeza controlada de pontuação.

---

# 86. Não Destruir Significado

Limpeza textual não deve eliminar palavras importantes sem critério.

A lista de palavras genéricas deve evoluir com testes reais.

---

# 87. Mercado Pago

Código financeiro deve receber revisão especial.

---

# 88. Valores Financeiros

Nunca confiar cegamente em preço vindo do frontend.

O backend deve validar contra fonte confiável.

---

# 89. Webhooks

Webhooks precisam assumir:

```text
EVENTO PODE REPETIR
```

---

# 90. Idempotência

Operações críticas devem ser idempotentes quando necessário.

Especialmente:

- pagamentos;
- ativação de planos;
- webhooks;
- crons.

---

# 91. Crons

Rotas de cron devem permanecer protegidas.

Não depender do caminho:

```text
/api/cron/
```

como mecanismo de segurança.

---

# 92. `CRON_SECRET`

Nunca expor:

```text
CRON_SECRET
```

ao navegador.

---

# 93. Arquivos de Configuração

Arquivos importantes devem ser alterados com cuidado.

Exemplos:

```text
package.json
tsconfig.json
vercel.json
next.config.*
```

Mudanças nesses arquivos podem afetar todo o projeto.

---

# 94. Dependências

Antes de adicionar uma biblioteca, perguntar:

```text
É realmente necessária?

Já temos algo que resolve?

Quanto código adiciona?

Está mantida?

Qual risco?

Qual impacto no bundle?
```

---

# 95. Evitar Dependência para Problema Simples

Não adicionar pacote inteiro para substituir cinco linhas simples e confiáveis de código.

---

# 96. Versões

Atualizações de dependências devem ser intencionais.

Especialmente major versions.

---

# 97. `npm audit fix --force`

Não executar automaticamente:

```text
npm audit fix --force
```

sem analisar breaking changes.

---

# 98. Imports

Imports devem apontar para caminhos reais.

---

# 99. Alias Atual

O `tsconfig` possui:

```text
@/*
```

apontando para:

```text
./src/*
```

---

# 100. Atenção ao Alias

As bibliotecas atuais estão principalmente em:

```text
src/app/lib/
```

Portanto:

```text
@/lib/...
```

não corresponde automaticamente a:

```text
src/app/lib/...
```

na estrutura atual.

Não inventar alias.

---

# 101. Imports Relativos

Enquanto a estrutura permanecer atual, imports relativos podem ser utilizados quando forem mais corretos.

---

# 102. Reorganização de `lib`

Uma futura migração de:

```text
src/app/lib
```

para outra estrutura deve ocorrer somente como refactor planejado.

Não mover arquivos isoladamente sem revisar dependências.

---

# 103. Duplicação Aparente

Existem componentes que aparentam duplicação.

Nunca excluir apenas pelo nome.

Processo:

```text
LOCALIZAR
   ↓
VER IMPORTS
   ↓
VER USO
   ↓
COMPARAR IMPLEMENTAÇÃO
   ↓
TESTAR
   ↓
DECIDIR
```

---

# 104. Arquivos Não Utilizados

Antes de remover arquivo aparentemente inutilizado:

```powershell
git grep "NomeDoArquivo"
```

ou pesquisa equivalente deve ser utilizada quando aplicável.

---

# 105. Código Morto

Código realmente morto deve ser removido quando confirmado.

Não acumular:

```text
// talvez use depois
```

por tempo indefinido.

O Git já preserva histórico.

---

# 106. Comentários

Comentários devem explicar:

```text
POR QUÊ
```

quando o código não deixa isso claro.

---

# 107. Comentário Ruim

Evitar:

```ts
// soma 1
contador += 1
```

---

# 108. Comentário Útil

Exemplo:

```ts
// Mantemos lojas sem coordenadas no resultado porque
// ausência de latitude/longitude não significa irrelevância.
```

---

# 109. TODO

`TODO` pode ser usado temporariamente.

Mas deve ser específico.

Preferir:

```ts
// TODO: adicionar paginação quando a busca passar a retornar mais de 20 resultados.
```

Evitar:

```ts
// TODO: melhorar
```

---

# 110. Logs Temporários

Remover logs de depuração que não possuem valor operacional.

Exemplo:

```ts
console.log("cheguei aqui")
```

não deve ficar indefinidamente em produção.

---

# 111. Logs Úteis

Logs de servidor podem permanecer quando ajudam a diagnosticar operações críticas.

Devem possuir contexto.

---

# 112. Nunca Logar Secrets

Não registrar:

```text
OPENAI_API_KEY

SUPABASE_SERVICE_ROLE_KEY

CRON_SECRET

tokens

senhas
```

---

# 113. CSS e Tailwind

O projeto utiliza Tailwind CSS.

Classes devem permanecer legíveis.

---

# 114. Repetição Visual

Quando um mesmo padrão visual for repetido várias vezes, considerar componente ou token reutilizável.

---

# 115. Design System

A identidade deverá evoluir para utilizar padrões compartilhados para:

- cores;
- espaçamento;
- tipografia;
- bordas;
- estados;
- sombras.

Isso será especialmente importante para tema claro e escuro.

---

# 116. Tema

A futura implementação deverá suportar:

```text
Automático
Claro
Escuro
```

sem duplicar telas.

---

# 117. Tokens de Tema

Direção:

```text
TOKENS
   ↓
COMPONENTES
   ↓
TEMA CLARO / ESCURO
```

Evitar:

```text
HomeClaro.tsx
HomeEscuro.tsx
```

apenas para diferenças visuais.

---

# 118. Cor da Marca

A identidade laranja do VemVer deve continuar reconhecível nos temas.

Acessibilidade e contraste devem ser considerados.

---

# 119. Responsividade

Interfaces web devem considerar:

- desktop;
- tablet;
- celular.

Não desenvolver apenas para a largura atual do monitor.

---

# 120. Mobile First quando fizer Sentido

Fluxos fortemente móveis, como descoberta local, devem receber atenção especial em telas pequenas.

---

# 121. Acessibilidade

Novos componentes devem considerar:

- labels;
- contraste;
- foco;
- teclado;
- textos alternativos;
- semântica.

---

# 122. Botões

Ações devem usar elementos semanticamente adequados.

Preferir:

```html
<button>
```

para ações.

Não usar `div` clicável sem necessidade.

---

# 123. Links

Navegação deve utilizar elementos e recursos adequados de link.

---

# 124. Imagens

Imagens precisam de:

- finalidade;
- tamanho adequado;
- texto alternativo quando aplicável.

---

# 125. Formulários

Campos precisam possuir:

- label;
- validação;
- feedback de erro;
- estado de carregamento quando necessário.

---

# 126. Botão de Envio

Durante operação que não deve repetir:

```text
SALVAR
PAGAR
CRIAR
```

considerar bloquear múltiplos cliques enquanto a requisição estiver em andamento.

---

# 127. Loading

O usuário deve receber feedback quando uma operação demorar perceptivelmente.

---

# 128. Erro Visual

Mensagens de erro devem ser compreensíveis.

Evitar mostrar:

```text
TypeError: Cannot read properties...
```

para usuário final.

---

# 129. Empty State

Listas vazias devem explicar o estado.

Exemplo:

```text
Você ainda não possui favoritos.
```

é melhor que uma tela completamente vazia.

---

# 130. Datas

Datas devem ser tratadas cuidadosamente considerando timezone.

Não realizar cálculo de vencimento baseado apenas em horário local do navegador sem analisar a regra.

---

# 131. Dinheiro

Valores financeiros precisam de cuidado com:

- centavos;
- formatação;
- arredondamento;
- origem confiável.

---

# 132. Números Financeiros

Evitar operações de precisão sensível sem entender comportamento de floating point.

Quando regras financeiras amadurecerem, definir estratégia consistente.

---

# 133. Formatação Brasileira

Na interface brasileira, considerar formatos como:

```text
R$ 49,90
17/08/2026
```

quando apropriado.

Persistência pode utilizar formatos técnicos diferentes.

---

# 134. Slugs

Slugs são identificadores de rota amigáveis.

Não assumir que são imutáveis ou únicos globalmente sem confirmar regra.

---

# 135. IDs Internos

Relacionamentos internos devem preferir IDs estáveis.

---

# 136. Testes

Código novo relevante deve ser testado.

Na fase atual utilizamos principalmente:

```text
TypeScript
build
testes manuais
Preview
Production
```

---

# 137. TypeScript Check

Comando:

```powershell
npx tsc --noEmit
```

---

# 138. Build

Comando:

```powershell
npm run build
```

---

# 139. Desenvolvimento

Quando necessário:

```powershell
npx next dev --webpack
```

---

# 140. Lint Atual

O lint global possui débito técnico legado.

Portanto:

```text
npm run lint
```

não deve ser declarado como totalmente aprovado enquanto os problemas existentes não forem resolvidos.

---

# 141. Regra sobre Lint Novo

Mesmo existindo débito antigo:

> código novo não deve ampliar deliberadamente o problema.

---

# 142. Não Corrigir 100 Arquivos sem Relação

Durante uma feature pequena, não alterar dezenas de arquivos apenas para corrigir lint não relacionado.

Isso aumenta risco e dificulta revisão.

---

# 143. Refactor de Lint

A limpeza global de lint deverá ser tratada como trabalho específico.

---

# 144. Teste Feliz

Não testar apenas:

```text
entrada correta
```

---

# 145. Teste de Erro

Também considerar:

```text
entrada vazia

tipo errado

não autorizado

ID inválido

serviço externo falhando

body grande

requisição repetida
```

---

# 146. API Pública

Toda nova API pública deve ter teste de comportamento inválido.

---

# 147. Banco

Migration precisa ser testada depois de aplicada.

---

# 148. Produção

Feature crítica precisa de validação pós-deploy quando aplicável.

---

# 149. Git

O código deve permanecer rastreável.

---

# 150. Antes de Commit

Executar conforme necessário:

```powershell
git diff --check
git status --short --untracked-files=all
```

---

# 151. Revisar Diff

Antes do commit, verificar se somente arquivos relacionados foram alterados.

---

# 152. Commits

Mensagem deve explicar a mudança.

Exemplos:

```text
feat: adiciona busca inteligente

fix: corrige validação da API

docs: adiciona padrões de desenvolvimento
```

---

# 153. Branches

Mudanças relevantes devem preferir branch própria.

---

# 154. Pull Request

PR deve permitir entender:

- problema;
- solução;
- arquivos;
- testes;
- riscos.

---

# 155. Não Misturar Mudanças

Uma branch de documentação não deve incluir refactor de produção sem motivo.

Uma correção de API não deve incluir redesign inteiro da aplicação por acaso.

---

# 156. Documentação

Nova regra estrutural deve atualizar documentação.

Arquivos relevantes podem incluir:

```text
MASTER_DOCUMENT.md

BUSINESS_RULES.md

ARCHITECTURE.md

DATABASE.md

API.md

SECURITY.md

DEPLOY.md
```

---

# 157. Documentação e Código

Documentação não pode descrever uma feature futura como se já estivesse em produção.

Utilizar termos como:

```text
planejado

futuro

em desenvolvimento

em evolução
```

quando necessário.

---

# 158. Decisões Importantes

Mudanças arquiteturais relevantes devem ser registradas em:

```text
docs/governance/DECISIONS.md
```

---

# 159. Changelog

Mudanças relevantes de versões futuras poderão ser registradas em:

```text
docs/governance/CHANGELOG.md
```

---

# 160. Segurança Durante Desenvolvimento

Não desativar proteção apenas para facilitar teste sem compreender impacto.

Exemplo:

```text
"vou liberar essa RPC para anon porque está dando erro"
```

não é solução aceitável sem análise.

---

# 161. Workaround

Workaround temporário precisa ser explicitamente identificado.

Não deixar solução provisória parecer arquitetura definitiva.

---

# 162. Código Experimental

Código experimental deve permanecer isolado quando possível.

Depois do experimento:

```text
PROMOVER PARA PRODUÇÃO
```

ou:

```text
REMOVER
```

---

# 163. Feature Incompleta

Não expor feature parcialmente implementada como pronta.

Pode utilizar:

- branch;
- feature flag futura;
- rota ainda não ligada;
- status planejado.

---

# 164. Fallback

Fallback deve ser baseado em informação real.

Nunca inventar:

```text
horário
estoque
delivery
preço
```

para evitar tela vazia.

---

# 165. Erro é Melhor que Dado Inventado

Entre:

```text
"informação não disponível"
```

e:

```text
inventar uma informação
```

preferir a primeira.

---

# 166. Performance

Não otimizar sem necessidade medida.

Mas evitar problemas óbvios como:

- query repetida em loop;
- payload enorme;
- carregamento desnecessário;
- dezenas de chamadas iguais.

---

# 167. N+1

Ao carregar listas relacionadas, observar risco de múltiplas consultas repetidas.

Se surgir problema real, consolidar consulta.

---

# 168. Memoização

Não adicionar `useMemo` e `useCallback` em todo componente sem evidência de benefício.

---

# 169. Cache

Cache deve possuir estratégia.

Antes de cachear:

```text
quanto tempo?

o dado muda?

como invalidar?

é específico por usuário?

pode ficar desatualizado?
```

---

# 170. Paginação

Grandes listas devem evoluir para paginação ou carregamento progressivo.

---

# 171. Dados Sensíveis

Buscar somente dados que a interface realmente precisa.

---

# 172. Código Reutilizável

Reutilizar quando existe comportamento realmente compartilhado.

Não forçar compartilhamento entre componentes que apenas parecem semelhantes.

---

# 173. Regra dos Três Casos

Como orientação, quando a mesma lógica relevante aparece repetidamente em vários lugares, considerar abstração.

Não é regra absoluta.

---

# 174. Serviços

Integrações externas devem preferencialmente possuir módulos encapsulados.

Exemplo atual:

```text
src/app/lib/moderacao.ts
```

Isso facilita:

- teste;
- manutenção;
- mudança de provedor;
- tratamento de erro.

---

# 175. Bibliotecas de Domínio

A pasta atual:

```text
src/app/lib/ia/
```

organiza funcionalidades relacionadas à descoberta inteligente.

---

# 176. Separação Atual da IA

Arquivos atuais incluem:

```text
entenderIntencao.ts

buscarLojas.ts

calcularDistancia.ts
```

Essa separação deve ser preservada enquanto continuar refletindo responsabilidades diferentes.

---

# 177. Não Colocar Tudo em `utils.ts`

Evitar um arquivo:

```text
utils.ts
```

com centenas de funções sem relação.

Agrupar por domínio quando fizer sentido.

---

# 178. Utilitário

Função verdadeiramente genérica pode ser utilitária.

Função de negócio deve preferir nome e local do domínio.

---

# 179. Duplicação de Regra

Evitar implementar a mesma regra de negócio:

```text
no frontend
+
na API
+
em outro endpoint
```

de formas diferentes.

A autoridade principal deve estar na camada apropriada.

---

# 180. Frontend Pode Repetir Validação de UX

O frontend pode validar para melhorar experiência.

Mas:

```text
FRONTEND VALIDA
```

não elimina:

```text
BACKEND VALIDA
```

---

# 181. Banco Pode Reforçar Regra

Quando adequado, banco pode reforçar regras através de:

- constraints;
- foreign keys;
- RLS.

---

# 182. Ordem de Autoridade

Conceitualmente:

```text
INTERFACE
→ conveniência

BACKEND
→ regra

BANCO
→ integridade
```

---

# 183. Escalabilidade

Antes de introduzir arquitetura complexa, medir problema real.

Não adicionar:

- microserviços;
- filas;
- Redis;
- Elasticsearch;
- Kafka;

apenas porque são tecnologias comuns em sistemas grandes.

---

# 184. Monólito Bem Estruturado

A arquitetura Next.js atual pode continuar adequada enquanto atender às necessidades.

Um monólito organizado é preferível a múltiplos serviços mal definidos.

---

# 185. Evolução

Separar serviços quando houver motivo claro.

Exemplos futuros:

- carga;
- isolamento;
- equipe;
- segurança;
- processamento especializado.

---

# 186. Compatibilidade Mobile

Regras centrais devem evitar ficar presas exclusivamente a componentes web.

O futuro prevê:

```text
WEB
+
APP CLIENTE
+
APP LOJISTA
```

utilizando regras centrais compatíveis quando aplicável.

---

# 187. Design para APIs Reutilizáveis

Quando uma regra futuramente atender web e mobile, preferir centralizá-la no backend.

---

# 188. Não Antecipar o App Demais

A possibilidade de aplicativo futuro não justifica reconstruir toda arquitetura hoje.

Preparar sem superdimensionar.

---

# 189. Segurança Mobile

Nunca colocar secrets administrativos dentro do futuro aplicativo.

Aplicativo instalado continua sendo cliente não confiável.

---

# 190. Tratamento de Datas Futuro

À medida que horários e "aberto agora" forem implementados, criar uma estratégia única para:

- timezone;
- dias;
- exceções;
- feriados.

Evitar lógica independente em cada componente.

---

# 191. Localização

Geolocalização deve possuir módulo ou regra clara.

Não duplicar fórmula geográfica em várias páginas.

---

# 192. Cálculo de Distância

A função atual:

```text
calcularDistancia.ts
```

é a autoridade do cálculo utilizado pela descoberta.

---

# 193. Fórmulas Importantes

Fórmulas como score devem possuir:

- implementação única;
- documentação;
- migration quando banco;
- testes.

---

# 194. Mudança de Score

Não alterar pesos silenciosamente.

Atualizar:

```text
DATABASE.md
BUSINESS_RULES.md
DECISIONS.md
```

quando a alteração for relevante.

---

# 195. Observabilidade

Novo código crítico deve considerar como saberemos quando falhar.

Pergunta:

> se isso quebrar em produção, como descobriremos?

---

# 196. Eventos Importantes

Não depender apenas de `console.log` para histórico comercial.

Exemplo:

```text
ativação de assinatura
```

pode necessitar histórico persistente.

---

# 197. Mensagens de Usuário

Textos de interface devem ser objetivos.

Evitar mensagens técnicas.

---

# 198. Erro para Usuário

Preferir:

```text
Não foi possível concluir a operação. Tente novamente.
```

em vez de:

```text
RPC returned PGRST...
```

---

# 199. Código de Erro Interno

Futuramente, operações complexas poderão utilizar códigos internos de erro para suporte.

Não é necessário criar sistema complexo antes da necessidade.

---

# 200. Organização Antes de Feature

Antes de implementar feature grande:

```text
entender regra

identificar banco

definir API

definir interface

definir teste
```

---

# 201. Seguir Constituição

Fluxo oficial:

```text
IDEIA
  ↓
ANÁLISE
  ↓
ARQUITETURA
  ↓
BANCO
  ↓
API
  ↓
INTERFACE
  ↓
TESTES
  ↓
DOCUMENTAÇÃO
  ↓
CONCLUÍDO
```

---

# 202. Definition of Done Técnica

Uma alteração relevante deve possuir, conforme aplicável:

```text
[ ] código implementado

[ ] tipos corretos

[ ] entradas validadas

[ ] autorização revisada

[ ] secrets protegidos

[ ] banco versionado

[ ] erro tratado

[ ] TypeScript verificado

[ ] build verificado

[ ] teste realizado

[ ] documentação atualizada

[ ] diff revisado
```

---

# 203. Checklist de Novo Componente

```text
[ ] responsabilidade clara

[ ] nome claro

[ ] precisa ser client component?

[ ] props tipadas

[ ] estados necessários

[ ] loading tratado

[ ] erro tratado

[ ] responsivo

[ ] acessibilidade básica
```

---

# 204. Checklist de Nova API

```text
[ ] método definido

[ ] body limitado

[ ] Content-Type validado

[ ] parsing seguro

[ ] campos validados

[ ] autenticação revisada

[ ] autorização revisada

[ ] IDs considerados manipuláveis

[ ] secrets protegidos

[ ] erros seguros

[ ] rate limit avaliado

[ ] testes realizados
```

---

# 205. Checklist de Banco

```text
[ ] schema real revisado

[ ] migration criada

[ ] dados existentes considerados

[ ] permissões revisadas

[ ] RLS revisada

[ ] RPC revisada

[ ] índices avaliados

[ ] migration testada

[ ] documentação atualizada
```

---

# 206. Checklist de Integração Externa

```text
[ ] secret server-side

[ ] dados enviados revisados

[ ] custo conhecido

[ ] erro tratado

[ ] timeout considerado

[ ] retry analisado

[ ] idempotência analisada

[ ] documentação atualizada
```

---

# 207. Checklist Antes de Excluir Código

```text
[ ] busca por referências

[ ] imports verificados

[ ] rotas verificadas

[ ] build/teste realizado

[ ] não existe uso indireto

[ ] histórico Git preserva versão anterior
```

---

# 208. Checklist Antes de Refactor Grande

```text
[ ] problema real identificado

[ ] escopo definido

[ ] comportamento atual conhecido

[ ] testes disponíveis

[ ] mudança pode ser incremental?

[ ] dependências mapeadas

[ ] rollback possível
```

---

# 209. Não Fazer

Evitar:

- código sem tipos sem necessidade;
- secrets no frontend;
- regras financeiras no cliente;
- duplicação de regra;
- função gigante sem necessidade;
- abstração prematura;
- refactor fora do escopo;
- endpoint temporário abandonado;
- migration antiga editada;
- `service_role` pública;
- `SELECT *` indiscriminado;
- erro bruto ao usuário;
- dado inventado;
- dependência desnecessária;
- commit com arquivo aleatório.

---

# 210. Dívida Técnica

Dívida técnica deve ser reconhecida.

Não esconder problemas conhecidos.

Exemplo atual:

```text
lint global possui erros legados
```

---

# 211. Não Aumentar Dívida sem Motivo

Pode haver situações onde uma solução temporária é necessária.

Quando ocorrer:

- registrar;
- limitar impacto;
- criar caminho de correção.

---

# 212. Prioridade de Correção

Dívida técnica deve ser priorizada por:

```text
RISCO

IMPACTO

FREQUÊNCIA

CUSTO FUTURO
```

e não apenas por estética.

---

# 213. Segurança Tem Prioridade Alta

Débito relacionado a:

- autorização;
- pagamento;
- secrets;
- banco;

possui prioridade maior que pequenas questões cosméticas.

---

# 214. Código Legado

Código antigo não deve ser tratado automaticamente como ruim.

Antes de alterar:

> compreender por que funciona.

---

# 215. Documentar Descobertas

Quando uma auditoria revelar comportamento importante, atualizar os documentos oficiais.

Isso evita precisar redescobrir o mesmo conhecimento meses depois.

---

# 216. Revisão

Toda mudança importante deve ser revisável por outra pessoa.

Código excessivamente complexo dificulta esse processo.

---

# 217. Pergunta de Revisão

Ao revisar uma mudança:

```text
eu consigo entender
o que mudou
e por que mudou
sem reconstruir mentalmente o projeto inteiro?
```

Se não:

> o escopo pode estar grande demais.

---

# 218. Princípio de Manutenção

Escrevemos código para hoje, mas precisamos conseguir alterá-lo amanhã.

---

# 219. Padrões não são Imutáveis

Este documento pode evoluir.

Porém, mudanças importantes devem ocorrer de maneira intencional.

---

# 220. Nova Convenção

Antes de introduzir nova convenção global:

- justificar;
- verificar impacto;
- atualizar este documento;
- evitar duas convenções concorrentes.

---

# 221. Relação com Outros Documentos

Este documento deve ser lido junto com:

```text
../00_PROJECT_CONSTITUTION.md

../product/MASTER_DOCUMENT.md
../product/PRODUCT_VISION.md
../product/ROADMAP.md
../product/BUSINESS_RULES.md

../architecture/ARCHITECTURE.md
../architecture/DATABASE.md
../architecture/API.md
../architecture/SECURITY.md
../architecture/DEPLOY.md

TEST_PLAN.md
CHECKLIST.md

../governance/DECISIONS.md
../governance/CHANGELOG.md
```

---

# 222. Padrão em Uma Frase

> Código do VemVer deve ser simples de entender, seguro para executar, previsível para testar e fácil de alterar sem quebrar o restante do sistema.

---

# 223. Regra Final

Antes de considerar um código pronto, responder:

```text
Ele resolve o problema correto?

Está na camada correta?

Os nomes estão claros?

Os tipos estão corretos?

Entradas externas são validadas?

A autorização está correta?

Existe secret exposto?

Pode quebrar outro usuário?

Pode afetar dinheiro?

O banco continua consistente?

O erro está tratado?

Foi testado?

O diff está limpo?

A documentação precisa mudar?
```

Se uma dessas respostas críticas estiver indefinida:

> o código ainda não está concluído.

---

# 224. Conclusão

Os padrões do VemVer não existem para tornar o desenvolvimento mais lento.

Eles existem para evitar que velocidade de curto prazo gere problemas de longo prazo.

À medida que a plataforma crescer, teremos:

```text
MAIS CÓDIGO

MAIS USUÁRIOS

MAIS LOJAS

MAIS DADOS

MAIS PAGAMENTOS

MAIS INTEGRAÇÕES

MAIS DESENVOLVEDORES
```

Nesse cenário, consistência deixa de ser preferência e passa a ser requisito.

O princípio permanece:

> construir hoje de forma que possamos continuar evoluindo amanhã.
