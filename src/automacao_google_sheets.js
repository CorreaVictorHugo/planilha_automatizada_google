// Script para automação de alertas de vencimento no Google Sheets
// Este script deve ser executado diariamente como um gatilho no Google Apps Script

// Configuração de email
var EMAIL_DESTINO = "correavhc@gmail.com"; // Seu email para testes
var EMAIL_REMETENTE = "contato@fimpra.com"; // Email da empresa
var NOME_EMPRESA = "Fimpra Dedetização";

function verificarVencimentos() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("Controle_Agendamento_Dedetização");
  
  // Verificar se a aba de alertas já existe, senão criar
  var alertSheet = spreadsheet.getSheetByName("Alertas Vencimento");
  if (!alertSheet) {
    alertSheet = spreadsheet.insertSheet("Alertas Vencimento");
    // Configurar cabeçalhos
    alertSheet.appendRow(["Nome", "Serviço", "Data Retorno", "Dias para Vencimento", "Link para Cliente", "Email Enviado"]);
  } else {
    // Limpar dados antigos (exceto cabeçalhos)
    alertSheet.getRange("A2:F").clearContent();
  }
  
  // Obter dados da planilha principal
  var data = sheet.getDataRange().getValues();
  var hoje = new Date();
  hoje.setHours(0, 0, 0, 0); // Zerar horas para comparação apenas de datas
  
  var alertas = [];
  
  // Percorrer os dados a partir da segunda linha (ignorar cabeçalhos)
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var nome = row[0]; // Coluna A: Nome
    var emailCliente = row[2]; // Coluna C: Email
    var servico = row[4]; // Coluna E: Serviço
    var dataRetorno = row[7]; // Coluna H: Data Retorno
    
    // Verificar se a data de retorno é válida
    if (dataRetorno && dataRetorno instanceof Date && !isNaN(dataRetorno.getTime())) {
      var dataRetornoCopy = new Date(dataRetorno);
      dataRetornoCopy.setHours(0, 0, 0, 0);
      
      // Calcular diferença em dias
      var diffTime = dataRetornoCopy - hoje;
      var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Verificar se está dentro do período de alerta (7 dias antes)
      if (diffDays >= 0 && diffDays <= 7) {
        // Criar link para o texto (usando URL curto ou apenas o texto)
        var linkTexto = "https://fimpra.com/alerta?cliente=" + encodeURIComponent(nome) + "&servico=" + encodeURIComponent(servico);
        
        // Verificar se o cliente tem email para envio
        var emailEnviado = "Não";
        if (emailCliente && emailCliente.trim() !== "") {
          // Enviar email para o cliente
          try {
            enviarEmailCliente(nome, emailCliente, servico, dataRetorno);
            emailEnviado = "Sim";
          } catch (e) {
            emailEnviado = "Erro: " + e.message;
          }
        }
        
        alertas.push([nome, servico, dataRetorno, diffDays, linkTexto, emailEnviado]);
      }
    }
  }
  
  // Adicionar alertas à aba de alertas
  if (alertas.length > 0) {
    alertSheet.getRange(2, 1, alertas.length, alertas[0].length).setValues(alertas);
    
    // Formatar a aba de alertas
    alertSheet.getRange("A1:F1").setFontWeight("bold");
    alertSheet.autoResizeColumns(1, 6);
    
    // Criar aba com textos personalizados
    criarAbaTextos(spreadsheet, alertas);
    
    return "Foram encontrados " + alertas.length + " serviços próximos do vencimento. Emails enviados para clientes com endereço válido.";
  } else {
    alertSheet.getRange("A2").setValue("Nenhum serviço próximo do vencimento.");
    return "Nenhum serviço próximo do vencimento.";
  }
}

function criarTextoCliente(nome, servico, dataRetorno) {
  // Formatar a data como DD/MM/AAAA
  var dia = dataRetorno.getDate().toString().padStart(2, '0');
  var mes = (dataRetorno.getMonth() + 1).toString().padStart(2, '0');
  var ano = dataRetorno.getFullYear();
  var dataFormatada = dia + "/" + mes + "/" + ano;
  
  // Texto base
  var texto = "Olá, " + nome + "\n\n" +
              "O serviço de " + servico + " está próximo do período recomendado para renovação do certificado de garantia. " +
              "A data prevista para o retorno é " + dataFormatada + ".\n\n" +
              "Deseja agendar uma nova visita? Entre em contato conosco para combinarmos o melhor dia e horário.\n\n" +
              "Estamos à disposição para garantir que seu ambiente continue protegido e seguro.\n\n" +
              "Atenciosamente,\n" +
              "Equipe Fimpra";
  
  return texto;
}

