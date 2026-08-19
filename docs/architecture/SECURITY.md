# VemVer — Segurança

## Documento

**Projeto:** VemVer
**Documento:** Arquitetura e Regras de Segurança
**Versão:** 1.0.0
**Status:** Ativo
**Última atualização:** 17/08/2026

---

# 1. Objetivo

Este documento define os princípios e controles de segurança do VemVer.

Seu objetivo é registrar:

- proteção de credenciais;
- autenticação;
- autorização;
- proteção das APIs;
- proteção do banco;
- uso do `service_role`;
- segurança da OpenAI;
- segurança de pagamentos;
- segurança dos crons;
- Firewall da Vercel;
- rate limit;
- validação de entradas;
- tratamento de erros;
- regras para futuras funcionalidades.

Segurança não deve ser adicionada apenas depois que uma feature estiver pronta.

Ela faz parte da definição da própria feature.

---

# 2. Princípio Central

Regra fundamental:

> Nunca confiar no cliente para proteger o servidor.

Tudo que chega do navegador pode ser:

- alterado;
- repetido;
- automatizado;
- manipulado;
- enviado fora da interface oficial.

---

# 3. Segurança por Camadas

A arquitetura desejada pode ser representada assim:

```text
INTERNET
   ↓
VERCEL
   ↓
FIREWALL / RATE LIMIT
   ↓
NEXT.JS API
   ↓
VALIDAÇÃO
   ↓
AUTENTICAÇÃO
   ↓
AUTORIZAÇÃO
   ↓
REGRA DE NEGÓCIO
   ↓
SUPABASE / SERVIÇOS EXTERNOS
```

Nem toda rota necessita de todas as camadas.

Porém, operações críticas devem utilizar proteção proporcional ao risco.

---

# 4. Frontend não é Barreira de Segurança

Ocultar um botão não protege uma operação.

Exemplo:

```text
BOTÃO "ATIVAR PLANO"
NÃO APARECE
```

não significa:

```text
ENDPOINT NÃO PODE SER CHAMADO
```

Qualquer pessoa pode tentar executar uma requisição HTTP diretamente.

---

# 5. Autenticação

Autenticação responde:

> Quem é o usuário?

O VemVer utiliza Supabase em seus fluxos de autenticação.

Existem funcionalidades relacionadas a:

- login;
- recuperação de senha;
- redefinição de senha;
- conta de cliente;
- conta de lojista.

---

# 6. Autorização

Autorização responde:

> O usuário autenticado pode executar esta ação?

Esses conceitos devem permanecer separados.

```text
AUTENTICADO
≠
AUTORIZADO PARA TUDO
```

---

# 7. Exemplo de Autorização

Um lojista pode possuir direito de editar:

```text
SUA PRÓPRIA LOJA
```

mas não:

```text
LOJA DE OUTRO USUÁRIO
```

O servidor precisa validar essa relação.

---

# 8. IDs são Manipuláveis

Qualquer ID enviado pelo cliente deve ser considerado manipulável.

Exemplo:

```json
{
  "loja_id": 7
}
```

pode ser alterado manualmente para:

```json
{
  "loja_id": 9
}
```

Portanto:

> possuir o ID não concede autorização.

---

# 9. `user_id`

Quando uma operação depender do usuário autenticado, o backend deve preferir obter a identidade da sessão autenticada.

Não confiar apenas em:

```json
{
  "user_id": "..."
}
```

enviado pelo frontend.

---

# 10. Área Administrativa

A área administrativa possui risco elevado.

Endpoints administrativos devem validar explicitamente os privilégios necessários.

Existe atualmente rota:

```text
/api/admin/planos/ativar
```

O contrato completo de autorização dessa rota deverá receber auditoria específica.

Até essa auditoria:

> não assumir que a existência de autenticação comum é suficiente para operações administrativas.

---

# 11. Secrets

Secrets são valores que não podem ser enviados ao navegador ou registrados publicamente.

Entre os secrets importantes do VemVer estão:

```text
OPENAI_API_KEY

SUPABASE_SERVICE_ROLE_KEY

CRON_SECRET

credenciais privadas do Mercado Pago
```

---

# 12. Regra para Secrets

Nunca:

```text
SECRET
   ↓
NEXT_PUBLIC_
```

Variáveis com prefixo:

```text
NEXT_PUBLIC_
```

podem ser incorporadas ao código executado no navegador.

---

# 13. Variáveis Públicas

