# VemVer — Plano Oficial de Testes

## Documento

**Projeto:** VemVer
**Documento:** Plano Oficial de Testes
**Versão:** 1.0.0
**Status:** Ativo
**Última atualização:** 17/08/2026

---

# 1. Objetivo

Este documento define como o VemVer deverá ser testado antes de uma alteração ser considerada concluída.

O objetivo é reduzir:

- regressões;
- erros em produção;
- falhas de segurança;
- inconsistências no banco;
- problemas de integração;
- comportamento diferente entre Local, Preview e Production.

Testar não significa apenas verificar se:

```text
"a tela abriu"
```

O objetivo é confirmar que:

```text
A FUNCIONALIDADE CORRETA
        ↓
FUNCIONA
        ↓
COM DADOS CORRETOS
        ↓
PARA O USUÁRIO CORRETO
        ↓
SEM QUEBRAR O RESTANTE
```

---

# 2. Princípio Central

Toda feature importante deve ser testada em dois sentidos:

```text
CENÁRIO ESPERADO
```

e:

```text
CENÁRIO DE ERRO
```

Não devemos testar apenas o caminho feliz.

---

# 3. Tipos de Teste

O VemVer deverá evoluir utilizando diferentes níveis de teste:

```text
VALIDAÇÃO ESTÁTICA

TESTE UNITÁRIO

TESTE DE INTEGRAÇÃO

TESTE DE API

TESTE DE BANCO

TESTE DE SEGURANÇA

TESTE DE INTERFACE

TESTE END-TO-END

TESTE DE PREVIEW

TESTE PÓS-DEPLOY
```

Nem todos estão totalmente automatizados atualmente.

---

# 4. Estado Atual

Na fase atual, a validação utiliza principalmente:

- TypeScript;
- build;
- testes manuais;
- chamadas HTTP;
- testes do Supabase;
- Vercel Preview;
- testes em Production quando seguros.

A automação de testes ainda deverá crescer progressivamente.

---

# 5. TypeScript

Comando principal:

```powershell
npx tsc --noEmit
```

Objetivo:

- verificar tipos;
- identificar imports incorretos;
- detectar incompatibilidades;
- confirmar contratos TypeScript.

---

# 6. Resultado Esperado do TypeScript

Quando estiver correto:

```text
nenhum erro
```

O comando deve terminar normalmente.

---

# 7. TypeScript não Substitui Runtime

O TypeScript não valida automaticamente dados vindos da internet.

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

Portanto, APIs continuam precisando de testes de runtime.

---

# 8. Build

Comando principal:

```powershell
npm run build
```

Objetivo:

- validar compilação de produção;
- validar rotas;
- detectar erros do Next.js;
- detectar problemas de imports;
- confirmar geração da aplicação.

---

# 9. Resultado Esperado do Build

O build precisa terminar com sucesso.

Não considerar uma alteração pronta se:

```text
npm run build
```

falhar por causa dela.

---

# 10. Build e `.next`

O Next.js gera tipos e artefatos dentro de:

```text
.next/
```

Em determinadas situações, dados antigos dessa pasta podem gerar erros temporários.

Quando houver suspeita de artefato obsoleto:

```text
executar novo build
```

pode regenerar os tipos.

Não apagar arquivos indiscriminadamente sem entender o problema.

---

# 11. Lint

O comando global é:

```powershell
npm run lint
```

Entretanto, atualmente existe dívida técnica legada.

O lint global ainda possui problemas anteriores às mudanças recentes.

Portanto:

> não registrar falsamente que o lint está 100% aprovado.

---

# 12. Estado Atual do Lint

O projeto possui erros e warnings legados.

A correção global deverá ser tratada como trabalho específico.

Features novas devem evitar aumentar esse débito.

---

# 13. `git diff --check`

Antes de commits importantes:

```powershell
git diff --check
```

Resultado ideal:

```text
nenhuma saída
```

Esse teste ajuda a detectar problemas de whitespace.

---

# 14. `git status`

Também utilizar:

```powershell
git status --short --untracked-files=all
```

para confirmar exatamente quais arquivos serão incluídos.

---

# 15. Revisão do Diff

Antes de commit:

```powershell
git diff
```

deve ser utilizado quando necessário para verificar:

- arquivo inesperado;
- remoção acidental;
- secret;
- código de teste;
- mudança fora do escopo.

---

# 16. Ambiente Local

O desenvolvimento local pode ser executado com:

