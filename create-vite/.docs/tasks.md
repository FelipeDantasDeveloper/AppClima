# Tarefas de implementação — App Clima

Este arquivo decompõe o [PRD](./prd.md) em etapas progressivas. O PRD é a fonte de verdade para requisitos, contratos da API, conteúdo e diretrizes visuais; consulte as seções indicadas em cada tarefa em vez de duplicá-las aqui.

## Como executar

- Execute **uma tarefa por vez**, na ordem abaixo. Cada agente deve trabalhar somente na tarefa atual e não antecipar tarefas seguintes.
- Antes de começar, confirme que as dependências listadas estão concluídas.
- Marque uma tarefa como feita (`[x]`) somente depois de verificar todos os critérios de aprovação e o build aplicável.
- Se um critério depender de uma decisão não definida no PRD, não invente comportamento: registre a dúvida para esclarecimento.

## Sequência

### T01 — Preparar a estrutura da aplicação {x}

- {x} **Dependências:** nenhuma.
- **Escopo:** conferir a estrutura existente do Vite/TypeScript e preparar os pontos de entrada e organização necessários para separar domínio, integração Open-Meteo e interface. Não implementar funcionalidades de tarefas posteriores.
- **Referência:** PRD, seção 5 (Tecnologias e Fronteira de acesso à API).
- **Critérios de aprovação:**
  - {x} A aplicação mantém Vite e TypeScript sem framework.
  - {x} Há uma estrutura clara para código de domínio, acesso à API e interface, seguindo as convenções já presentes no projeto.
  - {x} O comando de build existente conclui sem erros.

### T02 — Definir os tipos e utilitários meteorológicos {x}

- {x} **Dependências:** T01.
- **Escopo:** definir os tipos dos dados de localização e das respostas atuais/diárias necessários ao app; implementar a conversão de `weather_code` para as descrições do PRD e um fallback para código desconhecido.
- **Referência:** PRD, seções 4 (RF-04 e RF-05), 5 (estrutura da resposta e mapeamento WMO) e 7 (Confiabilidade e Manutenibilidade).
- **Critérios de aprovação:**
  - {x} Os tipos representam os campos usados pela aplicação sem depender de `any`.
  - {x} Todos os códigos e descrições WMO listados no PRD são reconhecidos.
  - {x} Um código desconhecido retorna uma descrição genérica e não lança erro.
  - {x} O build conclui sem erros.

### T03 — Implementar a busca de localização {x}

- {x} **Dependências:** T02.
- **Escopo:** criar a função de geocodificação encapsulada, incluindo validação de entrada, montagem segura da URL e extração dos dados requeridos.
- **Referência:** PRD, seções 4 (RF-02), 5 (Fronteira de acesso à API e Etapa 1 — Geocodificação) e critério de aceite 6.
- **Critérios de aprovação:**
  - {x} Uma entrada válida gera uma consulta com `name`, `count=1`, `language=pt` e `format=json`.
  - {x} O resultado utilizável contém nome, latitude, longitude, timezone e código do país.
  - {x} Entrada vazia/inválida ou ausência de resultados não gera chamada incompleta e retorna ausência de resultado de forma explícita.
  - {x} Falha de rede ou resposta HTTP inválida é propagada como erro, não convertida em ausência de resultado.

### T04 — Implementar a consulta de clima {x}

- {x} **Dependências:** T02.
- **Escopo:** criar a função encapsulada para consultar dados atuais e diários, validar coordenadas/fuso e interpretar valores e unidades.
- **Referência:** PRD, seções 4 (RF-03 e RF-05), 5 (Fronteira de acesso à API e Etapa 2 — Consulta meteorológica) e critérios de aceite 2, 5, 6 e 8.
- **Critérios de aprovação:**
  - {x} A URL usa `latitude`, `longitude` e `timezone` corretos e solicita todas as variáveis atuais e diárias especificadas no PRD.
  - {x} A função lê valores e unidades dos objetos apropriados e não presume arrays diários válidos.
  - {x} Parâmetros ausentes/inválidos impedem a requisição e resultam em ausência de dados utilizáveis.
  - {x} Resposta sem dados atuais utilizáveis resulta em ausência de dados; falha HTTP/rede é propagada como erro.

### T05 — Orquestrar o fluxo único de busca {x}

