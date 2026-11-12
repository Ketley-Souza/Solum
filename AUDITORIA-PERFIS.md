# Auditoria de problemas das páginas dos perfis

## Escopo

Auditoria realizada sem alteração de código, cobrindo:

- páginas de comprador, produtor e transportador;
- rotas protegidas e navegação;
- estados de carregamento, erro e vazio;
- dados fixos ou demonstrativos;
- filtros e ações sem implementação;
- consistência visual, responsividade e acessibilidade.

Legenda:

- **Alta**: pode induzir o usuário a erro, perder uma operação ou comprometer a confiabilidade dos dados.
- **Média**: funcionalidade incompleta ou comportamento inconsistente.
- **Baixa**: melhoria de UX, UI ou acessibilidade sem bloqueio imediato.

---

# Perfil comprador

## `/comprador` — Marketplace

Arquivo: `front/src/pages/buyer/index.tsx`

### Problemas



1. **Alta — Ofertas demonstrativas misturadas com ofertas reais**
   - A página combina as ofertas retornadas pelo backend com uma lista fixa local.
   - Os produtos demonstrativos aparecem como se fossem ofertas disponíveis no marketplace.
   - Isso pode levar o comprador a tentar negociar uma oferta que não existe no banco.

2. **Alta — Categorias reais são reduzidas incorretamente**
   - A conversão atual transforma quase todas as categorias em `Grãos`.
   - Categorias como `Outros`, `Insumos` ou `Sementes` podem aparecer classificadas incorretamente.
   - O filtro por categoria perde precisão.

3. **Média — Quantidades das categorias são fixas**
   - Os números exibidos, como `216 ofertas` ou `86 ofertas`, não são calculados a partir do banco.
   - O usuário pode receber uma informação diferente da quantidade realmente disponível.

4. **Média — Filtro de entrega não filtra os resultados**
   - O seletor permite escolher `Até 30 dias`, `Até 15 dias` e `A combinar`.
   - A seleção altera apenas o estado visual e não participa da filtragem.

5. **Média — Faixa de preço fixa e sem interação**
   - O texto `R$ 50 – R$ 1.200 por unidade` é fixo.
   - Não representa necessariamente os preços reais.
   - Não existe um controle para filtrar por essa faixa.

6. **Média — Contador de notificações fixo**
   - A navbar usa `notificationCount={3}`.
   - O valor pode não corresponder às notificações reais do usuário.

7. **Média — Nome do comprador não é usado de forma consistente**
   - A página passa `profileName="Comprador"` em vez de usar o nome autenticado.
   - Outras páginas do comprador exibem nomes fixos diferentes.

8. **Baixa — Estado vazio não diferencia ausência de dados de falha**
   - Quando não há ofertas, a tela pode aparentar simplesmente não haver ofertas.
   - Deveria distinguir entre banco vazio, erro de API e carregamento em andamento.

---

## `/comprador/pedidos` — Meus pedidos

Arquivo: `front/src/pages/buyer/orders/index.tsx`

### Problemas

1. **Alta — Filtro `Cancelados` nunca retorna pedidos**
   - A implementação retorna `false` para todos os pedidos quando esse filtro é selecionado.
   - O usuário pode interpretar que não possui cancelamentos, mesmo que o backend venha a ter registros.

2. **Média — Nome do comprador é fixo**
   - A navbar usa `profileName="João Ribeiro"`.
   - Isso pode exibir a identidade de outra pessoa para o usuário autenticado.

3. **Média — Contador de notificações é fixo**
   - A página usa `notificationCount={3}`.
   - O valor não acompanha a quantidade real de notificações não lidas.

4. **Média — Volume negociado pode ser apresentado com semântica incorreta**
   - O indicador chamado `Volume negociado` calcula preço multiplicado por quantidade.
   - Isso representa valor financeiro, não volume físico.
   - O rótulo pode induzir o usuário a interpretar o indicador de forma errada.

5. **Baixa — Estado de carregamento da tabela é pouco evidente**
   - A estrutura da página pode aparecer antes dos pedidos estarem disponíveis.
   - É recomendável usar um estado de carregamento específico para a tabela e os indicadores.

---

## `/comprador/notificacoes` — Notificações

