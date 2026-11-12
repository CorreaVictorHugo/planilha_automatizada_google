# Automação de recorrência de serviços — Fimpra

Projeto de portfólio em **Google Sheets e Google Apps Script** para acompanhar serviços recorrentes, organizar contatos e apoiar o planejamento da equipe.

## O que o código faz

- Calcula a data de retorno conforme o tipo de serviço.
- Organiza serviços em abas mensais e prepara recorrências futuras.
- Gera uma fila de contatos com links para WhatsApp e um painel de recorrência.
- Atualiza os dados por uma rotina diária configurada no Apps Script.
- Prepara relatórios internos e mensagens para acompanhamento.

## Tecnologias

Google Sheets · Google Apps Script (JavaScript) · HTML para modelos de e-mail.

## Como experimentar

1. Faça uma cópia de uma planilha de teste com os cabeçalhos esperados pelo script.
2. Abra **Extensões → Apps Script** e cole o conteúdo de [Codigo_pronto_para_colar.gs](Codigo_pronto_para_colar.gs).
3. Antes de executar, revise no início do script o e-mail do relatório, o WhatsApp da empresa, o período de planejamento, o nome da aba modelo e as regras de recorrência.
4. Execute `configurarSistema()` uma vez e autorize somente as permissões necessárias para o uso pretendido.
5. Confira as abas criadas e teste `testeManual()` com dados fictícios antes de utilizar dados reais.

O script contém configurações específicas da operação original. Para reutilizá-lo, adapte essas configurações à sua planilha. Os [modelos de e-mail](templates/) e as [instruções de configuração](INSTRUCOES_CONFIGURACAO.md) complementam o código.

## Estrutura

```text
├── Codigo_pronto_para_colar.gs
├── INSTRUCOES_CONFIGURACAO.md
├── RESUMO_EXECUTIVO.md
├── templates/
│   ├── template_email_cliente.html
│   └── template_email_equipe.html
└── README.md
```

## Demonstração e resultados

Este repositório apresenta a implementação e a configuração; não inclui uma planilha pública conectada nem métricas verificadas de redução de tempo ou aumento de renovações. A operação diária depende da instalação do script em uma planilha e da revisão das permissões e dos dados utilizados.

## Autor

[Victor Hugo Corrêa](https://github.com/CorreaVictorHugo)
