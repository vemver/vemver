# VemVer — Roadmap Oficial

## Documento

**Projeto:** VemVer
**Documento:** Roadmap Oficial do Produto
**Versão:** 1.0.0
**Status:** Ativo
**Última atualização:** 17/08/2026

---

# 1. Objetivo

Este documento organiza a evolução do VemVer em fases.

Ele existe para responder:

```text
O QUE JÁ EXISTE?

O QUE ESTÁ EM EVOLUÇÃO?

O QUE VEM DEPOIS?

O QUE AINDA É FUTURO?
```

O Roadmap não deve transformar intenção em fato.

Funcionalidades planejadas precisam permanecer claramente identificadas como:

```text
PLANEJADO

FUTURO

EM EVOLUÇÃO
```

até que estejam realmente implementadas e validadas.

---

# 2. Princípio do Roadmap

O desenvolvimento deverá seguir a lógica:

```text
FUNDAÇÃO
   ↓
PRODUTO FUNCIONAL
   ↓
QUALIDADE
   ↓
VALIDAÇÃO LOCAL
   ↓
MONETIZAÇÃO
   ↓
APLICATIVOS
   ↓
EXPANSÃO
   ↓
ESCALA
```

---

# 3. Estados Utilizados

## CONCLUÍDO

Funcionalidade implementada e consolidada para o escopo definido.

## CONCLUÍDO NA FUNDAÇÃO ATUAL

A base necessária está implementada, mas o recurso poderá evoluir.

## EM EVOLUÇÃO

Existe implementação funcional, porém ainda há melhorias relevantes planejadas.

## EM DESENVOLVIMENTO

Está sendo implementado no momento.

## PRÓXIMA PRIORIDADE

Deve entrar entre os próximos trabalhos importantes.

## PLANEJADO

Foi aprovado como direção, mas ainda não está implementado integralmente.

## FUTURO

Faz parte da visão de longo prazo.

## EM AUDITORIA

Existe implementação, porém o comportamento precisa ser revisado antes de ser considerado consolidado.

---

# 4. Regra de Prioridade

Prioridade deve considerar principalmente:

```text
IMPACTO NO CONSUMIDOR

IMPACTO NO LOJISTA

SEGURANÇA

RISCO FINANCEIRO

QUALIDADE DOS DADOS

DEPENDÊNCIAS

ESFORÇO

VALOR PARA O MVP
```

---

# 5. Ordem Atual de Prioridades

Após a consolidação da documentação mestra, a direção imediata é:

```text
1. CONCLUIR DOCUMENTAÇÃO MESTRA

2. REVISAR EXPERIÊNCIA DA PÁGINA DA LOJA

3. EVOLUIR EXPERIÊNCIA DE AVALIAÇÕES

4. MELHORAR DADOS DE LOCALIZAÇÃO DAS LOJAS

5. EVOLUIR DESCOBERTA INTELIGENTE

6. REVISAR PRODUTOS

7. REVISAR PLANOS E MONETIZAÇÃO

8. REDUZIR DÍVIDA TÉCNICA CRÍTICA
```

---

# 6. Fase 0 — Constituição e Fundação do Projeto

## Status

**CONCLUÍDO NA FUNDAÇÃO ATUAL**

### Objetivo

Criar uma base técnica e organizacional capaz de sustentar a evolução do VemVer.

### Entregas

- Constituição do Projeto;
- estrutura Next.js;
- React;
- TypeScript;
- Tailwind;
- Supabase;
- PostgreSQL;
- Vercel;
- Git;
- GitHub;
- estrutura inicial de autenticação;
- áreas principais da aplicação;
- primeiros fluxos de loja e produto.

### Resultado

O VemVer possui uma base web funcional sobre a qual o produto continuará evoluindo.

---

# 7. Fase 1 — Autenticação e Contas

## Status

**CONCLUÍDO NA FUNDAÇÃO ATUAL / EM EVOLUÇÃO**

### Implementado

- login;
- conta de cliente;
- conta de lojista;
- recuperação de senha;
- redefinição de senha;
- rotas protegidas;
- fluxo relacionado a termos;
- privacidade.

### Próximas evoluções

- revisar autorização em todas as áreas protegidas;
- revisar propriedade de recursos;
- revisar experiência de perfil;
- consolidar regras de conta;
- avaliar CPF/CNPJ para lojistas;
- avaliar versões futuras dos termos;
- revisar eventual recuperação por outros canais.

### Futuro

Possíveis canais adicionais:

- WhatsApp;
- SMS;
- autenticação complementar.

Nenhum desses itens deve ser tratado como implementado antes da construção real.

---

# 8. Fase 2 — Área do Lojista

## Status

**EM EVOLUÇÃO**

### Implementado

Existe área de lojista com recursos relacionados a:

- conta;
- lojas cadastradas;
- plano atual;
- limite de lojas;
- visualizações;
- cadastro de nova loja;
- exclusão;
- solicitações relacionadas a planos.

### Próximas prioridades

- revisar UX do dashboard;
- revisar segurança das operações;
- revisar propriedade das lojas;
- melhorar feedback de limites;
- consolidar produtos;
- melhorar métricas;
- revisar plano atual e upgrade.

### Futuro