Algumas configurações do Supabase podem ser públicas por projeto.

Exemplo:

```text
NEXT_PUBLIC_SUPABASE_URL
```

Isso não significa que todas as credenciais do Supabase sejam públicas.

---

# 14. `SUPABASE_SERVICE_ROLE_KEY`

A variável:

```text
SUPABASE_SERVICE_ROLE_KEY
```

possui privilégios elevados.

Regra obrigatória:

> utilizar somente no servidor.

Ela nunca deve ser enviada para:

- navegador;
- aplicativo cliente;
- código público;
- logs;
- documentação com valor real.

---

# 15. Service Role

O `service_role` pode executar operações que usuários comuns não conseguem.

Por isso:

```text
SERVICE ROLE
        ↓
MAIOR PODER
        ↓
MAIOR RESPONSABILIDADE DO BACKEND
```

Toda entrada deve ser validada antes da operação privilegiada.

---

# 16. Service Role e RLS

O `service_role` possui privilégios que podem ignorar proteções destinadas aos usuários normais.

Portanto:

> RLS não deve ser considerada proteção suficiente para uma API que utiliza `service_role`.

Essa API precisa impor sua própria autorização.

---

# 17. RLS

Row Level Security deve proteger tabelas acessíveis através dos clientes comuns do Supabase quando aplicável.

O VemVer deverá continuar revisando:

- quais tabelas permitem leitura pública;
- quais permitem escrita;
- quais exigem autenticação;
- quais exigem propriedade;
- quais somente o servidor pode acessar.

---

# 18. Menor Privilégio

Cada papel deve possuir somente o acesso necessário.

Conceitualmente:

```text
ANON
   ↓
mínimo necessário

AUTHENTICATED
   ↓
dados permitidos ao usuário

ADMIN
   ↓
operações administrativas autorizadas

SERVICE_ROLE
   ↓
operações privilegiadas do servidor
```

---

# 19. RPCs Privilegiadas

Funções privilegiadas do banco não devem ser publicadas diretamente para qualquer cliente.

Fluxo preferido:

```text
CLIENTE
   ↓
API DO VEMVER
   ↓
VALIDAÇÃO
   ↓
RPC PROTEGIDA
```

---

# 20. Função de Score

A função:

```text
public.atualizar_score_lojas()
```

teve sua execução restringida.

Foram removidas permissões de execução para:

```text
public
anon
authenticated
```

A execução necessária ao backend permanece disponível através de privilégio adequado.

---

# 21. Função de Busca

A função:

```text
public.buscar_lojas_sem_acentos(...)
```

também possui execução restrita.

Papéis públicos não devem executá-la diretamente no fluxo atual.

---

# 22. Migration de Segurança

Mudanças de permissões importantes devem ser versionadas.

Exemplo atual:

```text
20260813002732_restringir_execucao_atualizar_score_lojas.sql
```

Segurança do banco também faz parte do histórico do projeto.

---

# 23. OpenAI

A OpenAI é utilizada atualmente para:

- interpretação da intenção;
- moderação de texto.

A chave:

```text
OPENAI_API_KEY
```

fica no servidor.

---

# 24. OpenAI não deve ser Chamada Diretamente pelo Cliente

Arquitetura:

```text
CLIENTE
   ↓
API DO VEMVER
   ↓
VALIDAÇÃO
   ↓
OPENAI
```

Evitar:

```text
CLIENTE
   ↓
OPENAI COM CHAVE PRIVADA
```

---

# 25. IA não é Autoridade de Segurança

A OpenAI não decide:

- quem é administrador;
- quem possui uma loja;
- se um pagamento foi aprovado;
- se uma assinatura deve ser ativada;
- quem pode alterar determinado registro.

Essas decisões pertencem ao VemVer.

---

# 26. Validação antes da OpenAI

A validação precisa ocorrer antes de consumir um serviço externo pago.

Isso protege:

- custo;
- disponibilidade;
- estabilidade;
- qualidade dos inputs.

---

# 27. `/api/entender-intencao`

A rota:

```text
POST /api/entender-intencao
```

possui validações aplicadas antes da chamada à OpenAI.

---

# 28. Content-Type da Busca

O endpoint exige:

```text
application/json
```

Caso contrário:

```text
HTTP 415
```

---

# 29. Limite do Body da Busca

Limite atual:

```text
8.000 bytes
```

O sistema verifica o tamanho declarado e o conteúdo realmente recebido.

---

# 30. Limite da Mensagem

