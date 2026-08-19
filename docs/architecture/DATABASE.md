# VemVer — Banco de Dados

## Documento

**Projeto:** VemVer
**Documento:** Banco de Dados e Persistência
**Versão:** 1.0.0
**Status:** Ativo
**Última atualização:** 17/08/2026

---

# 1. Objetivo

Este documento descreve a arquitetura de banco de dados do VemVer.

Seu objetivo é registrar:

- tecnologia utilizada;
- principais tabelas;
- responsabilidades dos dados;
- funções PostgreSQL;
- RPCs;
- migrations;
- permissões;
- uso do `service_role`;
- busca sem acentos;
- score das lojas;
- histórico de assinaturas;
- regras de segurança;
- limitações atuais;
- diretrizes para futuras alterações.

O banco de dados deve possuir histórico compreensível e não depender apenas de alterações manuais realizadas pelo painel do Supabase.

---

# 2. Tecnologia

O VemVer utiliza:

```text
SUPABASE
   ↓
POSTGRESQL
```

O PostgreSQL é a principal fonte de persistência da plataforma.

O Supabase fornece infraestrutura e serviços adicionais ao redor do banco.

---

# 3. Responsabilidades do Supabase

Atualmente o Supabase participa de áreas como:

- PostgreSQL;
- autenticação;
- Storage;
- RPC;
- políticas de acesso;
- consultas;
- funções;
- integração com o backend.

---

# 4. Fonte de Verdade

Dados persistentes do VemVer devem possuir fonte de verdade clara.

Conceitualmente:

```text
POSTGRESQL
→ dados persistentes da plataforma

BACKEND
→ regras e decisões

OPENAI
→ interpretação

MERCADO PAGO
→ estado externo de pagamentos

VERCEL
→ infraestrutura de execução e deploy
```

A IA nunca deve substituir o banco como fonte de verdade de dados comerciais.

---

# 5. Versionamento do Banco

O banco passou a possuir versionamento através do Supabase CLI.

Estrutura atual:

```text
supabase/
├── config.toml
└── migrations/
```

As migrations fazem parte do repositório Git.

---

# 6. Regra Fundamental de Migration

Depois que uma migration for aplicada:

> não editar o passado para fingir que a mudança sempre existiu.

Uma nova alteração estrutural deve gerar:

```text
NOVA ALTERAÇÃO
      ↓
NOVA MIGRATION
      ↓
APLICAÇÃO
      ↓
HISTÓRICO PRESERVADO
```

---

# 7. Baseline

Quando o versionamento do banco foi introduzido, foi criado um baseline do banco remoto.

Arquivo:

```text
supabase/migrations/20260813000743_remote_schema.sql
```

Esse arquivo representa a estrutura existente no momento em que o controle por migrations foi iniciado.

Ele não deve ser utilizado como arquivo vivo para alterações futuras.

---

# 8. Migrations Versionadas

As migrations atualmente registradas incluem:

```text
20260813000743_remote_schema.sql

20260813002732_restringir_execucao_atualizar_score_lojas.sql

20260815222432_habilitar_busca_sem_acentos.sql

20260815233344_criar_busca_lojas_sem_acentos.sql
```

Novas alterações deverão continuar seguindo o mesmo modelo.

---

# 9. Histórico Local e Remoto

O histórico de migrations do projeto foi sincronizado com o Supabase remoto.

O objetivo é manter:

```text
MIGRATIONS LOCAIS
        =
MIGRATIONS REGISTRADAS NO AMBIENTE REMOTO
```

Diferenças devem ser investigadas antes de novas alterações.

---

# 10. Supabase CLI

O projeto utiliza Supabase CLI para operações relacionadas ao banco.

Entre comandos já utilizados estão fluxos como:

```text
supabase init
supabase link
supabase db pull
supabase db push
```

Os comandos exatos deverão sempre ser executados com atenção ao ambiente conectado.

---

# 11. Mudanças Manuais

Alterações manuais no painel do Supabase podem ser úteis para diagnóstico ou situações específicas.

Porém:

> mudanças estruturais importantes não devem permanecer somente no painel.

Depois de confirmadas, devem ser representadas por migrations quando aplicável.

---

# 12. Tabelas Principais

Entre as estruturas atualmente conhecidas e utilizadas pelo VemVer estão:

```text
lojas
produtos
avaliacoes
favoritos
solicitacoes_planos
historico_assinaturas
moderacoes_conteudo
```

O baseline contém a definição completa disponível no momento de sua criação.

Este documento destaca principalmente estruturas que impactam as regras atuais do produto.

---

# 13. Tabela `lojas`

A tabela:

```text
public.lojas
```

é uma das estruturas centrais do VemVer.

Ela representa estabelecimentos cadastrados na plataforma.

---

# 14. Campos Relevantes de `lojas`

Entre os campos conhecidos estão:

```text
id
nome
categoria
whatsapp
cidade
uf
endereco
descricao
imagem_url
instagram

latitude
longitude

premium
patrocinado
score
visualizacoes

ativo
status

user_id

plano
limite_lojas

assinatura_status
plano_vencimento
```

Existem também outros campos relacionados à evolução do cadastro e da moderação.

A definição real do banco é sempre a autoridade final sobre os tipos e campos existentes.

---

# 15. Identificador da Loja

A tabela utiliza um identificador:

```text
id
```

para relacionar a loja a outras estruturas.

Esse identificador deve ser utilizado em relações internas em vez de depender de nome textual.

---

# 16. Propriedade da Loja

O campo:

```text
user_id
```

é utilizado para relacionar a loja ao usuário responsável.

Essa relação é importante para autorização.

Regra:

> saber o ID de uma loja não significa possuir direito de alterá-la.

O backend e as políticas aplicáveis devem validar propriedade ou autorização.

---

# 17. Status da Loja

O campo:

```text
status
```

participa do controle de aprovação.

Na busca inteligente atual, somente lojas com:

```text
status = 'aprovada'
```

participam dos resultados da RPC utilizada pela descoberta.

---

# 18. Loja Ativa

