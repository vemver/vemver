# VemVer — Regras Oficiais de Negócio

## Documento

**Projeto:** VemVer
**Documento:** Regras Oficiais de Negócio
**Versão:** 1.0.0
**Status:** Ativo
**Última atualização:** 17/08/2026

---

# 1. Objetivo

Este documento registra as regras de negócio do VemVer.

Ele deve responder questões como:

- quem pode realizar determinada ação;
- quais limites existem;
- como lojas participam da plataforma;
- como avaliações funcionam;
- como planos alteram capacidades;
- como assinaturas vencem;
- como resultados são ordenados;
- como conteúdo é moderado;
- como recursos pagos podem influenciar a plataforma;
- quais comportamentos são permitidos ou proibidos.

Detalhes exclusivamente técnicos devem permanecer nos documentos de arquitetura.

---

# 2. Princípio Geral

As regras do VemVer devem preservar quatro partes:

```text
CONSUMIDOR
     +
LOJISTA
     +
PLATAFORMA
     +
SUSTENTABILIDADE DO NEGÓCIO
```

Nenhuma dessas partes deve ser tratada isoladamente.

---

# 3. Princípio de Confiança

O VemVer depende da confiança dos usuários.

Portanto:

> informação relevante e verdadeira deve possuir prioridade sobre manipulação artificial do resultado.

---

# 4. Relevância Antes da Monetização

Recursos pagos podem aumentar exposição.

Porém:

```text
PAGAR
```

não deve significar:

```text
APARECER EM QUALQUER BUSCA
```

Uma loja patrocinada irrelevante não deve superar uma loja realmente compatível com o que o consumidor procurou.

---

# 5. Não Inventar Informações

O VemVer não deverá afirmar uma informação como verdadeira quando não possuir dados confiáveis.

Exemplos:

```text
delivery

aberto agora

estoque

preço contextual
```

Se a informação não for conhecida:

```text
DESCONHECIDO
```

é preferível a dado inventado.

---

# 6. Tipos Gerais de Usuário

O sistema possui experiências destinadas principalmente a:

```text
CONSUMIDOR
```

e:

```text
LOJISTA
```

Além disso, existem funções administrativas da plataforma.

---

# 7. Consumidor

O consumidor utiliza o VemVer para:

- descobrir estabelecimentos;
- procurar produtos e serviços;
- visualizar lojas;
- utilizar localização quando desejar;
- favoritar;
- avaliar;
- acessar histórico e recursos relacionados à conta.

A disponibilidade exata de cada recurso deve acompanhar a implementação real.

---

# 8. Lojista

O lojista utiliza o VemVer para administrar sua presença comercial.

Isso pode incluir:

- cadastrar loja;
- editar informações permitidas;
- cadastrar produtos;
- acompanhar plano;
- acompanhar limites;
- visualizar métricas disponíveis;
- contratar ou solicitar recursos comerciais.

---

# 9. Administrador

O administrador da plataforma possui responsabilidades diferentes das de consumidores e lojistas.

Privilégios administrativos não podem ser concedidos apenas porque um usuário conhece uma URL administrativa.

---

# 10. Autenticação

Operações pessoais ou protegidas podem exigir usuário autenticado.

Exemplos:

- painel do cliente;
- painel do lojista;
- favoritos;
- avaliações vinculadas a usuário;
- gerenciamento de loja;
- gerenciamento de produtos;
- operações administrativas.

---

# 11. Autenticação não é Autorização

Estar logado responde:

```text
QUEM É O USUÁRIO?
```

Não responde automaticamente:

```text
ELE PODE EXECUTAR ESSA AÇÃO?
```

---

# 12. Propriedade da Loja

Quando uma operação depende de propriedade:

```text
USUÁRIO AUTENTICADO
        ↓
LOJA
        ↓
PERTENCE AO USUÁRIO?
```

deve ser validado.

---

# 13. ID não Prova Propriedade

Receber:

```text
loja_id = 7
```

não significa que o usuário pode alterar a loja 7.

IDs enviados pelo navegador devem ser considerados manipuláveis.

---

# 14. `user_id`

O cliente não deve possuir liberdade para escolher arbitrariamente o proprietário de um registro sensível.

Quando possível, identidade deve ser derivada da sessão autenticada.

---

# 15. Campos Administrativos

Campos como:

```text
premium

patrocinado

score

status

plano

user_id
```

não devem ser livremente controláveis por um lojista através de requests manipulados.

---

# 16. Cadastro de Loja

Um lojista pode cadastrar loja quando:

- estiver autorizado;
- respeitar os limites de seu plano;
- fornecer os campos obrigatórios;
- o conteúdo passar pelas validações aplicáveis.

---

# 17. Limite de Lojas

O número de lojas permitido pode variar conforme plano.

A interface pode informar o limite, mas a regra deve ser protegida no backend quando a operação for crítica.

---

# 18. Loja Acima do Limite

Quando o limite de lojas for atingido:

```text
NOVA LOJA
```

deve ser bloqueada ou direcionada ao fluxo comercial apropriado.

---

# 19. Solicitação de Plano

Planos que exijam atendimento, negociação ou configuração específica podem utilizar fluxo de solicitação em vez de ativação automática.

---

# 20. Estado da Loja

Lojas podem possuir diferentes estados administrativos.

Um estado conhecido atualmente é:

```text
em_analise
```

e a descoberta utiliza lojas:

```text
aprovadas
```

---

# 21. Loja Ativa

A flag:

```text
ativo
```

indica participação operacional do estabelecimento conforme a regra aplicada.

---

# 22. Descoberta Pública

A busca pública atual considera como candidatos lojas que atendam condições como:

```text
ativo = true
```

e:

```text
status = 'aprovada'
```

---

# 23. Loja Inativa

Uma loja inativa não deve aparecer na descoberta pública atual.

---

# 24. Loja Não Aprovada

Uma loja ainda não aprovada não deve participar da busca pública atual.

---

# 25. Dados da Loja

Uma loja pode possuir dados como:

- nome;
- categoria;
- descrição;
- cidade;
- UF;
- endereço;
- WhatsApp;
- Instagram;
- imagem;
- latitude;
- longitude.

Nem todos precisam estar obrigatoriamente preenchidos em todos os registros antigos.

---

# 26. Qualidade dos Dados

À medida que o produto amadurecer, campos importantes deverão possuir dados mais estruturados.

Exemplos futuros:

- horário;
- delivery;
- formas de atendimento;
- faixa de preço;
- estoque.

---

# 27. Cidade

Cidade é uma dimensão importante da descoberta.

O projeto inicia sua validação local com foco em Joinville.

---

# 28. UF

UF complementa o contexto territorial.

Quando fornecida em APIs atuais:

```text
2 letras
```

é o padrão esperado.

---

# 29. Expansão Territorial

O modelo deverá permitir:

```text
UMA PLATAFORMA
+
MÚLTIPLAS CIDADES
```

sem recriar o produto para cada cidade.

---

# 30. Crescimento Cidade por Cidade

A estratégia de expansão deverá priorizar densidade local.

Conceitualmente:

```text
VALIDAR CIDADE
     ↓
AUMENTAR DENSIDADE
     ↓
APRENDER
     ↓
EXPANDIR
```

---

# 31. Busca Inteligente

O consumidor pode informar sua necessidade em linguagem natural.

Exemplo:

