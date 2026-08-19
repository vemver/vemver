# VemVer — Registro Oficial de Decisões

## Documento

**Projeto:** VemVer
**Documento:** Registro Oficial de Decisões
**Versão:** 1.0.0
**Status:** Ativo
**Última atualização:** 17/08/2026

---

# 1. Objetivo

Este documento registra decisões relevantes de produto, arquitetura, segurança, banco de dados e engenharia do VemVer.

Ele existe para responder:

> Por que fizemos dessa forma?

Código mostra:

```text
COMO
```

Documentação de arquitetura mostra:

```text
COMO O SISTEMA ESTÁ ORGANIZADO
```

Este documento registra principalmente:

```text
POR QUE ESCOLHEMOS ESSA DIREÇÃO
```

---

# 2. Por que Registrar Decisões

Projetos evoluem.

Com o tempo, uma solução existente pode parecer estranha para alguém que não participou da decisão original.

Sem histórico, podemos cometer o erro de:

```text
ALTERAR
   ↓
DESCOBRIR DEPOIS
   ↓
QUE HAVIA UM MOTIVO IMPORTANTE
```

O objetivo é evitar isso.

---

# 3. O que Deve Ser Registrado

Registrar decisões que afetem significativamente:

- arquitetura;
- segurança;
- banco;
- APIs;
- ranking;
- monetização;
- pagamentos;
- experiência central;
- infraestrutura;
- privacidade;
- estratégia de produto;
- escalabilidade.

---

# 4. O que Não Precisa Ser Registrado

Nem toda pequena alteração precisa virar uma decisão formal.

Exemplos normalmente desnecessários:

```text
trocar margem de 16px para 20px

corrigir texto

renomear variável local

ajustar ícone
```

desde que não representem mudança estratégica.

---

# 5. Formato das Decisões

As decisões deverão seguir preferencialmente:

```text
ID

DATA DE REGISTRO

STATUS

CONTEXTO

DECISÃO

MOTIVO

CONSEQUÊNCIAS

ALTERNATIVAS

REVISÃO FUTURA
```

### Significado da Data de Registro

Nas decisões consolidadas nesta versão inicial, a **Data de registro** representa o momento em que a decisão foi formalizada neste documento.

Ela não deve ser interpretada automaticamente como a data histórica exata em que a decisão foi originalmente tomada.

Quando uma data histórica original puder ser comprovada por Git, migration, pull request, issue ou outro registro confiável, ela poderá ser registrada separadamente.

---

# 6. Status Possíveis

Utilizar:

```text
ATIVA
```

Decisão válida atualmente.

```text
SUBSTITUÍDA
```

Foi trocada por uma decisão posterior.

```text
EM REVISÃO
```

Está sendo reavaliada.

```text
PROPOSTA
```

Ainda não foi aprovada.

---

# DEC-001 — Descoberta Local como Núcleo do Produto

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Produto

## Contexto

O VemVer poderia evoluir simplesmente como um catálogo ou diretório de lojas.

Porém, o problema central identificado é mais amplo:

```text
PESSOA PRECISA DE ALGO
        ↓
NÃO SABE ONDE ENCONTRAR
```

## Decisão

O núcleo do produto será:

> descoberta local inteligente.

O VemVer deverá evoluir para compreender necessidades e conectar consumidores às melhores opções locais.

## Motivo

Um diretório responde:

```text
Quais lojas existem?
```

O VemVer deverá responder:

```text
Onde encontro o que eu preciso?
```

## Consequências

Busca, ranking, produtos, geolocalização e IA tornam-se partes estratégicas do produto.

---

# DEC-002 — Relevância Antes de Monetização

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Produto / Ranking

## Contexto

O VemVer possui planos comerciais como Premium e Patrocinado.

Existe risco de monetização comprometer a qualidade da descoberta.

## Decisão

> Relevância deve possuir prioridade sobre vantagem comercial.

Uma loja patrocinada irrelevante não deverá superar uma loja realmente relacionada à necessidade do consumidor.

## Motivo

Se pagar mais for suficiente para dominar qualquer resultado, o consumidor deixa de confiar na busca.

Sem confiança:

```text
BUSCA PERDE VALOR
       ↓
CONSUMIDOR SAI
       ↓
PLANO COMERCIAL TAMBÉM PERDE VALOR
```

## Consequências

O ranking atual considera relevância textual antes do score.