- {x} **Dependências:** T03 e T04.
- **Escopo:** conectar a geocodificação à consulta meteorológica em uma operação de busca, distinguindo sucesso, ausência de resultado e erro.
- **Referência:** PRD, seções 4 (RF-01 a RF-03 e RF-06), 5 (Fronteira de acesso à API) e critérios de aceite 1, 4, 5 e 7.
- **Critérios de aprovação:**
  - {x} A consulta meteorológica só ocorre após obter uma localização completa e válida.
  - {x} Ausência de localização ou clima utilizável produz estado sem resultado, sem dados parciais apresentados como sucesso.
  - {x} Erros de rede/API permanecem distinguíveis de ausência de resultado.
  - {x} A camada de interface pode acompanhar a operação inteira como um único estado de carregamento.

### T06 — Criar busca e estados da interface {x}

- {x} **Dependências:** T01 e T05.
- **Escopo:** implementar o campo de cidade e os estados inicial, carregando, sem resultado e erro, ligados ao fluxo de busca.
- **Referência:** PRD, seções 4 (RF-01 e RF-06), 6 (Estados e interação) e 7 (Acessibilidade).
- **Critérios de aprovação:**
  - {x} A busca pode ser enviada por teclado e por controle visível, com campo acessivelmente rotulado.
  - {x} O carregamento permanece visível durante todo o fluxo de duas etapas e impede envios concorrentes confusos.
  - {x} Empty state, ausência de resultado e erro têm mensagens distintas e compreensíveis.
  - {x} Estados e mensagens são anunciáveis por tecnologia assistiva; nenhum deles depende somente de cor ou ícone.

### T07 — Apresentar os dados meteorológicos {x}

- {x} **Dependências:** T02, T05 e T06.
- **Escopo:** implementar o painel de resultado com os dados atuais definidos no PRD e unidades correspondentes; não criar seção visual de previsão diária.
- **Referência:** PRD, seções 2 (Fora do escopo), 4 (RF-04 e RF-05), 5 (unidades e códigos WMO) e 6 (Composição).
- **Critérios de aprovação:**
  - {x} O painel apresenta todos os dados de RF-04: temperatura, cidade/código do país, dia local, dia/noite, condição, vento, mínima/máxima, sensação térmica, umidade e probabilidade de precipitação.
  - {x} Unidades são mostradas junto aos valores; valores ausentes não são exibidos como reais.
  - {x} A condição é apresentada por texto e representação visual; código WMO desconhecido não impede a exibição dos demais dados válidos.
  - {x} Não há seção visual de previsão diária nesta versão.

### T08 — Aplicar o layout responsivo e as diretrizes visuais {x}

- {x} **Dependências:** T06 e T07.
- **Escopo:** finalizar a composição visual e adaptar o painel para telas estreitas conforme o PRD.
- **Referência:** PRD, seção 6 (Composição e Estados e interação) e seção 7 (Acessibilidade e Responsividade).
- **Critérios de aprovação:**
  - {x} O fundo geral é cinza-escuro, a busca fica centralizada sobre o painel e não possui fundo próprio.
  - {x} O painel branco é centralizado, tem largura máxima de 800px, bordas bem arredondadas e agrupa barra lateral e área principal.
  - {x} Os dados são agrupados nas áreas indicadas pelo PRD; a repetição do vento não prejudica leitura nem hierarquia.
  - {x} Em viewport estreita, as áreas passam a uma coluna sem rolagem horizontal e mantêm ordem de leitura e contraste legíveis.

### T09 — Validar o fluxo completo e os critérios de aceite {x}

- {x} **Dependências:** T03 a T08.
- **Escopo:** validar os cenários integrados do PRD, corrigir defeitos encontrados dentro do escopo e registrar a validação executada.
- **Referência:** PRD, seção 8 (Critérios de aceite).
- **Critérios de aprovação:**
  - {x} O build de produção conclui sem erros.
  - {x} São verificados os cenários de cidade válida, cidade não encontrada, clima sem dados utilizáveis e falha de rede/API.
  - {x} É confirmado que parâmetros inválidos não provocam requisições incompletas e que os dados diários são solicitados.
  - {x} São verificados empty state, carregamento, mensagens de erro/ausência, resultado e layout estreito.
  - {x} Todos os critérios foram verificáveis e aprovados; nenhum foi marcado por suposição.

**Validação executada:** `npm run build`; verificações integradas com `fetch` simulado para geocodificação, parâmetros meteorológicos/diários, dados diários, argumentos inválidos e erros HTTP/rede; testes no navegador com API simulada para cidade válida, ausência de cidade/clima, falha HTTP/rede, validação do campo, estados de carregamento nas duas etapas, conteúdo RF-04 e viewport de 320px sem rolagem horizontal.
