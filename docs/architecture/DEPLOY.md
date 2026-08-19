# VemVer — Deploy e Ambientes

## Documento

**Projeto:** VemVer
**Documento:** Deploy, Ambientes e Publicação
**Versão:** 1.0.0
**Status:** Ativo
**Última atualização:** 17/08/2026

---

# 1. Objetivo

Este documento descreve como o VemVer é desenvolvido, validado e publicado.

Seu objetivo é registrar:

- fluxo Git;
- branches;
- Pull Requests;
- Vercel Preview;
- produção;
- variáveis de ambiente;
- Supabase;
- migrations;
- crons;
- Firewall;
- testes antes e depois do deploy;
- rollback;
- regras para publicação segura.

Deploy não deve ser tratado apenas como:

```text
"mandar o código para a internet"
```

Ele faz parte do processo de engenharia do VemVer.

---

# 2. Infraestrutura Principal

A aplicação web utiliza:

```text
GITHUB
   ↓
VERCEL
   ↓
NEXT.JS
```

Os serviços externos principais incluem:

```text
SUPABASE

OPENAI

MERCADO PAGO
```

---

# 3. Domínio de Produção

O domínio principal atual é:

```text
https://vemverapp.com.br
```

Testes finais importantes devem considerar esse domínio após o deploy de produção.

---

# 4. Branch Principal

A branch principal é:

```text
main
```

Ela representa a versão destinada à produção.

Regra:

> evitar desenvolvimento de features diretamente na `main`.

---

# 5. Branches de Trabalho

Mudanças relevantes devem preferencialmente ser realizadas em branches próprias.

Exemplos:

```text
feature/nome-da-feature

fix/nome-do-problema

docs/nome-da-documentacao

refactor/nome-da-area
```

---

# 6. Exemplos Já Utilizados

Branches utilizadas anteriormente incluem padrões como:

```text
feature/ia-conversacional

feature/protecao-api-ia

feature/protecao-api-moderacao

docs/documentacao-mestra
```

---

# 7. Objetivo da Branch

Uma branch deve representar uma mudança compreensível.

Evitar misturar na mesma branch:

```text
nova feature

+

refactor grande

+

mudança de banco

+

correções não relacionadas

+

documentação aleatória
```

quando puderem ser tratados separadamente.

---

# 8. Fluxo Geral

Fluxo recomendado:

```text
MAIN ATUALIZADA
      ↓
CRIAR BRANCH
      ↓
DESENVOLVER
      ↓
TESTAR LOCALMENTE
      ↓
REVISAR DIFF
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
PRODUCTION
      ↓
TESTE PÓS-DEPLOY
```

---

# 9. Antes de Criar uma Branch

Antes de iniciar trabalho relevante:

```text
git status
```

deve ser revisado.

Quando necessário, atualizar a `main` antes de criar a nova branch.

O objetivo é evitar começar uma feature sobre uma base desatualizada.

---

# 10. Verificação de Estado

Comando útil:

```powershell
git status
```

ou:

```powershell
git status --short --untracked-files=all
```

Esse comando mostra:

- arquivos modificados;
- arquivos novos;
- arquivos removidos;
- estado do repositório.

---

# 11. Verificação de Diff

Antes de commit:

```powershell
git diff
```

deve ser utilizado quando necessário para revisar alterações.

Também utilizamos:

```powershell
git diff --check
```

para identificar problemas como whitespace incorreto.

---

# 12. `git diff --check`

Resultado ideal:

```text
nenhuma saída
```

Isso significa que o Git não encontrou problemas desse tipo no diff.

---

# 13. Commit

Commits devem representar unidades compreensíveis de trabalho.

Exemplos:

```text
feat: adiciona proteção da API de IA

fix: corrige ranking por distância

docs: adiciona documentação de arquitetura

refactor: reorganiza módulo de busca
```

---

# 14. Não Commitar Secrets

Antes de commit:

> confirmar que nenhum secret foi incluído.

Especial atenção a:

```text
.env.local

tokens

chaves

prints

arquivos temporários

logs
```

---

# 15. Push

Depois do commit:

```powershell
git push
```

ou:

```powershell
git push -u origin nome-da-branch
```

quando for o primeiro push da branch.

---

# 16. Pull Request