```powershell
npx next dev --webpack
```

quando quisermos utilizar explicitamente Webpack.

---

# 17. Teste Local

O ambiente local deve ser utilizado para validar primeiro:

```text
IMPLEMENTAÇÃO
   ↓
FUNCIONALIDADE
   ↓
ERROS ÓBVIOS
```

antes de enviar para Preview.

---

# 18. Preview

O Preview da Vercel é a segunda grande camada de validação.

Fluxo:

```text
LOCAL
  ↓
PUSH
  ↓
PREVIEW
```

---

# 19. Por que Testar Preview

Preview ajuda a identificar diferenças relacionadas a:

- build remoto;
- Linux;
- variáveis;
- Vercel;
- rotas;
- ambiente;
- integrações.

---

# 20. Preview Protegido

O Preview atual possui proteção da Vercel.

Quando testes automatizados ou manuais precisarem acessar Preview protegido, utilizar somente mecanismos autorizados.

Secrets de bypass não devem ser expostos.

---

# 21. Production

Depois do merge:

```text
main
   ↓
Production
```

mudanças importantes deverão ser validadas no domínio real quando seguro.

---

# 22. Domínio de Produção

Domínio atual:

```text
https://vemverapp.com.br
```

---

# 23. Teste Pós-Deploy

Uma mudança não está necessariamente confirmada apenas porque:

```text
Vercel = Ready
```

Quando aplicável:

```text
READY
   ↓
TESTE REAL
   ↓
CONFIRMADO
```

---

# 24. Não Testar Destrutivamente em Produção

Evitar testes que:

- excluam dados reais;
- alterem planos reais;
- criem cobranças reais sem necessidade;
- alterem usuários indevidamente;
- gerem spam;
- inundem APIs.

---

# 25. Testes de API

Cada API crítica deve possuir cenários de:

```text
SUCESSO

ENTRADA INVÁLIDA

AUTORIZAÇÃO

LIMITES

ERRO EXTERNO

ERRO INTERNO
```

---

# 26. API `/api/entender-intencao`

A rota de descoberta inteligente deve ser testada em vários níveis.

---

# 27. Busca — Cenário Básico

Exemplo:

```json
{
  "mensagem": "Quero açaí"
}
```

O esperado é:

- request válido;
- OpenAI interpretar;
- backend buscar candidatos;
- retornar estrutura válida;
- não produzir erro interno.

---

# 28. Busca sem Acentos

Testar:

```text
acai
```

contra dado:

```text
Açaí
```

A busca deve continuar encontrando resultados compatíveis.

---

# 29. Busca por Nome

Testar termos relacionados diretamente ao nome de uma loja.

O objetivo é verificar a prioridade de relevância textual.

---

# 30. Busca por Categoria

Testar termos relacionados à categoria.

Exemplo:

```text
moda
```

deve localizar lojas compatíveis quando existirem.

---

# 31. Busca por Descrição

Testar termos presentes apenas na descrição quando aplicável.

A contribuição deve ser menor do que correspondência forte em nome ou categoria.

---

# 32. Palavras Genéricas

Testar mensagens como:

```text
loja de moda
```

para confirmar que termos genéricos não prejudicam a busca.

---

# 33. Cidade

Testar:

```json
{
  "mensagem": "Quero açaí",
  "cidade": "Joinville"
}
```

A consulta deve respeitar o contexto geográfico disponível.

---

# 34. UF

Testar formatos como:

```text
sc
```

e confirmar normalização para:

```text
SC
```

---

# 35. Latitude e Longitude

Testar coordenadas válidas juntas.

Exemplo conceitual:

```json
{
  "mensagem": "Quero algo perto de mim",
  "latitude": -26.30,
  "longitude": -48.84
}
```

---

# 36. Latitude sem Longitude

Deve ser rejeitada.

---

# 37. Longitude sem Latitude

Deve ser rejeitada.

---

# 38. Latitude Inválida

Testar valores fora de:

```text
-90 até 90
```

Resposta esperada:

```text
400
```

---

# 39. Longitude Inválida

Testar valores fora de:

```text
-180 até 180
```

Resposta esperada:

```text
400
```

---

# 40. Mensagem Vazia

Testar:

```json
{
  "mensagem": ""
}
```

e também:

```json
{
  "mensagem": "   "
}
```

Devem ser rejeitadas.

---

# 41. Mensagem com Tipo Errado