O campo:

```text
ativo
```

indica disponibilidade operacional da loja dentro de determinados fluxos.

Na busca inteligente atual:

```text
ativo = true
```

é requisito para retornar a loja.

---

# 19. Premium

O campo:

```text
premium
```

indica participação da loja na condição Premium utilizada atualmente por partes do sistema.

Ele influencia o cálculo atual de score.

---

# 20. Patrocinado

O campo:

```text
patrocinado
```

indica condição comercial patrocinada.

Ele também influencia o score atual.

Patrocínio não substitui relevância da busca.

---

# 21. Score

O campo:

```text
score
```

armazena uma pontuação calculada para a loja.

Esse score é utilizado como um dos sinais do ranking.

Regra importante:

```text
SCORE ≠ RELEVÂNCIA TEXTUAL
```

---

# 22. Visualizações

O campo:

```text
visualizacoes
```

é utilizado atualmente como um dos sinais que podem contribuir para o score.

A definição futura de uma visualização válida deverá ser melhor formalizada.

---

# 23. Coordenadas

Os campos:

```text
latitude
longitude
```

permitem calcular distância entre consumidor e estabelecimento.

Atualmente nem todas as lojas possuem essas informações.

---

# 24. Coordenada Ausente

Quando uma loja não possui latitude ou longitude:

```text
distanciaKm = null
```

na camada de busca.

Isso deve ser interpretado como:

```text
DISTÂNCIA DESCONHECIDA
```

e não:

```text
DISTÂNCIA ZERO
```

---

# 25. Cidade e UF

Os campos:

```text
cidade
uf
```

participam da busca geográfica.

A RPC atual consegue filtrar candidatos por cidade e UF.

Comparações de cidade utilizam normalização sem acentos.

UF é tratada de forma normalizada pelo backend e pela consulta.

---

# 26. Tabela `produtos`

A tabela:

```text
public.produtos
```

representa produtos vinculados às lojas.

---

# 27. Relação Produto → Loja

Produtos possuem relação com a loja através do identificador correspondente.

Conceitualmente:

```text
LOJA
  │
  ├── PRODUTO 1
  ├── PRODUTO 2
  └── PRODUTO 3
```

Um produto público deve possuir loja responsável.

---

# 28. Produto Ativo

A estrutura atual possui conceito de produto:

```text
ativo = true
```

Produtos ativos participam do cálculo atual do score da loja.

---

# 29. Produtos no Score

O score considera a quantidade de produtos ativos da loja.

Existe um limite de contribuição para impedir crescimento indefinido da pontuação apenas pela quantidade de produtos.

---

# 30. Evolução dos Produtos

A estrutura de produtos deverá continuar evoluindo para suportar melhor:

- nome;
- descrição;
- preço;
- imagens;
- categoria;
- disponibilidade;
- busca;
- estoque quando aplicável;
- promoções.

Nem todos esses elementos são considerados completos atualmente.

---

# 31. Tabela `avaliacoes`

A tabela:

```text
public.avaliacoes
```

armazena avaliações relacionadas às lojas.

---

# 32. Nota

Avaliações utilizam uma nota:

```text
nota
```

A direção de produto é trabalhar com:

```text
1 a 5 estrelas
```

---

# 33. Avaliação Aprovada

O campo:

```text
aprovado
```

participa do controle de quais avaliações podem contribuir para determinadas métricas.

O score atual considera somente avaliações:

```text
aprovado = true
```

---

# 34. Média de Avaliações

A função de score utiliza a média:

```text
avg(nota)
```

das avaliações aprovadas.

A contribuição possui um limite máximo no cálculo atual.

---

# 35. Evolução de Avaliações

O banco deverá futuramente suportar regras mais avançadas relacionadas a:

- edição;
- exclusão;
- fotos;
- denúncia;
- resposta da loja;
- antifraude;
- histórico.

Mudanças desse tipo deverão ser planejadas antes de alterar o schema.

---

# 36. Tabela `favoritos`

A tabela:

```text
public.favoritos
```

representa relações de favoritos entre consumidores e lojas.

---

# 37. Favoritos no Score

A quantidade de favoritos participa do cálculo atual do score.

Cada favorito possui contribuição limitada pela fórmula para impedir crescimento ilimitado.

---

# 38. Favorito não é Avaliação

Arquiteturalmente:

```text
FAVORITO
```

representa preferência/interesse.

```text
AVALIAÇÃO
```

representa reputação/opinião.

Esses conceitos não devem ser misturados.

---

# 39. Tabela `solicitacoes_planos`

A estrutura:

```text
solicitacoes_planos
```

é utilizada em fluxos relacionados a solicitações comerciais de planos.

Ela pode servir especialmente em situações nas quais uma mudança não deve ocorrer automaticamente.

---

# 40. Estruturas de Planos, Assinaturas e Pagamentos

O ciclo comercial do VemVer utiliza diferentes tabelas com responsabilidades separadas.

As estruturas abaixo foram confirmadas tanto no schema versionado quanto no código atual.

## 40.1. Tabela `historico_assinaturas`

A estrutura:

```text
historico_assinaturas
```

registra eventos relacionados à evolução das assinaturas.

Seu objetivo é preservar rastreabilidade sobre alterações importantes do ciclo de planos.

## 40.2. Tabela `planos_catalogo`

A estrutura:

```text
planos_catalogo
```

mantém o catálogo de planos utilizado pelos fluxos comerciais da plataforma.

Ela é consultada atualmente por áreas como:

- painel administrativo;
- ativação administrativa de planos;
- criação de pagamentos;
- webhook do Mercado Pago;
- cron de verificação de planos;
- painel do lojista.

## 40.3. Tabela `pagamentos`

A estrutura:

```text
pagamentos
```

registra dados do fluxo de pagamentos e seus estados.

Ela participa atualmente de operações relacionadas a:

- criação e acompanhamento de pagamentos;
- processamento do Mercado Pago;
- webhook de pagamentos;
- verificação de conflitos antes de ativações administrativas;
- alterações de plano agendadas;
- processamento periódico pelo cron de planos.