O campo principal de busca possui limite atual de:

```text
300 caracteres
```

---

# 31. Validação Geográfica

Quando coordenadas são fornecidas:

```text
latitude
longitude
```

ambas precisam existir.

Limites:

```text
latitude
-90 até 90

longitude
-180 até 180
```

---

# 32. Cidade

O campo opcional de cidade possui validação de tipo e limite.

Limite atual:

```text
100 caracteres
```

---

# 33. UF

A UF deve possuir:

```text
2 letras
```

e é normalizada.

---

# 34. JSON Malformado

JSON inválido é rejeitado como entrada inválida.

Resposta:

```text
HTTP 400
```

A chamada à OpenAI não ocorre.

---

# 35. Body Grande Demais

Quando o limite total é ultrapassado:

```text
HTTP 413
```

---

# 36. `/api/moderar-texto`

A rota:

```text
POST /api/moderar-texto
```

também possui validação antes da OpenAI.

---

# 37. Limite do Body da Moderação

Limite atual:

```text
8.000 bytes
```

---

# 38. Limite do Texto da Moderação

Limite atual:

```text
2.000 caracteres
```

---

# 39. Formato do Body da Moderação

O body precisa ser:

```text
objeto JSON válido
```

Não deve ser aceito como estrutura principal:

```text
array
null
valor primitivo
```

---

# 40. Texto Vazio

O campo:

```text
texto
```

não pode ficar vazio após normalização por `trim`.

---

# 41. Endpoint Temporário Removido

A rota:

```text
/api/testar-moderacao
```

foi removida da produção.

Esse caso estabelece uma regra:

> endpoint de teste não deve permanecer exposto sem necessidade operacional real.

---

# 42. Firewall da Vercel

O VemVer utiliza Firewall da Vercel como uma camada anterior às Functions.

Essa camada ajuda especialmente a limitar abuso de APIs que geram custo.

---

# 43. Regra Atual de IA

Existe regra ativa denominada:

```text
OpenAI - Rate Limit
```

Ela protege atualmente:

```text
/api/entender-intencao

/api/moderar-texto
```

---

# 44. Método da Regra

A proteção é aplicada a:

```text
POST
```

---

# 45. Caminhos Protegidos

A expressão configurada corresponde conceitualmente a:

```text
^/api/(entender-intencao|moderar-texto)$
```

---

# 46. Rate Limit Atual

Configuração:

```text
Fixed Window

60 segundos

10 requisições

por endereço IP
```

---

# 47. Limite Compartilhado

O limite é compartilhado entre as duas rotas.

Exemplo:

```text
6 chamadas de busca
+
4 chamadas de moderação
=
10
```

Uma chamada adicional dentro da mesma janela pode ser bloqueada.

---

# 48. HTTP 429

Quando o limite é atingido:

```text
HTTP 429
Too Many Requests
```

---

# 49. Proteção antes da Function

Um dos objetivos é interromper abuso aqui:

```text
REQUISIÇÃO
   ↓
FIREWALL
   ↓
429
```

antes de:

```text
FUNCTION
   ↓
OPENAI
   ↓
CUSTO
```

---

# 50. Rate Limit não é Proteção Completa

Rate limit não substitui:

- validação;
- autenticação;
- autorização;
- limites de body;
- segurança do banco.

É apenas uma camada.

---

# 51. Rate Limit Futuro

Quando o uso crescer, poderá ser necessário separar limites por:

- rota;
- usuário;
- IP;
- plano;
- tipo de operação.

Essa mudança deverá ser baseada em dados reais.

---

# 52. Crons

O VemVer possui rotas de automação agendadas.

Entre elas:

```text
/api/cron/verificar-planos

/api/cron/atualizar-scores
```

---

# 53. Segurança dos Crons e `CRON_SECRET`

O secret:

```text
CRON_SECRET
```

é utilizado como mecanismo de autorização para rotas de cron que implementam explicitamente essa verificação.

No estado atual auditado:

```text
/api/cron/atualizar-scores
→ protegido por CRON_SECRET

/api/cron/verificar-planos
→ não possui verificação explícita de CRON_SECRET no Route Handler
```

Portanto, a proteção do cron de planos permanece como uma pendência de segurança.

Essa pendência é especialmente importante porque o endpoint de verificação de planos executa operações privilegiadas no backend.

Além disso, a auditoria do Route Handler atual confirmou que algumas respostas HTTP `500` retornam o campo:

```text
detalhes
```

preenchido a partir de mensagens internas como:

```text
error.message
```

Isso pode expor ao cliente detalhes desnecessários sobre erros internos do backend ou do banco de dados.

### Correções de segurança pendentes

O endpoint:

```text
/api/cron/verificar-planos
```

deve receber:

- validação server-side de `CRON_SECRET` antes de qualquer operação privilegiada;
- respostas externas genéricas para erros `500`;
- detalhes técnicos apenas em logs server-side;
- teste confirmando rejeição de chamadas não autorizadas.

Até que essas correções sejam implementadas, o cron de planos não deve ser considerado equivalente ao cron de score em termos de proteção.

---

# 54. Chamada sem Autorização

O cron de atualização de score foi testado sem autorização válida.

Resultado esperado e confirmado:

```text
HTTP 401
```

---

# 55. Chamada Autorizada

Com a credencial adequada, o cron executa o processo normalmente.

---

# 56. Cron não deve Confiar no Caminho

O fato de uma rota estar em:

```text
/api/cron/
```

não a torna automaticamente privada.

Se estiver acessível pela internet:

> precisa ser protegida.

---

# 57. Idempotência de Cron

Sempre que possível, uma rotina agendada deve suportar execução duplicada sem corromper estados.

Especial atenção para:

- assinaturas;
- históricos;
- notificações;
- score;
- cobranças futuras.

---

# 58. Mercado Pago

A integração com Mercado Pago possui impacto financeiro.

Rotas atuais:

```text
/api/mercadopago

/api/webhook/mercadopago
```

---

# 59. Credenciais Financeiras

Credenciais privadas do Mercado Pago:

- ficam no servidor;
- não podem ser expostas ao cliente;
- não podem ser registradas em documentação;
- não devem aparecer em logs.

---

# 60. Preços Vindos do Frontend

Um preço enviado pelo navegador deve ser considerado manipulável.

Exemplo:

```json
{
  "preco": 99.90
}
```

poderia ser alterado manualmente.

Princípio:

> o servidor deve confirmar valores comerciais através de fonte confiável.

---

# 61. Frontend não Confirma Pagamento

O navegador não pode simplesmente informar:

```text
"pagamento aprovado"
```

e fazer a aplicação ativar um plano.

O estado financeiro precisa ser validado através do provedor e das regras internas.

---

# 62. Webhook

A rota:

```text
/api/webhook/mercadopago
```

recebe eventos originados pelo provedor.

Fluxo:

```text
MERCADO PAGO
      ↓
WEBHOOK VEMVER
      ↓
VALIDAÇÃO
      ↓
REGRA DE NEGÓCIO
      ↓
BANCO
```

---

# 63. Segurança do Webhook

Antes de considerar essa integração madura para alta escala, o fluxo deverá receber auditoria aprofundada em:

- autenticidade;
- identificação do evento;
- consulta ao pagamento;
- idempotência;
- duplicidade;
- ordem dos eventos;
- transições de estado;
- logs;
- histórico.

---

# 64. Eventos Duplicados

Um webhook pode ser entregue mais de uma vez.

```text
EVENTO 123
EVENTO 123
EVENTO 123
```

não deve resultar automaticamente em:

```text
3 ativações
```

---

# 65. Idempotência Financeira

Idempotência é especialmente importante em:

- criação de pagamento;
- ativação de plano;
- renovação;
- webhook;
- futuras cobranças.

---

# 66. Tratamento de Erros

Erros internos não devem ser enviados integralmente ao cliente.

Evitar:

```text
stack trace

erro.message completo

query SQL

caminho interno

credencial

dados sensíveis
```

---

# 67. Modelo de Erro

Arquitetura correta:

```text
ERRO
 ├── detalhe técnico → servidor/log
 └── mensagem segura → cliente
```

---

# 68. HTTP 500

Erro inesperado pode retornar:

```text
HTTP 500
```

com resposta genérica.

O detalhe permanece server-side.

---

# 69. Erros de Entrada

Entradas inválidas não devem gerar `500`.

Utilizar respostas adequadas como:

```text
400
413
415
```

conforme o caso.

---

# 70. Logs

Logs devem auxiliar diagnóstico.

Eles podem registrar:

- rota;
- operação;
- status;
- erro técnico necessário;
- identificadores seguros.

Nunca registrar secrets deliberadamente.

---

# 71. Dados Sensíveis nos Logs

Evitar registrar integralmente:

- tokens;
- senhas;
- chaves;
- headers de autenticação;
- dados financeiros sensíveis;
- conteúdos pessoais sem necessidade.

---

# 72. Senhas

Senhas nunca devem:

- ser armazenadas em texto puro pelo aplicativo;
- aparecer em logs;
- ser enviadas por e-mail;
- ser expostas em respostas.

O fluxo de autenticação deve permanecer sob mecanismos adequados do provedor utilizado.

---

# 73. Recuperação de Senha

Links e tokens de recuperação devem ser tratados como credenciais temporárias.

Eles não devem ser:

- registrados publicamente;
- compartilhados;
- reutilizados indevidamente.

---

# 74. Uploads

Uploads representam uma futura área importante de segurança.

Devem considerar:

- tamanho máximo;
- tipo permitido;
- extensão;
- MIME type;
- quantidade;
- armazenamento;
- propriedade;
- moderação;
- exclusão.

---

# 75. Imagem não deve ser Confiada pelo Nome

Um arquivo chamado:

```text
foto.jpg
```

não necessariamente é uma imagem válida.

Validações futuras devem considerar conteúdo e MIME adequado.

---

# 76. Moderação de Conteúdo

Conteúdo cadastrado por usuários pode exigir moderação.

A moderação por IA é uma camada de proteção.

Ela não substitui:

- regras de negócio;
- denúncia;
- revisão administrativa;
- validações técnicas.

---

# 77. Avaliações

Avaliações futuras precisam de proteção contra:

- spam;
- duplicidade;
- abuso;
- manipulação;
- fraude;
- conteúdo proibido.

A estratégia deverá evoluir conforme o volume crescer.

---

# 78. Favoritos

Favoritos devem respeitar a identidade do usuário autenticado.

Um usuário não deve criar relações em nome de outra conta apenas enviando outro ID.

---

# 79. Geolocalização

A localização do consumidor deve ser tratada como dado sensível do ponto de vista de privacidade.

A aplicação não deve armazenar histórico preciso de localização sem finalidade definida.

---

# 80. Coordenadas Enviadas pelo Cliente

Latitude e longitude fornecidas pelo navegador não devem ser consideradas prova de localização real.

Elas servem para:

```text
contexto de busca
```

e podem ser manipuladas.

---

# 81. Privacidade

A plataforma deve coletar somente dados necessários para entregar valor.

Pergunta obrigatória:

> precisamos realmente armazenar essa informação?

---

# 82. Retenção de Dados

O projeto deverá futuramente formalizar políticas de retenção para:

- contas;
- logs;
- moderação;
- histórico;
- pagamentos;
- analytics.

---

# 83. Exclusão de Conta

A futura exclusão de conta deve considerar:

- dados pessoais;
- histórico financeiro;
- lojas;
- produtos;
- avaliações;
- obrigações legais;
- anonimização quando aplicável.

Não implementar exclusão profunda sem análise.

---

# 84. HTTPS

A produção deve operar através de HTTPS fornecido pela infraestrutura de deploy.

Credenciais ou sessões não devem ser transmitidas intencionalmente por conexão HTTP insegura.

---

# 85. Produção

A produção utiliza Vercel.

Secrets devem ser configurados através das variáveis de ambiente da plataforma, não inseridos no código.

---

# 86. Preview

Ambientes de Preview também precisam de atenção.

Um Preview pode executar:

- backend;
- integrações;
- credenciais específicas.

Não considerar Preview automaticamente descartável do ponto de vista de segurança.

---

# 87. Proteção de Preview

O projeto já utiliza mecanismos de proteção de acesso da Vercel em ambientes de Preview.

Segredos de bypass devem ser tratados como credenciais.

---

# 88. Credencial Comprometida

Se um secret for acidentalmente exposto:

```text
NÃO BASTA APAGAR A MENSAGEM
```

A resposta correta é:

```text
REVOGAR / ROTACIONAR
        ↓
CRIAR NOVO
        ↓
ATUALIZAR AMBIENTE
        ↓
VALIDAR
```

---

# 89. Git

Secrets não devem entrar no histórico Git.

Mesmo se removidos em commit posterior, podem permanecer no histórico.

---

# 90. `.env.local`

Credenciais locais podem ser mantidas em:

```text
.env.local
```

quando apropriado.

Esse arquivo não deve ser commitado com secrets reais.

---

# 91. GitHub

Antes de push:

- verificar diff;
- verificar arquivos novos;
- verificar secrets;
- evitar credenciais em documentação;
- evitar prints com dados sensíveis.

---

# 92. Dependências

Bibliotecas externas aumentam a superfície de risco.

Antes de adicionar uma dependência:

- é necessária?
- está mantida?
- qual permissividade?
- qual tamanho?
- existe alternativa nativa?

---

# 93. `npm audit`

Alertas de dependências devem ser analisados.

Não executar automaticamente:

```text
npm audit fix --force
```

sem verificar impacto.

Atualizações forçadas podem quebrar o projeto.

---

# 94. Dependências de Segurança

Problemas críticos devem receber prioridade proporcional ao risco real.

Isso inclui verificar:

- dependência afetada;
- código realmente utilizado;
- versão corrigida;
- breaking changes.

---

# 95. TypeScript

Tipagem ajuda a reduzir determinadas classes de erros, mas:

> TypeScript não é mecanismo de segurança.

Entradas externas continuam precisando de validação em runtime.

---

# 96. Validação Runtime

Mesmo que o TypeScript declare:

```ts
mensagem: string
```

um cliente HTTP pode enviar:

```json
{
  "mensagem": 123
}
```

Por isso, a API precisa validar o valor recebido.

---

# 97. Limites

Todo recurso potencialmente abusável deve considerar limites.

Exemplos:

- tamanho de texto;
- tamanho de body;
- upload;
- número de requisições;
- quantidade de registros;
- paginação.

---

# 98. Paginação

Uma API não deve permitir requisições ilimitadas como:

```text
retorne 1.000.000 de registros
```

Coleções grandes deverão ter limites e paginação.

---

# 99. Busca

A busca não deve retornar dados privados ou administrativos juntamente com os campos públicos da loja.

Selecionar apenas o necessário reduz exposição.

---

# 100. `SELECT *`

Em APIs públicas, evitar `SELECT *` quando não houver necessidade.

Buscar somente campos necessários ajuda a reduzir vazamento acidental.

---

# 101. Dados Internos de Loja

Nem toda coluna de:

```text
lojas
```

deve aparecer na página pública.

Dados internos de:

- assinatura;
- moderação;
- administração;
- IDs internos específicos;

devem ser expostos somente quando necessários.

---

# 102. Segurança da Busca

O ranking e a busca podem ser públicos.

Porém, as funções privilegiadas que os suportam não precisam ser diretamente públicas.

Esse é o modelo atual adotado.

---

# 103. Manipulação de Ranking

O sistema deve evitar permitir que clientes controlem diretamente:

- score;
- premium;
- patrocinado;
- visualizações;
- status de aprovação.

Esses campos possuem impacto comercial.

---

# 104. Score

O score deve ser calculado pelo sistema.

Não aceitar:

```json
{
  "score": 999999
}
```

como atualização livre feita pelo lojista.

---

# 105. Premium e Patrocinado

Estados comerciais:

```text
premium
patrocinado
plano
```

não devem ser alterados por um usuário apenas através de manipulação de request.

---

# 106. Aprovação da Loja

O campo:

```text
status
```

também possui impacto de moderação e publicação.

Mudanças de status precisam seguir regras autorizadas.

---

# 107. Mass Assignment

Ao atualizar um registro, evitar enviar o objeto completo vindo do cliente diretamente ao banco.

Exemplo perigoso:

```text
UPDATE LOJA
COM TODOS OS CAMPOS RECEBIDOS
```

Preferir selecionar explicitamente os campos permitidos.

---

# 108. Exemplo

Se o lojista pode editar:

```text
nome
descricao
whatsapp
```

isso não significa que possa editar:

```text
premium
score
patrocinado
status
user_id
```

---

# 109. Webhooks são Públicos por Natureza

Uma URL de webhook precisa receber requisições externas.

Por isso:

> proteção não pode depender apenas de esconder o endereço.

A autenticidade precisa ser verificada através do mecanismo adequado do provedor.

---

# 110. Replay

Eventos externos podem ser reenviados.

Operações críticas devem evitar que o mesmo evento provoque ações repetidas indevidas.

---

# 111. Criação de Novas APIs

Antes de criar uma nova API, responder:

```text
Ela precisa ser pública?

Precisa autenticação?

Precisa autorização?

Usa service_role?

Usa serviço pago?

Qual rate limit?

Qual body máximo?

Quais campos são permitidos?

Pode ser repetida?

Pode alterar dinheiro?

Pode alterar plano?

Pode vazar dados?
```

