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

  const fileName = `ficha_avaliacao_${(ficha.nome || 'paciente').replace(/\s+/g, '_')}.pdf`
  doc.save(fileName)
}
