# VemVer — APIs

## Documento

**Projeto:** VemVer
**Documento:** Arquitetura e Contratos de API
**Versão:** 1.0.0
**Status:** Ativo
**Última atualização:** 17/08/2026

---

# 1. Objetivo

Este documento descreve as APIs internas atualmente existentes no VemVer e os princípios que devem orientar sua evolução.

Seu objetivo é registrar:

- endpoints existentes;
- responsabilidades;
- métodos HTTP confirmados;
- validações;
- segurança;
- integração com OpenAI;
- integração com Supabase;
- integração com Mercado Pago;
- webhooks;
- crons;
- tratamento de erros;
- rate limit;
- regras para futuras APIs.

Este documento deve refletir o código real.

Quando algum contrato ainda não tiver sido auditado em detalhes, isso deverá ser explicitamente informado em vez de inventado.

---

# 2. Localização das APIs

As APIs do VemVer utilizam Route Handlers do Next.js App Router.

Estrutura:

```text
src/app/api/
```

Exemplo:

```text
src/app/api/entender-intencao/route.ts
```

corresponde a:

```text
/api/entender-intencao
```

---

# 3. Arquitetura Geral

Fluxo conceitual:

```text
CLIENTE
   ↓
VERCEL
   ↓
FIREWALL
   ↓
NEXT.JS ROUTE HANDLER
   ↓
VALIDAÇÃO
   ↓
AUTORIZAÇÃO / REGRA
   ↓
SERVIÇO INTERNO
   ↓
SUPABASE / OPENAI / MERCADO PAGO
   ↓
RESPOSTA
```

Nem todas as APIs utilizam todas essas camadas.

---

# 4. Responsabilidade da API

Uma API do VemVer pode ser responsável por:

- validar entrada;
- verificar autenticação;
- verificar autorização;
- aplicar regras de negócio;
- proteger secrets;
- consultar banco;
- executar RPC;
- chamar serviço externo;
- transformar dados;
- devolver resposta segura.

---

# 5. Interface não é Segurança

Uma ação escondida no frontend continua podendo ser chamada diretamente por HTTP se a API estiver exposta.

Portanto:

> toda operação sensível deve ser protegida no servidor.

---

# 6. Endpoints Atuais

Os principais endpoints existentes atualmente são:

```text
/api/admin/planos/ativar

/api/cron/atualizar-scores
/api/cron/verificar-planos

/api/entender-intencao

/api/mercadopago

/api/moderar-texto

/api/webhook/mercadopago
```

A antiga rota:

```text
/api/testar-moderacao
```

foi removida.

---

# 7. Estado de Auditoria dos Contratos

Nesta versão da documentação, os contratos mais detalhadamente auditados são:

```text
/api/entender-intencao

/api/moderar-texto

/api/cron/atualizar-scores

/api/cron/verificar-planos
```

As rotas de:

```text
Mercado Pago
administração de planos
```

existem no projeto, mas deverão receber uma auditoria específica antes de fixarmos neste documento todos os seus campos, respostas e transições como contratos definitivos.

Isso evita documentar comportamento presumido como se estivesse confirmado.

---

# 8. `/api/entender-intencao`

Arquivo:

```text
src/app/api/entender-intencao/route.ts
```

Método confirmado:

```text
POST
```

Objetivo:

> interpretar uma busca em linguagem natural e retornar resultados de lojas utilizando os dados reais do VemVer.

---

# 9. Fluxo da Busca Inteligente

Fluxo atual:

```text
USUÁRIO
   ↓
mensagem
   ↓
POST /api/entender-intencao
   ↓
validação
   ↓
OpenAI
   ↓
intenção estruturada
   ↓
buscarLojas()
   ↓
Supabase RPC
   ↓
candidatos
   ↓
relevância
   ↓
distância
   ↓
score
   ↓
resultados
```

---

# 10. Content-Type da Busca

A rota aceita requisição JSON.

O `Content-Type` precisa incluir:

```text
application/json
```

Caso contrário:

```text
HTTP 415
Unsupported Media Type
```

---

# 11. Limite do Body da Busca

O limite atual do corpo da requisição é:

```text
8.000 bytes
```

A aplicação verifica:

- tamanho declarado quando disponível;
- tamanho real do conteúdo recebido.

O tamanho real considera bytes UTF-8.

---

# 12. Body Muito Grande