---

# DEC-003 — IA Interpreta; Backend Decide

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Arquitetura / IA

## Contexto

A OpenAI é utilizada para compreender linguagem natural.

Uma alternativa seria permitir que a IA controlasse diretamente regras e ações.

## Decisão

Adotar permanentemente o princípio:

> A IA interpreta. O backend decide.

## A IA Pode

- interpretar intenção;
- classificar texto;
- auxiliar moderação;
- futuramente auxiliar recomendações.

## A IA Não Deve Controlar

- autorização;
- pagamentos;
- planos;
- propriedade;
- banco;
- score final;
- estados administrativos.

## Motivo

Modelos de IA não devem ser tratados como fonte autoritativa para regras determinísticas ou segurança.

---

# DEC-004 — OpenAI não Acessa Diretamente o Banco

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Arquitetura / Segurança

## Decisão

O fluxo será:

```text
USUÁRIO
   ↓
BACKEND
   ↓
OPENAI
   ↓
INTENÇÃO ESTRUTURADA
   ↓
BACKEND
   ↓
SUPABASE
```

Não:

```text
OPENAI
   ↓
BANCO PRIVILEGIADO
```

## Motivo

Isso mantém:

- controle;
- validação;
- autorização;
- auditabilidade;
- segurança.

---

# DEC-005 — Não Inventar Dados Ausentes

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Produto / Dados / IA

## Contexto

A IA já consegue identificar intenções como:

```text
delivery
aberto agora
preço
```

Porém o banco ainda não possui informação confiável suficiente para todos esses filtros.

## Decisão

O VemVer não deverá afirmar como verdadeiro um dado que não possui.

## Exemplo

Se não sabemos se uma loja faz delivery:

```text
DESCONHECIDO
```

não deve ser transformado em:

```text
SIM
```

nem automaticamente em:

```text
NÃO
```

## Motivo

Confiança é mais importante que preencher uma resposta artificialmente.

---

# DEC-006 — Ranking Inicial no Backend

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Arquitetura / Busca

## Contexto

A busca precisa combinar:

- correspondência textual;
- localização;
- score;
- desempate.

## Decisão

Na fase atual:

```text
SUPABASE
   ↓
RETORNA CANDIDATOS
   ↓
BACKEND
   ↓
CALCULA RELEVÂNCIA
   ↓
CALCULA DISTÂNCIA
   ↓
ORDENA
```

## Ordem Atual

```text
1. relevância textual

2. distância quando solicitada

3. score

4. nome
```

## Consequências

A estratégia atende o MVP atual.

Em escala maior poderá ser substituída por solução especializada.

---

# DEC-007 — Não Limitar por Fator Comercial Antes da Relevância

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Busca

## Contexto

Uma consulta antiga poderia ordenar ou limitar candidatos comercialmente cedo demais.

## Decisão

Obter candidatos relevantes antes da ordenação comercial final.

## Motivo

Evitar:

```text
TOP 20 COMERCIAIS
      ↓
LOJA RELEVANTE FICA FORA
```

antes do ranking real.

---

# DEC-008 — Score e Relevância são Conceitos Diferentes

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Ranking

## Decisão

Manter separação conceitual:

```text
RELEVÂNCIA
→ relação com o que foi procurado
```

```text
SCORE
→ sinais de força/qualidade/comercialização da loja
```

## Motivo

Uma loja pode possuir score alto e não ter relação com determinada busca.

---

# DEC-009 — Premium e Patrocinado já Fazem Parte do Score

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Ranking / Monetização

## Decisão

A base comercial atual utiliza:

```text
patrocinado = true
→ 60

senão premium = true
→ 30

senão
→ 0
```

Não somar novamente esses bônus separadamente no backend.

## Motivo

Evitar dupla contagem do fator comercial.

---

# DEC-010 — Atualizar Score por Cron

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Banco / Automação

## Contexto

O score poderia ser recalculado a cada visualização, favorito, produto ou avaliação.

## Decisão

Utilizar rotina periódica:

```text
/api/cron/atualizar-scores
```

acionando:

```text
atualizar_score_lojas()
```

## Motivo

Evitar recalcular toda a fórmula em cada pequena interação.

## Revisão Futura

Pode ser reconsiderado se requisitos de tempo real surgirem.

---

# DEC-011 — Busca deve Ignorar Diferenças Simples de Acentuação

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Busca / Banco