```text
Quero açaí perto de mim.
```

---

# 32. Interpretação pela IA

A IA pode interpretar elementos como:

- termo;
- categoria;
- proximidade;
- intenção de delivery;
- aberto agora;
- preço.

---

# 33. IA não Decide a Regra Final

A IA não possui autoridade para decidir:

- quem pode acessar;
- qual loja pertence a quem;
- qual plano está pago;
- qual pagamento foi aprovado;
- qual score final deve ser aplicado;
- quais dados existem no banco.

---

# 34. Busca no Banco

Após a interpretação:

```text
BACKEND
```

consulta os dados reais.

---

# 35. Critérios Atuais de Busca

A busca considera principalmente:

```text
nome

categoria

descrição
```

---

# 36. Busca sem Acentos

Diferenças simples de acentuação não devem impedir descoberta.

Exemplo:

```text
acai
```

deve poder localizar:

```text
Açaí
```

quando os demais critérios forem compatíveis.

---

# 37. Texto Original

A busca sem acentos não altera a forma correta como o dado é armazenado ou exibido.

---

# 38. Palavras Genéricas

Termos muito genéricos podem ser removidos dos critérios quando não agregam significado.

Exemplos:

```text
loja

estabelecimento

local
```

---

# 39. Limpeza de Busca

A limpeza textual deve preservar palavras importantes.

A lista de termos genéricos não deve crescer arbitrariamente.

---

# 40. Relevância Textual

A busca atual calcula relevância de acordo com o tipo de correspondência.

---

# 41. Relevância por Nome

Pesos atuais:

```text
nome exato
+100

nome começa com
+80

nome contém
+60
```

---

# 42. Relevância por Categoria

Pesos atuais:

```text
categoria exata
+90

categoria contém
+70
```

---

# 43. Relevância por Descrição

Correspondência atual:

```text
descrição contém
+25
```

---

# 44. Evolução dos Pesos

Esses pesos podem evoluir.

Mudanças relevantes devem ser testadas e documentadas.

---

# 45. Ranking Atual

Depois da busca, a ordenação atual segue:

```text
1. relevância textual

2. distância, quando a proximidade foi solicitada

3. score

4. nome
```

---

# 46. Nome como Desempate

Quando os sinais anteriores forem equivalentes, o nome pode atuar como critério determinístico de desempate.

---

# 47. Proximidade

Distância ganha importância quando o usuário demonstra intenção de:

```text
perto de mim
```

ou equivalente.

---

# 48. Distância não Substitui Relevância

Uma loja muito próxima, mas totalmente incompatível com o pedido, não deve superar uma loja relevante apenas por distância.

---

# 49. Coordenadas do Usuário

A localização pode ser utilizada quando:

- o usuário autorizar;
- coordenadas válidas estiverem disponíveis.

---

# 50. Coordenadas da Loja

Uma loja pode possuir:

```text
latitude
longitude
```

---

# 51. Loja sem Coordenadas

Ausência de coordenadas não remove automaticamente a loja da busca.

---

# 52. Distância Desconhecida

Quando não for possível calcular:

```text
distanciaKm = null
```

---

# 53. Distância Zero

Não utilizar:

```text
0 km
```

para representar distância desconhecida.

Zero significa proximidade real praticamente no mesmo ponto.

---

# 54. Empate com Proximidade

Quando o consumidor pediu proximidade e a relevância é equivalente:

- distância conhecida pode ordenar lojas;
- lojas sem distância conhecida continuam podendo participar depois das lojas comparáveis com distância conhecida.

---

# 55. Limite Atual da Descoberta

O fluxo atual retorna no máximo:

```text
20 resultados
```

depois da ordenação.

---

# 56. Futuro da Paginação

Quando necessário, esse limite poderá evoluir para:

- paginação;
- carregamento progressivo;
- estratégia de busca mais avançada.

---

# 57. Score da Loja

O score é um sinal diferente da relevância textual.

---

# 58. Finalidade do Score

O score ajuda a representar sinais como:

- plano comercial;
- atividade;
- produtos;
- favoritos;
- avaliações;
- visualizações.

---

# 59. Score não Representa Compatibilidade

Uma loja com score alto pode continuar irrelevante para determinada busca.

---

# 60. Base Comercial Atual do Score

A fórmula atual considera:

```text
patrocinado = true
→ 60 pontos

senão premium = true
→ 30 pontos

senão
→ 0 pontos
```

---

# 61. Premium e Patrocinado não Somam a Base

A regra atual utiliza:

```text
CASE
```

Portanto:

```text
Patrocinado + Premium
```

não significa automaticamente:

```text
90 pontos
```

na base comercial.

---

# 62. Visualizações

A fórmula atual utiliza contribuição limitada baseada em visualizações.

Conceitualmente:

```text
min(visualizacoes, 500) / 10
```

---

# 63. Produtos Ativos

Produtos ativos contribuem para o score até o limite definido na fórmula atual.

Conceitualmente:

```text
min(produtos ativos, 30)
```

---

# 64. Favoritos

Favoritos também contribuem.

Conceitualmente:

```text
min(favoritos × 2, 50)
```

---

# 65. Avaliações

Avaliações aprovadas contribuem de acordo com média de nota.

Conceitualmente:

```text
min(média da nota × 5, 25)
```

---

# 66. Alteração do Score

Mudança relevante de pesos precisa atualizar:

- regra de negócio;
- documentação de banco;
- decisões quando estratégica;
- testes.

---

# 67. Atualização Automática do Score

O score é recalculado através de rotina automatizada.

---

# 68. Patrocinado

Patrocinado é um recurso comercial.

Pode influenciar o score e exposição.

---

# 69. Regra do Patrocinado

Patrocinado não possui direito de aparecer em busca irrelevante.

---

# 70. Premium

Premium é um plano/recurso comercial que pode conceder benefícios definidos pelo catálogo de planos.

---

# 71. Plano Gratuito

O plano gratuito deve permitir participação básica na plataforma dentro de seus limites.

---

# 72. Planos Conhecidos

O catálogo atual ou planejado possui conceitos como:

```text
Grátis

Premium

Patrocinado

Multiunidade

Franquia
```

A disponibilidade comercial exata deve acompanhar o código e configuração reais.

---

# 73. Planos Futuros

A existência documental de um plano planejado não significa que todos os fluxos de contratação já estejam implementados.

---

# 74. Limites por Plano

Planos podem alterar:

- número de lojas;
- número de produtos;
- número de imagens;
- exposição;
- estatísticas;
- recursos promocionais.

Os valores exatos devem vir da configuração real.

---

# 75. Não Confiar no Frontend para Plano

O cliente não pode simplesmente enviar:

```json
{
  "plano": "premium"
}
```

e transformar isso em autorização para recursos pagos.

---

# 76. Contratação

Fluxos pagos precisam confirmar a transação por meios confiáveis.

---

# 77. Mercado Pago

Mercado Pago é o provedor de pagamento atualmente integrado.

---

# 78. Preço

Preço de plano não deve ser confiado cegamente ao navegador.

---

# 79. Regra Financeira

O backend deve validar:

- plano;
- loja;
- usuário;
- valor;
- período;

conforme o contrato real implementado.

---

# 80. Pagamento Aprovado

A aplicação não deve considerar um plano pago somente porque o frontend informou:

```text
pago = true
```

---