## 40.4. Tabela `ativacoes_manuais_planos`

A estrutura:

```text
ativacoes_manuais_planos
```

registra operações administrativas relacionadas à ativação manual ou programada de planos.

Ela é utilizada atualmente pelo endpoint administrativo de ativação de planos e pelo cron de verificação de assinaturas.

Essas estruturas possuem responsabilidades diferentes e não devem ser tratadas como uma única fonte de estado.

---

# 41. Eventos de Assinatura

Entre situações que podem gerar histórico estão:

- ativação;
- aviso;
- vencimento;
- início de cortesia;
- fim de cortesia;
- retorno ao plano gratuito;
- futuras mudanças de plano.

---

# 42. Importância do Histórico

Sem histórico, o sistema saberia apenas:

```text
ESTADO ATUAL
```

Com histórico, podemos compreender:

```text
COMO CHEGAMOS AO ESTADO ATUAL
```

Isso é importante para:

- suporte;
- auditoria;
- cobrança;
- diagnóstico;
- investigação de erros.

---

# 43. Tabela `moderacoes_conteudo`

A estrutura:

```text
moderacoes_conteudo
```

faz parte das estruturas relacionadas à moderação.

A utilização completa deverá ser documentada conforme o fluxo de moderação amadurecer.

---

# 44. Funções PostgreSQL

O VemVer utiliza funções PostgreSQL para operações específicas.

Entre as principais funções documentadas atualmente estão:

```text
public.atualizar_score_lojas()
```

e:

```text
public.buscar_lojas_sem_acentos(...)
```

---

# 45. Função `atualizar_score_lojas`

A função:

```text
public.atualizar_score_lojas()
```

recalcula o score das lojas.

Ela executa uma atualização sobre a tabela de lojas.

---

# 46. Fórmula Atual do Score

Conceitualmente, a fórmula atual é:

```text
BASE COMERCIAL
+
VISUALIZAÇÕES
+
PRODUTOS ATIVOS
+
FAVORITOS
+
AVALIAÇÕES
```

---

# 47. Base Comercial do Score

A base atual utiliza:

```text
SE patrocinado = true
→ 60 pontos

SENÃO SE premium = true
→ 30 pontos

SENÃO
→ 0
```

Isso significa que Premium e Patrocinado não são somados entre si nessa parte da fórmula.

---

# 48. Regra Premium x Patrocinado

A lógica atual utiliza:

```text
CASE
```

e não:

```text
premium + patrocinado
```

Portanto:

> o backend não deve adicionar novamente essas vantagens como se fossem independentes quando já estão incorporadas ao score.

---

# 49. Visualizações no Score

A contribuição atual de visualizações é aproximadamente:

```text
LEAST(visualizacoes, 500) / 10
```

Assim existe um teto de contribuição.

---

# 50. Produtos Ativos no Score

A função considera a quantidade de produtos:

```text
ativo = true
```

com contribuição limitada a:

```text
30
```

---

# 51. Favoritos no Score

A função considera:

```text
quantidade de favoritos × 2
```

com limite máximo de contribuição:

```text
50
```

---

# 52. Avaliações no Score

A função considera a média das avaliações:

```text
aprovado = true
```

multiplicada por:

```text
5
```

com limite máximo:

```text
25
```

---

# 53. Fórmula Técnica Atual

A lógica atual equivale conceitualmente a:

```sql
case
  when patrocinado = true then 60
  when premium = true then 30
  else 0
end

+ least(coalesce(visualizacoes, 0), 500) / 10

+ least(
    quantidade_de_produtos_ativos,
    30
  )

+ least(
    quantidade_de_favoritos * 2,
    50
  )

+ least(
    media_avaliacoes_aprovadas * 5,
    25
  )
```

A implementação real do banco continua sendo a fonte definitiva.

---

# 54. Atualização com `WHERE TRUE`

A função de atualização foi ajustada para possuir:

```sql
where true
```

na operação de atualização.

Isso resolveu uma restrição que impedia o `UPDATE` sem condição explícita no ambiente utilizado.

---

# 55. Execução do Score

O backend executa a função através de RPC.

Conceitualmente:

```text
CRON
   ↓
API DO VEMVER
   ↓
SUPABASE RPC
   ↓
atualizar_score_lojas()
```

---

# 56. Segurança da Função de Score

A execução foi removida dos papéis públicos.

Foram revogados privilégios para:

```text
public
anon
authenticated
```

A execução foi mantida para:

```text
service_role
```

e papéis internos necessários do banco.

---

# 57. Migration de Segurança do Score

Arquivo:

```text
20260813002732_restringir_execucao_atualizar_score_lojas.sql
```

Esse arquivo formaliza a restrição de execução.

---

# 58. Cron de Score

A aplicação possui:

```text
/api/cron/atualizar-scores
```

responsável por acionar a atualização automatizada.

A função não precisa ficar publicamente executável apenas porque existe um cron.

---

# 59. Extensão `unaccent`

Foi habilitada a extensão PostgreSQL:

```text
unaccent
```

Ela está disponível no schema:

```text
extensions
```

---

# 60. Migration do `unaccent`

Arquivo:

```text
20260815222432_habilitar_busca_sem_acentos.sql
```

A migration cria a extensão quando necessário.

---

# 61. Objetivo do `unaccent`

Permitir equivalência textual básica entre:

```text
acai
```

e:

```text
açaí
```

ou outras diferenças de acentuação.

---

# 62. Dados Originais não são Alterados

A utilização de `unaccent` acontece durante comparação.

Isso significa que o sistema pode armazenar:

```text
Açaí Norte
```

e pesquisar usando:

```text
acai
```

sem transformar permanentemente o valor original.

---

# 63. Função `buscar_lojas_sem_acentos`

A função principal utilizada pela descoberta é:

```text
public.buscar_lojas_sem_acentos(
  p_criterios text[],
  p_cidade text,
  p_uf text
)
```

---

# 64. Retorno da Função

A função retorna registros da estrutura:

```text
public.lojas
```

