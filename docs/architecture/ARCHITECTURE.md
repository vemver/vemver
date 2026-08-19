# VemVer — Arquitetura Oficial

## Documento

**Projeto:** VemVer
**Documento:** Arquitetura Oficial
**Versão:** 1.0.0
**Status:** Ativo
**Última atualização:** 17/08/2026

---

# 1. Objetivo

Este documento descreve a arquitetura técnica atual do VemVer.

Seu objetivo é registrar:

- como os principais componentes se conectam;
- qual responsabilidade pertence a cada camada;
- quais serviços externos são utilizados;
- como dados percorrem o sistema;
- como a inteligência artificial participa da aplicação;
- como pagamentos são integrados;
- como deploys são realizados;
- como segurança é aplicada;
- quais limitações arquiteturais existem atualmente;
- quais princípios devem ser preservados nas futuras evoluções.

Este documento descreve a arquitetura real do projeto no estado atual.

Funcionalidades futuras devem ser identificadas explicitamente como planejadas.

---

# 2. Visão Geral

O VemVer utiliza uma arquitetura web baseada principalmente em:

```text
USUÁRIO
   ↓
NEXT.JS / REACT
   ↓
APIs DO VEMVER
   ├── SUPABASE / POSTGRESQL
   ├── OPENAI
   ├── MERCADO PAGO
   └── SERVIÇOS DA VERCEL
```

A aplicação web funciona como a principal interface atual.

O backend é implementado dentro do próprio projeto Next.js através de Route Handlers.

---

# 3. Stack Principal

A stack consolidada atualmente é:

```text
Next.js 16
React 19
TypeScript 5
Tailwind CSS 4

Supabase
PostgreSQL

OpenAI

Mercado Pago

Vercel

Git
GitHub
```

---

# 4. Modelo Arquitetural Atual

O VemVer utiliza atualmente um modelo de:

```text
MONÓLITO WEB MODULAR
```

Isso significa que frontend e APIs principais pertencem ao mesmo projeto Next.js.

Não existem atualmente microserviços independentes para cada domínio.

---

# 5. Por que o Monólito Continua Adequado

Para o estágio atual do produto, essa arquitetura reduz:

- complexidade operacional;
- quantidade de deploys;
- comunicação entre serviços;
- custo;
- necessidade de observabilidade distribuída.

O projeto poderá evoluir quando escala real justificar.

---

# 6. Estrutura Principal do Código

A aplicação utiliza:

```text
src/app/
```

como base do App Router.

Estrutura conceitual:

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

# 7. App Router

O projeto utiliza App Router do Next.js.

Arquivos principais seguem padrões como:

```text
page.tsx
layout.tsx
route.ts
```

---

# 8. Frontend

O frontend é responsável principalmente por:

- interface;
- navegação;
- estados visuais;
- formulários;
- geolocalização quando autorizada;
- interação do consumidor;
- interação do lojista;
- chamadas ao backend.

---

# 9. Backend

O backend é responsável principalmente por:

- validação;
- autorização;
- regras de negócio;
- comunicação privilegiada com banco;
- OpenAI;
- Mercado Pago;
- cron jobs;
- operações administrativas;
- segurança de secrets.

---

# 10. Separação de Responsabilidades

Princípio:

```text
INTERFACE
→ experiência

BACKEND
→ regras e segurança

BANCO
→ persistência e integridade

SERVIÇOS EXTERNOS
→ capacidades específicas
```

---

# 11. Server Components

Quando possível, a arquitetura pode utilizar Server Components.

Isso permite manter lógica server-side fora do navegador.

---

# 12. Client Components

Client Components são utilizados quando existe necessidade de:

- hooks;
- eventos;
- estado local;
- geolocalização;
- APIs do navegador;
- interação dinâmica.

---

# 13. Secrets

Secrets nunca devem depender de Client Components.

Exemplos:

```text
OPENAI_API_KEY

SUPABASE_SERVICE_ROLE_KEY

CRON_SECRET

credenciais privadas de pagamento
```

permanecem server-side.

---

# 14. Banco de Dados

O banco principal utiliza:

```text
Supabase
+
PostgreSQL
```

---

# 15. Papel do Supabase

O Supabase fornece principalmente a infraestrutura de:

- PostgreSQL;
- autenticação utilizada pela aplicação;
- APIs de acesso a dados;
- RPCs;
- políticas de segurança;
- serviços associados ao projeto.

O uso específico de cada recurso deve ser mantido documentado conforme o sistema evoluir.

---

# 16. PostgreSQL como Fonte Persistente

Dados de negócio não devem depender da IA como memória.

Informações persistentes pertencem ao banco.

---

# 17. Tabelas de Domínio

O projeto possui estruturas relacionadas a domínios como:

```text
lojas

produtos

avaliacoes

favoritos

solicitações de planos

histórico de assinaturas

moderação
```

O schema completo pertence a:

```text
DATABASE.md
```

---

# 18. Tabela `lojas`

A tabela de lojas é central para o produto.

Ela contém informações relacionadas a:

- identidade;
- categoria;
- cidade;
- UF;
- descrição;
- localização;
- plano;
- status;
- atividade;
- score;
- visualizações;
- propriedade.

---

# 19. Estado de Loja

A descoberta pública atual depende de condições como:

```text
ativo = true
```

e:

```text
status = 'aprovada'
```

---

# 20. Localização

Lojas podem possuir:

```text
latitude
longitude
```

quando conhecidas.

Ausência desses campos não torna automaticamente a loja inválida.

---

# 21. Migrations

Mudanças estruturais de banco são versionadas em:

```text
supabase/migrations/
```

---

# 22. Baseline

Existe uma migration de baseline:

```text
20260813000743_remote_schema.sql
```

Ela representa o schema remoto capturado naquele momento.

Não deve ser editada retroativamente para novas mudanças.

---

# 23. Evolução de Schema

Regra:

```text
MUDANÇA NOVA
   ↓
MIGRATION NOVA
```

---

# 24. Histórico Conhecido de Migrations

No estado documentado:

```text
20260813000743_remote_schema.sql

20260813002732_restringir_execucao_atualizar_score_lojas.sql

20260815222432_habilitar_busca_sem_acentos.sql

20260815233344_criar_busca_lojas_sem_acentos.sql
```

---

# 25. RPCs

PostgreSQL RPCs são utilizadas quando o banco precisa executar lógica específica de forma controlada.

---

# 26. RPC de Busca

Existe:

```text
public.buscar_lojas_sem_acentos(...)
```

responsável por retornar candidatos compatíveis para descoberta.

---

# 27. RPC de Score

Existe:

```text
public.atualizar_score_lojas()
```

responsável por recalcular o score das lojas.

---

# 28. Permissões de RPC

RPCs privilegiadas não devem ficar abertas desnecessariamente para:

```text
anon
authenticated
```

quando o fluxo arquitetural prevê execução server-side.

---

# 29. Service Role

O backend utiliza:

```text
SUPABASE_SERVICE_ROLE_KEY
```

em operações privilegiadas que realmente precisam dessa permissão.

---

# 30. Regra da Service Role

Nunca:

```text
BROWSER
   ↓
SERVICE ROLE
```

Sempre:

```text
BROWSER
   ↓
BACKEND
   ↓
SERVICE ROLE
```

---

# 31. RLS

Row Level Security deve fazer parte da segurança das tabelas expostas através do Supabase.

Entretanto, políticas específicas devem ser auditadas por tabela antes de serem declaradas totalmente validadas.

---

# 32. Busca Inteligente

A descoberta inteligente é um dos principais fluxos da arquitetura.

Fluxo atual:

```text
USUÁRIO
   ↓
MENSAGEM EM LINGUAGEM NATURAL
   ↓
/api/entender-intencao
   ↓
OPENAI
   ↓
INTENÇÃO ESTRUTURADA
   ↓
buscarLojas()
   ↓
SUPABASE
   ↓
CANDIDATOS
   ↓
RANKING
   ↓
RESULTADOS
```

---

# 33. Módulos da Busca Inteligente

A lógica está organizada principalmente em:

```text
src/app/lib/ia/
```

com arquivos como:

```text
entenderIntencao.ts

buscarLojas.ts

calcularDistancia.ts
```

---

# 34. `entenderIntencao.ts`

Responsável por transformar linguagem natural em estrutura conhecida.

---

# 35. Estrutura de Intenção

A estrutura atual possui conceitos como:

```text
termoBusca

categoria

delivery

abertoAgora

pertoDeMim

preco
```

---

# 36. OpenAI como Interpretador

A OpenAI interpreta intenção.

Ela não deve decidir diretamente quais linhas do banco serão retornadas.

---

# 37. Backend como Autoridade

Depois que a intenção é interpretada:

```text
BACKEND
```

é responsável por:

- montar critérios;
- consultar banco;
- calcular relevância;
- calcular distância;
- aplicar ranking.

---

# 38. IA não Acessa Banco Diretamente

Arquitetura obrigatória:

```text
OPENAI
→ interpretação
```

e:

```text
BACKEND
→ banco
```

Não fornecer acesso privilegiado direto do modelo ao Supabase.

---

# 39. Structured Output

A interpretação da intenção utiliza saída estruturada para reduzir ambiguidades no contrato entre OpenAI e backend.

---

# 40. Modelo Atual

A interpretação utiliza atualmente:

```text
gpt-4.1-mini
```

na integração existente.

Mudanças de modelo devem ser intencionais e testadas.

---

# 41. Busca sem Acentos

A arquitetura suporta comparação sem diferenças simples de acentuação.

Exemplo:

```text
acai
```

pode corresponder a:

```text
açaí
```

---

# 42. `unaccent`

Foi habilitada extensão PostgreSQL:

```text
unaccent
```

para auxiliar essa busca.

---

# 43. Preservação do Texto

A normalização é utilizada na comparação.

Os dados originais permanecem corretamente acentuados.

---

# 44. Critérios de Busca

A busca atual considera principalmente:

- nome;
- categoria;
- descrição.

---

# 45. Normalização no Backend

Também existe normalização textual para:

- lowercase;
- remoção de acentos na comparação;
- trim;
- limpeza de pontuação;
- remoção de algumas palavras genéricas.

---

# 46. Relevância Textual

O backend calcula relevância de acordo com correspondências.

Conceitualmente:

```text
NOME EXATO
→ muito forte

NOME COMEÇA COM
→ forte

NOME CONTÉM
→ relevante

CATEGORIA EXATA
→ forte

CATEGORIA CONTÉM
→ relevante

DESCRIÇÃO CONTÉM
→ sinal complementar
```

