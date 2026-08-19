# VemVer — Changelog Oficial

## Documento

**Projeto:** VemVer
**Documento:** Histórico Oficial de Mudanças
**Versão do documento:** 1.0.0
**Status:** Ativo
**Início do registro formal:** 17/08/2026
**Última atualização:** 17/08/2026

---

# 1. Objetivo

Este documento registra mudanças relevantes realizadas no VemVer.

Ele deve permitir responder:

> O que mudou no projeto ao longo do tempo?

Enquanto:

```text
DECISIONS.md
```

registra principalmente:

```text
POR QUE UMA DECISÃO FOI TOMADA
```

este arquivo registra:

```text
O QUE MUDOU
```

---

# 2. Escopo

O Changelog deverá registrar alterações relevantes relacionadas a:

- produto;
- frontend;
- backend;
- banco de dados;
- APIs;
- segurança;
- infraestrutura;
- pagamentos;
- busca;
- inteligência artificial;
- planos;
- documentação;
- aplicativos futuros.

---

# 3. O que Não Precisa Entrar

Nem todo commit precisa gerar uma entrada.

Exemplos que normalmente não exigem registro individual:

```text
ajuste pequeno de espaçamento

correção ortográfica simples

renomear variável local

formatação de código

comentário sem mudança funcional
```

O Git continua sendo o histórico detalhado de cada commit.

---

# 4. Changelog não Substitui Git

A relação correta é:

```text
GIT
→ histórico técnico detalhado

CHANGELOG
→ resumo das mudanças relevantes
```

---

# 5. Changelog não Substitui Decisions

```text
CHANGELOG
→ o que mudou?

DECISIONS
→ por que escolhemos isso?
```

Mudanças estratégicas podem aparecer nos dois documentos.

---

# 6. Formato

As novas entradas deverão seguir preferencialmente:

```text
DATA OU VERSÃO

ADICIONADO

ALTERADO

CORRIGIDO

SEGURANÇA

REMOVIDO

DOCUMENTAÇÃO
```

Somente utilizar as categorias necessárias.

---

# 7. Categorias Oficiais

## Adicionado

Nova funcionalidade ou capacidade.

## Alterado

Mudança de comportamento existente.

## Corrigido

Correção de comportamento incorreto.

## Segurança

Melhoria diretamente relacionada à proteção do sistema.

## Removido

Funcionalidade, endpoint ou comportamento retirado.

## Banco

Mudanças relevantes de banco ou migrations.

## Infraestrutura

Mudanças em Vercel, deploy, crons, firewall ou ambientes.

## Documentação

Mudanças estruturais na documentação oficial.

---

# 8. Registro Formal

O Changelog oficial começa em:

```text
17/08/2026
```

Mudanças anteriores poderão ser registradas quando houver evidência confiável através de:

- Git;
- migrations;
- código;
- documentação anterior.

Não devemos inventar datas históricas.

---

# 9. Fonte de Verdade Histórica

Quando houver divergência entre este Changelog e o código:

```text
CÓDIGO
+
MIGRATIONS
+
GIT
```

devem ser auditados.

O Changelog deve então ser corrigido.

---

# [Não publicado]

Esta seção deverá ser utilizada para mudanças relevantes que ainda estão em desenvolvimento e não chegaram à `main`/produção.

Depois da publicação, as entradas deverão ser movidas para uma seção de versão ou data correspondente.

---

## Documentação

### Adicionado

- Estrutura oficial de documentação dividida em:
  - `product/`;
  - `architecture/`;
  - `engineering/`;
  - `governance/`.

- Documento Mestre do produto.

- Visão Oficial do Produto.

- Roadmap oficial.

- Regras de Negócio.

- Arquitetura Oficial.

- Documentação do banco de dados.

- Documentação das APIs.

- Documentação de segurança.

- Documentação de deploy.

- Padrões oficiais de código.

- Plano oficial de testes.

- Checklist oficial de desenvolvimento.

- Registro oficial de decisões.

- Changelog oficial.

### Alterado

- `docs/README.md` passou a funcionar como índice da documentação oficial.

- A documentação passou a distinguir explicitamente:
  - comportamento atual;
  - funcionalidade planejada;
  - funcionalidade futura;
  - funcionalidade em evolução.