Quando o limite é ultrapassado:

```text
HTTP 413
Payload Too Large
```

A OpenAI não deve ser chamada.

---

# 13. JSON Inválido

O corpo é lido e posteriormente convertido em JSON.

Se o JSON estiver malformado:

```text
HTTP 400
Bad Request
```

---

# 14. Campo `mensagem`

O campo principal é:

```text
mensagem
```

Ele deve ser uma string.

Depois de `trim`, não pode estar vazio.

---

# 15. Limite de `mensagem`

Limite atual:

```text
300 caracteres
```

Mensagens acima desse limite são rejeitadas antes da chamada à OpenAI.

---

# 16. Campo `cidade`

A rota aceita opcionalmente:

```text
cidade
```

Quando informado:

- deve ser string;
- possui limite de tamanho.

Limite atual:

```text
100 caracteres
```

---

# 17. Campo `uf`

A rota aceita opcionalmente:

```text
uf
```

Regra:

```text
exatamente 2 letras
```

O backend normaliza o valor para maiúsculas quando válido.

Exemplo:

```text
sc
```

torna-se:

```text
SC
```

---

# 18. Latitude

A rota pode receber:

```text
latitude
```

ou campo equivalente utilizado pela implementação atual.

O valor precisa:

- ser numérico;
- ser finito;
- estar dentro do intervalo geográfico válido.

Intervalo:

```text
-90 até 90
```

---

# 19. Longitude

A longitude precisa:

- ser numérica;
- ser finita;
- estar dentro do intervalo geográfico válido.

Intervalo:

```text
-180 até 180
```

---

# 20. Coordenadas em Conjunto

Latitude e longitude devem ser enviadas juntas.

Não é permitido fornecer apenas uma coordenada.

Conceitualmente:

```text
LATITUDE + LONGITUDE
       ✅
```

e:

```text
LATITUDE SEM LONGITUDE
       ❌
```

---

# 21. Validação antes da OpenAI

A ordem é intencional:

```text
REQUISIÇÃO
   ↓
VALIDAÇÕES
   ↓
SOMENTE DEPOIS
   ↓
OPENAI
```

Isso reduz custo e abuso.

---

# 22. Interpretação da Intenção

A interpretação utiliza:

```text
src/app/lib/ia/entenderIntencao.ts
```

A OpenAI transforma a mensagem em uma estrutura previsível.

---

# 23. Estrutura de Intenção

A estrutura atual possui campos conceituais como:

```text
termoBusca
categoria
delivery
abertoAgora
pertoDeMim
preco
```

---

# 24. IA não Consulta Diretamente o Banco

A arquitetura correta é:

```text
OPENAI
   ↓
INTENÇÃO
   ↓
BACKEND
   ↓
SUPABASE
```

Não:

```text
OPENAI
   ↓
ACESSO ADMINISTRATIVO AO BANCO
```

---

# 25. Busca das Lojas

A busca utiliza:

```text
src/app/lib/ia/buscarLojas.ts
```

O módulo prepara critérios e consulta candidatos através do Supabase.

---

# 26. Busca sem Acentos

A consulta utiliza RPC:

```text
buscar_lojas_sem_acentos
```

para permitir buscas como:

```text
acai
```

encontrarem:

```text
Açaí
```

---

# 27. Candidatos Públicos

A RPC da busca considera, entre outras condições:

```text
ativo = true
```

e:

```text
status = 'aprovada'
```

---

# 28. Ranking

Depois de obter candidatos, o backend calcula e ordena utilizando principalmente:

```text
1. relevância textual

2. distância
   quando pertoDeMim = true

3. score

4. nome
   como desempate
```

---

# 29. Quantidade Máxima Atual

Depois do ranking, a implementação atual limita a resposta a:

```text
20 lojas
```

---

# 30. Distância

Quando existem coordenadas válidas:

```text
distanciaKm
```

é calculada.

Quando não existem:

```text
distanciaKm = null
```

---

# 31. Filtros ainda não Confiáveis

A IA já pode interpretar:

```text
delivery
abertoAgora
preco
```

Porém essas informações não devem ser usadas como filtros verdadeiros enquanto o banco não possuir dados suficientes.

---

# 32. Resposta da Busca

A resposta fornece ao cliente os resultados produzidos pelo fluxo de interpretação e descoberta.

O contrato exato de todos os campos da resposta deverá continuar acompanhando a implementação real.