- insights comerciais;
- tendências locais;
- desempenho de produtos;
- comparação entre períodos;
- gerenciamento multiunidade;
- franquias.

---

# 9. Fase 3 — Cadastro e Gestão de Lojas

## Status

**EM EVOLUÇÃO**

### Implementado

O cadastro possui campos relacionados a:

- nome;
- categoria;
- WhatsApp;
- cidade;
- descrição;
- imagem;
- informações administrativas associadas ao fluxo.

### Também existente

- moderação de texto;
- associação ao usuário;
- status;
- atividade;
- planos;
- localização em registros quando disponível.

### Próximas prioridades

- melhorar edição da loja;
- padronizar categorias;
- revisar uploads;
- revisar autorização;
- melhorar validações;
- ampliar qualidade dos dados;
- incluir/validar localização com maior consistência.

### Futuro

- horário de funcionamento;
- delivery estruturado;
- formas de atendimento;
- faixa de preço;
- geocodificação;
- informações complementares.

---

# 10. Fase 4 — Página Pública da Loja

## Status

**EM EVOLUÇÃO**

### Implementado

Existe rota pública:

```text
/loja/[slug]
```

capaz de apresentar informações do estabelecimento.

### Próxima prioridade

A página da loja deverá receber uma revisão importante de experiência.

### Objetivos

A página precisa se tornar uma representação mais completa do estabelecimento.

Deve facilitar:

- compreensão da loja;
- visualização de produtos;
- contato;
- localização;
- favoritos;
- avaliações;
- compartilhamento.

### Próximas melhorias

- melhorar hierarquia visual;
- melhorar identidade da loja;
- melhorar área de produtos;
- melhorar CTA de contato;
- melhorar avaliações;
- melhorar responsividade;
- melhorar estados vazios;
- revisar informações de localização.

---

# 11. Fase 5 — Produtos

## Status

**EM EVOLUÇÃO**

### Implementado

O domínio de produtos já faz parte da plataforma.

Existe estrutura relacionada a:

- cadastro;
- associação à loja;
- atividade;
- página de produto.

### Próximas prioridades

- auditar fluxo completo de criação;
- auditar edição;
- revisar exclusão;
- revisar imagem;
- revisar limites por plano;
- melhorar página pública;
- revisar preço;
- preparar descoberta por produto.

### Direção estratégica

O produto deverá deixar de servir apenas para:

```text
"ver o que existe dentro da loja"
```

e passar progressivamente a ajudar:

```text
"encontrar a loja porque ela possui o que estou procurando"
```

---

# 12. Fase 6 — Busca Inicial

## Status

**CONCLUÍDO NA FUNDAÇÃO ATUAL**

### Implementado

A busca já considera informações como:

- nome;
- categoria;
- descrição.

### Evolução realizada

O sistema passou a possuir normalização de termos e tratamento de palavras genéricas.

### Direção

A busca tradicional é a base sobre a qual a descoberta inteligente continua evoluindo.

---

# 13. Fase 7 — Ranking

## Status

**CONCLUÍDO NA FUNDAÇÃO ATUAL / EM EVOLUÇÃO**

### Implementado

O ranking atual utiliza:

```text
1. relevância textual

2. distância quando proximidade é solicitada

3. score

4. nome
```

### Relevância textual

Pesos atuais incluem:

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

### Regra estratégica

```text
RELEVÂNCIA
ANTES DE
MONETIZAÇÃO
```

### Próximas melhorias

- medir qualidade real;
- revisar pesos;
- acompanhar comportamento real;
- evitar manipulação;
- documentar evolução dos pesos;
- considerar qualidade cadastral.

---

# 14. Fase 8 — Geolocalização

## Status

**EM EVOLUÇÃO**

### Implementado

- obtenção de latitude e longitude do consumidor;
- cálculo de distância;
- utilização de distância quando a intenção solicita proximidade;
- lojas sem coordenadas continuam podendo participar do resultado.

### Limitação atual

Nem todas as lojas possuem coordenadas cadastradas.

### Próximas prioridades

- cadastrar coordenadas de todas as lojas;
- automatizar geocodificação quando possível;
- validar endereço;
- exibir distância;
- permitir navegação;
- melhorar ordenação geográfica.

---

# 15. Fase 9 — Busca sem Acentos

## Status

**CONCLUÍDO NA FUNDAÇÃO ATUAL**

### Implementado

Busca compatível com diferenças de acentuação.

Exemplo:

```text
acai
```

pode localizar:

```text
Açaí
```

quando os demais critérios forem compatíveis.

### Banco

Foi habilitada a extensão:

```text
unaccent
```

### Migration

```text
20260815222432_habilitar_busca_sem_acentos.sql
```

### RPC

Foi criada:

```text
public.buscar_lojas_sem_acentos(...)
```

### Migration da RPC

```text
20260815233344_criar_busca_lojas_sem_acentos.sql
```

### Segurança

A RPC permanece protegida para o fluxo server-side atual.

### Próxima evolução

Melhorar tolerância a:

- erros de digitação;
- sinônimos;
- termos regionais;
- palavras semelhantes.

---

# 16. Fase 10 — Descoberta Inteligente com IA

## Status

**EM EVOLUÇÃO**

### Implementado

O usuário pode expressar intenção em linguagem natural.

Exemplos:

```text
Quero açaí perto de mim.
```