Arquivo: `front/src/pages/buyer/notifications/index.tsx`

### Problemas

1. **Média — Não há estado de carregamento explícito**
   - A página inicia vazia enquanto busca as notificações.
   - O usuário não sabe se não existem notificações ou se a consulta ainda está em andamento.

2. **Média — Erros ao marcar notificações não possuem feedback completo**
   - Falhas em `marcar como lida` ou `marcar todas como lidas` não são apresentadas de forma consistente.
   - O estado local pode não refletir o estado real do banco em caso de falha.

3. **Baixa — Nome da navbar usa fallback genérico**
   - A página passa `profileName="Usuário"`.
   - A navbar deveria sempre usar o nome autenticado.

4. **Baixa — Atualização da lista é somente local após a ação**
   - A interface altera a notificação localmente depois da chamada.
   - Não há revalidação ou tratamento específico para conflito com outro dispositivo.

---

## `/comprador/negociacao/:offerId` — Negociação

Arquivo: `front/src/pages/buyer/negotiation/index.tsx`

### Problemas

1. **Alta — Rota demonstrativa cria uma falsa operação**
   - IDs como `1`, `2`, `3` e `4` carregam produtos fixos locais.
   - Enviar proposta ou aceitar preço nesses produtos não cria pedido ou proposta no banco.
   - A operação apenas altera o estado visual da página.

2. **Alta — Fallback para produto demonstrativo**
   - Quando a oferta ainda não foi carregada, a tela usa `products[0]`.
   - Um ID inválido pode exibir dados de outra oferta em vez de informar que a oferta não existe.

3. **Alta — Mensagem de sucesso pode sugerir uma operação real**
   - O fluxo demonstrativo informa que a proposta ou aceite foi registrado, embora nenhum registro tenha sido criado.

4. **Média — Datas da oferta são fixas**
   - A interface exibe `20–30 set. 2026` e validade até `15/09/2026`.
   - Esses valores não são derivados do período real da oferta.

5. **Média — Dados do produtor e avaliações são fixos**
   - Nome, nota e quantidade de avaliações são demonstrativos.
   - A tela pode apresentar informações comerciais que não pertencem ao produtor real.

6. **Média — Contador e nome do comprador são fixos**
   - A navbar utiliza `João Ribeiro` e contador `3`.

7. **Baixa — Mensagens de validação misturam unidades**
   - A quantidade é informada em toneladas, mas a disponibilidade pode estar em outra unidade.
   - É necessário garantir conversão e validação coerentes para cada oferta real.

---

## `/comprador/perfil` — Perfil

Arquivo: `front/src/pages/ProfilePage.tsx`

### Problemas

1. **Média — Dados não são recarregados do backend ao abrir a página**
   - Os campos são inicializados com o Zustand persistido.
   - Alterações feitas em outro dispositivo ou no Prisma Studio podem não aparecer imediatamente.

2. **Média — Não há estado de carregamento inicial do perfil**
   - O usuário vê os dados persistidos enquanto não existe confirmação de que são os dados atuais.

3. **Baixa — Não há confirmação antes do logout**
   - Um toque acidental em `Sair da conta` encerra a sessão imediatamente.

4. **Baixa — Falta indicação de dados que não podem ser editados**
   - Documento e perfil não aparecem na tela, embora sejam dados relevantes da conta.

---

# Perfil produtor

## `/produtor` — Visão geral

Arquivo: `front/src/pages/producer/index.tsx`

### Problemas

1. **Média — Falha ao carregar propostas vira lista vazia**
   - A chamada usa `catch(() => setProposals([]))`.
   - Problemas de rede, autorização ou backend aparecem como `0 propostas`.

2. **Média — Falha ao carregar notificações vira contador zero**
   - Qualquer erro no serviço é convertido em `0` notificações não lidas.
   - O produtor pode não perceber que existe uma falha de comunicação.

3. **Média — Dados de carregamento não são apresentados de forma completa**
   - Os indicadores podem aparecer zerados antes de todas as requisições terminarem.
   - Falta separar carregamento, erro e ausência real de registros.

4. **Baixa — Volume negociado precisa de rótulo mais preciso**
   - O indicador calcula valor financeiro de pedidos.
   - O termo `Volume negociado` pode ser confundido com quantidade física.