Não adicionar campos à documentação apenas porque parecem úteis.

---

# 33. Erro Interno da Busca

Falhas inesperadas são registradas no servidor.

O cliente recebe resposta genérica.

Conceito:

```text
DETALHE DO ERRO
→ servidor

RESPOSTA SEGURA
→ cliente
```

Erro interno:

```text
HTTP 500
```

---

# 34. `/api/moderar-texto`

Arquivo:

```text
src/app/api/moderar-texto/route.ts
```

Método confirmado:

```text
POST
```

Objetivo:

> analisar conteúdo textual através do mecanismo de moderação utilizado pelo VemVer.

---

# 35. Módulo de Moderação

A lógica externa está encapsulada em:

```text
src/app/lib/moderacao.ts
```

---

# 36. Modelo de Moderação

A integração atual utiliza o modelo de moderação configurado no módulo do servidor.

A aplicação não deve depender de uma chamada feita diretamente pelo navegador.

---

# 37. Content-Type da Moderação

O endpoint exige:

```text
application/json
```

Caso contrário:

```text
HTTP 415
```

---

# 38. Limite de Body da Moderação

Limite atual:

```text
8.000 bytes
```

A verificação considera tamanho declarado e tamanho real.

---

# 39. Body Acima do Limite

Quando ultrapassa:

```text
HTTP 413
```

A OpenAI não deve ser chamada.

---

# 40. Estrutura do Body

O body precisa ser um objeto JSON válido.

Não são aceitos como estrutura principal:

```text
array
null
valor primitivo
```

quando o endpoint espera o objeto da moderação.

---

# 41. Campo `texto`

O campo:

```text
texto
```

deve:

- existir;
- ser string;
- não ficar vazio após `trim`.

---

# 42. Limite do Texto

Limite atual:

```text
2.000 caracteres
```

Acima disso:

```text
HTTP 400
```

---

# 43. Resultado da Moderação

A camada interna trabalha com informações como:

```text
permitido
sinalizado
categoriasSinalizadas
mensagem
```

O contrato deve continuar seguindo a implementação real do módulo.

---

# 44. Erro na Moderação

Falhas internas:

```text
HTTP 500
```

Detalhes técnicos devem permanecer nos logs do servidor.

---

# 45. Endpoint de Teste Removido

Anteriormente existia:

```text
/api/testar-moderacao
```

A rota tinha finalidade de diagnóstico.

Ela foi removida.

---

# 46. Regra sobre Endpoints Temporários

Rotas criadas somente para teste não devem permanecer publicamente disponíveis em produção sem necessidade.

Antes de criar uma rota de diagnóstico, considerar:

- pode ser um script local?
- pode ser um teste automatizado?
- precisa realmente ser HTTP público?

---

# 47. Vercel Firewall

As APIs que utilizam OpenAI possuem proteção adicional no Firewall da Vercel.

Atualmente:

```text
/api/entender-intencao
/api/moderar-texto
```

são protegidas por uma regra compartilhada.

---

# 48. Método Protegido pelo Firewall

A regra se aplica a:

```text
POST
```

---

# 49. Caminho da Regra

Expressão conceitual:

```text
^/api/(entender-intencao|moderar-texto)$
```

---

# 50. Rate Limit Atual

Configuração atual:

```text
Fixed Window

60 segundos

10 requisições

por endereço IP
```

---

# 51. Limite Compartilhado

As duas rotas compartilham o mesmo contador.

Exemplo:

```text
5 chamadas
/api/entender-intencao

+

5 chamadas
/api/moderar-texto

=

10 chamadas
```

Uma nova chamada dentro da mesma janela pode atingir o limite.

---

# 52. Resposta do Firewall

Ao ultrapassar:

```text
HTTP 429
Too Many Requests
```

A requisição pode ser interrompida antes de chegar à Function.

---

# 53. Benefício do Rate Limit

Fluxo desejado:

```text
ABUSO
   ↓
FIREWALL
   ↓
429
```

em vez de:

```text
ABUSO
   ↓
FUNCTION
   ↓
OPENAI
   ↓
CUSTO
```

---

# 54. Rate Limit não Substitui Validação

Mesmo com firewall:

> a API precisa continuar validando os dados.

Firewall protege frequência.

Validação protege contrato.

---

# 55. `/api/cron/atualizar-scores`

Arquivo:

```text
src/app/api/cron/atualizar-scores/route.ts
```

Finalidade:

> executar o recálculo periódico do score das lojas.

---

# 56. Método do Cron de Score

O fluxo atual de cron utiliza requisição:

```text
GET
```

A Vercel executa a rota agendada.

---

# 57. Segurança do Cron de Score

A rota verifica:

```text
CRON_SECRET
```

Uma chamada sem autorização válida não deve executar a RPC privilegiada.

---

# 58. Chamada não Autorizada

Durante os testes, chamadas sem autorização adequada retornaram:

```text
HTTP 401
```

---

# 59. Chamada Autorizada

Com autorização correta, a rota executa o processo e pode responder:

```text
HTTP 200
```

quando concluído normalmente.

---

# 60. RPC do Score

A API chama:

```text
public.atualizar_score_lojas()
```

através de Supabase RPC.

---

# 61. Privilégio do Score

A função de score não é executável pelos papéis públicos utilizados pelos clientes.

O backend utiliza privilégio server-side apropriado.

---

# 62. `/api/cron/verificar-planos`

Arquivo:

```text
src/app/api/cron/verificar-planos/route.ts
```

Finalidade:

> executar verificações periódicas relacionadas ao ciclo de assinaturas.

---

# 63. Responsabilidades do Cron de Planos

O fluxo possui lógica relacionada a:

- avisos antes do vencimento;
- vencimento;
- início de cortesia;
- encerramento de cortesia;
- retorno ao plano gratuito.

---

# 64. Janelas de Aviso

O processo atual considera avisos relacionados a períodos como:

```text
7 dias
3 dias
1 dia
```

antes de determinados vencimentos.

---

# 65. Segurança do Cron de Planos

No estado atual auditado, a rota:

```text
/api/cron/verificar-planos
```

não possui verificação explícita de `CRON_SECRET` dentro do próprio Route Handler.

Isso representa uma pendência de segurança porque a rota executa operações privilegiadas no backend.

A rota de atualização de scores já utiliza:

```text
CRON_SECRET
```

como proteção, porém essa mesma verificação ainda precisa ser aplicada ao cron de planos.

### Estado

```text
CRON DE SCORE
→ protegido por CRON_SECRET

CRON DE PLANOS
→ proteção explícita ainda pendente
```

### Exposição de detalhes internos

A auditoria do Route Handler atual também confirmou que algumas respostas HTTP `500` retornam:

```text
detalhes: error.message
```

ou mensagens equivalentes originadas de erros internos.

Esse comportamento deve ser endurecido para evitar exposição desnecessária de detalhes do backend ou do banco de dados.

### Correções pendentes

A rota:

```text
/api/cron/verificar-planos
```

deve receber:

- validação server-side de `CRON_SECRET` antes das operações privilegiadas;
- respostas externas genéricas para erros `500`;
- detalhes técnicos restritos aos logs server-side;
- teste de chamada não autorizada confirmando rejeição da requisição.

Até essas correções serem implementadas, o endpoint não deve ser considerado devidamente protegido.

---

# 66. Vercel Cron

Os agendamentos são declarados em:

```text
vercel.json
```

Atualmente existem agendamentos para:

```text
/api/cron/verificar-planos

/api/cron/atualizar-scores
```

---

# 67. Horários Atuais

Configuração atual conhecida:

```text
/api/cron/verificar-planos
0 3 * * *

/api/cron/atualizar-scores
0 4 * * *
```

Os horários cron devem ser interpretados conforme a infraestrutura configurada pela Vercel.

Não alterar assumindo horário local sem verificar a plataforma.

---

# 68. Cron deve ser Idempotente

Sempre que possível:

> executar a mesma rotina mais de uma vez não deve gerar duplicidade ou corrupção.

Isso é especialmente importante para:

- avisos;
- assinaturas;
- pagamentos;
- históricos.

---

# 69. `/api/mercadopago`

Arquivo:

```text
src/app/api/mercadopago/route.ts
```

Finalidade atual:

> iniciar ou preparar operações relacionadas à contratação de planos através do Mercado Pago.

---

# 70. Dados Relacionados ao Pagamento

A implementação trabalha com informações relacionadas a conceitos como:

```text
plano
loja_id
preco
periodo
plano_id
meses
```

O contrato exato deverá ser validado diretamente no arquivo antes de futuras alterações.