```text
Onde encontro roupa infantil?
```

```text
Quero uma loja de informática.
```

### Fluxo

```text
USUÁRIO
   ↓
API
   ↓
OPENAI
   ↓
INTENÇÃO ESTRUTURADA
   ↓
BACKEND
   ↓
BUSCA
   ↓
RANKING
```

### Estrutura interpretada

Conceitos atuais incluem:

- termo de busca;
- categoria;
- delivery;
- aberto agora;
- perto de mim;
- faixa de preço.

### Regra

> A IA interpreta. O backend decide.

---

# 17. Fase 11 — Segurança das APIs de IA

## Status

**CONCLUÍDO NA FUNDAÇÃO ATUAL**

### `/api/entender-intencao`

Possui proteção relacionada a:

- `application/json`;
- limite de body;
- parsing;
- tipo de mensagem;
- tamanho;
- cidade;
- UF;
- coordenadas;
- erros seguros.

### Limites atuais

```text
Body:
8.000 bytes

Mensagem:
300 caracteres

Cidade:
100 caracteres

UF:
2 letras
```

### Coordenadas

Latitude:

```text
-90 até 90
```

Longitude:

```text
-180 até 180
```

### Regra

Latitude e longitude devem chegar juntas.

---

# 18. Fase 12 — Segurança da Moderação

## Status

**CONCLUÍDO NA FUNDAÇÃO ATUAL**

### Endpoint

```text
POST /api/moderar-texto
```

### Proteções atuais

- JSON obrigatório;
- limite de body;
- JSON malformado rejeitado;
- objeto esperado;
- texto obrigatório;
- tipo correto;
- texto vazio rejeitado;
- limite de caracteres;
- erro interno protegido.

### Limites

```text
Body:
8.000 bytes

Texto:
2.000 caracteres
```

### Endpoint de teste

A antiga rota:

```text
/api/testar-moderacao
```

foi removida.

Resultado esperado:

```text
404
```

---

# 19. Fase 13 — Rate Limit de IA

## Status

**CONCLUÍDO NA FUNDAÇÃO ATUAL**

### Infraestrutura

Existe regra no Firewall da Vercel.

### Rotas

```text
POST /api/entender-intencao

POST /api/moderar-texto
```

### Configuração atual

```text
Fixed Window

60 segundos

10 requisições

por IP
```

### Comportamento

As duas rotas compartilham o limite.

### Excesso

```text
429 Too Many Requests
```

### Evolução futura

Os limites poderão ser separados ou ajustados conforme tráfego real.

---

# 20. Fase 14 — Score das Lojas

## Status

**CONCLUÍDO NA FUNDAÇÃO ATUAL / EM EVOLUÇÃO**

### Implementado

Existe função:

```text
public.atualizar_score_lojas()
```

### Sinais utilizados

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

### Regra

Premium e Patrocinado não são somados nessa base.

### Evolução futura

- revisar pesos;
- medir impacto;
- proteger sinais contra manipulação;
- melhorar qualidade.

---

# 21. Fase 15 — Automação do Score

## Status

**CONCLUÍDO NA FUNDAÇÃO ATUAL**

### Endpoint

```text
/api/cron/atualizar-scores
```

### Agendamento atual

```text
0 4 * * *
```

### Segurança

O endpoint:

```text
/api/cron/atualizar-scores
```

possui validação server-side de:

```text
CRON_SECRET
```

A execução sem autorização válida retorna erro, enquanto a execução autorizada pode prosseguir para o recálculo dos scores.

Essa proteção foi confirmada no Route Handler atual.

### Banco

A RPC de score possui execução restrita para o fluxo privilegiado necessário.

---

# 22. Fase 16 — Planos e Assinaturas

## Status

**EM EVOLUÇÃO**

### Conceitos existentes ou previstos

```text
Grátis

Premium

Patrocinado

Multiunidade

Franquia
```

### Períodos possíveis no catálogo

- mensal;
- trimestral;
- anual.

### Funcionalidades relacionadas

- limite de lojas;
- limite de produtos;
- limite de imagens;
- destaque;
- prioridade;
- estatísticas;
- recursos comerciais.

### Próxima prioridade

Auditar a experiência e as regras comerciais antes de escalar vendas.

---

# 23. Fase 17 — Cron de Assinaturas

## Status

**CONCLUÍDO NA FUNDAÇÃO ATUAL / EM EVOLUÇÃO**

### Endpoint

```text
/api/cron/verificar-planos
```

### Agendamento

```text
0 3 * * *
```

### Fluxos já exercitados

- aviso de 7 dias;
- aviso de 3 dias;
- aviso de 1 dia;
- início de cortesia;
- encerramento de cortesia;
- retorno ao gratuito.

### Segurança

No estado atual auditado, o endpoint:

```text
/api/cron/verificar-planos
```

ainda **não possui verificação explícita de `CRON_SECRET` no próprio Route Handler**.

Portanto, a proteção desse cron permanece como uma pendência de segurança.

### Próxima correção técnica

Adicionar validação server-side de:

```text
CRON_SECRET
```

antes da execução das operações privilegiadas do cron.

### Evolução

Transformar progressivamente esses cenários em testes automatizados.

---

# 24. Fase 18 — Mercado Pago

## Status

