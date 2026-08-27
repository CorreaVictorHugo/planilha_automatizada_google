// Automação Completa para Controle de Recorrência
// Versão: 1.0 - 26/08/2026
// Desenvolvido para Fimpra - Controle de Dedetização

// Função principal - Executa todas as automações
function executarAutomacaoCompleta() {
  try {
    // 1. Preparar estrutura da planilha (caso não exista)
    prepararEstrutura();

    // 2. Limpar dados antigos
    limparDadosAntigos();

    // 3. Processar serviços atrasados e próximos de vencer
    processarServicos();

    // 4. Atualizar painel de recorrência
    atualizarPainelRecorrencia();

    // 5. Criar gatilho diário (se não existir)
    criarGatilhoDiario();

    SpreadsheetApp.getUi().alert('Automação concluída com sucesso! ✅');
    Logger.log('Automação executada: ' + new Date());

  } catch (error) {
    SpreadsheetApp.getUi().alert('Erro na automação: ' + error.message);
    Logger.log('Erro: ' + error.stack);
  }
}

// Função para preparar a estrutura da planilha
function prepararEstrutura() {
  const planilha = SpreadsheetApp.getActive();

  // Criar aba Fila WhatsApp (se não existir)
  let fila = planilha.getSheetByName('Fila WhatsApp');
  if (!fila) {
    fila = planilha.insertSheet('Fila WhatsApp');
    fila.appendRow([
      'Cliente',
      'Telefone',
      'Serviço',
      'Data de Retorno',
      'Dias Restantes',
      'Status',
      'Mensagem',
      'Link WhatsApp',
      'Enviado?',
      'Data Envio'
    ]);

    // Congelar cabeçalho
    fila.setFrozenRows(1);

    // Formatação
    fila.getRange('A1:J1').setBackground('#4CAF50').setFontColor('white').setFontWeight('bold');
    fila.setColumnWidth(1, 200); // Cliente
    fila.setColumnWidth(2, 120); // Telefone
    fila.setColumnWidth(3, 180); // Serviço
    fila.setColumnWidth(4, 120); // Data
    fila.setColumnWidth(5, 100); // Dias
    fila.setColumnWidth(6, 120); // Status
    fila.setColumnWidth(7, 300); // Mensagem
    fila.setColumnWidth(8, 250); // Link
    fila.setColumnWidth(9, 80);  // Enviado
    fila.setColumnWidth(10, 120); // Data Envio
  }

  // Criar aba Painel Recorrência (se não existir)
  let painel = planilha.getSheetByName('Painel Recorrência');
  if (!painel) {
    painel = planilha.insertSheet('Painel Recorrência');

    // Cabeçalho
    painel.appendRow(['PAINEL DE RECORRÊNCIA']);
    painel.getRange('A1').setBackground('#2E7D32').setFontColor('white').setFontWeight('bold').setFontSize(16);

    // Data de atualização
    painel.appendRow(['Última Atualização', 'Status']);
    painel.getRange('A2:B2').setBackground('#E8F5E9').setFontWeight('bold');

    // Estatísticas
    painel.appendRow(['Total de Clientes Atrasados', 'Total Próximos a Vencer', 'Total Contatos']);
    painel.getRange('A3:C3').setBackground('#C8E6C9').setFontWeight('bold');

    // Lista de clientes (inicia na linha 6)
    painel.appendRow(['Cliente', 'Telefone', 'Serviço', 'Data Retorno', 'Dias', 'Status']);
    painel.getRange('A5:F5').setBackground('#4CAF50').setFontColor('white').setFontWeight('bold');

    // Congelar cabeçalhos
    painel.setFrozenRows(5);

    // Formatação
    painel.setColumnWidth(1, 200); // Cliente
    painel.setColumnWidth(2, 120); // Telefone
    painel.setColumnWidth(3, 180); // Serviço
    painel.setColumnWidth(4, 120); // Data
    painel.setColumnWidth(5, 80);  // Dias
    painel.setColumnWidth(6, 120); // Status
  }
}