Mudanças relevantes devem passar por Pull Request antes da entrada na `main`.

O PR permite revisar:

- arquivos;
- diff;
- checks;
- build;
- Preview;
- contexto da mudança.

---

# 17. Preview da Vercel

Branches e Pull Requests podem gerar deployments de Preview.

Fluxo:

```text
BRANCH
   ↓
PUSH
   ↓
VERCEL
   ↓
PREVIEW
```

Isso permite testar a mudança antes da produção.

---

# 18. Preview não é Produção

O fato de funcionar em Preview não garante automaticamente que funcionará em produção.

Podem existir diferenças de:

- variáveis;
- domínio;
- proteção;
- dados;
- integrações;
- configuração.

---

# 19. Proteção de Preview

O projeto utiliza proteção de acesso da Vercel nos ambientes de Preview.

Isso pode impedir acesso público direto sem autenticação ou mecanismo de bypass autorizado.

Credenciais de bypass devem ser tratadas como secrets.

---

# 20. Secrets de Preview

Nunca:

- publicar secret de bypass;
- colocar em documentação;
- colocar em commit;
- enviar para código frontend.

Se um segredo for exposto:

```text
REVOGAR
   ↓
GERAR NOVO
   ↓
ATUALIZAR CONFIGURAÇÃO
```

---

# 21. Produção

Após merge na:

```text
main
```

a Vercel executa o deploy de produção de acordo com a configuração do projeto.

---

# 22. Produção não Termina em `Ready`

A Vercel pode indicar:

```text
Ready
```

mas isso significa apenas que o deployment foi concluído pela plataforma.

Ainda precisamos confirmar funcionalidade quando a mudança for relevante.

---

# 23. Teste Pós-Deploy

Fluxo:

```text
DEPLOY READY
    ↓
ABRIR PRODUÇÃO
    ↓
TESTAR FUNCIONALIDADE
    ↓
CONFIRMAR RESULTADO
```

Especialmente importante para:

- APIs;
- login;
- pagamentos;
- busca;
- banco;
- crons;
- integrações.

---

# 24. Build Local

Antes de alterações relevantes serem consideradas prontas:

```powershell
npm run build
```

deve ser executado quando aplicável.

---

# 25. Build Atual

O script de build utiliza:

```text
next build
```

O build valida a aplicação para produção.

---

# 26. TypeScript

Validação adicional utilizada:

```powershell
npx tsc --noEmit
```

Esse comando verifica erros de TypeScript sem gerar arquivos de saída.

---

# 27. Lint

Existe débito técnico de lint no projeto.

Portanto:

> não declarar que o lint global está aprovado enquanto os problemas legados ainda existirem.

Mudanças novas devem evitar aumentar o débito.

---

# 28. Desenvolvimento Local

O servidor de desenvolvimento pode ser iniciado com:

```powershell
npx next dev --webpack
```

Esse comando é utilizado quando queremos executar explicitamente com Webpack.

---

# 29. URL Local

Normalmente o projeto fica disponível em endereço semelhante a:

```text
http://localhost:3000
```

A porta pode mudar se estiver ocupada.

---

# 30. Variáveis de Ambiente

A aplicação depende de variáveis configuradas por ambiente.

Ambientes principais:

```text
LOCAL

PREVIEW

PRODUCTION
```

---

# 31. `.env.local`

No desenvolvimento local, variáveis podem ser armazenadas em:

```text
.env.local
```

Esse arquivo deve permanecer fora do Git quando contém credenciais.

---

# 32. Vercel Environment Variables

Na Vercel, as variáveis devem ser configuradas através das configurações do projeto.

Elas podem possuir escopos como:

```text
Production

Preview

Development
```

---

# 33. Variáveis Importantes

Entre as variáveis relevantes estão:

```text
OPENAI_API_KEY

SUPABASE_SERVICE_ROLE_KEY

CRON_SECRET

credenciais do Mercado Pago

configurações públicas do Supabase
```

---

# 34. `OPENAI_API_KEY`

Utilizada pelas funcionalidades de IA.

Deve permanecer:

```text
SERVER ONLY
```

---

# 35. `SUPABASE_SERVICE_ROLE_KEY`

Utilizada por operações privilegiadas server-side.

Nunca deve aparecer no navegador.

---