**EM AUDITORIA / EM EVOLUÇÃO**

### Estruturas existentes

```text
/api/mercadopago
```

e:

```text
/api/webhook/mercadopago
```

### Objetivo

Integrar contratação de planos com pagamento.

### Antes de maior escala comercial

Auditar:

- autenticação;
- propriedade da loja;
- preços;
- períodos;
- estados;
- webhook;
- autenticidade;
- duplicidade;
- idempotência;
- histórico;
- falhas.

### Regra

O frontend não é autoridade financeira.

---

# 25. Fase 19 — Favoritos

## Status

**EM EVOLUÇÃO**

### Objetivo

Permitir que consumidores salvem lojas de interesse.

### Valor para o consumidor

- retorno rápido;
- organização;
- personalização futura.

### Valor para o ranking

Favoritos também podem atuar como sinal do score.

### Próximas melhorias

- revisar consistência;
- revisar duplicidade;
- revisar UX;
- revisar autorização;
- melhorar página de favoritos.

---

# 26. Fase 20 — Avaliações

## Status

**EM EVOLUÇÃO**

### Domínio existente

Avaliações fazem parte do sistema.

### Elementos

- nota;
- comentário;
- usuário;
- loja;
- aprovação.

### Score

Avaliações aprovadas podem influenciar o score.

### Próxima grande melhoria de UX

Transformar a avaliação em experiência integrada à página da loja.

---

# 27. Fase 21 — Modal/Subaba de Avaliação

## Status

**PRÓXIMA PRIORIDADE / PLANEJADO**

### Experiência desejada

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

### Objetivo

Não retirar o usuário desnecessariamente do contexto da loja.

### Funcionalidades iniciais

- abrir;
- fechar;
- estrelas;
- comentário;
- publicar;
- cancelar;
- loading;
- erro.

### Futuro

- fotos;
- edição;
- exclusão;
- resposta do lojista;
- denúncia.

---

# 28. Fase 22 — Qualidade de Localização das Lojas

## Status

**PRÓXIMA PRIORIDADE**

### Problema

Muitas lojas podem existir sem coordenadas completas.

### Consequência

A descoberta ainda funciona, mas perde qualidade de proximidade.

### Objetivos

- aumentar cobertura de latitude;
- aumentar cobertura de longitude;
- validar endereços;
- melhorar distância;
- preparar mapa;
- preparar navegação.

---

# 29. Fase 23 — Busca por Produtos

## Status

**PLANEJADO**

### Objetivo

Evoluir de:

```text
BUSCAR LOJA
```

para:

```text
BUSCAR O QUE A PESSOA PRECISA
```

### Exemplo

```text
"quero tênis infantil"
        ↓
PRODUTOS COMPATÍVEIS
        ↓
LOJAS COMPATÍVEIS
        ↓
RANKING LOCAL
```

### Dependências

- qualidade de cadastro;
- produtos ativos;
- categorias;
- busca;
- performance;
- regras de relevância.

---

# 30. Fase 24 — Horários Estruturados

## Status

**PLANEJADO**

### Objetivo

Permitir filtro real:

```text
ABERTO AGORA
```

### Necessidades

- dias da semana;
- abertura;
- fechamento;
- intervalos;
- exceções;
- feriados;
- timezone.

### Regra

Enquanto não existir dado confiável:

> não inventar status de aberto/fechado.

---

# 31. Fase 25 — Delivery Estruturado

## Status

**PLANEJADO**

### Objetivo

Permitir que a intenção:

```text
delivery
```

seja aplicada com dados reais.

### Possíveis campos futuros

- oferece delivery;
- área;
- raio;
- taxa;
- tempo estimado;
- canais de pedido.

A modelagem definitiva ainda deverá ser projetada.

---

# 32. Fase 26 — Preço e Faixa de Preço

## Status

**PLANEJADO**

### Objetivo

Tornar buscas como:

```text
quero algo barato
```

mais úteis.

### Dependências

- produtos;
- preços;
- categorias;
- definição de faixa;
- contexto.

---

# 33. Fase 27 — Estoque/Disponibilidade

## Status

**FUTURO**

### Objetivo

Diferenciar:

```text
PRODUTO CADASTRADO
```

de:

```text
PRODUTO DISPONÍVEL AGORA
```

### Regra

Não afirmar estoque em tempo real sem fonte confiável.

---

# 34. Fase 28 — Design System

## Status

**PLANEJADO**

### Objetivo

Centralizar:

- cores;
- tipografia;
- espaçamentos;
- componentes;
- estados;
- bordas;
- sombras;
- acessibilidade.

### Benefício

Permitir evolução consistente entre:

```text
WEB

APP CLIENTE

APP LOJISTA
```

---

# 35. Fase 29 — Tema Automático, Claro e Escuro

## Status

**PLANEJADO**

### Opções

```text
Automático

Claro

Escuro
```

### Padrão

```text
Automático
```

### Automático

Deverá acompanhar a aparência do dispositivo.

### Tema Claro

Direção:

- branco;
- cinza claro;
- preto/grafite;
- laranja.

### Tema Escuro

Direção:

- preto;
- grafite;
- cinzas escuros;
- textos claros;
- laranja.

### Regra

O tema deve ser implementado através de sistema centralizado.