Conceitualmente:

```text
returns setof public.lojas
```

---

# 65. Objetivo da RPC de Busca

A função reduz candidatos do banco antes da etapa de ranking executada pelo backend.

Fluxo:

```text
CRITÉRIOS
   ↓
RPC
   ↓
LOJAS COMPATÍVEIS
   ↓
BACKEND
   ↓
RELEVÂNCIA + DISTÂNCIA + SCORE
```

---

# 66. Filtros da RPC

A função atual considera lojas:

```text
ativo = true
```

e:

```text
status = 'aprovada'
```

Além disso, pode considerar:

- cidade;
- UF;
- critérios textuais.

---

# 67. Campos Pesquisados

Os critérios podem ser comparados atualmente principalmente contra:

```text
nome
categoria
descricao
```

---

# 68. Comparação Textual

A função utiliza comparação conceitualmente semelhante a:

```text
%criterio%
```

após:

- conversão para minúsculas;
- remoção lógica de acentos.

---

# 69. Cidade sem Acentos

A cidade também é comparada utilizando normalização.

Isso reduz problemas como variações simples de acentuação.

---

# 70. UF

A UF é normalizada para permitir comparação consistente entre valores equivalentes.

---

# 71. Critérios Vazios

A função possui tratamento para critérios ausentes/vazios.

O backend continua responsável por decidir quando uma busca faz sentido.

---

# 72. `security invoker`

A função de busca utiliza:

```text
security invoker
```

Isso evita elevar privilégios automaticamente por causa da função.

---

# 73. `search_path`

A função utiliza configuração controlada de:

```text
search_path
```

e referências explícitas aos schemas necessários.

Isso reduz ambiguidades de resolução de objetos.

---

# 74. Segurança da RPC de Busca

A execução pública foi removida de:

```text
public
anon
authenticated
```

e concedida a:

```text
service_role
```

para o fluxo backend atual.

---

# 75. Migration da RPC de Busca

Arquivo:

```text
20260815233344_criar_busca_lojas_sem_acentos.sql
```

Ela contém a criação da função e seus privilégios.

---

# 76. Motivo para Proteger a RPC

A busca pública deve ocorrer assim:

```text
CLIENTE
   ↓
API DO VEMVER
   ↓
VALIDAÇÃO
   ↓
SERVICE ROLE NO SERVIDOR
   ↓
RPC
```

e não:

```text
CLIENTE
   ↓
CHAMADA DIRETA PRIVILEGIADA
```

---

# 77. Service Role

A variável:

```text
SUPABASE_SERVICE_ROLE_KEY
```

possui capacidades elevadas.

Regra:

> nunca enviar para o frontend.

---

# 78. Service Role e RLS

O `service_role` possui privilégios elevados e pode ignorar restrições destinadas a usuários comuns.

Por isso:

> utilizar service role aumenta a responsabilidade do backend.

Uma API usando essa chave precisa validar corretamente tudo antes de acessar ou alterar dados.

---

# 79. Chave Pública do Supabase

A aplicação pode possuir configuração pública necessária à integração normal com Supabase.

Isso não deve ser confundido com a chave administrativa.

---

# 80. RLS

Row Level Security deve ser considerada parte importante da proteção das tabelas acessadas diretamente por usuários autenticados.

Este documento não declara todas as políticas atuais como definitivamente revisadas.

Antes de alterar permissões importantes:

> consultar o schema e as políticas reais do ambiente.

---

# 81. Autenticação ≠ Autorização

O banco deve respeitar a diferença:

```text
AUTENTICAÇÃO
→ quem é?

AUTORIZAÇÃO
→ pode fazer o quê?
```

Um usuário autenticado não deve automaticamente possuir acesso a todas as lojas ou registros.

---

# 82. Relações por `user_id`

Campos que relacionam dados a usuários devem ser utilizados para garantir propriedade quando aplicável.

Exemplo:

```text
LOJA.user_id
        ↓
USUÁRIO RESPONSÁVEL
```

---

# 83. Operações Administrativas

Operações administrativas não devem depender de acesso concedido a usuários comuns.

Fluxos administrativos precisam de:

- autenticação;
- autorização;
- papel apropriado;
- backend seguro;
- auditoria quando necessário.

---

# 84. Exclusão

A exclusão física de registros deve ser analisada com cuidado.

Em algumas áreas pode ser mais apropriado utilizar:

```text
ativo = false
```

ou outro mecanismo de arquivamento.

A decisão depende da regra de negócio.

---

# 85. Integridade Referencial

Relações entre:

- lojas;
- produtos;
- avaliações;
- favoritos;
- assinaturas;

devem preservar integridade.

Antes de remover uma entidade principal, o impacto em registros relacionados deve ser analisado.

---

# 86. Índices

Índices deverão ser criados de acordo com os padrões reais de consulta.

Não devemos adicionar índices indiscriminadamente.

Perguntas importantes:

- qual query está lenta?
- qual coluna participa do filtro?
- qual coluna participa do relacionamento?
- qual volume existe?
- qual impacto na escrita?

---

# 87. Escalabilidade da Busca Atual

A RPC atual utiliza busca parcial textual.

Em volume pequeno ou moderado isso atende à fundação atual.

Com crescimento significativo, consultas no formato:

```text
LIKE '%termo%'
```

podem tornar-se um gargalo.

---

# 88. Evolução Possível da Busca

No futuro, dependendo de métricas reais, poderão ser avaliados:

- `pg_trgm`;
- índices GIN/GiST;
- full-text search;
- busca vetorial;
- mecanismo de busca externo;
- cache;
- pré-processamento.

Nenhuma dessas tecnologias deverá ser adicionada sem necessidade medida.

---

# 89. Busca Vetorial

Busca vetorial é uma possibilidade futura para melhorar relações semânticas.

Ela não substitui automaticamente:

- filtros;
- localização;
- regras;
- autorização;
- dados estruturados.

Qualquer implementação deverá ser projetada como parte do ranking, não como solução mágica.

---

# 90. Produtos na Descoberta