5. **Baixa — Falta ação direta para criar a primeira oferta**
   - Quando não há ofertas, aparece apenas uma mensagem.
   - Um botão `Criar oferta` reduziria o caminho para o próximo passo.

---

## `/produtor/ofertas` — Minhas ofertas


Arquivo: `front/src/pages/producer/offers.tsx`


> Status: os seis pontos abaixo foram corrigidos ou já estavam atendidos em `front/src/pages/producer/offers.tsx`.
### Problemas

1. **Média — Falha ao carregar propostas é silenciosa**
   - A contagem de propostas pode aparecer como `Nenhuma` quando a API de propostas falhou.
   - Isso confunde ausência de propostas com erro de carregamento.

2. **Média — Estado local duplicado para ofertas**
   - A página mantém uma lista local e também recebe dados da store.
   - Após operações ou recarregamentos, pode haver risco de divergência visual entre os dois estados.

3. **Média — IDs locais são criados para ofertas remotas**
   - A interface usa `1000 + index` como ID visual.
   - Isso pode causar inconsistência ao ordenar ou atualizar ofertas.

4. **Média — Edição e encerramento dependem de estados intermediários locais**
   - O usuário pode visualizar uma alteração antes de uma confirmação completa do backend.
   - É recomendável revalidar a oferta após cada mutação.

5. **Baixa — Falta confirmação de ações destrutivas**
   - Encerrar uma oferta deve deixar claro que a ação pode ser irreversível ou alterar sua disponibilidade.

6. **Baixa — Filtro de ofertas com propostas depende de texto**
   - A condição usa `offer.proposals !== "Nenhuma"`.
   - É mais seguro trabalhar com uma contagem numérica real.

---

## `/produtor/negociacoes` — Negociações

Arquivo: `front/src/pages/producer/negotiations.tsx`

### Problemas


1. **Média — Localização do comprador não é carregada**
   - A conversão usa `Localização não informada`.
   - A tela poderia exibir dados disponíveis do pedido ou do perfil, quando aplicável.

2. **Média — Prazo padrão não representa necessariamente o backend**
   - Quando não há contraproposta, o prazo aparece como `24 horas`.
   - Esse prazo não é calculado a partir de uma data real de expiração.

3. **Média — Mensagens da negociação são reconstruídas de forma limitada**
   - A timeline é montada com textos genéricos.
   - Não representa necessariamente todo o histórico de ações.

4. **Baixa — Ação de contraproposta restringe o preço sem explicação suficiente**
   - O produtor só pode informar valor entre o preço proposto e o preço original.
   - A regra precisa ser apresentada claramente para evitar dúvida sobre o motivo do bloqueio.

5. **Baixa — Modal/detalhe precisa de melhorias de teclado**
   - Verificar foco inicial, tecla `Escape`, foco preso e retorno ao item selecionado.

---

## `/produtor/pedidos` — Pedidos e logística

Arquivo: `front/src/pages/producer/orders.tsx`

### Problemas

>Corrigidos /pedidos


## `/produtor/notificacoes` — Notificações

Arquivo: `front/src/pages/producer/notifications.tsx`

### Problemas

1. **Alta — Ação “Marcar como não lida” não funciona**
   - A interface oferece essa ação.
   - A função retorna imediatamente quando a notificação já está lida.
   - O backend não possui endpoint correspondente para reverter o estado.

2. **Média — Erros ao marcar notificações não são tratados adequadamente**
   - Falhas em ações assíncronas podem não informar o usuário.

3. **Média — Notificações são classificadas em categorias aproximadas**
   - Tipos não previstos acabam classificados como `Vendas`.
   - A categoria pode não refletir o evento real.

4. **Média — Grupo “Hoje” depende de comparação de datas locais**
   - A classificação usa `toDateString()`.
   - Diferenças de fuso ou horário do servidor podem colocar uma notificação no grupo incorreto.

5. **Baixa — Menus de ação podem sair da área visível em telas pequenas**
   - O menu é posicionado de forma absoluta e precisa ser verificado em telas estreitas.

---

## `/produtor/perfil` — Perfil

Arquivo: `front/src/pages/ProfilePage.tsx`

### Problemas