# 81. Webhook

O webhook do Mercado Pago participa do fluxo de atualização financeira.

---

# 82. Repetição de Webhook

Eventos podem ser reenviados.

Portanto, ativações não devem ser duplicadas indevidamente.

---

# 83. Idempotência Financeira

Idempotência do webhook e dos fluxos de ativação deve receber atenção prioritária antes de maior escala comercial.

---

# 84. Auditoria Financeira

Detalhes exatos da integração precisam ser auditados diretamente no código sempre que houver mudança.

Não inventar contrato financeiro a partir apenas da documentação.

---

# 85. Assinatura

Uma assinatura possui ciclo de vida.

Podem existir estados relacionados a:

- ativa;
- próxima do vencimento;
- vencida;
- cortesia;
- retorno ao gratuito.

---

# 86. Vencimento

O sistema possui rotina para verificar vencimentos periodicamente.

---

# 87. Avisos de Vencimento

O fluxo atual foi implementado/testado considerando avisos em:

```text
7 dias antes

3 dias antes

1 dia antes
```

---

# 88. Cortesia

Após vencimento, o fluxo pode iniciar período de cortesia conforme a regra atualmente implementada.

---

# 89. Encerramento da Cortesia

Quando a cortesia termina sem regularização:

```text
PLANO PAGO
   ↓
RETORNO AO GRATUITO
```

conforme o fluxo existente.

---

# 90. Cron de Planos

A verificação ocorre através de:

```text
/api/cron/verificar-planos
```

---

# 91. Execução do Cron

O cron não é uma ação pública do usuário.

Sua execução precisa ser autorizada.

---

# 92. Histórico de Assinaturas

Eventos relevantes de assinatura devem possuir rastreabilidade quando aplicável.

---

# 93. Histórico não é Apenas Log

Mudanças comerciais importantes não devem depender exclusivamente de:

```text
console.log
```

---

# 94. Produtos

Lojas podem possuir produtos associados.

---

# 95. Propriedade do Produto

Um lojista não deve conseguir alterar produto pertencente à loja de outro usuário.

---

# 96. Produto Ativo

Status de atividade do produto deve ser respeitado onde a regra exigir exposição pública.

---

# 97. Produtos e Score

Produtos ativos participam da fórmula atual de score.

---

# 98. Produtos na Descoberta

A busca deverá evoluir para reconhecer produtos de forma mais profunda.

Status:

```text
PLANEJADO / EM EVOLUÇÃO
```

---

# 99. Futuro Fluxo por Produto

Direção:

```text
"quero tênis infantil"
        ↓
PRODUTOS
        ↓
LOJAS
        ↓
RANKING LOCAL
```

---

# 100. Avaliações

Avaliações fazem parte da reputação das lojas.

---

# 101. Nota

A escala planejada/atual do domínio de avaliação utiliza:

```text
1 a 5 estrelas
```

---

# 102. Comentário

A avaliação pode incluir comentário textual conforme a interface disponível.

---

# 103. Avaliação Aprovada

Somente avaliações consideradas aprovadas participam da média utilizada pelo score atual.

---

# 104. Avaliação e Propriedade

Uma avaliação pertence ao usuário que a criou.

Futuras operações de editar ou excluir devem respeitar essa propriedade.

---

# 105. Duplicidade de Avaliação

A política definitiva sobre múltiplas avaliações do mesmo usuário para a mesma loja deve ser mantida de acordo com a implementação real.

Caso a regra ainda não esteja consolidada:

> não inventar uma política documental.

---

# 106. Moderação de Avaliação

Comentários e outros conteúdos enviados por usuários podem ser submetidos à moderação conforme o fluxo implementado.

---

# 107. UX Planejada da Avaliação

A direção futura definida é:

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
      ↓
PUBLICAR
```

---

# 108. Permanência na Página

Ao avaliar, o usuário não deverá precisar abandonar desnecessariamente a página da loja.

---

# 109. Evoluções Futuras da Avaliação

Podem incluir:

- fotos;
- edição;
- exclusão;
- resposta do estabelecimento;
- mecanismos adicionais de confiança.

---

# 110. Favoritos

Usuários autenticados podem possuir favoritos.

---

# 111. Propriedade do Favorito

Favoritos pertencem ao usuário correspondente.

Um usuário não deve modificar favoritos de outro.

---

# 112. Favorito Duplicado

A aplicação deve evitar ou tratar adequadamente duplicidades da mesma relação usuário-loja.

---

# 113. Favoritos e Score

A quantidade de favoritos participa da fórmula atual do score da loja.

---

# 114. Histórico do Cliente

O domínio do cliente pode manter informações de histórico conforme as funcionalidades implementadas.

Dados pessoais de um usuário não devem ser expostos a outro.

---

# 115. Perfil

Informações de perfil são vinculadas à conta correspondente.

---

# 116. Moderação

O VemVer utiliza moderação automática para reduzir conteúdo inadequado.

---

# 117. Conteúdo Moderado

Fluxos textuais relevantes podem utilizar:

```text
moderarTexto()
```

conforme implementação.

---

# 118. Moderação não é Autorização

Um texto ser permitido pela moderação não significa que o usuário possui direito de publicá-lo naquele recurso.

---

# 119. Moderação não Garante Verdade

O fato de conteúdo não ser sinalizado não significa que todas as afirmações nele são verdadeiras.

---

# 120. Falha da Moderação

Falha de serviço externo deve ser tratada de forma controlada.

A política de fail-open ou fail-closed deve ser definida explicitamente para cada fluxo crítico.

---

# 121. API de Moderação

A rota atual:

```text
POST /api/moderar-texto
```

possui limites de segurança.

---

# 122. Limite de Texto da Moderação

Atual:

```text
2.000 caracteres
```

---

# 123. Limite de Body da Moderação

Atual:

```text
8.000 bytes
```

---

# 124. API de Busca Inteligente

A rota atual:

```text
POST /api/entender-intencao
```

também possui limites.

---

# 125. Limite da Mensagem

Atual:

```text
300 caracteres
```

---

# 126. Limite de Body da Busca

Atual:

```text
8.000 bytes
```

---

# 127. Cidade na Busca

Quando enviada:

```text
máximo 100 caracteres
```

---

# 128. UF na Busca

Quando enviada:

```text
2 letras
```

---

# 129. Latitude

Intervalo válido:

```text
-90 até 90
```

---

# 130. Longitude

Intervalo válido:

```text
-180 até 180
```

---

# 131. Coordenadas em Conjunto

Latitude e longitude precisam chegar juntas no contrato atual.

---

# 132. JSON

As APIs JSON críticas devem rejeitar payload malformado.

---

# 133. Content-Type

Rotas que exigem JSON podem rejeitar Content-Type incompatível.

---

# 134. Erro Seguro

Erros internos não devem expor ao usuário:

- stack;
- erro bruto do provedor;
- secret;
- query;
- detalhes internos desnecessários.

---

# 135. Rate Limit

As rotas de IA possuem proteção adicional na infraestrutura.

---

# 136. Rotas do Rate Limit

Atualmente:

```text
POST /api/entender-intencao

POST /api/moderar-texto
```

---

# 137. Regra Atual do Rate Limit

```text
10 requisições

60 segundos