---

# 112. Checklist de Endpoint

Antes de considerar uma nova rota pronta:

```text
[ ] método definido

[ ] Content-Type validado

[ ] body limitado

[ ] JSON validado

[ ] campos validados

[ ] autenticação revisada

[ ] autorização revisada

[ ] propriedade revisada

[ ] secrets protegidos

[ ] erros seguros

[ ] rate limit avaliado

[ ] duplicidade avaliada

[ ] logs revisados

[ ] teste realizado

[ ] documentação atualizada
```

---

# 113. Testes de Segurança

APIs críticas devem ser testadas também com entradas inválidas.

Exemplos:

```text
sem autenticação

ID de outra loja

body vazio

JSON inválido

body enorme

tipo errado

texto enorme

muitas requisições

coordenada inválida

Content-Type errado
```

---

# 114. Testes Já Executados

As rotas de IA já receberam testes para situações como:

- JSON inválido;
- Content-Type incorreto;
- body muito grande;
- texto muito grande;
- dados inválidos;
- rate limit.

Esses testes foram executados durante o processo de proteção das APIs.

---

# 115. Produção

Testes seguros também foram realizados no domínio de produção após deploy das proteções.

Isso ajuda a confirmar que:

```text
CÓDIGO
+
VERCEL
+
FIREWALL
```

estão funcionando juntos.

---

# 116. Testes Automatizados

A segurança deverá progressivamente receber testes automatizados.

Prioridades futuras:

```text
AUTORIZAÇÃO

APIS DE IA

ADMIN

MERCADO PAGO

WEBHOOK

RLS

PROPRIEDADE DE LOJA
```

---

# 117. Observabilidade

O VemVer deverá evoluir para detectar padrões como:

- aumento de `401`;
- aumento de `403`;
- aumento de `429`;
- aumento de `500`;
- muitas falhas de pagamento;
- abuso de endpoints;
- volume anormal de OpenAI.

---

# 118. Alertas

No futuro, determinados eventos podem justificar alertas.

Exemplos:

```text
cron falhando repetidamente

webhook com muitos erros

pico anormal de 500

tentativas administrativas suspeitas
```

---

# 119. Incidentes

Quando ocorrer incidente de segurança:

```text
IDENTIFICAR
   ↓
CONTER
   ↓
REVOGAR CREDENCIAIS SE NECESSÁRIO
   ↓
CORRIGIR
   ↓
VALIDAR
   ↓
DOCUMENTAR
```

---

# 120. Não Esconder Incidente

Erro de segurança não deve ser corrigido silenciosamente sem análise.

Precisamos entender:

- o que aconteceu;
- qual impacto;
- qual causa;
- como evitar repetição.

---

# 121. Dependência de Terceiros

O VemVer depende de serviços como:

```text
Vercel
Supabase
OpenAI
Mercado Pago
```

Cada dependência amplia a superfície operacional.

Falhas nesses serviços precisam ser tratadas de forma controlada.

---

# 122. OpenAI Fora do Ar

Uma falha da OpenAI não deve permitir:

- bypass de moderação crítica;
- estado inconsistente;
- exposição de erro interno.

A experiência de fallback deverá evoluir conforme o produto amadurecer.

---

# 123. Supabase Fora do Ar

Falha de banco deve resultar em resposta controlada.

Não inventar dados para compensar indisponibilidade.

---

# 124. Mercado Pago Fora do Ar

Problemas com pagamento devem evitar:

- falsa aprovação;
- dupla cobrança;
- ativação sem confirmação.

---

# 125. Segurança do Aplicativo Mobile

Os futuros aplicativos Cliente e Lojista utilizarão as mesmas regras centrais.

Um aplicativo instalado no celular também é um cliente não confiável.

Nunca embutir nele:

```text
SERVICE ROLE
OPENAI_API_KEY
CRON_SECRET
TOKEN PRIVADO DO MERCADO PAGO
```

---

# 126. Tema Claro e Escuro

A funcionalidade de tema:

```text
Automático
Claro
Escuro
```

é apenas uma preferência visual.

Ela não deve alterar:

- permissões;
- autenticação;
- autorização;
- regras;
- segurança.

---

# 127. Armazenamento Local

Dados armazenados no navegador ou aplicativo devem ser considerados acessíveis pelo próprio usuário.

Não utilizar armazenamento local como lugar seguro para secrets administrativos.

---

# 128. Sessões