Atualmente a busca inteligente está mais concentrada em dados das lojas.

Uma evolução importante será integrar:

```text
BUSCA DO USUÁRIO
      ↓
PRODUTO
      ↓
LOJA
```

Isso poderá exigir novas queries, funções ou índices.

---

# 91. Horários

O banco ainda não possui uma estrutura final e confiável para horários de funcionamento utilizada pela busca inteligente.

Por isso:

```text
abertoAgora
```

pode ser interpretado pela IA, mas ainda não deve ser tratado como filtro confiável.

---

# 92. Estrutura Futura de Horários

Quando implementada, deverá considerar:

- dia da semana;
- horário de abertura;
- horário de fechamento;
- intervalo;
- horários especiais;
- feriados;
- exceções;
- fuso horário.

---

# 93. Delivery

Delivery ainda precisa de dado estruturado confiável para ser aplicado pela busca.

O banco poderá futuramente possuir informações como:

```text
delivery
retirada
presencial
area_entrega
```

A estrutura definitiva ainda precisa de planejamento.

---

# 94. Preço

A IA já pode interpretar conceito de faixa de preço.

Porém o banco ainda não possui base suficiente para aplicar isso com segurança em todas as buscas.

A evolução de preços deverá considerar principalmente produtos.

---

# 95. Estoque

Estoque não deve ser inventado.

Caso seja implementado futuramente, o banco deverá diferenciar claramente:

- disponível;
- indisponível;
- quantidade;
- informação não gerenciada.

---

# 96. Dados Ausentes

Regra de banco e produto:

> NULL ou ausência de dado não deve ser interpretado automaticamente como falso.

Exemplo:

```text
delivery = desconhecido
```

não significa necessariamente:

```text
delivery = não
```

---

# 97. Dados Confiáveis

Um filtro só deve ser ativado quando a informação necessária existir e for confiável.

Fluxo correto:

```text
IA IDENTIFICA INTENÇÃO
        ↓
BACKEND ANALISA CAPACIDADE
        ↓
BANCO POSSUI DADO?
    ↙             ↘
  SIM             NÃO
   ↓               ↓
FILTRA       NÃO INVENTA
```

---

# 98. Supabase Storage e Referências no Banco

O projeto utiliza atualmente o Supabase Storage para armazenamento de imagens.

O bucket confirmado no código atual é:

```text
lojas
```

Esse mesmo bucket é utilizado atualmente para:

- imagem principal de lojas;
- imagens de produtos.

No cadastro de loja, o arquivo é enviado ao Storage e a URL pública resultante é persistida como referência no registro da loja.

No fluxo de galeria de produtos, os arquivos também são enviados ao bucket:

```text
lojas
```

e seus metadados são registrados na tabela:

```text
produto_imagens
```

A tabela `produtos` também mantém referência para a imagem principal do produto quando aplicável.

Storage e banco possuem responsabilidades diferentes:

```text
STORAGE
→ arquivo físico

BANCO
→ URL, metadados, relacionamento e estado
```

A exclusão de registros deve considerar também a remoção do arquivo correspondente no Storage para evitar arquivos órfãos.

---

# 99. Evolução da Gestão de Imagens

Imagens de lojas e produtos já fazem parte da implementação atual.

Com a evolução da plataforma, deverão ser formalizadas regras adicionais para:

- exclusão sincronizada entre banco e Storage;
- arquivos órfãos;
- tamanho máximo;
- formatos permitidos;
- compressão e otimização;
- quantidade máxima por plano;
- imagens de avaliações;
- imagens de perfil, quando aplicável;
- políticas de acesso dos buckets;
- moderação de conteúdo visual quando necessária.

A estrutura de Storage deverá continuar sendo auditada conforme novos tipos de mídia forem adicionados.

---

# 100. Dados de Moderação

Conteúdos que passam por moderação podem necessitar de registros relacionados a:

- resultado;
- categoria;
- data;
- origem;
- ação tomada.

A estrutura deverá evoluir de acordo com necessidades reais de auditoria.

---

# 101. Logs não Devem Substituir Histórico

Logs e tabelas de histórico possuem funções diferentes.

```text
LOG
→ diagnóstico técnico

HISTÓRICO
→ evento de negócio persistente
```

Eventos importantes de assinatura não devem depender apenas de logs da Vercel.

---

# 102. Auditoria

Áreas que poderão necessitar auditoria futura:

- planos;
- pagamentos;
- administração;
- moderação;
- alterações críticas de loja;
- exclusões;
- permissões.

A auditoria deve ser introduzida proporcionalmente ao risco.

---

# 103. Dados Financeiros

O banco interno deve manter informações necessárias para representar a situação da assinatura.

Porém:

> o VemVer não deve inventar o estado de uma transação externa.

Eventos confiáveis do provedor de pagamento devem orientar atualizações financeiras.

---

# 104. Mercado Pago

Dados recebidos do Mercado Pago devem ser validados antes de alterar estados críticos.

Fluxos futuros devem reforçar:

- idempotência;
- identificação única;
- eventos duplicados;
- transições válidas;
- auditoria.

---

# 105. Idempotência

Operações que possam ser repetidas por serviços externos devem ser projetadas para evitar duplicidade.

Exemplo:

```text
MESMO WEBHOOK RECEBIDO 2 VEZES
```

não deve necessariamente causar:

```text
2 ATIVAÇÕES
```

---

# 106. Crons e Banco

Os crons existentes realizam operações relacionadas ao banco.

Entre eles:

```text
verificar-planos
atualizar-scores
```

Esses processos devem permanecer:

- seguros;
- previsíveis;
- idempotentes quando possível;
- auditáveis.

---

# 107. Cron não é Trigger

No modelo atual, o score é atualizado por rotina agendada.

Não existe dependência de trigger automática para executar o recálculo a cada pequena mudança.

Isso reduz processamento imediato desnecessário.

---

# 108. Triggers

Triggers podem ser úteis, mas não devem ser criados sem analisar consequências.

Antes de um trigger:

- qual evento dispara?
- quantas vezes?
- qual custo?
- pode gerar loop?
- pode falhar silenciosamente?
- é melhor usar aplicação ou cron?

---

# 109. Funções com Segurança Elevada

Qualquer futura função:

```text
security definer
```

deverá receber revisão especial.

Quando possível, utilizar privilégio mínimo.

---

# 110. Princípio do Menor Privilégio

Cada usuário, role ou serviço deverá possuir apenas as permissões necessárias.

Exemplo:

```text
CLIENTE
≠
LOJISTA
≠
ADMIN
≠
SERVICE_ROLE
```

---

# 111. Papel `anon`

O papel:

```text
anon
```

não deve receber execução de funções privilegiadas apenas para facilitar desenvolvimento.

---

# 112. Papel `authenticated`

Usuários autenticados podem necessitar de capacidades adicionais.

Porém:

```text
authenticated
```

não significa:

```text
administrador
```

---

# 113. Papel `service_role`

O `service_role` deverá ser utilizado apenas em operações server-side que realmente necessitem de privilégio elevado.

---

# 114. Banco e Frontend

A interface nunca deve depender de uma regra como:

> "não mostramos o botão, então ninguém consegue executar."

Se uma ação precisa ser proibida:

```text
BACKEND / BANCO
```

deve impor a regra.

---

# 115. Tipagem

Com o crescimento do projeto, poderá ser interessante automatizar tipos TypeScript derivados do schema Supabase.

Isso reduz divergências entre:

```text
BANCO
```

e:

```text
TIPOS MANUAIS
```

Essa evolução ainda deverá ser planejada.

---

# 116. Mudança de Tipo de Coluna

Alterar tipos de colunas existentes deve ser tratado como operação potencialmente perigosa.

Antes:

- verificar dados atuais;
- compatibilidade;
- código consumidor;
- rollback;
- migration;
- ambiente de Preview/teste.

---

# 117. Remoção de Coluna

Uma coluna não deve ser removida imediatamente apenas porque parece não ser utilizada.

Processo recomendado:

```text
AUDITAR USO
   ↓
REMOVER DEPENDÊNCIAS
   ↓
DEPLOY
   ↓
CONFIRMAR
   ↓
MIGRATION DE REMOÇÃO
```

---

# 118. Renomear Coluna

Renomeações podem quebrar:

- frontend;
- APIs;
- RPCs;
- funções;
- views;
- migrations futuras.

Devem ser planejadas como mudança de contrato.

---

# 119. Dados de Teste

Registros usados durante desenvolvimento devem ser claramente reconhecíveis.

Dados de teste não devem influenciar decisões comerciais reais quando a plataforma entrar em operação.

---

# 120. Ambiente de Produção

Mudanças estruturais em produção devem possuir rastreabilidade.

Evitar:

```text
ABRIR SQL EDITOR
ALTERAR
ESQUECER
```

Preferir:

```text
CRIAR MIGRATION
REVISAR
APLICAR
VALIDAR
COMMITAR
```

---

# 121. Backups

Estratégias de backup e recuperação deverão receber documentação específica antes de operação comercial crítica.

O fato de utilizar serviço gerenciado não elimina a necessidade de entender:

- retenção;
- recuperação;
- impacto de exclusões;
- procedimentos de emergência.

---

# 122. Recuperação de Desastre

Futuramente deverá existir um procedimento documentado para situações como:

- migration defeituosa;
- exclusão de dados;
- corrupção lógica;
- credencial comprometida;
- falha de integração.

---

# 123. Dados Sensíveis

O banco pode armazenar informações relacionadas aos usuários.

A coleta deve seguir necessidade real.

Evitar armazenar dados excessivos sem finalidade definida.

---

# 124. Privacidade

Dados relacionados a:

- localização;
- histórico;
- comportamento;
- perfil;

deverão receber atenção crescente conforme novas funcionalidades forem implementadas.

---

# 125. Retenção de Dados

O projeto ainda deverá definir políticas formais de retenção para determinadas categorias de dados.

Exemplos:

- logs;
- histórico;
- conta excluída;
- moderação;
- pagamentos.

---

# 126. Exclusão de Conta

Uma futura política completa de exclusão de conta deverá definir:

- o que é removido;
- o que precisa ser preservado;
- dados legais/financeiros;
- avaliações;
- lojas;
- histórico.

Não implementar exclusão profunda sem essa análise.

---

# 127. Performance

Queries importantes deverão ser acompanhadas conforme o volume crescer.

Áreas prioritárias:

- descoberta;
- página da loja;
- produtos;
- dashboard;
- avaliações;
- administração.

---

# 128. Evitar `SELECT *` sem Necessidade

Em APIs, o ideal é buscar apenas os campos realmente necessários quando a situação permitir.

Isso reduz:

- tráfego;
- exposição;
- processamento;
- acoplamento.

---

# 129. RPC de Busca e Seleção

A RPC pode retornar a estrutura de loja, mas a camada backend atual seleciona apenas os campos necessários ao resultado da descoberta.

Esse padrão deve ser preservado.

---

# 130. Limite de Resultados

O backend atualmente limita os resultados finais da busca.

Isso evita retornar listas excessivas ao cliente.

Paginação deverá ser considerada conforme a experiência evoluir.

---

# 131. Paginação

Áreas com crescimento significativo deverão utilizar paginação ou carregamento progressivo.

Exemplos:

- produtos;
- avaliações;
- resultados;
- histórico;
- administração.

---

# 132. Métricas Futuras

Para melhorar o VemVer, o banco poderá futuramente registrar eventos de produto.

Exemplos:

- busca;
- busca sem resultado;
- abertura de loja;
- clique em WhatsApp;
- visualização de produto;
- favorito.

Esses eventos não devem ser adicionados sem estratégia de analytics e privacidade.

---

# 133. Busca sem Resultado

Um futuro registro de buscas sem resultado pode se tornar uma fonte estratégica de informação.

Exemplo:

```text
100 pessoas buscaram:
"ração para gato"

0 lojas encontradas
```

