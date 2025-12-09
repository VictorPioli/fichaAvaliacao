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

  const fileName = `ficha_avaliacao_${(ficha.nome || 'paciente').replace(/\s+/g, '_')}.pdf`
  doc.save(fileName)
}