---

# 47. Pesos Atuais de Relevância

A implementação atual utiliza pesos equivalentes a:

```text
nome exato
+100

nome começa com
+80

nome contém
+60

categoria exata
+90

categoria contém
+70

descrição contém
+25
```

Esses valores podem evoluir conforme testes reais.

---

# 48. Distância

A distância é calculada quando existem:

- coordenadas do usuário;
- coordenadas da loja.

---

# 49. Fórmula Geográfica

O módulo:

```text
calcularDistancia.ts
```

utiliza cálculo geográfico baseado em Haversine.

---

# 50. Distância Desconhecida

Quando uma loja não possui coordenadas:

```text
distanciaKm = null
```

---

# 51. Não Excluir Loja sem Coordenadas

Arquitetura atual:

```text
SEM COORDENADAS
≠
SEM RELEVÂNCIA
```

---

# 52. Proximidade

Quando:

```text
pertoDeMim = true
```

a distância participa do ranking depois da relevância textual.

---

# 53. Ranking

Ordem atual:

```text
1. relevância textual

2. distância quando proximidade foi solicitada

3. score

4. nome
```

---

# 54. Relevância Primeiro

Uma loja patrocinada irrelevante não deve superar uma loja relevante apenas por pagar.

---

# 55. Score

O score funciona como um sinal adicional de força da loja.

Ele é diferente da relevância da busca.

---

# 56. Componentes do Score

A fórmula atual considera sinais relacionados a:

- Patrocinado;
- Premium;
- visualizações;
- produtos ativos;
- favoritos;
- avaliações aprovadas.

---

# 57. Base Comercial do Score

A lógica atual segue:

```text
patrocinado = true
→ 60

senão premium = true
→ 30

senão
→ 0
```

---

# 58. Não Duplicar Bônus Comercial

Como Premium e Patrocinado já participam do score:

> o backend não deve adicionar os mesmos bônus novamente ao ranking.

---

# 59. Atualização do Score

O score é atualizado através da função:

```text
atualizar_score_lojas()
```

---

# 60. Cron de Score

Existe:

```text
GET /api/cron/atualizar-scores
```

para executar essa atualização de forma automatizada.

---

# 61. Agendamento do Score

No:

```text
vercel.json
```

o cron está configurado para:

```text
0 4 * * *
```

---

# 62. Proteção do Cron de Score

O cron:

```text
/api/cron/atualizar-scores
```

utiliza:

```text
CRON_SECRET
```

para impedir execução não autorizada.

Essa proteção foi confirmada no Route Handler atual.
---
# 63. Verificação de Planos

Existe também:

```text
GET /api/cron/verificar-planos
```

Essa rota executa verificações periódicas relacionadas ao ciclo de assinaturas.

No estado atual auditado, ela **não possui verificação explícita de `CRON_SECRET` dentro do próprio Route Handler**.

Essa proteção permanece como pendência de segurança.

---

# 64. Responsabilidade do Cron de Planos

Esse fluxo está relacionado ao ciclo de assinaturas, incluindo estados de vencimento, avisos e cortesia conforme a implementação atual.

Detalhes exatos devem continuar sendo mantidos em:

```text
BUSINESS_RULES.md
```

e auditados diretamente no código sempre que forem alterados.

---

# 65. Agendamento de Planos

Configuração atual:

```text
0 3 * * *
```

---

# 66. `vercel.json`

Atualmente registra:

```text
/api/cron/verificar-planos
→ 0 3 * * *

/api/cron/atualizar-scores
→ 0 4 * * *
```

---

# 67. Moderação

O VemVer utiliza OpenAI para auxiliar moderação de conteúdo.

---

# 68. Biblioteca de Moderação

Existe:

```text
src/app/lib/moderacao.ts
```

---

# 69. Modelo de Moderação

A integração atual utiliza:

```text
omni-moderation-latest
```

---

# 70. API de Moderação

Endpoint:

```text
POST /api/moderar-texto
```

---

# 71. Validação da Moderação

Antes da OpenAI, a rota valida:

- Content-Type;
- tamanho do body;
- JSON;
- estrutura;
- tipo do texto;
- conteúdo vazio;
- comprimento.

---

# 72. Limite de Texto da Moderação

Atual:

```text
2.000 caracteres
```

---

# 73. Limite de Body da Moderação

Atual:

```text
8.000 bytes
```

---

# 74. API de Busca Inteligente

Endpoint:

```text
POST /api/entender-intencao
```

---

# 75. Limite da Mensagem

Atual:

```text
300 caracteres
```

---

# 76. Limite do Body da Busca

Atual:

```text
8.000 bytes
```

---

# 77. Cidade

Quando enviada:

```text
máximo 100 caracteres
```

---

# 78. UF

Quando enviada:

```text
2 letras
```

normalizada para maiúsculas.

---

# 79. Coordenadas

Latitude:

```text
-90 até 90
```

Longitude:

```text
-180 até 180
```

As duas precisam ser enviadas juntas.

---

# 80. Validação antes da OpenAI

Princípio consolidado:

```text
REQUEST
   ↓
VALIDAÇÃO
   ↓
OPENAI
```

---

# 81. Tratamento de Erros

Erros internos são registrados no servidor.