---

# 71. Regra de Segurança para Preço

Como princípio de arquitetura:

> valores financeiros críticos não devem ser confiados cegamente a dados enviados pelo frontend.

O backend deve validar os dados comerciais contra regras confiáveis do sistema.

---

# 72. Mercado Pago é Serviço Externo

Fluxo conceitual:

```text
CLIENTE
   ↓
VEMVER
   ↓
MERCADO PAGO
```

A credencial privada deve permanecer no servidor.

---

# 73. Credencial do Mercado Pago

Secrets do provedor de pagamento não devem utilizar prefixos públicos.

Nunca enviar token administrativo ao navegador.

---

# 74. `/api/webhook/mercadopago`

Arquivo:

```text
src/app/api/webhook/mercadopago/route.ts
```

Finalidade:

> receber eventos enviados pelo Mercado Pago.

---

# 75. Webhook não é Ação do Usuário

O webhook representa comunicação:

```text
MERCADO PAGO
      ↓
VEMVER
```

e não:

```text
NAVEGADOR DO CLIENTE
      ↓
"pagamento aprovado"
```

O frontend não deve sozinho determinar o estado financeiro.

---

# 76. Estado Financeiro

O estado interno deverá ser atualizado com base em informações confiáveis do provedor.

O sistema precisa evitar aceitar algo como:

```text
pago = true
```

simplesmente porque o cliente enviou esse valor.

---

# 77. Idempotência de Webhook

Um provedor pode reenviar o mesmo evento.

Portanto:

```text
EVENTO A
EVENTO A
EVENTO A
```

não deve necessariamente produzir:

```text
ATIVAÇÃO
ATIVAÇÃO
ATIVAÇÃO
```

O fluxo deverá continuar evoluindo para idempotência robusta.

---

# 78. Auditoria do Webhook

Antes de considerar a integração financeira madura para escala, devemos revisar:

- validação do evento;
- assinatura/autenticidade;
- identificação da transação;
- consulta ao provedor quando necessária;
- idempotência;
- duplicidade;
- transições de status;
- logs;
- histórico.

---

# 79. `/api/admin/planos/ativar`

Arquivo:

```text
src/app/api/admin/planos/ativar/route.ts
```

Finalidade:

> executar operação administrativa relacionada à ativação de planos.

---

# 80. Endpoint Administrativo

Rotas sob:

```text
/api/admin/
```

devem receber nível elevado de proteção.

Não basta verificar que existe uma sessão comum.

---

# 81. Autorização Administrativa

O servidor deve verificar explicitamente se o usuário possui direito de executar a operação.

Conceitualmente:

```text
AUTENTICADO
   ↓
É ADMIN?
 ↙      ↘
SIM     NÃO
 ↓       ↓
AÇÃO    403
```

A implementação exata desse endpoint deverá ser auditada antes de fixar neste documento seu contrato definitivo.

---

# 82. Status HTTP

As APIs devem utilizar status HTTP coerentes.

Direção atual:

```text
200
sucesso

400
entrada inválida

401
não autenticado / autorização de cron ausente

403
autenticado mas sem permissão
quando aplicável

404
recurso ou rota inexistente

413
payload grande demais

415
Content-Type incompatível

429
rate limit

500
erro interno
```

---

# 83. `400` não é `500`

Entrada inválida do usuário não deve ser tratada como erro interno.

Exemplo:

```text
mensagem vazia
```

deve produzir erro de validação.

Não:

```text
500
```

---

# 84. `500` não deve Vazar Detalhes

Evitar respostas como:

```text
erro.message
stack trace
chave
query
caminho interno
```

para clientes públicos.

---

# 85. Logs

Detalhes técnicos podem ser registrados server-side.

Os logs devem ajudar a identificar:

- rota;
- operação;
- falha;
- contexto necessário.

Nunca registrar secrets intencionalmente.

---

# 86. Secrets

Entre secrets importantes utilizados pela arquitetura estão:

```text
OPENAI_API_KEY

SUPABASE_SERVICE_ROLE_KEY

CRON_SECRET

credenciais privadas do Mercado Pago
```

---

# 87. Variáveis Públicas

Variáveis com:

```text
NEXT_PUBLIC_
```

podem chegar ao navegador.

Portanto:

> nunca colocar um secret nesse prefixo.

---

# 88. Service Role

APIs que utilizam:

```text
SUPABASE_SERVICE_ROLE_KEY
```

possuem alta responsabilidade.

O backend precisa assumir que essa chave pode ignorar restrições destinadas a usuários comuns.

---

# 89. Nunca Confiar em `user_id` Enviado pelo Cliente

Quando uma ação depende do usuário autenticado, o backend deve preferir obter a identidade da sessão autenticada.

Evitar depender apenas de:

```text
{
  "user_id": "..."
}
```

enviado pelo navegador.

---

# 90. IDs Manipuláveis

Qualquer ID recebido pelo cliente deve ser considerado manipulável.

Exemplo:

```text
loja_id = 10
```

pode ser trocado manualmente para:

```text
loja_id = 11
```

Por isso, autorização deve existir no servidor.

---

# 91. Validação por Camadas

Uma API robusta pode seguir:

```text
1. método

2. Content-Type

3. tamanho do body

4. parsing

5. tipos dos campos

6. limites

7. autenticação

8. autorização

9. regra de negócio

10. banco / serviço externo
```

Nem todas as rotas precisarão das dez etapas.

---

# 92. Validação antes de Serviço Pago

Qualquer API que utilize serviço cobrado deve validar o máximo possível antes da chamada externa.

Exemplos:

```text
OpenAI
Mercado Pago
serviços futuros de mapas
```

---

# 93. Contrato de Entrada

Cada endpoint importante deverá possuir contrato previsível.

Não permitir que a lógica dependa de qualquer campo arbitrário enviado pelo cliente.

---

# 94. Campos Extras

Campos extras devem ser ignorados ou rejeitados conforme a necessidade de cada contrato.

Em operações críticas, contratos mais estritos podem ser preferíveis.

---

# 95. Limite de Texto

Campos textuais públicos precisam possuir limites.

Isso ajuda a evitar:

- abuso;
- custos;
- payload excessivo;
- problemas de interface;
- dados impossíveis de administrar.

---

# 96. Limite de Body

Mesmo que cada campo possua limite, também é útil possuir limite total de body.

Isso impede payloads como:

```text
{
  "texto": "válido",
  "lixo": "milhões de caracteres"
}
```

---

# 97. CORS

O comportamento de CORS deverá ser configurado apenas quando houver necessidade real de clientes externos.

Não liberar origens amplamente apenas para contornar problemas de desenvolvimento.

---

# 98. Futuro Aplicativo Mobile

Quando Android e iOS forem implementados, as regras centrais deverão continuar acessíveis através de contratos seguros.

Direção:

```text
WEB ─────┐
         │
         ▼
       APIs
         ▲
         │
APP ─────┘
```

---

# 99. API não Deve Depender da Interface

Uma API não deve assumir que apenas determinada tela conseguirá chamá-la.

Qualquer cliente HTTP pode tentar acessar uma rota pública.

---

# 100. Versionamento Futuro de API

Enquanto web e backend forem evoluídos juntos, talvez não seja necessário versionar todas as rotas imediatamente.

Com:

- aplicativo móvel;
- integrações externas;
- parceiros;

poderá ser necessário adotar contratos versionados.

Exemplo futuro:

```text
/api/v1/...
```

Essa mudança não deve ser feita antes da necessidade real.

---

# 101. APIs Públicas Futuras

Caso o VemVer futuramente forneça API para parceiros, ela deverá possuir arquitetura própria para:

- autenticação;
- chaves;
- scopes;
- rate limits;
- documentação;
- versão;
- cobrança quando aplicável;
- auditoria.

Não reutilizar automaticamente endpoints internos.

---

# 102. Paginação

Endpoints com grandes coleções deverão evoluir para paginação.

Exemplos:

- produtos;
- avaliações;
- histórico;
- resultados;
- administração.

---

# 103. Limite Máximo de Página

Mesmo endpoints paginados devem possuir tamanho máximo de página.

Evitar:

```text
limit=1000000
```

---

# 104. Busca Inteligente em Escala

Atualmente a busca:

```text
RPC
   ↓
candidatos
   ↓
ranking no backend
```

é suficiente para a fase atual.

Com aumento do catálogo, a API poderá precisar de:

- índices;
- paginação;
- cache;
- busca especializada;
- ranking em banco;
- mecanismo dedicado.

---

# 105. Cache

Cache poderá ser introduzido futuramente.

Porém, precisa considerar dados que mudam frequentemente.