## Contexto

Usuários podem pesquisar:

```text
acai
```

enquanto o banco armazena:

```text
Açaí
```

## Decisão

Utilizar PostgreSQL `unaccent` na busca textual apropriada.

## Motivo

A acentuação não deve impedir descoberta.

---

# DEC-012 — Preservar Texto Original

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Dados

## Decisão

A remoção de acentos ocorre apenas na comparação.

O banco continua armazenando:

```text
Açaí Norte
```

e não:

```text
Acai Norte
```

## Motivo

Normalização de busca não deve degradar o dado original.

---

# DEC-013 — RPC de Busca Protegida

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Banco / Segurança

## Decisão

A função:

```text
buscar_lojas_sem_acentos(...)
```

não ficará disponível diretamente para:

```text
anon
authenticated
```

no fluxo privilegiado atual.

O backend executa a RPC com credencial apropriada.

---

# DEC-014 — RPC de Score Protegida

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Banco / Segurança

## Decisão

A função:

```text
atualizar_score_lojas()
```

teve execução removida de:

```text
public
anon
authenticated
```

e permanece acessível à camada privilegiada necessária.

---

# DEC-015 — Service Role Somente no Servidor

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Segurança

## Decisão

```text
SUPABASE_SERVICE_ROLE_KEY
```

nunca deve ser enviada ao navegador ou futuro aplicativo.

## Motivo

Ela possui privilégios elevados.

---

# DEC-016 — Secrets Nunca em `NEXT_PUBLIC_`

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Segurança

## Decisão

Secrets como:

```text
OPENAI_API_KEY
SUPABASE_SERVICE_ROLE_KEY
CRON_SECRET
credenciais privadas do Mercado Pago
```

não utilizarão prefixo:

```text
NEXT_PUBLIC_
```

---

# DEC-017 — APIs de IA Validam Antes da Chamada Externa

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** API / Segurança / Custo

## Decisão

Fluxo:

```text
REQUEST
   ↓
VALIDAÇÃO
   ↓
OPENAI
```

e nunca o contrário.

## Motivo

Reduz:

- abuso;
- custo;
- erro;
- chamadas desnecessárias.

---

# DEC-018 — Limites na API de Busca Inteligente

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** API / Segurança

## Decisão Atual

`POST /api/entender-intencao` possui:

```text
Body:
máximo 8.000 bytes

Mensagem:
máximo 300 caracteres

Cidade:
máximo 100 caracteres

UF:
2 letras

Latitude:
-90 a 90

Longitude:
-180 a 180
```

Latitude e longitude devem ser fornecidas juntas.

---

# DEC-019 — Limites na API de Moderação

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** API / Segurança

## Decisão Atual

`POST /api/moderar-texto` possui:

```text
Body:
máximo 8.000 bytes

Texto:
máximo 2.000 caracteres
```

O body precisa possuir estrutura JSON válida esperada.

---

# DEC-020 — Erros Internos não São Expostos

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Segurança / API

## Decisão

Detalhes técnicos permanecem no servidor.

O cliente recebe mensagem segura.

Evitar respostas contendo:

- `erro.message` bruto;
- stack trace;
- query;
- credencial;
- informação interna desnecessária.

---

# DEC-021 — Remover Endpoint de Teste da Produção

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Segurança / Engenharia

## Contexto

Existia:

```text
/api/testar-moderacao
```

utilizado para diagnóstico.

## Decisão

Remover a rota da aplicação publicada.

## Motivo

Endpoints temporários aumentam superfície de ataque e manutenção.

## Resultado

A rota retorna:

```text
404
```

na produção.

---

# DEC-022 — Proteger APIs de IA no Firewall da Vercel

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Infraestrutura / Segurança

## Decisão

Utilizar regra do Firewall da Vercel para:

```text
POST /api/entender-intencao
POST /api/moderar-texto
```

## Regra Atual

```text
Fixed Window
60 segundos
10 requisições
por IP
```

---

# DEC-023 — Rate Limit Compartilhado entre as Duas APIs de IA

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Infraestrutura

## Decisão Atual

O mesmo limite é compartilhado pelas duas rotas protegidas.

## Consequência

Por exemplo:

```text
5 buscas
+
5 moderações
=
10 requisições
```

dentro da janela.

## Revisão Futura

Separar limites poderá ser considerado quando tráfego real justificar.