O cliente recebe resposta genérica quando apropriado.

---

# 82. Não Expor Erro Bruto

Evitar respostas com:

```text
stack trace

erro.message bruto

secret

query

informação interna sensível
```

---

# 83. Endpoint de Teste Removido

A rota:

```text
/api/testar-moderacao
```

foi removida da aplicação.

---

# 84. Motivo da Remoção

Ela existia apenas para diagnóstico.

Mantê-la aumentaria superfície desnecessária em produção.

---

# 85. Comportamento Esperado

Atualmente:

```text
GET /api/testar-moderacao
→ 404
```

---

# 86. Rate Limit

APIs de IA possuem proteção adicional no Firewall da Vercel.

---

# 87. Regra Atual de Firewall

Nome registrado:

```text
OpenAI - Rate Limit
```

---

# 88. Rotas Cobertas

```text
POST /api/entender-intencao

POST /api/moderar-texto
```

---

# 89. Configuração Atual

```text
Fixed Window

60 segundos

10 requisições

por IP
```

---

# 90. Limite Compartilhado

Atualmente as duas rotas compartilham a mesma regra.

Isso significa que chamadas de ambas contribuem para o mesmo limite por IP.

---

# 91. Resposta de Rate Limit

Ao exceder o limite:

```text
429 Too Many Requests
```

---

# 92. Vercel Firewall e Código

O Firewall não substitui validações internas.

Arquitetura em camadas:

```text
WAF
   ↓
API
   ↓
VALIDAÇÃO
   ↓
REGRA
```

---

# 93. Autenticação

A aplicação utiliza autenticação associada ao Supabase.

Fluxos existentes incluem:

- login;
- recuperação de senha;
- redefinição;
- áreas protegidas.

---

# 94. Autorização

Autenticação responde:

```text
quem é?
```

Autorização responde:

```text
pode fazer isso?
```

As duas verificações não devem ser confundidas.

---

# 95. Propriedade

Operações de lojista precisam considerar propriedade do recurso.

Exemplo:

```text
usuário autenticado
+
loja pertencente ao usuário
```

---

# 96. IDs são Manipuláveis

Um ID vindo do navegador não deve ser considerado prova de autorização.

---

# 97. Mass Assignment

O backend deve evitar atualizar registros utilizando diretamente todos os campos recebidos do cliente.

Campos administrativos precisam permanecer protegidos.

---

# 98. Mercado Pago

O VemVer possui integração com Mercado Pago.

Rotas existentes:

```text
/api/mercadopago

/api/webhook/mercadopago
```

---

# 99. Responsabilidade da Integração

O fluxo está relacionado à contratação e processamento de planos.

---

# 100. Autoridade Financeira

O frontend não deve ser autoridade sobre:

- preço final;
- pagamento aprovado;
- ativação;
- plano.

---

# 101. Backend Financeiro

O servidor deve validar dados relevantes antes de executar operações financeiras.

---

# 102. Webhook

Webhooks precisam ser tratados como eventos externos que podem:

- chegar novamente;
- chegar fora de ordem;
- possuir estado ainda não definitivo.

---

# 103. Idempotência

A arquitetura futura e a auditoria do webhook devem garantir que o mesmo evento não provoque múltiplas ativações indevidas.

---

# 104. Auditoria do Mercado Pago

Os contratos exatos de:

- assinatura/autenticidade do webhook;
- idempotência;
- transições de estado;
- validação de valores;

devem ser auditados diretamente no código antes de qualquer afirmação definitiva adicional.

---

# 105. Admin

Existe área administrativa.

Operações administrativas precisam de autorização real no backend.

---

# 106. Cliente

A aplicação possui área destinada a consumidores.

Fluxos podem incluir:

- descoberta;
- favoritos;
- histórico;
- avaliações;
- perfil.

A disponibilidade exata de cada tela deve acompanhar o código real.

---

# 107. Lojista

A aplicação possui área destinada a lojistas.

Fluxos incluem gerenciamento relacionado a:

- lojas;
- produtos;
- planos;
- informações da conta.

---

# 108. Página de Loja

Existe rota pública baseada em slug:

```text
/loja/[slug]
```

A página apresenta informações do estabelecimento e integra fluxos relacionados.

---

# 109. Página de Produto

Existe estrutura de rota para produtos.

A implementação e exposição devem respeitar status e regras de negócio.

---

# 110. Avaliações

Avaliações participam do domínio atual e também podem influenciar score quando aprovadas.

---

# 111. Evolução Planejada das Avaliações

A UX planejada prevê:

```text
PÁGINA DA LOJA
      ↓
AVALIAR
      ↓
MODAL / SUBABA
      ↓
ESTRELAS
      ↓
COMENTÁRIO
```

sem retirar o usuário da página da loja.

---

# 112. Tema

A futura experiência deverá suportar:

```text
Automático

Claro

Escuro
```

---

# 113. Arquitetura de Tema Planejada

Deve utilizar sistema centralizado de:

- tokens;
- variáveis;
- componentes compartilhados.

Não duplicar telas apenas para cada tema.

---

# 114. App Cliente Futuro

Existe visão futura para aplicativo voltado ao consumidor.

Ele deverá reutilizar APIs seguras do backend.

---

# 115. App Lojista Futuro

Existe visão futura para aplicativo voltado ao lojista.