Exemplo:

```json
{
  "mensagem": 123
}
```

Deve ser rejeitada.

---

# 42. Mensagem Acima do Limite

Limite atual:

```text
300 caracteres
```

Testar:

```text
301+
```

Resposta esperada:

```text
400
```

---

# 43. Cidade Acima do Limite

Limite atual:

```text
100 caracteres
```

Entrada acima desse valor deve ser rejeitada.

---

# 44. UF Inválida

Exemplos:

```text
S

SCC

123
```

devem ser rejeitados.

---

# 45. Content-Type Incorreto

Exemplo:

```text
text/plain
```

Resposta esperada:

```text
415
```

---

# 46. JSON Malformado

Enviar JSON inválido.

Resposta esperada:

```text
400
```

---

# 47. Body Grande

Limite atual:

```text
8.000 bytes
```

Body acima do limite deve retornar:

```text
413
```

---

# 48. OpenAI não Deve ser Chamada em Entrada Inválida

Esse é um requisito importante.

Fluxo esperado:

```text
ENTRADA INVÁLIDA
       ↓
400 / 413 / 415
       ↓
PARA
```

Não:

```text
ENTRADA INVÁLIDA
       ↓
OPENAI
       ↓
ERRO
```

---

# 49. Ranking

O ranking atual precisa preservar:

```text
1. relevância textual

2. distância quando pertoDeMim

3. score

4. nome
```

---

# 50. Teste de Patrocinado Irrelevante

Criar ou utilizar cenário onde:

```text
LOJA A
patrocinada mas irrelevante
```

e:

```text
LOJA B
relevante para a busca
```

A loja irrelevante não deve vencer apenas pelo fator comercial.

---

# 51. Teste de Distância

Quando:

```text
pertoDeMim = true
```

e duas lojas possuem relevância equivalente:

```text
LOJA MAIS PRÓXIMA
```

deve poder ganhar prioridade.

---

# 52. Loja sem Coordenadas

Lojas sem coordenadas não devem ser removidas automaticamente apenas por não possuírem distância.

O resultado deve manter:

```text
distanciaKm = null
```

quando aplicável.

---

# 53. Limite de Resultados

Confirmar que o backend retorna no máximo:

```text
20
```

resultados no fluxo atual.

---

# 54. Filtros Ainda Não Aplicados

Se a IA interpretar:

```text
delivery
abertoAgora
preco
```

o sistema não deve inventar essas condições.

Testar que a ausência de dados não produz afirmações falsas.

---

# 55. API `/api/moderar-texto`

A rota de moderação deve possuir testes próprios.

---

# 56. Texto Permitido

Enviar um texto normal.

Esperado:

```text
permitido = true
```

quando o serviço de moderação não detectar problema.

---

# 57. Texto Sinalizado

Quando possível, utilizar caso seguro de teste compatível com políticas para confirmar o tratamento de conteúdo sinalizado.

O objetivo é testar a estrutura da resposta, não produzir conteúdo nocivo desnecessariamente.

---

# 58. Texto Vazio

Testar:

```json
{
  "texto": ""
}
```

Resposta:

```text
400
```

---

# 59. Texto com Tipo Errado

Exemplo:

```json
{
  "texto": 123
}
```

Resposta:

```text
400
```

---

# 60. Texto Acima do Limite

Limite atual:

```text
2.000 caracteres
```

Testar:

```text
2.001+
```

Resposta esperada:

```text
400
```

---

# 61. Body Grande na Moderação

Limite:

```text
8.000 bytes
```

Resposta esperada:

```text
413
```

---

# 62. Array como Body

Exemplo:

```json
[]
```

Deve ser rejeitado.

---

# 63. `null` como Body

Exemplo:

```json
null
```

Deve ser rejeitado.

---

# 64. Content-Type da Moderação

Com:

```text
text/plain
```

esperado:

```text
415
```

---

# 65. JSON Inválido na Moderação

Resposta:

```text
400
```

---

# 66. Erro da OpenAI

Quando o provedor falhar:

```text
500
```

pode ser retornado com mensagem segura.

A resposta não deve expor o erro interno completo.

---

# 67. Endpoint Removido

A rota:

```text
/api/testar-moderacao
```

foi removida.

Teste de regressão:

```text
GET /api/testar-moderacao
```

deve continuar retornando:

```text
404
```

enquanto a rota permanecer removida.

---

# 68. Rate Limit

