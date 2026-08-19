# VemVer — Checklist Oficial de Desenvolvimento

## Documento

**Projeto:** VemVer
**Documento:** Checklist Oficial de Desenvolvimento
**Versão:** 1.0.0
**Status:** Ativo
**Última atualização:** 17/08/2026

---

# 1. Objetivo

Este documento funciona como checklist operacional do VemVer.

Ele deve ser utilizado antes de considerar uma alteração concluída.

Enquanto:

```text
CODING_STANDARDS.md
```

define como devemos desenvolver, e:

```text
TEST_PLAN.md
```

define como devemos testar,

este arquivo responde:

> O que precisamos conferir antes de dizer que terminou?

---

# 2. Regra Principal

Nenhuma mudança deve ser considerada concluída apenas porque:

```text
"o código foi escrito"
```

O fluxo correto é:

```text
IMPLEMENTAR
    ↓
VALIDAR
    ↓
TESTAR
    ↓
REVISAR
    ↓
DOCUMENTAR
    ↓
PUBLICAR
    ↓
CONFIRMAR
```

---

# 3. Como Utilizar este Documento

Nem todos os itens se aplicam a todas as tarefas.

Exemplo:

Uma alteração apenas de documentação não precisa testar Mercado Pago.

Uma migration não precisa obrigatoriamente testar tema escuro.

A regra é:

> utilizar todos os checklists relacionados ao que foi alterado.

---

# 4. Checklist — Antes de Começar

```text
[ ] O problema está claramente entendido?

[ ] Sabemos qual resultado queremos?

[ ] Existe funcionalidade semelhante já implementada?

[ ] A mudança pertence ao frontend, backend, banco ou mais de uma camada?

[ ] Existe regra de negócio envolvida?

[ ] Existe risco de segurança?

[ ] Existe impacto financeiro?

[ ] Existe impacto em produção?

[ ] Precisamos atualizar documentação?

[ ] Estamos na branch correta?
```

---

# 5. Checklist — Branch

Antes de desenvolver:

```text
[ ] git status foi verificado?

[ ] A branch atual é a correta?

[ ] A main estava atualizada quando a branch foi criada?

[ ] A branch possui objetivo específico?

[ ] Não existem alterações antigas misturadas?
```

Padrões recomendados:

```text
feature/...

fix/...

docs/...

refactor/...
```

---

# 6. Checklist — Escopo

```text
[ ] Estou alterando somente o necessário?

[ ] Algum arquivo não relacionado foi modificado?

[ ] Estou tentando fazer refactor desnecessário junto com a feature?

[ ] A alteração pode ser dividida em partes menores?

[ ] Existe mudança de comportamento não documentada?
```

---

# 7. Checklist — Arquivos

```text
[ ] Os arquivos estão nos diretórios corretos?

[ ] Os nomes são claros?

[ ] O casing dos arquivos está correto?

[ ] Não existem arquivos temporários?

[ ] Não existem arquivos duplicados acidentalmente?

[ ] Não existem arquivos de teste esquecidos?

[ ] Não existem arquivos pessoais?
```

---

# 8. Checklist — TypeScript

Quando houver código TypeScript:

```text
[ ] Tipos estão claros?

[ ] Evitamos any sem necessidade?

[ ] Dados externos são validados em runtime?

[ ] Tipos opcionais realmente podem ser ausentes?

[ ] Null está sendo tratado corretamente?

[ ] Não existem casts apenas para esconder erro?

[ ] Imports estão corretos?
```

Comando:

```powershell
npx tsc --noEmit
```

Resultado esperado:

```text
sem erros
```

---

# 9. Checklist — React

```text
[ ] O componente possui responsabilidade clara?

[ ] Precisa realmente ser Client Component?

[ ] "use client" está sendo utilizado apenas quando necessário?

[ ] Props estão tipadas?

[ ] Estados são realmente necessários?

[ ] Valores derivados poderiam não ser estado?

[ ] useEffect é realmente necessário?

[ ] Dependências do efeito estão corretas?

[ ] Loading foi tratado?

[ ] Erro foi tratado?

[ ] Empty state foi tratado?
```

---

# 10. Checklist — Interface

```text
[ ] Funciona no desktop?

[ ] Funciona no celular?

[ ] Funciona em largura intermediária?

[ ] Textos são legíveis?

[ ] Botões possuem feedback?

[ ] Links funcionam?

[ ] Não existem elementos sobrepostos?

[ ] Não existe scroll horizontal inesperado?

[ ] Estados vazios são compreensíveis?

[ ] Mensagens de erro são amigáveis?
```