por IP
```

---

# 138. Limite Compartilhado

O limite atual é compartilhado pelas duas rotas.

Exemplo:

```text
6 buscas
+
4 moderações
=
10 chamadas
```

na mesma janela por IP.

---

# 139. Excesso de Requisições

Quando a proteção é acionada:

```text
429 Too Many Requests
```

é o comportamento esperado.

---

# 140. Endpoint de Teste Removido

A rota:

```text
/api/testar-moderacao
```

não faz parte da produção atual.

---

# 141. Comportamento do Endpoint Removido

Esperado:

```text
404
```

---

# 142. Crons

Rotas de cron são internas à automação da plataforma.

Não devem ser tratadas como endpoints públicos comuns.

---

# 143. Proteção de Cron

Rotas de cron devem possuir autorização server-side antes de executar operações privilegiadas.

No estado atual auditado:

```text
/api/cron/atualizar-scores
→ protegido por CRON_SECRET

/api/cron/verificar-planos
→ ainda não possui verificação explícita de CRON_SECRET no Route Handler
```

Portanto, a proteção do cron de planos permanece como uma pendência de segurança.

A regra de negócio continua sendo:

> rotinas internas de automação não devem ficar disponíveis para execução arbitrária por clientes externos.

---

# 144. Cron de Score

Endpoint:

```text
/api/cron/atualizar-scores
```

---

# 145. Cron de Planos

Endpoint:

```text
/api/cron/verificar-planos
```

---

# 146. Idempotência de Cron

Executar uma rotina mais de uma vez não deve corromper o estado.

---

# 147. Admin

Operações administrativas precisam validar privilégios reais.

---

# 148. Interface não é Segurança

Esconder um botão administrativo não substitui autorização no servidor.

---

# 149. Exclusão

Operações destrutivas precisam confirmar:

- identidade;
- autorização;
- recurso correto.

---

# 150. Exclusão de Loja

Se um lojista puder excluir sua loja, a operação deve validar propriedade.

---

# 151. Dados Relacionados

Antes de exclusões definitivas, considerar:

- produtos;
- avaliações;
- favoritos;
- histórico;
- pagamentos;
- assinaturas.

---

# 152. Preferência por Estados quando Necessário

Em algumas situações, desativar pode ser mais adequado do que apagar definitivamente.

A decisão depende do domínio.

---

# 153. Segurança de Dados

O VemVer deve buscar coletar somente os dados necessários para operar seus recursos.

---

# 154. Dados de Localização

Localização do consumidor deve ser utilizada apenas quando necessária para a experiência correspondente.

---

# 155. Permissão de Localização

Recusa de geolocalização não deve impedir todo o uso da plataforma.

O usuário ainda poderá buscar utilizando contexto disponível.

---

# 156. Dados do Lojista

Dados administrativos do lojista não devem ser expostos publicamente sem necessidade.

---

# 157. Dados Públicos da Loja

Informações destinadas à descoberta podem ser públicas conforme regra do produto.

---

# 158. WhatsApp

Número comercial informado para contato pode ser exibido quando fizer parte da presença pública da loja.

---

# 159. Instagram

O mesmo princípio se aplica a perfil comercial informado para exposição pública.

---

# 160. Endereço

A exposição do endereço deve respeitar a natureza comercial do cadastro e a configuração futura do produto.

---

# 161. Imagens

Imagens vinculadas a lojas ou produtos devem pertencer ao recurso correto.

---

# 162. Upload

Uploads devem obedecer regras de:

- autorização;
- tipo;
- tamanho;
- associação ao recurso.

Os limites exatos precisam acompanhar a implementação real.

---

# 163. Tema

A aparência não altera regras de negócio.

---

# 164. Temas Futuros

A direção definida é:

```text
Automático

Claro

Escuro
```

---

# 165. Tema Automático

Deverá acompanhar a preferência do dispositivo quando implementado.

---

# 166. Tema Claro e Escuro

A troca de tema não pode alterar:

- plano;
- autorização;
- ranking;
- busca;
- pagamento;
- dados.

---

# 167. App Cliente

Existe visão futura para aplicativo Cliente.

---

# 168. App Lojista

Existe visão futura para aplicativo Lojista.

---

# 169. Apps não São Confiáveis

Aplicativos instalados no dispositivo continuam sendo clientes externos.

Nenhum app poderá possuir segredo administrativo.

---

# 170. Backend Compartilhado

Web e aplicativos futuros deverão utilizar regras centrais do backend quando apropriado.

---

# 171. Produto Futuro não é Regra Atual

Uma funcionalidade planejada não deve ser tratada como já disponível.

---

# 172. Estados Documentais

Utilizar expressões claras:

```text
ATUAL

EM EVOLUÇÃO

PLANEJADO

FUTURO

EM AUDITORIA
```

---

# 173. Aberto Agora

Status atual:

```text
INTERPRETADO PELA IA
```

mas não deve ser aplicado como filtro real até existir modelagem confiável de horários.

---

# 174. Horário de Funcionamento

Para implementação futura será necessário considerar:

- dia da semana;
- abertura;
- fechamento;
- intervalo;
- exceção;
- feriado;
- timezone.

---

# 175. Delivery

Status atual:

```text
INTENÇÃO PODE SER IDENTIFICADA
```

mas não deve ser utilizado como fato para lojas sem dado estruturado confiável.

---

# 176. Preço

A intenção de preço pode ser interpretada.

A filtragem real depende de dados confiáveis e regra futura.

---

# 177. Estoque

Não afirmar disponibilidade de produto sem fonte atualizada.

---

# 178. Produto Indisponível

Quando estoque estruturado existir futuramente, o comportamento deverá diferenciar:

```text
produto cadastrado
```

de:

```text
produto disponível agora
```

---

# 179. Publicidade

Toda evolução publicitária deve preservar transparência e relevância.

---

# 180. Patrocínio

Patrocínio é vantagem comercial.

Não é garantia de primeiro lugar absoluto.

---

# 181. Qualidade de Resultado

A métrica de sucesso da busca não deve ser apenas:

```text
quantas lojas foram retornadas
```

mas também:

```text
as lojas realmente ajudam o consumidor?
```

---

# 182. Busca sem Resultado

Quando não houver correspondência confiável, a plataforma deve evitar inventar loja ou informação.

---

# 183. Futuro Fallback de Busca

O sistema poderá sugerir:

- termo semelhante;
- categoria;
- cidade;
- ampliação de raio;

desde que deixe claro o que está fazendo.

---

# 184. Conteúdo Comercial

Descrições de lojas e produtos devem representar o estabelecimento de maneira legítima.

---

# 185. Spam

Conteúdo repetitivo ou manipulador pode ser moderado ou restringido.

---

# 186. Fraude

Comportamentos fraudulentos podem resultar em bloqueio, suspensão ou análise conforme políticas futuras.

---

# 187. Avaliação Manipulada

Mecanismos futuros deverão reduzir:

- avaliações falsas;
- spam;
- manipulação coordenada;
- abuso.

---

# 188. Score Manipulado

Usuários não devem possuir acesso direto para editar o score.

---

# 189. Visualizações

Contagens utilizadas em ranking devem evoluir com mecanismos contra manipulação caso o volume justifique.

---

# 190. Favoritos Manipulados

O mesmo princípio se aplica a sinais de favoritos.

---

# 191. Métricas

Métricas exibidas ao lojista devem vir de dados reais.

---

# 192. Estatísticas

Planos podem liberar diferentes níveis de estatísticas.

Os detalhes precisam acompanhar o catálogo real.

---

# 193. Plano Multiunidade

Conceitualmente destinado a operações que precisam gerenciar múltiplas unidades.

Status e regras exatas devem acompanhar a implementação.

---

# 194. Franquia

Conceitualmente destinada a redes/franquias com necessidades superiores de gestão.

Status e regras exatas devem acompanhar a implementação.

---

# 195. Upgrade

Upgrade pode aumentar recursos disponíveis.

As regras financeiras específicas precisam ser verificadas na implementação real antes de serem documentadas como definitivas.

---

# 196. Downgrade

Downgrade precisa considerar recursos acima do novo limite.

A política definitiva deve ser explicitada antes de automação completa.

---

# 197. Mudança de Período

Planos podem possuir períodos como:

- mensal;
- trimestral;
- anual;

conforme catálogo disponível.

---

# 198. Compensação Financeira

Qualquer compensação de valor em upgrade/downgrade deve ser calculada no servidor e documentada quando a regra estiver consolidada.

---

# 199. Vencimento não Apaga Dados Arbitrariamente

O vencimento de um plano não deve apagar automaticamente dados comerciais importantes sem política explícita.

---

# 200. Retorno ao Gratuito

Ao retornar ao plano gratuito, recursos acima do limite precisam seguir uma política previsível.

A implementação precisa evitar perda silenciosa de dados.

---

# 201. Notificações

Avisos de assinatura podem utilizar canais definidos pela plataforma.

O canal exato deve acompanhar a implementação real.

---

# 202. Histórico de Planos

Mudanças comerciais importantes devem ser rastreáveis.

---

# 203. Segurança Financeira

Mudanças em:

- plano;
- preço;
- pagamento;
- vencimento;

são consideradas de alta criticidade.

---

# 204. Testes Financeiros

Fluxos financeiros precisam testar:

```text
SUCESSO
+
FALHA
+
DUPLICIDADE
+
MANIPULAÇÃO
```

---

# 205. Regra de Desenvolvimento

Uma regra nova deve ser definida antes de espalhar implementações diferentes pelo sistema.

---

# 206. Autoridade da Regra

Conceitualmente:

```text
INTERFACE
→ ajuda o usuário