A proteção atual da Vercel deve ser testada quando a configuração for alterada.

---

# 69. Rotas Protegidas

Atualmente:

```text
POST /api/entender-intencao

POST /api/moderar-texto
```

---

# 70. Regra Atual

Configuração:

```text
10 requisições

60 segundos

por IP
```

com limite compartilhado.

---

# 71. Teste do Limite Compartilhado

Exemplo:

```text
5 chamadas de busca
+
5 chamadas de moderação
```

atingem o total compartilhado.

Uma próxima chamada dentro da janela deve poder receber:

```text
429
```

---

# 72. Não Confundir `400` com Falha do Rate Limit

Durante um teste de WAF, requests podem retornar:

```text
400
```

porque o body foi propositalmente inválido.

Isso ainda significa que chegaram à Function.

O teste do rate limit é confirmado quando:

```text
429
```

é retornado pelo Firewall.

---

# 73. Banco de Dados

Toda migration precisa de teste próprio.

---

# 74. Antes da Migration

Confirmar:

```text
PROJETO SUPABASE CORRETO
```

antes de aplicar.

---

# 75. Depois da Migration

Verificar:

- migration registrada;
- SQL aplicado;
- função existente;
- permissões;
- aplicação compatível.

---

# 76. Histórico de Migration

Local e remoto devem permanecer coerentes.

---

# 77. `unaccent`

Teste direto do banco:

```text
acai
```

deve localizar registro como:

```text
Açaí Norte
```

quando os demais filtros forem compatíveis.

---

# 78. RPC `buscar_lojas_sem_acentos`

Testar:

- termo válido;
- cidade;
- UF;
- loja ativa;
- loja aprovada;
- loja inativa;
- loja não aprovada.

---

# 79. Loja Inativa

Uma loja com:

```text
ativo = false
```

não deve participar da RPC pública de descoberta atual.

---

# 80. Loja Não Aprovada

Uma loja cujo:

```text
status != 'aprovada'
```

não deve aparecer na busca atual.

---

# 81. Permissão da RPC de Busca

Confirmar que:

```text
anon
authenticated
```

não possuem permissão de execução direta no fluxo protegido atual.

---

# 82. `service_role`

Confirmar que o backend autorizado continua conseguindo executar a função.

---

# 83. Função `atualizar_score_lojas`

Testar a execução via ambiente autorizado.

---

# 84. Fórmula do Score

Quando alterada, deve possuir testes dos principais sinais:

```text
patrocinado

premium

visualizações

produtos

favoritos

avaliações
```

---

# 85. Premium x Patrocinado

Testar que a base comercial funciona como:

```text
patrocinado → 60

senão premium → 30

senão → 0
```

e não como soma:

```text
60 + 30
```

---

# 86. Limites do Score

Testar tetos quando a fórmula for alterada.

Exemplos atuais:

```text
visualizações

produtos

favoritos

avaliações
```

possuem contribuição limitada.

---

# 87. Cron de Score

Endpoint:

```text
/api/cron/atualizar-scores
```

---

# 88. Cron sem Autorização

Esperado:

```text
401
```

---

# 89. Cron Autorizado

Com autorização correta:

```text
200
```

quando a operação concluir normalmente.

---

# 90. Validação do Efeito do Cron

Depois de executar:

- consultar score;
- confirmar atualização;
- verificar se função realmente rodou.

Não testar apenas o status HTTP.

---

# 91. Cron de Planos

Endpoint:

```text
/api/cron/verificar-planos
```

---

# 92. Cenários do Cron de Planos

O fluxo deverá possuir testes para:

```text
7 dias antes

3 dias antes

1 dia antes

vencimento

início de cortesia

fim de cortesia

retorno ao grátis
```

---

# 93. Testes já Realizados no Cron de Planos

O fluxo já foi exercitado durante desenvolvimento com cenários controlados de:

- sete dias;
- três dias;
- um dia;
- cortesia;
- encerramento da cortesia;
- retorno ao grátis.

Esses testes deverão futuramente tornar-se automatizados.

---

# 94. Idempotência do Cron

Executar novamente não deve gerar estados incorretos ou eventos duplicados indevidos.

---

# 95. Planos

Testes de plano devem separar:

```text
REGRA DO PLANO
```

de:

```text
INTERFACE
```

---

# 96. Plano Gratuito

Testar:

- limite correto;
- recursos permitidos;
- bloqueio de recursos pagos quando aplicável.