---

# 11. Checklist — Tema Claro e Escuro

Quando o sistema de temas estiver implementado:

```text
[ ] Tema Automático funciona?

[ ] Tema Claro funciona?

[ ] Tema Escuro funciona?

[ ] A identidade laranja do VemVer foi preservada?

[ ] Textos possuem contraste suficiente?

[ ] Cards possuem contraste suficiente?

[ ] Ícones permanecem visíveis?

[ ] Inputs permanecem legíveis?

[ ] Modais permanecem legíveis?

[ ] Trocar tema não altera funcionalidade?

[ ] A preferência persiste conforme a regra definida?
```

---

# 12. Checklist — Acessibilidade

```text
[ ] Botões utilizam elemento adequado?

[ ] Links utilizam elemento adequado?

[ ] Campos possuem label?

[ ] Imagens relevantes possuem texto alternativo?

[ ] Existe foco visível?

[ ] É possível navegar por teclado quando aplicável?

[ ] O contraste é adequado?

[ ] A informação não depende somente de cor?
```

---

# 13. Checklist — Formulários

```text
[ ] Campos obrigatórios estão identificados?

[ ] Tipos de dados são validados?

[ ] Tamanhos máximos foram definidos?

[ ] Erros são exibidos perto do problema?

[ ] O botão de envio possui estado de loading?

[ ] Cliques repetidos podem duplicar a operação?

[ ] O backend também valida?

[ ] Campos não permitidos são ignorados ou rejeitados?
```

---

# 14. Checklist — API Nova

Antes de considerar um endpoint pronto:

```text
[ ] Método HTTP está correto?

[ ] Content-Type é validado?

[ ] Existe limite de body?

[ ] JSON malformado é tratado?

[ ] Campos possuem validação?

[ ] Strings possuem tamanho máximo?

[ ] IDs são validados?

[ ] Autenticação é necessária?

[ ] Autorização é necessária?

[ ] Propriedade do recurso é verificada?

[ ] Existe serviço externo?

[ ] Existe custo por chamada?

[ ] Rate limit foi avaliado?

[ ] Erros internos são protegidos?

[ ] Status HTTP são coerentes?
```

---

# 15. Checklist — API com OpenAI

```text
[ ] Input é validado antes da OpenAI?

[ ] Existe limite de body?

[ ] Existe limite de texto?

[ ] OPENAI_API_KEY permanece server-side?

[ ] Nenhum secret é enviado ao modelo?

[ ] Dados pessoais enviados são realmente necessários?

[ ] Structured Output é utilizado quando adequado?

[ ] Falha da OpenAI é tratada?

[ ] Resposta do modelo não controla regra crítica?

[ ] Rate limit foi revisado?
```

---

# 16. Checklist — `/api/entender-intencao`

Quando essa rota for modificada:

```text
[ ] application/json continua obrigatório?

[ ] Body continua limitado?

[ ] Mensagem continua validada?

[ ] Cidade continua validada?

[ ] UF continua validada?

[ ] Latitude continua validada?

[ ] Longitude continua validada?

[ ] Latitude e longitude precisam chegar juntas?

[ ] OpenAI somente é chamada após validação?

[ ] Busca continua usando dados reais?

[ ] Ranking continua preservando relevância?

[ ] Distância desconhecida continua null?

[ ] Não inventamos delivery?

[ ] Não inventamos horário?

[ ] Não inventamos preço?
```

---

# 17. Checklist — `/api/moderar-texto`

Quando essa rota for modificada:

```text
[ ] application/json continua obrigatório?

[ ] Body continua limitado?

[ ] texto precisa ser string?

[ ] texto vazio é rejeitado?

[ ] limite de texto permanece aplicado?

[ ] Array é rejeitado?

[ ] null é rejeitado?

[ ] OpenAI somente é chamada depois da validação?

[ ] Erros internos permanecem protegidos?

[ ] Rate limit continua funcionando?
```

---

# 18. Checklist — Segurança

```text
[ ] Existe algum secret no frontend?

[ ] Existe secret em NEXT_PUBLIC_?

[ ] Existe service_role no cliente?

[ ] Existe token nos logs?

[ ] Existe autorização apenas visual?

[ ] O backend valida o usuário?

[ ] IDs podem ser manipulados?

[ ] Um usuário consegue acessar dados de outro?

[ ] Existem campos administrativos modificáveis pelo usuário?

[ ] Inputs possuem limites?

[ ] Erros vazam detalhes internos?
```

---

# 19. Checklist — `service_role`

Quando utilizada:

```text
[ ] A operação realmente precisa dela?

[ ] Está em código server-side?

[ ] O usuário foi autenticado quando necessário?

[ ] A autorização foi validada?

[ ] A propriedade do registro foi validada?

[ ] Campos permitidos estão explicitamente definidos?

[ ] Nenhuma informação privilegiada é devolvida ao frontend?
```

---

# 20. Checklist — Mass Assignment

Antes de atualizar registros:

Evitar:

```ts
.update(body)
```

sem controle.

Verificar:

```text
[ ] Apenas campos permitidos são enviados ao banco?

[ ] premium está protegido?

[ ] patrocinado está protegido?

[ ] score está protegido?

[ ] status está protegido?

[ ] user_id está protegido?

[ ] plano está protegido?
```

---

# 21. Checklist — Supabase

```text
[ ] Estamos utilizando o projeto correto?

[ ] A query busca apenas os campos necessários?

[ ] RLS foi considerada?

[ ] A operação precisa de service_role?

[ ] Erros são tratados?

[ ] O usuário possui autorização?

[ ] Dados ausentes são tratados corretamente?
```

---

# 22. Checklist — Banco

Antes de modificar schema:

```text
[ ] O problema exige alteração de banco?

[ ] A tabela correta foi identificada?

[ ] Os dados atuais foram analisados?

[ ] Existe risco de perda de dados?

[ ] Constraints atuais foram consideradas?

[ ] Foreign keys foram consideradas?

[ ] RLS foi considerada?

[ ] Índices foram considerados?

[ ] APIs afetadas foram identificadas?

[ ] Frontend afetado foi identificado?
```

---

# 23. Checklist — Migration

```text
[ ] Nova migration foi criada?

[ ] Não alteramos migration antiga aplicada?

[ ] Nome do arquivo está correto?

[ ] SQL está legível?

[ ] Banco conectado é o correto?

[ ] Dados atuais são compatíveis?

[ ] Permissões foram consideradas?

[ ] RPCs foram consideradas?

[ ] Rollback foi considerado?

[ ] Migration foi aplicada?

[ ] Histórico local/remoto foi conferido?

[ ] Aplicação foi testada depois?
```

---

# 24. Checklist — Migration Destrutiva

Para operações como:

```text
DROP COLUMN

DROP TABLE

ALTER TYPE
```

verificar:

```text
[ ] Existe backup adequado?

[ ] Código ainda utiliza esse objeto?

[ ] RPC utiliza?

[ ] View utiliza?

[ ] Trigger utiliza?

[ ] Dados precisam ser preservados?

[ ] Podemos fazer transição em duas etapas?

[ ] Existe estratégia de reversão?
```

---

# 25. Checklist — RPC

```text
[ ] A função precisa realmente ser RPC?

[ ] Parâmetros estão claros?

[ ] search_path está seguro quando necessário?

[ ] security invoker/definer foi escolhido conscientemente?

[ ] Papéis públicos precisam executar?

[ ] anon possui somente o necessário?

[ ] authenticated possui somente o necessário?

[ ] service_role possui o necessário?

[ ] Resultado expõe somente dados apropriados?
```

---

# 26. Checklist — Busca

Quando alterar busca:

```text
[ ] Nome continua sendo pesquisado?

[ ] Categoria continua sendo pesquisada?

[ ] Descrição continua sendo pesquisada?

[ ] Busca sem acentos continua funcionando?

[ ] Termos genéricos continuam tratados?

[ ] Cidade continua funcionando?

[ ] UF continua funcionando?

[ ] Lojas inativas continuam fora?

[ ] Lojas não aprovadas continuam fora?

[ ] Relevância permanece primeiro?

[ ] Score não substitui relevância?

[ ] Patrocinado irrelevante não domina resultado?

[ ] Limite final continua controlado?
```

---

# 27. Checklist — Geolocalização

```text
[ ] Latitude é válida?

[ ] Longitude é válida?

[ ] As duas são necessárias juntas?

[ ] Loja sem coordenadas continua funcionando?

[ ] Distância desconhecida permanece null?

[ ] Distância não está sendo assumida como zero?

[ ] "perto de mim" altera ranking somente quando adequado?
```

---

# 28. Checklist — Score

Quando alterar a fórmula:

```text
[ ] Fórmula anterior foi registrada?

[ ] Fórmula nova está documentada?

[ ] Premium está correto?

[ ] Patrocinado está correto?

[ ] Eles não foram somados indevidamente?

[ ] Visualizações possuem limite?

[ ] Produtos possuem limite?

[ ] Favoritos possuem limite?

[ ] Avaliações possuem limite?

[ ] RPC continua protegida?

[ ] Cron continua funcionando?

[ ] DATABASE.md foi atualizado?

[ ] BUSINESS_RULES.md foi atualizado?

[ ] DECISIONS.md precisa ser atualizado?
```

---

# 29. Checklist — Cron

```text
[ ] A rota está protegida?

[ ] CRON_SECRET está sendo verificado?

[ ] Sem autorização retorna erro?

[ ] Execução autorizada funciona?

[ ] A operação é idempotente?

[ ] Repetir pode criar duplicidade?

[ ] Horário está correto?

[ ] vercel.json está atualizado?

[ ] Logs ajudam em caso de falha?

[ ] O efeito real no banco foi confirmado?
```

---

# 30. Checklist — Planos

```text
[ ] Plano do usuário é válido?

[ ] Limites estão corretos?

[ ] Upgrade respeita regra?

[ ] Downgrade respeita regra?

[ ] Vencimento está correto?

[ ] Cortesia está correta?

[ ] Retorno ao gratuito está correto?

[ ] Histórico foi registrado?

[ ] Usuário não pode mudar plano manualmente?
```

---

# 31. Checklist — Mercado Pago

Antes de alterar qualquer fluxo financeiro:

```text
[ ] Usuário está autenticado?

[ ] Usuário possui a loja?

[ ] Plano existe?

[ ] Valor vem de fonte confiável?

[ ] Valor enviado pelo frontend é validado?

[ ] Credencial permanece server-side?

[ ] Falha do provedor é tratada?

[ ] Duplicidade foi considerada?

[ ] Idempotência foi considerada?

[ ] Estado interno é atualizado com segurança?

[ ] Logs não expõem credenciais?
```

---

# 32. Checklist — Webhook Mercado Pago

```text
[ ] Origem/autenticidade é validada conforme integração?

[ ] Evento possui identificador?

[ ] Pagamento é consultado/validado quando necessário?

[ ] Mesmo evento pode chegar novamente?

[ ] Reenvio não duplica ativação?

[ ] Status pendente é tratado?

[ ] Status aprovado é tratado?

[ ] Status rejeitado é tratado?

[ ] Evento desconhecido é tratado?

[ ] Histórico é registrado quando necessário?

[ ] Erros são observáveis?
```

---

# 33. Checklist — Área Administrativa

```text
[ ] A rota exige autenticação?

[ ] O papel administrativo é validado?

[ ] Usuário comum é bloqueado?

[ ] IDs manipulados são bloqueados?

[ ] Operações são auditáveis?

[ ] Campos críticos são protegidos?

[ ] A resposta não expõe dados desnecessários?
```

---

# 34. Checklist — Lojista

```text
[ ] Lojista está autenticado?

[ ] Está acessando a própria loja?

[ ] Limite de lojas é respeitado?

[ ] Campos editáveis estão definidos?

[ ] Campos administrativos estão protegidos?

[ ] Uploads estão associados à loja correta?

[ ] Produtos pertencem à loja correta?

[ ] Erros possuem feedback adequado?
```

---

# 35. Checklist — Cliente

```text
[ ] Sessão está correta?

[ ] Favoritos pertencem ao usuário?

[ ] Histórico pertence ao usuário?

[ ] Avaliações pertencem ao usuário?

[ ] Um usuário não consegue editar dados de outro?

[ ] Estado vazio foi tratado?

[ ] Logout remove acesso protegido?
```

---

# 36. Checklist — Avaliações

```text
[ ] Nota está dentro da escala?

[ ] Loja existe?

[ ] Usuário está correto?

[ ] Comentário possui limite?

[ ] Moderação foi considerada?

[ ] Avaliação aprovada influencia score corretamente?

[ ] Duplicidade foi considerada?

[ ] Edição futura respeitará propriedade?

[ ] Exclusão futura respeitará propriedade?
```

---

# 37. Checklist — Modal de Avaliação

Quando a UX planejada for implementada:

```text
[ ] Botão "Avaliar" abre o modal/subaba?

[ ] A página da loja permanece ao fundo?

[ ] Modal fecha corretamente?

[ ] Cancelar não publica?

[ ] 1 estrela funciona?

[ ] 5 estrelas funciona?

[ ] Comentário funciona?

[ ] Loading funciona?

[ ] Erro funciona?

[ ] Publicação atualiza a interface?

[ ] Funciona no celular?

[ ] Funciona em tema claro?

[ ] Funciona em tema escuro?
```