1. **Média — Perfil não é atualizado do backend ao abrir**
   - O formulário depende dos dados persistidos no store.

2. **Baixa — Falta confirmação para logout**
   - A ação é imediata.

3. **Baixa — Falta exibir informações não editáveis**
   - Documento e perfil poderiam ser mostrados como dados da conta, mesmo que não possam ser alterados.

---

# Perfil transportador

## `/transportador` — Visão geral

Arquivo: `front/src/pages/carrier/index.tsx`

### Problemas

1. **Média — Saudação sempre exibe “Bom dia”**
   - O texto não acompanha o horário real.

2. **Média — Não há orientação quando o transportador não possui veículo**
   - A necessidade de veículo só fica clara ao tentar aceitar um frete.

3. **Média — Ganhos dependem de valor de frete preenchido**
   - Quando `valor_frete` é nulo, o dashboard exibe `R$ 0,00` no total.
   - Isso pode ser interpretado como ganho zero, e não como valor ainda não confirmado.

4. **Baixa — Avaliação aparece apenas como `—`**
   - Falta explicar quando e como as avaliações serão disponibilizadas.

5. **Baixa — Falta atualização automática**
   - O dashboard só atualiza quando a página carrega ou quando uma ação força nova consulta.
   - Novos fretes não aparecem automaticamente.

---

## `/transportador/fretes-disponiveis` — Fretes disponíveis

Arquivo: `front/src/pages/carrier/available-freights.tsx`

### Problemas

1. **Média — Cadastro de veículo fica escondido no modal de aceite**
   - Não existe uma área própria para visualizar e gerenciar a frota.
   - O transportador só descobre essa necessidade durante o aceite.

2. **Média — Não há indicação clara de que o veículo precisa suportar o peso**
   - A lista mostra apenas os veículos compatíveis.
   - O motivo pelo qual outros veículos não aparecem poderia ser mais explícito.

3. **Média — Após cadastrar veículo, o estado do modal depende de recarregamento**
   - O formulário chama a atualização da lista, mas a experiência poderia confirmar qual veículo foi criado e já selecioná-lo.

4. **Média — Modal não possui gerenciamento completo de foco**
   - Não há evidência de foco inicial, fechamento com `Escape` ou restauração do foco.

5. **Baixa — Erro e mensagem de sucesso podem permanecer ao trocar de frete**
   - O estado de feedback é parcialmente limpo ao selecionar, mas deve ser validado em todas as combinações de abertura e fechamento.

6. **Baixa — Falta atualização automática dos fretes**
   - Outro transportador pode aceitar uma carga e a lista permanecer desatualizada até atualização manual.

---

## `/transportador/meus-fretes` — Meus fretes

Arquivo: `front/src/pages/carrier/my-freights.tsx`

### Problemas

1. **Média — Não existe visualização de detalhes do frete**
   - A página apresenta origem, destino e status, mas não possui uma visão aprofundada com pedido, carga e veículo.

2. **Média — Ações de avanço não têm confirmação intermediária**
   - `Iniciar transporte` e `Confirmar entrega` alteram dados relevantes imediatamente.
   - Seria recomendável confirmação para evitar acionamento acidental.

3. **Média — Falhas após atualização podem deixar a lista visualmente antiga**
   - A ação atualiza o item localmente, mas não há revalidação completa da lista.

4. **Baixa — Status não explica a próxima ação**
   - `Aguardando início` e `Em trânsito` são exibidos, mas faltam instruções contextuais.

5. **Baixa — Falta indicação de veículo associado**
   - O frete pode ser acompanhado sem mostrar claramente qual veículo foi selecionado.

---

## `/transportador/historico` — Histórico

Arquivo: `front/src/pages/carrier/history.tsx`

### Problemas

1. **Média — Não há paginação ou limite visual**
   - Muitos fretes entregues podem produzir uma lista longa sem paginação.

2. **Média — Valor nulo pode ser confundido com ausência de pagamento**
   - A tela mostra `A confirmar`, mas não explica se o valor será calculado posteriormente ou se houve problema no cadastro.

3. **Baixa — Histórico não oferece detalhes da entrega**
   - Não há acesso a veículo, pedido, origem completa ou informações adicionais da conclusão.