### Produto

- Registrada oficialmente a direção de experiência para:
  - App Cliente;
  - App Lojista.

- Registrada oficialmente a futura configuração de aparência:
  - Automático;
  - Claro;
  - Escuro.

- Definido que o modo Automático deverá acompanhar a preferência do dispositivo.

- Definido que o laranja deverá permanecer como elemento principal da identidade visual nos temas claro e escuro.

### Governança

- Registradas decisões arquiteturais e de produto acumuladas até a criação desta documentação.

- Formalizado o princípio de que alterações estruturais devem atualizar a documentação relacionada.

---

# 10. Baseline Técnico Registrado em 17/08/2026

Esta seção registra o estado técnico consolidado conhecido quando o Changelog formal foi criado.

Ela não representa que todas essas funcionalidades foram implementadas exatamente em 17/08/2026.

Representa:

> este era o estado conhecido do VemVer quando passamos a manter um Changelog oficial.

---

## Produto

### Existente / em evolução

- Plataforma web baseada em descoberta local.

- Áreas para consumidor.

- Áreas para lojista.

- Área administrativa.

- Cadastro de lojas.

- Cadastro e visualização de produtos.

- Favoritos.

- Avaliações.

- Histórico do cliente.

- Planos e assinaturas.

- Integração de pagamento.

- Geolocalização.

- Busca inteligente.

- Moderação de conteúdo.

---

## Inteligência Artificial

### Adicionado anteriormente

- Interpretação de intenção através de OpenAI.

- Estrutura de intenção contendo informações como:
  - termo de busca;
  - categoria;
  - delivery;
  - aberto agora;
  - perto de mim;
  - faixa de preço.

- Separação entre:
  - interpretação da intenção;
  - busca das lojas;
  - cálculo de distância.

### Arquitetura consolidada

```text
USUÁRIO
   ↓
BACKEND
   ↓
OPENAI
   ↓
INTENÇÃO
   ↓
BACKEND
   ↓
SUPABASE
```

A OpenAI não possui autoridade direta sobre o banco ou regras críticas.

---

## Busca

### Adicionado anteriormente

- Busca de lojas baseada em nome, categoria e descrição.

- Normalização textual.

- Tratamento de palavras genéricas.

- Cálculo de relevância textual.

- Cálculo de distância geográfica.

- Ranking considerando:
  1. relevância;
  2. distância quando solicitada;
  3. score;
  4. nome como desempate.

- Limite atual de até 20 resultados após o ranking.

### Alterado anteriormente

- Removida a dependência de ordenação comercial precoce que poderia eliminar candidatos relevantes antes do ranking final.

- Score comercial passou a ser utilizado depois da relevância textual.

---

## Busca sem Acentos

### Banco

Foi habilitada a extensão:

```text
unaccent
```

Migration:

```text
20260815222432_habilitar_busca_sem_acentos.sql
```

### Adicionado

Foi criada a RPC:

```text
public.buscar_lojas_sem_acentos(...)
```

Migration:

```text
20260815233344_criar_busca_lojas_sem_acentos.sql
```

### Resultado

Buscas como:

```text
acai
```

podem localizar registros como:

```text
Açaí
```

sem alterar o texto original armazenado.

---

## Geolocalização

### Adicionado anteriormente

- Cálculo de distância através de latitude e longitude.

- Utilização de distância quando a intenção indica proximidade.

### Alterado

Lojas sem coordenadas continuam participando da busca.

Nesse caso:

```text
distanciaKm = null
```

é utilizado para representar:

```text
distância desconhecida
```

---

## Score das Lojas

### Adicionado anteriormente

Função PostgreSQL:

```text
public.atualizar_score_lojas()
```

para atualização do score.

### Fórmula atual consolidada

O score utiliza sinais relacionados a:

- Patrocinado;
- Premium;
- visualizações;
- produtos ativos;
- favoritos;
- avaliações aprovadas.

### Base comercial

```text
Patrocinado
→ 60

senão Premium
→ 30

senão
→ 0
```

Premium e Patrocinado não são acumulados nessa etapa.

---

## Segurança do Score

### Segurança

A execução de:

```text
public.atualizar_score_lojas()
```

foi restringida.

Migration:

```text
20260813002732_restringir_execucao_atualizar_score_lojas.sql
```

