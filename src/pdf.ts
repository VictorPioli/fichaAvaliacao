import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export type Ficha = {
  nome: string
  idade: number | ''
  sexo: 'M' | 'F' | ''
  massaCorporal: number | ''
  estatura: number | ''
  ocupacao: string
  objetivos: string
  habitosDeVida: string
  praticaExercicio: 'Sim' | 'Não' | ''
  qualExercicio?: string
  qualidadeSono: 'ruim' | 'regular' | 'bom' | ''
  alimentacao: 'ruim' | 'regular' | 'bom' | ''
  nivelEstresse: 'baixo' | 'medio' | 'alto' | ''
  historiaMedica: string
  diagnosticoClinico: string
  lesoesCirurgias: 'Sim' | 'Não' | ''
  quaisLesoes?: string
  queixaDor: string
  limitacaoAVD: 'baixo' | 'medio' | 'alto' | ''
  terapiasAnteriores: 'Sim' | 'Não' | ''
  quaisTerapias?: string
  usoMedicamentos: 'Sim' | 'Não' | ''
  quaisMedicamentos?: string
  terapiasConcomitantes: 'Sim' | 'Não' | ''
  quaisTerapiasConcomitantes?: string
  historicoFamiliar: string
  familiarDoencas: 'Sim' | 'Não' | ''
  quaisDoencasFamilia?: string
}

