import type { LegalDocumentData, LegalInfo } from "./content";

export function buildPrivacyPolicy(info: LegalInfo): LegalDocumentData {
  const mail = `[${info.contactEmail}](mailto:${info.contactEmail})`;

  return {
    slug: "politica-de-privacidade",
    title: "Política de Privacidade",
    subtitle:
      "Como a Solum coleta, utiliza, compartilha, armazena e protege os dados pessoais de quem usa a plataforma.",
    intro:
      "Esta Política de Privacidade explica, de forma clara e transparente, como a Solum trata os dados pessoais de quem utiliza a Plataforma, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018, “LGPD”). Ela deve ser lida em conjunto com os [Termos de Uso](/termos-de-uso).",

    highlights: [
      {
        title: "Coletamos o necessário",
        text: "Nome, CPF ou CNPJ, e-mail, WhatsApp e os dados das suas operações (ofertas, propostas, pedidos e fretes) para que a plataforma funcione.",
      },
      {
        title: "Senha e documento protegidos",
        text: "A senha é guardada apenas como hash criptográfico (Argon2id) e o CPF ou CNPJ nunca é exibido a outros usuários.",
      },
      {
        title: "Sem venda de dados",
        text: "Compartilhamos apenas o necessário para a negociação, com provedores de infraestrutura e quando a lei exigir. Não vendemos dados pessoais.",
      },
      {
        title: "Você no controle",
        text: "Você pode acessar, corrigir, pedir a portabilidade ou a eliminação dos seus dados e falar com o nosso canal de privacidade a qualquer momento.",
      },
    ],

    sections: [
      {
        id: "quem-somos",
        title: "Quem somos e como falar conosco",
        blocks: [
          {
            type: "clause",
            text: `O controlador dos dados pessoais tratados na Plataforma é a **Solum**, projeto acadêmico de extensão do curso de Sistemas de Informação do ${info.institution}, com atuação em ${info.city}, Minas Gerais. As decisões sobre o tratamento dos dados são tomadas pela equipe responsável pelo projeto.`,
          },
          {
            type: "clause",
            text: `O canal de comunicação com o Encarregado pelo tratamento de dados pessoais (art. 41 da LGPD), para dúvidas, solicitações de titulares e comunicações da Agência Nacional de Proteção de Dados (ANPD), é ${mail}.`,
          },
          {
            type: "clause",
            text: "Esta Política vale para visitantes e Usuários da Plataforma. Ela trata de dados de pessoas naturais, inclusive representantes, sócios e contatos de pessoas jurídicas. Informações exclusivamente empresariais, como a razão social, não são dados pessoais.",
          },
        ],
      },

      {
        id: "conceitos",
        title: "Conceitos básicos",
        blocks: [
          {
            type: "table",
            head: ["Termo", "Significado"],
            rows: [
              ["Dado pessoal", "Informação relacionada a pessoa natural identificada ou identificável, como nome, CPF, e-mail e telefone."],
              ["Titular", "Pessoa natural a quem os dados pessoais se referem. É você."],
              ["Tratamento", "Qualquer operação com dados pessoais: coleta, uso, armazenamento, compartilhamento, eliminação, entre outras."],
              ["Controlador", "Quem decide como e para que os dados são tratados: a Solum."],
              ["Operador", "Quem trata dados em nome do controlador, como provedores de hospedagem."],
              ["ANPD", "Agência Nacional de Proteção de Dados, responsável por zelar pelo cumprimento da LGPD no Brasil."],
            ],
          },
          {
            type: "p",
            text: "Os termos com inicial maiúscula que não constam acima, como Plataforma, Usuário, Oferta, Pedido e Frete, têm o significado definido nos [Termos de Uso](/termos-de-uso).",
          },
        ],
      },

      {
        id: "dados-tratados",
        title: "Quais dados tratamos",
        blocks: [
          {
            type: "p",
            text: "O quadro a seguir resume os dados tratados, quando são coletados e para que servem.",
          },
          {
            type: "table",
            head: ["Categoria", "Quais dados", "Quando são coletados", "Para que usamos"],
            rows: [
              [
                "Identificação e contato",
                "Nome completo, CPF ou CNPJ, e-mail e número de WhatsApp.",
                "No cadastro e na edição do perfil.",
                "Criar e identificar a Conta, permitir o contato entre as partes de uma operação e prevenir fraudes.",
              ],
              [
                "Credenciais",
                "Senha, armazenada somente como hash Argon2id.",
                "No cadastro.",
                "Autenticar o acesso com segurança.",
              ],
              [
                "Perfil e situação da Conta",
                "Perfil de atuação, status (ativo ou suspenso) e datas de criação, atualização e exclusão lógica.",
                "Durante o uso da Conta.",
                "Controlar acessos, moderar a Plataforma e manter rastreabilidade.",
              ],
              [
                "Dados comerciais",
                "Ofertas (produto, categoria, qualidade, safra, quantidade, unidade, preço, localização, período, descrição e imagem), Propostas e Contrapropostas (preço, quantidade e mensagem).",
                "Quando você publica ou negocia.",
                "Viabilizar a negociação e manter o histórico.",
              ],
              [
                "Pedidos e entrega",
                "Código do Pedido, preço e quantidade finais, endereço de entrega e status.",
                "Ao enviar uma Proposta, comprar diretamente ou fechar o Pedido.",
                "Formalizar a operação, gerar o Frete e permitir a entrega.",
              ],
              [
                "Dados logísticos",
                "Veículos (tipo e capacidade em toneladas) e Fretes (código, origem, destino, peso, valor e status).",
                "No cadastro da frota e no aceite e acompanhamento dos Fretes.",
                "Conectar cargas a Transportadores e acompanhar o transporte.",
              ],
              [
                "Notificações",
                "Título, mensagem, estado de leitura e referência da operação.",
                "Durante o uso da Plataforma.",
                "Informar eventos relevantes da negociação e do Frete.",
              ],
              [
                "Sessão no navegador",
                "Token de sessão (válido por 24 horas), perfil e dados básicos da Conta (identificador, nome, e-mail e WhatsApp).",
                "No login.",
                "Manter a sessão iniciada.",
              ],
              [
                "Dados técnicos de acesso",
                "Endereço IP, data e hora, tipo de navegador e registros de erro, gerados pela infraestrutura.",
                "Automaticamente, durante o uso.",
                "Garantir a segurança, diagnosticar falhas e cumprir obrigações legais.",
              ],
            ],
          },
          {
            type: "note",
            title: "Dados pessoais sensíveis",
            text: "A Plataforma não solicita dados pessoais sensíveis, como saúde, origem racial ou étnica, convicção religiosa ou dados biométricos. Pedimos que você não os inclua em campos de texto livre, como a descrição de uma Oferta ou a mensagem de uma Contraproposta.",
          },
        ],
      },

      {
        id: "coleta",
        title: "Como coletamos os dados",
        blocks: [
          { type: "p", text: "Os dados chegam até nós por estes caminhos:" },
          {
            type: "list",
            items: [
              "**diretamente de você**, ao preencher os formulários de cadastro, perfil, ofertas, propostas, pedidos e frota;",
              "**automaticamente**, durante o uso, por meio de dados de sessão e registros técnicos de acesso;",
              "**pela própria operação**, como status, códigos e notificações gerados pelo fluxo de negociação e de frete;",
              "**de outros Usuários**, quando informam dados necessários a uma operação, como o endereço de entrega; e",
              "**de serviços de consulta de endereço (CEP)**, quando esse recurso estiver disponível, a partir do CEP que você informar.",
            ],
          },
        ],
      },

      {
        id: "finalidades",
        title: "Para que usamos os dados e em quais bases legais",
        blocks: [
          {
            type: "p",
            text: "Todo tratamento tem uma finalidade específica e se apoia em uma base legal do art. 7º da LGPD:",
          },
          {
            type: "table",
            head: ["Finalidade", "Base legal"],
            rows: [
              [
                "Criar e manter a Conta, autenticar o acesso e permitir o uso de ofertas, propostas, pedidos e fretes.",
                "Execução de contrato ou de procedimentos preliminares (art. 7º, V).",
              ],
              [
                "Intermediar a comunicação e a negociação entre Usuários, compartilhando o contato necessário à operação.",
                "Execução de contrato (art. 7º, V).",
              ],
              [
                "Garantir a segurança, prevenir fraudes e abusos, moderar a Plataforma e manter o histórico e a rastreabilidade das operações.",
                "Legítimo interesse (art. 7º, IX).",
              ],
              [
                "Cumprir obrigações legais e regulatórias e atender requisições de autoridades.",
                "Cumprimento de obrigação legal ou regulatória (art. 7º, II).",
              ],
              [
                "Guardar registros para o exercício regular de direitos em processos judiciais, administrativos ou arbitrais.",
                "Exercício regular de direitos (art. 7º, VI).",
              ],
              [
                "Enviar avisos sobre a Conta, a segurança e as alterações destes documentos.",
                "Execução de contrato e legítimo interesse (art. 7º, V e IX).",
              ],
              [
                "Avaliar e aprimorar a solução na fase de validação, com dados agregados ou anonimizados.",
                "Legítimo interesse (art. 7º, IX). Dados anonimizados deixam de ser dados pessoais (art. 12).",
              ],
            ],
          },
          {
            type: "note",
            title: "Aceite não é o mesmo que consentimento",
            text: "O aceite dos Termos de Uso e desta Política no cadastro registra que você tomou ciência das regras, mas não substitui as bases legais acima nem equivale, por si só, ao consentimento previsto no art. 7º, I da LGPD. Se precisarmos de consentimento para uma finalidade opcional, ele será pedido de forma específica e poderá ser revogado a qualquer momento.",
          },
        ],
      },

      {
        id: "compartilhamento",
        title: "Com quem compartilhamos",
        blocks: [
          {
            type: "p",
            text: "Não vendemos nem alugamos dados pessoais e não os usamos para publicidade de terceiros. O compartilhamento ocorre apenas nas situações abaixo.",
          },
          {
            type: "p",
            text: "**Entre Usuários.** Compartilhamos o mínimo necessário para que a operação aconteça:",
          },
          {
            type: "table",
            head: ["Quem acessa", "O que pode ver", "Quando"],
            rows: [
              [
                "Compradores e visitantes",
                "Dados da Oferta, nome do Produtor e o contato de WhatsApp associado ao anúncio.",
                "Quando a Oferta está ativa e exibida no marketplace.",
              ],
              [
                "Produtor",
                "Nome e WhatsApp do Comprador, além da quantidade, do preço e do endereço de entrega informados na Proposta ou no Pedido.",
                "Quando o Comprador envia uma Proposta ou realiza uma compra direta.",
              ],
              [
                "Comprador e Produtor",
                "Nome e WhatsApp do Transportador e dados do veículo do Frete.",
                "Depois que um Transportador aceita o Frete do Pedido.",
              ],
              [
                "Transportador",
                "Produto, peso, origem, destino e demais condições do Frete e do Pedido.",
                "Enquanto o Frete está disponível ou depois de aceito por ele.",
              ],
              [
                "Administrador",
                "Dados necessários à moderação de Contas, Ofertas, Propostas, Pedidos e Fretes.",
                "Quando necessário para suporte, segurança ou moderação.",
              ],
            ],
          },
          {
            type: "p",
            text: "O CPF ou CNPJ e o hash da senha nunca são exibidos a outros Usuários.",
          },
          { type: "p", text: "**Outros destinatários.**" },
          {
            type: "list",
            items: [
              "**Provedores de infraestrutura e tecnologia (operadores)**, como hospedagem, banco de dados e entrega de fontes tipográficas, que tratam dados em nosso nome e sob obrigações de segurança e confidencialidade;",
              "**Instituição de ensino e empresa parceira de validação.** Relatórios, apresentações e avaliações do projeto usam dados agregados, anonimizados ou fictícios. Dados pessoais identificáveis só são repassados quando necessários à participação do próprio titular em uma atividade de validação ou mediante base legal adequada; e",
              "**Autoridades públicas**, quando houver obrigação legal, ordem judicial ou requisição de autoridade competente.",
            ],
          },
        ],
      },

      {
        id: "transferencia",
        title: "Transferência internacional de dados",
        blocks: [
          {
            type: "clause",
            text: "Alguns serviços de terceiros utilizados pela Plataforma, como a entrega das fontes tipográficas pelo Google Fonts, podem ser operados fora do Brasil. Nesses casos, pode haver transferência internacional de dados técnicos, como o endereço IP do seu dispositivo.",
          },
          {
            type: "clause",
            text: "Quando houver transferência internacional, ela ocorrerá nas hipóteses do art. 33 da LGPD e conforme a regulamentação da ANPD (Resolução CD/ANPD nº 19/2024).",
          },
        ],
      },

      {
        id: "cookies",
        title: "Cookies e armazenamento no navegador",
        blocks: [
          {
            type: "clause",
            text: "A Plataforma **não utiliza cookies de publicidade, de rastreamento de comportamento nem ferramentas de análise de terceiros**.",
          },
          {
            type: "clause",
            text: "Utilizamos o armazenamento local do navegador (localStorage), em um item chamado “solum-auth”, de caráter estritamente necessário, para manter a sua sessão iniciada por até 24 horas. Esses dados não são compartilhados com terceiros e deixam de ser usados quando você seleciona “Sair da conta” ou quando a sessão expira.",
          },
        ],
      },

      {
        id: "retencao",
        title: "Por quanto tempo guardamos os dados",
        blocks: [
          {
            type: "p",
            text: "Mantemos os dados apenas pelo tempo necessário às finalidades descritas nesta Política:",
          },
          {
            type: "table",
            head: ["Dados", "Prazo de guarda", "Motivo"],
            rows: [
              [
                "Cadastro e perfil",
                "Enquanto a Conta estiver ativa e, após o encerramento, em regra por até 5 anos, de forma restrita.",
                "Obrigações legais, prevenção a fraudes e exercício regular de direitos (prazos prescricionais da legislação civil).",
              ],
              [
                "Ofertas, propostas, pedidos e fretes",
                "Durante a operação e, depois de concluída, em regra por até 5 anos.",
                "Histórico das transações e comprovação em eventual disputa ou fiscalização.",
              ],
              [
                "Notificações",
                "Enquanto a Conta estiver ativa.",
                "Acompanhamento das operações pelo Usuário.",
              ],
              [
                "Sessão no navegador",
                "Até 24 horas ou até a saída da Conta.",
                "Manutenção da sessão.",
              ],
              [
                "Registros técnicos de acesso",
                "Pelo prazo necessário à segurança e ao diagnóstico, observado o mínimo legal aplicável (art. 15 do Marco Civil da Internet).",
                "Segurança, auditoria e obrigação legal.",
              ],
            ],
          },
          {
            type: "p",
            text: "Alguns registros são excluídos de forma lógica: deixam de aparecer e de ser usados na Plataforma, mas permanecem armazenados de forma restrita até o fim do prazo acima. Depois disso, são eliminados ou anonimizados (art. 16 da LGPD).",
          },
          {
            type: "note",
            title: "Fase de validação",
            text: "Por se tratar de projeto acadêmico, ao término da fase de validação a Solum poderá encerrar o serviço. Nesse caso, os dados pessoais serão eliminados ou anonimizados, ressalvadas as hipóteses de conservação do art. 16 da LGPD, e os Usuários serão avisados com antecedência razoável.",
          },
        ],
      },

      {
        id: "direitos",
        title: "Seus direitos como titular",
        blocks: [
          {
            type: "p",
            text: "A LGPD (art. 18) garante a você, a qualquer momento e mediante requisição:",
          },
          {
            type: "list",
            items: [
              "a confirmação de que tratamos seus dados e o acesso a eles;",
              "a correção de dados incompletos, inexatos ou desatualizados;",
              "a anonimização, o bloqueio ou a eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a lei;",
              "a portabilidade dos dados a outro fornecedor, observados os segredos comercial e industrial;",
              "a eliminação dos dados tratados com base em consentimento, quando houver;",
              "a informação sobre as entidades com as quais compartilhamos seus dados;",
              "a informação sobre a possibilidade de não fornecer consentimento e sobre as consequências da recusa;",
              "a revogação do consentimento, quando essa for a base legal; e",
              "a oposição a tratamento realizado sem consentimento, em caso de descumprimento da lei, e a revisão de decisões tomadas unicamente com base em tratamento automatizado.",
            ],
          },
          {
            type: "p",
            text: `**Como exercer.** Você pode corrigir nome, e-mail e WhatsApp a qualquer momento na área “Perfil” da sua Conta. Para os demais direitos, envie sua solicitação para ${mail}, a partir do e-mail cadastrado e indicando o direito que deseja exercer. Para a sua segurança, poderemos pedir informações adicionais para confirmar a sua identidade.`,
          },
          {
            type: "p",
            text: "**Prazo de resposta.** Responderemos de forma simplificada e imediata, quando possível, ou por declaração completa em até 15 dias, contados da requisição (art. 19 da LGPD). Alguns pedidos, como a eliminação de dados sujeitos a guarda obrigatória, podem ser limitados por lei, e explicaremos o motivo.",
          },
          {
            type: "p",
            text: "Se entender que seus direitos não foram atendidos, você pode peticionar à Agência Nacional de Proteção de Dados (ANPD), em [www.gov.br/anpd](https://www.gov.br/anpd).",
          },
        ],
      },

      {
        id: "seguranca",
        title: "Como protegemos os seus dados",
        blocks: [
          {
            type: "p",
            text: "Adotamos medidas técnicas e administrativas para proteger os dados pessoais contra acessos não autorizados, perdas, alterações e usos indevidos. As principais são:",
          },
          {
            type: "table",
            head: ["Medida", "Como funciona"],
            rows: [
              [
                "Proteção de senhas",
                "As senhas são armazenadas somente como hash gerado com Argon2id, algoritmo próprio para esse fim. Nunca guardamos a senha em texto legível.",
              ],
              [
                "Autenticação e sessão",
                "O acesso usa tokens assinados (JWT) com validade de 24 horas. A cada requisição, a Plataforma confirma no banco de dados se a Conta existe e está ativa, de modo que suspensões e exclusões têm efeito imediato.",
              ],
              [
                "Controle de acesso por perfil",
                "Cada perfil (Produtor, Comprador, Transportador e Administrador) acessa apenas as funcionalidades autorizadas. As permissões são verificadas no servidor, em mais de uma camada.",
              ],
              [
                "Minimização na exposição",
                "O CPF ou CNPJ e o hash da senha não são retornados pela API nem exibidos a outros Usuários.",
              ],
              [
                "Validação de dados",
                "Toda entrada é validada no servidor (formato, tamanho e tipo) antes do processamento, e erros internos não expõem detalhes técnicos ao Usuário.",
              ],
              [
                "Integridade das operações",
                "Regras de negócio, restrições do banco de dados (unicidade, chaves estrangeiras e transições de status) e transações atômicas preservam a consistência de Pedidos e Fretes, inclusive contra aceites simultâneos do mesmo Frete.",
              ],
              [
                "Rastreabilidade",
                "Os registros guardam as datas de criação, de atualização e de exclusão lógica.",
              ],
              [
                "Origem das requisições e segredos",
                "A API aceita requisições apenas de origens autorizadas (CORS). Chaves e credenciais ficam em variáveis de ambiente, fora do código versionado.",
              ],
              [
                "Criptografia em trânsito",
                "No ambiente de produção, o acesso à Plataforma é protegido por HTTPS/TLS.",
              ],
            ],
          },
          {
            type: "p",
            text: "Nenhum sistema é totalmente imune a falhas. Por isso, revisamos essas medidas continuamente. Também cabe a você proteger a sua senha e os seus dispositivos, conforme os [Termos de Uso](/termos-de-uso).",
          },
        ],
      },

      {
        id: "incidentes",
        title: "Incidentes de segurança",
        blocks: [
          {
            type: "clause",
            text: "Se ocorrer um incidente de segurança que possa acarretar risco ou dano relevante aos titulares, a Solum avaliará e conterá o incidente, o registrará internamente e comunicará a ANPD e os titulares afetados no prazo previsto na regulamentação (atualmente, três dias úteis a partir do conhecimento do incidente, conforme a Resolução CD/ANPD nº 15/2024).",
          },
          {
            type: "clause",
            text: "A comunicação indicará a natureza dos dados afetados, os riscos envolvidos, as medidas adotadas e as recomendações para reduzir eventuais danos.",
          },
        ],
      },

      {
        id: "criancas",
        title: "Crianças e adolescentes",
        blocks: [
          {
            type: "clause",
            text: "A Plataforma se destina a atividades profissionais e empresariais e a pessoas maiores de 18 anos. Não coletamos intencionalmente dados de crianças e adolescentes. Se identificarmos um cadastro nessa condição, ele será encerrado e os dados correspondentes serão eliminados.",
          },
        ],
      },

      {
        id: "automatizadas",
        title: "Decisões automatizadas",
        blocks: [
          {
            type: "clause",
            text: "As regras automáticas da Plataforma, como a expiração da Contraproposta em 24 horas, a geração do Frete ao fechar um Pedido e o bloqueio do aceite quando a capacidade do veículo é menor que o peso da carga, são regras operacionais objetivas. A Solum não realiza perfilamento nem toma decisões sobre pessoas com base exclusivamente em tratamento automatizado de dados.",
          },
        ],
      },

      {
        id: "alteracoes",
        title: "Alterações desta Política",
        blocks: [
          {
            type: "clause",
            text: "Esta Política pode ser atualizada para refletir mudanças legais, técnicas ou nas funcionalidades da Plataforma. Cada versão é identificada por número e data, e o histórico consta ao final deste documento. Alterações relevantes serão comunicadas pela Plataforma.",
          },
        ],
      },

      {
        id: "contato",
        title: "Contato e base normativa",
        blocks: [
          {
            type: "clause",
            text: `Para exercer direitos, tirar dúvidas ou comunicar incidentes, fale com o Encarregado pelo canal ${mail}.`,
          },
          {
            type: "clause",
            text: "**Base normativa.** Esta Política considera a Lei nº 13.709/2018 (LGPD), na redação dada pela Lei nº 15.352/2026, a Lei nº 12.965/2014 (Marco Civil da Internet), o Código Civil (Lei nº 10.406/2002) e as normas da ANPD, em especial as Resoluções CD/ANPD nº 15/2024 (incidentes de segurança) e nº 19/2024 (transferência internacional de dados).",
          },
        ],
      },

      {
        id: "historico",
        title: "Histórico de versões",
        blocks: [
          {
            type: "table",
            head: ["Versão", "Data", "Descrição"],
            rows: [[info.version, info.updatedAt, "Primeira versão publicada."]],
          },
        ],
      },
    ],
  };
}