A execução foi removida de papéis públicos como:

```text
public
anon
authenticated
```

mantendo o acesso privilegiado necessário ao backend.

---

## Cron de Score

### Adicionado anteriormente

Endpoint:

```text
/api/cron/atualizar-scores
```

Responsável por executar o recálculo de score.

### Infraestrutura

Agendamento registrado em:

```text
vercel.json
```

com expressão:

```text
0 4 * * *
```

### Segurança

Execução protegida por:

```text
CRON_SECRET
```

---

## Cron de Planos

### Adicionado anteriormente

Endpoint:

```text
/api/cron/verificar-planos
```

### Fluxos consolidados

- aviso de 7 dias;
- aviso de 3 dias;
- aviso de 1 dia;
- início de cortesia;
- encerramento de cortesia;
- retorno ao plano gratuito.

### Infraestrutura

Agendamento:

```text
0 3 * * *
```

em:

```text
vercel.json
```

### Segurança — Estado Auditado

No Route Handler atual:

```text
/api/cron/verificar-planos
```

ainda não existe verificação explícita de:

```text
CRON_SECRET
```

A rota executa operações privilegiadas utilizando o backend e, portanto, essa proteção permanece registrada como pendência de segurança.

O cron de score já possui essa validação; o cron de planos ainda precisa recebê-la.

---

## Histórico de Assinaturas

### Adicionado anteriormente

Estrutura para registrar alterações importantes no ciclo de assinatura.

O histórico permite registrar evolução além do estado atual.

---

## Proteção da API de Busca Inteligente

### Segurança

A rota:

```text
POST /api/entender-intencao
```

recebeu validações server-side.

### Limites consolidados

```text
Content-Type:
application/json

Body:
máximo 8.000 bytes

Mensagem:
máximo 300 caracteres

Cidade:
máximo 100 caracteres

UF:
2 letras

Latitude:
-90 até 90

Longitude:
-180 até 180
```

Latitude e longitude precisam ser fornecidas juntas.

### Alterado

A OpenAI passou a ser chamada somente depois das validações.

### Segurança

Erros internos deixaram de ser enviados integralmente ao cliente.

---

## Proteção da API de Moderação

### Segurança

A rota:

```text
POST /api/moderar-texto
```

recebeu validações server-side.

### Limites consolidados

```text
Content-Type:
application/json

Body:
máximo 8.000 bytes

Texto:
máximo 2.000 caracteres
```

### Alterado

O body precisa possuir estrutura JSON válida esperada.

Entradas como:

```text
array
null
texto vazio
tipo incorreto
```

são rejeitadas antes da chamada externa.

### Segurança

Erros internos são tratados com resposta genérica ao cliente.

---

## Endpoint de Teste de Moderação

### Removido

Foi removida a rota:

```text
/api/testar-moderacao
```

### Resultado

Em produção:

```text
404
```

é o comportamento esperado.

### Motivo

Redução de superfície desnecessária de produção.

---

## Firewall da Vercel

### Segurança

Foi configurada regra para proteger APIs que utilizam OpenAI.

Nome registrado:

```text
OpenAI - Rate Limit
```

Rotas:

```text
POST /api/entender-intencao

POST /api/moderar-texto
```

### Configuração

```text
Fixed Window

60 segundos

10 requisições

por IP
```

### Alterado

As duas APIs compartilham o mesmo limite.

### Resultado

Ao ultrapassar o limite:

```text
HTTP 429
Too Many Requests
```

---

## Banco Versionado

### Banco

O Supabase passou a possuir migrations versionadas localmente.

Estrutura:

```text
supabase/migrations/
```

### Baseline

Migration inicial registrada:

```text
20260813000743_remote_schema.sql
```

### Governança

Migrations aplicadas passam a ser preservadas.

Novas alterações devem gerar novas migrations.

---

## Segurança do Banco

### Segurança

RPCs privilegiadas relacionadas à busca e ao score passaram a possuir permissões restritas.

### Princípio Consolidado

```text
CLIENTE
   ↓
API
   ↓
SERVICE ROLE NO SERVIDOR
   ↓
RPC PROTEGIDA
```

quando privilégio elevado for realmente necessário.

---

## Service Role

### Segurança

Consolidada a regra:

```text
SUPABASE_SERVICE_ROLE_KEY
```

deve permanecer exclusivamente server-side.

---

## OpenAI

### Segurança

Consolidada a regra:

```text
OPENAI_API_KEY
```

deve permanecer server-side.

### Arquitetura

A IA é utilizada principalmente para:

- interpretação de intenção;
- moderação.

---

## Mercado Pago

### Existente

Rotas presentes:

```text
/api/mercadopago

/api/webhook/mercadopago
```

### Estado

A integração existe, mas suas regras de:

- autenticação do webhook;
- idempotência;
- transições de estado;
- validação financeira;

ainda deverão receber auditoria aprofundada antes de maior escala comercial.

---

## Deploy

### Infraestrutura

Fluxo consolidado:

```text
BRANCH
   ↓
COMMIT
   ↓
PUSH
   ↓
PULL REQUEST
   ↓
VERCEL PREVIEW
   ↓
VALIDAÇÃO
   ↓
MERGE
   ↓
MAIN
   ↓
PRODUCTION
```

---

## Produção

### Infraestrutura

Domínio principal:

```text
https://vemverapp.com.br
```

### Governança

Deployment marcado como:

```text
Ready
```

não substitui teste funcional pós-deploy quando aplicável.

---

## Preview

### Segurança

Ambientes de Preview utilizam proteção de acesso da Vercel.

Credenciais de bypass são tratadas como secrets.

---

## Validação Técnica

### Engenharia

Comandos consolidados:

```powershell
npx tsc --noEmit
```

e:

```powershell
npm run build
```

para mudanças relevantes.

---

## Lint

### Dívida Técnica

O lint global possui problemas legados.

Portanto, o projeto não considera atualmente:

```text
lint global 100% limpo
```

como estado real.

A correção será realizada progressivamente em trabalho específico.

---

# 11. Histórico de Migrations Conhecido no Baseline

No início formal deste Changelog, o histórico versionado conhecido inclui:

```text
20260813000743_remote_schema.sql

20260813002732_restringir_execucao_atualizar_score_lojas.sql

20260815222432_habilitar_busca_sem_acentos.sql

20260815233344_criar_busca_lojas_sem_acentos.sql
```

Novas migrations deverão ser adicionadas cronologicamente.

---

# 12. Histórico de Documentação

## 17/08/2026 — Documentação Mestra

### Documentação

Criada a nova estrutura:

```text
docs/
├── 00_PROJECT_CONSTITUTION.md
│
├── README.md
│
├── product/
│   ├── MASTER_DOCUMENT.md
│   ├── PRODUCT_VISION.md
│   ├── ROADMAP.md
│   └── BUSINESS_RULES.md
│
├── architecture/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── SECURITY.md
│   └── DEPLOY.md
│
├── engineering/
│   ├── CODING_STANDARDS.md
│   ├── TEST_PLAN.md
│   └── CHECKLIST.md
│
└── governance/
    ├── DECISIONS.md
    └── CHANGELOG.md
```

### Objetivo

Transformar o conhecimento do projeto em documentação persistente e organizada.

---

# 13. Constituição Preservada

O documento:

```text
docs/00_PROJECT_CONSTITUTION.md
```

foi preservado como documento fundamental do projeto.

A nova documentação complementa a Constituição.

Não a substitui.

---

# 14. Visão do Produto Registrada

Foi formalizada a direção estratégica:

> Você não procura. O VemVer encontra para você.

Também foi registrada a visão de longo prazo de tornar o VemVer uma referência em descoberta local.

---

# 15. App Cliente

### Planejado

Foi registrada conceitualmente uma experiência móvel para consumidores contendo áreas como:

- descoberta;
- busca inteligente;
- página da loja;
- favoritos;
- perfil.

O aplicativo ainda faz parte da visão futura.

---

# 16. App Lojista

### Planejado

Foi registrada conceitualmente uma experiência móvel para lojistas contendo áreas como:

- dashboard;
- minha loja;
- produtos;
- promoções;
- planos;
- insights.

O aplicativo ainda faz parte da visão futura.

---

# 17. Aparência

### Planejado

Definidas as futuras opções:

```text
Automático
Claro
Escuro
```

para App Cliente, App Lojista e, quando aplicável, experiência web.