BACKEND
→ aplica a regra

BANCO
→ reforça integridade quando adequado
```

---

# 207. Frontend Pode Validar

O frontend pode validar para UX.

Isso não substitui validação server-side.

---

# 208. Banco Pode Restringir

Constraints, foreign keys e RLS podem reforçar regras importantes.

---

# 209. Migration

Regra estrutural de banco nova deve utilizar nova migration.

---

# 210. Migration Aplicada

Não editar migration histórica aplicada para esconder mudança posterior.

---

# 211. Logs

Logs técnicos ajudam diagnóstico.

Eles não devem ser confundidos com estados de negócio.

---

# 212. Observabilidade

Quanto mais crítica a regra, maior a necessidade de perceber rapidamente falhas em produção.

---

# 213. Erro Externo

Falha de serviço externo não deve produzir estado comercial falso.

---

# 214. OpenAI Indisponível

Uma falha da OpenAI não deve criar dados inventados.

---

# 215. Supabase Indisponível

Falha do banco não deve ser tratada como lista vazia verdadeira quando houver diferença semântica importante.

---

# 216. Mercado Pago Indisponível

Falha do provedor não significa pagamento aprovado.

---

# 217. Vercel

Vercel é infraestrutura.

Uma resposta:

```text
Deployment Ready
```

não muda regra de negócio.

---

# 218. Produção

Uma feature comercial só deve ser tratada como disponível quando estiver efetivamente publicada e validada.

---

# 219. Changelog

Mudanças relevantes de regra devem considerar atualização de:

```text
CHANGELOG.md
```

---

# 220. Decisions

Mudanças estratégicas devem considerar:

```text
DECISIONS.md
```

---

# 221. Roadmap

Funcionalidade futura deve permanecer no:

```text
ROADMAP.md
```

até sua evolução real.

---

# 222. Product Vision

A visão define direção.

Não deve ser confundida com estado atual.

---

# 223. Conflito entre Documentação e Código

Quando houver divergência:

```text
AUDITAR O SISTEMA REAL
```

e corrigir a documentação.

---

# 224. Não Alterar Regra por Acidente

Refactor técnico não deve modificar regra de negócio silenciosamente.

---

# 225. Mudança de Regra

Quando o comportamento mudar deliberadamente:

- documentar;
- testar;
- revisar impactos;
- atualizar Changelog quando relevante.

---

# 226. Dados Legados

Novas regras devem considerar registros existentes.

---

# 227. Compatibilidade

Não assumir que todos os dados antigos possuem campos introduzidos posteriormente.

---

# 228. Valores Desconhecidos

`null` pode ter significado diferente de:

```text
false
```

---

# 229. Exemplo de `null`

```text
delivery = null
```

pode representar:

```text
NÃO SABEMOS
```

enquanto:

```text
delivery = false
```

representaria:

```text
NÃO OFERECE
```

quando essa modelagem existir.

---

# 230. Regra de Dados

Ausência de informação não deve ser convertida automaticamente em informação negativa.

---

# 231. Confiança do Consumidor

A plataforma deve priorizar respostas que possam ser justificadas pelos dados existentes.

---

# 232. Confiança do Lojista

Lojistas precisam entender que vantagens comerciais operam dentro de regras, não como manipulação ilimitada do ranking.

---

# 233. Sustentabilidade

Monetização é necessária para a sustentabilidade do VemVer.

Ela deve ser construída sem comprometer a utilidade principal da plataforma.

---

# 234. Efeito de Rede Local

Quanto mais estabelecimentos relevantes e dados de qualidade existirem em uma cidade:

```text
MELHOR A DESCOBERTA
```

---

# 235. Densidade

Expansão sem densidade pode produzir experiência ruim.

Por isso, quantidade de cidades não deve ser a única métrica.

---

# 236. Categorias

Categorias ajudam organização e relevância.

Dados inconsistentes de categoria devem ser progressivamente padronizados.

---

# 237. Taxonomia Futura

Com escala maior, poderá existir taxonomia mais estruturada de:

- categorias;
- subcategorias;
- produtos;
- serviços.

---

# 238. IA e Taxonomia

IA pode auxiliar interpretação.

A estrutura oficial continua pertencendo ao sistema.

---

# 239. Loja Encontrada por Produto

Futuramente um produto poderá aumentar a relevância de sua loja para uma busca específica.

---

# 240. Produto não Deve Transformar Loja Irrelevante

A relação produto-loja precisa ser válida.

---

# 241. Resultados Patrocinados

Se futuramente houver identificação visual específica para conteúdo patrocinado, ela deve ser transparente ao consumidor.

---

# 242. Promoções

Promoções futuras precisam possuir:

- origem;
- validade;
- loja;
- condições;
- estado.

---

# 243. Promoção Expirada

Não deve permanecer apresentada como ativa quando existir data estruturada de validade.

---

# 244. Informações Temporais

Datas e horários precisam considerar timezone quando introduzidos.

---

# 245. Brasil

A experiência principal inicial utiliza formatos adequados ao mercado brasileiro.

Exemplos:

```text
R$ 49,90