Tokens de sessão devem ser manipulados somente através de mecanismos apropriados da arquitetura de autenticação.

Não registrar tokens completos para depuração.

---

# 129. Logout

O logout deverá invalidar ou remover corretamente a sessão local conforme o mecanismo utilizado.

---

# 130. Alterações de Segurança

Mudanças relevantes de segurança devem atualizar este documento.

Exemplos:

- nova regra WAF;
- novo rate limit;
- nova autenticação;
- novo papel;
- nova RPC privilegiada;
- mudança de secret;
- nova integração externa.

---

# 131. Decisões Arquiteturais

Mudanças de segurança com impacto amplo deverão também ser registradas em:

```text
../governance/DECISIONS.md
```

---

# 132. Segurança e Roadmap

Itens de segurança não devem ser adiados indefinidamente porque:

```text
"não aparecem para o usuário"
```

Uma falha pode comprometer todo o produto.

---

# 133. Prioridades Atuais

Entre as principais áreas que ainda merecem auditoria profunda estão:

```text
AUTORIZAÇÃO ADMINISTRATIVA

RLS DAS TABELAS PRINCIPAIS

MERCADO PAGO

WEBHOOK

PROPRIEDADE DAS LOJAS

UPLOADS

FLUXOS DE ALTERAÇÃO DE PLANO
```

---

# 134. O que Já Está Consolidado

A arquitetura já possui fundamentos importantes:

```text
secrets server-side

service_role protegida

RPCs sensíveis restringidas

validação de APIs de IA

limites de body

limites de texto

erros genéricos ao cliente

cron protegido

Firewall da Vercel

rate limit

endpoint temporário removido
```

---

# 135. O que não Devemos Fazer

Nunca devemos:

- expor service role;
- colocar secret em `NEXT_PUBLIC_`;
- confiar em `user_id` enviado pelo cliente;
- confiar em preço enviado pelo frontend;
- confiar em status de pagamento vindo do navegador;
- deixar endpoint administrativo sem autorização;
- remover validação porque existe WAF;
- executar RPC privilegiada diretamente no cliente;
- deixar endpoints de teste esquecidos;
- publicar secrets no Git;
- registrar tokens em logs;
- alterar permissões manualmente sem registrar quando a mudança for estrutural.

---

# 136. Princípio de Zero Confiança no Input

Toda entrada externa deve ser considerada não confiável até ser validada.

Isso inclui:

```text
query params

path params

JSON

headers

cookies

IDs

arquivos

coordenadas

webhooks
```

---

# 137. Segurança e Experiência

Segurança não precisa tornar a experiência ruim.

O objetivo é que controles importantes sejam invisíveis para o usuário legítimo.

A melhor experiência é:

```text
USUÁRIO LEGÍTIMO
→ funciona normalmente

ABUSO
→ bloqueado
```

---

# 138. Relação com Outros Documentos

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
DEPLOY.md

../engineering/CODING_STANDARDS.md
../engineering/TEST_PLAN.md
../engineering/CHECKLIST.md

../governance/DECISIONS.md
```

---

# 139. Segurança em Uma Frase

> O VemVer deve assumir que toda entrada externa pode ser manipulada, conceder apenas o privilégio necessário e manter todas as decisões críticas sob controle do servidor e do banco.

---

# 140. Regra Final

Antes de liberar qualquer feature nova, devemos responder:

```text
Quem pode chamar?

Quem pode alterar?

Que dados recebe?

Que dados retorna?

Existe secret?

Existe custo?

Pode ser abusada?

Pode ser repetida?

Pode afetar outra conta?

Pode afetar dinheiro?

Pode afetar plano?

O banco protege?

A API protege?

Como testamos?
```

Se essas respostas não estiverem claras:

> a feature ainda não está pronta para produção.

---

# 141. Conclusão

A segurança do VemVer deve evoluir junto com o produto.

Não queremos construir primeiro e proteger depois.

A arquitetura deve manter:

```text
CLIENTE NÃO CONFIÁVEL
        ↓
VALIDAÇÃO
        ↓
AUTENTICAÇÃO
        ↓
AUTORIZAÇÃO
        ↓
MENOR PRIVILÉGIO
        ↓
REGRA DE NEGÓCIO
        ↓
DADOS PROTEGIDOS
```

Quanto maior o VemVer ficar, maior será o impacto potencial de uma falha.

Por isso, segurança não é uma etapa final.

> Segurança é parte da arquitetura.