---

# 38. Checklist — Favoritos

```text
[ ] Favoritar funciona?

[ ] Desfavoritar funciona?

[ ] Estado visual muda?

[ ] Persistência funciona?

[ ] Usuário correto é utilizado?

[ ] Loja correta é utilizada?

[ ] Duplicidade é impedida ou tratada?
```

---

# 39. Checklist — Produto

```text
[ ] Produto pertence à loja correta?

[ ] Produto ativo funciona?

[ ] Produto inativo não aparece onde não deveria?

[ ] Nome foi validado?

[ ] Preço foi validado quando aplicável?

[ ] Imagem foi tratada?

[ ] Página inexistente possui fallback?

[ ] Campos internos não são expostos?
```

---

# 40. Checklist — Upload

Quando houver upload:

```text
[ ] Tipo permitido?

[ ] MIME validado?

[ ] Tamanho máximo?

[ ] Quantidade máxima?

[ ] Nome de arquivo seguro?

[ ] Usuário autorizado?

[ ] Recurso correto?

[ ] Erro de upload tratado?

[ ] Arquivo órfão pode existir?

[ ] Exclusão foi considerada?
```

---

# 41. Checklist — Performance

```text
[ ] Existe consulta repetida em loop?

[ ] Existe N+1 evidente?

[ ] Estamos retornando dados demais?

[ ] Existe SELECT * desnecessário?

[ ] Imagens estão grandes demais?

[ ] Existe chamada externa repetida?

[ ] Existe recalculo desnecessário?

[ ] Paginação é necessária?
```

---

# 42. Checklist — Dependência Nova

```text
[ ] É realmente necessária?

[ ] O problema poderia ser resolvido sem pacote?

[ ] Está mantida?

[ ] Possui versão compatível?

[ ] Aumenta muito o bundle?

[ ] Introduz risco de segurança?

[ ] Licença é adequada?

[ ] package-lock foi atualizado corretamente?
```

---

# 43. Checklist — Atualização de Dependência

```text
[ ] Release notes foram verificadas?

[ ] Existe breaking change?

[ ] Build passou?

[ ] TypeScript passou?

[ ] Funcionalidade relacionada foi testada?

[ ] Não utilizamos --force sem análise?
```

---

# 44. Checklist — Antes de Excluir Arquivo

```text
[ ] Procuramos referências?

[ ] Procuramos imports?

[ ] Procuramos uso indireto?

[ ] A rota depende dele?

[ ] Outro componente possui mesmo nome?

[ ] Build foi testado após exclusão?
```

---

# 45. Checklist — Refactor

```text
[ ] Existe problema real?

[ ] O comportamento atual foi entendido?

[ ] O comportamento deve permanecer igual?

[ ] Existem testes antes?

[ ] O refactor foi separado de mudança funcional?

[ ] O diff continua compreensível?

[ ] O build passou depois?
```

---

# 46. Checklist — Logs

```text
[ ] Logs temporários foram removidos?

[ ] Logs úteis possuem contexto?

[ ] Nenhum secret é registrado?

[ ] Nenhuma senha é registrada?

[ ] Nenhum token completo é registrado?

[ ] Dados pessoais desnecessários não são registrados?
```

---

# 47. Checklist — Erros

```text
[ ] Erro esperado retorna status adequado?

[ ] Entrada inválida não retorna 500?

[ ] Erro interno não retorna stack trace?

[ ] Usuário recebe mensagem compreensível?

[ ] Logs possuem informação suficiente para diagnóstico?
```

---

# 48. Checklist — Build

Quando aplicável:

```powershell
npm run build
```

Conferir:

```text
[ ] Build concluiu?

[ ] Rotas esperadas aparecem?

[ ] Não surgiu rota temporária?

[ ] Não houve erro de import?

[ ] Não houve erro de TypeScript?
```

---

# 49. Checklist — Lint

Situação atual:

```text
LINT GLOBAL POSSUI DÉBITO LEGADO
```

Portanto:

```text
[ ] Não declarar lint global aprovado falsamente?

[ ] Código novo evita adicionar novos problemas evidentes?

[ ] Correções de lint não relacionadas ficaram fora do escopo?
```

---

# 50. Checklist — Teste Local

```text
[ ] Servidor inicia?

[ ] Página abre?

[ ] Fluxo principal funciona?

[ ] Cenário de erro funciona?

[ ] Console não mostra erro inesperado?

[ ] API responde como esperado?
```

---

# 51. Checklist — Preview