Não criar duas versões funcionais da mesma tela apenas para mudar aparência.

---

# 36. Fase 30 — App Cliente

## Status

**FUTURO PLANEJADO**

### Objetivo

Criar experiência móvel focada na descoberta.

### Áreas previstas

- início;
- busca inteligente;
- geolocalização;
- loja;
- produtos;
- favoritos;
- histórico;
- avaliações;
- perfil.

### Princípio

```text
ABRIR
  ↓
DIZER O QUE PROCURA
  ↓
ENCONTRAR
```

### Arquitetura

O aplicativo deverá utilizar backend seguro.

Nenhum secret administrativo poderá estar dentro do app.

---

# 37. Fase 31 — App Lojista

## Status

**FUTURO PLANEJADO**

### Objetivo

Permitir gerenciamento do negócio pelo celular.

### Áreas previstas

- dashboard;
- minha loja;
- produtos;
- promoções;
- avaliações;
- métricas;
- plano;
- insights;
- perfil.

### Princípio

```text
ABRIR
  ↓
ENTENDER O NEGÓCIO
  ↓
GERENCIAR
  ↓
AGIR
```

---

# 38. Fase 32 — Insights para Lojistas

## Status

**FUTURO**

### Possibilidades

- termos buscados;
- produtos procurados;
- desempenho;
- visualizações;
- favoritos;
- contatos;
- tendências da cidade.

### IA

A IA poderá transformar dados reais em explicações mais acessíveis.

### Regra

> insight não deve ser inventado.

---

# 39. Fase 33 — Personalização do Consumidor

## Status

**FUTURO**

### Possibilidades

- preferências;
- favoritos;
- histórico;
- categorias frequentes;
- localização;
- recomendações.

### Requisito

Privacidade precisa fazer parte da arquitetura.

---

# 40. Fase 34 — Busca Avançada em Escala

## Status

**FUTURO / CONDICIONADO A MÉTRICAS**

### Problema futuro

Com muito mais lojas, a busca atual poderá chegar a limites de performance.

### Opções possíveis

Somente quando necessário:

- `pg_trgm`;
- full-text;
- índices especializados;
- vector search;
- busca dedicada;
- cache.

### Regra

Não escolher tecnologia antes de medir o problema.

---

# 41. Fase 35 — Testes Automatizados

## Status

**PLANEJADO / PRIORIDADE TÉCNICA**

### Estado atual

A validação ainda utiliza fortemente:

- TypeScript;
- build;
- testes manuais;
- HTTP;
- banco;
- Preview;
- Production quando seguro.

### Prioridades de automação

```text
1. funções puras

2. busca e ranking

3. APIs

4. autorização

5. crons

6. pagamentos

7. webhooks

8. fluxos críticos
```

---

# 42. Fase 36 — Limpeza do Lint Legado

## Status

**PLANEJADO**

### Estado atual

O lint global possui dívida técnica antiga.

### Regra

Não misturar a limpeza inteira com uma feature qualquer.

### Objetivo

Criar trabalho específico para:

- reduzir erros;
- reduzir warnings;
- não alterar comportamento;
- futuramente permitir lint como check obrigatório.

---

# 43. Fase 37 — CI

## Status

**FUTURO**

### Possíveis checks

```text
git diff --check

TypeScript

build

lint quando estiver limpo

testes automatizados
```

### Objetivo

Evitar merge de regressões detectáveis automaticamente.

---

# 44. Fase 38 — Staging

## Status

**FUTURO**

### Objetivo

Criar ambiente separado de:

```text
LOCAL

PREVIEW

PRODUCTION
```

quando risco e volume justificarem.

### Possíveis usos

- payments sandbox;
- migrations;
- testes de integração;
- validações completas;
- demonstrações.

---

# 45. Fase 39 — Observabilidade

## Status

**FUTURO**

### Evoluções possíveis

- monitoramento;
- métricas;
- alertas;
- tracing;
- performance;
- dashboards;
- erros centralizados.

### Prioridade

Deverá crescer junto com criticidade da plataforma.

---

# 46. Fase 40 — Segurança Avançada

## Status

**EM EVOLUÇÃO CONTÍNUA**

### Áreas prioritárias

- RLS;
- autorização;
- admin;
- payments;
- webhook;
- mass assignment;
- secrets;
- rate limits;
- uploads;
- dependências.

### Regra

Segurança nunca será considerada uma fase completamente encerrada.

---

# 47. Fase 41 — Expansão em Joinville

## Status

**EM EVOLUÇÃO**

### Objetivo

Transformar Joinville em cidade piloto real.

### Precisamos validar

- variedade de lojas;
- densidade;
- categorias;
- coordenadas;
- consumidores;
- buscas;
- conversão;
- valor para lojistas.

---

# 48. Fase 42 — Densidade Local

## Status

**PLANEJADO**

### Objetivo

Aumentar quantidade de opções úteis por necessidade.

### Regra

```text
MUITAS LOJAS RELEVANTES EM UMA CIDADE
```

é melhor que:

```text
POUCAS LOJAS EM MUITAS CIDADES
```

durante a fase de validação.

---

# 49. Fase 43 — Segunda Cidade

## Status

**FUTURO**

### Condição

A expansão deverá acontecer depois que houver aprendizado suficiente no piloto.