### Arquitetura Planejada

O tema deverá utilizar sistema centralizado de tokens ou variáveis.

Não serão criadas cópias independentes das mesmas telas apenas para mudar cores.

---

# 18. Avaliações

### Planejado / Em evolução

Registrada a direção de UX:

```text
PÁGINA DA LOJA
      ↓
AVALIAR
      ↓
MODAL / SUBABA
      ↓
1–5 ESTRELAS
      ↓
COMENTÁRIO
      ↓
PUBLICAR
```

Futuras evoluções poderão incluir:

- fotos;
- edição;
- exclusão;
- respostas do estabelecimento.

---

# 19. Como Registrar uma Nova Mudança

Quando uma mudança relevante ainda não foi publicada, adicionar em:

```text
# [Não publicado]
```

Exemplo:

```markdown
## Adicionado

- Busca por produtos.
```

Depois da publicação, mover para a seção correspondente.

---

# 20. Exemplo de Entrada por Data

```markdown
# 25/08/2026

## Adicionado

- Horários estruturados das lojas.

## Alterado

- Busca passou a aplicar "aberto agora".

## Banco

- Nova migration para horários de funcionamento.

## Documentação

- DATABASE.md atualizado.
- BUSINESS_RULES.md atualizado.
```

---

# 21. Exemplo de Entrada por Versão

Quando o projeto passar a utilizar releases formais:

```markdown
# [1.2.0] — 25/08/2026

## Adicionado

- Busca por produtos.

## Corrigido

- Ranking de proximidade.

## Segurança

- Nova validação administrativa.
```

---

# 22. Versionamento Futuro

O VemVer poderá futuramente utilizar Semantic Versioning:

```text
MAJOR.MINOR.PATCH
```

Exemplo:

```text
2.4.1
```

Conceitualmente:

```text
MAJOR
→ mudança incompatível importante

MINOR
→ nova funcionalidade compatível

PATCH
→ correção
```

Essa estratégia deverá ser formalizada quando releases numeradas se tornarem necessárias.

---

# 23. Não Inventar Versões Históricas

Não atribuir:

```text
v1.0
v2.0
```

a versões antigas sem registro confiável.

Este Changelog começa formalmente em 17/08/2026.

---

# 24. Nova Feature

Quando uma feature relevante entrar:

registrar:

- o que foi adicionado;
- mudança de regra;
- migration quando houver;
- segurança relevante;
- documentação atualizada.

---

# 25. Correção

Uma correção importante deve registrar:

```text
QUAL PROBLEMA EXISTIA
```

e:

```text
QUAL COMPORTAMENTO PASSOU A EXISTIR
```

Não é necessário incluir detalhes de implementação excessivos.

---

# 26. Segurança

Correções de segurança devem possuir categoria própria:

```text
## Segurança
```

Evitar registrar secrets ou detalhes que criem risco desnecessário.

---

# 27. Banco

Mudanças importantes devem mencionar:

- migration;
- tabela/função afetada;
- comportamento alterado.

Não copiar todo o SQL para o Changelog.

---

# 28. Deploy

Não é necessário registrar todo deployment automático.

Registrar quando existir mudança relevante de:

- plataforma;
- ambiente;
- domínio;
- cron;
- Firewall;
- configuração.

---

# 29. Dependências

Atualizações pequenas de dependências não precisam necessariamente ser registradas.

Mudanças relevantes como:

```text
Next.js major version

React major version

Supabase major change

OpenAI SDK major change
```

podem merecer entrada.

---

# 30. Mudança de Provedor

Trocar:

```text
OpenAI

Supabase

Mercado Pago

Vercel
```

ou adicionar nova infraestrutura crítica deverá gerar entrada de Changelog e, provavelmente, decisão em:

```text
DECISIONS.md
```

---

# 31. Feature Removida

Quando remover algo utilizado:

```markdown
## Removido

- Endpoint X.
```

Se houver motivo arquitetural importante, registrar também em Decisions.

---

# 32. Mudança Planejada não é Mudança Publicada

Não registrar em uma seção de release algo que existe apenas como ideia.

Itens futuros permanecem:

- no Roadmap;
- em Product Vision;
- na seção `[Não publicado]` somente quando estiverem realmente em desenvolvimento.

---

