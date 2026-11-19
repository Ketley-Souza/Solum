import type { LegalDocumentData, LegalInfo } from "./content";

export function buildTermsOfUse(info: LegalInfo): LegalDocumentData {
  const mail = `[${info.contactEmail}](mailto:${info.contactEmail})`;

  return {
    slug: "termos-de-uso",
    title: "Termos de Uso",
    subtitle:
      "Regras de acesso e utilização da plataforma Solum por produtores, compradores e transportadores.",
    intro:
      "Estes Termos de Uso regulam o acesso e a utilização da plataforma web Solum, um marketplace B2B para negociação e escoamento da produção agrícola. Ao criar uma conta ou utilizar as áreas restritas da Plataforma, você declara que leu, compreendeu e concorda com este documento e com a [Política de Privacidade](/politica-de-privacidade).",

    highlights: [
      {
        title: "Intermediação tecnológica",
        text: "A Solum conecta produtores, compradores e transportadores. Ela não compra, não vende nem transporta mercadorias e não é parte dos contratos firmados entre os usuários.",
      },
      {
        title: "Você responde pelo que publica",
        text: "Ofertas, propostas e dados cadastrais devem ser verdadeiros e atualizados. Aceitar uma proposta ou comprar diretamente pode gerar obrigações entre as partes.",
      },
      {
        title: "Conta pessoal e segura",
        text: "Guarde sua senha, encerre a sessão em dispositivos compartilhados e avise a Solum se suspeitar de acesso indevido. As sessões expiram em 24 horas.",
      },
      {
        title: "Fase de validação",
        text: "A Solum é um projeto acadêmico em fase de validação. O serviço pode mudar, ficar indisponível ou ser encerrado, com aviso prévio sempre que possível.",
      },
    ],

    sections: [
      {
        id: "aceitacao",
        title: "Aceitação e vigência",
        blocks: [
          {
            type: "clause",
            text: "Ao marcar a opção “Li e aceito os Termos de Uso e a Política de Privacidade” no cadastro, o Usuário declara que leu, compreendeu e concorda com estes Termos e com a [Política de Privacidade](/politica-de-privacidade), que passam a integrar o vínculo entre o Usuário e a Solum.",
          },
          {
            type: "clause",
            text: "O aceite é condição para criar uma conta e utilizar as áreas restritas da Plataforma. Quem não concordar com estes Termos deve abster-se de se cadastrar. Visitantes podem navegar pelas áreas públicas, como a página inicial e a vitrine de ofertas, sujeitos às regras deste documento no que forem aplicáveis.",
          },
          {
            type: "clause",
            text: `Estes Termos entram em vigor em ${info.effectiveDate} e permanecem válidos por prazo indeterminado, podendo ser atualizados conforme a seção “Alterações destes Termos”.`,
          },
        ],
      },

      {
        id: "definicoes",
        title: "Definições",
        blocks: [
          {
            type: "p",
            text: "Nestes Termos, as expressões abaixo, quando iniciadas com letra maiúscula, têm o seguinte significado:",
          },
          {
            type: "table",
            head: ["Termo", "Significado"],
            rows: [
              ["Plataforma", "A aplicação web Solum, com seus recursos, telas, serviços e conteúdos."],
              ["Usuário", "Pessoa natural, ou pessoa jurídica por meio de seu representante, que mantém uma conta na Plataforma."],
              ["Produtor", "Usuário que publica Ofertas de produtos agrícolas e responde a Propostas."],
              ["Comprador", "Usuário que busca Ofertas, envia Propostas ou realiza compra direta."],
              ["Transportador", "Usuário que cadastra veículos e aceita Fretes."],
              ["Administrador", "Usuário designado pela Solum para moderação e suporte, sem possibilidade de autocadastro."],
              ["Oferta", "Anúncio de produto agrícola publicado por um Produtor, com produto, categoria, qualidade, safra, quantidade, unidade, preço, localização, período e descrição."],
              ["Proposta e Contraproposta", "Manifestações de preço e quantidade trocadas na negociação. A Contraproposta apresentada pelo Produtor tem validade de 24 horas."],
              ["Pedido", "Registro da operação entre Produtor e Comprador, originada de compra direta ou de negociação concluída."],
              ["Frete", "Demanda de transporte gerada quando um Pedido é fechado, que pode ser aceita por um Transportador."],
              ["Conta", "Cadastro individual do Usuário, protegido por credenciais de acesso (e-mail e senha)."],
            ],
          },
        ],
      },

      {
        id: "natureza",
        title: "Natureza da Plataforma e papel da Solum",
        blocks: [
          {
            type: "clause",
            text: "A Solum é uma plataforma de intermediação tecnológica. Ela oferece o ambiente digital em que Produtores, Compradores e Transportadores se encontram, negociam e registram suas operações em um fluxo único: oferta, negociação, pedido, frete e entrega.",
          },
          {
            type: "clause",
            text: "A Solum não é parte dos contratos de compra e venda ou de transporte firmados entre Usuários, não é proprietária, depositária ou transportadora dos produtos e não garante a existência, a qualidade, a quantidade, o preço, a entrega ou o pagamento de qualquer operação.",
          },
          {
            type: "clause",
            text: "Nesta fase, a Plataforma não processa pagamentos nem emite documentos fiscais, de transporte ou de pagamento. A formalização contratual, a emissão desses documentos e o cumprimento das obrigações fiscais e regulatórias continuam sob responsabilidade dos Usuários envolvidos.",
          },
          {
            type: "clause",
            text: "As condições comerciais do frete, como valor, prazo e forma de pagamento, são de responsabilidade das partes envolvidas na operação.",
          },
        ],
      },

      {
        id: "cadastro",
        title: "Cadastro e elegibilidade",
        blocks: [
          {
            type: "clause",
            text: "Podem utilizar a Plataforma pessoas naturais maiores de 18 anos e plenamente capazes, e pessoas jurídicas representadas por quem tenha poderes para tanto. A Plataforma destina-se a atividades profissionais e empresariais.",
          },
          {
            type: "clause",
            text: "O cadastro exige nome completo, CPF ou CNPJ, e-mail, número de WhatsApp, senha e a escolha do perfil de atuação (Produtor, Comprador ou Transportador). O perfil de Administrador é atribuído exclusivamente pela Solum.",
          },
          {
            type: "clause",
            text: "Cada CPF ou CNPJ e cada e-mail podem estar vinculados a uma única Conta.",
          },
          {
            type: "clause",
            text: "A senha deve ter no mínimo 8 caracteres, com pelo menos uma letra maiúscula e um número. Recomenda-se uma senha longa, única e não utilizada em outros serviços.",
          },
          {
            type: "clause",
            text: "O Usuário declara que as informações fornecidas são verdadeiras, completas e atualizadas e se compromete a mantê-las corretas. Nome, e-mail e WhatsApp podem ser atualizados na área “Perfil”. A Solum pode solicitar comprovações e suspender Contas com dados inconsistentes ou suspeitos.",
          },
        ],
      },

      {
        id: "seguranca-conta",
        title: "Segurança da conta",
        blocks: [
          {
            type: "clause",
            text: "A Conta é pessoal e intransferível. O Usuário é responsável pela guarda de suas credenciais e pelas atividades realizadas com elas, salvo comprovação de uso indevido que não lhe possa ser atribuído.",
          },
          {
            type: "clause",
            text: "O Usuário não deve compartilhar sua senha e deve encerrar a sessão (“Sair da conta”) ao utilizar dispositivos de uso compartilhado. As sessões expiram automaticamente em 24 horas, exigindo novo acesso.",
          },
          {
            type: "clause",
            text: "Em caso de suspeita de acesso indevido, perda de dispositivo ou exposição da senha, o Usuário deve comunicar imediatamente a Solum pelo canal de contato indicado ao final deste documento, para que sejam adotadas as medidas de proteção cabíveis.",
          },
          {
            type: "clause",
            text: "A Solum pode suspender uma Conta de forma preventiva diante de indícios de fraude, uso indevido ou risco à segurança da Plataforma ou de outros Usuários.",
          },
        ],
      },

      {
        id: "perfis",
        title: "Regras de cada perfil",
        blocks: [
          {
            type: "clause",
            text: "**Produtor.** Ao publicar Ofertas e responder a Propostas, o Produtor se compromete a:",
          },
          {
            type: "list",
            items: [
              "informar de modo verdadeiro e atualizado o produto, a categoria, a qualidade, a safra, a quantidade, a unidade, o preço, a localização e o período de disponibilidade;",
              "ter a titularidade ou o direito de dispor do produto ofertado e das imagens publicadas;",
              "manter suas Ofertas atualizadas, pausando ou encerrando aquelas que não estejam mais disponíveis;",
              "responder às Propostas recebidas (aceitar, recusar ou apresentar Contraproposta) com boa-fé; e",
              "cumprir a legislação aplicável ao produto, inclusive as normas sanitárias, ambientais, fiscais e de classificação.",
            ],
          },
          {
            type: "clause",
            text: "**Comprador.** Ao enviar Propostas ou realizar compra direta, o Comprador se compromete a:",
          },
          {
            type: "list",
            items: [
              "agir de boa-fé e com real intenção de contratar;",
              "informar endereço de entrega correto e completo;",
              "responder às Contrapropostas dentro do prazo de 24 horas; e",
              "cumprir o que for acordado, inclusive quanto ao pagamento e ao recebimento da carga.",
            ],
          },
          {
            type: "clause",
            text: "**Transportador.** Ao cadastrar veículos e aceitar Fretes, o Transportador se compromete a:",
          },
          {
            type: "list",
            items: [
              "manter o cadastro de seus veículos (tipo e capacidade em toneladas) correto e atualizado;",
              "aceitar apenas Fretes compatíveis com o veículo escolhido, pois a Plataforma impede o aceite quando a capacidade informada é inferior ao peso da carga;",
              "manter a regularidade legal e regulatória exigida para o transporte rodoviário de cargas, como habilitação, seguros e registros aplicáveis, inclusive perante a Agência Nacional de Transportes Terrestres (ANTT), quando for o caso; e",
              "atualizar o andamento do Frete (início do transporte e confirmação da entrega) de forma fiel à realidade.",
            ],
          },
          {
            type: "clause",
            text: "**Administrador.** O Administrador atua somente na moderação e no suporte da Plataforma e deve tratar os dados a que tiver acesso com confidencialidade e exclusivamente para essas finalidades.",
          },
        ],
      },

      {
        id: "negociacao",
        title: "Negociação, pedidos e fretes",
        blocks: [
          {
            type: "clause",
            text: "O fluxo da Plataforma segue estas etapas: Oferta, Proposta (ou compra direta), Contraproposta (opcional), Pedido, Frete e Entrega.",
          },
          {
            type: "clause",
            text: "A Contraproposta apresentada pelo Produtor é válida por 24 horas. Sem resposta do Comprador nesse prazo, ela expira e a negociação é encerrada sem acordo.",
          },
          {
            type: "clause",
            text: "Quando uma Proposta ou Contraproposta é aceita, ou quando há compra direta, o Pedido é fechado e a Plataforma gera automaticamente o Frete correspondente, inicialmente disponível a Transportadores.",
          },
          {
            type: "clause",
            text: "O Frete é atribuído ao primeiro Transportador que o aceitar, com veículo compatível. Depois disso, ele deixa de estar disponível para os demais.",
          },
          {
            type: "clause",
            text: "O Pedido e o Frete evoluem em etapas sequenciais (Pedido: fechado, em transporte e entregue; Frete: disponível, aceito, em rota e entregue). Os registros de andamento são informados pelos Usuários e servem como histórico da operação.",
          },
          {
            type: "clause",
            text: "Aceitar uma Proposta ou Contraproposta, ou realizar compra direta, é manifestação de vontade que pode gerar obrigações entre as partes, nos termos da legislação civil. A Solum não arbitra conflitos entre Usuários, mas pode registrar ocorrências e adotar medidas de moderação.",
          },
          {
            type: "clause",
            text: "Para o cálculo do peso do Frete, a Plataforma reconhece as unidades toneladas, quilogramas e sacas de 60 kg.",
          },
        ],
      },

      {
        id: "conteudo",
        title: "Conteúdo publicado pelos Usuários",
        blocks: [
          {
            type: "clause",
            text: "O Usuário é o único responsável pelos textos, imagens, valores e demais informações que publica e declara possuir os direitos necessários sobre eles, sem violar direitos de terceiros.",
          },
          {
            type: "clause",
            text: "O Usuário concede à Solum licença não exclusiva, gratuita, limitada e revogável para hospedar, exibir e processar esse conteúdo, exclusivamente para operar a Plataforma e dar visibilidade às Ofertas.",
          },
          {
            type: "clause",
            text: "Os campos de texto livre, como a descrição da Oferta e a mensagem da Contraproposta, não devem conter dados pessoais sensíveis ou desnecessários de terceiros.",
          },
          {
            type: "clause",
            text: "A Solum pode remover, de forma administrativa, conteúdos e Ofertas que violem estes Termos, a legislação ou direitos de terceiros.",
          },
        ],
      },

      {
        id: "condutas",
        title: "Condutas proibidas",
        blocks: [
          { type: "clause", text: "É proibido ao Usuário:" },
          {
            type: "list",
            items: [
              "publicar Ofertas falsas, enganosas ou de produtos ilícitos ou irregulares, simular negociações ou manipular preços;",
              "utilizar a Conta de terceiros, informar dados falsos ou manter Contas duplicadas para burlar regras da Plataforma;",
              "coletar dados de outros Usuários por meios automatizados, ou utilizar nomes, WhatsApp e endereços obtidos na Plataforma para finalidade diferente da operação que originou o contato, como o envio de mensagens não solicitadas;",
              "tentar acessar áreas, Contas ou dados sem autorização, explorar vulnerabilidades, sobrecarregar a infraestrutura, inserir código malicioso, realizar engenharia reversa ou testes de intrusão sem autorização prévia e por escrito da Solum; e",
              "violar direitos de propriedade intelectual ou publicar conteúdo ofensivo, discriminatório ou ilegal.",
            ],
          },
          {
            type: "note",
            title: "Encontrou uma falha de segurança?",
            text: `Comunique-a imediatamente a ${mail}, sem explorá-la, sem acessar dados de terceiros e sem divulgá-la publicamente antes da correção. Relatos feitos de boa-fé dessa forma serão analisados com prioridade e tratados com sigilo.`,
          },
        ],
      },

      {
        id: "moderacao",
        title: "Moderação, suspensão e encerramento",
        blocks: [
          {
            type: "clause",
            text: "Administradores da Solum podem suspender Contas e remover Ofertas que violem estes Termos ou a legislação, sem prejuízo de outras medidas cabíveis. A suspensão produz efeito imediato: o acesso é bloqueado mesmo que exista uma sessão ativa.",
          },
          {
            type: "clause",
            text: "Sempre que isso não comprometer a segurança ou a apuração dos fatos, a Solum poderá informar ao Usuário o motivo da medida adotada.",
          },
          {
            type: "clause",
            text: "O Usuário pode solicitar o encerramento de sua Conta a qualquer momento pelo canal de contato. O encerramento não extingue obrigações já assumidas, como Pedidos fechados e Fretes aceitos, que devem ser concluídos ou resolvidos com as demais partes.",
          },
          {
            type: "clause",
            text: "Após o encerramento, os dados são tratados conforme a [Política de Privacidade](/politica-de-privacidade), inclusive quanto a prazos de guarda, eliminação e anonimização.",
          },
        ],
      },

      {
        id: "propriedade",
        title: "Propriedade intelectual",
        blocks: [
          {
            type: "clause",
            text: "O nome e a marca Solum, o layout, os textos, o código-fonte, as bases de dados e os demais elementos da Plataforma são protegidos pela legislação de propriedade intelectual. Componentes de terceiros, como bibliotecas de código aberto, permanecem sujeitos às suas respectivas licenças.",
          },
          {
            type: "clause",
            text: "O uso da Plataforma não transfere ao Usuário qualquer direito de propriedade intelectual, apenas uma licença pessoal, limitada, revogável e não exclusiva de uso, nos termos deste documento. É vedada a reprodução ou a exploração dos elementos da Plataforma sem autorização.",
          },
        ],
      },

      {
        id: "validacao",
        title: "Fase de validação e disponibilidade",
        blocks: [
          {
            type: "clause",
            text: `A Plataforma é disponibilizada em fase de validação, como parte de projeto acadêmico de extensão desenvolvido no curso de Sistemas de Informação do ${info.institution}, no âmbito do Projeto Integrador V, com participação de empresa parceira na validação da solução.`,
          },
          {
            type: "clause",
            text: "Por essa razão, o serviço é oferecido no estado em que se encontra. Podem ocorrer indisponibilidades, manutenções, correções, mudanças de funcionalidades e, ao término da fase de validação, o encerramento do serviço, com aviso prévio razoável pelos canais da Plataforma sempre que possível.",
          },
          {
            type: "clause",
            text: "Indicadores, depoimentos e exemplos exibidos em páginas institucionais ou demonstrativas podem ter caráter ilustrativo durante a fase de validação e não representam garantia de resultados.",
          },
          {
            type: "clause",
            text: "Recomenda-se que o Usuário mantenha cópia própria das informações relevantes para a sua atividade, como dados de pedidos e fretes.",
          },
        ],
      },

      {
        id: "responsabilidade",
        title: "Limitação de responsabilidade",
        blocks: [
          {
            type: "clause",
            text: "Na máxima extensão permitida pela legislação, a Solum não se responsabiliza por:",
          },
          {
            type: "list",
            items: [
              "divergências de qualidade, quantidade, preço, prazo ou entrega entre Usuários, nem por inadimplemento, fraude ou descumprimento praticados por outros Usuários;",
              "danos, atrasos, perdas ou acidentes ocorridos durante o transporte;",
              "decisões comerciais tomadas com base em informações publicadas por Usuários;",
              "indisponibilidades, falhas de conexão ou de provedores de infraestrutura, ou eventos de caso fortuito e força maior; e",
              "uso indevido da Conta decorrente de falta de cuidado do Usuário com suas credenciais.",
            ],
          },
          {
            type: "clause",
            text: "Nada neste documento exclui responsabilidades que não possam ser afastadas por lei, nem restringe os direitos dos titulares de dados pessoais previstos na LGPD.",
          },
          {
            type: "clause",
            text: "O Usuário responde pelos danos que causar à Solum ou a terceiros em razão da violação destes Termos ou da legislação aplicável.",
          },
        ],
      },

      {
        id: "dados",
        title: "Proteção de dados pessoais",
        blocks: [
          {
            type: "clause",
            text: "O tratamento de dados pessoais pela Solum segue a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018) e está descrito na [Política de Privacidade](/politica-de-privacidade), que integra estes Termos.",
          },
          {
            type: "clause",
            text: "Ao ter acesso a dados pessoais de outros Usuários, por exemplo o nome e o WhatsApp da outra parte de uma operação, o Usuário passa a ser responsável por utilizá-los exclusivamente para a operação que originou o contato, sendo vedado repassá-los a terceiros ou usá-los para outras finalidades sem base legal adequada.",
          },
        ],
      },

      {
        id: "comunicacoes",
        title: "Comunicações",
        blocks: [
          {
            type: "clause",
            text: "Avisos sobre a Conta, medidas de moderação, segurança e alterações destes Termos poderão ser feitos por notificação na Plataforma ou pelos contatos informados no cadastro (e-mail e WhatsApp). O Usuário deve mantê-los atualizados e consultar regularmente suas notificações.",
          },
        ],
      },

      {
        id: "alteracoes",
        title: "Alterações destes Termos",
        blocks: [
          {
            type: "clause",
            text: "Estes Termos podem ser atualizados para refletir mudanças legais, de segurança ou de funcionalidades. Cada versão é identificada por número e data, e o histórico consta ao final deste documento.",
          },
          {
            type: "clause",
            text: "Alterações relevantes serão comunicadas pela Plataforma e poderão exigir novo aceite. Quando não exigirem, o uso da Plataforma após o aviso indica concordância com a nova versão. Quem não concordar poderá solicitar o encerramento da Conta.",
          },
        ],
      },

      {
        id: "gerais",
        title: "Disposições gerais",
        blocks: [
          {
            type: "clause",
            text: "Estes Termos e a Política de Privacidade formam o acordo integral entre o Usuário e a Solum sobre o uso da Plataforma. Se alguma disposição for considerada inválida, as demais continuam em vigor, e a tolerância quanto a eventual descumprimento não implica renúncia a direitos.",
          },
          {
            type: "clause",
            text: "O Usuário não pode ceder a terceiros sua Conta nem sua posição neste acordo.",
          },
          {
            type: "clause",
            text: "Aplica-se a legislação brasileira, em especial o Código Civil (Lei nº 10.406/2002), o Marco Civil da Internet (Lei nº 12.965/2014) e a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018).",
          },
          {
            type: "clause",
            text: `Fica eleito o foro da ${info.forum}, para dirimir controvérsias decorrentes destes Termos, sem prejuízo das hipóteses em que a lei estabeleça foro diverso.`,
          },
        ],
      },

      {
        id: "contato",
        title: "Contato",
        blocks: [
          {
            type: "clause",
            text: `Dúvidas sobre estes Termos, pedidos de suporte, comunicações de incidentes e relatos de vulnerabilidades podem ser enviados para ${mail}.`,
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