Exemplo:

```text
loja aberta
preço
estoque
plano
```

podem exigir estratégias diferentes de cache.

---

# 106. Timeouts

Chamadas externas precisam possuir comportamento controlado em caso de demora.

Um serviço externo indisponível não deve bloquear indefinidamente uma requisição.

Estratégias deverão ser implementadas conforme cada integração amadurecer.

---

# 107. Retry

Retries automáticos devem ser usados com cuidado.

Em operações somente de leitura, podem ser relativamente seguros.

Em operações como:

```text
COBRAR
ATIVAR
CRIAR
```

um retry mal planejado pode duplicar ações.

---

# 108. Idempotency Key

Operações financeiras futuras poderão utilizar identificadores ou chaves de idempotência quando suportadas e necessárias.

---

# 109. Webhook e Retry

Webhooks precisam assumir que provedores podem:

- repetir;
- atrasar;
- entregar fora da ordem.

O estado interno deve continuar coerente.

---

# 110. Crons e Retry

Crons também devem suportar execução repetida sem consequências incorretas.

---

# 111. Observabilidade

As APIs deverão evoluir para permitir medição de:

- quantidade de chamadas;
- latência;
- erros;
- `4xx`;
- `5xx`;
- `429`;
- uso da OpenAI;
- custo;
- falhas externas.

---

# 112. Busca sem Resultado

A API de descoberta futuramente poderá registrar métricas de buscas que não encontraram opções.

Esses dados serão importantes para:

- melhorar busca;
- descobrir categorias ausentes;
- aquisição de lojistas.

---

# 113. Privacidade

Não registrar indiscriminadamente todo texto digitado pelos usuários sem finalidade e política definidas.

Buscas podem revelar informações pessoais ou sensíveis.

---

# 114. Dados de Localização

Latitude e longitude precisam de tratamento responsável.

Não armazenar histórico de localização apenas porque a API recebeu coordenadas.

Persistência exige finalidade específica.

---

# 115. Segurança Financeira

Endpoints relacionados a pagamentos devem receber prioridade especial em revisões.

Qualquer alteração precisa considerar:

- fraude;
- manipulação de valores;
- repetição;
- autorização;
- estado da assinatura.

---

# 116. Segurança Administrativa

Endpoints administrativos devem ser tratados como área de risco alto.

Uma falha pode permitir:

- ativar planos;
- modificar estados;
- acessar dados;
- afetar várias lojas.

---

# 117. Testes de API

Cada endpoint crítico deverá futuramente possuir testes automatizados para:

```text
entrada válida

entrada inválida

não autorizado

autorizado

limites

serviço externo falhando

resposta esperada
```

---

# 118. Testes Manuais Atuais

Durante o desenvolvimento atual, APIs importantes já foram testadas manualmente em ambientes como:

- local;
- Preview;
- Production.

Esse processo continuará útil, mas não deverá substituir testes automatizados no longo prazo.

---

# 119. TypeScript

Alterações de API devem continuar sendo validadas com:

```text
npx tsc --noEmit
```

quando aplicável.

---

# 120. Build

Antes de considerar mudanças importantes prontas:

```text
npm run build
```

deve concluir corretamente.

---

# 121. Lint

O projeto ainda possui débito técnico de lint global.

Não declarar:

```text
lint aprovado
```

enquanto o comando global continuar apresentando erros legados.

Mudanças novas devem evitar ampliar esse débito.

---

# 122. Teste Pós-Deploy

Depois de alterar uma API crítica:

```text
MERGE
   ↓
PRODUCTION
   ↓
TESTE REAL
```

quando seguro e aplicável.

---

# 123. Mudanças de Contrato

Modificar:

```text
nome de campo
tipo
status
estrutura de resposta
```

pode quebrar clientes.

Deve ser tratado como alteração de contrato.

---

# 124. Compatibilidade

Quando possível, mudanças devem permitir transição gradual.

Exemplo:

```text
ADICIONAR CAMPO NOVO
   ↓
ATUALIZAR CLIENTES
   ↓
REMOVER CAMPO ANTIGO DEPOIS
```

pode ser mais seguro que alteração destrutiva imediata.

---

# 125. Não Expor RPC Privilegiada Diretamente

Uma função de banco protegida não deve ser tornada pública apenas para facilitar chamada pelo frontend.

Preferir:

```text
FRONTEND
   ↓
API
   ↓
RPC PRIVILEGIADA
```

---

# 126. OpenAI

A OpenAI deve continuar limitada a funções adequadas.

Atualmente:

```text
interpretação
moderação
```

Ela não deve controlar:

- pagamento;
- autenticação;
- autorização;
- estado de assinatura;
- banco;
- score final.

---

# 127. Mercado Pago

O Mercado Pago deve continuar responsável pelo processamento externo de pagamento.

O VemVer mantém o estado interno necessário à assinatura.

---

# 128. Supabase

Supabase continua sendo a principal infraestrutura de dados e autenticação.

APIs devem usar:

- cliente público;
- sessão;
- service role;

de acordo com a necessidade real de cada operação.

---

# 129. Vercel

A Vercel participa da API através de:

- hosting;
- server execution;
- firewall;
- rate limit;
- crons;
- variáveis de ambiente;
- logs;
- Preview;
- Production.

---

# 130. Regra para Nova API

Antes de criar uma nova rota:

```text
1. Por que ela precisa existir?

2. Não existe rota adequada?

3. É pública ou privada?

4. Precisa autenticação?

5. Precisa autorização?

6. Usa secret?

7. Usa serviço pago?

8. Qual body máximo?

9. Quais campos?

10. Quais status?

11. Como testar?

12. Qual rate limit?

13. Qual documentação atualizar?
```

---

# 131. Não Criar Endpoint por Conveniência

Uma função interna de código não precisa virar API automaticamente.

API aumenta:

- superfície de ataque;
- manutenção;
- contrato;
- observabilidade;
- necessidade de segurança.

---

# 132. Nomenclatura

Rotas devem possuir nomes previsíveis e relacionados ao domínio.

Evitar endpoints como:

```text
/api/teste2
/api/coisa
/api/temp
```

em produção.

---

# 133. Rotas de Diagnóstico

Ferramentas temporárias devem preferir:

- scripts;
- testes;
- ambiente local;
- logs;

em vez de endpoints públicos permanentes.

---

# 134. APIs em Uma Frase

> As APIs do VemVer formam a camada segura entre as interfaces e os serviços internos ou externos, validando entradas, protegendo credenciais e aplicando regras antes que dados ou operações críticas sejam executados.

---

# 135. Relação com Outros Documentos

Este documento deve ser lido junto com:

```text
../00_PROJECT_CONSTITUTION.md

../product/MASTER_DOCUMENT.md
../product/PRODUCT_VISION.md
../product/ROADMAP.md
../product/BUSINESS_RULES.md

ARCHITECTURE.md
DATABASE.md
SECURITY.md
DEPLOY.md

../engineering/CODING_STANDARDS.md
../engineering/TEST_PLAN.md
../engineering/CHECKLIST.md

../governance/DECISIONS.md
```

---

# 136. Regra Final

Uma API do VemVer não estará pronta apenas porque responde corretamente no cenário feliz.

Ela deverá considerar:

```text
ENTRADA INVÁLIDA

ABUSO

USUÁRIO NÃO AUTORIZADO

DADO MANIPULADO

SERVIÇO EXTERNO FORA DO AR

CHAMADA DUPLICADA

ERRO INTERNO

ESCALA
```

A API deve proteger o sistema mesmo quando o cliente não se comporta como esperado.

---

# 137. Conclusão

A arquitetura atual de APIs já possui fundamentos importantes:

- validação antes da OpenAI;
- limites de payload;
- limites de texto;
- respostas HTTP adequadas;
- erros internos não expostos;
- rate limit;
- cron de score protegido por `CRON_SECRET`;
- proteção explícita do cron de planos ainda pendente;
- RPCs privilegiadas;
- secrets server-side;
- separação entre IA e banco;
- remoção de endpoint temporário.

As próximas revisões deverão aprofundar principalmente:

```text
MERCADO PAGO

WEBHOOK

AUTORIZAÇÃO ADMINISTRATIVA

AUTENTICAÇÃO E AUTORIZAÇÃO DAS ROTAS

TESTES AUTOMATIZADOS

OBSERVABILIDADE
```

Essas áreas possuem impacto elevado e deverão ser auditadas diretamente no código antes de considerarmos seus contratos definitivos.

O princípio permanece:

> toda API deve expor somente o necessário, validar antes de executar e conceder somente o privilégio necessário.