### Critérios possíveis

- densidade;
- retenção;
- volume de buscas;
- lojistas ativos;
- monetização;
- operação replicável.

---

# 50. Fase 44 — Expansão Nacional

## Status

**VISÃO DE LONGO PRAZO**

### Modelo

```text
CIDADE 1
   ↓
MODELO VALIDADO
   ↓
CIDADE 2
   ↓
CIDADE 3
   ↓
REGIÕES
   ↓
BRASIL
```

---

# 51. Fase 45 — Taxonomia Avançada

## Status

**FUTURO**

### Possível estrutura

```text
CATEGORIA
   ↓
SUBCATEGORIA
   ↓
PRODUTO / SERVIÇO
```

### Objetivo

Melhorar:

- organização;
- descoberta;
- filtros;
- inteligência;
- analytics.

---

# 52. Fase 46 — Sinônimos e Linguagem Regional

## Status

**FUTURO**

### Objetivo

Compreender melhor:

- variações;
- sinônimos;
- gírias;
- nomes regionais;
- erros de digitação.

### Exemplo

O mesmo tipo de produto pode possuir nomes diferentes em diferentes estados.

---

# 53. Fase 47 — SEO e Descoberta Externa

## Status

**FUTURO**

### Objetivo

Permitir que páginas públicas ajudem lojas a serem encontradas também fora do VemVer.

### Áreas

- slugs;
- metadados;
- páginas públicas;
- produtos;
- compartilhamento;
- indexação.

---

# 54. Fase 48 — Compartilhamento

## Status

**PLANEJADO / FUTURO**

### Objetivo

Facilitar compartilhamento de:

- loja;
- produto;
- promoção;
- avaliação.

### Benefício

Cada lojista pode se tornar também um canal de aquisição do VemVer.

---

# 55. Fase 49 — Promoções

## Status

**FUTURO**

### Possíveis recursos

- promoção;
- validade;
- produto;
- preço;
- estabelecimento;
- destaque.

### Regra

Promoção expirada não deve aparecer como ativa.

---

# 56. Fase 50 — Métricas de Conversão

## Status

**FUTURO**

### Possíveis sinais

- clique na loja;
- clique no WhatsApp;
- favorito;
- rota;
- avaliação;
- produto aberto.

### Objetivo

Mostrar valor real ao lojista.

---

# 57. Fase 51 — Painel Comercial Avançado

## Status

**FUTURO**

### Possíveis recursos

- comparativos;
- períodos;
- produtos mais vistos;
- buscas relacionadas;
- origem dos acessos;
- crescimento;
- insights.

---

# 58. Fase 52 — Multiunidade

## Status

**FUTURO / DEPENDENTE DO MODELO COMERCIAL**

### Objetivo

Permitir gestão organizada de várias unidades.

### Possíveis necessidades

- uma conta;
- várias lojas;
- visão consolidada;
- permissões;
- métricas agregadas.

---

# 59. Fase 53 — Franquias

## Status

**FUTURO**

### Possíveis necessidades

- franqueador;
- franqueados;
- unidades;
- padrões de cadastro;
- planos;
- métricas;
- permissões hierárquicas.

---

# 60. Fase 54 — Papéis e Permissões Avançadas

## Status

**FUTURO**

### Possíveis papéis

- proprietário;
- gerente;
- funcionário;
- franqueador;
- franqueado;
- operador.

### Requisito

Cada papel precisará possuir autorização clara.

---

# 61. Fase 55 — Política de Retenção e Exclusão

## Status

**FUTURO**

### Precisará definir

- exclusão de conta;
- exclusão de loja;
- histórico;
- avaliações;
- pagamentos;
- retenção;
- obrigações legais.

---

# 62. Fase 56 — Proteção contra Manipulação

## Status

**FUTURO / DEPENDENTE DE ESCALA**

### Possíveis vetores

- visualizações artificiais;
- favoritos falsos;
- avaliações falsas;
- produtos artificiais;
- spam;
- abuso de IA.

### Objetivo

Preservar confiança nos sinais utilizados pelo ranking.

---

# 63. Fase 57 — Recomendação Personalizada

## Status

**FUTURO**

### Possibilidades

- preferências;
- histórico;
- localização;
- contexto;
- categorias;
- comportamento.

### Regra

Publicidade não deve se disfarçar de recomendação irrelevante.

---

# 64. Fase 58 — IA Conversacional Avançada

## Status

**VISÃO FUTURA**

### Exemplo

```text
"Quero jantar perto daqui,
não quero gastar muito
e queria um lugar tranquilo."
```

### Futuro fluxo

```text
LINGUAGEM NATURAL
      ↓
INTENÇÃO COMPLEXA
      ↓
DADOS REAIS
      ↓
REGRAS
      ↓
RECOMENDAÇÃO LOCAL
```

---

# 65. Fase 59 — Inteligência Comercial para Lojistas

## Status

**VISÃO FUTURA**

### Exemplo

```text
"As pessoas na sua região estão procurando
mais por X nesta semana."
```

### Condição

Isso precisa ser baseado em dados reais agregados.

---

# 66. Fase 60 — Plataforma de Descoberta Local em Escala

## Status

**VISÃO DE LONGO PRAZO**

### Objetivo

Transformar o VemVer em referência para encontrar:

```text
LOJAS

PRODUTOS

SERVIÇOS

PROMOÇÕES

OPORTUNIDADES LOCAIS
```

---

# 67. O que Não é Prioridade Imediata

Não devemos antecipar sem necessidade:

- microserviços;
- Kafka;
- infraestrutura distribuída complexa;
- marketplace transacional completo;
- checkout próprio;
- busca vetorial apenas por moda;
- dezenas de papéis;
- expansão nacional precoce.

---

# 68. Prioridade Atual — Documentação

## Status

**EM CONCLUSÃO**

A documentação mestra está sendo consolidada.

Estrutura:

```text
docs/
├── 00_PROJECT_CONSTITUTION.md
├── README.md
│
├── product/
├── architecture/
├── engineering/
└── governance/
```

Quando finalizada:

> o projeto passa a possuir uma base documental oficial para orientar as próximas etapas.

---

# 69. Próxima Prioridade — Página da Loja

Depois da documentação:

```text
PÁGINA DA LOJA
```

deve receber revisão.

### Motivo

É um dos pontos centrais entre:

```text
DESCOBERTA
```

e:

```text
AÇÃO
```

---

# 70. Próxima Prioridade — Avaliações

A evolução do fluxo de avaliação será integrada à página da loja.

---

# 71. Próxima Prioridade — Localização

O banco precisa aumentar cobertura de coordenadas.

---

# 72. Próxima Prioridade — Descoberta

Depois:

- melhorar termos;
- melhorar ranking;
- melhorar respostas;
- preparar produtos;
- analisar performance.

---

# 73. Próxima Prioridade — Produtos

Produto deverá ganhar importância crescente na descoberta.

---

# 74. Próxima Prioridade — Planos

Antes de escalar vendas:

- revisar valor entregue;
- revisar limites;
- revisar pagamentos;
- revisar assinaturas;
- revisar segurança.

---

# 75. Próxima Prioridade — Dívida Técnica

Trabalhos específicos deverão tratar:

- lint legado;
- testes automatizados;
- autorização;
- payments;
- RLS;
- uploads.

---

# 76. Dependências Importantes

Algumas features dependem de outras.

Exemplo:

```text
ABERTO AGORA
```

depende de:

```text
HORÁRIOS ESTRUTURADOS
```

---

# 77. Outra Dependência

```text
BUSCA POR PRODUTO
```

depende de:

```text
CATÁLOGO DE PRODUTOS COM QUALIDADE
```

---

# 78. Outra Dependência

```text
PROXIMIDADE PRECISA
```

depende de:

```text
COORDENADAS DAS LOJAS
```

---

# 79. Outra Dependência

```text
INSIGHTS
```

dependem de:

```text
DADOS REAIS
+
MÉTRICAS
```

---

# 80. Outra Dependência

```text
APP MOBILE
```

depende de:

```text
BACKEND ESTÁVEL
+
APIs SEGURAS
+
PRODUTO VALIDADO
```

---

# 81. Outra Dependência

```text
EXPANSÃO NACIONAL
```

depende de:

```text
MODELO LOCAL REPLICÁVEL
```

---

# 82. Regra de Não Pular Fases Críticas

Uma feature atraente não deve fazer o projeto ignorar problemas de:

- autorização;
- pagamento;
- banco;
- qualidade de dados;
- segurança.

---

# 83. Métricas para Mudar Prioridade

O Roadmap poderá mudar baseado em:

- feedback;
- usuários;
- lojistas;
- incidentes;
- receita;
- conversão;
- custo;
- performance.

---

# 84. Roadmap não é Imutável

Este documento deve evoluir.

Porém:

> mudanças relevantes de direção precisam ser intencionais.

---

# 85. Quando uma Fase Pode ser Movida

Uma fase futura pode subir de prioridade quando:

- bloqueia receita;
- bloqueia usuário;
- reduz risco;
- melhora descoberta significativamente;
- resolve problema comprovado.

---

# 86. Quando uma Fase Deve Esperar

Uma feature deve esperar quando:

- não resolve problema atual;
- depende de dados inexistentes;
- cria complexidade desnecessária;
- possui risco alto sem fundação;
- é apenas estética sem prioridade.

---

# 87. Definition of Done de uma Fase

Uma fase relevante precisa, conforme aplicável:

```text
[ ] requisito definido

[ ] arquitetura definida

[ ] banco definido

[ ] API implementada

[ ] interface implementada

[ ] segurança revisada

[ ] testes executados

[ ] Preview validado

[ ] produção validada

[ ] documentação atualizada
```

---

# 88. Definition of Done do Roadmap

Mover algo para:

```text
CONCLUÍDO
```

somente quando o estado real justificar.

---

# 89. Regra sobre Mockups

Mockup:

```text
≠ FUNCIONALIDADE IMPLEMENTADA
```

---

# 90. Regra sobre Decisões

Decisão aprovada:

```text
≠ CÓDIGO PRONTO
```

---

# 91. Regra sobre Documentação

Documentação futura:

```text
≠ PRODUÇÃO
```

---

# 92. Regra sobre Deploy

Deployment Ready:

```text
≠ FEATURE VALIDADA
```

---

# 93. Relação com Product Vision

```text
PRODUCT_VISION.md
```

define:

```text
ONDE QUEREMOS CHEGAR
```

Este Roadmap define:

```text
COMO PRETENDEMOS CHEGAR LÁ
```

---

# 94. Relação com Master Document

```text
MASTER_DOCUMENT.md
```

explica:

```text
O PRODUTO COMO UM TODO
```

---

# 95. Relação com Business Rules

```text
BUSINESS_RULES.md
```

define:

```text
COMO O PRODUTO DEVE SE COMPORTAR
```

---

# 96. Relação com Decisions

```text
DECISIONS.md
```

registra:

```text
POR QUE ESCOLHEMOS DETERMINADAS DIREÇÕES
```

---

# 97. Relação com Changelog

```text
CHANGELOG.md
```

registra:

```text
O QUE REALMENTE MUDOU
```

---

# 98. Relação com Architecture

```text
ARCHITECTURE.md
```

registra como a evolução é suportada tecnicamente.

---

# 99. Relação com Test Plan

```text
TEST_PLAN.md
```

define como comprovar que uma etapa funciona.

---

# 100. Roadmap Resumido

```text
FUNDAÇÃO
   ↓
AUTENTICAÇÃO
   ↓
LOJAS
   ↓
PRODUTOS
   ↓
BUSCA
   ↓
IA
   ↓
LOCALIZAÇÃO
   ↓
RANKING
   ↓
SEGURANÇA
   ↓
PLANOS
   ↓
AVALIAÇÕES
   ↓
DADOS MAIS RICOS
   ↓
APP CLIENTE / APP LOJISTA
   ↓
NOVAS CIDADES
   ↓
ESCALA
```

---

# 101. Roadmap Imediato

Direção atual:

```text
DOCUMENTAÇÃO
   ↓
PÁGINA DA LOJA
   ↓
AVALIAÇÕES
   ↓
LOCALIZAÇÃO
   ↓
DESCOBERTA
   ↓
PRODUTOS
   ↓
PLANOS
   ↓
DÍVIDA TÉCNICA
```

---

# 102. Roadmap de Médio Prazo

Depois:

```text
HORÁRIOS

DELIVERY

BUSCA POR PRODUTO

DESIGN SYSTEM

TEMAS

TESTES AUTOMATIZADOS

MÉTRICAS

VALIDAÇÃO COMERCIAL
```

---

# 103. Roadmap de Longo Prazo

```text
APP CLIENTE

APP LOJISTA

INSIGHTS

PERSONALIZAÇÃO

NOVAS CIDADES

BUSCA EM ESCALA

PLATAFORMA NACIONAL
```

---

# 104. Visão em Cinco Anos

O VemVer deve ser capaz de crescer sem abandonar:

```text
RELEVÂNCIA

CONFIANÇA

PROXIMIDADE

SEGURANÇA

SIMPLICIDADE
```

---

# 105. O que Deve Guiar o Roadmap

A pergunta principal continua sendo:

> Qual é o próximo passo que mais aproxima o VemVer de conectar uma necessidade real a uma oferta local real?

---

# 106. Princípios que não Devem Ser Perdidos

```text
RELEVÂNCIA ANTES DE MONETIZAÇÃO

IA INTERPRETA; BACKEND DECIDE

NÃO INVENTAR DADOS

SEGURANÇA ANTES DE ESCALA

DADOS REAIS ANTES DE FILTROS FALSOS

VALIDAR LOCALMENTE ANTES DE EXPANDIR

DOCUMENTAR ANTES DE ESQUECER
```

---

# 107. Relação com Outros Documentos

Este documento deve ser lido junto com:

```text
../00_PROJECT_CONSTITUTION.md

MASTER_DOCUMENT.md
PRODUCT_VISION.md
BUSINESS_RULES.md

../architecture/ARCHITECTURE.md
../architecture/DATABASE.md
../architecture/API.md
../architecture/SECURITY.md
../architecture/DEPLOY.md

../engineering/CODING_STANDARDS.md
../engineering/TEST_PLAN.md
../engineering/CHECKLIST.md

../governance/DECISIONS.md
../governance/CHANGELOG.md
```

---

# 108. Regra Final

Antes de mudar a prioridade de uma fase, perguntar:

```text
Qual problema estamos resolvendo?

Qual impacto terá?

Quem será beneficiado?

Existe dependência anterior?

Existe risco de segurança?

Existe risco financeiro?

Existe dado suficiente?

Podemos testar?

Precisamos primeiro validar algo menor?

A mudança está coerente com a visão?
```

---

# 109. Conclusão

O Roadmap do VemVer não é uma lista de desejos.

Ele existe para transformar a visão:

```text
"Você não procura.
O VemVer encontra para você."
```

em uma sequência realista de construção.

O objetivo não é fazer tudo ao mesmo tempo.

É construir na ordem certa.

Primeiro:

```text
FUNDAÇÃO
```

depois:

```text
QUALIDADE E VALIDAÇÃO
```

depois:

```text
CRESCIMENTO
```

e somente então:

```text
ESCALA
```

A plataforma deverá crescer passo a passo, preservando a confiança do consumidor, o valor para o lojista e a capacidade técnica de continuar evoluindo.

> O melhor Roadmap não é o que possui mais funcionalidades. É o que coloca as funcionalidades certas na ordem certa.