---

# DEC-024 — Crons Devem Ser Protegidos por Secret

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Segurança / Automação

## Decisão

Rotas de cron que executam operações internas ou privilegiadas devem utilizar autorização server-side por secret.

O mecanismo adotado no projeto é:

```text
CRON_SECRET
```

## Estado Atual Auditado

```text
/api/cron/atualizar-scores
→ protegido por CRON_SECRET

/api/cron/verificar-planos
→ ainda não possui verificação explícita de CRON_SECRET no Route Handler
```

Portanto, a decisão arquitetural permanece válida, porém ainda não está completamente aplicada em todas as rotas de cron.

## Motivo

O caminho:

```text
/api/cron/
```

não é mecanismo de segurança.

Uma rota interna continua acessível por HTTP se não existir uma barreira real de autorização.

## Pendência

Adicionar validação explícita de:

```text
CRON_SECRET
```

ao endpoint:

```text
/api/cron/verificar-planos
```

antes de considerar esta decisão totalmente implementada.

---

# DEC-025 — Automação de Verificação de Planos

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Assinaturas

## Decisão

Manter rotina agendada:

```text
/api/cron/verificar-planos
```

para tratar o ciclo de assinaturas.

## Fluxos Existentes

- aviso de 7 dias;
- aviso de 3 dias;
- aviso de 1 dia;
- início de cortesia;
- encerramento de cortesia;
- retorno ao plano gratuito.

---

# DEC-026 — Banco Versionado por Migrations

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Banco / Engenharia

## Decisão

Mudanças estruturais do Supabase/PostgreSQL serão registradas em:

```text
supabase/migrations/
```

## Motivo

Permitir:

- rastreabilidade;
- reprodução;
- revisão;
- histórico.

---

# DEC-027 — Não Alterar Migration Histórica Aplicada

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Banco

## Decisão

Migration já aplicada não deve ser editada para representar uma mudança nova.

Usar:

```text
NOVA MUDANÇA
   ↓
NOVA MIGRATION
```

---

# DEC-028 — Baseline do Banco Preservado

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Banco

## Decisão

Preservar:

```text
20260813000743_remote_schema.sql
```

como baseline histórico.

Não utilizar esse arquivo como schema editável permanente.

---

# DEC-029 — Vercel como Plataforma Principal de Deploy Web

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Infraestrutura

## Decisão

Manter Vercel como plataforma principal da aplicação web enquanto atender adequadamente ao projeto.

## Recursos Utilizados

- deploy;
- Preview;
- Production;
- domínio;
- variáveis;
- crons;
- Firewall;
- logs.

---

# DEC-030 — Pull Request Antes da Produção

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Engenharia

## Decisão

Mudanças relevantes devem preferencialmente seguir:

```text
BRANCH
   ↓
PUSH
   ↓
PULL REQUEST
   ↓
PREVIEW
   ↓
MERGE
   ↓
PRODUCTION
```

---

# DEC-031 — `main` Representa a Base de Produção

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Git / Deploy

## Decisão

Evitar desenvolvimento direto na:

```text
main
```

para mudanças relevantes.

---

# DEC-032 — Validar Após Deploy

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Engenharia

## Decisão

```text
VERCEL READY
```

não significa automaticamente:

```text
FEATURE VALIDADA
```

Quando aplicável, realizar teste pós-deploy.

---

# DEC-033 — TypeScript e Build como Validações Mínimas Importantes

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Engenharia

## Ferramentas Atuais

```powershell
npx tsc --noEmit
```

e:

```powershell
npm run build
```

devem continuar sendo usados nas alterações relevantes.

---

# DEC-034 — Não Declarar Lint Global Limpo

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Dívida Técnica

## Contexto

O projeto possui dívida de lint legada.

## Decisão

Não afirmar:

```text
lint ✅
```

enquanto o lint global continuar com problemas existentes.

## Consequência

Código novo deve evitar piorar a situação, mas a limpeza geral será um trabalho separado.

---

# DEC-035 — Não Misturar Refactor Grande com Feature Pequena

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Engenharia

## Decisão

Evitar alterações não relacionadas no mesmo trabalho.

## Motivo

Facilita:

- revisão;
- teste;
- rollback;
- diagnóstico.

---

# DEC-036 — Não Excluir Componentes Duplicados sem Auditoria

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Engenharia