// Função para limpar dados antigos
function limparDadosAntigos() {
  const planilha = SpreadsheetApp.getActive();

  // Limpar Fila WhatsApp (manter cabeçalho)
  const fila = planilha.getSheetByName('Fila WhatsApp');
  if (fila) {
    const ultimaLinha = fila.getLastRow();
    if (ultimaLinha > 1) {
      fila.getRange(2, 1, ultimaLinha - 1, fila.getLastColumn()).clearContent();
    }
  }

  // Limpar lista de clientes no Painel (manter cabeçalhos)
  const painel = planilha.getSheetByName('Painel Recorrência');
  if (painel) {
    const ultimaLinha = painel.getLastRow();
    if (ultimaLinha > 5) {
      painel.getRange(6, 1, ultimaLinha - 5, painel.getLastColumn()).clearContent();
    }
  }
}

// Função principal para processar serviços
function processarServicos() {
  const planilha = SpreadsheetApp.getActive();
  const fila = planilha.getSheetByName('Fila WhatsApp');
  const painel = planilha.getSheetByName('Painel Recorrência');

  // Ler template de mensagem
  const configAba = planilha.getSheetByName('Configurações');
  const textoMensagem = configAba ? configAba.getRange('A1').getValue() : getMensagemPadrao();

  const hoje = new Date();
  const dataAtual = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  // Contadores para estatísticas
  let totalAtrasados = 0;
  let totalProximos = 0;
  let totalContatos = 0;

  // Lista para evitar duplicatas no painel
  const clientesProcessados = {};

  // Processar todas as abas de serviço
  const abasServico = planilha.getSheets().filter(function(aba) {
    const cabecalhos = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0];
    return cabecalhos.includes('Nome') &&
           cabecalhos.includes('Data Retorno') &&
           cabecalhos.includes('Telefone') &&
           cabecalhos.includes('Serviço');
  });

  abasServico.forEach(function(aba) {
    const cabecalhos = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0];
    const indice = {};

    cabecalhos.forEach(function(coluna, posicao) {
      indice[coluna] = posicao;
    });

    const dados = aba.getRange(2, 1, aba.getLastRow() - 1, aba.getLastColumn()).getValues();

    dados.forEach(function(linha) {
      const nome = linha[indice['Nome']];
      const telefoneOriginal = linha[indice['Telefone']];
      const servico = linha[indice['Serviço']];
      const dataRetorno = linha[indice['Data Retorno']];
      const status = linha[indice['Status']] || '';

      // Limpar e formatar telefone
      const telefone = String(telefoneOriginal || '').replace(/\D/g, '');

      // Validar dados mínimos
      if (!nome || !telefone || !dataRetorno) {
        return;
      }

      const dataRetornoObj = new Date(dataRetorno);
      const diffTime = dataRetornoObj - dataAtual;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Determinar status
      let statusCliente = '';
      let prioridade = 0;

      if (diffDays < 0) {
        statusCliente = '🔴 ATRASADO';
        prioridade = 1;
        totalAtrasados++;
      } else if (diffDays <= 7) {
        statusCliente = '🟡 PRÓXIMO (' + diffDays + ' dias)';
        prioridade = 2;
        totalProximos++;
      } else if (diffDays <= 15) {
        statusCliente = '🟢 AGENDADO';
        prioridade = 3;
      } else {
        return; // Não processar serviços muito distantes
      }

      // Verificar se já foi processado (evitar duplicatas)
      const chaveCliente = telefone + '_' + dataRetorno;
      if (clientesProcessados[chaveCliente]) {
        return;
      }
      clientesProcessados[chaveCliente] = true;

      // Formatando dados
      const dataFormatada = Utilities.formatDate(dataRetornoObj, 'America/Sao_Paulo', 'dd/MM/yyyy');

      // Criar mensagem personalizada
      const mensagem = textoMensagem
        .replace('{nome}', nome)
        .replace('{servico}', servico)
        .replace('{dataRetorno}', dataFormatada);

      // Criar link WhatsApp
      const link = 'https://wa.me/55' + telefone + '?text=' + encodeURIComponent(mensagem);

      // Adicionar à Fila WhatsApp
      fila.appendRow([
        nome,
        telefone,
        servico,
        dataFormatada,
        diffDays,
        statusCliente,
        mensagem,
        link,
        'NÃO',
        ''
      ]);

      // Adicionar ao Painel Recorrência (lista consolidada)
      painel.appendRow([
        nome,
        telefone,
        servico,
        dataFormatada,
        diffDays,
        statusCliente
      ]);

      totalContatos++;
    });
  });

  // Atualizar estatísticas no painel
  painel.getRange('A2').setValue(Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm'));
  painel.getRange('B2').setValue('Atualizado automaticamente');
  painel.getRange('A3').setValue(totalAtrasados);
  painel.getRange('B3').setValue(totalProximos);
  painel.getRange('C3').setValue(totalContatos);

  // Ordenar Fila WhatsApp por prioridade (atrasados primeiro)
  ordenarFilaWhatsApp();

  // Aplicar formatação condicional
  aplicarFormatacaoCondicional();
}