async function loadImageAsDataURL(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    return await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export async function generateFichaPdf(ficha: Ficha) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  // Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('Ficha de Avaliação', 40, 40)

  const NA = 'N/A'
  const rows: Array<[string, string]> = [
    ['Nome', ficha.nome || NA],
    ['Idade', ficha.idade !== '' ? String(ficha.idade) : NA],
    ['Sexo', ficha.sexo || NA],
    ['Massa corporal (kg)', ficha.massaCorporal !== '' ? String(ficha.massaCorporal) : NA],
    ['Estatura (cm)', ficha.estatura !== '' ? String(ficha.estatura) : NA],
    ['Ocupação', ficha.ocupacao || NA],
    ['Objetivos', ficha.objetivos || NA],
    ['Hábitos de vida', ficha.habitosDeVida || NA],
    ['Pratica exercício?', ficha.praticaExercicio || NA],
    ['Qual exercício', ficha.qualExercicio || NA],
    ['Qualidade do sono', ficha.qualidadeSono || NA],
    ['Alimentação', ficha.alimentacao || NA],
    ['Nível de estresse/cansaço', ficha.nivelEstresse || NA],
    ['História médica', ficha.historiaMedica || NA],
    ['Diagnóstico clínico', ficha.diagnosticoClinico || NA],
    ['Lesões/cirurgias anteriores?', ficha.lesoesCirurgias || NA],
    ['Quais lesões/cirurgias', ficha.quaisLesoes || NA],
    ['Queixa de dor', ficha.queixaDor || NA],
    ["Limitação para AVD's", ficha.limitacaoAVD || NA],
    ['Terapias anteriores?', ficha.terapiasAnteriores || NA],
    ['Quais terapias', ficha.quaisTerapias || NA],
    ['Uso de medicamentos?', ficha.usoMedicamentos || NA],
    ['Quais medicamentos', ficha.quaisMedicamentos || NA],
    ['Terapias concomitantes?', ficha.terapiasConcomitantes || NA],
    ['Quais terapias concomitantes', ficha.quaisTerapiasConcomitantes || NA],
    ['Histórico familiar', ficha.historicoFamiliar || NA],
    ['Familiar com doenças?', ficha.familiarDoencas || NA],
    ['Quais doenças na família', ficha.quaisDoencasFamilia || NA]
  ]

  autoTable(doc, {
    startY: 60,
    head: [['Campo', 'Valor']],
    body: rows,
    styles: { fontSize: 11, cellPadding: 6 },
    headStyles: { fillColor: [122, 167, 204], textColor: 13 },
    alternateRowStyles: { fillColor: [236, 236, 236] },
  })

  // Página 2 — Avaliação biomecânica: Agachamento
  doc.addPage('a4', 'portrait')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('Avaliação Biomecânica — Agachamento', 40, 40)

  // Inserir imagem do exercício (salve em /public/squat.png)
  // Tenta carregar a imagem; aceita PNG ou JPG
  const imgData = await loadImageAsDataURL('/squat.png') || await loadImageAsDataURL('/squat.jpg') || await loadImageAsDataURL('/squat.jpeg')
  const imgX = 40
  const imgY = 60
  const imgW = 260
  const imgH = 260
  if (imgData) {
    try {
      // Detecta tipo pelo prefixo data URL
      const format = imgData.startsWith('data:image/jpeg') || imgData.startsWith('data:image/jpg') ? 'JPEG' : 'PNG'
      doc.addImage(imgData, format as any, imgX, imgY, imgW, imgH)
    } catch (err) {
      // Em caso de PNG corrompido, renderiza placeholder
      doc.setDrawColor(180)
      doc.rect(imgX, imgY, imgW, imgH)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text('Falha ao carregar imagem. Use JPG/JPEG ou um PNG válido.', imgX + 8, imgY + 18)
    }
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text('Imagem não encontrada (adicione /public/squat.png ou /squat.jpg)', imgX, imgY + 12)
  }

  // Checklist
  const checklistStartY = imgY + imgH + 20
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Checklist de avaliação:', 40, checklistStartY)

  const items = [
    'Tronco paralelo à tíbia',
    'Fêmur alinhado ou abaixo da linha horizontal',
    'Joelhos alinhados sobre os pés no plano sagital',
    'Manutenção de estabilidade lombar',
    'Estabilidade do arco plantar',
    'Presença de dor'
  ]

  let y = checklistStartY + 12
  const colX = [40, 330]
  const lineHeight = 18
  const half = Math.ceil(items.length / 2)
  items.forEach((label, idx) => {
    const column = idx < half ? 0 : 1
    const drawY = y + (idx % half) * lineHeight
    doc.rect(colX[column], drawY - 10, 12, 12)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text(label, colX[column] + 18, drawY)
  })

  // Área de comentários com linhas
  const notesTitleY = y + half * lineHeight + 24
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Comentários e anotações:', 40, notesTitleY)

  const startLinesY = notesTitleY + 10
  const lineGap = 18
  const rightMargin = 555
  for (let i = 0; i < 12; i++) {
    const ly = startLinesY + i * lineGap
    doc.setDrawColor(200)
    doc.line(40, ly, rightMargin, ly)
  }

  // Página 3 — ADM DE QUADRIL
  doc.addPage('a4', 'portrait')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('ADM DE QUADRIL', 40, 40)

  // Objetivo
  let currentY = 70
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('OBJETIVO:', 40, currentY)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const objetivo = 'Avaliar de forma isolada a mobilidade do quadril, bem como suas individualidades anatômicas e/ou teciduais.'
  const objetivoLines = doc.splitTextToSize(objetivo, 515)
  doc.text(objetivoLines, 40, currentY + 15)
  currentY += 15 + (objetivoLines.length * 12) + 15

  // Inserir imagem ADM de quadril
  const imgDataQuadril = await loadImageAsDataURL('/adm-quadril.png') || await loadImageAsDataURL('/adm-quadril.jpg') || await loadImageAsDataURL('/adm-quadril.jpeg')
  const imgQuadrilX = 40
  const imgQuadrilY = currentY
  const imgQuadrilW = 260
  const imgQuadrilH = 160
  if (imgDataQuadril) {
    try {
      const format = imgDataQuadril.startsWith('data:image/jpeg') || imgDataQuadril.startsWith('data:image/jpg') ? 'JPEG' : 'PNG'
      doc.addImage(imgDataQuadril, format as any, imgQuadrilX, imgQuadrilY, imgQuadrilW, imgQuadrilH)
    } catch (err) {
      doc.setDrawColor(180)
      doc.rect(imgQuadrilX, imgQuadrilY, imgQuadrilW, imgQuadrilH)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text('Falha ao carregar imagem. Use JPG/JPEG ou um PNG válido.', imgQuadrilX + 8, imgQuadrilY + 18)
    }
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text('Imagem não encontrada (adicione /public/adm-quadril.png ou .jpg)', imgQuadrilX, imgQuadrilY + 12)
  }
  currentY = imgQuadrilY + imgQuadrilH + 20

  // Passo a passo
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('PASSO A PASSO:', 40, currentY)
  currentY += 20

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  
  // I. Posição inicial
  const posicaoCompleta = 'I. Posição inicial: Deitado em decúbito dorsal, com membros superiores e inferiores relaxados.'
  const posicaoLines = doc.splitTextToSize(posicaoCompleta, 515)
  doc.text(posicaoLines, 40, currentY)
  currentY += (posicaoLines.length * 12) + 8

  // II. Execução
  const execucaoCompleta = 'II. Execução: De forma passiva, o avaliador deve realizar a flexão de quadril até encontrar uma restrição, seja ela tecidual ou anatômica. Posteriormente, pode-se testar o mesmo movimento associado à abdução de quadril.'
  const execucaoLines = doc.splitTextToSize(execucaoCompleta, 515)
  doc.text(execucaoLines, 40, currentY)
  currentY += (execucaoLines.length * 12) + 8

  // III. Realizar teste
  const testeCompleto = 'III. Realizar o teste dos dois lados e avaliar possíveis assimetrias.'
  const testeLines = doc.splitTextToSize(testeCompleto, 515)
  doc.text(testeLines, 40, currentY)
  currentY += 25

  // Itens para avaliar
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('ITENS PARA AVALIAR:', 40, currentY)
  currentY += 20

  const avaliacaoItems = [
    'Amplitude de movimento',
    'Presença de dor',
    'Presença de restrição tecidual e/ou anatômica'
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  avaliacaoItems.forEach((item) => {
    doc.rect(40, currentY - 10, 12, 12)
    doc.text(item, 58, currentY)
    currentY += 18
  })

  currentY += 10

  // Comentários e anotações
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Comentários e anotações relevantes:', 40, currentY)
  
  const commentsStartY = currentY + 10
  for (let i = 0; i < 15; i++) {
    const lineY = commentsStartY + i * 18
    if (lineY > 780) break // Evita ultrapassar a página
    doc.setDrawColor(200)
    doc.line(40, lineY, 555, lineY)
  }

  // Página 4 — ESTABILIDADE LOMBAR
  doc.addPage('a4', 'portrait')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('ESTABILIDADE LOMBAR', 40, 40)

  // Objetivo
  let currentY4 = 70
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('OBJETIVO:', 40, currentY4)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const objetivoLombar = 'Avaliar a capacidade do aluno/paciente em manter a coluna lombar estável enquanto se movimenta a partir do quadril.'
  const objetivoLombarLines = doc.splitTextToSize(objetivoLombar, 515)
  doc.text(objetivoLombarLines, 40, currentY4 + 15)
  currentY4 += 15 + (objetivoLombarLines.length * 12) + 15

  // Inserir imagem movimento quadril
  const imgDataLombar = await loadImageAsDataURL('/quadril.png') || await loadImageAsDataURL('/movimento-quadril.jpg') || await loadImageAsDataURL('/movimento-quadril.jpeg')
  const imgLombarX = 40
  const imgLombarY = currentY4
  const imgLombarW = 260
  const imgLombarH = 160
  if (imgDataLombar) {
    try {
      const format = imgDataLombar.startsWith('data:image/jpeg') || imgDataLombar.startsWith('data:image/jpg') ? 'JPEG' : 'PNG'
      doc.addImage(imgDataLombar, format as any, imgLombarX, imgLombarY, imgLombarW, imgLombarH)
    } catch (err) {
      doc.setDrawColor(180)
      doc.rect(imgLombarX, imgLombarY, imgLombarW, imgLombarH)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text('Falha ao carregar imagem. Use JPG/JPEG ou um PNG válido.', imgLombarX + 8, imgLombarY + 18)
    }
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text('Imagem não encontrada (adicione /public/movimento-quadril.png ou .jpg)', imgLombarX, imgLombarY + 12)
  }
  currentY4 = imgLombarY + imgLombarH + 20

  // Passo a passo
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('PASSO A PASSO:', 40, currentY4)
  currentY4 += 20

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  
  // I. Posição inicial
  const posicaoLombar = 'I. Posição inicial: Em quatro apoios, com os joelhos na largura do quadril e as mãos próximas aos joelhos (em média um palmo de distância), e com preservação das curvaturas fisiológicas da coluna vertebral.'
  const posicaoLombarLines = doc.splitTextToSize(posicaoLombar, 515)
  doc.text(posicaoLombarLines, 40, currentY4)
  currentY4 += (posicaoLombarLines.length * 12) + 8

  // II. Execução
  const execucaoLombar = 'II. Execução: O avaliado deve realizar o movimento de tentar levar o quadril em direção aos calcanhares (os tornozelos podem ficar relaxados).'
  const execucaoLombarLines = doc.splitTextToSize(execucaoLombar, 515)
  doc.text(execucaoLombarLines, 40, currentY4)
  currentY4 += (execucaoLombarLines.length * 12) + 8

  // III. Avaliar movimento
  const avaliarLombar = 'III. Avaliar o mesmo movimento com diferentes angulações de abdução de quadril.'
  const avaliarLombarLines = doc.splitTextToSize(avaliarLombar, 515)
  doc.text(avaliarLombarLines, 40, currentY4)
  currentY4 += (avaliarLombarLines.length * 12) + 25

  // Itens para avaliar
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('ITENS PARA AVALIAR:', 40, currentY4)
  currentY4 += 20

  const avaliacaoLombarItems = [
    'Amplitude de movimento',
    'Dissociação quadril/lombar (manutenção das curvaturas fisiológicas)',
    'Presença de dor'
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  avaliacaoLombarItems.forEach((item) => {
    doc.rect(40, currentY4 - 10, 12, 12)
    doc.text(item, 58, currentY4)
    currentY4 += 18
  })

  currentY4 += 10

  // Comentários e anotações
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Comentários e anotações relevantes:', 40, currentY4)
  
  const commentsStartY4 = currentY4 + 10
  for (let i = 0; i < 15; i++) {
    const lineY = commentsStartY4 + i * 18
    if (lineY > 780) break // Evita ultrapassar a página
    doc.setDrawColor(200)
    doc.line(40, lineY, 555, lineY)
  }

  // Página 5 — ATERRISSAGEM DO SALTO
  doc.addPage('a4', 'portrait')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('ATERRISSAGEM DO SALTO', 40, 40)

  // Objetivo
  let currentY5 = 70
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('OBJETIVO:', 40, currentY5)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const objetivoSalto = 'Avaliar a qualidade dos movimentos do tronco e do membro inferior e a associação com lesões durante uma tarefa de salto horizontal anterior seguido de salto vertical máximo.'
  const objetivoSaltoLines = doc.splitTextToSize(objetivoSalto, 515)
  doc.text(objetivoSaltoLines, 40, currentY5 + 15)
  currentY5 += 15 + (objetivoSaltoLines.length * 12) + 15

  // Inserir imagem salto
  const imgDataSalto = await loadImageAsDataURL('/salto.png') || await loadImageAsDataURL('/salto.jpg') || await loadImageAsDataURL('/salto.jpeg')
  const imgSaltoX = 40
  const imgSaltoY = currentY5
  const imgSaltoW = 260
  const imgSaltoH = 160
  if (imgDataSalto) {
    try {
      const format = imgDataSalto.startsWith('data:image/jpeg') || imgDataSalto.startsWith('data:image/jpg') ? 'JPEG' : 'PNG'
      doc.addImage(imgDataSalto, format as any, imgSaltoX, imgSaltoY, imgSaltoW, imgSaltoH)
    } catch (err) {
      doc.setDrawColor(180)
      doc.rect(imgSaltoX, imgSaltoY, imgSaltoW, imgSaltoH)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text('Falha ao carregar imagem. Use JPG/JPEG ou um PNG válido.', imgSaltoX + 8, imgSaltoY + 18)
    }
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text('Imagem não encontrada (adicione /public/salto.png ou .jpg)', imgSaltoX, imgSaltoY + 12)
  }
  currentY5 = imgSaltoY + imgSaltoH + 20

  // Passo a passo
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('PASSO A PASSO:', 40, currentY5)
  currentY5 += 20

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  
  // I. Posição inicial
  const posicaoSalto = 'I. Posição inicial: Posicionar o avaliado sobre uma caixa de 30cm de altura que se encontre a uma distância de 30cm em relação à área de aterrissagem.'
  const posicaoSaltoLines = doc.splitTextToSize(posicaoSalto, 515)
  doc.text(posicaoSaltoLines, 40, currentY5)
  currentY5 += (posicaoSaltoLines.length * 12) + 8

  // II. Execução
  const execucaoSalto = 'II. Execução: O avaliado é orientado a saltar anteriormente, aterrissar com ambos os pés sobre a área de aterrissagem e realizar imediatamente um salto vertical máximo. Nenhuma instrução verbal sobre a qualidade é dada, sendo realizadas três repetições da tarefa. A aterrissagem do primeiro salto (salto anterior) é considerada na avaliação.'
  const execucaoSaltoLines = doc.splitTextToSize(execucaoSalto, 515)
  doc.text(execucaoSaltoLines, 40, currentY5)
  currentY5 += (execucaoSaltoLines.length * 12) + 25

  // Itens para avaliar
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('ITENS PARA AVALIAR:', 40, currentY5)
  currentY5 += 20

  const avaliacaoSaltoItems = [
    'Largura da base',
    'Máxima rotação dos pés',
    'Simetria no contato inicial do pé',
    'Máximo ângulo de valgo do joelho',
    'Quantidade de inclinação lateral do tronco',
    'Contato inicial dos pés com o solo (antepé ou retropé)',
    'Quantidade de flexão do tronco e de flexão do joelho',
    'Deslocamento total das articulações no plano sagital',
    'Impressão geral da aterrissagem'
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  avaliacaoSaltoItems.forEach((item) => {
    doc.rect(40, currentY5 - 10, 12, 12)
    doc.text(item, 58, currentY5)
    currentY5 += 18
  })

  currentY5 += 10

  // Comentários e anotações
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Comentários e anotações relevantes:', 40, currentY5)
  
  const commentsStartY5 = currentY5 + 10
  for (let i = 0; i < 15; i++) {
    const lineY = commentsStartY5 + i * 18
    if (lineY > 780) break // Evita ultrapassar a página
    doc.setDrawColor(200)
    doc.line(40, lineY, 555, lineY)
  }

  // Página 6 — ADM DE TORNOZELO PARA DORSIFLEXÃO
  doc.addPage('a4', 'portrait')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('ADM DE TORNOZELO PARA DORSIFLEXÃO', 40, 40)

  // Objetivo
  let currentY6 = 70
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('OBJETIVO:', 40, currentY6)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const objetivoTornozelo = 'Quantificar a mobilidade de tornozelo para dorsiflexão.'
  const objetivoTornozeloLines = doc.splitTextToSize(objetivoTornozelo, 515)
  doc.text(objetivoTornozeloLines, 40, currentY6 + 15)
  currentY6 += 15 + (objetivoTornozeloLines.length * 12) + 15

  // Inserir imagem tornozelo
  const imgDataTornozelo = await loadImageAsDataURL('/tornozelo.png') || await loadImageAsDataURL('/tornozelo.jpg') || await loadImageAsDataURL('/tornozelo.jpeg')
  const imgTornozeloX = 40
  const imgTornozeloY = currentY6
  const imgTornozeloW = 260
  const imgTornozeloH = 160
  if (imgDataTornozelo) {
    try {
      const format = imgDataTornozelo.startsWith('data:image/jpeg') || imgDataTornozelo.startsWith('data:image/jpg') ? 'JPEG' : 'PNG'
      doc.addImage(imgDataTornozelo, format as any, imgTornozeloX, imgTornozeloY, imgTornozeloW, imgTornozeloH)
    } catch (err) {
      doc.setDrawColor(180)
      doc.rect(imgTornozeloX, imgTornozeloY, imgTornozeloW, imgTornozeloH)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text('Falha ao carregar imagem. Use JPG/JPEG ou um PNG válido.', imgTornozeloX + 8, imgTornozeloY + 18)
    }
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text('Imagem não encontrada (adicione /public/tornozelo.png ou .jpg)', imgTornozeloX, imgTornozeloY + 12)
  }
  currentY6 = imgTornozeloY + imgTornozeloH + 20

  // Passo a passo
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('PASSO A PASSO:', 40, currentY6)
  currentY6 += 20

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  
  // I. Posição inicial
  const posicaoTornozelo = 'I. Posição inicial: Em pé, de frente para a parede, com o tornozelo a ser avaliado à frente e o de trás com o calcanhar elevado e apontado para o teto. Manter joelho do membro inferior de trás flexionado.'
  const posicaoTornozeloLines = doc.splitTextToSize(posicaoTornozelo, 515)
  doc.text(posicaoTornozeloLines, 40, currentY6)
  currentY6 += (posicaoTornozeloLines.length * 12) + 8

  // II. Execução
  const execucaoTornozelo = 'II. Execução: Realizar a máxima dorsiflexão de tornozelo, tocando o joelho na fita fixada na parede, sem elevar o calcanhar do membro inferior que está sendo avaliado e/ou realizar compensações nas articulações do joelho, quadril ou tronco.'
  const execucaoTornozeloLines = doc.splitTextToSize(execucaoTornozelo, 515)
  doc.text(execucaoTornozeloLines, 40, currentY6)
  currentY6 += (execucaoTornozeloLines.length * 12) + 8

  // III. Mensurar
  const mensurarTornozelo = 'III. Mensurar a inclinação da tíbia com um inclinômetro (calibrar na vertical), o qual deve estar posicionado a 15cm da tuberosidade anterior da tíbia.'
  const mensurarTornozeloLines = doc.splitTextToSize(mensurarTornozelo, 515)
  doc.text(mensurarTornozeloLines, 40, currentY6)
  currentY6 += (mensurarTornozeloLines.length * 12) + 8

  // IV. Realizar teste
  const realizarTeste = 'IV. Realizar o teste dos dois lados e avaliar possíveis assimetrias.'
  const realizarTesteLines = doc.splitTextToSize(realizarTeste, 515)
  doc.text(realizarTesteLines, 40, currentY6)
  currentY6 += (realizarTesteLines.length * 12) + 25

  // Itens para avaliar
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('ITENS PARA AVALIAR:', 40, currentY6)
  currentY6 += 20

  const avaliacaoTornozeloItems = [
    'Ângulo de dorsiflexão (deve ser próximo de 45°; quando < 36° e/ou assimetria > 5°, indica maior potencial de lesão)',
    'Presença de dor'
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  avaliacaoTornozeloItems.forEach((item) => {
    const itemLines = doc.splitTextToSize(item, 495)
    doc.rect(40, currentY6 - 10, 12, 12)
    doc.text(itemLines, 58, currentY6)
    currentY6 += (itemLines.length * 12) + 6
  })

  currentY6 += 10

  // Comentários e anotações
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Comentários e anotações relevantes:', 40, currentY6)
  
  const commentsStartY6 = currentY6 + 10
  for (let i = 0; i < 15; i++) {
    const lineY = commentsStartY6 + i * 18
    if (lineY > 780) break // Evita ultrapassar a página
    doc.setDrawColor(200)
    doc.line(40, lineY, 555, lineY)
  }

  // Página 7 — RIGIDEZ DOS ROTADORES EXTERNOS DO QUADRIL
  doc.addPage('a4', 'portrait')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('RIGIDEZ DOS ROTADORES EXTERNOS DO QUADRIL', 40, 40)

  // Objetivo
  let currentY7 = 70
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('OBJETIVO:', 40, currentY7)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const objetivoRotadores = 'Quantificar a rigidez dos rotadores externos do quadril.'
  const objetivoRotadoresLines = doc.splitTextToSize(objetivoRotadores, 515)
  doc.text(objetivoRotadoresLines, 40, currentY7 + 15)
  currentY7 += 15 + (objetivoRotadoresLines.length * 12) + 15

  // Inserir imagem rotadores externos
  const imgDataRotadores = await loadImageAsDataURL('/rotadores.png') || await loadImageAsDataURL('/rotadores-externos.jpg') || await loadImageAsDataURL('/rotadores-externos.jpeg')
  const imgRotadoresX = 40
  const imgRotadoresY = currentY7
  const imgRotadoresW = 260
  const imgRotadoresH = 160
  if (imgDataRotadores) {
    try {
      const format = imgDataRotadores.startsWith('data:image/jpeg') || imgDataRotadores.startsWith('data:image/jpg') ? 'JPEG' : 'PNG'
      doc.addImage(imgDataRotadores, format as any, imgRotadoresX, imgRotadoresY, imgRotadoresW, imgRotadoresH)
    } catch (err) {
      doc.setDrawColor(180)
      doc.rect(imgRotadoresX, imgRotadoresY, imgRotadoresW, imgRotadoresH)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text('Falha ao carregar imagem. Use JPG/JPEG ou um PNG válido.', imgRotadoresX + 8, imgRotadoresY + 18)
    }
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text('Imagem não encontrada (adicione /public/rotadores-externos.png ou .jpg)', imgRotadoresX, imgRotadoresY + 12)
  }
  currentY7 = imgRotadoresY + imgRotadoresH + 20

  // Passo a passo
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('PASSO A PASSO:', 40, currentY7)
  currentY7 += 20

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  
  // I. Posição inicial
  const posicaoRotadores = 'I. Posição inicial: Deitado em decúbito ventral, com um joelho flexionado a 90° e com quadril estabilizado.'
  const posicaoRotadoresLines = doc.splitTextToSize(posicaoRotadores, 515)
  doc.text(posicaoRotadoresLines, 40, currentY7)
  currentY7 += (posicaoRotadoresLines.length * 12) + 8

  // II. Execução
  const execucaoRotadores = 'II. Execução: Inicialmente o avaliador pode realizar alguns movimentos de rotação interna e externa de quadril para permitir a acomodação viscoelástica do tecido. Depois, de forma passiva, o avaliador deve realizar a rotação medial do quadril até encontrar uma restrição, seja ela tecidual ou anatômica.'
  const execucaoRotadoresLines = doc.splitTextToSize(execucaoRotadores, 515)
  doc.text(execucaoRotadoresLines, 40, currentY7)
  currentY7 += (execucaoRotadoresLines.length * 12) + 8

  // III. Mensurar
  const mensurarRotadores = 'III. Mensurar a rotação interna do quadril com um inclinômetro (calibrar na vertical), o qual deve estar posicionado a 5cm da tuberosidade anterior da tíbia.'
  const mensurarRotadoresLines = doc.splitTextToSize(mensurarRotadores, 515)
  doc.text(mensurarRotadoresLines, 40, currentY7)
  currentY7 += (mensurarRotadoresLines.length * 12) + 8

  // IV. Realizar teste
  const realizarRotadores = 'IV. Realizar o teste dos dois lados e avaliar possíveis assimetrias.'
  const realizarRotadoresLines = doc.splitTextToSize(realizarRotadores, 515)
  doc.text(realizarRotadoresLines, 40, currentY7)
  currentY7 += (realizarRotadoresLines.length * 12) + 25

  // Itens para avaliar
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('ITENS PARA AVALIAR:', 40, currentY7)
  currentY7 += 20

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const admRotacao = 'ADM de rotação interna (entre 30° e 40°; cuidar com assimetria > 5°, pois aumentará o potencial de lesão).'
  const admRotacaoLines = doc.splitTextToSize(admRotacao, 495)
  doc.rect(40, currentY7 - 10, 12, 12)
  doc.text(admRotacaoLines, 58, currentY7)
  currentY7 += (admRotacaoLines.length * 12) + 30

  // Tabela de rigidez
  const tableY = currentY7
  const colWidth = 235
  const rowHeight = 35
  
  // Header da tabela
  doc.setFillColor(220, 220, 220)
  doc.rect(40, tableY, colWidth, rowHeight, 'FD')
  doc.rect(40 + colWidth, tableY, colWidth, rowHeight, 'FD')
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('ALTA RIGIDEZ', 40 + colWidth/2, tableY + 12, { align: 'center' })
  doc.text('BAIXA RIGIDEZ', 40 + colWidth + colWidth/2, tableY + 12, { align: 'center' })
  doc.text('<30°', 40 + colWidth/2, tableY + 25, { align: 'center' })
  doc.text('>40°', 40 + colWidth + colWidth/2, tableY + 25, { align: 'center' })
  
  // Linhas da tabela com atenções
  const row2Y = tableY + rowHeight
  doc.rect(40, row2Y, colWidth, 40)
  doc.rect(40 + colWidth, row2Y, colWidth, 40)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const atencaoAlta = 'Atenção: possíveis lesões por impactação'
  const atencaoAltaLines = doc.splitTextToSize(atencaoAlta, colWidth - 10)
  doc.text(atencaoAltaLines, 45, row2Y + 12)
  
  const atencaoBaixa = 'Atenção: possíveis lesões por mecanismo pronador dos MMII'
  const atencaoBaixaLines = doc.splitTextToSize(atencaoBaixa, colWidth - 10)
  doc.text(atencaoBaixaLines, 45 + colWidth, row2Y + 12)
  
  currentY7 = row2Y + 40 + 25

  // Presença de dor
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.rect(40, currentY7 - 10, 12, 12)
  doc.text('Presença de dor', 58, currentY7)
  currentY7 += 25

  // Comentários e anotações
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Comentários e anotações relevantes:', 40, currentY7)
  
  const commentsStartY7 = currentY7 + 10
  for (let i = 0; i < 15; i++) {
    const lineY = commentsStartY7 + i * 18
    if (lineY > 780) break // Evita ultrapassar a página
    doc.setDrawColor(200)
    doc.line(40, lineY, 555, lineY)
  }

  // Página 8 — LATERAL STEP DOWN TEST
  doc.addPage('a4', 'portrait')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('LATERAL STEP DOWN TEST', 40, 40)

  // Objetivo
  let currentY8 = 70
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('OBJETIVO:', 40, currentY8)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const objetivoStepDown = 'Avaliar a estabilidade do joelho, arco plantar e tronco, o alinhamento da pelve, além do controle motor em apoio unipodal.'
  const objetivoStepDownLines = doc.splitTextToSize(objetivoStepDown, 515)
  doc.text(objetivoStepDownLines, 40, currentY8 + 15)
  currentY8 += 15 + (objetivoStepDownLines.length * 12) + 15

  // Inserir imagem step down
  const imgDataStepDown = await loadImageAsDataURL('/stepdown.png') || await loadImageAsDataURL('/step-down.jpg') || await loadImageAsDataURL('/step-down.jpeg')
  const imgStepDownX = 40
  const imgStepDownY = currentY8
  const imgStepDownW = 260
  const imgStepDownH = 160
  if (imgDataStepDown) {
    try {
      const format = imgDataStepDown.startsWith('data:image/jpeg') || imgDataStepDown.startsWith('data:image/jpg') ? 'JPEG' : 'PNG'
      doc.addImage(imgDataStepDown, format as any, imgStepDownX, imgStepDownY, imgStepDownW, imgStepDownH)
    } catch (err) {
      doc.setDrawColor(180)
      doc.rect(imgStepDownX, imgStepDownY, imgStepDownW, imgStepDownH)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text('Falha ao carregar imagem. Use JPG/JPEG ou um PNG válido.', imgStepDownX + 8, imgStepDownY + 18)
    }
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text('Imagem não encontrada (adicione /public/step-down.png ou .jpg)', imgStepDownX, imgStepDownY + 12)
  }
  currentY8 = imgStepDownY + imgStepDownH + 20

  // Passo a passo
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('PASSO A PASSO:', 40, currentY8)
  currentY8 += 20

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  
  // I. Posição inicial
  const posicaoStepDown = 'I. Posição inicial: Utilizar um step com altura de 10% em relação à estatura do avaliado (aproximadamente). Deixar um pé sobre o mesmo e o outro suspenso ao lado. Pode-se utilizar marcadores para facilitar a interpretação dos resultados (centro das articulações do tornozelo e joelho; espinha ilíaca anterossuperior).'
  const posicaoStepDownLines = doc.splitTextToSize(posicaoStepDown, 515)
  doc.text(posicaoStepDownLines, 40, currentY8)
  currentY8 += (posicaoStepDownLines.length * 12) + 8

  // II. Execução
  const execucaoStepDown = 'II. Execução: Realizar a descida lateral do step, tocar o solo com o calcanhar sem descarregar o peso e retornar para a posição inicial.'
  const execucaoStepDownLines = doc.splitTextToSize(execucaoStepDown, 515)
  doc.text(execucaoStepDownLines, 40, currentY8)
  currentY8 += (execucaoStepDownLines.length * 12) + 8

  // III. Realizar teste
  const realizarStepDown = 'III. Realizar o teste dos dois lados e avaliar possíveis assimetrias.'
  const realizarStepDownLines = doc.splitTextToSize(realizarStepDown, 515)
  doc.text(realizarStepDownLines, 40, currentY8)
  currentY8 += (realizarStepDownLines.length * 12) + 25

  // Itens para avaliar
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('ITENS PARA AVALIAR:', 40, currentY8)
  currentY8 += 20

  const avaliacaoStepDownItems = [
    'Joelhos alinhados sobre os pés no plano sagital (valgo dinâmico)',
    'Manutenção da estabilidade da pelve (drop da pelve)',
    'Estabilidade do arco plantar',
    'Controle motor em apoio unipodal',
    'Presença de dor'
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  avaliacaoStepDownItems.forEach((item) => {
    doc.rect(40, currentY8 - 10, 12, 12)
    doc.text(item, 58, currentY8)
    currentY8 += 18
  })

  currentY8 += 10

  // Comentários e anotações
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Comentários e anotações relevantes:', 40, currentY8)
  
  const commentsStartY8 = currentY8 + 10
  for (let i = 0; i < 15; i++) {
    const lineY = commentsStartY8 + i * 18
    if (lineY > 780) break // Evita ultrapassar a página
    doc.setDrawColor(200)
    doc.line(40, lineY, 555, lineY)
  }

  // Página 9 — COOK BRIDGE
  doc.addPage('a4', 'portrait')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('COOK BRIDGE', 40, 40)

  // Objetivo
  let currentY9 = 70
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('OBJETIVO:', 40, currentY9)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const objetivoCookBridge = 'Avaliar a função dos glúteos e o alinhamento da pelve em apoio unipodal (estabilidade anti-rotação do tronco).'
  const objetivoCookBridgeLines = doc.splitTextToSize(objetivoCookBridge, 515)
  doc.text(objetivoCookBridgeLines, 40, currentY9 + 15)
  currentY9 += 15 + (objetivoCookBridgeLines.length * 12) + 15

  // Inserir imagem cook bridge
  const imgDataCookBridge = await loadImageAsDataURL('/cook-bridge.png') || await loadImageAsDataURL('/cook-bridge.jpg') || await loadImageAsDataURL('/cook-bridge.jpeg')
  const imgCookBridgeX = 40
  const imgCookBridgeY = currentY9
  const imgCookBridgeW = 260
  const imgCookBridgeH = 160
  if (imgDataCookBridge) {
    try {
      const format = imgDataCookBridge.startsWith('data:image/jpeg') || imgDataCookBridge.startsWith('data:image/jpg') ? 'JPEG' : 'PNG'
      doc.addImage(imgDataCookBridge, format as any, imgCookBridgeX, imgCookBridgeY, imgCookBridgeW, imgCookBridgeH)
    } catch (err) {
      doc.setDrawColor(180)
      doc.rect(imgCookBridgeX, imgCookBridgeY, imgCookBridgeW, imgCookBridgeH)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text('Falha ao carregar imagem. Use JPG/JPEG ou um PNG válido.', imgCookBridgeX + 8, imgCookBridgeY + 18)
    }
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text('Imagem não encontrada (adicione /public/cook-bridge.png ou .jpg)', imgCookBridgeX, imgCookBridgeY + 12)
  }
  currentY9 = imgCookBridgeY + imgCookBridgeH + 20

  // Passo a passo
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('PASSO A PASSO:', 40, currentY9)
  currentY9 += 20

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  
  // I. Posição inicial
  const posicaoCookBridge = 'I. Posição inicial: Em decúbito dorsal, posicionar um calcanhar abaixo ou levemente à frente do joelho. Realizar uma flexão de quadril com o membro inferior oposto, empurrando a "bolinha de liberação" contra a parede abdominal. Manter os dois tornozelos em dorsiflexão e os braços ao lado do corpo, com a palma das mãos voltadas para cima.'
  const posicaoCookBridgeLines = doc.splitTextToSize(posicaoCookBridge, 515)
  doc.text(posicaoCookBridgeLines, 40, currentY9)
  currentY9 += (posicaoCookBridgeLines.length * 12) + 8

  // II. Execução
  const execucaoCookBridge = 'II. Execução: Realizar o movimento de extensão de quadril, buscando o alinhamento entre as articulações de ombro, quadril e joelho, sem deixar a "bolinha de liberação" cair. Permanecer por pelo menos 10 segundos e, em seguida, retornar à posição inicial.'
  const execucaoCookBridgeLines = doc.splitTextToSize(execucaoCookBridge, 515)
  doc.text(execucaoCookBridgeLines, 40, currentY9)
  currentY9 += (execucaoCookBridgeLines.length * 12) + 8

  // III. Realizar teste
  const realizarCookBridge = 'III. Realizar o teste dos dois lados e avaliar possíveis assimetrias.'
  const realizarCookBridgeLines = doc.splitTextToSize(realizarCookBridge, 515)
  doc.text(realizarCookBridgeLines, 40, currentY9)
  currentY9 += (realizarCookBridgeLines.length * 12) + 25

  // Itens para avaliar
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('ITENS PARA AVALIAR:', 40, currentY9)
  currentY9 += 20

  const avaliacaoCookBridgeItems = [
    'Alinhamento das articulações de ombro, quadril e joelho',
    'Manutenção da estabilidade da pelve',
    'Presença de dominância sinergística (cãibra por utilização dominante da musculatura posterior de coxa - sinergista do movimento)',
    'Presença de dor'
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  avaliacaoCookBridgeItems.forEach((item) => {
    const itemLines = doc.splitTextToSize(item, 495)
    doc.rect(40, currentY9 - 10, 12, 12)
    doc.text(itemLines, 58, currentY9)
    currentY9 += (itemLines.length * 12) + 6
  })

  currentY9 += 10

  // Comentários e anotações
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Comentários e anotações relevantes:', 40, currentY9)
  
  const commentsStartY9 = currentY9 + 10
  for (let i = 0; i < 15; i++) {
    const lineY = commentsStartY9 + i * 18
    if (lineY > 780) break // Evita ultrapassar a página
    doc.setDrawColor(200)
    doc.line(40, lineY, 555, lineY)
  }

  // Página 10 — TESTE DE THOMAS
  doc.addPage('a4', 'portrait')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('TESTE DE THOMAS', 40, 40)

  // Objetivo
  let currentY10 = 70
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('OBJETIVO:', 40, currentY10)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const objetivoThomas = 'Avaliar a flexibilidade dos flexores de quadril uni e biarticulares do quadril (iliopsoas e quadríceps).'
  const objetivoThomasLines = doc.splitTextToSize(objetivoThomas, 515)
  doc.text(objetivoThomasLines, 40, currentY10 + 15)
  currentY10 += 15 + (objetivoThomasLines.length * 12) + 15

  // Inserir imagem teste de thomas
  const imgDataThomas = await loadImageAsDataURL('/teste-thomas.png') || await loadImageAsDataURL('/thomas.jpg') || await loadImageAsDataURL('/thomas.jpeg')
  const imgThomasX = 40
  const imgThomasY = currentY10
  const imgThomasW = 260
  const imgThomasH = 160
  if (imgDataThomas) {
    try {
      const format = imgDataThomas.startsWith('data:image/jpeg') || imgDataThomas.startsWith('data:image/jpg') ? 'JPEG' : 'PNG'
      doc.addImage(imgDataThomas, format as any, imgThomasX, imgThomasY, imgThomasW, imgThomasH)
    } catch (err) {
      doc.setDrawColor(180)
      doc.rect(imgThomasX, imgThomasY, imgThomasW, imgThomasH)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text('Falha ao carregar imagem. Use JPG/JPEG ou um PNG válido.', imgThomasX + 8, imgThomasY + 18)
    }
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text('Imagem não encontrada (adicione /public/thomas.png ou .jpg)', imgThomasX, imgThomasY + 12)
  }
  currentY10 = imgThomasY + imgThomasH + 20

  // Passo a passo
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('PASSO A PASSO:', 40, currentY10)
  currentY10 += 20

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  
  // I. Posição inicial
  const posicaoThomas = 'I. Posição inicial: Sentado na beira da maca (deixar 1/3 das coxas para fora da maca).'
  const posicaoThomasLines = doc.splitTextToSize(posicaoThomas, 515)
  doc.text(posicaoThomasLines, 40, currentY10)
  currentY10 += (posicaoThomasLines.length * 12) + 8

  // II. Execução
  const execucaoThomas = 'II. Execução: Abraçar uma das pernas e deitar-se em decúbito dorsal.'
  const execucaoThomasLines = doc.splitTextToSize(execucaoThomas, 515)
  doc.text(execucaoThomasLines, 40, currentY10)
  currentY10 += (execucaoThomasLines.length * 12) + 8

  // III. Realizar teste
  const realizarThomas = 'III. Realizar o teste dos dois lados e avaliar possíveis assimetrias.'
  const realizarThomasLines = doc.splitTextToSize(realizarThomas, 515)
  doc.text(realizarThomasLines, 40, currentY10)
  currentY10 += (realizarThomasLines.length * 12) + 25

  // Itens para avaliar
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('ITENS PARA AVALIAR:', 40, currentY10)
  currentY10 += 20

  const avaliacaoThomasItems = [
    'Articulação do joelho livre próximo a 90° de flexão (relação com quadríceps)',
    'Face posterior da coxa livre em contato com a maca (relação com iliopsoas)',
    'Presença de dor'
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  avaliacaoThomasItems.forEach((item) => {
    const itemLines = doc.splitTextToSize(item, 495)
    doc.rect(40, currentY10 - 10, 12, 12)
    doc.text(itemLines, 58, currentY10)
    currentY10 += (itemLines.length * 12) + 6
  })

  currentY10 += 10

  // Comentários e anotações
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Comentários e anotações relevantes:', 40, currentY10)
  
  const commentsStartY10 = currentY10 + 10
  for (let i = 0; i < 15; i++) {
    const lineY = commentsStartY10 + i * 18
    if (lineY > 780) break // Evita ultrapassar a página
    doc.setDrawColor(200)
    doc.line(40, lineY, 555, lineY)
  }

  // Página 11 — HIP HINGE
  doc.addPage('a4', 'portrait')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('HIP HINGE', 40, 40)

  // Objetivo
  let currentY11 = 70
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('OBJETIVO:', 40, currentY11)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const objetivoHipHinge = 'Avaliar a capacidade do aluno/paciente em manter a coluna lombar estável enquanto se movimenta a partir do quadril dentro de um padrão de dominância de quadril (stiff/levantamento terra).'
  const objetivoHipHingeLines = doc.splitTextToSize(objetivoHipHinge, 515)
  doc.text(objetivoHipHingeLines, 40, currentY11 + 15)
  currentY11 += 15 + (objetivoHipHingeLines.length * 12) + 15

  // Inserir imagem hip hinge
  const imgDataHipHinge = await loadImageAsDataURL('/hip-hinge.png') || await loadImageAsDataURL('/hip-hinge.jpg') || await loadImageAsDataURL('/hip-hinge.jpeg')
  const imgHipHingeX = 40
  const imgHipHingeY = currentY11
  const imgHipHingeW = 260
  const imgHipHingeH = 160
  if (imgDataHipHinge) {
    try {
      const format = imgDataHipHinge.startsWith('data:image/jpeg') || imgDataHipHinge.startsWith('data:image/jpg') ? 'JPEG' : 'PNG'
      doc.addImage(imgDataHipHinge, format as any, imgHipHingeX, imgHipHingeY, imgHipHingeW, imgHipHingeH)
    } catch (err) {
      doc.setDrawColor(180)
      doc.rect(imgHipHingeX, imgHipHingeY, imgHipHingeW, imgHipHingeH)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text('Falha ao carregar imagem. Use JPG/JPEG ou um PNG válido.', imgHipHingeX + 8, imgHipHingeY + 18)
    }
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text('Imagem não encontrada (adicione /public/hip-hinge.png ou .jpg)', imgHipHingeX, imgHipHingeY + 12)
  }
  currentY11 = imgHipHingeY + imgHipHingeH + 20

  // Passo a passo
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('PASSO A PASSO:', 40, currentY11)
  currentY11 += 20

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  
  // I. Posição inicial
  const posicaoHipHinge = 'I. Posição inicial: Em pé, com um bastão nas costas em contato com três pontos: cabeça, torácica e sacro.'
  const posicaoHipHingeLines = doc.splitTextToSize(posicaoHipHinge, 515)
  doc.text(posicaoHipHingeLines, 40, currentY11)
  currentY11 += (posicaoHipHingeLines.length * 12) + 8

  // II. Execução
  const execucaoHipHinge = 'II. Execução: O avaliado deve realizar o movimento de hip hinge (dominância de quadril).'
  const execucaoHipHingeLines = doc.splitTextToSize(execucaoHipHinge, 515)
  doc.text(execucaoHipHingeLines, 40, currentY11)
  currentY11 += (execucaoHipHingeLines.length * 12) + 25

  // Itens para avaliar
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('ITENS PARA AVALIAR:', 40, currentY11)
  currentY11 += 20

  const avaliacaoHipHingeItems = [
    'Amplitude de movimento',
    'Dissociação quadril/lombar (manutenção das curvaturas fisiológicas)',
    'Dominância de joelho x dominância de quadril',
    'Presença de dor'
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  avaliacaoHipHingeItems.forEach((item) => {
    const itemLines = doc.splitTextToSize(item, 495)
    doc.rect(40, currentY11 - 10, 12, 12)
    doc.text(itemLines, 58, currentY11)
    currentY11 += (itemLines.length * 12) + 6
  })

  currentY11 += 10

  // Comentários e anotações
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Comentários e anotações relevantes:', 40, currentY11)
  
  const commentsStartY11 = currentY11 + 10
  for (let i = 0; i < 15; i++) {
    const lineY = commentsStartY11 + i * 18
    if (lineY > 780) break // Evita ultrapassar a página
    doc.setDrawColor(200)
    doc.line(40, lineY, 555, lineY)
  }

  // Página 12 — FLEXIBILIDADE DOS ISQUIOTIBIAIS
  doc.addPage('a4', 'portrait')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('FLEXIBILIDADE DOS ISQUIOTIBIAIS', 40, 40)

  // Objetivo
  let currentY12 = 70
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('OBJETIVO:', 40, currentY12)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const objetivoIsquio = 'Avaliar a flexibilidade dos isquiotibiais e o potencial de lesão nesse grupo muscular.'
  const objetivoIsquioLines = doc.splitTextToSize(objetivoIsquio, 515)
  doc.text(objetivoIsquioLines, 40, currentY12 + 15)
  currentY12 += 15 + (objetivoIsquioLines.length * 12) + 15

  // Inserir imagem isquiotibiais
  const imgDataIsquio = await loadImageAsDataURL('/isquiotibiais.png') || await loadImageAsDataURL('/isquiotibiais.jpg') || await loadImageAsDataURL('/isquiotibiais.jpeg')
  const imgIsquioX = 40
  const imgIsquioY = currentY12
  const imgIsquioW = 260
  const imgIsquioH = 160
  if (imgDataIsquio) {
    try {
      const format = imgDataIsquio.startsWith('data:image/jpeg') || imgDataIsquio.startsWith('data:image/jpg') ? 'JPEG' : 'PNG'
      doc.addImage(imgDataIsquio, format as any, imgIsquioX, imgIsquioY, imgIsquioW, imgIsquioH)
    } catch (err) {
      doc.setDrawColor(180)
      doc.rect(imgIsquioX, imgIsquioY, imgIsquioW, imgIsquioH)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text('Falha ao carregar imagem. Use JPG/JPEG ou um PNG válido.', imgIsquioX + 8, imgIsquioY + 18)
    }
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text('Imagem não encontrada (adicione /public/isquiotibiais.png ou .jpg)', imgIsquioX, imgIsquioY + 12)
  }
  currentY12 = imgIsquioY + imgIsquioH + 20

  // Passo a passo
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('PASSO A PASSO:', 40, currentY12)
  currentY12 += 20

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  
  // I. Posição inicial
  const posicaoIsquio = 'I. Posição inicial: Deitado em decúbito dorsal, com um quadril flexionado a 90°.'
  const posicaoIsquioLines = doc.splitTextToSize(posicaoIsquio, 515)
  doc.text(posicaoIsquioLines, 40, currentY12)
  currentY12 += (posicaoIsquioLines.length * 12) + 8

  // II. Execução
  const execucaoIsquio = 'II. Execução: De forma passiva, o avaliador deve realizar a extensão do joelho até sentir restrição tecidual.'
  const execucaoIsquioLines = doc.splitTextToSize(execucaoIsquio, 515)
  doc.text(execucaoIsquioLines, 40, currentY12)
  currentY12 += (execucaoIsquioLines.length * 12) + 8

  // III. Mensurar
  const mensurarIsquio = 'III. Mensurar o ângulo de extensão do joelho utilizando um inclinômetro (calibrar na horizontal), o qual deve estar posicionado abaixo da tuberosidade anterior da tíbia. Orienta-se coletar três medidas e utilizar a média das mesmas.'
  const mensurarIsquioLines = doc.splitTextToSize(mensurarIsquio, 515)
  doc.text(mensurarIsquioLines, 40, currentY12)
  currentY12 += (mensurarIsquioLines.length * 12) + 8

  // IV. Realizar teste
  const realizarIsquio = 'IV. Realizar o teste dos dois lados e avaliar possíveis assimetrias.'
  const realizarIsquioLines = doc.splitTextToSize(realizarIsquio, 515)
  doc.text(realizarIsquioLines, 40, currentY12)
  currentY12 += (realizarIsquioLines.length * 12) + 25

  // Itens para avaliar
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('ITENS PARA AVALIAR:', 40, currentY12)
  currentY12 += 20

  const avaliacaoIsquioItems = [
    'ADM de extensão do joelho (deve ser > 150°; quando < 130° e/ou assimetria > 10°, indica maior potencial de lesão)',
    'Presença de dor'
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  avaliacaoIsquioItems.forEach((item) => {
    const itemLines = doc.splitTextToSize(item, 495)
    doc.rect(40, currentY12 - 10, 12, 12)
    doc.text(itemLines, 58, currentY12)
    currentY12 += (itemLines.length * 12) + 6
  })

  currentY12 += 10

  // Comentários e anotações
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Comentários e anotações relevantes:', 40, currentY12)
  
  const commentsStartY12 = currentY12 + 10
  for (let i = 0; i < 15; i++) {
    const lineY = commentsStartY12 + i * 18
    if (lineY > 780) break // Evita ultrapassar a página
    doc.setDrawColor(200)
    doc.line(40, lineY, 555, lineY)
  }

  const fileName = `ficha_avaliacao_${(ficha.nome || 'paciente').replace(/\s+/g, '_')}.pdf`
  doc.save(fileName)
}
