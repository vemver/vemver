# VemVer — Documentação Oficial

Este diretório reúne a documentação oficial do projeto VemVer.

O objetivo desta documentação é manter registradas as decisões de produto, arquitetura, engenharia, segurança, regras de negócio e evolução da plataforma.

O conhecimento do projeto não deve depender apenas da memória da equipe ou do código-fonte.

---

# 1. Documento Fundamental

## Constituição do Projeto

Arquivo:

`00_PROJECT_CONSTITUTION.md`

A Constituição define os princípios permanentes do VemVer, incluindo:

- missão;
- visão;
- valores;
- princípios de engenharia;
- fluxo oficial de desenvolvimento;
- definição de concluído;
- filosofia de longo prazo.

Toda decisão importante do projeto deve respeitar esse documento.

---

# 2. Produto

Diretório:

`product/`

Documentos:

## `MASTER_DOCUMENT.md`

Documento mestre do produto.

Deverá explicar:

- o que é o VemVer;
- qual problema resolve;
- proposta de valor;
- público-alvo;
- funcionamento geral;
- diferenciais;
- modelo de negócio;
- experiência do consumidor;
- experiência do lojista.

## `PRODUCT_VISION.md`

Visão de longo prazo do produto.

Deverá registrar:

- missão do produto;
- visão futura;
- posicionamento;
- objetivos estratégicos;
- princípios de experiência;
- direção da plataforma.

## `ROADMAP.md`

Roadmap oficial do projeto.

Deverá registrar:

- fases do desenvolvimento;
- funcionalidades concluídas;
- funcionalidades em andamento;
- próximas prioridades;
- melhorias futuras;
- expansão da plataforma.

## `BUSINESS_RULES.md`

Regras oficiais de negócio.

Deverá incluir regras relacionadas a:

- usuários;
- lojistas;
- lojas;
- produtos;
- avaliações;
- favoritos;
- planos;
- assinaturas;
- patrocinados;
- premium;
- franquias;
- limites;
- ranking;
- moderação;
- pagamentos.

---

# 3. Arquitetura

Diretório:

`architecture/`

Documentos:

## `ARCHITECTURE.md`

Arquitetura geral do VemVer.

Deverá documentar:

- frontend;
- backend;
- banco de dados;
- autenticação;
- inteligência artificial;
- pagamentos;
- deploy;
- serviços externos;
- fluxo entre os componentes.

## `DATABASE.md`

Documentação do banco de dados.

Deverá registrar:

- tabelas;
- relacionamentos;
- funções;
- migrations;
- políticas de segurança;
- RLS;
- triggers;
- índices;
- regras de acesso.

## `API.md`

Documentação das APIs internas.

Deverá registrar:

- rota;
- método HTTP;
- finalidade;
- entrada;
- saída;
- autenticação;
- validações;
- erros;
- dependências externas.

## `SECURITY.md`

Modelo de segurança da plataforma.

Deverá incluir:

- proteção de secrets;
- service role;
- autenticação;
- autorização;
- rate limit;
- proteção das APIs;
- validação de entrada;
- tratamento de erros;
- moderação;
- segurança de cron jobs;
- regras de produção.

## `DEPLOY.md`

Fluxo oficial de deploy.

Deverá registrar:

- branches;
- commits;
- Pull Requests;
- checks;
- Vercel Preview;
- merge;
- Production;
- validações pós-deploy;
- rollback.

---

# 4. Engenharia

Diretório:

`engineering/`

Documentos:

## `CODING_STANDARDS.md`

Padrões oficiais de desenvolvimento.

Deverá definir:

- organização de arquivos;
- nomenclatura;
- TypeScript;
- componentes;
- APIs;
- funções;
- tratamento de erros;
- reutilização de código;
- comentários;
- segurança.

## `TEST_PLAN.md`

Plano de testes do VemVer.

Deverá incluir:

- testes de TypeScript;
- build;
- APIs;
- banco;
- migrations;
- OpenAI;
- pagamentos;
- produção;
- regressão.

## `CHECKLIST.md`

Checklist antes de considerar uma funcionalidade concluída.

---

# 5. Governança

Diretório:

`governance/`

Documentos:

## `DECISIONS.md`

Registro das principais decisões técnicas e de produto.

Cada decisão importante deverá informar:

- data;
- contexto;
- decisão;
- motivo;
- impacto;
- alternativas consideradas.

## `CHANGELOG.md`

Histórico das principais evoluções da plataforma.

Deverá registrar mudanças relevantes por versão ou fase.

---

# 6. Tecnologias Principais

Atualmente o VemVer utiliza principalmente:

- Next.js;
- React;
- TypeScript;
- Tailwind CSS;
- Supabase;
- PostgreSQL;
- OpenAI;
- Mercado Pago;
- Vercel;
- Git;
- GitHub.

As versões e detalhes técnicos devem ser mantidos nos documentos de arquitetura e engenharia.

---

# 7. Fluxo de Desenvolvimento

O desenvolvimento segue a Constituição do Projeto.

Fluxo geral:

```text
IDEIA
  ↓
ANÁLISE
  ↓
ARQUITETURA
  ↓
BANCO DE DADOS
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

Nem toda alteração precisa modificar todas as camadas.

O fluxo representa a ordem de raciocínio e validação que deve orientar o desenvolvimento.

---

# 8. Regra de Atualização da Documentação

A documentação oficial deve acompanhar a evolução real do sistema.

Sempre que uma mudança relevante alterar:

- produto;
- regra de negócio;
- arquitetura;
- banco de dados;
- API;
- segurança;
- infraestrutura;
- processo de engenharia;

os documentos relacionados deverão ser revisados.

A documentação não deve apresentar uma funcionalidade futura como se já estivesse em produção.

Quando necessário, utilizar termos como:

- planejado;
- proposto;
- em desenvolvimento;
- em evolução;
- futuro.

---

# 9. Estado Atual da Documentação

A estrutura oficial atualmente é:

```text
docs/
├── 00_PROJECT_CONSTITUTION.md
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

Esses documentos formam a base oficial de conhecimento do projeto.

---

# 10. Objetivo Final

A documentação do VemVer deve permitir que qualquer pessoa autorizada que entre no projeto consiga compreender:

```text
O QUE ESTAMOS CONSTRUINDO

POR QUE ESTAMOS CONSTRUINDO

COMO O SISTEMA FUNCIONA

QUAIS REGRAS DEVEM SER RESPEITADAS

COMO DESENVOLVER

COMO TESTAR

COMO PUBLICAR

POR QUE DECISÕES IMPORTANTES FORAM TOMADAS
```

O princípio é simples:

> conhecimento importante do VemVer deve existir de forma persistente, organizada e rastreável.