Isso pode indicar oportunidade de aquisição de lojistas.

---

# 134. Analytics ≠ Tabela Principal

Eventos analíticos podem crescer muito.

Não devem necessariamente ser armazenados nas mesmas estruturas transacionais utilizadas pelas funcionalidades principais.

Essa decisão deverá ser tomada quando houver volume real.

---

# 135. Escala por Cidade

Com expansão para várias cidades, consultas devem sempre considerar corretamente o contexto geográfico.

O banco não deve assumir que nomes de lojas são globalmente únicos.

---

# 136. Slugs

Rotas públicas podem utilizar slugs.

A estratégia de unicidade de slugs deverá ser revisada conforme o número de lojas e cidades aumentar.

---

# 137. Identificadores Internos

Regras internas devem preferir IDs estáveis em relações.

Nomes e slugs podem mudar.

---

# 138. Dados de Endereço

O endereço deverá evoluir de um simples texto para estrutura confiável quando necessário.

Possibilidades futuras:

- logradouro;
- número;
- complemento;
- bairro;
- cidade;
- UF;
- CEP;
- latitude;
- longitude.

---

# 139. Geocodificação

A obtenção automática de coordenadas poderá ser adicionada futuramente.

Ela deverá possuir:

- provedor definido;
- validação;
- controle de custo;
- tratamento de erro;
- possibilidade de correção manual.

---

# 140. Qualidade Cadastral

No futuro, o banco poderá possuir indicador de completude cadastral.

Exemplo:

```text
nome        ✅
categoria   ✅
telefone    ✅
endereço    ✅
coordenada  ❌
horário     ❌
```

Isso poderá auxiliar:

- ranking;
- painel do lojista;
- qualidade da plataforma.

---

# 141. Score x Completude

Se a completude cadastral entrar futuramente no score:

> a fórmula deverá ser atualizada em nova migration e registrada nas decisões do projeto.

---

# 142. Alteração da Fórmula de Score

Qualquer mudança importante nos pesos deve registrar:

- fórmula anterior;
- fórmula nova;
- motivo;
- impacto esperado;
- data;
- migration correspondente.

---

# 143. Teste de Migration

Antes de considerar uma migration concluída:

- revisar SQL;
- verificar ambiente correto;
- aplicar;
- confirmar histórico;
- testar comportamento;
- validar aplicação.

---

# 144. Migration e Git

Uma migration aplicada deve ser commitada junto com a alteração que depende dela.

Evitar situação:

```text
CÓDIGO DEPENDE DO BANCO NOVO
```

mas:

```text
MIGRATION NÃO ESTÁ NO REPOSITÓRIO
```

---

# 145. Ordem de Deploy

Mudanças incompatíveis entre código e banco exigem planejamento de ordem.

Em alguns casos:

```text
MIGRATION COMPATÍVEL
        ↓
DEPLOY DO CÓDIGO
        ↓
LIMPEZA FUTURA
```

é mais seguro do que alterar tudo de forma destrutiva em uma única etapa.

---

# 146. Compatibilidade

Quando possível, migrations devem ser projetadas para permitir transição gradual.

Isso reduz risco em produção.

---

# 147. Rollback

Nem toda migration possui rollback simples.

Antes de uma mudança destrutiva:

- considerar backup;
- considerar cópia;
- considerar coluna temporária;
- considerar migration reversa;
- testar.

---

# 148. Naming

Objetos do banco devem utilizar nomes consistentes.

A base atual utiliza predominantemente nomes em português.

Novas estruturas devem preservar coerência, salvo decisão arquitetural formal diferente.

---

# 149. SQL Legível

Funções e migrations deverão priorizar legibilidade.

SQL excessivamente compacto dificulta:

- revisão;
- auditoria;
- manutenção;
- investigação de erros.

---

# 150. Comentários

Comentários em migrations podem ser utilizados quando explicarem decisões que não são óbvias.

Evitar comentários que apenas repetem o SQL.

---

# 151. Documentação da Estrutura

Este arquivo não substitui o schema real.

Ele explica intenção e arquitetura.

Quando houver dúvida sobre:

```text
TIPO EXATO
CONSTRAINT
DEFAULT
ÍNDICE
POLICY
```

consultar:

```text
migrations
```

e o banco real.

---

# 152. Próximas Áreas de Banco

Entre evoluções previstas estão:

```text
horários estruturados
delivery
formas de atendimento
coordenadas completas
preço de produtos
disponibilidade
avaliações avançadas
analytics
notificações
equipes
multiunidade
franquia
```

A ordem seguirá o roadmap.

---

# 153. Não Criar Schema para Ideias Distantes

Uma funcionalidade futura não precisa gerar tabela hoje apenas porque talvez seja usada daqui anos.

Regra:

> modelar quando houver problema suficientemente entendido.

---

# 154. Evitar Coluna Genérica para Tudo

Também devemos evitar estruturas excessivamente genéricas como:

```text
dados JSON com qualquer coisa
```

apenas para fugir de decisões de modelagem.

JSON pode ser útil, mas não substitui esquema estruturado quando os dados possuem regras claras.

---

# 155. JSONB

O PostgreSQL oferece `jsonb`, que poderá ser utilizado quando adequado.

Antes de escolher:

- precisa consultar campos internamente?
- precisa constraint?
- precisa índice?
- estrutura muda frequentemente?
- relacionamento seria melhor?

---

# 156. Tabelas de Domínio

À medida que categorias, planos e configurações amadurecerem, poderá ser apropriado centralizar algumas delas em tabelas específicas.

Essa decisão deverá reduzir duplicação e não aumentar complexidade sem benefício.

---

# 157. Categorias

A estrutura de categorias ainda poderá evoluir.

Hoje existem valores textuais variados nos dados.

Uma futura taxonomia estruturada pode melhorar:

- busca;
- filtros;
- analytics;
- consistência.

---

# 158. Normalização de Categorias

Antes de criar uma taxonomia definitiva, deve-se compreender os segmentos reais que entrarão na plataforma.

Evitar categorias rígidas demais que prejudiquem descoberta.