// Função para ordenar a fila por prioridade
function ordenarFilaWhatsApp() {
  const fila = SpreadsheetApp.getActive().getSheetByName('Fila WhatsApp');

  if (fila.getLastRow() <= 1) return;

  // Obter todos os dados (exceto cabeçalho)
  const dados = fila.getRange(2, 1, fila.getLastRow() - 1, fila.getLastColumn()).getValues();

  // Ordenar: primeiro atrasados, depois próximos, depois agendados
  dados.sort(function(a, b) {
    // Extrair prioridade do status
    const getPrioridade = function(status) {
      if (status.includes('🔴')) return 1;
      if (status.includes('🟡')) return 2;
      return 3;
    };

    return getPrioridade(a[5]) - getPrioridade(b[5]);
  });

  // Limpar e reescrever dados ordenados
  fila.getRange(2, 1, fila.getLastRow() - 1, fila.getLastColumn()).clearContent();
  fila.getRange(2, 1, dados.length, dados[0].length).setValues(dados);
}

// Função para aplicar formatação condicional
function aplicarFormatacaoCondicional() {
  const fila = SpreadsheetApp.getActive().getSheetByName('Fila WhatsApp');
  const painel = SpreadsheetApp.getActive().getSheetByName('Painel Recorrência');

  // Limpar formatações existentes
  fila.clearConditionalFormatRules();
  painel.clearConditionalFormatRules();

  // Formatação para Fila WhatsApp
  const regraAtrasadoFila = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('🔴')
    .setBackground('#FFEBEE')
    .setFontColor('#D32F2F')
    .setRanges([fila.getRange('A2:J' + fila.getLastRow())])
    .build();

  const regraProximoFila = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('🟡')
    .setBackground('#FFF8E1')
    .setFontColor('#F57C00')
    .setRanges([fila.getRange('A2:J' + fila.getLastRow())])
    .build();

  const regraAgendadoFila = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('🟢')
    .setBackground('#E8F5E9')
    .setFontColor('#388E3C')
    .setRanges([fila.getRange('A2:J' + fila.getLastRow())])
    .build();

  fila.setConditionalFormatRules([regraAtrasadoFila, regraProximoFila, regraAgendadoFila]);

  // Formatação para Painel Recorrência
  const regraAtrasadoPainel = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('🔴')
    .setBackground('#FFEBEE')
    .setFontColor('#D32F2F')
    .setRanges([painel.getRange('A6:F' + painel.getLastRow())])
    .build();

  const regraProximoPainel = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('🟡')
    .setBackground('#FFF8E1')
    .setFontColor('#F57C00')
    .setRanges([painel.getRange('A6:F' + painel.getLastRow())])
    .build();

  const regraAgendadoPainel = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('🟢')
    .setBackground('#E8F5E9')
    .setFontColor('#388E3C')
    .setRanges([painel.getRange('A6:F' + painel.getLastRow())])
    .build();

  painel.setConditionalFormatRules([regraAtrasadoPainel, regraProximoPainel, regraAgendadoPainel]);
}