function criarEmailHTML(nome, servico, dataRetorno) {
  // Formatar a data como DD/MM/AAAA
  var dia = dataRetorno.getDate().toString().padStart(2, '0');
  var mes = (dataRetorno.getMonth() + 1).toString().padStart(2, '0');
  var ano = dataRetorno.getFullYear();
  var dataFormatada = dia + "/" + mes + "/" + ano;
  
  // Template HTML baseado no arquivo template_email_cliente.html
  var htmlTemplate = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificação de Renovação de Serviço</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: #4CAF50;
                color: white;
                padding: 10px;
                text-align: center;
                border-radius: 5px;
            }
            .content {
                padding: 20px;
                background-color: #f9f9f9;
                border-radius: 5px;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #777;
                text-align: center;
            }
            .button {
                display: inline-block;
                background-color: #4CAF50;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Notificação de Renovação de Serviço</h2>
        </div>
        <div class="content">
            <p>Olá, ${nome},</p>
            <p>O serviço de <strong>${servico}</strong> está próximo do período recomendado para renovação. A data prevista para o retorno é <strong>${dataFormatada}</strong>.</p>
            <p>Deseja agendar uma nova visita? Entre em contato conosco para combinarmos o melhor dia e horário.</p>
            <p>Estamos à disposição para garantir que seu ambiente continue protegido e seguro.</p>
            <p><a href="mailto:contato@fimpra.com" class="button">Entre em Contato</a></p>
            <p>Atenciosamente,<br>Equipe de Atendimento</p>
        </div>
        <div class="footer">
            <p>Esta é uma mensagem automática. Por favor, não responda este e-mail.</p>
            <p>${NOME_EMPRESA} | Telefone: (XX) XXXX-XXXX | E-mail: contato@fimpra.com</p>
        </div>
    </body>
    </html>
  `;
  
  return htmlTemplate;
}

function enviarEmailCliente(nome, email, servico, dataRetorno) {
  var assunto = "📅 Lembrete: Renovação de Serviço de Dedetização";
  var corpoTexto = criarTextoCliente(nome, servico, dataRetorno);
  var corpoHTML = criarEmailHTML(nome, servico, dataRetorno);
  
  // Enviar email com opções HTML
  MailApp.sendEmail({
    to: email,
    subject: assunto,
    body: corpoTexto, // Versão em texto simples (fallback)
    htmlBody: corpoHTML, // Versão HTML
    name: NOME_EMPRESA,
    from: EMAIL_REMETENTE
  });
  
  // Enviar cópia para o seu email (para teste)
  MailApp.sendEmail({
    to: EMAIL_DESTINO,
    subject: "[TESTE] " + assunto + " - Enviado para: " + nome,
    body: "Este é um email de teste enviado para: " + email + "\n\n" + corpoTexto,
    htmlBody: "<p>Este é um email de teste enviado para: " + email + "</p>" + corpoHTML,
    name: NOME_EMPRESA
  });
}

function criarAbaTextos(spreadsheet, alertas) {
  // Verificar se a aba de textos já existe
  var textosSheet = spreadsheet.getSheetByName("Textos para Clientes");
  if (textosSheet) {
    spreadsheet.deleteSheet(textosSheet);
  }
  
  textosSheet = spreadsheet.insertSheet("Textos para Clientes");
  
  // Adicionar cabeçalhos
  textosSheet.appendRow(["Nome", "Texto Personalizado", "Email Cliente"]);
  
  // Adicionar textos personalizados
  for (var i = 0; i < alertas.length; i++) {
    var nome = alertas[i][0];
    var servico = alertas[i][1];
    var dataRetorno = alertas[i][2];
    var texto = criarTextoCliente(nome, servico, dataRetorno);
    
    textosSheet.appendRow([nome, texto, alertas[i][5]]);
  }
  
  // Formatar a aba
  textosSheet.getRange("A1:C1").setFontWeight("bold");
  textosSheet.autoResizeColumn(1);
  textosSheet.setColumnWidth(2, 500); // Largura maior para o texto
  textosSheet.getRange("B2:B").setWrap(true); // Quebrar texto automaticamente
}

// Função para ser executada como gatilho diário
function executarVerificacaoDiaria() {
  try {
    var resultado = verificarVencimentos();
    Logger.log(resultado);
    
    // Enviar email de notificação para você
    MailApp.sendEmail({
      to: EMAIL_DESTINO,
      subject: "📊 Relatório Diário de Vencimentos - Fimpra",
      body: resultado + "\n\nEste é um relatório automático gerado pelo sistema de automação."
    });
    
  } catch (e) {
    Logger.log("Erro ao executar verificação: " + e.toString());
    MailApp.sendEmail({
      to: EMAIL_DESTINO,
      subject: "⚠️ Erro na Automação de Vencimentos",
      body: "Ocorreu um erro ao executar a verificação de vencimentos:\n\n" + e.toString() + "\n\n" + e.stack
    });
  }
}

// Função para criar menu personalizado
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Automação Fimpra')
    .addItem('Verificar Vencimentos', 'verificarVencimentos')
    .addItem('Executar Verificação Diária', 'executarVerificacaoDiaria')
    .addItem('Testar Envio de Email', 'testarEnvioEmail')
    .addToUi();
}

// Função para testar o envio de email
function testarEnvioEmail() {
  var ui = SpreadsheetApp.getUi();
  
  // Dados de teste
  var nomeTeste = "Victor Hugo (Teste)";
  var servicoTeste = "Dedetização Completa";
  var dataTeste = new Date();
  dataTeste.setDate(dataTeste.getDate() + 7); // Daqui a 7 dias
  
  try {
    enviarEmailCliente(nomeTeste, EMAIL_DESTINO, servicoTeste, dataTeste);
    ui.alert('Teste de Email', 'Email de teste enviado com sucesso para: ' + EMAIL_DESTINO, ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Erro no Teste', 'Erro ao enviar email de teste: ' + e.message, ui.ButtonSet.OK);
  }
}