---

# 97. Premium

Testar:

- ativação;
- vencimento;
- funcionalidades;
- score quando aplicável.

---

# 98. Patrocinado

Testar:

- ativação;
- comportamento comercial;
- ranking sem quebrar relevância.

---

# 99. Multiunidade e Franquia

Enquanto funcionalidades não estiverem completamente implementadas:

> não criar teste afirmando comportamento inexistente.

Os testes devem acompanhar o código real.

---

# 100. Mercado Pago

A integração financeira deverá receber uma bateria específica antes de expansão comercial.

---

# 101. Criação de Pagamento

Testar:

- plano válido;
- loja válida;
- usuário autorizado;
- valor validado no servidor;
- erro do provedor.

---

# 102. Manipulação de Preço

Testar envio de preço diferente pelo cliente.

O servidor não deve confiar cegamente no valor manipulado.

---

# 103. Loja de Outro Usuário

Testar tentativa de contratar ou modificar plano para uma loja sem autorização.

---

# 104. Webhook

Endpoint:

```text
/api/webhook/mercadopago
```

---

# 105. Testes Futuros Obrigatórios do Webhook

Precisamos validar:

```text
evento válido

evento inválido

evento duplicado

evento desconhecido

pagamento inexistente

pagamento pendente

pagamento aprovado

pagamento rejeitado

reenvio do mesmo evento
```

---

# 106. Idempotência de Webhook

O mesmo evento repetido não deve gerar várias ativações indevidas.

---

# 107. Segurança do Webhook

Antes de escalar pagamentos, validar o mecanismo real de autenticidade adotado pelo Mercado Pago na implementação.

---

# 108. Admin

Rotas administrativas precisam de testes de autorização.

---

# 109. Usuário Não Autenticado

Esperado:

```text
não consegue executar operação administrativa
```

---

# 110. Usuário Comum

Mesmo autenticado:

```text
não deve possuir privilégio de administrador
```

---

# 111. Administrador Autorizado

Deve conseguir executar somente operações permitidas.

---

# 112. Propriedade da Loja

Essa é uma área prioritária de teste.

---

# 113. Lojista e Própria Loja

O lojista deve conseguir alterar somente campos autorizados da própria loja.

---

# 114. Lojista e Loja de Outro Usuário

Deve ser bloqueado.

---

# 115. Mass Assignment

Enviar campos extras como:

```text
score

premium

patrocinado

status

user_id
```

não deve permitir alteração indevida.

---

# 116. Autenticação

Testar fluxos principais:

```text
login

logout

recuperação de senha

redefinição
```

---

# 117. Login Válido

Credenciais corretas devem permitir entrada correspondente ao tipo de conta.

---

# 118. Login Inválido

Senha incorreta deve gerar feedback adequado sem revelar informações indevidas.

---

# 119. Recuperação de Senha

Testar:

- solicitação;
- recebimento do link;
- link válido;
- redefinição;
- login com nova senha.

---

# 120. Link de Recuperação

Confirmar que links inválidos ou expirados não permitem redefinição indevida.

---

# 121. Logout

Depois do logout, páginas protegidas não devem continuar acessíveis como sessão autenticada.

---

# 122. Interface Cliente

Testes devem considerar:

- navegação;
- busca;
- favoritos;
- avaliações;
- histórico;
- perfil;
- loja;
- produto.

Somente funcionalidades realmente implementadas devem ser marcadas como concluídas.

---

# 123. Interface Lojista

Testar:

- dashboard;
- cadastro;
- edição de loja;
- produtos;
- planos;
- limites;
- erros;
- permissões.

---

# 124. Página da Loja

Testar cenários:

```text
loja existente

loja inexistente

loja sem imagem

loja sem descrição

loja sem coordenadas

loja com produtos

loja sem produtos
```

conforme a implementação real.

---

# 125. Produto

Testar:

```text
produto existente

produto inexistente

produto ativo

produto inativo

loja relacionada
```

quando aplicável.

---

# 126. Favoritos

Testar:

- favoritar;
- desfavoritar;
- atualização visual;
- persistência;
- usuário correto.

---

# 127. Avaliações

Testar:

- nota válida;
- comentário;
- usuário;
- loja correta;
- duplicidade conforme regra;
- moderação quando aplicável.

---

# 128. Avaliação Planejada em Modal

Quando a nova UX for implementada:

```text
LOJA
  ↓
AVALIAR
  ↓
MODAL / SUBABA
```