4. **Baixa — Busca não informa quantidade de resultados**
   - O usuário filtra, mas não recebe indicação clara de quantos registros correspondem à busca.

---

## `/transportador/perfil` — Perfil

Arquivo: `front/src/pages/ProfilePage.tsx`

### Problemas

1. **Média — Não existe gerenciamento de frota no perfil**
   - O transportador precisa cadastrar veículos em outro fluxo, dentro do aceite de frete.

2. **Média — Perfil não recarrega dados atuais do backend**
   - O formulário depende do estado persistido localmente.

3. **Baixa — Falta confirmação para logout**
   - A sessão é encerrada imediatamente.

4. **Baixa — Falta exibição de documento e dados operacionais**
   - Para transportadores, seria útil visualizar dados como documento, veículos cadastrados e status da conta.

---

# Problemas transversais

## Autenticação e entrada

Arquivo: `front/src/pages/AuthPage.tsx`

1. **Média — “Esqueci minha senha” não está implementado**
   - O link usa `href="#"`.
   - Não há fluxo de recuperação ou redefinição de senha.

2. **Média — Termos de Uso e Política de Privacidade não possuem páginas**
   - Os links também usam `href="#"`.
   - O usuário não consegue consultar os documentos antes de aceitar.

3. **Baixa — Mensagens de erro podem ser pouco contextualizadas**
   - Alguns erros são apresentados diretamente sem instrução clara sobre como corrigir o problema.

## Navbar

Arquivo: `front/src/components/ProfileNavbar.tsx`

1. **Média — Contadores de notificações são inconsistentes**
   - Algumas páginas usam dados reais.
   - Outras usam valores fixos como `2` ou `3`.

2. **Média — Nomes exibidos variam entre páginas**
   - Algumas telas usam o usuário real.
   - Outras usam `Comprador`, `João Ribeiro` ou `Usuário`.

3. **Baixa — Navegação mobile depende de um seletor**
   - Funciona, mas reduz a visibilidade das rotas e exige uma interação extra.
   - Deve permanecer com foco visível e indicação clara da rota atual.

## Modais

Aplicável aos modais de ofertas, pedidos, negociações e fretes.

1. **Baixa — Verificar foco inicial e restauração de foco**
2. **Baixa — Adicionar fechamento com `Escape`**
3. **Baixa — Garantir foco preso dentro do modal**
4. **Baixa — Adicionar `aria-describedby` quando houver instruções ou erros**
5. **Baixa — Impedir scroll do conteúdo de fundo enquanto o modal estiver aberto**

## Tratamento de dados

1. **Alta — Dados demonstrativos ainda estão misturados com fluxos reais**
2. **Média — Erros de API são convertidos em listas vazias em algumas telas**
3. **Média — Estados de carregamento não são uniformes**
4. **Média — Filtros visuais nem sempre possuem efeito funcional**
5. **Baixa — Datas e rótulos fixos ainda aparecem em telas de negociação**

---

# Ordem recomendada para correção

## Prioridade 1 — Confiabilidade dos dados

1. Remover as ofertas fixas do marketplace real.
2. Remover o fallback demonstrativo da negociação.
3. Garantir que toda negociação use uma oferta real do banco.
4. Corrigir nomes e contadores fixos nas navbars.
5. Diferenciar erro de API de lista vazia.

## Prioridade 2 — Funcionalidades que aparentam existir

1. Implementar ou remover o filtro de entrega.
2. Implementar ou remover o filtro de cancelados.
3. Corrigir contagens fixas das categorias.
4. Corrigir a ação “Marcar como não lida”.
5. Carregar o perfil diretamente do backend ao abrir a página.

## Prioridade 3 — Operação dos perfis

1. Criar uma área própria de frota do transportador.
2. Adicionar confirmação para mudanças de status de frete.
3. Adicionar detalhes completos do frete e da entrega.
4. Implementar recuperação de senha.
5. Criar páginas reais para Termos de Uso e Política de Privacidade.

## Prioridade 4 — Refinamento UX/UI

1. Padronizar skeletons e estados de carregamento.
2. Melhorar acessibilidade dos modais.
3. Corrigir datas e períodos exibidos.
4. Implementar atualização automática ou polling onde fizer sentido.
5. Melhorar mensagens de vazio, erro e próxima ação.
