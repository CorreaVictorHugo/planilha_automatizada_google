# Instruções de Configuração - Automação de Recorrência

## 📋 Visão Geral

Este sistema automatizado foi criado para gerenciar os serviços de dedetização da Fimpra, identificando clientes com serviços atrasados ou próximos de vencer e organizando-os para contato via WhatsApp.

## 🎯 Funcionalidades Principais

1. **Identificação Automática**: Detecta serviços atrasados (🔴) e próximos de vencer (🟡)
2. **Fila WhatsApp**: Cria uma lista organizada de clientes para contato
3. **Painel de Recorrência**: Mostra uma visão consolidada com estatísticas
4. **Atualização Diária**: A planilha é atualizada automaticamente todos os dias às 8h
5. **Evita Duplicatas**: Cada cliente aparece apenas uma vez na lista consolidada

## 🚀 Passo a Passo para Configuração

### 1. Preparar a Planilha no Google Sheets

1. **Abra sua planilha** no Google Sheets (Controle_Agendamento_Dedetização)
2. **Crie uma aba chamada "Configurações"**:
   - Adicione na célula A1 o texto padrão para mensagens (ou use o padrão)
   - Exemplo:
     ```
     Olá, {nome},

     O serviço de {servico} está próximo do período recomendado para renovação. A data prevista é {dataRetorno}.
     Deseja agendar uma nova visita?
     
     Atenciosamente,
     Equipe Fimpra
     ```

### 2. Configurar o Script

1. **Abra o Editor de Scripts**:
   - Na planilha, clique em **Extensões > Apps Script**

2. **Cole o código**:
   - Copie todo o conteúdo do arquivo `automacao_completa.js`
   - Cole no editor de scripts (substitua qualquer código existente)

3. **Salve o projeto**:
   - Clique no ícone de disquete ou **Arquivo > Salvar**
   - Dê um nome como "Automação Recorrência Fimpra"

### 3. Executar pela Primeira Vez

1. **Execute manualmente**:
   - No editor de scripts, selecione a função `testeManual` no menu dropdown
   - Clique no botão ▶️ **Executar**
   - Na primeira execução, será solicitada autorização - **conceda todas as permissões**

2. **Verifique os resultados**:
   - Duas novas abas serão criadas: "Fila WhatsApp" e "Painel Recorrência"
   - Os clientes serão organizados automaticamente

### 4. Configurar Atualização Automática

1. **O gatilho diário será criado automaticamente** na primeira execução
2. **Verifique o gatilho**:
   - No editor de scripts, clique no ícone de relógio (⏰) no menu esquerdo
   - Você verá um gatilho para executar `executarAutomacaoCompleta` diariamente às 8h

## 📊 Entendendo as Abas

### Fila WhatsApp
- **Lista detalhada** de todos os clientes que precisam ser contactados
- **Ordenada por prioridade**: Atrasados primeiro, depois próximos de vencer
- **Colunas**:
  - Cliente, Telefone, Serviço, Data Retorno, Dias Restantes, Status
  - Mensagem personalizada, Link WhatsApp, Enviado?, Data Envio
- **Cores**:
  - 🔴 Vermelho: Atrasados
  - 🟡 Amarelo: Próximos de vencer (7 dias ou menos)
  - 🟢 Verde: Agendados (até 15 dias)

### Painel Recorrência
- **Visão consolidada** com estatísticas
- **Lista única de clientes** (sem duplicatas)
- **Estatísticas atualizadas**:
  - Total de clientes atrasados
  - Total próximos de vencer
  - Total de contatos
- **Última atualização**: Data e hora da última execução

## 🔄 Como Funciona a Atualização Diária

1. **Todos os dias às 8h**, o sistema:
   - Limpa os dados antigos
   - Verifica todas as abas de serviços
   - Identifica clientes com serviços atrasados ou próximos de vencer
   - Atualiza a Fila WhatsApp e o Painel Recorrência
   - Aplica formatação condicional

2. **Critérios de seleção**:
   - 🔴 **Atrasados**: Data de retorno já passou
   - 🟡 **Próximos**: Faltam 7 dias ou menos
   - 🟢 **Agendados**: Faltam entre 8-15 dias

## 📱 Como Usar no Dia a Dia

### 1. Verificar clientes para contato
- Abra a aba **"Fila WhatsApp"**
- Os clientes estão ordenados por prioridade
- Use os links diretos para enviar mensagens pelo WhatsApp

### 2. Marcar como enviado
- Selecione a linha do cliente
- Execute a função `marcarComoEnviado` (pelo menu ou atalho)
- O sistema registrará a data/hora do envio

### 3. Exportar relatório
- Execute a função `exportarRelatorio`
- Um novo arquivo será criado com os dados atuais

### 4. Atualizar manualmente
- Execute a função `testeManual` a qualquer momento
- Útil se você adicionou novos clientes e quer atualizar imediatamente

## ⚙️ Funções Disponíveis

| Função | Descrição |
|--------|-----------|
| `testeManual()` | Executa a automação completa manualmente |
| `marcarComoEnviado()` | Marca um cliente como contactado |
| `exportarRelatorio()` | Exporta os dados para um novo arquivo |
| `testeEmail()` | Envia um e-mail de teste |
| `limparGatilhos()` | Remove todos os gatilhos (para reiniciar) |

## 🛠️ Solução de Problemas

### Problema: O script não executa automaticamente
**Solução**:
1. Verifique se o gatilho está ativo no editor de scripts
2. Execute manualmente uma vez para reativar
3. Certifique-se de que a planilha está aberta no Google Sheets (não apenas no Excel)

### Problema: Dados não aparecem
**Solução**:
1. Verifique se as abas de serviços têm os cabeçalhos corretos:
   - Nome, Telefone, Serviço, Data Retorno
2. Certifique-se de que as datas estão no formato correto
3. Execute manualmente para ver mensagens de erro

### Problema: Mensagens de erro de permissão
**Solução**:
1. Reautorize o script
2. Certifique-se de estar usando uma conta Google com acesso à planilha
3. Verifique se a planilha não está em modo "Somente visualização"

## 📌 Dicas Importantes

1. **Mantenha a aba "Configurações"**: O texto padrão para mensagens é lido desta aba
2. **Não edite as abas geradas manualmente**: Elas são recreadas diariamente
3. **Use o link WhatsApp**: Clique no link para abrir diretamente o WhatsApp Web com a mensagem pré-preenchida
4. **Atualize manualmente quando necessário**: Após adicionar muitos clientes novos
5. **Verifique o Painel diariamente**: Para ter uma visão rápida dos clientes que precisam de atenção

## 🎓 Treinamento Rápido

**Vídeo demonstrativo** (recomendado):
1. Como executar o script pela primeira vez
2. Como usar a Fila WhatsApp
3. Como marcar clientes como contactados
4. Como interpretar o Painel de Recorrência

## 📞 Suporte

Para dúvidas ou problemas:
- Victor Hugo - Desenvolvedor
- Contato: (informações de contato)
- Horário de atendimento: Seg-Sex, 8h-18h

---

**Versão**: 1.0
**Data**: 26/08/2026
**Desenvolvedor**: Victor Hugo
**Empresa**: Fimpra - Controle de Pragas