17/08/2026
```

quando apropriado.

---

# 246. Termos de Uso

O projeto possui fluxo/documento relacionado a termos.

Aceites obrigatórios devem ser tratados como requisito quando definidos pelo produto.

---

# 247. Privacidade

Existe documentação/rota de privacidade.

Regras de tratamento de dados devem acompanhar a evolução legal e técnica.

---

# 248. Maioridade e Cadastro de Lojista

Requisitos de aceite e elegibilidade definidos na aplicação devem ser mantidos de acordo com o fluxo real.

---

# 249. CPF/CNPJ

A exigência futura ou evolução de identificação do lojista deve ser tratada como regra formal quando implementada.

---

# 250. Segurança de Identidade Comercial

Dados de cadastro comercial poderão exigir validações adicionais à medida que a plataforma escalar.

---

# 251. Loja Falsa

O VemVer deverá evoluir mecanismos para reduzir estabelecimentos fraudulentos.

---

# 252. Moderação Humana

Automação pode ser complementada por análise administrativa quando necessário.

---

# 253. Aprovação

Aprovação de loja é uma decisão administrativa do sistema, não da própria loja.

---

# 254. Status Manipulado

O lojista não deve conseguir marcar sua própria loja como:

```text
aprovada
```

através de manipulação de request.

---

# 255. Premium Manipulado

O mesmo vale para:

```text
premium
```

---

# 256. Patrocinado Manipulado

O mesmo vale para:

```text
patrocinado
```

---

# 257. Score Manipulado

O mesmo vale para:

```text
score
```

---

# 258. Plano Manipulado

O mesmo vale para:

```text
plano
```

---

# 259. Mass Assignment

Atualizações devem aceitar somente campos permitidos.

---

# 260. Regra do Body

Enviar campo extra não significa que o campo deve ser salvo.

---

# 261. Segurança do Cliente

O navegador nunca deve ser considerado uma fonte confiável de autoridade.

---

# 262. Segurança dos Apps Futuros

Aplicativos móveis seguem a mesma regra.

---

# 263. Rate Limit Futuro

Os limites poderão ser ajustados conforme tráfego real.

Mudanças relevantes precisam ser documentadas.

---

# 264. Rate Limit não é Regra de Produto Permanente

O valor:

```text
10 / 60 segundos
```

é a configuração atual.

Pode evoluir.

---

# 265. Custo de IA

O uso de IA possui custo variável.

A plataforma pode precisar aplicar diferentes estratégias de controle no futuro.

---

# 266. Cache Futuro

Cache não deve fornecer dado incorreto por tempo excessivo.

---

# 267. Personalização Futura

O VemVer poderá aprender preferências do usuário.

Isso deverá respeitar privacidade e transparência.

---

# 268. Histórico e Personalização

Histórico não deve ser utilizado de forma incompatível com as políticas de privacidade.

---

# 269. Recomendação

Recomendação futura deve preservar utilidade.

Não deve se transformar em publicidade disfarçada sem relevância.

---

# 270. Métrica de Sucesso

Exemplos de métricas futuras:

- busca com resultado;
- clique em loja;
- contato com lojista;
- favorito;
- avaliação;
- conversão comercial.

---

# 271. Métricas não Alteram Verdade

Uma métrica alta não justifica apresentar informação falsa.

---

# 272. Regras de Escala

Quando crescer:

```text
REVISAR
```

é preferível a manter regras antigas sem medir impacto.

---

# 273. Mudança de Fórmula

Score, ranking e relevância podem evoluir.

Toda mudança deve possuir:

```text
MOTIVO
+
TESTE
+
DOCUMENTAÇÃO
```

---

# 274. Experimentos

Experimentos de ranking devem ser controlados.

Não alterar comportamento permanentemente sem compreender resultados.

---

# 275. A/B Tests Futuros

Quando existirem, precisam preservar:

- segurança;
- consistência;
- privacidade;
- rastreabilidade.

---

# 276. Exclusão de Conta

Política completa de exclusão de conta deverá ser documentada quando implementada em sua forma definitiva.

---

# 277. Retenção de Dados

A retenção de históricos, avaliações e dados comerciais deverá possuir regras explícitas conforme o produto amadurecer.

---

# 278. Backup

Backup e recuperação pertencem principalmente à arquitetura, mas regras críticas de negócio devem considerar possibilidade de recuperação.

---

# 279. Auditoria

Áreas de alta criticidade:

```text
pagamentos

administração

assinaturas

autorização