deverá possuir testes para:

- abrir;
- fechar;
- escolher 1–5 estrelas;
- comentário;
- publicar;
- cancelar;
- erro;
- carregamento.

---

# 129. Tema

Quando implementado:

```text
Automático

Claro

Escuro
```

deverá ser testado.

---

# 130. Tema Automático

Testar:

```text
sistema claro
→ VemVer claro

sistema escuro
→ VemVer escuro
```

quando a opção estiver em Automático.

---

# 131. Persistência de Tema

Se o usuário escolher manualmente:

```text
Claro
```

ou:

```text
Escuro
```

a preferência deverá persistir conforme a estratégia definida.

---

# 132. Tema não Altera Funcionalidade

Executar os principais fluxos nos dois temas.

A troca de cor não pode:

- esconder botão;
- quebrar contraste;
- remover informação;
- alterar regra.

---

# 133. Responsividade

Testar no mínimo larguras representativas de:

```text
CELULAR

TABLET

DESKTOP
```

para páginas críticas.

---

# 134. Mobile

Dar atenção especial à descoberta local porque o uso móvel será estratégico.

---

# 135. Acessibilidade

Testar progressivamente:

- navegação por teclado;
- foco;
- labels;
- contraste;
- textos alternativos;
- botões semanticamente corretos.

---

# 136. Loading

Operações assíncronas devem mostrar estado adequado quando necessário.

---

# 137. Duplo Clique

Testar ações importantes com cliques repetidos.

Especialmente:

```text
salvar

pagar

ativar

publicar
```

---

# 138. Empty States

Testar listas sem dados.

Exemplos:

```text
sem favoritos

sem avaliações

sem produtos

sem histórico
```

A interface deve continuar compreensível.

---

# 139. Erros Externos

Simular ou considerar falha de:

```text
OpenAI

Supabase

Mercado Pago
```

---

# 140. OpenAI Indisponível

O usuário não deve receber stack trace ou erro técnico bruto.

---

# 141. Supabase Indisponível

A aplicação deve falhar de forma controlada.

Não inventar dados.

---

# 142. Mercado Pago Indisponível

Não ativar plano como aprovado se o pagamento não puder ser validado.

---

# 143. Segurança

Testes de segurança devem fazer parte do fluxo normal.

---

# 144. IDs Manipulados

Trocar IDs manualmente em requests e confirmar autorização.

---

# 145. Body Manipulado

Adicionar campos não esperados e verificar comportamento.

---

# 146. Secrets

Antes de commit:

```text
nenhum secret deve aparecer no diff
```

---

# 147. `NEXT_PUBLIC_`

Confirmar que secrets nunca foram inseridos em variável pública.

---

# 148. Service Role

Nunca testar expondo a chave ao frontend.

Testes devem ocorrer server-side.

---

# 149. Rate Limit

Testes de carga simples podem verificar o WAF.

Evitar testes excessivos desnecessários em produção.

---

# 150. Uploads

Quando fluxos de imagem evoluírem, testar:

```text
arquivo válido

arquivo grande

tipo inválido

extensão falsa

sem arquivo

múltiplos arquivos

falha de upload
```

---

# 151. Performance

Não é necessário criar benchmark completo para toda feature.

Mas áreas críticas devem ser observadas.

---

# 152. Busca

Monitorar especialmente:

- tempo da OpenAI;
- RPC;
- quantidade de candidatos;
- ranking;
- resposta total.

---

# 153. Banco

Queries com crescimento relevante deverão ser avaliadas.

---

# 154. Imagens

Verificar:

- tamanho;
- carregamento;
- layout;
- mobile.

---

# 155. Testes Automatizados Futuros

O VemVer deverá progressivamente introduzir testes automatizados.

---

# 156. Prioridade de Automação

Primeiras áreas recomendadas:

```text
1. regras puras

2. APIs de IA

3. autorização

4. busca e ranking

5. crons

6. Mercado Pago

7. webhook

8. fluxos críticos de interface
```

---

# 157. Testes Unitários

Boas candidatas:

```text
calcularDistancia()

normalização de texto

limpeza de critério

cálculo de relevância

validações puras
```

---

# 158. Testes de Integração

Boas candidatas:

```text
API + Supabase

RPC + ranking

cron + banco

pagamento + estado interno
```

---

# 159. Testes End-to-End

Fluxos prioritários futuros:

```text
CADASTRAR CONTA
      ↓
CADASTRAR LOJA
      ↓
APROVAR
      ↓
BUSCAR
      ↓
ABRIR LOJA
```

---

# 160. E2E Cliente

Exemplo futuro:

```text
LOGIN
  ↓
BUSCAR
  ↓
ABRIR LOJA
  ↓
FAVORITAR
  ↓
AVALIAR
```

---

# 161. E2E Lojista

Exemplo futuro:

```text
LOGIN
  ↓
CADASTRAR/EDITAR LOJA
  ↓
CADASTRAR PRODUTO
  ↓
SALVAR
  ↓
VISUALIZAR PUBLICAMENTE
```

---

# 162. E2E Pagamento

Quando seguro:

```text
LOJISTA
   ↓
ESCOLHER PLANO
   ↓
PAGAMENTO
   ↓
WEBHOOK
   ↓
ATIVAÇÃO
```

deverá possuir ambiente de teste adequado.

---

# 163. Testes e Dados

Testes automatizados não devem depender de dados aleatórios de produção.

---

# 164. Fixtures

No futuro poderão existir registros controlados para testes.

Exemplo:

```text
LOJA TESTE PREMIUM

LOJA TESTE GRATUITA

LOJA TESTE SEM COORDENADAS
```

---

# 165. Isolamento

Um teste não deve depender indevidamente do teste anterior.

---

# 166. Repetibilidade

Teste bom deve produzir o mesmo resultado quando o estado inicial é equivalente.

---

# 167. Limpeza

Testes que criam dados temporários devem removê-los quando apropriado.

---

# 168. Não Usar Produção como Banco de Teste Automatizado

Com o crescimento, automação deve utilizar ambiente adequado.

---

# 169. Staging

Um ambiente dedicado de staging poderá ser criado quando o volume e risco justificarem.

---

# 170. Teste de Regressão

Quando corrigirmos um bug:

> criar ou registrar um teste que impediria o mesmo problema de voltar.

---

# 171. Exemplo

Se descobrirmos:

```text
"acai não encontra Açaí"
```

o teste de regressão deverá continuar existindo depois da correção.

---

# 172. Outro Exemplo

Se:

```text
API aceitava body enorme
```

o teste de:

```text
413
```

deve permanecer.

---

# 173. Bugs de Segurança

Correções de segurança devem receber teste de regressão sempre que possível.

---

# 174. Resultado de Teste

Ao finalizar uma feature, registrar mentalmente ou no PR:

```text
O QUE FOI TESTADO?

ONDE?

QUAL RESULTADO?
```

---

# 175. Evitar "Funcionou Aqui"

Uma validação melhor é:

```text
npx tsc --noEmit
→ passou

npm run build
→ passou

POST /api/...
→ 200

body inválido
→ 400

produção
→ comportamento confirmado
```

---

# 176. Evidências

Quando útil, um PR pode registrar:

- comandos;
- respostas;
- screenshots;
- observações.

Nunca incluir secrets nas evidências.

---

# 177. Falha de Teste

Se um teste falhar:

```text
NÃO IGNORAR
```

Primeiro determinar:

- regressão nova?
- problema legado?
- ambiente?
- teste incorreto?
- dependência?

---

# 178. Problema Legado

Se o problema já existia:

> registrar como dívida técnica.

Não declarar que foi causado pela feature sem evidência.

---

# 179. Exemplo Atual

O lint global possui problemas legados.

Por isso uma feature pode possuir:

```text
TypeScript ✅
Build ✅
Teste funcional ✅
```

sem podermos declarar:

```text
Lint global ✅
```

---

# 180. Criticidade

Nem todas as mudanças precisam da mesma quantidade de testes.

---

# 181. Baixo Risco

Exemplo:

```text
correção de texto em documentação
```

pode precisar apenas de:

- revisão;
- `git diff --check`.

---

# 182. Médio Risco

Exemplo:

```text
ajuste de componente
```

pode precisar de:

- TypeScript;
- build;
- teste de interface;
- Preview.

---

# 183. Alto Risco

Exemplo:

```text
autorização

pagamento

migration

webhook

service role

score

cron
```

precisa de validação mais rigorosa.

---

# 184. Matriz de Risco

Conceitualmente:

```text
MENOR IMPACTO
→ MENOR BATERIA

MAIOR IMPACTO
→ MAIOR BATERIA
```

---

# 185. Teste antes do Refactor