Ele também deverá reutilizar regras centrais do backend.

---

# 116. Nenhum Secret em Aplicativos

Aplicativos instalados continuam sendo clientes não confiáveis.

Nenhum aplicativo móvel deverá conter:

```text
service role

segredos OpenAI

segredos administrativos
```

---

# 117. Vercel

A aplicação web é implantada atualmente na Vercel.

---

# 118. Domínio de Produção

Atual:

```text
https://vemverapp.com.br
```

---

# 119. Fluxo de Deploy

Direção consolidada:

```text
BRANCH
   ↓
COMMIT
   ↓
PUSH
   ↓
PULL REQUEST
   ↓
PREVIEW
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

# 120. Preview

A Vercel cria ambientes de Preview para branches e Pull Requests conforme o fluxo do projeto.

---

# 121. Preview Protegido

O ambiente de Preview utiliza proteção de acesso.

Credenciais de bypass são tratadas como secrets.

---

# 122. Production

A branch:

```text
main
```

representa a base principal destinada à produção.

---

# 123. Deployment não é Teste

Um deployment:

```text
Ready
```

confirma implantação.

Não confirma sozinho que a regra funcional está correta.

---

# 124. Teste Pós-Deploy

Mudanças críticas devem possuir teste após publicação quando seguro.

---

# 125. Desenvolvimento Local

Comando utilizado explicitamente quando necessário:

```powershell
npx next dev --webpack
```

---

# 126. TypeScript

Validação:

```powershell
npx tsc --noEmit
```

---

# 127. Build

Validação:

```powershell
npm run build
```

---

# 128. Lint

O projeto possui débito técnico legado de lint.

Portanto, atualmente não é correto afirmar que:

```text
npm run lint
```

passa globalmente sem problemas.

---

# 129. Dívida Técnica

Problemas antigos de lint devem ser corrigidos em trabalho específico.

Não misturar automaticamente essa limpeza com qualquer feature.

---

# 130. Observabilidade

Atualmente logs server-side ajudam a diagnosticar erros.

À medida que o sistema crescer, observabilidade poderá precisar evoluir.

---

# 131. Logs

Logs não devem conter secrets.

---

# 132. Infraestrutura Fora do Git

Nem toda configuração está contida no repositório.

Exemplos:

- variáveis da Vercel;
- Firewall;
- configurações do Supabase;
- configurações de provedores externos.

---

# 133. Consequência

Documentação é necessária para registrar infraestrutura que não pode ser deduzida apenas lendo o Git.

---

# 134. Variáveis de Ambiente

Exemplos relevantes:

```text
OPENAI_API_KEY

SUPABASE_SERVICE_ROLE_KEY

CRON_SECRET
```

Outras variáveis dependem das integrações existentes.

---

# 135. Nunca Versionar Secrets

Secrets reais não devem ser enviados para Git.

---

# 136. Segurança em Camadas

Arquitetura desejada:

```text
FIREWALL
   ↓
VALIDAÇÃO HTTP
   ↓
AUTENTICAÇÃO
   ↓
AUTORIZAÇÃO
   ↓
REGRA DE NEGÓCIO
   ↓
BANCO
```

Nem toda rota exige todas as camadas, mas cada uma deve possuir as necessárias.

---

# 137. Entrada Externa

Tudo que vem do usuário deve ser considerado não confiável.

Isso inclui:

- body;
- query;
- headers;
- IDs;
- coordenadas;
- valores financeiros;
- user_id informado pelo cliente.

---

# 138. Validação Runtime

TypeScript não substitui validação de requisição.

---

# 139. Conteúdo Faltante

A arquitetura não deve inventar dados para responder melhor.

Exemplos atuais ainda dependentes de modelagem confiável:

- delivery;
- horário de funcionamento;
- preço contextual.

---

# 140. Aberto Agora

A IA pode interpretar:

```text
abertoAgora = true
```

mas o sistema só deve aplicar esse filtro quando existir fonte confiável de horários.

---

# 141. Delivery

O mesmo princípio se aplica a delivery.

---

# 142. Faixa de Preço

O mesmo princípio se aplica a preço.

---

# 143. Escalabilidade da Busca

A solução atual é adequada ao estágio presente.

Em maior escala, consultas baseadas em:

```text
LIKE '%termo%'
+
unaccent
+
ranking em memória
```

podem se tornar limitantes.

---

# 144. Evoluções Possíveis da Busca

Somente quando métricas justificarem:

- índices especializados;
- `pg_trgm`;
- full-text;
- busca vetorial;
- mecanismo externo;
- cache.

---

# 145. Não Adotar Tecnologia por Moda

Novos componentes arquiteturais devem resolver problema medido.

---

# 146. Microserviços

Não são objetivo por si só.

A separação poderá ocorrer futuramente por razões como:

- escala;
- isolamento;
- segurança;
- equipe;
- carga especializada.

---

# 147. Performance

Antes de otimizar, medir.

Entretanto, evitar problemas óbvios como:

- N+1;
- payload excessivo;
- consultas repetidas;
- chamadas externas redundantes.

---

# 148. Seleção de Campos

APIs devem preferir selecionar apenas os dados necessários.

---

# 149. Paginação

O limite atual de descoberta é:

```text
20 resultados
```

Paginação ou carregamento progressivo poderá surgir futuramente.

---

# 150. Segurança do Banco

Mudanças em:

- RLS;
- grants;
- RPCs;
- `security definer`;
- service role;

devem receber revisão específica.

---

# 151. `security definer`

Se uma função futura utilizar `security definer`, sua segurança deverá ser analisada explicitamente.

---

# 152. `search_path`

Funções sensíveis devem considerar `search_path` controlado quando apropriado.

---

# 153. Integridade

Regras importantes podem ser reforçadas por:

- constraints;
- foreign keys;
- RLS;
- tipos;
- defaults.

---

# 154. Migrations Destrutivas

Operações como:

```text
DROP TABLE
DROP COLUMN
ALTER TYPE
```

devem considerar dados, dependências e rollback.

---

# 155. Backward Compatibility

À medida que aplicativos móveis forem publicados, APIs deverão considerar versões antigas ainda instaladas.

---

# 156. Arquitetura Mobile

Direção futura:

```text
APP CLIENTE
      \
       → BACKEND VEMVER → SUPABASE / SERVIÇOS
      /