dados pessoais
```

merecem maior rastreabilidade.

---

# 280. Mudança Administrativa

Operações administrativas importantes devem evitar alterações silenciosas sem possibilidade de diagnóstico.

---

# 281. Dados de Teste

Dados de teste não devem ser confundidos com estabelecimentos comerciais reais.

---

# 282. Produção e Testes

Testes em produção precisam evitar impacto indevido em:

- clientes;
- lojas;
- pagamentos;
- métricas.

---

# 283. Loja de Teste

Registros utilizados durante desenvolvimento devem ser tratados conscientemente.

---

# 284. Segurança por Camadas

Uma regra crítica pode ser protegida em várias camadas.

Exemplo:

```text
UI
+
API
+
BANCO
```

---

# 285. Regra Duplicada

Se a mesma regra aparecer em várias camadas, deve existir uma autoridade principal.

---

# 286. Definição de Autoridade

Normalmente:

```text
BACKEND
```

é a autoridade de regra operacional.

Banco pode reforçar integridade.

---

# 287. Regra de Produto em Código

Código deve representar a regra documentada.

---

# 288. Regra de Produto em Banco

Quando apropriado, banco deve impedir estados impossíveis.

---

# 289. Interface

A interface deve comunicar limites claramente.

---

# 290. Erro de Limite

Quando o lojista atingir limite de plano:

- explicar;
- não falhar silenciosamente;
- oferecer próximo passo quando existir.

---

# 291. Upgrade Comercial

O próximo passo pode ser:

- contratar plano;
- solicitar plano;
- falar com atendimento;

conforme o produto real.

---

# 292. Plano sem Pagamento

Recursos pagos não devem ser ativados permanentemente sem confirmação confiável, salvo cortesia ou regra administrativa explícita.

---

# 293. Cortesia Administrativa

Qualquer ativação manual futura deve possuir rastreabilidade.

---

# 294. Reembolso

Políticas de reembolso precisam seguir a integração financeira e política comercial quando implementadas.

Não inventar regra antes de defini-la.

---

# 295. Cancelamento

O cancelamento de plano também precisa de política explícita.

---

# 296. Renovação

A renovação pode ser automática ou manual conforme integração/configuração real.

A documentação deve acompanhar o comportamento verdadeiro.

---

# 297. Comunicação de Vencimento

O consumidor/lojista deve receber informações coerentes sobre o estado do plano.

---

# 298. Plano Expirado

Não continuar apresentando recursos expirados como ativos apenas por estado visual desatualizado.

---

# 299. Estado no Banco

O estado persistente é a referência operacional.

---

# 300. Cron e Estado

Cron pode atualizar estados com base em tempo.

---

# 301. Tempo

Cálculos de assinatura precisam utilizar datas consistentes.

---

# 302. Fuso Horário

Regras temporais deverão considerar timezone de forma explícita quando necessário.

---

# 303. Horários Comerciais Futuros

O mesmo princípio se aplica a:

```text
ABERTO AGORA
```

---

# 304. Avaliação de 1 a 5

Notas fora da escala válida devem ser rejeitadas.

---

# 305. Comentários

Comentários devem possuir limites definidos na implementação.

---

# 306. Fotos em Avaliação

Status:

```text
FUTURO
```

---

# 307. Resposta do Lojista

Status:

```text
FUTURO
```

quando ainda não implementada.

---

# 308. Denúncia de Avaliação

Pode ser necessária em escala futura.

---

# 309. Confiança nas Avaliações

A reputação não deve ser facilmente manipulável.

---

# 310. Avaliação e Score

Como avaliações aprovadas afetam score, mudanças em moderação podem afetar ranking.

---

# 311. Produto e Score

Como produtos ativos afetam score, criação artificial de produtos pode se tornar vetor de manipulação.

O sistema poderá precisar evoluir proteções.

---

# 312. Visualizações e Score

Como visualizações afetam score, contagem poderá precisar de proteção contra abuso.

---

# 313. Favoritos e Score

O mesmo vale para favoritos.

---

# 314. Segurança Econômica

Qualquer sinal que afete ranking pode se tornar alvo de manipulação.

---

# 315. Revisão Periódica

Com dados reais, regras de score deverão ser revistas periodicamente.

---

# 316. Relevância Comercial

O objetivo é equilibrar:

```text
CONSUMIDOR ENCONTRA
+
LOJISTA APARECE
+
PLATAFORMA MONETIZA
```

---

# 317. Resultado Útil

A melhor busca é aquela que ajuda o usuário a tomar uma ação real.

---

# 318. Direção do Produto

Frase orientadora:

> Você não procura. O VemVer encontra para você.

---

# 319. Implicação da Direção

O VemVer não deve exigir que o consumidor conheça previamente:

- nome da loja;
- categoria exata;
- termo técnico correto.

---

# 320. Linguagem Natural

A plataforma deve interpretar pedidos cotidianos.

---

# 321. Correção de Termos

Futuras melhorias podem tolerar:

- erros de digitação;
- sinônimos;
- variações linguísticas.

---

# 322. Resultado Local

Quando localização é relevante, o sistema deve considerar contexto territorial.

---

# 323. Contexto não Obrigatório

Nem toda busca exige distância.

---

# 324. Busca Nacional Futura

A arquitetura poderá permitir descoberta em outras cidades conforme expansão.

---

# 325. Cidade Informada Manualmente

Quando existir opção de cidade manual, ela deve ser respeitada.

---

# 326. Cidade por Geolocalização

Quando geolocalização for usada, deve haver cuidado para não assumir cidade errada sem validação adequada.

---

# 327. Lojista e Localização

Lojistas devem informar localização correta para melhorar descoberta.

---

# 328. Endereço sem Coordenada

O sistema poderá futuramente geocodificar endereço.

Essa funcionalidade não deve ser considerada atual sem implementação.

---

# 329. Coordenada Incorreta

Dados errados de localização podem prejudicar ranking.

Devem existir mecanismos futuros de correção.

---

# 330. Moderação de Cadastro

Conteúdos como nome ou descrição podem passar por regras de moderação conforme fluxo existente.

---

# 331. Loja Rejeitada

Uma loja rejeitada não deve aparecer publicamente como aprovada.

---

# 332. Reanálise

Fluxo futuro de correção/reanálise deverá ser definido se necessário.

---

# 333. Alteração após Aprovação

Se mudanças sensíveis exigirem nova análise futuramente, essa regra deverá ser explícita.

---

# 334. Segurança Administrativa

Nenhum usuário comum deve conseguir ativar loja simplesmente alterando request.

---

# 335. Dashboard

Informações do dashboard precisam refletir dados reais do usuário.

---

# 336. Métricas de Loja

Visualizações e outras métricas devem ser vinculadas à loja correta.

---

# 337. Multiunidade

O usuário autorizado de uma operação multiunidade poderá visualizar várias lojas conforme regras futuras.

---

# 338. Franquia

Franquias poderão exigir níveis adicionais de permissão e hierarquia.

---

# 339. Papéis Futuros

Se surgirem:

- gerente;
- operador;
- franqu franqueado;
- equipe;

novos papéis deverão possuir autorização explícita.

---

# 340. Não Usar Tipo de Conta como Única Segurança

Mesmo que o frontend saiba:

```text
tipo = lojista
```

ações críticas ainda precisam de autorização server-side.

---

# 341. Sessão

Sessão expirada não deve continuar permitindo ações protegidas.

---

# 342. Recuperação de Senha

Fluxos de recuperação precisam utilizar mecanismos seguros de autenticação.

---

# 343. Alteração de Senha

Depois de redefinição, a nova credencial passa a ser a válida.

---

# 344. E-mail

E-mail é parte importante da identidade atual da conta.

---

# 345. WhatsApp/SMS Futuro

Possíveis alternativas futuras de recuperação precisam receber desenho de segurança específico.

---

# 346. Termos

O aceite de termos precisa ser rastreável quando exigido pelo fluxo.

---

# 347. Versão dos Termos

Se termos mudarem significativamente, poderá ser necessário registrar versão aceita.

---

# 348. Consentimento

Consentimento não deve ser presumido quando a lei ou política exigir manifestação.

---

# 349. Privacidade e Localização

Localização é dado potencialmente sensível e deve ser tratada de maneira proporcional à finalidade.

---

# 350. Personalização

Qualquer personalização futura deve permitir evolução responsável das preferências.

---

# 351. Tema é Preferência

A escolha:

```text
Automático
Claro
Escuro
```

é uma preferência visual.

---

# 352. Padrão do Tema

Planejado:

```text
Automático
```

como padrão.

---

# 353. Identidade Visual

O laranja continua sendo cor de identidade do VemVer nos diferentes temas.

---

# 354. Acessibilidade

Tema visual deve manter contraste adequado.

---

# 355. Regras não Dependem de Cor

Um usuário não pode possuir autorização diferente porque usa tema claro ou escuro.

---

# 356. App Cliente Futuro

Deverá utilizar as mesmas regras principais de:

- autenticação;
- busca;
- favoritos;
- avaliação;
- privacidade.

---

# 357. App Lojista Futuro

Deverá utilizar as mesmas regras principais de:

- propriedade;
- produtos;
- lojas;
- planos;
- autorização.

---

# 358. Compatibilidade de API

Quando apps estiverem publicados, mudanças de API deverão considerar versões antigas instaladas.

---

# 359. Feature Flag Futura

Novas features poderão utilizar mecanismos de ativação gradual quando necessário.

---

# 360. Experimentação Controlada

Feature em teste não deve parecer universalmente disponível.

---

# 361. Produção

O estado real da produção possui prioridade sobre mockups conceituais.

---

# 362. Mockups

Imagens conceituais de aplicativos representam direção visual.

Não comprovam implementação de:

- estoque;
- horário;
- métricas;
- avaliações;
- recursos exibidos.

---

# 363. Documentação de Futuro

Todo recurso não implementado deve ser identificado claramente.

---

# 364. Regra de Auditoria

Se uma regra não puder ser confirmada:

```text
AUDITAR
```

antes de documentá-la como definitiva.

---

# 365. Prioridades de Auditoria

Áreas importantes:

```text
Mercado Pago

webhook

RLS

autorização administrativa

uploads

planos