# 33. Roadmap x Changelog

```text
ROADMAP
→ o que pretendemos fazer
```

```text
CHANGELOG
→ o que realmente mudou
```

---

# 34. Product Vision x Changelog

```text
PRODUCT VISION
→ futuro desejado
```

```text
CHANGELOG
→ evolução real
```

---

# 35. Git x Changelog

```text
GIT
→ cada alteração técnica
```

```text
CHANGELOG
→ alterações relevantes para compreender a evolução
```

---

# 36. Decisions x Changelog

Exemplo:

```text
CHANGELOG:
"Busca passou a priorizar relevância antes do score."
```

```text
DECISIONS:
"Escolhemos relevância antes da monetização para preservar confiança."
```

Os documentos se complementam.

---

# 37. Atualização Obrigatória

Antes de fechar uma feature estrutural importante, perguntar:

> Isso deve aparecer no Changelog?

Se sim:

atualizar antes de considerar o trabalho concluído.

---

# 38. Checklist de Changelog

Antes de adicionar entrada:

```text
[ ] A mudança realmente aconteceu?

[ ] Está em produção ou ainda em Não publicado?

[ ] A data é conhecida?

[ ] Não estamos inventando uma versão?

[ ] A categoria está correta?

[ ] A descrição é compreensível?

[ ] Existe migration relevante?

[ ] Existe decisão relevante?

[ ] Existe informação sensível?

[ ] Outros documentos precisam mudar?
```

---

# 39. Informação Sensível

Nunca registrar valores reais de:

```text
OPENAI_API_KEY

SUPABASE_SERVICE_ROLE_KEY

CRON_SECRET

tokens

senhas

credenciais financeiras
```

---

# 40. Histórico não Deve Ser Apagado

Quando uma funcionalidade for substituída:

não apagar sua entrada anterior.

Adicionar a nova mudança.

O objetivo é preservar evolução.

---

# 41. Correção de Entrada Errada

Se uma entrada do Changelog possuir erro factual:

corrigi-la.

O objetivo é preservar histórico real, não preservar erros documentais.

---

# 42. Granularidade

Evitar dois extremos:

```text
DETALHES DE CADA LINHA DE CÓDIGO
```

e:

```text
"várias coisas foram alteradas"
```

A entrada deve ser específica o suficiente para compreender a evolução.

---

# 43. Exemplo Ruim

```text
- Melhorias gerais.
```

Isso não informa quase nada.

---

# 44. Exemplo Melhor

```text
- Busca inteligente passou a remover diferenças de acentuação ao comparar nome, categoria e descrição.
```

---

# 45. Exemplo de Segurança

```text
- APIs de IA passaram a possuir limite compartilhado de 10 requisições por IP a cada 60 segundos no Firewall da Vercel.
```

---

# 46. Exemplo de Banco

```text
- Criada RPC protegida para busca de lojas sem diferenças de acentuação.
```

---

# 47. Exemplo de Remoção

```text
- Removido endpoint público usado anteriormente para teste de moderação.
```

---

# 48. Exemplo de Produto

```text
- Página da loja passou a permitir avaliação através de modal sem abandonar a página.
```

Essa entrada só deverá ser utilizada depois que a funcionalidade realmente for implementada.

---

# 49. Ciclo do Changelog

Fluxo:

```text
FEATURE COMEÇA
      ↓
[Não publicado]
      ↓
TESTES
      ↓
MERGE
      ↓
PRODUÇÃO
      ↓
MOVER PARA DATA / RELEASE
```

---

# 50. Processo Atual sem Releases Numeradas

Enquanto não houver releases formais:

> datas podem ser utilizadas para agrupar mudanças importantes.

---

# 51. Futuro Processo com Releases

Quando houver aplicativos móveis e distribuição por lojas, versões formais provavelmente ganharão mais importância.

Nesse momento, o Changelog poderá migrar progressivamente para entradas como:

```text
[1.0.0]

[1.1.0]

[1.2.0]
```

---

# 52. App Cliente

Quando o App Cliente for lançado, registrar:

- versão;
- plataformas;
- funcionalidades principais;
- requisitos;
- alterações relevantes de API.

---

# 53. App Lojista

O mesmo deverá ocorrer com o App Lojista.

---