```text
[ ] Push foi realizado?

[ ] Preview foi criado?

[ ] Build remoto passou?

[ ] Variáveis necessárias existem?

[ ] Preview protegido foi acessado corretamente?

[ ] Fluxo principal funciona?

[ ] Diferenças do ambiente local foram verificadas?
```

---

# 52. Checklist — Antes do Merge

```text
[ ] Diff revisado?

[ ] PR possui escopo claro?

[ ] TypeScript passou quando aplicável?

[ ] Build passou quando aplicável?

[ ] Preview foi testado?

[ ] Migration foi aplicada quando necessária?

[ ] Banco continua compatível?

[ ] Secrets estão configurados?

[ ] Documentação foi atualizada?

[ ] Existe plano de rollback?
```

---

# 53. Checklist — Produção

Depois do merge:

```text
[ ] Deployment ficou Ready?

[ ] Domínio principal abre?

[ ] Página alterada funciona?

[ ] API alterada funciona?

[ ] Banco alterado funciona?

[ ] Integração externa funciona?

[ ] Não existem erros inesperados?

[ ] Logs principais foram verificados quando necessário?
```

---

# 54. Checklist — Pós-Deploy de API

```text
[ ] Request válido funciona?

[ ] Request inválido é rejeitado?

[ ] Autorização continua funcionando?

[ ] Erros permanecem seguros?

[ ] Rate limit continua funcionando quando alterado?

[ ] Serviço externo está acessível?
```

---

# 55. Checklist — Pós-Deploy de Banco

```text
[ ] Migration está registrada?

[ ] Função existe?

[ ] Permissões estão corretas?

[ ] Aplicação utiliza a nova estrutura?

[ ] Dados antigos continuam corretos?

[ ] Não houve perda inesperada?
```

---

# 56. Checklist — Firewall

Quando modificar proteção da Vercel:

```text
[ ] Caminho correto?

[ ] Método correto?

[ ] Janela correta?

[ ] Quantidade correta?

[ ] Chave de limitação correta?

[ ] Rotas certas estão incluídas?

[ ] Rotas erradas não foram afetadas?

[ ] 429 foi testado?
```

---

# 57. Configuração Atual do Firewall de IA

Estado documentado:

```text
Rotas:
POST /api/entender-intencao
POST /api/moderar-texto

Janela:
60 segundos

Limite:
10 requisições

Chave:
IP

Limite:
compartilhado entre as duas rotas
```

Se qualquer valor mudar:

> atualizar a documentação.

---

# 58. Checklist — Cron em Produção

```text
[ ] vercel.json possui agendamento?

[ ] Endpoint está publicado?

[ ] CRON_SECRET existe?

[ ] Request não autorizado falha?

[ ] Execução autorizada funciona?

[ ] Banco foi atualizado?

[ ] Logs mostram execução?

[ ] Repetição não corrompe estado?
```

---

# 59. Checklist — Documentação

Antes de terminar:

```text
[ ] README precisa mudar?

[ ] MASTER_DOCUMENT precisa mudar?

[ ] PRODUCT_VISION precisa mudar?

[ ] ROADMAP precisa mudar?

[ ] BUSINESS_RULES precisa mudar?

[ ] ARCHITECTURE precisa mudar?

[ ] DATABASE precisa mudar?

[ ] API precisa mudar?

[ ] SECURITY precisa mudar?

[ ] DEPLOY precisa mudar?

[ ] CODING_STANDARDS precisa mudar?

[ ] TEST_PLAN precisa mudar?

[ ] DECISIONS precisa mudar?

[ ] CHANGELOG precisa mudar?
```

Nem todos precisam ser modificados a cada feature.

---

# 60. Checklist — Feature Futura

Uma feature planejada não deve ser documentada como concluída.

Verificar terminologia:

```text
[ ] concluído

[ ] em evolução

[ ] em desenvolvimento

[ ] planejado

[ ] futuro

[ ] em estudo
```

---

# 61. Checklist — Git Antes do Commit

Executar:

```powershell
git diff --check
git status --short --untracked-files=all
```

Verificar:

```text
[ ] git diff --check sem saída?

[ ] Apenas arquivos esperados aparecem?

[ ] Nenhum secret?

[ ] Nenhum arquivo temporário?

[ ] Nenhum arquivo pessoal?
```

---

# 62. Checklist — Commit

```text
[ ] Mensagem clara?

[ ] Commit representa mudança compreensível?

[ ] Arquivos relacionados estão juntos?

[ ] Mudanças não relacionadas ficaram de fora?
```

---

# 63. Checklist — Pull Request