permissões
```

---

# 366. Banco é Fonte de Verdade

Para estado persistente:

```text
BANCO
```

é a fonte principal.

---

# 367. Provedor Financeiro

Para confirmação financeira externa:

```text
MERCADO PAGO
```

precisa ser validado conforme integração.

---

# 368. IA não é Fonte de Verdade

A IA auxilia interpretação.

---

# 369. Frontend não é Fonte de Autoridade

Frontend auxilia experiência.

---

# 370. Logs não são Fonte de Estado

Logs ajudam investigação.

---

# 371. Changelog não é Banco

Documentação registra evolução.

Não substitui estado operacional.

---

# 372. Regra de Simplicidade

Quando duas soluções atendem igualmente:

> preferir a mais simples de manter e proteger.

---

# 373. Regra de Escala

Não criar regra complexa apenas para cenário hipotético distante.

---

# 374. Regra de Evolução

Quando o cenário real mudar:

> atualizar a regra conscientemente.

---

# 375. Relação com a Constituição

As regras deste documento devem respeitar:

```text
docs/00_PROJECT_CONSTITUTION.md
```

---

# 376. Relação com Master Document

O documento mestre apresenta visão consolidada do produto.

Este arquivo aprofunda:

```text
COMPORTAMENTOS E LIMITES
```

---

# 377. Relação com Product Vision

A visão define:

```text
ONDE QUEREMOS CHEGAR
```

As regras definem:

```text
COMO O PRODUTO DEVE SE COMPORTAR
```

---

# 378. Relação com Roadmap

O Roadmap diferencia:

- concluído;
- em evolução;
- futuro.

---

# 379. Relação com Architecture

Architecture explica:

```text
COMO A REGRA É SUPORTADA TECNICAMENTE
```

---

# 380. Relação com Database

Database explica:

```text
COMO OS DADOS REPRESENTAM A REGRA
```

---

# 381. Relação com API

API explica:

```text
COMO A REGRA É EXPOSTA OU EXECUTADA
```

---

# 382. Relação com Security

Security explica:

```text
COMO IMPEDIMOS USO INDEVIDO
```

---

# 383. Relação com Test Plan

Test Plan define:

```text
COMO COMPROVAR QUE A REGRA FUNCIONA
```

---

# 384. Relação com Decisions

Decisions explica:

```text
POR QUE ALGUMAS REGRAS IMPORTANTES FORAM ESCOLHIDAS
```

---

# 385. Relação com Changelog

Changelog registra:

```text
QUANDO A REGRA MUDOU
```

---

# 386. Checklist para Nova Regra

Antes de criar regra de negócio:

```text
Qual problema resolve?

Quem é afetado?

Quem pode executar?

Quem não pode?

Qual dado precisa existir?

Existe exceção?

Existe impacto financeiro?

Existe impacto de segurança?

Existe impacto em ranking?

Como testar?

Como documentar?
```

---

# 387. Checklist para Alterar Regra

```text
Por que a regra atual não serve?

Quais dados existentes serão afetados?

Existe migração?

Existe compatibilidade?

Existe risco financeiro?

Existe risco de autorização?

O frontend muda?

A API muda?

O banco muda?

O Changelog precisa mudar?

Decisions precisa mudar?
```

---

# 388. Checklist de Busca

```text
[ ] A loja é ativa?

[ ] A loja é aprovada?

[ ] Corresponde ao termo?

[ ] Categoria é relevante?

[ ] Descrição é relevante?

[ ] Proximidade foi solicitada?

[ ] Distância é conhecida?

[ ] Score está sendo usado na posição correta?

[ ] Patrocínio não está substituindo relevância?
```

---

# 389. Checklist de Loja

```text
[ ] Usuário está autenticado quando necessário?

[ ] Loja pertence ao usuário?

[ ] Plano permite?

[ ] Campos são válidos?

[ ] Campos administrativos estão protegidos?

[ ] Conteúdo foi moderado quando necessário?
```

---

# 390. Checklist de Produto

```text
[ ] Loja existe?

[ ] Loja pertence ao usuário?

[ ] Limite permite?

[ ] Produto possui campos válidos?

[ ] Estado ativo está correto?

[ ] Conteúdo foi validado?
```

---

# 391. Checklist de Avaliação

```text
[ ] Usuário correto?

[ ] Loja correta?

[ ] Nota válida?

[ ] Comentário válido?

[ ] Moderação necessária?

[ ] Status correto?

[ ] Score será impactado corretamente?
```

---

# 392. Checklist de Plano

```text
[ ] Plano existe?

[ ] Usuário autorizado?

[ ] Loja correta?

[ ] Valor confiável?

[ ] Período correto?

[ ] Pagamento confirmado?

[ ] Duplicidade tratada?

[ ] Histórico necessário?
```

---

# 393. Checklist de Cron

```text
[ ] Execução autorizada?

[ ] Data correta?

[ ] Estado atual correto?

[ ] Repetição é segura?

[ ] Histórico é necessário?

[ ] Usuário deve ser avisado?
```

---

# 394. Regra em Uma Frase

> O VemVer deve conectar o consumidor à opção local mais relevante utilizando dados reais, regras seguras e monetização que não destrua a confiança da descoberta.

---

# 395. Princípios que Não Devem Ser Perdidos

```text
RELEVÂNCIA ANTES DE MONETIZAÇÃO

IA INTERPRETA; BACKEND DECIDE

NÃO INVENTAR DADOS

USUÁRIO NÃO CONTROLA CAMPOS ADMINISTRATIVOS

PAGAMENTO PRECISA SER VALIDADO

LOJA PRECISA ESTAR ATIVA E APROVADA PARA BUSCA PÚBLICA

DISTÂNCIA DESCONHECIDA NÃO É ZERO

PREMIUM/PATROCINADO NÃO SUBSTITUEM COMPATIBILIDADE

DADOS DE OUTRO USUÁRIO DEVEM SER PROTEGIDOS

FUNCIONALIDADE FUTURA NÃO DEVE SER DOCUMENTADA COMO PRONTA
```

---

# 396. Relação com Outros Documentos

Este documento deve ser lido junto com:

```text
../00_PROJECT_CONSTITUTION.md

MASTER_DOCUMENT.md
PRODUCT_VISION.md
ROADMAP.md

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

# 397. Regra Final

Quando houver dúvida sobre uma regra, perguntar:

```text
Isso ajuda o consumidor?

É justo com o lojista?

Preserva a sustentabilidade da plataforma?

É baseado em dado real?

Pode ser manipulado pelo cliente?

Existe autorização?

Existe impacto financeiro?

Pode prejudicar a relevância?

Pode ser testado?

Está documentado corretamente?
```

---

# 398. Conclusão

As regras de negócio são a ligação entre:

```text
VISÃO DO PRODUTO
        ↓
COMPORTAMENTO ESPERADO
        ↓
ARQUITETURA
        ↓
CÓDIGO
        ↓
EXPERIÊNCIA REAL
```

O VemVer poderá mudar tecnologias, interfaces, algoritmos e provedores ao longo dos anos.

Porém, sua evolução precisa continuar preservando o objetivo principal:

> ajudar o consumidor a encontrar o que precisa no comércio local, ao mesmo tempo em que oferece ao lojista uma forma legítima e sustentável de ser encontrado.

Quando uma regra mudar, essa mudança deverá ser consciente, testada e registrada.