# 36. `CRON_SECRET`

A variável:

```text
CRON_SECRET
```

é utilizada como segredo server-side para autorização de rotas de cron que implementam explicitamente essa validação.

No estado atual auditado:

```text
/api/cron/atualizar-scores
→ utiliza CRON_SECRET

/api/cron/verificar-planos
→ ainda não possui verificação explícita de CRON_SECRET no Route Handler
```

Portanto, a presença da variável no ambiente não significa que todos os crons estejam automaticamente protegidos.

---

# 37. Mercado Pago

Credenciais privadas relacionadas ao Mercado Pago também devem permanecer apenas no servidor.

---

# 38. Variáveis `NEXT_PUBLIC_`

Variáveis com prefixo:

```text
NEXT_PUBLIC_
```

podem ser expostas ao código do cliente.

Utilizar apenas para informações realmente públicas.

---

# 39. Mudança em Variável

Depois de modificar uma variável na Vercel, pode ser necessário novo deployment para que a alteração seja aplicada corretamente à versão publicada.

Nunca assumir que a aplicação em execução já recebeu o novo valor sem verificar.

---

# 40. Ambientes Diferentes

Uma variável existente em Production pode não existir em Preview.

Por isso, quando um Preview falhar:

> verificar também as variáveis configuradas para aquele ambiente.

---

# 41. Supabase

O banco principal está hospedado no Supabase.

O projeto local é conectado ao projeto remoto através do Supabase CLI.

---

# 42. Supabase Link

O projeto utiliza vínculo com o ambiente Supabase correspondente.

Mudanças de banco devem confirmar o projeto correto antes de aplicar migrations.

---

# 43. Risco de Ambiente Errado

Antes de executar operações destrutivas ou migrations:

```text
QUAL PROJETO ESTÁ CONECTADO?
```

deve estar claro.

Erro de ambiente pode afetar dados de produção.

---

# 44. Migrations

Alterações estruturais do banco devem utilizar:

```text
supabase/migrations/
```

---

# 45. Ordem Banco → Código

Mudanças de schema podem exigir ordem específica de publicação.

Exemplo seguro em alguns cenários:

```text
MIGRATION COMPATÍVEL
      ↓
CÓDIGO NOVO
      ↓
LIMPEZA POSTERIOR
```

---

# 46. Mudança Destrutiva

Evitar publicar simultaneamente:

```text
REMOVER COLUNA
+
CÓDIGO ANTIGO AINDA USA COLUNA
```

Mudanças incompatíveis precisam de transição.

---

# 47. Banco e Rollback

Rollback de código não significa automaticamente rollback de banco.

Se uma migration já alterou dados:

```text
git revert
```

não desfaz o banco.

Por isso migrations destrutivas exigem cuidado maior.

---

# 48. Backup

Antes de mudanças de banco de alto risco, deve-se considerar:

- backup;
- possibilidade de recuperação;
- impacto da migration;
- plano de reversão.

---

# 49. Crons

A Vercel executa rotinas agendadas definidas em:

```text
vercel.json
```

---

# 50. Cron de Planos

Configuração atual:

```text
/api/cron/verificar-planos
```

Agenda:

```text
0 3 * * *
```

---

# 51. Cron de Score

Configuração atual:

```text
/api/cron/atualizar-scores
```

Agenda:

```text
0 4 * * *
```

---

# 52. Cron e Fuso Horário

Expressões cron devem ser interpretadas conforme a plataforma responsável pela execução.

Nunca alterar horários assumindo automaticamente que a expressão representa o horário local brasileiro.

Verificar documentação e configuração antes de mudanças.

---

# 53. Proteção dos Crons

No estado atual, os dois crons possuem níveis diferentes de proteção explícita.

```text
/api/cron/atualizar-scores
→ protegido por CRON_SECRET

/api/cron/verificar-planos
→ proteção explícita de CRON_SECRET ainda pendente
```

A rota de score já valida o segredo antes de executar a operação privilegiada.

A rota de planos ainda precisa receber essa mesma camada de autorização no Route Handler.

Essa diferença deve permanecer registrada até que o código seja corrigido.

---

# 54. Teste Manual do Cron

Quando necessário, uma rotina pode ser testada manualmente com autorização adequada.