```text
[ ] Título explica a mudança?

[ ] Descrição explica o problema?

[ ] Descrição explica a solução?

[ ] Testes estão registrados?

[ ] Migration foi mencionada?

[ ] Riscos foram mencionados?

[ ] Screenshots são necessários?

[ ] Nenhum screenshot possui secret?
```

---

# 64. Checklist — Rollback

Para mudança de risco médio ou alto:

```text
[ ] Sabemos como desfazer o código?

[ ] Existe migration reversa se necessária?

[ ] Dados podem ser recuperados?

[ ] Feature pode ser desativada?

[ ] Integração externa pode ser revertida?

[ ] Configuração anterior está conhecida?
```

---

# 65. Checklist — Incidente

Se algo quebrar em produção:

```text
[ ] Identificar impacto

[ ] Evitar novas alterações aleatórias

[ ] Conter problema

[ ] Revisar logs

[ ] Reproduzir quando possível

[ ] Corrigir ou reverter

[ ] Testar

[ ] Publicar

[ ] Confirmar

[ ] Registrar causa

[ ] Criar teste de regressão quando possível
```

---

# 66. Checklist — Segurança de Credencial Exposta

Se um secret for exposto:

```text
[ ] Revogar secret antigo

[ ] Gerar novo

[ ] Atualizar Vercel

[ ] Atualizar local quando necessário

[ ] Verificar Preview

[ ] Verificar Production

[ ] Confirmar funcionamento

[ ] Verificar Git

[ ] Verificar logs

[ ] Registrar incidente quando necessário
```

Apagar a mensagem ou arquivo não é suficiente.

---

# 67. Checklist — App Cliente Futuro

Quando o aplicativo Cliente começar a ser desenvolvido:

```text
[ ] Busca inteligente

[ ] Geolocalização

[ ] Página da loja

[ ] Produtos

[ ] Favoritos

[ ] Histórico

[ ] Avaliações

[ ] Perfil

[ ] Tema Automático

[ ] Tema Claro

[ ] Tema Escuro

[ ] Segurança das APIs

[ ] Nenhum secret embutido no app
```

---

# 68. Checklist — App Lojista Futuro

Quando o aplicativo Lojista começar:

```text
[ ] Login

[ ] Dashboard

[ ] Minha loja

[ ] Produtos

[ ] Promoções

[ ] Avaliações

[ ] Métricas

[ ] Plano

[ ] Insights

[ ] Tema Automático

[ ] Tema Claro

[ ] Tema Escuro

[ ] Autorização

[ ] Nenhum service_role no aplicativo
```

---

# 69. Checklist — Nova Cidade

Quando o VemVer iniciar operação em nova cidade:

```text
[ ] Cidade cadastrada corretamente?

[ ] UF correta?

[ ] Lojas suficientes?

[ ] Categorias relevantes?

[ ] Coordenadas disponíveis?

[ ] Busca testada?

[ ] Busca sem acentos testada?

[ ] Distâncias testadas?

[ ] Dados possuem qualidade?

[ ] Operação comercial está preparada?
```

---

# 70. Checklist — Expansão de Busca

Antes de adicionar tecnologia nova:

```text
[ ] Existe problema de performance real?

[ ] Foi medido?

[ ] Índices atuais foram avaliados?

[ ] pg_trgm resolveria?

[ ] Full-text resolveria?

[ ] Vector search é realmente necessário?

[ ] Serviço externo de busca é realmente necessário?

[ ] Complexidade adicional se justifica?
```

---

# 71. Checklist — IA Nova

Antes de adicionar nova função de IA:

```text
[ ] Qual problema resolve?

[ ] IA é realmente necessária?

[ ] Pode ser regra determinística?

[ ] Qual modelo será utilizado?

[ ] Qual custo?

[ ] Quais dados serão enviados?

[ ] Existem dados pessoais?

[ ] Existe validação antes da chamada?

[ ] Existe rate limit?

[ ] Existe fallback?

[ ] IA pode produzir efeito crítico?

[ ] Backend mantém autoridade?
```

---

# 72. Checklist — Regra de Negócio Nova

```text
[ ] Regra está definida?

[ ] Exceções estão definidas?

[ ] Quem pode executar?

[ ] Onde a regra deve morar?

[ ] Banco precisa mudar?

[ ] API precisa mudar?

[ ] Interface precisa mudar?

[ ] Testes foram definidos?

[ ] BUSINESS_RULES foi atualizado?
```

---

# 73. Checklist — Mudança de Arquitetura