## Contexto

Existem componentes que aparentam duplicação.

## Decisão

Antes de remover:

```text
BUSCAR REFERÊNCIAS
   ↓
REVISAR IMPORTS
   ↓
COMPARAR IMPLEMENTAÇÃO
   ↓
TESTAR
   ↓
DECIDIR
```

---

# DEC-037 — Não Adicionar Tecnologia sem Problema Real

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Arquitetura

## Decisão

Não introduzir automaticamente:

- microserviços;
- Redis;
- Elasticsearch;
- Kafka;
- busca vetorial;
- filas;

apenas porque são tecnologias comuns em empresas maiores.

## Princípio

> A complexidade deve ser justificada por necessidade real.

---

# DEC-038 — Evoluir a Busca quando a Escala Exigir

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Arquitetura / Escalabilidade

## Contexto

A busca atual utiliza comparação parcial, `unaccent` e ranking no backend.

## Decisão

Manter essa solução durante a fase em que atende adequadamente.

## Possíveis Evoluções

Quando métricas justificarem:

- `pg_trgm`;
- full-text;
- índices especializados;
- vector search;
- mecanismo dedicado;
- cache.

---

# DEC-039 — Joinville como Cidade Piloto

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Estratégia de Produto

## Decisão

Utilizar Joinville como cidade inicial de validação.

## Objetivo

Validar:

- busca;
- densidade;
- lojistas;
- consumidores;
- monetização;
- ranking;
- geolocalização.

## Consequência

A arquitetura não deve ficar tecnicamente presa a uma única cidade.

---

# DEC-040 — Crescimento Cidade por Cidade

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Estratégia

## Decisão

Priorizar densidade e qualidade local antes de expansão indiscriminada.

Fluxo:

```text
VALIDAR UMA CIDADE
      ↓
APRENDER
      ↓
MELHORAR
      ↓
EXPANDIR
```

---

# DEC-041 — Produtos Devem Entrar Progressivamente na Descoberta

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Produto

## Decisão

A evolução da busca deverá permitir:

```text
BUSCA
   ↓
PRODUTO
   ↓
LOJA
```

e não somente:

```text
BUSCA
   ↓
LOJA
```

## Status

Planejado / em evolução futura.

---

# DEC-042 — Avaliação sem Sair da Página da Loja

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** UX / Produto

## Decisão

A experiência planejada será:

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

## Motivo

Evitar retirar o usuário desnecessariamente do contexto da loja.

## Evoluções Futuras

- fotos;
- editar;
- excluir;
- resposta do lojista.

---

# DEC-043 — Aplicativos Cliente e Lojista

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Produto / Mobile

## Decisão

A visão futura prevê experiências móveis específicas para:

```text
APP CLIENTE
```

e:

```text
APP LOJISTA
```

## Consequência

Regras importantes devem permanecer reutilizáveis no backend.

---

# DEC-044 — Tema Automático, Claro e Escuro

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** UX / Design System

## Decisão

Os futuros aplicativos e, quando aplicável, a experiência web deverão oferecer:

```text
Automático

Claro

Escuro
```

## Padrão

```text
Automático
```

deverá ser a opção padrão.

---

# DEC-045 — Tema através de Sistema Centralizado

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Frontend / Design System

## Decisão

Não criar:

```text
TelaClara.tsx

TelaEscura.tsx
```

para cada página.

Utilizar:

```text
TOKENS / VARIÁVEIS
        ↓
COMPONENTES
        ↓
CLARO OU ESCURO
```

## Motivo

Evitar duplicação de interface.

---

# DEC-046 — Preservar Identidade Laranja

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Marca

## Decisão

O laranja continuará sendo uma das principais cores de reconhecimento visual do VemVer em:

- tema claro;
- tema escuro;
- web;
- App Cliente;
- App Lojista.

A aplicação deverá garantir contraste adequado.

---

# DEC-047 — Arquitetura Web Primeiro, Mobile Depois

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Estratégia Técnica

## Contexto

Aplicativos móveis fazem parte da visão.

## Decisão

Consolidar primeiro a fundação web e backend.

Mobile deverá reutilizar as regras centrais posteriormente.

## Motivo

Evitar duplicar esforço antes da validação do produto.

---

# DEC-048 — Não Superdimensionar para Escala Futura

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Arquitetura

## Decisão