Nunca enviar o valor real do secret em:

- prints públicos;
- Git;
- documentação;
- chat público.

---

# 55. Firewall

O VemVer utiliza Firewall da Vercel.

Existe proteção específica para APIs que utilizam OpenAI.

---

# 56. Regra Atual

Nome atual:

```text
OpenAI - Rate Limit
```

Protege:

```text
/api/entender-intencao

/api/moderar-texto
```

---

# 57. Método

A regra considera:

```text
POST
```

---

# 58. Rate Limit

Configuração atual:

```text
10 requisições

a cada 60 segundos

por IP
```

---

# 59. Compartilhamento

As duas APIs compartilham esse limite.

Isso deve ser considerado ao testar.

---

# 60. Validação do Firewall

Depois de modificar regra de Firewall:

> testar comportamento real.

Não considerar a regra correta apenas porque foi salva no painel.

---

# 61. Teste de Rate Limit

Nos testes, chamadas normais foram aceitas até o limite configurado.

Depois:

```text
HTTP 429
```

confirmou atuação do Firewall.

---

# 62. Firewall e Deploy

Configuração do Firewall é parte da infraestrutura da Vercel.

Ela não fica necessariamente representada no mesmo commit do código.

Por isso deve permanecer documentada.

---

# 63. Configuração Fora do Git

Algumas configurações importantes vivem fora do repositório.

Exemplos:

```text
Vercel Environment Variables

Vercel Firewall

proteção de Preview

configurações do Supabase

configurações do Mercado Pago
```

---

# 64. Consequência

O Git sozinho não representa 100% da produção.

Para reproduzir completamente o ambiente, precisamos também de documentação de infraestrutura.

---

# 65. OpenAI

Mudanças em funcionalidades que utilizam OpenAI devem testar:

- variável presente;
- validação;
- resposta;
- erro;
- limite;
- Firewall.

---

# 66. Mercado Pago

Mudanças em pagamento precisam de validação especial antes da produção.

Devem considerar:

- credenciais;
- ambiente;
- criação de pagamento;
- callback;
- webhook;
- status interno;
- duplicidade.

---

# 67. Webhook

O endpoint atual:

```text
/api/webhook/mercadopago
```

deve permanecer acessível ao provedor externo conforme a configuração necessária.

Proteções não podem impedir legitimamente a comunicação do Mercado Pago.

---

# 68. Webhook e Preview

Não assumir que um webhook configurado para produção também funcionará automaticamente em Preview.

Endpoints externos podem estar apontando para URLs específicas.

---

# 69. Domínios

Mudanças de domínio podem afetar:

- redirects;
- autenticação;
- callbacks;
- webhooks;
- links;
- SEO;
- CORS;
- cookies.

Devem ser planejadas.

---

# 70. DNS

Alterações de DNS devem ser feitas com cautela.

Antes:

- registrar estado atual;
- entender registros;
- verificar destino;
- considerar propagação.

---

# 71. HTTPS

A produção deve operar através de HTTPS.

A Vercel gerencia a camada HTTPS do domínio conectado.

---

# 72. GitHub e Vercel

A integração permite que alterações enviadas ao repositório gerem deployments.

Por isso:

> push é uma ação com impacto operacional.

Não enviar código não testado apenas para "ver se funciona na Vercel".

---

# 73. Preview como Ambiente de Validação

Preferir:

```text
LOCAL
   ↓
PREVIEW
   ↓
PRODUCTION
```

para mudanças relevantes.

---

# 74. Testes em Local

O ambiente local é adequado para validar:

- interface;
- compilação;
- TypeScript;
- APIs;
- lógica;
- integração com ambiente configurado.

---

# 75. Testes em Preview

Preview ajuda a validar:

- comportamento em infraestrutura Vercel;
- build remoto;
- variáveis do ambiente;
- rotas;
- integração.

---

# 76. Testes em Produção

Produção confirma:

- domínio real;
- variáveis reais;
- Firewall real;
- integrações reais;
- deploy final.

---

# 77. Não Testar Destrutivamente em Produção

Testes de produção devem ser planejados para não:

- cobrar clientes reais;
- excluir registros;
- alterar assinaturas indevidamente;
- inundar banco;
- criar spam.

---

# 78. Testes de API

Antes de merge de APIs críticas, testar cenários como:

```text
válido

inválido

não autorizado

body grande

tipo incorreto

serviço externo falhando

rate limit
```

---

# 79. Teste da Busca Inteligente

Uma mudança na busca deverá validar, quando aplicável:

- termos simples;
- acentos;
- cidade;
- UF;
- proximidade;
- loja sem coordenada;
- relevância;
- resultados vazios.

---

# 80. Teste de Moderação

Uma mudança na moderação deverá validar:

- texto permitido;
- texto sinalizado quando possível;
- body inválido;
- limite;
- Content-Type;
- erro externo.

---

# 81. Teste de Banco

Depois de migration:

- verificar histórico;
- testar função;
- testar permissão;
- testar aplicação que depende dela.

---

# 82. Build Remoto

Mesmo quando:

```text
npm run build
```

passa localmente, o build remoto também precisa ser observado.

Diferenças de:

- sistema operacional;
- variáveis;
- ambiente;
- arquivos ignorados;

podem causar problemas.

---

# 83. Arquivos Não Commitados

Se funciona localmente mas falha em Preview:

> verificar se o arquivo necessário foi realmente commitado.

---

# 84. Case Sensitivity

Ambientes de deploy podem tratar diferenças de maiúsculas e minúsculas em caminhos de forma mais rigorosa que Windows.

Exemplo:

```text
Componente.tsx
```

é diferente de:

```text
componente.tsx
```

em determinados ambientes.

---

# 85. Imports

Imports precisam respeitar os caminhos reais.

Não depender de comportamento permissivo do ambiente local.

---

# 86. Alias TypeScript

O projeto utiliza:

```text
@/*
```

apontando para:

```text
./src/*
```

Isso deve ser considerado ao mover arquivos.

---

# 87. `src/app/lib`

As bibliotecas compartilhadas atuais encontram-se principalmente sob:

```text
src/app/lib/
```

Mudar essa estrutura exige revisar imports.

---

# 88. Rollback de Código

Quando uma mudança em produção apresenta problema grave, opções incluem:

- redeploy de versão anterior;
- revert no Git;
- hotfix em branch própria.

A melhor estratégia depende do incidente.

---

# 89. Rollback não Deve Ser Improvisado

Antes de uma mudança de risco alto:

> saber como voltar.

Especialmente quando envolver:

- banco;
- pagamento;
- autenticação;
- migrations.

---

# 90. Revert no Git

Um revert cria um novo commit desfazendo alterações anteriores.

Isso é diferente de apagar o histórico.

Preservar histórico costuma ser preferível.

---

# 91. Rollback de Banco

Uma migration pode exigir uma migration reversa específica.

Nunca assumir:

```text
REVERT DO CÓDIGO
=
BANCO VOLTOU
```

---

# 92. Hotfix

Problemas críticos em produção podem justificar uma branch:

```text
fix/...
```

ou:

```text
hotfix/...
```

O processo deve continuar rastreável.

---

# 93. Incidente em Produção

Fluxo recomendado:

```text
IDENTIFICAR
   ↓
MEDIR IMPACTO
   ↓
CONTER
   ↓
CORRIGIR / REVERTER
   ↓
TESTAR
   ↓
PUBLICAR
   ↓
VALIDAR
   ↓
DOCUMENTAR
```

---

# 94. Logs de Produção

Logs da Vercel podem ajudar a investigar:

- APIs;
- exceções;
- crons;
- integrações;
- erros de servidor.

Não devem ser considerados armazenamento permanente de histórico de negócio.

---

# 95. Histórico de Negócio

Eventos importantes devem permanecer no banco quando necessário.

Exemplo:

```text
histórico de assinaturas
```

não deve depender apenas de logs da Vercel.

---

# 96. Observabilidade

A infraestrutura deverá futuramente evoluir para acompanhar:

- disponibilidade;
- erros;
- latência;
- falhas de cron;
- OpenAI;
- pagamentos;
- banco;
- rate limit.

---

# 97. Alertas

No futuro, alertas importantes poderão incluir:

```text
deploy quebrado

cron falhando

pico de 500

webhook falhando

OpenAI indisponível

banco indisponível
```

---

# 98. Deploy e Documentação

Uma mudança em infraestrutura deve atualizar documentação quando necessário.