# 54. APIs e Compatibilidade Mobile

Quando APIs passarem a atender aplicativos já publicados:

> mudanças incompatíveis deverão receber atenção especial no Changelog.

Usuários podem permanecer em versões antigas do aplicativo.

---

# 55. Banco e Compatibilidade

Migrations que alterarem contratos usados por versões publicadas precisarão ser planejadas cuidadosamente.

---

# 56. Releases Críticas

Mudanças relacionadas a:

- autenticação;
- pagamentos;
- autorização;
- dados;
- exclusões;

devem possuir descrição clara.

---

# 57. Incidentes

Correções importantes após incidente podem ser registradas sem expor informações que aumentem risco.

Exemplo:

```text
## Segurança

- Reforçada autorização de operações administrativas relacionadas a planos.
```

Detalhes aprofundados podem permanecer em documentação interna apropriada.

---

# 58. Dívida Técnica

Não é necessário registrar cada correção de lint.

Porém mudanças estruturais de dívida técnica podem aparecer.

Exemplo:

```text
## Alterado

- Concluída limpeza dos erros legados de lint e ativado lint como requisito obrigatório do CI.
```

quando isso realmente acontecer.

---

# 59. Testes Automatizados

Quando a infraestrutura de testes for adicionada:

```text
## Engenharia

- Adicionada suíte automatizada de testes para busca e ranking.
```

---

# 60. CI

Caso o projeto adote CI obrigatório no futuro:

registrar:

- checks;
- bloqueios de merge;
- testes obrigatórios.

---

# 61. Staging

Se for criado ambiente separado:

```text
## Infraestrutura

- Adicionado ambiente de staging independente da produção.
```

---

# 62. Mudança de Busca

Mudanças relevantes do algoritmo de ranking devem aparecer no Changelog.

Isso ajuda a relacionar alterações futuras de comportamento.

---

# 63. Mudança do Score

Se pesos forem modificados:

registrar de forma resumida.

Os detalhes completos permanecem em:

```text
DATABASE.md
```

e:

```text
DECISIONS.md
```

quando necessário.

---

# 64. Nova Cidade

A entrada em novas cidades poderá ser registrada como marco de produto.

Exemplo futuro:

```text
## Produto

- Operação piloto iniciada em Curitiba/PR.
```

---

# 65. Marco Comercial

Mudanças importantes de monetização poderão ser registradas.

Exemplo:

```text
- Plano Premium liberado oficialmente para contratação.
```

quando isso realmente ocorrer.

---

# 66. Não Registrar Previsão como Fato

Evitar:

```text
"Aplicativo lançado em setembro"
```

se setembro ainda não chegou ou se a publicação não ocorreu.

---

# 67. Relação com Documentos

Este arquivo deve ser lido junto com:

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

../engineering/CODING_STANDARDS.md
../engineering/TEST_PLAN.md
../engineering/CHECKLIST.md

DECISIONS.md
```

---

# 68. Changelog em Uma Frase

> O Changelog do VemVer é a memória resumida de como o produto, o código e a infraestrutura realmente evoluíram.

---

# 69. Regra Final

Ao finalizar uma mudança relevante, perguntar:

```text
O que mudou?

Isso está realmente publicado?

Em qual data?

É produto?

É correção?

É segurança?

É banco?

É infraestrutura?

Foi removido algo?

Existe uma DEC relacionada?

Existe uma migration relacionada?

A documentação relacionada está atualizada?
```

---

# 70. Conclusão

A partir de 17/08/2026, o VemVer passa a possuir um Changelog formal.

Antes disso, grande parte do histórico existe principalmente em:

```text
GIT

CÓDIGO

MIGRATIONS

DOCUMENTOS ANTERIORES
```

A partir deste marco, mudanças relevantes deverão ser registradas de forma mais sistemática.

Isso permitirá observar claramente a evolução:

```text
MVP
   ↓
DESCOBERTA INTELIGENTE
   ↓
PRODUTO LOCAL VALIDADO
   ↓
MONETIZAÇÃO
   ↓
APLICATIVOS
   ↓
NOVAS CIDADES
   ↓
ESCALA
```

Sem depender exclusivamente da memória de quem desenvolveu cada parte.

> Um projeto que registra sua evolução consegue aprender com o próprio passado.