Construir para crescimento sem tentar antecipar toda a infraestrutura necessária para milhões de usuários.

## Princípio

```text
ESCALÁVEL
≠
COMPLEXO DESDE O PRIMEIRO DIA
```

---

# DEC-049 — Banco como Fonte da Realidade Comercial

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Dados

## Decisão

Informações de:

- loja;
- produto;
- localização;
- avaliação;
- plano;
- status;

devem vir das fontes persistentes confiáveis do sistema.

IA não substitui persistência.

---

# DEC-050 — Ausência de Coordenada não Exclui Loja

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Busca / Geolocalização

## Decisão

Uma loja sem coordenadas continua podendo participar dos resultados.

Sua distância será:

```text
null
```

## Motivo

Ausência de coordenada não significa ausência de relevância.

---

# DEC-051 — Distância Conhecida Antes da Desconhecida em Empates Relevantes de Proximidade

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Ranking

## Contexto

Quando o consumidor solicita proximidade e lojas possuem relevância equivalente:

## Decisão

Lojas com distância conhecida podem ser priorizadas pela proximidade.

Lojas sem coordenadas continuam disponíveis depois delas quando adequado.

---

# DEC-052 — Limitar Resultado Atual da Descoberta

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** API / Busca

## Decisão Atual

Retornar no máximo:

```text
20 resultados
```

depois do ranking.

## Revisão

Esse valor poderá evoluir com paginação e nova UX.

---

# DEC-053 — Mercado Pago como Provedor de Pagamento Atual

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Pagamentos

## Decisão

Manter Mercado Pago como integração atualmente existente para os planos.

## Princípio

O frontend nunca será autoridade sobre aprovação de pagamento.

---

# DEC-054 — Estado Financeiro Validado no Backend

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Segurança Financeira

## Decisão

Valores e estados críticos devem ser validados no servidor e/ou através do provedor.

Não confiar cegamente em:

```json
{
  "preco": 1,
  "pago": true
}
```

enviado pelo cliente.

---

# DEC-055 — Webhook Deve Evoluir para Idempotência Robusta

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Pagamentos / Arquitetura

## Decisão

O fluxo do webhook deverá suportar eventos repetidos sem ativação duplicada.

## Prioridade

Essa área precisa de auditoria antes de maior escala comercial.

---

# DEC-056 — Histórico de Assinaturas como Registro de Negócio

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Dados / Assinaturas

## Decisão

Eventos importantes de assinatura devem possuir histórico persistente quando aplicável.

## Motivo

Logs técnicos não substituem histórico comercial.

---

# DEC-057 — Documentação Faz Parte da Definition of Done

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Governança / Engenharia

## Decisão

Alteração estrutural relevante não deve ser considerada totalmente concluída enquanto a documentação relacionada estiver desatualizada.

---

# DEC-058 — Constituição do Projeto é Preservada

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Governança

## Decisão

O arquivo:

```text
docs/00_PROJECT_CONSTITUTION.md
```

é um documento fundamental do projeto.

Mudanças nele devem ser intencionais.

---

# DEC-059 — Fluxo Oficial de Desenvolvimento

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Governança

## Decisão

Preservar o fluxo:

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

Nem toda alteração exige modificar todas as camadas.

A sequência representa o princípio de planejamento.

---

# DEC-060 — Documentação Separada por Domínio

**Data de registro:** 17/08/2026
**Status:** ATIVA
**Categoria:** Governança

## Decisão

Organizar os documentos em:

```text
docs/
├── product/
├── architecture/
├── engineering/
└── governance/
```

## Motivo

Evitar um único documento gigantesco para tudo.

---

# 61. Como Criar uma Nova Decisão

Quando surgir uma decisão importante, adicionar no final:

```markdown
# DEC-061 — Nome da Decisão

**Data de registro:** DD/MM/AAAA
**Status:** ATIVA
**Categoria:** ...

## Contexto

Explique o problema.

## Decisão

Explique o que foi escolhido.

## Motivo

Explique por quê.

## Consequências

Explique impactos.

## Alternativas Consideradas

Quando relevante.

## Revisão Futura

Quando aplicável.
```

O próximo número deve ser sequencial.

---

# 62. Nunca Reescrever o Passado

Se uma decisão antiga for substituída:

não apagar.

Alterar:

```text
Status: SUBSTITUÍDA
```

e registrar a nova decisão.

Exemplo:

```text
DEC-020
Status: SUBSTITUÍDA POR DEC-085
```

---

# 63. Decisão Substituída

Uma decisão substituída continua importante porque explica:

> por que o sistema foi construído daquela maneira naquele período.

---

# 64. Alterações de Score

Mudanças relevantes na fórmula de score devem gerar registro aqui quando alterarem estratégia de ranking.

---

# 65. Alterações de Monetização

Mudanças importantes em:

```text
Premium

Patrocinado

Multiunidade

Franquia

limites

preços

ranking comercial
```

devem considerar novo registro de decisão.

---

# 66. Alterações de Segurança

Mudanças como:

```text
nova autenticação

novo papel

nova política RLS

nova regra WAF

novo rate limit

novo secret

nova RPC privilegiada
```

devem ser avaliadas para registro.

---

# 67. Alterações de Banco

Não é necessário registrar toda migration.

Registrar quando a migration representar decisão arquitetural ou de produto importante.

---

# 68. Alterações de Infraestrutura

Mudanças como:

```text
sair da Vercel

trocar Supabase

adicionar Redis

adicionar fila

adotar novo mecanismo de busca

criar staging separado
```

deverão possuir decisão formal.

---

# 69. Alterações de IA

Registrar decisões como:

- novo provedor;
- mudança de responsabilidade da IA;
- uso de embeddings;
- vector search;
- agentes;
- automações com efeito crítico.

---

# 70. Mudança de Cidade Piloto

Alterar a estratégia de expansão territorial deverá ser documentado quando representar mudança estratégica.

---

# 71. Decisões de Privacidade

Mudanças relacionadas a:

- localização;
- histórico;
- personalização;
- retenção;
- analytics;

podem exigir decisão formal.

---

# 72. Decisões não Devem Virar Burocracia

O objetivo é preservar conhecimento.

Não criar DEC apenas para:

```text
"decidimos aumentar o padding"
```

Utilizar bom senso.

---

# 73. Pergunta para Saber se Merece uma DEC

Perguntar:

> Daqui a um ano alguém poderá querer mudar isso e precisar entender por que foi feito dessa forma?

Se:

```text
SIM
```

provavelmente merece registro.

---

# 74. Relação com `CHANGELOG.md`

Este arquivo responde:

```text
POR QUE
```

O futuro:

```text
CHANGELOG.md
```

responderá principalmente:

```text
O QUE MUDOU
```

---

# 75. Relação com `ROADMAP.md`

O Roadmap registra:

```text
PARA ONDE VAMOS
```

Decisions registra:

```text
O QUE ESCOLHEMOS
E POR QUÊ
```

---

# 76. Relação com `ARCHITECTURE.md`

Architecture registra:

```text
COMO O SISTEMA ESTÁ ESTRUTURADO
```

Decisions registra:

```text
POR QUE ESSA ESTRUTURA FOI ESCOLHIDA
```

---

# 77. Relação com `BUSINESS_RULES.md`

Business Rules registra:

```text
QUAL REGRA DEVE SER CUMPRIDA
```

Decisions registra:

```text
POR QUE ALGUMAS REGRAS IMPORTANTES EXISTEM
```

---

# 78. Relação com Outros Documentos

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

../engineering/CODING_STANDARDS.md
../engineering/TEST_PLAN.md
../engineering/CHECKLIST.md

CHANGELOG.md
```

---

# 79. Governança em Uma Frase

> Uma decisão importante do VemVer não deve sobreviver apenas na memória de quem estava presente quando ela foi tomada.

---

# 80. Regra Final

Antes de mudar uma decisão estrutural existente, perguntar:

```text
Por que isso foi feito?

Qual problema resolvia?

O problema ainda existe?

O que quebra se mudarmos?

Qual alternativa temos?

Como migramos?

Como testamos?

Como voltamos?

Qual documentação precisa mudar?
```

---

# 81. Conclusão

O VemVer deverá crescer sem perder sua memória técnica e estratégica.

Ao longo dos anos, várias decisões atuais serão substituídas.

Isso é normal.

O problema não é mudar.

O problema seria mudar sem saber:

```text
O QUE EXISTIA

POR QUE EXISTIA

QUAL IMPACTO A MUDANÇA POSSUI
```

O objetivo deste documento é preservar esse conhecimento.

> Evoluir com contexto é melhor do que recomeçar por esquecimento.