Exemplos:

- nova variável;
- nova regra WAF;
- novo cron;
- novo serviço;
- nova branch strategy;
- novo ambiente.

---

# 99. Deploy e Decisões

Mudanças de infraestrutura com impacto estrutural deverão ser registradas também em:

```text
docs/governance/DECISIONS.md
```

quando aplicável.

---

# 100. Dependências

Antes de deploy após atualização relevante de dependências:

```text
npm install
```

e os testes necessários devem ser executados.

Mudanças de versão principal exigem atenção adicional.

---

# 101. Lockfile

O lockfile deve permanecer sincronizado quando dependências forem alteradas.

Não editar manualmente sem necessidade.

---

# 102. `npm audit`

Alertas de dependência devem ser analisados.

Não executar automaticamente:

```text
npm audit fix --force
```

em produção sem revisar impactos.

---

# 103. Preview e Banco de Produção

Uma área que precisa sempre ser observada é quais dados um Preview está utilizando.

Se um Preview se conectar ao mesmo banco de produção:

> testes destrutivos não são seguros apenas porque a URL é de Preview.

---

# 104. Ambientes de Banco

Conforme o produto crescer, deverá ser avaliada uma separação mais forte entre:

```text
DESENVOLVIMENTO

STAGING / PREVIEW

PRODUÇÃO
```

principalmente para dados e pagamentos.

---

# 105. Staging

Um ambiente dedicado de staging poderá ser criado quando a complexidade operacional justificar.

Ele poderá permitir testes mais completos antes da produção.

Não criar apenas por formalidade.

---

# 106. Feature Flags

Com maior escala, algumas funcionalidades poderão utilizar feature flags.

Isso permitiria:

- ativação gradual;
- teste controlado;
- rollback lógico rápido.

A necessidade deverá ser avaliada futuramente.

---

# 107. Deploy Gradual

Quando o VemVer crescer significativamente, poderá ser útil adotar estratégias de publicação mais graduais.

No estágio atual, o fluxo branch → Preview → main → Production é adequado.

---

# 108. Aplicativos Mobile

Os futuros aplicativos Cliente e Lojista terão processos próprios de publicação.

Possível fluxo futuro:

```text
CÓDIGO
   ↓
BUILD MOBILE
   ↓
TESTE
   ↓
LOJA DE APLICATIVOS
   ↓
REVISÃO
   ↓
PUBLICAÇÃO
```

Esse processo será documentado quando o desenvolvimento mobile começar.

---

# 109. App Cliente e App Lojista

A direção atual prevê experiências separadas para:

```text
APP CLIENTE
```

e:

```text
APP LOJISTA
```

mas ambas deverão reutilizar as APIs e regras centrais do VemVer quando adequado.

---

# 110. Tema Claro e Escuro

A futura configuração:

```text
Automático
Claro
Escuro
```

é uma preferência de interface.

Ela não deverá exigir infraestrutura separada nem deploy distinto.

---

# 111. Checklist antes do Commit

Antes de commit importante:

```text
[ ] mudança está no arquivo correto

[ ] não existem secrets

[ ] não existem arquivos temporários

[ ] diff revisado

[ ] git diff --check limpo

[ ] funcionalidade testada
```

---

# 112. Checklist antes do Push

```text
[ ] branch correta

[ ] commits corretos

[ ] nenhum arquivo indevido

[ ] build/testes necessários executados

[ ] banco compatível
```

---

# 113. Checklist do Pull Request

```text
[ ] título claro

[ ] descrição da mudança

[ ] impacto identificado

[ ] migrations incluídas quando necessárias

[ ] documentação atualizada

[ ] Preview disponível

[ ] checks revisados

[ ] testes realizados
```

---

# 114. Checklist antes do Merge

```text
[ ] Preview validado

[ ] erros revisados

[ ] build aprovado

[ ] TypeScript aprovado quando aplicável

[ ] migration validada

[ ] secrets configurados

[ ] integrações revisadas

[ ] risco compreendido
```

---

# 115. Checklist Pós-Deploy

Depois da produção:

```text
[ ] deployment Ready

[ ] domínio abre

[ ] página alterada funciona

[ ] API alterada funciona

[ ] banco responde

[ ] integração externa funciona

[ ] não surgiram erros inesperados

[ ] comportamento principal confirmado
```