---

# 159. Sinônimos

Sinônimos de busca podem futuramente ser armazenados ou tratados por outra camada.

Exemplo:

```text
informática
assistência técnica
manutenção de notebook
```

podem possuir relações úteis.

A solução deverá ser escolhida após testes de busca.

---

# 160. Banco e IA

O banco não deve ser remodelado apenas para se adaptar a respostas variáveis da IA.

A IA deve produzir dados estruturados compatíveis com contratos definidos pelo sistema.

---

# 161. Contratos

Quando uma API depende de determinada estrutura do banco, essa relação deve ser compreensível.

Mudanças importantes devem atualizar:

```text
DATABASE.md
API.md
BUSINESS_RULES.md
```

quando aplicável.

---

# 162. Princípio de Segurança

Assumir sempre que:

- APIs serão descobertas;
- IDs poderão ser manipulados;
- usuários enviarão entradas inválidas;
- roles públicas possuem riscos;
- service role é altamente privilegiado.

A segurança deve ser aplicada no servidor e no banco.

---

# 163. Princípio de Integridade

O banco deve impedir estados impossíveis quando isso puder ser feito de forma segura.

Exemplo:

uma avaliação com nota fora da escala definida não deveria depender exclusivamente do frontend para ser impedida.

Constraints poderão ser adicionadas conforme o schema amadurecer.

---

# 164. Constraints

Novas constraints devem considerar dados legados.

Antes de adicionar uma regra rígida:

```text
OS DADOS ATUAIS JÁ CUMPREM?
```

Se não:

```text
CORRIGIR DADOS
        ↓
ADICIONAR CONSTRAINT
```

---

# 165. Defaults

Defaults devem representar um estado realmente seguro.

Um default inadequado pode esconder informação ausente.

Exemplo:

não definir automaticamente:

```text
delivery = false
```

se o significado real for:

```text
ainda não informado
```

---

# 166. Nullable

A decisão entre:

```text
NULL
```

e um valor obrigatório deve representar a realidade do domínio.

Campos ainda desconhecidos podem precisar aceitar ausência até o cadastro ser completado.

---

# 167. Estados Explícitos

Quando um domínio possuir vários estados reais, pode ser melhor representá-los explicitamente.

Exemplo conceitual:

```text
desconhecido
sim
não
```

em vez de forçar:

```text
true / false
```

quando a ausência também possui significado.

---

# 168. Banco como Fundação do Ranking

O ranking depende diretamente da qualidade dos dados.

Sem:

- categoria coerente;
- descrição;
- coordenadas;
- produtos;
- avaliações;

o backend possui menos sinais para decidir.

A melhoria do ranking passa também pela melhoria do banco.

---

# 169. Banco como Fundação da IA

A IA pode compreender:

> "quero um restaurante aberto agora"

Mas sem horários estruturados o sistema não consegue responder com confiança.

Portanto:

```text
IA MELHOR
```

sem:

```text
DADOS MELHORES
```

não resolve todo o problema.

---

# 170. Banco como Ativo Estratégico

Com o crescimento, a qualidade da base local poderá se tornar um dos principais ativos do VemVer.

Dados corretos sobre:

- lojas;
- produtos;
- localização;
- horários;
- avaliações;

aumentam diretamente a utilidade da plataforma.

---

# 171. Governança

Mudanças críticas do banco devem gerar decisão registrada quando alterarem:

- ranking;
- monetização;
- privacidade;
- permissões;
- modelo de produto;
- dados financeiros.

Arquivo relacionado:

```text
../governance/DECISIONS.md
```

---

# 172. Checklist para Alterar o Banco

Antes de uma mudança estrutural importante:

```text
1. Qual problema estamos resolvendo?

2. Qual tabela será alterada?

3. Existe relação com dados atuais?

4. Os dados antigos continuam válidos?

5. Precisamos de migration?

6. Existe risco de perda?

7. Precisamos de índice?

8. Há impacto em RLS?

9. Há impacto em RPC?

10. Há impacto em API?

11. Há impacto em frontend?

12. Há impacto em produção?

13. Como testar?

14. Como reverter?

15. Qual documentação atualizar?
```

---

# 173. Regra Final de Banco

O banco do VemVer deve evoluir de forma:

- rastreável;
- segura;
- incremental;
- documentada;
- compatível com o produto;
- preparada para crescimento.

Nunca devemos considerar o banco apenas um local para guardar campos.

Ele representa:

> a estrutura persistente da realidade que o VemVer utiliza para conectar consumidores ao comércio local.

---

# 174. Relação com Outros Documentos

Este documento deve ser lido junto com:

```text
../00_PROJECT_CONSTITUTION.md

../product/MASTER_DOCUMENT.md
../product/PRODUCT_VISION.md
../product/ROADMAP.md
../product/BUSINESS_RULES.md

ARCHITECTURE.md
API.md
SECURITY.md
DEPLOY.md

../engineering/CODING_STANDARDS.md
../engineering/TEST_PLAN.md
../engineering/CHECKLIST.md

../governance/DECISIONS.md
```

---

# 175. Banco em Uma Frase

> O PostgreSQL do VemVer é a fonte persistente de dados da plataforma, versionada por migrations e acessada através de regras que preservam integridade, segurança e rastreabilidade.

---

# 176. Conclusão

O banco do VemVer já possui uma fundação capaz de sustentar:

- lojas;
- produtos;
- avaliações;
- favoritos;
- planos;
- assinaturas;
- moderação;
- ranking;
- geolocalização;
- descoberta inteligente.

A próxima evolução deverá concentrar-se em melhorar a qualidade e estrutura dos dados necessários para a experiência futura.

Especialmente:

```text
COORDENADAS
HORÁRIOS
FORMAS DE ATENDIMENTO
PRODUTOS
PREÇOS
AVALIAÇÕES
```

A inteligência do VemVer será tão confiável quanto os dados que a sustentam.

Por isso:

> melhorar o banco não significa apenas adicionar tabelas. Significa representar melhor a realidade que o produto precisa compreender.