APP LOJISTA
```

---

# 157. Backend Compartilhado

Regras críticas devem permanecer centralizadas e reutilizáveis por web e mobile.

---

# 158. Não Recriar Regras no Aplicativo

O app pode validar para UX.

Mas autorização e regras críticas permanecem no servidor.

---

# 159. Tema e Backend

Tema é uma preocupação de apresentação.

Ele não deve modificar:

- score;
- busca;
- planos;
- autorização;
- pagamentos.

---

# 160. Arquitetura de Produto

A arquitetura precisa servir duas grandes partes:

```text
CONSUMIDOR
```

e:

```text
LOJISTA
```

mantendo administração e operação da plataforma.

---

# 161. Consumidor

O objetivo arquitetural é reduzir o caminho entre:

```text
NECESSIDADE
```

e:

```text
ESTABELECIMENTO ADEQUADO
```

---

# 162. Lojista

O objetivo arquitetural é permitir que estabelecimentos:

- mantenham presença;
- publiquem produtos;
- sejam encontrados;
- utilizem planos;
- acompanhem evolução da participação na plataforma.

---

# 163. Cidade Piloto

Joinville funciona como ambiente inicial de validação do modelo local.

A arquitetura deve permitir novas cidades sem reconstrução completa.

---

# 164. Cidade e UF

Consultas já consideram contexto de:

```text
cidade
UF
```

quando fornecido.

---

# 165. Expansão

A futura expansão deverá preservar:

```text
UMA PLATAFORMA
+
MÚLTIPLAS CIDADES
```

---

# 166. Localização como Contexto

Distância é sinal contextual.

Ela não substitui relevância.

---

# 167. Relevância como Pilar

A busca deve continuar respondendo primeiro:

> isso realmente corresponde ao que o usuário pediu?

---

# 168. Monetização

Planos comerciais podem melhorar exposição dentro de regras definidas.

Eles não devem destruir relevância.

---

# 169. Score não é Anúncio Universal

Score alto não deve transformar loja irrelevante em resultado relevante.

---

# 170. Moderação como Camada

Conteúdo enviado por usuários pode passar por moderação.

Moderação não substitui autorização nem validação estrutural.

---

# 171. Custos de IA

Chamadas de OpenAI possuem custo e devem ser protegidas contra entradas inválidas e abuso.

---

# 172. Firewall e Custos

O rate limit também funciona como camada de controle contra uso excessivo das rotas de IA.

---

# 173. Dependência de Terceiros

O VemVer depende atualmente de serviços externos.

Principais:

```text
Supabase
OpenAI
Mercado Pago
Vercel
```

---

# 174. Falhas Externas

O sistema precisa assumir que qualquer provedor externo pode falhar.

---

# 175. Fallback

Fallback nunca deve inventar informação de negócio.

---

# 176. Falha da OpenAI

Se OpenAI falhar, o sistema deve responder de forma controlada.

---

# 177. Falha do Supabase

Se banco falhar, o sistema deve evitar exibir dados falsos.

---

# 178. Falha do Mercado Pago

Falha de pagamento não pode ser interpretada automaticamente como pagamento aprovado.

---

# 179. Crons

Crons precisam ser idempotentes quando repetição puder ocorrer.

---

# 180. Histórico Comercial

Eventos comerciais importantes podem precisar de persistência própria.

Logs técnicos não substituem histórico de negócio.

---

# 181. Segurança de Upload

Fluxos de upload devem ser auditados quanto a:

- tipo;
- tamanho;
- autorização;
- associação ao recurso;
- armazenamento.

A documentação não deve assumir regras específicas não verificadas diretamente.

---

# 182. Armazenamento de Imagens

O sistema utiliza referências como:

```text
imagem_url
```

em entidades.

Os detalhes exatos de armazenamento e políticas devem ser auditados no fluxo de upload antes de serem tratados como contrato arquitetural definitivo.

---

# 183. Duplicação de Componentes

Existem componentes com nomes aparentemente duplicados.

Eles não devem ser removidos sem confirmar:

- imports;
- rotas;
- responsabilidade;
- uso real.

---

# 184. Organização de `lib`

As bibliotecas compartilhadas atuais estão principalmente em:

```text
src/app/lib/
```

---

# 185. Alias

O alias:

```text
@/*
```

aponta para:

```text
./src/*
```

---

# 186. Consequência do Alias

Como as bibliotecas estão em:

```text
src/app/lib/
```

não assumir que:

```text
@/lib/...
```

aponte para elas.

---

# 187. Refactor de Diretórios

Mover bibliotecas deverá ser tratado como refactor planejado.

---

# 188. Qualidade

A arquitetura técnica deve ser validada através de:

```text
TypeScript

Build

testes funcionais

Preview

Production quando apropriado
```

---

# 189. Testes Automatizados

A suíte automatizada ainda deverá evoluir.

Prioridades arquiteturais incluem:

- busca;
- ranking;
- APIs;
- autorização;
- crons;
- pagamentos.

---

# 190. CI Futuro

O projeto poderá evoluir para checks obrigatórios automatizados antes do merge.

---

# 191. Staging Futuro

Um ambiente dedicado de staging poderá ser introduzido quando o risco operacional justificar.

---

# 192. Observabilidade Futura

Com aumento de escala, poderá ser necessário adicionar:

- monitoramento;
- métricas;
- alertas;
- tracing;
- análise de performance.

---

# 193. Métricas da Busca

No futuro será importante observar:

- latência;
- taxa de resultado;
- cliques;
- relevância;
- conversão;
- buscas sem resultado.

---

# 194. Dados para Evolução

Decisões de infraestrutura devem ser baseadas em dados reais de uso.

---

# 195. Princípio de Evolução

Arquitetura deve ser:

```text
SIMPLES O SUFICIENTE PARA HOJE
+
PREPARADA PARA EVOLUIR AMANHÃ
```

---

# 196. Não Superdimensionar

Preparação para crescimento não significa instalar toda tecnologia possível antecipadamente.

---

# 197. Segurança por Padrão

Novas funcionalidades devem nascer considerando:

- autenticação;
- autorização;
- input;
- secrets;
- dados;
- abuso;
- logs.

---

# 198. Banco por Migration

Não realizar mudança estrutural de produção sem registrar migration correspondente.

---

# 199. API por Contrato

Toda API importante precisa de contrato claro de:

- método;
- entrada;
- validação;
- saída;
- erro;
- autorização.

---

# 200. IA com Limites

Toda nova integração de IA deve definir:

- finalidade;
- input;
- output;
- custo;
- limites;
- dados enviados;
- fallback.

---

# 201. Pagamento com Auditoria

Toda mudança financeira deve considerar:

- identidade;
- propriedade;
- preço;
- status;
- duplicidade;
- histórico.

---

# 202. Documentação como Parte da Arquitetura

Arquitetura não existe apenas no código.

Mudanças importantes devem atualizar os documentos correspondentes.

---

# 203. Fonte de Verdade

Quando existir divergência entre documentação e sistema:

```text
CÓDIGO
+
BANCO
+
MIGRATIONS
+
CONFIGURAÇÃO REAL
```

devem ser auditados.

Depois a documentação deve ser corrigida.

---

# 204. Itens que Precisam de Auditoria Contínua

Áreas que merecem revisões específicas conforme evolução:

```text
RLS

autorização administrativa

Mercado Pago

webhook

uploads

permissões de tabelas

idempotência financeira

dependências

lint legado
```

---

# 205. Arquitetura Atual em Diagrama

```text
                           ┌──────────────────┐
                           │     USUÁRIO      │
                           └────────┬─────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ NEXT.JS 16 / REACT  │
                         │   APP ROUTER WEB    │
                         └─────────┬───────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                │                  │                  │
                ▼                  ▼                  ▼
       ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
       │ ÁREA CLIENTE   │ │ ÁREA LOJISTA   │ │     ADMIN      │
       └───────┬────────┘ └───────┬────────┘ └───────┬────────┘
               │                  │                  │
               └──────────────────┼──────────────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │ ROUTE HANDLERS / API │
                       └──────────┬───────────┘
                                  │
              ┌───────────────────┼────────────────────┐
              │                   │                    │
              ▼                   ▼                    ▼
     ┌────────────────┐  ┌────────────────┐   ┌─────────────────┐
     │    SUPABASE    │  │     OPENAI     │   │  MERCADO PAGO   │
     │   POSTGRESQL   │  │ Intenção / Mod │   │   Pagamentos    │
     └───────┬────────┘  └────────────────┘   └─────────────────┘
             │
             ▼
     ┌────────────────┐
     │ TABELAS / RPCs │
     │ MIGRATIONS/RLS │
     └────────────────┘

               VERCEL
                 │
        ┌────────┼─────────┐
        │        │         │
        ▼        ▼         ▼
      DEPLOY   CRONS    FIREWALL
```

---

# 206. Arquitetura da Descoberta

```text
PERGUNTA DO USUÁRIO
        ↓
VALIDAÇÃO DA API
        ↓
OPENAI
        ↓
INTENÇÃO ESTRUTURADA
        ↓
CRITÉRIOS NORMALIZADOS
        ↓
RPC DE BUSCA
        ↓
CANDIDATOS
        ↓
RELEVÂNCIA
        ↓
DISTÂNCIA
        ↓
SCORE
        ↓
RESULTADOS
```

---

# 207. Arquitetura de Segurança da IA

```text
INTERNET
   ↓
VERCEL FIREWALL
   ↓
ROUTE HANDLER
   ↓
CONTENT-TYPE
   ↓
BODY LIMIT
   ↓
JSON
   ↓
VALIDAÇÃO
   ↓
OPENAI
```

---

# 208. Arquitetura de Cron

No estado atual, os dois crons possuem níveis diferentes de proteção explícita.

### Cron de Score

```text
VERCEL CRON
     ↓
/api/cron/atualizar-scores
     ↓
CRON_SECRET
     ↓
BACKEND
     ↓
SUPABASE / RPC
```

### Cron de Planos

```text
VERCEL CRON
     ↓
/api/cron/verificar-planos
     ↓
BACKEND
     ↓
SUPABASE
```

Atualmente, o Route Handler de:

```text
/api/cron/verificar-planos
```

não possui verificação explícita de:

```text
CRON_SECRET
```

Essa proteção permanece como pendência de segurança.

---

# 209. Arquitetura de Pagamento

Conceitualmente:

```text
LOJISTA
   ↓
BACKEND VEMVER
   ↓
MERCADO PAGO
   ↓
PROCESSAMENTO
   ↓
WEBHOOK
   ↓
BACKEND VEMVER
   ↓
VALIDAÇÃO
   ↓
ATUALIZAÇÃO DO ESTADO
```

Os detalhes exatos devem acompanhar a auditoria da integração real.

---

# 210. Futuro — Produtos na Descoberta

A arquitetura deverá evoluir para permitir buscas mais específicas por produto.

Fluxo futuro:

```text
"quero tênis infantil"
        ↓
PRODUTOS COMPATÍVEIS
        ↓
LOJAS COMPATÍVEIS
        ↓
RANKING LOCAL
```

---

# 211. Futuro — Horários

Para aplicar:

```text
aberto agora
```

será necessário modelar:

- dias da semana;
- abertura;
- fechamento;
- intervalos;
- exceções;
- feriados;
- timezone.

---

# 212. Futuro — Delivery

Delivery precisará de dado estruturado confiável.

---

# 213. Futuro — Preço

Filtros por preço precisarão de regra consistente por produto ou categoria.

---

# 214. Futuro — Busca em Escala

A evolução deverá ser orientada por métricas.

Não existe decisão atual obrigando uma tecnologia específica.

---

# 215. Futuro — Apps

Os apps deverão consumir backend centralizado e seguro.

---

# 216. Futuro — Design System

Web e apps deverão compartilhar princípios de:

- identidade;
- tokens;
- estados;
- componentes;
- temas.

---

# 217. Futuro — Temas

Temas não deverão gerar duplicação estrutural das telas.

---

# 218. Futuro — Testes

Quanto mais o VemVer crescer, mais o projeto deverá depender de testes automatizados em vez de validação exclusivamente manual.

---

# 219. Futuro — Observabilidade

Operações críticas poderão exigir alertas automáticos.

---

# 220. Futuro — Infraestrutura

Novos serviços somente deverão ser adicionados quando trouxerem benefício mensurável.

---

# 221. Regras que Devem Permanecer

Mesmo com futuras mudanças tecnológicas, preservar:

```text
RELEVÂNCIA ANTES DE MONETIZAÇÃO

IA INTERPRETA, BACKEND DECIDE

NÃO INVENTAR DADOS

SECRETS SOMENTE NO SERVIDOR

BANCO VERSIONADO

SEGURANÇA EM CAMADAS

DOCUMENTAÇÃO ATUALIZADA
```

---

# 222. Relação com Outros Documentos

Este documento deve ser lido junto com:

```text
../00_PROJECT_CONSTITUTION.md

../product/MASTER_DOCUMENT.md
../product/PRODUCT_VISION.md
../product/ROADMAP.md
../product/BUSINESS_RULES.md

DATABASE.md
API.md
SECURITY.md
DEPLOY.md

../engineering/CODING_STANDARDS.md
../engineering/TEST_PLAN.md
../engineering/CHECKLIST.md

../governance/DECISIONS.md
../governance/CHANGELOG.md
```

---

# 223. Arquitetura em Uma Frase

> O VemVer utiliza uma arquitetura web modular em Next.js, com backend responsável pelas regras e segurança, PostgreSQL/Supabase como fonte persistente, IA como camada de interpretação e serviços externos integrados através de contratos controlados.

---

# 224. Regra Final

Antes de alterar a arquitetura, perguntar:

```text
Qual problema real estamos resolvendo?

A solução atual realmente não atende?

Essa mudança aumenta segurança?

Aumenta manutenção?

Aumenta custo?

Cria acoplamento?

Existe opção mais simples?

Como migramos?

Como testamos?

Como fazemos rollback?

Qual documentação precisa mudar?
```

---

# 225. Conclusão

A arquitetura atual do VemVer prioriza:

```text
SIMPLICIDADE

SEGURANÇA

MODULARIDADE

RASTREABILIDADE

EVOLUÇÃO GRADUAL
```

A plataforma não precisa possuir a infraestrutura de uma empresa com milhões de usuários antes de ter milhões de usuários.

Ao mesmo tempo, precisa evitar decisões que impeçam crescimento.

Por isso, a estratégia arquitetural é:

> construir uma fundação simples e correta, observar o crescimento real e adicionar complexidade somente quando ela resolver um problema comprovado.