Nem todos os itens se aplicam a todas as mudanças.

---

# 116. Checklist para Migration

```text
[ ] projeto Supabase correto

[ ] SQL revisado

[ ] backup considerado

[ ] dados existentes compatíveis

[ ] migration criada

[ ] migration aplicada

[ ] histórico confirmado

[ ] função/query testada

[ ] código compatível

[ ] arquivo commitado
```

---

# 117. Checklist para Nova Variável

```text
[ ] nome definido

[ ] é pública ou secret?

[ ] local configurado

[ ] Preview configurado quando necessário

[ ] Production configurado quando necessário

[ ] código trata ausência

[ ] nenhum valor real entrou no Git
```

---

# 118. Checklist para Novo Cron

```text
[ ] endpoint protegido

[ ] CRON_SECRET revisado

[ ] operação idempotente

[ ] horário definido

[ ] vercel.json atualizado

[ ] teste manual realizado

[ ] resposta de erro adequada

[ ] logs suficientes
```

---

# 119. Checklist para Nova Integração Externa

```text
[ ] finalidade clara

[ ] secret server-side

[ ] custo conhecido

[ ] timeout considerado

[ ] falha considerada

[ ] retry analisado

[ ] rate limit considerado

[ ] dados enviados revisados

[ ] privacidade revisada

[ ] documentação atualizada
```

---

# 120. O que não Fazer

Evitar:

```text
push direto na main sem necessidade

deploy sem testar

migration manual esquecida

secret no Git

secret em NEXT_PUBLIC_

mudança financeira sem auditoria

apagar migration antiga

corrigir produção sem registrar

considerar Preview igual a Production

considerar Ready igual a funcionalidade validada
```

---

# 121. Definition of Done para Deploy

Uma alteração relevante pode ser considerada publicada quando:

```text
CÓDIGO CORRETO
      ↓
TESTADO
      ↓
VERSIONADO
      ↓
REVISADO
      ↓
DEPLOYADO
      ↓
VALIDADO
      ↓
DOCUMENTADO
```

---

# 122. Relação com a Constituição

O fluxo oficial do projeto definido na Constituição inclui:

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

Deploy deve respeitar esse processo.

---

# 123. Relação com Outros Documentos

Este documento deve ser lido junto com:

```text
../00_PROJECT_CONSTITUTION.md

../product/MASTER_DOCUMENT.md
../product/PRODUCT_VISION.md
../product/ROADMAP.md
../product/BUSINESS_RULES.md

ARCHITECTURE.md
DATABASE.md
API.md
SECURITY.md

../engineering/CODING_STANDARDS.md
../engineering/TEST_PLAN.md
../engineering/CHECKLIST.md

../governance/DECISIONS.md
../governance/CHANGELOG.md
```

---

# 124. Deploy em Uma Frase

> O deploy do VemVer é um processo controlado que transforma uma alteração local testada em uma mudança rastreável, revisada e validada na produção.

---

# 125. Regra Final

Antes de publicar uma mudança importante, precisamos conseguir responder:

```text
O que mudou?

Por que mudou?

Em qual branch?

Foi testado?

Build passou?

Banco mudou?

Migration existe?

Secrets estão configurados?

Preview foi validado?

Existe risco?

Como voltamos se der errado?

Como validamos em produção?
```

Se essas respostas não estiverem claras:

> o deploy ainda não está pronto.

---

# 126. Conclusão

O processo atual de publicação do VemVer possui uma fundação sólida baseada em:

```text
GIT
   ↓
BRANCH
   ↓
PULL REQUEST
   ↓
VERCEL PREVIEW
   ↓
VALIDAÇÃO
   ↓
MAIN
   ↓
PRODUCTION
```

Além disso, a infraestrutura possui:

- Vercel;
- domínio próprio;
- Supabase;
- migrations;
- OpenAI;
- Mercado Pago;
- crons;
- Firewall;
- rate limit;
- variáveis por ambiente.

Conforme o VemVer crescer, esse processo poderá evoluir para ambientes adicionais, testes automatizados e mecanismos mais avançados de publicação.

Porém, o princípio deverá permanecer:

> nunca trocar rastreabilidade e segurança por velocidade aparente.