Antes de refactor:

> compreender e testar o comportamento atual.

Isso permite confirmar que o refactor preservou o resultado.

---

# 186. Não Mudar Regra durante Refactor sem Declarar

Refactor deveria preservar comportamento.

Se a regra também mudou:

> documentar como mudança funcional.

---

# 187. Testes e Documentação

Quando um novo comportamento crítico for implementado, atualizar:

```text
TEST_PLAN.md
```

se novos cenários precisarem se tornar permanentes.

---

# 188. Relação com `CHECKLIST.md`

Este documento explica:

> o que e por que testar.

O arquivo:

```text
CHECKLIST.md
```

será utilizado como uma lista operacional resumida antes de concluir trabalhos.

---

# 189. Checklist Mínimo para Código

```text
[ ] git diff revisado

[ ] TypeScript quando aplicável

[ ] build quando aplicável

[ ] teste funcional

[ ] erro principal testado

[ ] documentação revisada
```

---

# 190. Checklist Mínimo para API

```text
[ ] sucesso

[ ] JSON inválido

[ ] tipos inválidos

[ ] limites

[ ] autenticação

[ ] autorização

[ ] erro seguro

[ ] serviço externo
```

---

# 191. Checklist Mínimo para Banco

```text
[ ] migration

[ ] projeto correto

[ ] dados existentes

[ ] permissões

[ ] função/query

[ ] aplicação

[ ] rollback considerado
```

---

# 192. Checklist Mínimo para Pagamento

```text
[ ] usuário autorizado

[ ] loja correta

[ ] plano correto

[ ] valor correto

[ ] provedor

[ ] webhook

[ ] duplicidade

[ ] estado interno

[ ] falha
```

---

# 193. Checklist Mínimo para Produção

```text
[ ] deployment Ready

[ ] domínio acessível

[ ] funcionalidade principal

[ ] API quando alterada

[ ] banco quando alterado

[ ] logs sem erro inesperado
```

---

# 194. Definition of Done

Uma feature não está concluída apenas quando:

```text
CÓDIGO ESCRITO
```

Ela precisa chegar, conforme o caso, a:

```text
IMPLEMENTADO
    ↓
VALIDADO
    ↓
TESTADO
    ↓
DOCUMENTADO
    ↓
DEPLOYADO
    ↓
CONFIRMADO
```

---

# 195. Fluxo Oficial

De acordo com a Constituição:

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

Testes fazem parte do processo oficial.

---

# 196. Testes em Uma Frase

> O VemVer deve testar não apenas se uma funcionalidade funciona, mas também se ela falha de maneira segura quando recebe dados, usuários ou condições inesperadas.

---

# 197. Relação com Outros Documentos

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

CODING_STANDARDS.md
CHECKLIST.md

../governance/DECISIONS.md
../governance/CHANGELOG.md
```

---

# 198. Regra Final

Antes de declarar uma feature pronta, precisamos responder:

```text
O cenário principal funciona?

Entradas inválidas foram testadas?

Usuário sem permissão foi testado?

Outro usuário consegue manipular IDs?

Limites foram testados?

Banco está correto?

Migration está correta?

Serviço externo pode falhar?

Erro é seguro?

TypeScript passou?

Build passou?

Preview foi validado?

Produção precisa ser validada?

Existe teste de regressão necessário?

A documentação está atualizada?
```

Se alguma resposta crítica estiver faltando:

> a feature ainda precisa de validação.

---

# 199. Conclusão

O VemVer já possui uma prática importante de validar mudanças em múltiplos níveis:

```text
CÓDIGO
   ↓
TYPESCRIPT
   ↓
BUILD
   ↓
TESTE LOCAL
   ↓
PREVIEW
   ↓
PRODUCTION
```

Também já foram realizados testes específicos de:

- busca inteligente;
- geolocalização;
- busca sem acentos;
- score;
- crons;
- moderação;
- limites das APIs;
- erros HTTP;
- Firewall;
- rate limit.

O próximo passo de maturidade será transformar progressivamente os cenários mais importantes em testes automatizados.

A prioridade deverá começar pelas áreas em que uma regressão teria maior impacto:

```text
SEGURANÇA

AUTORIZAÇÃO

BANCO

BUSCA

PAGAMENTOS

CRONS
```

O princípio permanece:

> quanto mais importante a funcionalidade, menos devemos depender apenas de clicar na tela e acreditar que está tudo certo.