```text
[ ] Problema arquitetural real identificado?

[ ] Solução atual foi analisada?

[ ] Alternativas foram consideradas?

[ ] Impacto foi medido?

[ ] Migração é gradual?

[ ] Rollback existe?

[ ] ARCHITECTURE.md foi atualizado?

[ ] DECISIONS.md foi atualizado?
```

---

# 74. Checklist — Mudança de Produto

Para mudanças relevantes de visão:

```text
[ ] Resolve necessidade do consumidor?

[ ] Resolve necessidade do lojista?

[ ] Preserva relevância?

[ ] Preserva confiança?

[ ] Impacta monetização?

[ ] Impacta ranking?

[ ] Impacta segurança?

[ ] PRODUCT_VISION foi revisado?

[ ] ROADMAP foi revisado?

[ ] MASTER_DOCUMENT foi revisado?
```

---

# 75. Checklist — Antes de Dizer "Concluído"

Perguntas finais:

```text
O problema foi realmente resolvido?

Funciona no cenário normal?

Falha corretamente no cenário inválido?

Outro usuário está protegido?

O banco continua consistente?

Secrets continuam protegidos?

Build continua funcionando?

A interface continua funcionando?

Preview foi verificado quando necessário?

Produção foi verificada quando necessário?

A documentação representa a realidade?

O Git está limpo?

Existe alguma etapa que estamos ignorando?
```

---

# 76. Definition of Done

Uma tarefa relevante pode ser considerada concluída quando, conforme aplicável:

```text
[ ] requisito compreendido

[ ] arquitetura definida

[ ] banco atualizado

[ ] migration registrada

[ ] API implementada

[ ] interface implementada

[ ] segurança revisada

[ ] TypeScript aprovado

[ ] build aprovado

[ ] testes executados

[ ] erros testados

[ ] Preview validado

[ ] produção validada

[ ] documentação atualizada

[ ] Git revisado
```

---

# 77. Fluxo Oficial

A Constituição do VemVer estabelece:

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

Este checklist serve para garantir que não pulemos etapas importantes desse fluxo.

---

# 78. Regra sobre Pressa

Quando houver pressão para terminar rápido:

> reduzir o escopo é melhor do que remover segurança e validação.

Exemplo:

```text
FEATURE MENOR
+
SEGURA
+
TESTADA
```

é melhor que:

```text
FEATURE COMPLETA
+
FRÁGIL
+
SEM TESTES
```

---

# 79. Regra sobre Complexidade

Se o checklist de uma feature revelar dezenas de dependências:

> talvez a feature precise ser dividida.

Complexidade percebida durante planejamento é um sinal útil.

---

# 80. Regra sobre Dívida Técnica

Quando algo precisar ficar incompleto:

```text
[ ] O débito foi identificado?

[ ] O risco é aceitável?

[ ] Foi documentado?

[ ] Existe caminho para correção?
```

---

# 81. Regra sobre Problema Legado

Se um teste encontrar problema antigo:

```text
NÃO ESCONDER
```

mas também:

```text
NÃO MISTURAR AUTOMATICAMENTE
```

com a feature atual.

Registrar e tratar no escopo adequado.

---

# 82. Relação com Outros Documentos

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
TEST_PLAN.md

../governance/DECISIONS.md
../governance/CHANGELOG.md
```

---

# 83. Checklist em Uma Frase

> Antes de considerar algo pronto no VemVer, devemos confirmar que funciona, está seguro, não quebrou o restante, pode ser mantido e está corretamente documentado.

---

# 84. Regra Final

Quando houver dúvida se podemos encerrar uma tarefa, usar esta pergunta:

> Se essa mudança entrar em produção agora e apresentar um problema amanhã, fizemos hoje tudo o que era razoável para detectar, prevenir, diagnosticar e reverter esse problema?

Se a resposta for:

```text
NÃO
```

a tarefa ainda precisa de trabalho.

---

# 85. Conclusão

O objetivo deste checklist não é transformar cada alteração em um processo burocrático.

Ele existe para preservar a qualidade do VemVer à medida que a plataforma cresce.

Hoje uma mudança pode afetar poucas lojas.

No futuro poderá afetar:

```text
MILHARES DE LOJAS

MILHARES DE CONSUMIDORES

PAGAMENTOS

AVALIAÇÕES

DADOS

BUSCAS

APLICATIVOS

DIVERSAS CIDADES
```

Por isso, precisamos desenvolver desde agora uma cultura em que:

```text
PRONTO
```

signifique mais do que:

```text
"funcionou uma vez no meu computador"
```

O padrão deve ser:

> implementado, testado, seguro, rastreável e documentado.