// Função para atualizar o painel de recorrência
function atualizarPainelRecorrencia() {
  const planilha = SpreadsheetApp.getActive();
  const painel = planilha.getSheetByName('Painel Recorrência');

  // Atualizar data/hora
  painel.getRange('A2').setValue(Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm'));
  painel.getRange('B2').setValue('Sistema atualizado automaticamente');

  // Aplicar formatação
  painel.getRange('A2:B2').setBackground('#E8F5E9');
  painel.getRange('A3:C3').setBackground('#C8E6C9');
}

// Função para criar gatilho diário
function criarGatilhoDiario() {
  // Verificar se gatilho já existe
  const gatilhosExistentes = ScriptApp.getProjectTriggers();

  for (let i = 0; i < gatilhosExistentes.length; i++) {
    if (gatilhosExistentes[i].getHandlerFunction() === 'executarAutomacaoCompleta') {
      return; // Gatilho já existe
    }
  }

  // Criar novo gatilho para executar todos os dias às 8h
  const hora = 8;
  const minuto = 0;

  const dataAtual = new Date();
  const dataGatilho = new Date(
    dataAtual.getFullYear(),
    dataAtual.getMonth(),
    dataAtual.getDate(),
    hora,
    minuto,
    0
  );

  if (dataAtual > dataGatilho) {
    dataGatilho.setDate(dataGatilho.getDate() + 1);
  }

  ScriptApp.newTrigger('executarAutomacaoCompleta')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();

  Logger.log('Gatilho diário criado para executar às ' + hora + 'h');
}

// Função para obter mensagem padrão
function getMensagemPadrao() {
  return `Olá, {nome},

O serviço de {servico} está próximo do período recomendado para renovação do certificado de garantia. A data prevista para o retorno é {dataRetorno}.
Deseja agendar uma nova visita? Entre em contato conosco para combinarmos o melhor dia e horário.
Estamos à disposição para garantir que seu ambiente continue protegido e seguro.

Atenciosamente,
Equipe Fimpra`;
}

// Função para teste manual
function testeManual() {
  executarAutomacaoCompleta();
}

// Função para limpar todos os gatilhos (para reiniciar)
function limparGatilhos() {
  const gatilhos = ScriptApp.getProjectTriggers();

  gatilhos.forEach(function(gatilho) {
    ScriptApp.deleteTrigger(gatilho);
  });

  SpreadsheetApp.getUi().alert('Todos os gatilhos foram removidos.');
}

// Função para exportar relatório
function exportarRelatorio() {
  const planilha = SpreadsheetApp.getActive();
  const painel = planilha.getSheetByName('Painel Recorrência');

  const data = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd-MM-yyyy');
  const nomeArquivo = 'Relatorio_Recorrencia_' + data;

  // Criar nova planilha com relatório
  const novaPlanilha = SpreadsheetApp.create(nomeArquivo);

  // Copiar dados do painel
  const dados = painel.getDataRange().getValues();
  novaPlanilha.getActiveSheet().getRange(1, 1, dados.length, dados[0].length).setValues(dados);

  // Formatar
  novaPlanilha.getActiveSheet().setFrozenRows(5);
  novaPlanilha.getActiveSheet().getRange('A1:F1').setBackground('#2E7D32').setFontColor('white').setFontWeight('bold');

  SpreadsheetApp.getUi().alert('Relatório exportado: ' + novaPlanilha.getUrl());
}

// Função para marcar como enviado
function marcarComoEnviado() {
  const planilha = SpreadsheetApp.getActive();
  const fila = planilha.getSheetByName('Fila WhatsApp');
  const sheet = planilha.getActiveSheet();

  if (sheet.getName() !== 'Fila WhatsApp') {
    SpreadsheetApp.getUi().alert('Por favor, selecione a aba "Fila WhatsApp".');
    return;
  }

  const linha = sheet.getActiveCell().getRow();

  if (linha < 2) {
    SpreadsheetApp.getUi().alert('Selecione uma linha com dados.');
    return;
  }

  // Marcar como enviado
  fila.getRange(linha, 9).setValue('SIM');
  fila.getRange(linha, 10).setValue(Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm'));

  SpreadsheetApp.getUi().alert('Marcado como enviado! ✅');
}

// Função para enviar e-mail de teste
function testeEmail() {
  const emailTeste = 'correavhc@gmail.com';

  MailApp.sendEmail(
    emailTeste,
    'Teste — Automação de Recorrência',
    'Se você recebeu esta mensagem, o envio de e-mail da automação está funcionando.'
  );

  SpreadsheetApp.getUi().alert('E-mail de teste enviado para ' + emailTeste);
}